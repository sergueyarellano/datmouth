const r = String.raw

export const ART = [
  {
    names: ['tableflip', 'flip', 'rage', 'angry'],
    color: 'redBright',
    fps: 4,
    loops: 1,
    frames: [
      r`(°-°)  ┬─┬`,
      r`(°□°)  ┬─┬`,
      r`(╯°□°)╯ ┬─┬`,
      r`(╯°□°)╯︵ ┻━┻`,
      r`(╯°□°)╯︵ ┻━┻  ︵`,
      r`(╯°□°)╯       ︵ ┻━┻`
    ]
  },
  {
    names: ['unflip', 'calm', 'sorry'],
    color: 'greenBright',
    fps: 3,
    loops: 1,
    frames: [
      r`┻━┻  (°-°)`,
      r`┻━┻ ノ(°-°)`,
      r`┬─┬ ノ( ゜-゜ノ)`,
      r`┬─┬ ノ( ^-^ノ)`
    ]
  },
  {
    names: ['shrug', 'idk', 'whatever'],
    color: 'yellow',
    fps: 3,
    loops: 2,
    frames: [
      r`  _(ツ)_  `,
      r`¯\_(ツ)_/¯`
    ]
  },
  {
    names: ['wave', 'hi', 'hello', 'bye'],
    color: 'cyanBright',
    fps: 5,
    loops: 3,
    frames: [
      r`(・ω・)ノ`,
      r`(・ω・)ノ"`,
      r`(・ω・)/"`,
      r`(・ω・)ノ"`
    ]
  },
  {
    names: ['dance', 'party', 'groove'],
    color: 'magentaBright',
    fps: 5,
    loops: 3,
    frames: [
      r`♪ ┏(・o・)┛ ♪`,
      r`♪ ┗(・o・)┓ ♪`,
      r`♫ ┏(・o・)┛ ♫`,
      r`♫ ┗(・o・)┓ ♫`
    ]
  },
  {
    names: ['boom', 'explode', 'mindblown', 'bomb'],
    color: 'redBright',
    fps: 6,
    loops: 1,
    frames: [
      [
        '',
        '',
        '     o~',
        '',
        ''
      ].join('\n'),
      [
        '',
        '',
        '     *',
        '',
        ''
      ].join('\n'),
      [
        '',
        '    \\|/',
        '   --*--',
        '    /|\\',
        ''
      ].join('\n'),
      [
        '  .  \\ | /  .',
        '   \\ .\\|/. /',
        ' -- BOOM!! --',
        '   / \'/|\\\' \\',
        '  \'  / | \\  \''
      ].join('\n')
    ]
  },
  {
    names: ['heart', 'love', 'thanks', '<3'],
    color: 'red',
    fps: 4,
    loops: 3,
    frames: [
      [
        '',
        '   .d8b.d8b.',
        '   `Y88888Y\'',
        '     `Y8Y\'',
        '       \''
      ].join('\n'),
      [
        '  ,d88b.d88b,',
        '  88888888888',
        '  `Y8888888Y\'',
        '    `Y888Y\'',
        '      `Y\''
      ].join('\n')
    ]
  },
  {
    names: ['coffee', 'brb', 'break'],
    color: 'yellowBright',
    fps: 3,
    loops: 3,
    frames: [
      [
        '    (  )',
        '     )  (',
        '   ........',
        '   |      |]',
        '   \\      /',
        '    `----\''
      ].join('\n'),
      [
        '     )  (',
        '    (  )',
        '   ........',
        '   |      |]',
        '   \\      /',
        '    `----\''
      ].join('\n')
    ]
  },
  {
    names: ['rocket', 'ship', 'launch', 'deploy'],
    color: 'whiteBright',
    fps: 5,
    loops: 1,
    frames: [
      ['', '', '', '    /\\', '   |  |', '   |__|', '  /_||_\\', ''].join('\n'),
      ['', '', '    /\\', '   |  |', '   |__|', '  /_||_\\', '    ||', ''].join('\n'),
      ['', '    /\\', '   |  |', '   |__|', '  /_||_\\', '    ||', '   (  )', ''].join('\n'),
      ['    /\\', '   |  |', '   |__|', '  /_||_\\', '    ||', '   (  )', '  ( ** )', ''].join('\n'),
      ['   |__|', '  /_||_\\', '    ||', '   (  )', '  ( ** )', ' (  **  )', '', ''].join('\n'),
      ['    ||', '   (  )', '  ( ** )', ' (  **  )', '', '', '', ''].join('\n'),
      ['', '', '', '  . * .', '', '  to the', '  moon!', ''].join('\n')
    ]
  },
  {
    names: ['fire', 'lit', 'hot'],
    color: 'redBright',
    fps: 6,
    loops: 4,
    frames: [
      ['    (  .', '   )  ( )', '  (  ) ) (', ' ( ( (  ) )', '  \\~~~~~~/'].join('\n'),
      ['     . )', '   (  ) (', '  ) (  ( )', ' ( ) ) ( (', '  \\~~~~~~/'].join('\n'),
      ['    ) .', '   ( )  )', '  ( )( ) (', ' ) ( (  ) )', '  \\~~~~~~/'].join('\n')
    ]
  },
  {
    names: ['cat', 'meow', 'kitty'],
    color: 'whiteBright',
    fps: 3,
    loops: 2,
    frames: [
      [' /\\_/\\', '( o.o )', ' > ^ <'].join('\n'),
      [' /\\_/\\', '( -.- )', ' > ^ <'].join('\n'),
      [' /\\_/\\', '( o.o )', ' > ^ <  meow'].join('\n')
    ]
  },
  {
    names: ['ok', 'yes', 'thumbsup', '+1', 'nice'],
    color: 'greenBright',
    fps: 4,
    loops: 2,
    frames: [
      ['', '     _', '    ( (', '   _\\ \\___', '  (___)   )', '  (___)__.\''].join('\n'),
      ['     _', '    ( (', '   _\\ \\___', '  (___)   )', '  (___)   )', '  (___)__.\''].join('\n')
    ]
  },
  {
    names: ['sad', 'cry', 'rain', 'nope'],
    color: 'blueBright',
    fps: 4,
    loops: 3,
    frames: [
      ['  .\'  .  \'.', ' \'  .  \'  .', '   (T_T)'].join('\n'),
      ['  \' .  \'  .', ' .  \'  .  \'', '   (T_T)'].join('\n')
    ]
  },
  {
    names: ['facepalm', 'ugh', 'omg'],
    color: 'yellow',
    fps: 3,
    loops: 1,
    frames: [
      r`(°_°)`,
      r`(°_°)ノ`,
      r`(ノ_<。)`,
      r`(－‸ლ)`
    ]
  },
  {
    names: ['highfive', 'five', 'yay', 'tada'],
    color: 'magentaBright',
    fps: 4,
    loops: 1,
    frames: [
      r`(・_・)ノ        ヽ(・_・)`,
      r`  (・_・)ノ    ヽ(・_・)`,
      r`    (・_・)ノヽ(・_・)`,
      r`    (^_^)ノ*ヽ(^_^)  ✨`
    ]
  }
]

const byName = new Map()
for (const art of ART) for (const name of art.names) byName.set(name, art)

export function findArt (query = '') {
  const q = query.trim().toLowerCase()
  if (!q) return null
  if (q === 'random') return ART[Math.floor(Math.random() * ART.length)]
  return byName.get(q) || ART.find(a => a.names.some(n => n.startsWith(q))) || null
}

export function getArt (name) {
  return byName.get(name) || null
}

export function listArt () {
  return ART.map(a => a.names[0])
}

export function normalizeFrames (frames) {
  const split = frames.map(f => f.split('\n'))
  const height = Math.max(...split.map(l => l.length))
  return split.map(lines => lines.concat(Array(height - lines.length).fill('')).join('\n'))
}
