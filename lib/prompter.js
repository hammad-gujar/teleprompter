// to store the text of teleprompter and pointers of the string
var scriptText = '';
var scriptArray = [];
var scriptLength = 0;
var windowSize = 5;
var currentIndex;
var preCurrentIndex;
var windowNumber;
var windowStartIndex;
var windowCurrentIndex;
var preWindowStartIndex;
var preWindowCurrentIndex;
var windowEndIndex;
var algo;
var fontSize = 50;
var textColor = 'black';
var pause = false;
var stop = true;
var active = false;
var turnedOn = false;
var pauseTimeoutFunction;
var pauseTimerIsOn;
var boldStatus = false;
var prompterWidth = 70;
var transcriberWord;
var highliteWindowSize;
var startCommand = '';
var pauseCommand = '';
var resumeCommand = '';
var progressBar;
var progressBarWidth;
var progressBarIntervalFunc;
var jumpTimerIsOn;
var jumpTimeoutFunction;
var jump;
var subStringsArray = [];
var stringWindowSize = 5;
// const videoElement = document.querySelector('video');
const audioInputSelect = document.querySelector('select#audioSource');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [audioInputSelect, videoSelect];
var stateTransitions = [];
var startedSpeaking = false;
var highliteMiddleSize;
var pauseCorrectionLimit;
var pauseCorrectionCount;
var pauseIndexat;
var autoPause = false;
var autoPauseTime = 15000;
var scrollSpeed = 500;
var correctionCountClearFunction;
var correctionCountClearTimeIsOn;
var sentenceSkip = true;

initPointers();
(function() {
    var sampleText = 'Teleprompter is widely used device in telecommunication sector. It helps the broadcasters to realize the perception of eye-contact with viewers. A traditional teleprompter, based on glass plates which reflect the script to speaker while the camera behind these plates cannot record the script scrolling on the glass plates. Speakers look right into the lens of camera which create the illusion that speaker memorized the text.';
    document.getElementById('script').value = sampleText;
    scriptText = document.getElementById('script').value;
    $("#draggable").draggable({
        containment: "window"
    });
    $("#recorded").draggable({
        containment: "window"
    });
    $("#responseSection").draggable({
        containment: "window"
    });
})();

saveScript(true);
addHighliteClass();
checkInputDevicesOnLoad();
loadSavedPrefrences();
highliteMiddle(true);


function initPointers() {    
    currentIndex = preCurrentIndex = 0;
    windowNumber = 0;
    windowStartIndex = preWindowStartIndex = 0;
    windowCurrentIndex = preWindowCurrentIndex = 0;
    windowEndIndex = 0;
    algo = 'JaroDistance';
    pauseTimerIsOn = false;
    jump = false;
    jumpTimerIsOn = false;
    highliteWindowSize = 10;
    progressBar = 0;
    progressBarWidth = 0;
    highliteMiddleSize = 6;
    pauseCorrectionLimit = 5;
    pauseCorrectionCount = 0;
    pauseIndexat = 0;
    correctionCountClearTimeIsOn = false;
}


function startProgressBar() {
    if(!startedSpeaking) {
        saveTelepropmterState(getTranistionState('Start Speaking'));
        startedSpeaking = true;
    }
    changeProgessBarStatus('Detecting...');
    if (progressBar == 0) {
        progressBar = 1;
        var elem = document.getElementById("progressBar");
        progressBarIntervalFunc = setInterval(frame, 100);

        function frame() {
            if (progressBarWidth >= 100) {
                clearInterval(progressBarIntervalFunc);
                progressBar = 0;
            } else {
                progressBarWidth++;
                elem.style.width = progressBarWidth + "%";
            }
        }
    }
}

function finishProgressBar() {
    progressBarWidth = 99;
    progressBar = 0;
    changeProgessBarStatus('');
}

function generateStatesTable() {    
    var statesTableDiv = document.getElementById("statesTable");
    statesTableDiv.innerHTML = '';

    var tbl  = document.createElement('table');
    tbl.style.width  = '100%';
    
    stateTransitions.forEach((state, index) => {
        var tr = tbl.insertRow();
        
        var td = tr.insertCell();
        td.appendChild(document.createTextNode(index+1));
        td.style.border = '1px solid black';

        for (var key in state) {
            if (state.hasOwnProperty(key)) {
                var td = tr.insertCell();
                td.appendChild(document.createTextNode(state[key]));
                td.style.border = '1px solid black';
                if(key === 'stateDisplay') {
                    td.style.width = '70%';
                }
            }
        }
    });
    statesTableDiv.appendChild(tbl);
}

