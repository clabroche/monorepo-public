const { execSync } = require('child_process')

let activeIndex
module.exports.switchSinks = () => {
  const allSinks = execSync('pactl list sinks', {encoding: 'utf-8'})
    .trim()
    .split('\n\n')
    .map(section => {
      const lines = section.split('\n')
      return {
        name: lines.find(line => line.includes('Nom'))?.trim()?.split(' ')?.pop(),
        description: lines.find(line => line.includes('Description'))?.trim()?.split(':')?.pop()?.trim(),
        port: lines.find(line => line.includes('Destination'))?.trim()?.split('#')?.pop()?.trim(),
        status: lines.find(line => line.includes('État'))?.trim()?.split(':')?.pop()?.trim(),
        audio: lines.slice(lines.findIndex(line => line.includes('Ports')) + 1).reduce((lines, line, i) => {
          if (line.includes('\t\t')&& i === lines.length) lines.push(line)
          return lines
        }, (/**@type {string[]}*/([]))).map(audio => ({
          id: audio.trim().split(':')[0],
          name: audio.trim().split(':')[1].trim().split(' ')[0],
          type: audio.trim().split('type:')[1].trim().split(',')[0],
        }))
      }
    })
    .reduce((sinks, sink) => {
      sink.audio.forEach(audio => {
        sinks.push({...sink, audio})
      })
      return sinks
    }, /**@type {any[]}*/([]))
  const amplifi = allSinks.find(sink => sink.description.includes('AMPLIFi Stéréo analogique'))
  const headphones = allSinks.find(sink => sink.audio.type === 'Casque audio')
  const speaker = allSinks.find(sink => sink.audio.type === 'Haut-parleur')
  const sinks = [amplifi, headphones, speaker].filter(a => a)
  activeIndex = activeIndex !== undefined
    ? activeIndex + 1
    : sinks.findIndex(s => s?.status === 'RUNNING') || 0
  const newSink = sinks[activeIndex % sinks.length]
  console.log("Change to", newSink.description, newSink.audio.type)
  execSync(`pacmd set-default-sink ${newSink?.port}`)
  execSync(`pacmd set-sink-port ${newSink?.port} "${newSink.audio.id}"`)
  console.log('if sink not changes, edit "sudo nano /etc/pulse/default.pa", and update a line by "load-module module-stream-restore restore_device=false"')
}