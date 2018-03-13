/* --------------------------------------------------------------------------------------------
* SonarLint for Atom
* Copyright (C) 2017 SonarSource SA
* sonarlint@sonarsource.com
* Licensed under the LGPLv3 License. See LICENSE.txt in the project root for license information.
* ------------------------------------------------------------------------------------------ */

const cp = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');
const pathExists = require('path-exists');
const { CompositeDisposable } = require('atom');
const {AutoLanguageClient, DownloadFile, LinterPushV2Adapter} = require('atom-languageclient');
const SonarLintRuleView = require('./sonarlint-rule-view');

const bytesToMegabytes = 1024 * 1024;

const ruleDetailsBaseUrl = 'https://rules.sonarsource.com'

const minJavaRuntime = 1.8;
const lsDownloadUrl = 'https://sonarsource.bintray.com/Distribution/sonarlint-language-server/sonarlint-language-server-3.2.0.1449.jar';
const lsFilename = 'sonarlint-ls.jar';
const lsSize = 10587062;

const sonarjs = { name: 'SonarJS', filename: 'sonarjs.jar', size: 3405969, downloadUrl: 'https://sonarsource.bintray.com/Distribution/sonar-javascript-plugin/sonar-javascript-plugin-4.1.0.6085.jar'};
const sonarphp = { name: 'SonarPHP', filename: 'sonarphp.jar', size: 2774137, downloadUrl: 'https://sonarsource.bintray.com/Distribution/sonar-php-plugin/sonar-php-plugin-2.12.1.3018.jar'};
const sonarpython = { name: 'SonarPython', filename: 'sonarpython.jar', size: 1509434, downloadUrl: 'https://sonarsource.bintray.com/Distribution/sonar-python-plugin/sonar-python-plugin-1.9.0.2010.jar'};
const sonarts = { name: 'SonarTS', filename: 'sonarts.jar', size: 1928571, downloadUrl: 'https://sonarsource.bintray.com/Distribution/sonar-typescript-plugin/sonar-typescript-plugin-1.6.0.2388.jar'};

let subscriptions = null;

class SonarLintLanguageClient extends AutoLanguageClient {

  getGrammarScopes () { return ['source.js', 'source.js.jsx', 'source.ts', 'source.ts.jsx', 'text.html.vue', 'source.python', 'text.html.php']; }
  getLanguageName () { return 'SonarLint'; }
  getServerName () { return 'LS'; }

  constructor () {
    super();
    this.statusElement = document.createElement('span');
    this.statusElement.className = 'inline-block';

  }

  activate(state) {
    const pns = atom.packages.getAvailablePackageNames()
    if (!(pns.includes("atom-ide-ui") || pns.includes("linter") || pns.includes("nuclide"))) {
      require("atom-package-deps").install("sonarlint", true);
    }
    super.activate(state);
    atom.workspace.addOpener((uriToOpen) => {
      try {
        const url = new URL(uriToOpen);
        if (url.protocol !== 'sonarlint-rule:') {
          return;
        }
      } catch (error) {
        return;
      }

      return new SonarLintRuleView();
    });
  }

  deactivate() {
    super.deactivate();
  }


