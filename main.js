/*
 The MIT License (MIT)

 Copyright (c) 2017 Rahul Rajeev

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the 'Software'), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
let audioContext = null;
let meter = null;
let canvasContext = null;
let mediaStreamSource = null;
let rafID = null;

let width = 1000;
let height = 200;

window.onload = function () {
    // grab our canvas
    canvasContext = document.getElementById('meter').getContext('2d');

    // update canvas size
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();

    // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    // grab an audio context
    audioContext = new AudioContext();

    // Attempt to get audio input
    try {
        // monkeypatch getUserMedia
        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        // ask for an audio input
        navigator.getUserMedia(
            {
                'audio': {
                    'mandatory': {
                        'googEchoCancellation': 'false',
                        'googAutoGainControl': 'false',
                        'googNoiseSuppression': 'false',
                        'googHighpassFilter': 'false'
                    },
                    'optional': []
                },
            }, gotStream, didntGetStream);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
};


function resizeCanvas() {
    canvas = document.getElementById("meter");

    width = document.body.clientWidth;
    height = document.body.clientHeight;

    canvas.width = width;
    canvas.height = height;
}

function didntGetStream() {
    alert('Stream generation failed.');
}

function drawLoop(time) {
    // clear the background
    canvasContext.clearRect(0, 0, width, height);

    // check if we're currently clipping
    canvasContext.fillStyle = meter.checkClipping() ? 'red' : 'green'

    // draw a bar based on the current volume
    canvasContext.fillRect(0, 0, meter.volume * width * 2, height);

    // set up the next visual callback
    rafID = window.requestAnimationFrame(drawLoop);
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);

    // kick off the visual updating
    drawLoop();
}