function openStatesModal() {
    var modal = document.getElementById("statesModal");

    generateStatesTable();

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function resetProgressBar(msg) {
    progressBarWidth = 0;
    progressBar = 0;
    var elem = document.getElementById("progressBar");
    elem.style.width = '0%';
    clearInterval(progressBarIntervalFunc);
    changeProgessBarStatus(msg);
}

function changeProgessBarStatus(msg) {
    var elem = document.getElementById("progressBar");
    elem.innerHTML = msg;
}

function loadSavedPrefrences() {
    var configs = JSON.parse(localStorage.getItem('teleprompter') || '[]');
    if (configs !== null) {
        configs.forEach((config, index) => {
            if (config.type === 'fontFamily') {
                setDropDownSelectValue('textFont', config.value);
                changeTextFont('textFont');
            } else if (config.type === 'color') {
                setDropDownSelectValue('textColor', config.value);
                setTextColor(config.value);
            } else if (config.type === 'highlightColor') {
                setDropDownSelectValue('higlightedTextColor', config.value);
                setHiglightedTextColor(config.value);
            } else if (config.type === 'highlightColorMiddle') {
                setDropDownSelectValue('higlightedTextMiddleColor', config.value);
                setHiglightedTextMiddleColor(config.value);
            }   else if (config.type === 'backgroundColor') {
                setDropDownSelectValue('backgroundColor', config.value);
                setBackgroundColor(config.value);
            } else if (config.type === 'width') {
                setWidth(config.value);
                prompterWidth = config.value;
            } else if (config.type === 'fontSize') {
                setFontSize(config.value);
                fontSize = config.value;
            } else if (config.type === 'startCommand') {
                startCommand = config.value;
                loadVoiceCommands('startCommand', startCommand);
            } else if (config.type === 'resumeCommand') {
                resumeCommand = config.value;
                loadVoiceCommands('resumeCommand', resumeCommand);
            } else if (config.type === 'pauseCommand') {
                pauseCommand = config.value;
                loadVoiceCommands('pauseCommand', pauseCommand);
            } else if (config.type === 'scrollSpeed') {
                scrollSpeed = config.value;
                document.getElementById('scrollSpeed').value = scrollSpeed/100;
            } else if (config.type === 'autoPause') {
                autoPause = config.value;
                document.getElementById('autoPause').checked = autoPause;
                if(autoPause) {
                    document.getElementById('autoPauseTimeEl').style.display = 'block';
                }                
            } else if (config.type === 'autoPauseTime') {
                autoPauseTime = config.value;
                document.getElementById('autoPauseTime').value = autoPauseTime/1000;                
            } else if (config.type === 'sentenceSkip') {
                sentenceSkip = config.value;
                document.getElementById('sentenceSkip').checked = sentenceSkip;             
            } 
        })
    }
}

function checkInputDevicesOnLoad() {
    var configs = JSON.parse(localStorage.getItem('teleprompter') || '[]');
    var indexMic = getPrefrencesIndex(configs, 'microphone');
    var indexCamera = getPrefrencesIndex(configs, 'camera');
    console.log(indexMic, indexCamera);
    if (indexMic === -1 || indexCamera === -1) {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);            
            openModal("micModal");
        }).catch(err => {
            console.log("u got an error:" + err)
        });
    } else {
        navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
    }
}

function gotDevices(deviceInfos) {
    // Handles being called several times to update labels. Preserve values.
    const values = selectors.map(select => select.value);
    var configs = JSON.parse(localStorage.getItem('teleprompter'));
    selectors.forEach(select => {
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
    });

    for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
            loadSelectedInputDevice(configs, 'microphone', option, deviceInfo);
            audioInputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
            loadSelectedInputDevice(configs, 'camera', option, deviceInfo);
            videoSelect.appendChild(option);
        }
    }
    selectors.forEach((select, selectorIndex) => {
        if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
            select.value = values[selectorIndex];
        }
    });
}

function loadSelectedInputDevice(configs, device, option, deviceInfo) {
    if (configs !== null) {
        var index = getPrefrencesIndex(configs, device);
        if (index !== -1) {
            var value = configs[index].value;
            if (value == deviceInfo.deviceId) {
                option.selected = true;
            }
        }
    }
}

