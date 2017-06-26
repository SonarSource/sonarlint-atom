'use babel';

import SonarLintLanguageServer from './sonarlint-ls';
const {AutoLanguageClient} = require('atom-languageclient')
import { CompositeDisposable } from 'atom';

export default {

  sonarlintView: null,
  modalPanel: null,
  subscriptions: null,

  poc_clean() {
    console.log('poc_clean');

    // throws "Class constructor AutoLanguageClient cannot be invoked without 'new'"
    //var ls = new SonarLintLanguageServer();
  },

  poc_messy() {
    AutoLanguageClient.prototype.getGrammarScopes = SonarLintLanguageServer.prototype.getGrammarScopes;
    AutoLanguageClient.prototype.getLanguageName = SonarLintLanguageServer.prototype.getLanguageName;
    AutoLanguageClient.prototype.getServerName = SonarLintLanguageServer.prototype.getServerName;
    AutoLanguageClient.prototype.startServerProcess = SonarLintLanguageServer.prototype.startServerProcess;
    AutoLanguageClient.prototype.spawnServer = SonarLintLanguageServer.prototype.spawnServer;
    AutoLanguageClient.prototype.createServerConnection = SonarLintLanguageServer.prototype.createServerConnection;
    AutoLanguageClient.prototype.getInitializeParams = (projectPath, process) => {
      console.log('getInitializeParams')
      return {
        processId: process.pid,
        capabilities: {},
        rootPath: projectPath,
        initializationOptions: {
          telemetryStorage: '/tmp/sonarlint-telemetry-atom',
          disableTelemetry: false
        }
      }
    }
    var sls = new AutoLanguageClient();
    sls.activate();
  },

  activate(state) {
    console.log("activated");
    //this.poc_clean();
    this.poc_messy();

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sonarlint:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  toggle() {
    console.log('Sonarlint was toggled!');
    //var server = new SonarLintLanguageServer();
  }

};