  startServerProcess (projectPath) {

    const serverHome = path.join(__dirname, '..', 'server');
    const pluginsHome = path.join(__dirname, '..', 'plugins');
    const command = this.getJavaCommand();
    let javaVersion;

    return this.checkJavaVersion(command)
    .then(foundJavaVersion => {
      javaVersion = foundJavaVersion;
      return this.installPluginIfRequired(pluginsHome, sonarjs);
    })
    .then(() => {
      return this.installPluginIfRequired(pluginsHome, sonarphp);
    })
    .then(() => {
      return this.installPluginIfRequired(pluginsHome, sonarpython);
    })
    .then(() => {
      return this.installPluginIfRequired(pluginsHome, sonarts);
    })
    .then(() => {
      return this.installServerIfRequired(serverHome);
    })
    .then(() => {
      const args = [];
      if (javaVersion >= 9) {
        args.push(
          '--add-modules=ALL-SYSTEM',
          '--add-opens', 'java.base/java.util=ALL-UNNAMED',
          '--add-opens', 'java.base/java.lang=ALL-UNNAMED'
        );
      }

      const extraArgs = atom.config.get('sonarlint.extraVmArgs');
      args.push(...extraArgs);

      args.push(
        '-jar', path.join(serverHome, lsFilename)
      );

      return new Promise((resolve, reject) => {
        let childProcess;
        const server = net.createServer(socket => {
          // When the language server connects, grab socket, stop listening and resolve
          this.socket = socket;
          server.close();
          resolve(childProcess);
        });
        server.listen(0, '127.0.0.1', () => {
          // Once we have a port assigned spawn the Language Server with the port
          args.push(server.address().port);
          args.push(toUrl(path.resolve(pluginsHome, sonarjs.filename)));
          args.push(toUrl(path.resolve(pluginsHome, sonarphp.filename)));
          args.push(toUrl(path.resolve(pluginsHome, sonarpython.filename)));
          args.push(toUrl(path.resolve(pluginsHome, sonarts.filename)));
          childProcess = this.spawnServer(serverHome, command, args);
        });
      });
    });
  }

  spawnServer(serverHome, command, args) {
    this.logger.debug(`starting "${command} ${args.join(' ')}"`);
    const childProcess = cp.spawn(command, args, { cwd: serverHome });
    childProcess.stdout.setEncoding('utf8');
    childProcess.stdout.on('data', (chunk) => {
      const chunkStr = chunk.toString();
      chunkStr.split('\n').filter((l) => l).forEach((line) => this.logger.info(`stdout ${line}`));
    });
    this.captureServerErrors(childProcess, null);
    childProcess.on('close', exitCode => {
      if (!childProcess.killed) {
        atom.notifications.addError('SonarLint language server stopped unexpectedly.', {
          dismissable: true,
          description: this.processStdErr ? `<code>${this.processStdErr}</code>` : `Exit code ${exitCode}`
        });
      }
      this.updateStatusBar('Stopped');
    });
    return childProcess;
  }

  checkJavaVersion (command) {
    return new Promise((resolve, reject) => {
      const childProcess = cp.spawn(command, [ '-showversion', '-version' ]);
      childProcess.on('error', err => {
        this.showJavaRequirements(
          'SonarLint could not launch your Java runtime.',
          err.code == 'ENOENT' ? `No Java runtime found at <b>${command}</b>.` : `Could not spawn the Java runtime <b>${command}</b>.`
        );
        reject();
      });
      let stdErr = '', stdOut = '';
      childProcess.stderr.on('data', chunk => stdErr += chunk.toString());
      childProcess.stdout.on('data', chunk => stdOut += chunk.toString());
      childProcess.on('close', exitCode => {
        const output = stdErr + '\n' + stdOut;
        console.debug(output);
        if (exitCode === 0 && output.length > 2) {
          const version = this.getJavaVersionFromOutput(output);
          if (version == null) {
            this.showJavaRequirements(
              `SonarLint requires Java ${minJavaRuntime} but could not determine your Java version.`,
              `Could not parse the Java '-showversion -version' output <pre>${output}</pre>.`
            );
            reject();
          }
          if (version >= minJavaRuntime) {
            this.logger.debug(`Using Java ${version} from ${command}`);
            resolve(version);
          } else {
            this.showJavaRequirements(
              `SonarLint requires Java ${minJavaRuntime} or later but found ${version}`,
              `If you have Java ${minJavaRuntime} installed please set Java path correctly. If you do not please download Java ${minJavaRuntime} or later and install it.`
            );
            reject();
          }
        } else {
          atom.notifications.addError('SonarLint encounted an error using the Java runtime.', {
            dismissable: true,
            description: stdErr != '' ? `<code>${stdErr}</code>` : `Exit code ${exitCode}`
          });
          reject();
        }
      });
    });
  }