function handleError(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

function saveInputDevicesPrefrences(modalName) {
    const audioInputSelect = document.querySelector('select#audioSource');
    const audioSource = audioInputSelect.value;
    saveToLocalStorage('microphone', audioSource);

    const videoInputSelect = document.querySelector('select#videoSource');
    const videoSource = videoInputSelect.value;
    saveToLocalStorage('camera', videoSource);
    closeModal(modalName);
}

function closeModal(modalName) {
    var modal = document.getElementById(modalName);
    modal.style.display = "none";
}

function loadVoiceCommands(action, command) {
    document.getElementById(action).value = command;
}

function saveVoiceCommands() {
    startCommand = document.getElementById('startCommand').value;
    saveToLocalStorage('startCommand', startCommand);

    resumeCommand = document.getElementById('resumeCommand').value;
    saveToLocalStorage('resumeCommand', resumeCommand);

    pauseCommand = document.getElementById('pauseCommand').value;
    saveToLocalStorage('pauseCommand', pauseCommand);
}

function openModal(modalName) {
console.log('opennn : ', modalName);
    var modal = document.getElementById(modalName);

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function getPrefrencesIndex(object, value) {
    if (object == null) {
        return null;
    }
    return object.map(function(item) {
        return item.type;
    }).indexOf(value);
}

function deletePrefrence(object, removeIndex) {
    object.splice(removeIndex, 1);
}

function videoItemPosition(position) {
    var els = document.getElementsByClassName('videoItem');
    for (i = 0; i < els.length; i++) {
        els[i].style.float = position;
    }
}

function saveToLocalStorage(type, value) {
    var configs = JSON.parse(localStorage.getItem('teleprompter') || '[]');

    var index = getPrefrencesIndex(configs, type);
    if (index != -1) {
        deletePrefrence(configs, index);
    }
    configs.push({
        type: type,
        value: value
    });
    localStorage.setItem('teleprompter', JSON.stringify(configs));
}

function getDropDownSelectcValue(ddId) {
    return document.getElementById(ddId).value;
}

function setDropDownSelectValue(ddId, value) {
    let element = document.getElementById(ddId);
    element.value = value;
}

function changeFontSize(action) {
    if (action == 'plus') {
        fontSize++;
    } else {
        fontSize--;
    }
    setFontSize(fontSize);
    saveToLocalStorage('fontSize', fontSize);
}

function setFontSize(fontSize) {
    document.getElementById('scriptTextContainer').style.fontSize = fontSize + 'px';
}

function changeWidth(action) {

    if (prompterWidth == 100 && action == 'plus') {
        return;
    }
    if (action == 'plus') {
        prompterWidth++;
    } else {
        prompterWidth--;
    }
    setWidth(prompterWidth);
    saveToLocalStorage('width', prompterWidth);
}

function setWidth(prompterWidth) {
    document.getElementById('centered').style.width = prompterWidth + '%';
}

function changeTextFont(ddId) {
    var font = getDropDownSelectcValue(ddId);
    saveToLocalStorage('fontFamily', font);
    if (font == 'default') {
        font = "BlinkMacSystemFont,-apple-system,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',Helvetica,Arial,sans-serif";
    }
    document.getElementById('scriptTextContainer').style.fontFamily = font;
}

function handleAutoPause() {
    autoPause = false;
    if(document.getElementById('autoPause').checked)
    {
        autoPause = true;
    }

    if(autoPause) {
        document.getElementById('autoPauseTimeEl').style.display = 'block';
    } else {        
        document.getElementById('autoPauseTimeEl').style.display = 'none';
    }
    saveToLocalStorage('autoPause', autoPause);
}

function enableSentenceSkip() {
    sentenceSkip = false;
    if( document.getElementById('sentenceSkip').checked ) 
    {
        sentenceSkip = true;
    }

    saveToLocalStorage('sentenceSkip', sentenceSkip);
}

function isValidPauseTime() {
    var time = parseInt(document.getElementById('autoPauseTime').value);
    if (!Number.isInteger(time)) {    
        time = 15;
        alert('Pause time is not valid. Please enter integer value');
    }
    document.getElementById('autoPauseTime').value = time;
    autoPauseTime = time * 1000;
    saveToLocalStorage('autoPauseTime', autoPauseTime);
}

function isValidScrollSpeed() {
    var speed = parseInt(document.getElementById('scrollSpeed').value);
    if (!Number.isInteger(speed)) {        
        speed = 5;
        alert('Scroll Speed is not valid. Please enter integer value');
    }
    document.getElementById('scrollSpeed').value = speed;
    scrollSpeed = speed * 100;
    saveToLocalStorage('scrollSpeed', scrollSpeed);
}

function changeTextColor(ddId) {
    var color = getDropDownSelectcValue(ddId);
    setTextColor(color);
    saveToLocalStorage('color', color);
}

function changeHiglightedTextColor(ddId) {
    var color = getDropDownSelectcValue(ddId);
    setHiglightedTextColor(color);
    saveToLocalStorage('highlightColor', color);
}

function changeHiglightedTextMiddleColor(ddId) {
    var color = getDropDownSelectcValue(ddId);
    setHiglightedTextMiddleColor(color);
    saveToLocalStorage('highlightColorMiddle', color);
}

function setHiglightedTextMiddleColor(color) {
    var elems = document.querySelectorAll(".highliteMiddle");
    [].forEach.call(elems, function(target) {
        target.style.color = color;
    });
}

function setHiglightedTextColor(color) {
    var elems = document.querySelectorAll(".highlite");
    [].forEach.call(elems, function(target) {
        target.style.color = color;
    });
}

function setTextColor(color) {
    textColor = color;
    document.getElementById('scriptTextContainer').style.color = color;    
    document.getElementById("response").style.color = textColor;
}

function changeTextBackgroudColor(ddId) {
    var color = getDropDownSelectcValue(ddId);
    setBackgroundColor(color);
    saveToLocalStorage('backgroundColor', color);
}

function setBackgroundColor(color) {
    document.getElementById('scriptTextContainer').style.backgroundColor = color;
    document.body.style.background = color;
}

function currentTimeStamp() {
    var today  = new Date();
    return today.toLocaleTimeString();
}

function showResponse(res) {
    document.getElementById("response").textContent = currentTimeStamp() + ' | ' + res;
    document.getElementById("response").style.color = textColor;
}

function updateStatusMessage(msg, color) {
    document.getElementById("statusMessage").textContent = msg;
    document.getElementById("statusMessage").style.color = color;
    document.getElementById("statusMessage").style.fontWeight = 'normal';
}
function clearStateTransitions() {
    stateTransitions = [];
    document.getElementById('statesTable').innerHTML = '';
}

function getTranistionState(stateName) {
    switch(stateName) {
        case 'Start Speaking':
           return {stateName: 'Start Speaking', stateDisplay: 'User Started Speaking'};
        case 'Turn On Mic':
           return {stateName: 'Turn On Mic', stateDisplay: 'Turn On Mic of Teleprompter'};
        
        case 'Pause':
        return {stateName:'Pause', stateDisplay:'Pause Teleprompter'};
        
        case 'Turn Off Mic':
            return {stateName:'Turn Off Mic', stateDisplay:'Turn off Mic of Teleprompter'};
        
        case 'Save Script':
            return {stateName:'Save Script', stateDisplay: 'Saving the Text'};

        case 'Clear Script':
            return {stateName:'Clear Script', stateDisplay:'Clear Prompter Text'};
        case 'Reset Prompter':
            return {stateName:'Reset Prompter', stateDisplay:'Reset Teleprompter'};
                       
        case 'Start':
            return {stateName: 'Start', stateDisplay: 'Start Teleprompter'};
        case 'Resume':
            return {stateName: 'Resume', stateDisplay: 'Resume Teleprompter'};
                       
        case 'Start Camera':
            return {stateName: 'Start Camra', stateDisplay: 'Turned On Camera'};
        case 'Start Recording':
            return {stateName: 'Start Recording', stateDisplay: 'Started Video Recording'};
        case 'Stop Recording':
            return {stateName: 'Stop Recording', stateDisplay: 'Stopped Video Recording'};
        case 'Play':
            return {stateName: 'Play', stateDisplay: 'Played Recorded Video'};
        case 'Download':
            return {stateName: 'Download', stateDisplay: 'Downloaded Recorded Video'};
        
            
      }
}

function saveTelepropmterState(state) {
    state.time = currentTimeStamp();
    stateTransitions.push(state);
    console.log('stateTra : ', stateTransitions);
}

function setPrompterStatus(status) {
    if (status == 'turnedOn') {
        stop = false;
        active = false;
        pause = false;
        turnedOn = true;
        updateStatusMessage('Turned On', '#118e09');
        changeProgessBarStatus('On');
        saveTelepropmterState(getTranistionState('Turn On Mic'));
    }

    if (status == 'active') {
        stop = false;
        active = true;
        pause = false;
        turnedOn = false;
        updateStatusMessage('Listening', '#118e09');
        //pauseTimerInit();
        changeProgessBarStatus('Listening...');
    }

    if (status == 'pause') {
        stop = false;
        active = false;
        pause = true;
        turnedOn = false;
        updateStatusMessage('Paused', '#eff309');
        resetProgressBar('Paused...');
        saveTelepropmterState(getTranistionState('Pause'));
    }


    if (status == 'stop') {
        stop = true;
        active = false;
        pause = false;
        turnedOn = false;
        updateStatusMessage('Stopped', '#d82121');
        resetProgressBar('Off');
        clearPauseStatus();
        saveTelepropmterState(getTranistionState('Turn Off Mic'));
    }
    var els = document.getElementsByClassName('draggable');
    for (i = 0; i < els.length; i++) {
        if (status == 'active') {
            els[i].style.borderBottom = 'thick solid #118e09';
        } else if (status == 'stop') {
            els[i].style.borderBottom = 'thick solid #d82121';
        } else if (status == 'pause') {
            els[i].style.borderBottom = 'thick solid #eff309';
        }
    }

}

/*
    * saveScript
    * function display entred text of teleprompter into a paragraph 
    * for find finding similaritie for further steps
    */
function saveScript(onInit = false) {
    scriptText = document.getElementById('script').value;
    if (scriptText == '') {
        alert('Please enter the text first.');
        return;
    }
    scriptArray = [];
    subStringsArray = [];

    var scriptTextContainer = document.getElementById('scriptTextContainer');
    var scriptParagraphs = scriptText.split("\n");
    var script = '';
    var wordNumber = 0;
    var stringCounter = 0;
    var stringWordCounter = 1;
    var arrayString = '';
    scriptParagraphs.forEach((paragraph, paragraphIndex) => {
        stringsArray = paragraph.split('. ');
        var paragraphText = '<p>';
        if (stringsArray.length == 1 && stringsArray[0] == "") {
            paragraphText += '<br>';
        } else {
            stringsArray.forEach((string, stringIndex) => {
                wordArray = string.split(' ');
                arrayString = '';
                wordArray.forEach((word, wordIndex) => {
                    if (word != '') {
                        var cleanedText = cleanText(word) + wordNumber;
                        paragraphText += '<span onclick="adjustWindow(' + wordNumber + ')" wordIndex = ' + wordNumber + ' stringIndex = ' + stringCounter + ' class="items" id = ' + cleanedText + '>' + word;

                        if (wordArray.length - 1 == wordIndex) {
                            paragraphText += '.</span> ';
                        } else {
                            paragraphText += '</span> ';
                        }
                        scriptArray.push(word);
                        wordNumber++;
                        arrayString += cleanText(word) + ' ';

                    }
                });
                subStringsArray.push(arrayString.substring(0, arrayString.length - 1));
                stringCounter++;
            });
        }
        paragraphText += '</p>';
        script += paragraphText;
    });
    scriptTextContainer.innerHTML = script;
    scriptLength = scriptArray.length;
    if (scriptLength < windowSize) {
        windowSize = scriptLength;
    }
console.log(subStringsArray);
    addHoverStyle();
    addHighliteClass();
    highliteMiddle(true);
    reset(true);
    if(!onInit) {
        saveTelepropmterState(getTranistionState('Save Script'));
    }
}

function addHoverStyle() {
    var elems = document.querySelectorAll(".items");
    [].forEach.call(elems, function(target) {
        target.addEventListener("mouseover", mOver, false);
        target.addEventListener("mouseout", mOut, false);
    });

}

function mOver(event) {
    event.target.classList.add("effect-underline");
}

function mOut(event) {
    event.target.className = event.target.className.replace(/\beffect-underline\b/, "");
}

function clearPrompter() {
    var node = document.getElementById("scriptTextContainer");
    node.innerHTML = '';
    scriptText = '';
    scriptArray = {};
    scriptLength = 0;
    saveTelepropmterState(getTranistionState('Clear Script'));
}

function reset(onInit = false) {
    if (active) {
        pausePrompter();
    }
    initPointers();
    removeSpokenClass();
    removeHighliteClass();
    removeMiddleHiglite();
    addHighliteClass();
    highliteMiddle(true);
    if (!onInit) {
        saveTelepropmterState( getTranistionState('Reset Prompter'));
    }
}

//Preprocessing of strings before comparison
function cleanText(str) {
    return str.replace(/[^a-zA-Z ]/g, "").toLowerCase();
}

function getTranscrriberResponse(results) {
    const items = results[0].Alternatives[0].Items;
    const wordsArray = items.filter(el => {
        return el.Type === 'pronunciation';
    });
    var word = wordsArray[wordsArray.length - 1].Content;

    var responseString = '';
    if (wordsArray[wordsArray.length - 1].Confidence) {
        wordsArray.forEach((stringWord, index) => {
            responseString += cleanText(stringWord.Content) + ' ';
        });
        responseString = responseString.substring(0, responseString.length - 1);
    }
    return {
        'word': word,
        'responseString': responseString
    };
}

function getTranscrriberString(results) {
    let transcript = '';
    transcript = results[0].Alternatives[0].Transcript;

    // fix encoding for accented characters
    transcript = decodeURIComponent(escape(transcript));

    // if this transcript segment is final, add it to the overall transcription
    if (!results[0].IsPartial) {
        transcription = '';
        transcription += transcript + "\n";
        return transcription;
    }
}

/*
    * compareWord
    * Compare string returned from trnascription service  
    * with telepromter text.
    */
function compareWord(results) {
    // if(scriptText == '') {
    //     alert('Save the script first.');
    //     return;
    // }


    transcriberResponse = getTranscrriberResponse(results);
    transcriberWord = cleanText(transcriberResponse.word);

    windowCurrentIndex = 0;
    windowStartIndex = currentIndex;

    // define new window of size k
    if (currentIndex == windowEndIndex) {
        windowEndIndex += windowSize;
    }
    if (calculateJaroDistance(cleanText(startCommand), transcriberWord) > 0.99 &&
        turnedOn) {
        startPrompter();
    }

    if (calculateJaroDistance(cleanText(pauseCommand), transcriberWord) > 0.99 &&
        active) {
        pausePrompter();
    }

    if (calculateJaroDistance(cleanText(resumeCommand), transcriberWord) > 0.99 &&
        pause) {
        resumePrompter();
    }

    // if (!active ) {
    //     return;
    // }

    console.log("............................. : ",sentenceSkip, transcriberWord, currentIndex, pauseIndexat, windowStartIndex, windowCurrentIndex, windowEndIndex);
    if (!jumpTimerIsOn) {
        jumpTimerInit();
        jumpTimerIsOn = true;
    }

    // if (jump && autoPauseTime >= 10000 && transcriberResponse.responseString) {
    if (jump && sentenceSkip && transcriberResponse.responseString) {
        //transcriberString = getTranscrriberString(results);
        //startWorker(transcriberResponse.responseString);
        console.log('jumppppppppp..........');
        jumpPromopterToSentence(transcriberResponse.responseString);
    }

    // Loop to match words and iterate over the selected window
    while (currentIndex < windowEndIndex &&
        currentIndex < scriptLength &&
        windowCurrentIndex < windowSize) {
        var scriptCurrentWord = cleanText(scriptArray[currentIndex]);

        if (algo == 'LevenshteinDistance') {
            if (calculateLevenshteinDistance(scriptCurrentWord, transcriberWord) <= 1) {
                movePointers();
                break;
            }
        } else if (algo == 'JaroDistance') {
            if (calculateJaroDistance(scriptCurrentWord, transcriberWord) > 0.96) {
                console.log(scriptCurrentWord);
                if (pauseTimerIsOn) {
                    clearTimeout(pauseTimeoutFunction);
                    pauseTimerIsOn = false;
                }

                if (jumpTimerIsOn) {
                    clearTimeout(jumpTimeoutFunction);
                    jumpTimerIsOn = false;
                    jump = false;
                }


                if(!pause && active) {
                    var el = document.getElementById("statusMessage");
                    (boldStatus) ? el.style.fontWeight = 'bold': el.style.fontWeight = 'normal';
                    boldStatus = !boldStatus;
                    finishProgressBar();
                    addSpokenClass(windowStartIndex, currentIndex);
                    scroll(scriptCurrentWord + currentIndex, scrollSpeed);
                    movePointers();
                    addHighliteClass();
                    highliteMiddle(false);
                    showResponse(scriptCurrentWord);
                    pauseIndexat = currentIndex;
                    // if (correctionCountClearTimeIsOn) {
                        clearTimeout(correctionCountClearFunction);
                    // }
                    
                } else {

                    if (!correctionCountClearTimeIsOn && pause || !active) {
                        console.log("clear corrrection count : ", pauseCorrectionCount);
                        correctionCountClearTimeInit();
                    }
                    pauseCorrectionCount++;
                    console.log("corrrection count : ", pauseCorrectionCount);
                    if(pauseCorrectionCount === pauseCorrectionLimit) {
                        console.log("indexxsessssssssssssss : ", currentIndex,windowStartIndex, windowCurrentIndex);
                        if (!active) {
                            startPrompter();
                        }
                        resumePrompter();
                        addSpokenClass(pauseIndexat, currentIndex);
                        addHighliteClass();
                        highliteMiddle(false);
                        clearTimeout(correctionCountClearFunction);
                        break;
                    }
                    movePointers();
                }
                
                break;
            }
        }
        // If word is not found at an index, move string pointer forward by 1
        // to compare it with next word in the specified window.
        currentIndex++;
    }

    if (autoPause && autoPauseTime != '' && !pauseTimerIsOn && active) {
        pauseTimerInit();
        pauseTimerIsOn = true;
    }

    // if a transcriber word is not found in whole window,
    // Move string pointer to the start of the window for comparison of next word of transcriber
    // from start of the window.
    if (currentIndex == windowEndIndex) {
        currentIndex = windowStartIndex;
    }
}

function movePointers() {

    // move the pointer of string and window by one word
    currentIndex++;
    windowCurrentIndex++;
    //to slide the window by one word
    if (windowEndIndex < scriptLength) {
        windowEndIndex = currentIndex + windowSize;
    }
    windowStartIndex = currentIndex;
}

function jumpTimerInit() {
    jumpTimerIsOn = true;
    jumpTimeoutFunction = setTimeout(function() {
        jumpPrompter();
    }, 1000);
}

function correctionCountClearTimeInit() {
    correctionCountClearTimeIsOn = true;
    correctionCountClearFunction = setTimeout(function() {
        pauseCorrectionCount = 0;
        correctionCountClearTimeIsOn = false;
        currentIndex = pauseIndexat;
        windowStartIndex = pauseIndexat;
        windowCurrentIndex = pauseIndexat;
        windowEndIndex = windowStartIndex - windowSize;
        if (windowEndIndex - windowStartIndex !== windowSize) {
            windowEndIndex = windowStartIndex + windowSize;
        }
        console.log("clearrrrrrrrrrrrrrrr: , ", currentIndex, windowEndIndex);
        clearTimeout(correctionCountClearFunction);
    }, 4000);
}

function jumpPrompter() {
    console.log('jumpppppppppp active');
    jump = true;
}

function getSubstring(string) {
    var wordsArray = string.split(" ");
    wordsArray.forEach((word, index) => {
        wordsArray[index] = cleanText(word);
    });
    // var subStrArray = wordsArray.slice(Math.max(wordsArray.length - stringSize, 1))
    // console.log('wordsArray', wordsArray, wordsArray.length, subStrArray);
    return wordsArray.join(" ");
}

function jumpPromopterToSentence(transcriberString) {
    console.log('................................................................. ', transcriberString);
    if (!transcriberString || currentIndex == scriptLength) {
        return;
    }
    var transcriberSubString = getSubstring(transcriberString);
    var distance = 0;
    var stringWordIndex;
    var stringWordId;
    var jumpToString;
    var stringsArrayLength = subStringsArray.length;
    var lastWord = document.querySelector('[wordIndex="' + currentIndex + '"]');
    var lastStringIndex = lastWord.getAttribute('stringIndex');
    var stringFound = false;
    console.log('lastStringIndex : ', lastWord, lastStringIndex, currentIndex);
    var nextStringNumber = parseInt(lastStringIndex) + 1;
    var stringWindowEndIndex = parseInt(nextStringNumber) + parseInt(stringWindowSize);
    if (stringWindowEndIndex > stringsArrayLength) {
        stringWindowEndIndex = stringsArrayLength;
    }
    if (nextStringNumber > stringsArrayLength) {
        nextStringNumber = stringsArrayLength;
    }
    console.log('next index : ', nextStringNumber, stringWindowEndIndex);
    while (nextStringNumber < stringWindowEndIndex &&
        nextStringNumber <= stringsArrayLength &&
        stringWindowEndIndex <= stringsArrayLength) {
        var newDistance = calculateJaroDistance(subStringsArray[nextStringNumber], transcriberSubString);

        console.log('newDistance : ', newDistance, nextStringNumber, subStringsArray[nextStringNumber]);
        if (newDistance > 0.75) {
            if (newDistance > distance) {
                distance = newDistance;
                var stringWords = document.querySelectorAll('[stringindex="' + nextStringNumber + '"]');
                console.log('stringWords : ', nextStringNumber, stringWords, stringWords.length - 1, stringWords[stringWords.length - 1]);
                stringWordIndex = parseInt(stringWords[stringWords.length - 1].getAttribute('wordIndex'));
                stringWordId = stringWords[stringWords.length - 1].getAttribute('id');
                console.log('founded string : ', stringWordIndex, stringWordId);
                stringFound = true;
                jumpToString = subStringsArray[nextStringNumber];
            }
        }
        nextStringNumber++;
    }
    
    if (stringFound) {

        console.log(jumpToString, ' ::: ', transcriberSubString, ' ::: ', newDistance);
        currentIndex = stringWordIndex;
        windowStartIndex = currentIndex;
        // windowEndIndex = currentIndex + windowSize;
        addSpokenClass(0, currentIndex);
        scroll(stringWordId, 2000);
        movePointers();
        pauseIndexat = currentIndex;
        removeHighliteClass();
        removeMiddleHiglite();
        addHighliteClass();
        highliteMiddle(false);
        jump = false;
        jumpTimerIsOn = false;
        clearTimeout(jumpTimeoutFunction);
        clearTimeout(pauseTimeoutFunction);
        clearTimeout(correctionCountClearFunction);
        pauseTimerIsOn = false;
        saveTelepropmterState({stateName: 'Sentences Jump', stateDisplay: 'User Skipped the Sentences and started from "'+jumpToString+'"'});
        if (pause && !active) {
            resumePrompter
        }
        if(!active && !pause) {
            startPrompter();
        }
        console.log('jumpppppppppp to: ', stringWordId, stringWordIndex);
    }
}

function highliteMiddle(onStart = false) {
    if(onStart) {
        var highliteMiddleStart = currentIndex;
    } else {
        var highliteMiddleStart = currentIndex + parseInt(highliteWindowSize/2, 10);
    }
    var configs = JSON.parse(localStorage.getItem('teleprompter') || '[]');
    var highliteMiddleEnd =  highliteMiddleStart + highliteMiddleSize;
    var i = highliteMiddleStart;
    while( i <= highliteMiddleEnd ) {   
        if(i >= scriptLength) {
            break;
        }

        
        var el = document.querySelector('[wordIndex="' + i + '"]');
        el.classList.add("highliteMiddle");  
        el.classList.remove("highlite");
        i++;
        
        if(configs !== null) {
            var highlightColor = getPrefrencesIndex(configs, 'highlightColorMiddle');
            if( highlightColor !== -1 ) {
                el.style.color = configs[highlightColor].value;
            } else {
                el.style.color = '##c7c20c';
            }
        } else {
            el.style.color = '##c7c20c';
        }
    }
}

function removeMiddleHiglite() {    
    var elems = document.querySelectorAll('.highliteMiddle');
    [].forEach.call(elems, function(el) {
        el.style.color = '';
        el.classList.remove("highliteMiddle");
    });
}

function addHighliteClass() {
    var highliteEnd = currentIndex + highliteWindowSize;
    var configs = JSON.parse(localStorage.getItem('teleprompter') || '[]');
    var i = windowStartIndex;
    while (i <= highliteEnd) {
        if(i >= scriptLength) {
            break;
        }
        var el = document.querySelector('[wordIndex="' + i + '"]');        
        el.classList.add("highlite");
        i++;
        if(configs !== null) {
            var highlightColor = getPrefrencesIndex(configs, 'highlightColor');
            if( highlightColor !== -1 ) {
                el.style.color = configs[highlightColor].value;
            } else {
                el.style.color = '#ff8d00';
            }
        } else {
            el.style.color = '#ff8d00';
        }
    }
}

function pauseTimerInit() {
    pauseTimerIsOn = true;
    pauseTimeoutFunction = setTimeout(function() {
        pausePrompter();
    }, autoPauseTime);
}

function turnOnPrompter() {
    setPrompterStatus('turnedOn');
    document.getElementById("start-button").disabled = false;
}

function startPrompter() {
    setPrompterStatus('active');
    // showNotification('success', 'Started', 'Teleprompter is listening', true);
    document.getElementById("start-button").disabled = true;
    document.getElementById("pause-button").disabled = false;
    saveTelepropmterState( getTranistionState('Start'));
    startedSpeaking = false;
}

function pausePrompter() {
    setPrompterStatus('pause');
    document.getElementById("resume-button").disabled = false;
    document.getElementById("pause-button").disabled = true;
    clearTimeout(pauseTimeoutFunction);
    clearTimeout(jumpTimeoutFunction);
    jump = false;
    jumpTimerIsOn = false;
    pauseIndexat = currentIndex;
    highliteMiddle(true);
    
}

function clearPauseStatus() {
    pause = false;
    pauseTimerIsOn = false;
    clearTimeout(pauseTimeoutFunction);
}

function resumePrompter() {
    setPrompterStatus('active');
    document.getElementById("pause-button").disabled = false;
    document.getElementById("resume-button").disabled = true;
    clearPauseStatus();
    saveTelepropmterState( getTranistionState('Resume'));
    startedSpeaking = false;
    pauseCorrectionCount = 0;
    correctionCountClearTimeIsOn = false;
}

function stopPrompter() {
    setPrompterStatus('stop');
    document.getElementById("start-button").disabled = true;
    document.getElementById("pause-button").disabled = true;
    document.getElementById("resume-button").disabled = true;
}

function adjustWindow(clickedItem) {
    currentIndex = clickedItem;
    windowStartIndex = clickedItem;
    windowEndIndex = clickedItem + windowSize;
    pauseIndexat = clickedItem;

    removeHighliteClass();
    removeMiddleHiglite();
    addHighliteClass();
    highliteMiddle(true)
    removeSpokenClass();
    addSpokenClass(0, clickedItem);
}

function addSpokenClass(windowStartFrom, curIndex) {
    var i = windowStartFrom;
    while (i <= curIndex) {
        var el = document.querySelector('[wordIndex="' + i + '"]');
        el.style.color = '';
        el.classList.add("spoken");
        el.classList.remove("highliteMiddle");
        el.classList.remove("highlite");
        
        i++;
    }
}

function removeSpokenClass() {
    var elems = document.querySelectorAll('.spoken');
    [].forEach.call(elems, function(el) {
        el.className = el.className.replace(/\bspoken\b/, "");
    });
}

function removeHighliteClass() {
    var elems = document.querySelectorAll('.highlite');
    [].forEach.call(elems, function(el) {
        el.style.color = '';
        el.classList.remove("highlite");
    });
}


function scroll(scriptCurrentWord, speed = 500) {
    var el = document.getElementById(scriptCurrentWord);
    $('body,html').animate({
        scrollTop: $(el).offset().top - 60
    }, speed);
}

function showNotification(status, title, text, autoClose) {
    new Notify({
        status: status,
        title: title,
        text: text,
        effect: 'fade',
        speed: 300,
        customClass: null,
        customIcon: null,
        showIcon: true,
        showCloseButton: true,
        autoclose: autoClose,
        autotimeout: 3000,
        gap: 20,
        distance: 20,
        type: 1,
        position: 'right top'
    });

}

function calculateLevenshteinDistance(a, b) {
    if (a.length == 0) return b.length;
    if (b.length == 0) return a.length;

    var matrix = [];

    // increment along the first column of each row
    var i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1)); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
}

