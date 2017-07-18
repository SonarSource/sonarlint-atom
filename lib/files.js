/* --------------------------------------------------------------------------------------------
 * SonarLint for Atom
 * Copyright (C) 2017 SonarSource SA
 * sonarlint@sonarsource.com
 * Licensed under the LGPLv3 License. See LICENSE.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

const path = require('path');

const languageServerInfo = {
  basedir: 'node_modules/sonarlint-atom-files/files/server',
  filename: "sonarlint-ls.jar"
}
const analyzerBasedir = 'node_modules/sonarlint-atom-files/files/analyzers'
const analyzerInfos = [
  {
    basedir: analyzerBasedir,
    filename: "sonarjs.jar"
  },
  {
    basedir: analyzerBasedir,
    filename: "sonarpython.jar"
  },
  {
    basedir: analyzerBasedir,
    filename: "sonarphp.jar"
  }
];

function localPath(basedir, info) {
  return path.resolve(basedir, info.basedir, info.filename);
}

exports.requirements = basedir => [languageServerInfo].concat(analyzerInfos).map(info => {
  return {
    basedir: path.resolve(info.basedir),
    path: localPath(basedir, info)
  };
});

exports.languageServerJar = basedir => localPath(basedir, languageServerInfo);

exports.analyzerJars = basedir => analyzerInfos.map(info => localPath(basedir, info));
