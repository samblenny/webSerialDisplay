# SPDX-License-Identifier: MIT
# SPDX-FileCopyrightText: Copyright 2024 Sam Blenny
#
# WebSerialDisplay: A virtual CircuitPython display over Web Serial
#
# Related Docs and Code:
# - https://learn.adafruit.com/adafruit-picowbell-camera-breakout
# - https://docs.circuitpython.org/projects/ov5640/en/latest/
# - https://github.com/adafruit/Adafruit_CircuitPython_OV5640/blob/main/adafruit_ov5640/__init__.py
# - https://docs.circuitpython.org/en/latest/docs/library/binascii.html
#
from binascii import b2a_base64
from board import (
    GP0, GP2, GP3, GP4, GP5, GP6, GP7, GP8, GP9, GP10,
    GP11, GP12, GP13, GP18, GP19, GP22,
)
from busio import I2C
from digitalio import DigitalInOut
from gc import collect, mem_free
from sys import stdout
from time import sleep

import adafruit_bus_device
from adafruit_ov5640 import (
    OV5640, OV5640_SIZE_96X96, OV5640_SIZE_240X240, OV5640_COLOR_GRAYSCALE
)

def gcCol():
    # Collect garbage and print free memory
    collect()
    print("mem_free", mem_free())

def send(buf):
    # Encode the frame buffer (buf) as base64 and send it over the serial port.
    # CAUTION: This assumes len(buf) is evenly divisible by 96, which is
    # true for 96x96 and 240x240 frames.
    # Performance Notes: Caching function references as local vars is a
    # MicroPython speedup trick that avoids repeated dictionary lookups. Also,
    # using sys.stdout.write() here is *way* faster than using print().
    wr = stdout.write
    b64 = b2a_base64
    wr(b'-----BEGIN FRAME-----\n')
    stride = 96
    for i in range(0, len(buf), stride):
        wr(b64(buf[i:i+stride]))
    wr("-----END FRAME-----\n")

def main():
    # Make a buffer to hold captured pixel data
    gcCol()
    size = 96
    buf = bytearray(size * size)
    # Configure the camera
    cam = OV5640(
        I2C(GP5, GP4),
        vsync=GP0,
        href=GP2,
        clock=GP3,
        data_pins=(GP6, GP7, GP8, GP9, GP10, GP11, GP12, GP13),
        mclk=None,
        size=(OV5640_SIZE_96X96 if (size==96) else OV5640_SIZE_240X240),
    )
    cam.flip_x = True
    cam.colorspace = OV5640_COLOR_GRAYSCALE
    gcCol()
    # Capture and send 1 camera frame approximately every 2 seconds
    while True:
        sleep(2)
        cam.capture(buf)
        send(buf)
        gcCol()

main()
