const audioUtils        = require('./audioUtils');  // for encoding audio data as PCM
const crypto            = require('crypto'); // tot sign our pre-signed URL
const v4                = require('./aws-signature-v4'); // to generate our pre-signed URL
const marshaller        = require("@aws-sdk/eventstream-marshaller"); // for converting binary event stream messages to and from JSON
const util_utf8_node    = require("@aws-sdk/util-utf8-node"); // utilities for encoding and decoding UTF8
const mic               = require('microphone-stream'); // collect microphone input as a stream of raw bytes
const iDevices          = require('./devices');
const hark              = require('./hark');


// our converter between binary event streams messages and JSON
const eventStreamMarshaller = new marshaller.EventStreamMarshaller(util_utf8_node.toUtf8, util_utf8_node.fromUtf8);

// our global variables for managing state
let languageCode;
let region;
let sampleRate;
let inputSampleRate;
let transcription = "";
let socket;
let micStream;
let socketError = false;
let transcribeException = false;
// check to see if the browser allows mic access
if (!window.navigator.mediaDevices.getUserMedia) {
    // Use our helper method to show an error on the page
    showError('We support the latest versions of Chrome, Firefox, Safari, and Edge. Update your browser and try your request again.');
    showNotification('error', 'Error', 'We support the latest versions of Chrome, Firefox, Safari, and Edge. Update your browser and try your request again.', true);
    stopPrompter();
    // maintain enabled/distabled state for the start and stop buttons
    toggleStartStop();
}

function openSocket () {
    $('#error').hide(); // hide any existing errors
    toggleStartStop(true); // disable start and enable stop button

    // set the language and region from the dropdowns
    setLanguage();
    setRegion();


    const audioInputSelect = document.querySelector('select#audioSource');
    const audioSource = audioInputSelect.value;
    //const videoSource = videoSelect.value;
    console.log('audio Input device ID : ', audioSource);
    const constraints = {
        audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
        //video: {deviceId: videoSource ? {exact: videoSource} : undefined}
    };

    // first we get the microphone input from the browser (as a promise)...
    window.navigator.mediaDevices.getUserMedia(constraints)
        // ...then we convert the mic stream to binary event stream messages when the promise resolves 
        .then(streamAudioToWebSocket) 
        .catch(function (error) {
            showError('There was an error streaming your audio to Amazon Transcribe. Please try again.');
            showNotification('error', 'Error', 'There was an error streaming your audio to Amazon Transcribe. Please try again.', true);
            toggleStartStop();
            stopPrompter();
        });
}

let streamAudioToWebSocket = function (userMediaStream) {
    //let's get the mic input from the browser, via the microphone-stream module
    micStream = new mic();

    micStream.on("format", function(data) {
        inputSampleRate = data.sampleRate;
    });   

    micStream.setStream(userMediaStream);

    var speechEvents = hark.hark(userMediaStream, {});
    speechEvents.on('speaking', function() {
        if(active) {
            startProgressBar();
        }
    });

    speechEvents.on('stopped_speaking', function() {
      console.log('stopped_speaking...........');
    });

    // Pre-signed URLs are a way to authenticate a request (or WebSocket connection, in this case)
    // via Query Parameters. Learn more: https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
    let url = createPresignedUrl();

    //open up our WebSocket connection
    try {
        socket = new WebSocket(url);
    } catch (error) {
        showNotification('error', 'Web Socket Error', 'Check your connection and try again.', true);
        stopPrompter();
    }
    socket.binaryType = "arraybuffer";

    let sampleRate = 0;

    // when we get audio data from the mic, send it to the WebSocket if possible
    socket.onopen = function() {

        showNotification('success', 'Turned On', 'Teleprompter is turned on', true);
        turnOnPrompter();
        micStream.on('data', function(rawAudioChunk) {

            // the audio stream is raw audio bytes. Transcribe expects PCM with additional metadata, encoded as binary
            let binary = convertAudioToBinaryMessage(rawAudioChunk);

            if (socket.readyState === socket.OPEN) {
                socket.send(binary);
            }
        }
    )};

    // handle messages, errors, and close events
    wireSocketEvents();
}

function setLanguage() {
    languageCode =  "en-US"; // $('#language').find(':selected').val();
    if (languageCode == "en-US" || languageCode == "es-US")
        sampleRate = 44100;
    else
        sampleRate = 8000;
}

