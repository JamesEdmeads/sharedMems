
/*********************************************
**        Audio recording and upload        **
*********************************************/

// recording of audio uses library written by matt diamond
// available at: https://github.com/mattdiamond/Recorderjs
// below function adapted from this library

//initial set up for pages that record audio
function setUpAudio() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      audio_context = new AudioContext;
    } catch (e) {
      alert('No web audio support in this browser!');
    }
    
    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
      console.log('No live audio input: ' + e);
    });

}

//starts recording or stops depending on boolean held in story.js file 
function recordStart() {

  if(recording === false){
    recording = true;
    if(!sound.paused) sound.pause();
    startRecording();
  } else {
    recording = false;
    stopRecording();
  }

}

//seperate for view.js as no sound playing
function recordStart1() {
  if(recording === false) {
    recording = true;
    startRecording();
  } else {
    recording = false;
    stopRecording();
  }
}

function startUserMedia(stream) {
  var input = audio_context.createMediaStreamSource(stream);   
  recorder = new Recorder(input);
}

function startRecording() {
  recorder && recorder.record();
}

//stops the recording
function stopRecording() {
  recorder && recorder.stop();
  processBlob();
  recorder.clear();
}

//processes blob file and send to send function in view.js
//or story.js to be uploaded
function processBlob() { 
  recorder && recorder.exportWAV(function(blob) {
    send(blob);
  });
}


