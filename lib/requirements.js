/* --------------------------------------------------------------------------------------------
 * SonarLint for Atom
 * Copyright (C) 2017 SonarSource SA
 * sonarlint@sonarsource.com
 * Licensed under the LGPLv3 License. See LICENSE.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

const cp = require('child_process')
const path = require('path')
const fs = require('fs')
const pathExists = require('path-exists');
const expandHomeDir = require('expand-home-dir');
const findJavaHome = require('find-java-home');

const JAVA_BINARY = 'java' + ((process.platform.indexOf('win') === 0) ? '.exe' : '');

exports.java = JAVA_BINARY;

exports.resolve = () =>
  checkJavaRuntime().then(javaHome =>
    checkJavaVersion(javaHome).then(javaVersion =>
      Promise.resolve({ javaHome: javaHome, javaVersion: javaVersion })))

function checkJavaRuntime() {
  return new Promise((resolve, reject) => {
    let source;
    let javaHome = readJavaConfig();
    if (javaHome) {
      source = "The 'sonarlint.ls.javaHome' variable defined in settings";
    } else {
      javaHome = process.env['JDK_HOME'];
      if (javaHome) {
        source = 'The JDK_HOME environment variable';
      } else {
        javaHome = process.env['JAVA_HOME'];
        source = 'The JAVA_HOME environment variable';
      }
    }
    if (javaHome) {
      javaHome = expandHomeDir(javaHome);
      if (!pathExists.sync(javaHome)) {
        openJREDownload(reject, source + ' points to a missing folder');
      }
      if (!pathExists.sync(path.resolve(javaHome, 'bin', JAVA_BINARY))){
        openJREDownload(reject, source + ' does not point to a JRE.');
      }
      return resolve(javaHome);
    }
    //No settings, let's try to detect as last resort.
    findJavaHome(function (err, home) {
      if (err) {
        openJREDownload(reject, "Java runtime could not be located. Install it and set its location using 'sonarlint.ls.javaHome' variable in settings.");
      } else {
        resolve(home);
      }
    });
  });
}

function readJavaConfig() {
  return atom.config.get('sonarlint.ls.javaHome');
}

function checkJavaVersion(javaHome) {
  return new Promise((resolve, reject) => {
    const prog = path.resolve(javaHome, 'bin', JAVA_BINARY);
    if ((fs.statSync(prog).mode & 1) == 0) {
      openJREDownload(reject, "Java binary not an executable file: " + prog);
      return;
    }

    cp.execFile(prog, ['-version'], {}, (error, stdout, stderr) => {
      if (stderr.indexOf('version "9') > -1) {
        resolve(9);
      } if (stderr.indexOf('1.8') < 0) {
        openJREDownload(reject, 'Java 8 is required to run. Please download and install a JRE 8.');
      } else {
        resolve(8);
      }
    });
  });
}

function openJREDownload(reject, message) {
  const jreUrl = 'http://www.oracle.com/technetwork/java/javase/downloads/index.html';
  reject({
    message: message,
    description: 'You can get the Java Runtime Environment from ' + jreUrl
  });
}
