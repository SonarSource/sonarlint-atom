# SonarLint for Atom

### :warning: SonarLint for Atom is now decommissioned.
_See [the community announcement](https://community.sonarsource.com/t/decommissioning-sonarlint-for-atom/8192) for more details_

SonarLint is an IDE extension that helps you detect and fix quality issues as you write code in JavaScript, TypeScript, PHP and Python.

## How it works

SonarLint is an IDE extension that helps you detect and fix quality issues as you write code. Like a spell checker, SonarLint squiggles flaws so that they can be fixed before committing code. You can get it directly from the ATOM Marketplace, and it will then detect new bugs and quality issues as you code (JavaScript, TypeScript, PHP and Python). 

![sonarlint on-the-fly](https://github.com/SonarSource/sonarlint-atom/raw/master/images/sonarlint-atom.gif)

Issues are highlighted in your code, and also listed in the 'Diagnostics' or 'Linter' panel. Note that only files within a project are analyzed. You can access the detailed rule description directly from your editor by using, depending on the UI tools you have, the provided code action or the link to the [rules website][rules].

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

The preferred way to discuss about SonarLint is by posting on the [SonarSource Community Forum][community-forum]. Feel free to ask questions, report issues, and give suggestions.

[atom-ide]: https://ide.atom.io
[linter]: https://atom.io/packages/linter
[nuclide]: https://atom.io/packages/nuclide
[rules]: https://rules.sonarsource.com
[rules-js]: https://rules.sonarsource.com/javascript
[rules-ts]: https://rules.sonarsource.com/typescript
[rules-python]: https://rules.sonarsource.com/python
[rules-php]: https://rules.sonarsource.com/php
[sonar-js]: https://redirect.sonarsource.com/plugins/javascript.html
[sonar-ts]: https://redirect.sonarsource.com/plugins/typescript.html
[sonar-python]: https://redirect.sonarsource.com/plugins/python.html
[sonar-php]: https://redirect.sonarsource.com/plugins/php.html
[community-forum]: https://community.sonarsource.com/
