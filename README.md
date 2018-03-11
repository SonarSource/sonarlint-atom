# SonarLint for Atom

SonarLint is an Atom extension that provides on-the-fly feedback to developers on new bugs and quality issues injected into JavaScript, TypeScript, PHP and Python code.

## How it works

Simply open a JS, TS, PHP or Python file within a project, start coding, and you will start seeing issues reported by SonarLint. Issues are highlighted in your code, and also listed in the 'Diagnostics' or 'Linter' panel. Note that only files within a project are analyzed.

![sonarlint on-the-fly](https://github.com/SonarSource/sonarlint-atom/raw/master/images/sonarlint-atom.gif)

You can access the detailed rule description directly from your editor by using the provided action when code actions are enabled in your IDE.

## Rules

Check the rules to see what SonarLint can do for you:
- [JavaScript rules][rules-js]
- [TypeScript rules][rules-ts]
- [Python rules][rules-python]
- [PHP rules][rules-php]

You will benefit from the following code analyzers: [SonarJS][sonar-js], [SonarTS][sonar-ts], [SonarPython][sonar-python] and [SonarPHP][sonar-php].

## Requirements

- SonarLint for Atom uses the language server protocol and relies on some packages to display the list of errors and highlight issues in the code. It works best with [Atom IDE][atom-ide] which is automatically proposed. But you can also use other compatible packages such as [Linter][linter] and [Nuclide][nuclide].

- You also need a Java Runtime (JRE) 8 installed on your computer. SonarLint should automatically find it but you can also explicitly set the path where the JRE is installed using the 'sonarlint.javaHome' variable in Atom settings (`~/.atom/config.cson`). For example:
```
    "*":
      sonarlint:
        javaHome: "C:\Program Files\Java\jre1.8.0_131"
```

## Contributions and license

SonarLint for Atom is open source under the LGPL v3 license. Feel free to submit Pull Requests.

## Feedback

The preferred way to discuss about SonarLint is by posting on the [SonarLint Google Group][ggroups]. Feel free to ask questions, report issues, and give suggestions on the Google Group.

[atom-ide]: https://ide.atom.io
[linter]: https://atom.io/packages/linter
[nuclide]: https://atom.io/packages/nuclide
[rules-js]: https://rules.sonarsource.com/javascript
[rules-ts]: https://rules.sonarsource.com/typescript
[rules-python]: https://rules.sonarsource.com/python
[rules-php]: https://rules.sonarsource.com/php
[sonar-js]: https://redirect.sonarsource.com/plugins/javascript.html
[sonar-ts]: https://redirect.sonarsource.com/plugins/typescript.html
[sonar-python]: https://redirect.sonarsource.com/plugins/python.html
[sonar-php]: https://redirect.sonarsource.com/plugins/php.html
[ggroups]: https://groups.google.com/forum/#!forum/sonarlint
