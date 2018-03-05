const path = require('path');
const fs = require('fs');

const uri = "sonarlint-rule://show";

module.exports =
class SonarLintRuleView {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('sonarlint-rule');
    this.element.tabIndex = -1;
    this.element.innerHTML = '<b>No rules selected</b>';
  }

  getTitle() {
    return 'SonarLint';
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
  return `<!doctype html><html>
  <head>
  <style type="text/css">
  body {
    font-family: Helvetica Neue,Segoe UI,Helvetica,Arial,sans-serif;
    font-size: 13px; line-height: 1.23076923;
  }

  h1 { font-size: 14px;font-weight: 500; }
  h2 { line-height: 24px;}
  a { border-bottom: 1px solid rgba(230, 230, 230, .1); color: #236a97; cursor: pointer; outline: none; text-decoration: none; transition: all .2s ease;}

  .rule-desc { line-height: 1.5;}
  .rule-desc { line-height: 1.5;}
  .rule-desc h2 { font-size: 16px; font-weight: 400;}
  .rule-desc code { padding: .2em .45em; margin: 0; border-radius: 3px; white-space: nowrap;}
  .rule-desc pre { padding: 10px; border-top: 1px solid rgba(230, 230, 230, .1); border-bottom: 1px solid rgba(230, 230, 230, .1); line-height: 18px; overflow: auto;}
  .rule-desc code, .rule-desc pre { font-family: Consolas,Liberation Mono,Menlo,Courier,monospace; font-size: 12px;}
  .rule-desc ul { padding-left: 40px; list-style: disc;}
  </style>
  </head>
  <body><h1><big>${rule.name}</big> (${rule.key})</h1>
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
  <div class=\"rule-desc\">${rule.htmlDescription}</div>
  </body></html>`;
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
