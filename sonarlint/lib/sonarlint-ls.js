'use babel';

const cp = require('child_process')
const fs = require('fs')
const net = require('net')
const path = require('path')
const rpc = require('vscode-jsonrpc')
const {AutoLanguageClient} = require('atom-languageclient')


export default class SonarLintLanguageServer extends AutoLanguageClient {
  getGrammarScopes () {
    console.log('getGrammarScopes')
    return ['source.js', 'source.py', 'text.html.php'] }
  getLanguageName () {
    console.log('getLanguageName')
    return 'whatever' }
  getServerName () { return 'SonarLint Language Server' }

  startServerProcess () {
    console.log('startServerProcess');
    const serverHome = path.join(__dirname, '..', 'server')
    const command = 'java.sh'
    const port = 1234
    const args = ['-jar', 'sonarlint-ls.jar', '' + port]
    let process

    return new Promise((resolve, reject) => {
      const server = net.createServer(socket => {
        server.close()
        this.socket = socket
        resolve(process)
      })
      server.listen(port, '127.0.0.1', () => {
        process = this.spawnServer(command, args, serverHome)
      })
    })
  }

  spawnServer (command, args, cwd) {
    console.log('spawnServer');
    //this.logger.debug(`starting "${command} ${args.join(' ')}"`)
    return cp.spawn(command, args, { cwd: cwd })
  }
}

//module.exports = new SonarLintLanguageServer()
