const cp = require('child_process')
const fs = require('fs')
const net = require('net')
const path = require('path')
const rpc = require('vscode-jsonrpc')
const {AutoLanguageClient} = require('atom-languageclient')


class SonarLintLanguageServer extends AutoLanguageClient {
  getGrammarScopes () { return ['source.js', 'source.python', 'text.html.php'] }
  getLanguageName () { return 'JavaScript, Python, PHP' }
  getServerName () { return 'SonarLint' }

  startServerProcess () {
    console.log('startServerProcess');
    const serverHome = path.join(__dirname, '..', 'server')
    const command = 'java.sh'
    const args = ['-jar', 'sonarlint-ls.jar']
    let process

    return new Promise((resolve, reject) => {
      const server = net.createServer(socket => {
        server.close()
        this.socket = socket
        resolve(process)
      })
      server.listen(0, '127.0.0.1', () => {
        args.push(server.address().port)
        process = this.spawnServer(command, args, serverHome)
      })
    })
  }

  spawnServer (command, args, cwd) {
    console.log('spawnServer');
    this.logger.debug(`starting "${command} ${args.join(' ')}"`)
    return cp.spawn(command, args, { cwd: cwd })
  }

  getInitializeParams (projectPath, process) {
    console.log('getInitializeParams', projectPath, process.pid)
    return {
      processId: process.pid,
      capabilities: {},
      rootPath: projectPath,
      initializationOptions: {
        telemetryStorage: "/tmp/sonarlint-telemetry-atom",
        disableTelemetry: false,
        lspVersion: "2"
      }
    }
  }

  activate() {
    super.activate();
    this.name = this.getServerName();
  }
}

module.exports = new SonarLintLanguageServer()