  getJavaVersionFromOutput (output) {
    const match = output.match(/ version "(\d+(.\d+)?)(.\d+)?(_\d+)?"/);
    return match != null && match.length > 0 ? Number(match[1]) : null;
  }

  showJavaRequirements (title, description) {
    atom.notifications.addError(title, {
      dismissable: true,
      buttons: [
        { text: 'Set Java Path', onDidClick: () => atom.workspace.open('atom://config/packages/sonarlint') },
        { text: 'Download Java', onDidClick: () => shell.openExternal('http://www.oracle.com/technetwork/java/javase/downloads/index.html') },
      ],
      description: `${description}<p>If you have Java installed please Set Java Path correctly. If you do not please Download Java ${minJavaRuntime} or later and install it.</p>`
    });
  }

  getJavaCommand () {
    const javaPath = this.getJavaPath();
    return javaPath == null ? 'java' : path.join(javaPath, 'bin', 'java');
  }

  getJavaPath () {
    return (new Array(
      atom.config.get('sonarlint.javaHome'),
      process.env.JDK_HOME,
      process.env.JAVA_HOME)
    ).find(j => j);
  }

  installPluginIfRequired(pluginHome, plugin) {
    return this.isPluginInstalled(pluginHome, plugin)
    .then(doesExist => { if (!doesExist) return this.installPlugin(pluginHome, plugin); });
  }

  isPluginInstalled(pluginHome, plugin) {
    return this.fileExists(path.join(pluginHome, plugin.filename));
  }

  installPlugin(pluginHome, plugin) {
    const localFileName = path.join(pluginHome, plugin.filename);
    return this.fileExists(pluginHome)
    .then(doesExist => { if (!doesExist) fs.mkdirSync(pluginHome); })
    .then(() => { return DownloadFile(plugin.downloadUrl, localFileName, (bytesDone, percent) => this.updateInstallStatus(`downloading ${plugin.name} (${percent}% done)`), plugin.size);})
    .then(() => this.fileExists(path.join(pluginHome, plugin.filename)))
    .then(doesExist => { if (!doesExist) throw Error(`Failed to install the ${this.getServerName()} ${plugin.name}`); })
    .then(() => this.updateInstallStatus(`${plugin.name} installed`));
  }

  installServerIfRequired(serverHome) {
    return this.isServerInstalled(serverHome)
    .then(doesExist => { if (!doesExist) return this.installServer(serverHome); });
  }

  isServerInstalled(serverHome) {
    return this.fileExists(path.join(serverHome, lsFilename));
  }

  installServer(serverHome) {
    const localFileName = path.join(serverHome, lsFilename);
    return this.fileExists(serverHome)
    .then(doesExist => { if (!doesExist) fs.mkdirSync(serverHome); })
    .then(() => { return DownloadFile(lsDownloadUrl, localFileName, (bytesDone, percent) => this.updateInstallStatus(`downloading SonarLint language server (${percent}% done)`), lsSize);})
    .then(() => this.fileExists(path.join(serverHome, lsFilename)))
    .then(doesExist => { if (!doesExist) throw Error(`Failed to install the ${this.getServerName()} language server`); })
    .then(() => this.updateInstallStatus('installed'));
  }

  fileExists(path) {
    return new Promise((resolve, reject) => {
      fs.access(path, fs.R_OK, error => {
        resolve(!error || error.code !== 'ENOENT');
      });
    });
  }

  openRuleDescription (rule) {
    const uri = SonarLintRuleView.uri;

    const rulePane = atom.workspace.paneForURI(uri);
    if (!rulePane) {
      const previousActivePane = atom.workspace.getActivePane();
      atom.workspace.open(uri, {split: 'right', searchAllPanes: true})
      .then((ruleView) => {
        if (ruleView instanceof SonarLintRuleView) {
          ruleView.renderRule(rule);
          previousActivePane.activate();
        }
      });
    } else {
      rulePane.itemForURI(uri).renderRule(rule);
    }
  }

