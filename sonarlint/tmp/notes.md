### Package development

- Generate package using command (control shift p)
  - Creates a folder with basic files
  - Registers the folder in ~/.atom/packages

- Change the implemented methods, especially activation
  - Understand the steps performed during the startup of a package
  - See http://flight-manual.atom.io/hacking-atom/sections/package-word-count/

- Have two windows open, one for dev and one for reloading
  - Reload with `window:reload` command
  - Run tests with `atom --test spec` in the package dir

### Integrating with linter

- What is `consumedServices` in `package.json` ?
  - It seems that it somehow leads to triggering the named function in the package

- The linter can listen to text editor changes and set messages with issue locations that the linter will render appropriately

- Some linter methods:
  - setMessages(path, list)
  - setAllMessages(list)
  - clearMessages

- See http://steelbrain.me/linter/examples/indie-linter-v2.html

### Questions

- How to hook up the linter with language server?
  - Test first by manually running language server and make Atom connect to localhost:port
