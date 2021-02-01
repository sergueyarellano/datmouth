# datmouth

P2P chat client that uses DAT protocol underneath. For ephemeral conversations.

Have you lost your internet connection? 

Works with peers connected:
- offline, LAN
- WAN

Inspired by [DAT](https://dat.foundation/) foundation workshops and great packages in the community.

To experiment with kappa architectures check out [kappa-core](https://www.npmjs.com/package/kappa-core) deck, [hyperswarm](https://www.npmjs.com/package/hyperswarm), etc. Thanks to those folks implicated, having too much fun with this :)

# Install

```
$ npm install -g datmouth
```

# Usage

```
$ datmouth topicname
```

Will join the swarm automatically. You can share the topic with a friend and start chatting

> Your conversations and gifs are saved to a temp directory. Your system will remove them automatically at some point

![](datmouth.gif)

# Update the client

If you already have a `datmouth` client and want to update the version:

```
npm -g update datmouth
```

# Already joined a topic?

```
Commands:
- /help                 Displays this message
- /nick yournickname    Changes your actual nickname
- /history 4            Displays last 4 messages received
- /colors               Displays color support
- /color #EA8A25        Changes nickname color
- /giphy boom           Displays a "boom" gif in the terminal (iterm2, node>=v10.19)
- /connected            Shows number of peers connected
- /exit                 Close the app

Emacs commands:
- CTRL-U                Remove from cursor to start of line
- CTRL-A                Go to start of the line
- CTRL-E                Go to end of the line
- ALT-B                 Move cursor backwards, word by word
- ALT-F                 Move cursor forward, word by word
```

# Want to contribute?

Love to work with P2P enthusiasts. Fork the repo and `npm install` to install node dependencies.

to create instances, just do `node cli test-topic`