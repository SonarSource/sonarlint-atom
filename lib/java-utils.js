/* --------------------------------------------------------------------------------------------
 * SonarLint for Atom
 * Copyright (C) 2017 SonarSource SA
 * sonarlint@sonarsource.com
 * Licensed under the LGPLv3 License. See LICENSE.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

const JAVA_BINARY = 'java' + ((process.platform.indexOf('win') === 0) ? '.exe' : '');

exports.java = JAVA_BINARY;
