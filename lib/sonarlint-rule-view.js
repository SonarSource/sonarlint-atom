/* --------------------------------------------------------------------------------------------
* SonarLint for Atom
* Copyright (C) 2018 SonarSource SA
* sonarlint@sonarsource.com
* Licensed under the LGPLv3 License. See LICENSE.txt in the project root for license information.
* ------------------------------------------------------------------------------------------ */

const path = require('path');
const fs = require('fs');

const uri = "sonarlint-rule://show";

module.exports = class SonarLintRuleView {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('sonarlint-rule');
    this.element.tabIndex = -1;
    this.element.innerHTML = '<b>No rules selected</b>';
  }

  getTitle() {
    return 'SonarLint Rule Description';
  }

  getUri() {
    return uri;
  }

  static get uri() {
    return uri;
  }

  renderRule(rule) {
    this.element.innerHTML = generateHtml(rule);
  }

  destroy() {
    this.element.remove();
  }

};

function generateHtml(rule) {
  let severityImg = path.resolve(
    __dirname, '..',
    "images",
    "severity",
    rule.severity.toLowerCase() + ".png"
  );
  let typeImg = path.resolve(
    __dirname, '..',
    "images",
    "type",
    rule.type.toLowerCase() + ".png"
  );
  return `
  <style type="text/css">
  .sonarlint-rule {
    font-family: Helvetica Neue,Segoe UI,Helvetica,Arial,sans-serif;
    font-size: 13px; line-height: 1.23076923;
    margin: 10px;
  }

  .sonarlint-rule h1 { font-size: 14px;font-weight: 500; }
  .sonarlint-rule h2 { line-height: 24px;}
  .sonarlint-rule a { border-bottom: 1px solid rgba(230, 230, 230, .1); color: #236a97; cursor: pointer; outline: none; text-decoration: none; transition: all .2s ease;}

  .sonarlint-rule .rule-desc { line-height: 1.5;}
  .sonarlint-rule .rule-desc { line-height: 1.5;}
  .sonarlint-rule .rule-desc h2 { font-size: 16px; font-weight: 400;}
  .sonarlint-rule .rule-desc code { padding: .2em .45em; margin: 0; border-radius: 3px; white-space: nowrap;}
  .sonarlint-rule .rule-desc pre { padding: 10px; border-top: 1px solid rgba(230, 230, 230, .1); border-bottom: 1px solid rgba(230, 230, 230, .1); line-height: 18px; overflow: auto;}
  .sonarlint-rule .rule-desc code, .rule-desc pre { font-family: Consolas,Liberation Mono,Menlo,Courier,monospace; font-size: 12px;}
  .sonarlint-rule .rule-desc ul { padding-left: 40px; list-style: disc;}
  </style>
  <h1><big>${rule.name}</big> (${rule.key})</h1>
  <div>
  <img style="padding-bottom: 1px;vertical-align: middle" width="16" height="16" alt="${rule.type}" src="data:image/gif;base64,${base64_encode(
    typeImg
  )}">&nbsp;
  ${clean(rule.type)}&nbsp;
  <img style="padding-bottom: 1px;vertical-align: middle" width="16" height="16" alt="${rule.severity}" src="data:image/gif;base64,${base64_encode(
    severityImg
  )}">&nbsp;
  ${clean(rule.severity)}
  </div>
  <div class=\"rule-desc\">${rule.htmlDescription}</div>`;
}

function clean(str) {
  return capitalizeName(
    str
      .toLowerCase()
      .split("_")
      .join(" ")
  );
}

function capitalizeName(name) {
  return name.replace(/\b(\w)/g, s => s.toUpperCase());
}

function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer(bitmap).toString("base64");
}