function setRegion() {
    region = "us-east-1"; // $('#region').find(':selected').val();
}

function wireSocketEvents() {
    // handle inbound messages from Amazon Transcribe
    socket.onmessage = function (message) {
        //convert the binary event stream message to JSON
        let messageWrapper = eventStreamMarshaller.unmarshall(Buffer(message.data));
        let messageBody = JSON.parse(String.fromCharCode.apply(String, messageWrapper.body));
        if (messageWrapper.headers[":message-type"].value === "event") {
            handleEventStreamMessage(messageBody);
        }
        else {
            transcribeException = true;
            showError(messageBody.Message);
            showNotification('error', 'Server Error', messageBody.Message, true);
            stopPrompter();
            toggleStartStop();
        }
    };

    socket.onerror = function () {
        socketError = true;
        showError('WebSocket connection error. Try again.');
        showNotification('error', 'Server Error', 'WebSocket connection error. Try again.', true);
        stopPrompter();
        toggleStartStop();
    };
    
    socket.onclose = function (closeEvent) {
        micStream.stop();
        
        // the close event immediately follows the error event; only handle one.
        if (!socketError && !transcribeException) {
            if (closeEvent.code != 1000) {
                showError('</i><strong>Streaming Exception</strong><br>' + closeEvent.reason);
                showNotification('error', 'Streaming Exception', closeEvent.reason, true);
                stopPrompter();
            }
            toggleStartStop();
        }
    };
}

let handleEventStreamMessage = function (messageJson) {
    let results = messageJson.Transcript.Results;
    
    if (results.length > 0) {
        if (results[0].Alternatives.length > 0) {
            compareString(results);        
        }
    }
}

let closeSocket = function () {
    if (socket.readyState === socket.OPEN) {
        micStream.stop();

        showNotification('error', 'Stop', 'Teleprompter has stoped', true);
        stopPrompter();
        progressBar = false;
        // Send an empty frame so that Transcribe initiates a closure of the WebSocket after submitting all transcripts
        let emptyMessage = getAudioEventMessage(Buffer.from(new Buffer([])));
        let emptyBuffer = eventStreamMarshaller.marshall(emptyMessage);
        socket.send(emptyBuffer);
    }
}


$('#turnOn-button').click(function () {
    openSocket();
});
$('#stop-button').click(function () {
    closeSocket();
    toggleStartStop();
});


function toggleStartStop(disableStart = false) {
    $('#turnOn-button').prop('disabled', disableStart);
    $('#stop-button').attr("disabled", !disableStart);
}

function showError(message) {
    $('#error').html('<i class="fa fa-times-circle"></i> ' + message);
    $('#error').show();
}

function convertAudioToBinaryMessage(audioChunk) {
    let raw = mic.toRaw(audioChunk);

    if (raw == null)
        return;

    // downsample and convert the raw audio bytes to PCM
    let downsampledBuffer = audioUtils.downsampleBuffer(raw, inputSampleRate, sampleRate);
    let pcmEncodedBuffer = audioUtils.pcmEncode(downsampledBuffer);

    // add the right JSON headers and structure to the message
    let audioEventMessage = getAudioEventMessage(Buffer.from(pcmEncodedBuffer));

    //convert the JSON object + headers into a binary event stream message
    let binary = eventStreamMarshaller.marshall(audioEventMessage);

    return binary;
}

function getAudioEventMessage(buffer) {
    // wrap the audio data in a JSON envelope
    return {
        headers: {
            ':message-type': {
                type: 'string',
                value: 'event'
            },
            ':event-type': {
                type: 'string',
                value: 'AudioEvent'
            }
        },
        body: buffer
    };
}

function createPresignedUrl() {
    let endpoint = "transcribestreaming." + region + ".amazonaws.com:8443";

    // get a preauthenticated URL that we can use to establish our WebSocket
    return v4.createPresignedURL(
        'GET',
        endpoint,
        '/stream-transcription-websocket',
        'transcribe',
        crypto.createHash('sha256').update('', 'utf8').digest('hex'), {
            'key': 'AKIA4CUFB3XXREPBN3J6', // $('#access_id').val(),
            'secret': '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', // $('#secret_key').val(),
            'sessionToken': $('#session_token').val(),
            'protocol': 'wss',
            'expires': 300,
            'region': region,
            'query': "language-code=" + languageCode + "&media-encoding=pcm&sample-rate=" + sampleRate
        }
    );
}
