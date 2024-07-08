// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Sam Blenny
//
// WebSerialDisplay: A virtual CircuitPython display over Web Serial
//
// Related Docs:
// - https://developer.chrome.com/docs/capabilities/serial
// - https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API
// - https://developer.mozilla.org/en-US/docs/Web/API/SerialPort
//
"use strict";

const STATUS = document.querySelector('#status');   // Status span
const SER_BTN = document.querySelector('#serial');  // Start Serial button
const CANVAS = document.querySelector('#canvas');   // Canvas

const CTX = CANVAS.getContext("2d", {willReadFrequently: true});

// UI Controls
const SIZE = document.querySelector('#size');  // Frame size (px per side)
const BPP = document.querySelector('#bpp');    // Bits per pixel

// Serial Port
var PORT = null;

// Update status line span
function setStatus(s) {
    STATUS.textContent = s;
}

// Exapand pixel values from the luma array into the RGBA array as grayscale
function expandIntoRGBA(luma, rgba) {
    // luma is Uint8ClampedArray using 1 byte per pixel
    // rgba is Uing8ClampedArray using 4 bytes per pixel
    let i = 0;
    for (const Y of luma) {
        rgba[i] = Y;
        rgba[i+1] = Y;
        rgba[i+2] = Y;
        rgba[i+3] = 255;
        i += 4;
    }
}

// Process video frames
function handleNewFrame(now, metadata) {
    // Set canvas size
    const w = Number(SIZE.value);
    const h = w;
    CANVAS.width = w;
    CANVAS.height = h;
    // TODO: decode web serial frame into luma array
    // TODO: Draw luma values back to canvas as RGBA pixels
    //expandIntoRGBA(luma, rgba);
    //CTX.putImageData(imageData, 0, 0);
}

// Disconnect serial port and stop updating the canvas
async function disconnect(status) {
    if (PORT) {
        await PORT.forget();
        PORT = null;
    }
    SER_BTN.classList.remove('on');
    SER_BTN.textContent = 'Connect';
    setStatus(status ? status : 'disconnected');
}

// Attempt to start virtual display with data feed over Web Serial
function connect() {
    if (!('serial' in navigator)) {
        setStatus('Browser does not support Web Serial');
        alert('This browser does not support Web Serial');
        return;
    }
    // Define a filter for Adafruit's USB vendor ID (works for Pi Pico)
    const circuitpyFilter = [{usbVendorId: 0x239a}];
    // Request access to serial port (trigger a browser permission prompt)
    navigator.serial
    .requestPort({filters: circuitpyFilter})
    .then(async (response) => {
        PORT = await response;
        PORT.ondisconnect = async (event) => {
            await event.target.close();
            disconnect('serial device unplugged');
        };
        await PORT.open({baudRate: 115200});
        // Update HTML button
        SER_BTN.classList.add('on');
        SER_BTN.textContent = 'disconnect';
        // Update status line
        setStatus('connected');
        // ========================================================
        // TODO: begin polling serial port for frame buffer updates
        // ========================================================
    })
    .catch((err) => {
        PORT = null;
        setStatus('no serial port selected');
    });
}

// Add on/off event handlers to the button
SER_BTN.addEventListener('click', function() {
    if(SER_BTN.classList.contains('on')) {
        disconnect();
    } else {
        connect();
    }
});

setStatus("ready");
