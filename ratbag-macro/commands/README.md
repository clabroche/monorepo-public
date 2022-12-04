# Macro for my G915

## Warning
THIS PACKAGE RESET SOME IMPORTANT XF86 KEYS FOR GNOME. OTHER DESKTOP ENVIRONMENT ARE NOT TESTED.

## What

This package reset and upload some key to my G915 to have advanced macro on my computer with g1,g2,g3,g4,g5 keys and m1,m2,m3 prodiles
It uploads lights for each profile too.
These package is compatible with usb and lightspeed dongle. It witch automaticaly

## System dependencies
 - manipulate strings: cat, grep, paste, wc, sleep
 - manipulate gnome: gsettings
 - upload to keyboard: ratbagctl
 - manipulate windows: xdotool, wmctrl, xprop
 - spotify
 - systemctl


## USAGE

```npm run start``` for production
```npm run serve``` for dev

Pass --upload to force upload of keys to keyboard

## Configuration

Edit ```src/conf.js```

We have three fields:
 - commands: keys are compose from ```M<0-3>-G<0-4>```. You can set a function
 - gsettings: it remap some gsettings keys after wipe (e.g: ```['volume-down-quiet', XF86.AudioLowerVolume.key]``` it set volume-down from system to the corresponding keycode that will be send by keyboard)  
 - profiles: all infos here will be uploaded to keyboard. For each profiles upload led lignting and keycodes for each ```G<0-7>```(```G<5-7>``` are the ```M<1-3>``` buttons)