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
const javaHomeSettingName = 'sonarlint.javaHome'

exports.java = JAVA_BINARY;

exports.resolve = () =>
  checkJavaRuntime().then(javaHome =>
    checkJavaVersion(javaHome).then(javaVersion =>
      Promise.resolve()))

function checkJavaRuntime() {
  return new Promise((resolve, reject) => {
    let source;
    let javaHome = readJavaConfig();
    if (javaHome) {
      source = `The '${javaHomeSettingName}' configuration defined in settings`;
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
        openJREDownload(reject, `${source} points to a non-existent folder: ${javaHome}`);
      }
      if (!pathExists.sync(path.resolve(javaHome, 'bin', JAVA_BINARY))){
        openJREDownload(reject, `${source} does not point to a JRE.`);
      }
      return resolve(javaHome);
    }
    //No settings, let's try to detect as last resort.
    findJavaHome(function (err, home) {
      if (err) {
        openJREDownload(reject, `Java runtime could not be located. Install it and set its location using '${javaHomeSettingName}' in settings.`);
      } else {
        resolve(home);
      }
    });
  });
}

function readJavaConfig() {
  return atom.config.get(javaHomeSettingName);
}

function checkJavaVersion(javaHome) {
  return new Promise((resolve, reject) => {
    const prog = path.resolve(javaHome, 'bin', JAVA_BINARY);

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
