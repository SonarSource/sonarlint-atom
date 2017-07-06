/* --------------------------------------------------------------------------------------------
 * SonarLint for Atom
 * Copyright (C) 2017 SonarSource SA
 * sonarlint@sonarsource.com
 * Licensed under the LGPLv3 License. See LICENSE.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

const path = require('path');

const languageServerInfo = {
  basedir: 'files/server',
  url: "https://repox.sonarsource.com/sonarsource-public-builds/org/sonarsource/sonarlint/core/sonarlint-language-server/2.15.0.814/sonarlint-language-server-2.15.0.814.jar",
  filename: "sonarlint-ls.jar"
}
const analyzerBasedir = 'files/analyzers'
const analyzerInfos = [
  {
    basedir: analyzerBasedir,
    url: "http://repo1.maven.org/maven2/org/sonarsource/javascript/sonar-javascript-plugin/3.1.0.5111/sonar-javascript-plugin-3.1.0.5111.jar",
    filename: "sonarjs.jar"
  },
  {
    basedir: analyzerBasedir,
    url: "http://repo1.maven.org/maven2/org/sonarsource/python/sonar-python-plugin/1.8.0.1496/sonar-python-plugin-1.8.0.1496.jar",
    filename: "sonarpython.jar"
  },
  {
    basedir: analyzerBasedir,
    url: "http://repo1.maven.org/maven2/org/sonarsource/php/sonar-php-plugin/2.10.0.2087/sonar-php-plugin-2.10.0.2087.jar",
    filename: "sonarphp.jar"
  }
];

function localPath(basedir, info) {
  return path.resolve(basedir, info.basedir, info.filename);
}

exports.requirements = basedir => [languageServerInfo].concat(analyzerInfos).map(info => {
  return {
    basedir: path.resolve(info.basedir),
    url: info.url,
    path: localPath(basedir, info)
  };
});

exports.languageServerJar = basedir => localPath(basedir, languageServerInfo);

exports.analyzerJars = basedir => analyzerInfos.map(info => localPath(basedir, info));