function calculateJaroDistance(s1, s2) {
    var m = 0;

    // Exit early if either are empty.
    if (s1.length === 0 || s2.length === 0) {
        return 0;
    }

    // Exit early if they're an exact match.
    if (s1 === s2) {
        return 1;
    }

    var range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1,
        s1Matches = new Array(s1.length),
        s2Matches = new Array(s2.length);

    for (var i = 0; i < s1.length; i++) {
        var low = (i >= range) ? i - range : 0,
            high = (i + range <= s2.length) ? (i + range) : (s2.length - 1);

        for (var j = low; j <= high; j++) {
            if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
                ++m;
                s1Matches[i] = s2Matches[j] = true;
                break;
            }
        }
    }

    // Exit early if no matches were found.
    if (m === 0) {
        return 0;
    }

    // Count the transpositions.
    var k = 0;
    var n_trans = 0;

    for (var i = 0; i < s1.length; i++) {
        if (s1Matches[i] === true) {
            for (var j = k; j < s2.length; j++) {
                if (s2Matches[j] === true) {
                    k = j + 1;
                    break;
                }
            }

            if (s1[i] !== s2[j]) {
                ++n_trans;
            }
        }
    }

    var weight = (m / s1.length + m / s2.length + (m - (n_trans / 2)) / m) / 3,
        l = 0,
        p = 0.1;

    if (weight > 0.7) {
        while (s1[l] === s2[l] && l < 4) {
            ++l;
        }

        weight = weight + l * p * (1 - weight);
    }

    return weight;
}