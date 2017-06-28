const cp = require('child_process')
const fs = require('fs')
const net = require('net')
const path = require('path')
const rpc = require('vscode-jsonrpc')
const {AutoLanguageClient, LinterPushV2Adapter} = require('atom-languageclient')

// TODO use sonarlint-atom site, ideally with version obtained from package.json
const ruleDetailsBaseUrl = 'http://www.sonarlint.org/intellij/rules/index.html#version=2.10'

class SonarLintLanguageServer extends AutoLanguageClient {
  getGrammarScopes () { return ['source.js', 'source.python', 'text.html.php'] }
  getLanguageName () { return 'JavaScript, Python, PHP' }
  getServerName () { return 'SonarLint' }

  startServerProcess () {
    // TODO download if not present, see https://github.com/atom/languageserver-java/blob/master/lib/main.js
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
    return cp.spawn(command, args, { cwd: cwd })
  }

  getInitializeParams (projectPath, process) {
    return {
      processId: process.pid,
      capabilities: {},
      rootPath: projectPath,
      initializationOptions: {
        // TODO
        telemetryStorage: "/tmp/sonarlint-telemetry-atom",
        disableTelemetry: false,
        // TODO eliminate if possible
        lspVersion: "2"
      }
    }
  }

  activate() {
    super.activate()
    this.name = this.getServerName()
  }

  newLinterPushV2Adapter(connection) {
    return new CustomLinterPushV2Adapter(connection)
  }
}

class CustomLinterPushV2Adapter extends LinterPushV2Adapter {
  constructor(connection) {
    super(connection)
  }

  diagnosticToV2Message(path, diagnostic) {
    var message = super.diagnosticToV2Message(path, diagnostic)
    this.setRuleDetailsUrl(message, diagnostic)
    this.setSolutions(message)
    return message
  }

  setRuleDetailsUrl(message, diagnostic) {
    var languageAndRuleId = diagnostic.code.split(':')
    if (languageAndRuleId.length == 2) {
      var language = languageAndRuleId[0]
      var ruleId = languageAndRuleId[1]
      message.url = `${ruleDetailsBaseUrl}&ruleId=${ruleId}&language=${language}`
    }
  }

  setSolutions(message) {
    // TODO add dependency: intentions
    // usage: move cursor on underliend area, press alt + enter to show intentions,
    //        option "Open rule details" should pop up, press enter again to do it
    message.solutions = [
      {
        title: "Open rule details",
        position: message.location.position,
        // TODO
        apply: (() => { alert("todo"); })
      }
    ]
  }
}

module.exports = new SonarLintLanguageServer()
