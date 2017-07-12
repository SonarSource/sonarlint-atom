# SonarLint for Atom

SonarLint is an Atom extension that provides on-the-fly feedback to developers on new bugs and quality issues injected into JavaScript, PHP and Python code.

## How it works

Simply open a JS, PHP or Python file within a project, start coding, and you will start seeing issues reported by SonarLint. Issues are highlighted in your code, and also listed in the 'Linter' panel. Note that only files within a project are analyzed.

![sonarlint on-the-fly](https://github.com/SonarSource/sonarlint-atom/raw/master/images/sonarlint-atom.gif)

You can access the detailed rule description by hovering over a highlighted error, and right-click on the link icon. This will open the page of the rule description on [sonarlint.org][rules].

You will benefit from the following code analyzers: [SonarJS][sonar-js], [SonarPHP][sonar-php] and [SonarPython][sonar-python]. You can find all available rules descriptions on the dedicated [SonarLint website][rules].

## Requirements

SonarLint for Atom uses [Linter][linter] to display the list of errors and to produce the highlights in the editor.

You also need a Java Runtime (JRE) 8 installed on your computer.

SonarLint should automatically find it but you can also explicitly set the path where the JRE is installed using the 'sonarlint.javaHome' variable in Atom settings (`~/.atom/config.cson`). For example:

    "*":
      sonarlint:
        javaHome: "/path/to/java/home"

## Contributions and license

SonarLint for Atom is open source under the LGPL v3 license. Feel free to submit Pull Requests.

## Feedback

The preferred way to discuss about SonarLint is by posting on the [SonarLint Google Group][ggroups]. Feel free to ask questions, report issues, and give suggestions on the Google Group.

[rules]: http://www.sonarlint.org/atom/rules/index.html
[linter]: https://atom.io/packages/linter
[sonar-js]: https://redirect.sonarsource.com/plugins/javascript.html
[sonar-python]: https://redirect.sonarsource.com/plugins/python.html
[sonar-php]: https://redirect.sonarsource.com/plugins/php.html
[ggroups]: https://groups.google.com/forum/#!forum/sonarlint
