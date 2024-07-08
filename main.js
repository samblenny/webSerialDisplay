/* SPDX-License-Identifier: MIT */
/* SPDX-FileCopyrightText: Copyright 2024 Sam Blenny */
"use strict";

const STATUS = document.querySelector('#status');   // Status span
const SER_BTN = document.querySelector('#serial');  // Start Serial button
const CANVAS = document.querySelector('#canvas');   // Canvas

const CTX = CANVAS.getContext("2d", {willReadFrequently: true});

// UI Controls
const SIZE = document.querySelector('#size');  // Frame size (px per side)
const BPP = document.querySelector('#bpp');    // Bits per pixel

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

// Attempt to start virtual display with data feed over Web Serial
function startDisplay() {
    // TODO: Web Serial startup stuff goes here
    if (true) {
        // Update HTML button
        SER_BTN.classList.add('on');
        SER_BTN.textContent = 'pause';
        // Update status line
        setStatus("connected");
        // TODO register canvas updater event handler
    }
}

// Event handler to pause playback
function pauseDisplay() {
    SER_BTN.classList.remove('on');
    SER_BTN.textContent = 'Start Serial';
    setStatus("paused");
}

// Add on/off event handlers to the button
SER_BTN.addEventListener('click', function() {
    if(SER_BTN.classList.contains('on')) {
        // Was on, so turn it off
        pauseDisplay();
    } else {
        // Was off, so attempt to turn it on
        startDisplay();
    }
});

setStatus("ready");
