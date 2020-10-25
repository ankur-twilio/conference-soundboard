$(document).ready(function () {
  let voiceDevice;
  let conferenceSid;
  let stream;

  //!!!!!Change the line below!!!!!
  const VOICE_TOKEN_URL = '<YOURFUNCTIONURL>/voice_token.js'; //Change This

  //!!!!!Change the line below!!!!!
  const BRAIN_FUNCTION_URL = '<YOURFUNCTIONURL>/brain.js'; //Change This

  /*----------  Start Helper Functions  ----------*/

  function getVoiceClientToken(callback) {
    $.getJSON(VOICE_TOKEN_URL)
    .then(function (data) {
      callback(data.token);
    });
  }

  function postSoundboardTask(sound, treat = null) {
    $.post(BRAIN_FUNCTION_URL, {
      sound: sound, 
      conference: conferenceSid
    })
    .then(function (data) {
      console.log(data);
      if (data.error) {
        alert(data.error);
      }
      if (data.conference) {
        conferenceSid = data.conference;
      }
    });
  }
  
  /*----------  End Helper Functions  ----------*/

  /*----------  Register Button Handlers  ----------*/
  
  $('.action-button').on('click', function() {

    // When one of the soundboard buttons is clicked, 
    // we simply make a request to our brain.js
    // function with the desired sound effect.

    let sound = $(this).data('sound-file');
    postSoundboardTask(sound);
    this.blur(); // Cosmetic
  });

  $('#button-call').on('click', function() {
    getVoiceClientToken(function(token) {
      voiceDevice = new Twilio.Device(token);
      voiceDevice.on("ready", function(device) {
        device.connect();
      });
      voiceDevice.on("connect", function(connection) {
        connection.mute(true); // No need to hear ourselves... later you could turn this into a voice modulator!!
        connection.on("volume", function() {
          if (stream == null) {
            stream = connection.getRemoteStream();
            visualize(stream);
          }
        }); // End on('volume')
      }); // End on('connect')
      $('#button-call').hide();
    }); // End getVoiceClientToken
  });
});

/**
 *
 * Audio Visualizer Code from https://codepen.io/nfj525/pen/rVBaab
 * This does not work on Safari. :(
 *
 */

const canvas = document.querySelector('.visualizer');
const canvasCtx = canvas.getContext("2d");
let audioCtx;

function visualize(stream) {
  if(!audioCtx) {
    audioCtx = new (window["AudioContext"] || window["webkitAudioContext"])();
  }
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  // analyser.connect(audioCtx.destination);

  draw()

  function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(255, 255, 255)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;


    for(let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();
  }
}