  getInitializeParams (projectPath, process) {
    const config = this.config();

    return Object.assign(
      super.getInitializeParams(projectPath, process),
      {
        initializationOptions: {
          testFilePattern: config.testFilePattern,
          analyzerProperties: config.analyzerProperties,
          productKey: 'atom',
          productName: 'SonarLint Atom',
          productVersion: this._version(),
          disableTelemetry: config.disableTelemetry,
          typeScriptLocation: findTypeScriptLocation()
        }
      }
    );
  }

  config() {
    const get = name => atom.config.get(this._name() + '.' + name);
    return {
      testFilePattern: get('testFilePattern'),
      analyzerProperties: get('analyzerProperties'),
      disableTelemetry: get('disableTelemetry')
    };
  }

  preInitialization(connection) {
    connection.onCustom('sonarlint/openRuleDescription', this.openRuleDescription.bind(this));
    const didChangeConfiguration = () => {
      const didChangeConfigurationParams = {
        settings: {
          sonarlint: this.config()
        }
      };
      if (!this.socket.destroyed) {
        connection.didChangeConfiguration(didChangeConfigurationParams);
      }
    };
    atom.config.observe('sonarlint.testFilePattern', didChangeConfiguration);
    atom.config.observe('sonarlint.analyzerProperties', didChangeConfiguration);
    atom.config.observe('sonarlint.disableTelemetry', didChangeConfiguration);
  }

  updateInstallStatus (status) {
    const isComplete = status === 'installed';
    if (this.busySignalService) {
      if (this._installSignal == null) {
        if (!isComplete) {
          this._installSignal = this.busySignalService.reportBusy(status, { revealTooltip: true });
        }
      } else {
        if (isComplete) {
          this._installSignal.dispose();
        } else {
          this._installSignal.setTitle(status);
        }
      }
    } else {
      this.updateStatusBar(status);
    }
  }

  updateStatusBar (text) {
    this.statusElement.textContent = `SonarLint ${text}`;
    if (!this.statusTile && this.statusBar) {
      this.statusTile = this.statusBar.addRightTile({ item: this.statusElement, priority: 1000 });
    }
  }

  consumeStatusBar (statusBar) {
    this.statusBar = statusBar;
  }

  _name() {
    return this._metadata().name;
  }

  _version() {
    return this._metadata().version;
  }

  _metadata() {
    return atom.packages.getActivePackage('sonarlint').metadata;
  }

}

function findTypeScriptLocation() {
  const folderWithTypeScript = atom.project.getPaths().find(p => pathExists.sync(path.resolve(p, 'node_modules', 'typescript')));
  return folderWithTypeScript ? path.resolve(folderWithTypeScript, 'node_modules') : undefined;
}

function toUrl(filePath) {
  var pathName = path.resolve(filePath).replace(/\\/g, '/');

  // Windows drive letter must be prefixed with a slash
  if (pathName[0] !== '/') {
    pathName = '/' + pathName;
  }

  return encodeURI('file://' + pathName);
}

let originalDiagnosticToV2Message = LinterPushV2Adapter.prototype.diagnosticToV2Message;
LinterPushV2Adapter.prototype.diagnosticToV2Message = function(path, diagnostic) {
  let message = originalDiagnosticToV2Message(path, diagnostic)
  setRuleDetailsUrl(message, diagnostic)
  return message;
}

function setRuleDetailsUrl(message, diagnostic) {
  var repoAndRuleId = diagnostic.code.split(':')
  if (repoAndRuleId.length == 2) {
    let repo = repoAndRuleId[0];
    let ruleId = repoAndRuleId[1];
    let newRuleKeysRegexp = /^S(\d+)$/g;
    let match = newRuleKeysRegexp.exec(ruleId);
    if (match) {
      message.url = `${ruleDetailsBaseUrl}/${repo}/RSPEC-${match[1]}`
    } else {
      // legacy keys
      message.url = `${ruleDetailsBaseUrl}/${repo}/RSPEC-${ruleId}`
    }
  }
}


module.exports = new SonarLintLanguageClient();
