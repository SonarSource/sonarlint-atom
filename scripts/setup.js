/* --------------------------------------------------------------------------------------------
 * SonarLint for Atom
 * Copyright (C) 2017 SonarSource SA
 * sonarlint@sonarsource.com
 * Licensed under the LGPLv3 License. See LICENSE.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

'use strict';

const files = require('../lib/files');

const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path')
const crypto = require('crypto');
const request = require('request');

function setup() {
  files.requirements(".").map(info => {
    mkdirp(info.basedir);
    downloadIfNeeded(info.url, info.path);
  });
}

function downloadIfNeeded(url, dest) {
  request(url + '.sha1', function (error, response, body) {
    if (error) {
      console.error('error:', error);
    } else {
      downloadIfChecksumMismatch(body, url, dest);
    }
  });
}

function downloadIfChecksumMismatch(expectedChecksum, url, dest) {
  if (!fs.existsSync(dest)) {
    console.log("Downloading", url, "to", dest, "...");
    request(url).pipe(fs.createWriteStream(dest));
  } else {
    fs.createReadStream(dest).pipe(crypto.createHash('sha1').setEncoding('hex')).on('finish', function () {
      let sha1 = this.read();
      if (expectedChecksum != sha1) {
        console.info("Checksum mismatch for", dest, ". Will download it!");
        request(url).pipe(fs.createWriteStream(dest));
      }
    })
  }
}

setup();
