const {execSync} = require("child_process");
const { debounce } = require("debounce");
const { existsSync } = require("fs");
const CustomObservable = require("./helpers/CustomObservable");
var InputEvent = require('input-event');

const receiverString = execSync("cat /proc/bus/input/devices  | grep -P '^[NH]: ' |paste - - | grep 'Logitech USB Receiver Keyboard' || echo ''", { encoding: 'utf-8' })
const usb = '/dev/input/by-id/usb-Logitech_G915_WIRELESS_RGB_MECHANICAL_GAMING_KEYBOARD_6112C714-event-kbd'

const onChange = new CustomObservable()
let nbEventsFiles = '0'
setInterval(() => {
  detectChange()
}, 100);

function detectChange() {
  const newNbEventsFiles = execSync('ls -l /dev/input/ | wc -l', { encoding: 'utf-8' })
  if (newNbEventsFiles !== nbEventsFiles) {
    onChange.next()
    nbEventsFiles = newNbEventsFiles
  }
}


module.exports = function init({ onkeypress = (...any) => { }, onRemote = (...any) => { }, onUSB = (...any) => {}}) {
  let input
  onChange.subscribe(debounce(() => {
    if (input) input.close()
    const connected = existsSync(usb)
    const event = receiverString.split('event')[1]?.split(' ')[0]?.trim()
    const lightspeed = `/dev/input/event${event}`
    // @ts-ignore
    input = new InputEvent(connected ? usb : lightspeed);
    console.log(connected ? usb : lightspeed)
    // @ts-ignore
    var keyboard = new InputEvent.Keyboard(input);
    keyboard.on('keypress', ({ code }) => {
      onkeypress({code, connected, usb, event, lightspeed})
    });
    if(connected) {
      onUSB({connected, usb, event, lightspeed})
    } else {
      onRemote({connected, usb, lightspeed})
    }
  }, 1000))

}