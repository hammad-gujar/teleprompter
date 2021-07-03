/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

'use strict';

/* globals MediaRecorder */

let mediaRecorder;
let recordedBlobs;
const supportedMimeType = 'video/webm\;codecs=vp9';
const codecPreferences = supportedMimeType; //document.querySelector('#codecPreferences');
let constraints;

const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');
const recordButton = document.querySelector('button#record');
recordButton.addEventListener('click', () => {
  if (recordButton.textContent === 'Start Recording') {
    init(constraints);
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
    playButton.disabled = false;
    downloadButton.disabled = false;
  }
});

const playButton = document.querySelector('button#play');
playButton.addEventListener('click', () => {
  const mimeType = supportedMimeType;
  const superBuffer = new Blob(recordedBlobs, {type: mimeType});
  recordedVideo.src = null;
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = true;
  recordedVideo.play();
  saveTelepropmterState(getTranistionState('Play'));
});

const downloadButton = document.querySelector('button#download');
downloadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {type: 'video/webm'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = currentTimeStamp()+'.webm';
  document.body.appendChild(a);
  a.click();
  saveTelepropmterState(getTranistionState('Download'));
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});

function handleDataAvailable(event) {
  console.log('handleDataAvailable', event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}


function startRecording() {
  recordedBlobs = [];
  const mimeType = supportedMimeType;
  const options = {mimeType};

  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  saveTelepropmterState(getTranistionState('Start Recording'));
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop Recording';
  playButton.disabled = true;
  downloadButton.disabled = true;
  //codecPreferences.disabled = true;
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  saveTelepropmterState(getTranistionState('Stop Recording'));
}

function handleSuccess(stream) {
  recordButton.disabled = false;
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;

  const recorded = document.querySelector('video#recorded');
  recorded.srcObject = stream;
  
  saveTelepropmterState(getTranistionState('Start Camera'));
}

async function init(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  }
}

document.querySelector('button#start').addEventListener('click', async () => {
  document.querySelector('button#start').disabled = true;
  
  const videoInputSelect = document.querySelector('select#videoSource');
  var videoSource = videoInputSelect.value;
  const audioInputSelect = document.querySelector('select#audioSource');
  var audioSource = audioInputSelect.value;
    
  var configs = JSON.parse(localStorage.getItem('teleprompter') || '[]');    
  if(configs !== null) {
      var microphoneIndex = getPrefrencesIndex(configs, 'microphone');
      if( microphoneIndex !== -1 ) {
          var micValue = configs[microphoneIndex].value;
          audioSource = micValue;
      }
      var cameraIndex = getPrefrencesIndex(configs, 'camera');
      if( cameraIndex !== -1 ) {
        var cameraValue = configs[cameraIndex].value;
        videoSource = cameraValue;
      }
  }

  const hasEchoCancellation = true;
  
  constraints = {
    audio: {
      deviceId: audioSource ? {exact: audioSource} : undefined,
      echoCancellation: {exact: hasEchoCancellation}
    },
    
    video: {
      width: 170, height: 120,
      deviceId: videoSource ? {exact: videoSource} : undefined
    }
};
  await init(constraints);
});