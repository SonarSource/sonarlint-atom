Development notes
=================

Working on this package
-----------------------

### General tips

- Install dependencies with `apm install`
- Create a symlink to `~/.atom/dev/packages` using `apm link --dev`
- Open your regular Atom for development
- Open a second Atom in dev mode (Application: Open Dev command) for a preview of your changes
- To try the changes, reload the dev window with `window:reload` command (`control shift F5` in Linux)
- See also: http://flight-manual.atom.io/hacking-atom/sections/debugging/

Hacking atom-languageclient
---------------------------

Replace `node_modules/atom-languageclient` with your Git clone.

To try the changes in Atom, run `npm install`, and reload the dev window.

Run the tests with `npm run test`.

The upstream GitHub project (to contribute changes) is at `atom/atom-languageclient`.

You can enable debug logs with:

    atom.config.set('core.debugLSP', true)

Packaging, publishing
---------------------

### Build

    npm install

### Execute tests

    atom --test spec

### Test installation from personal repo

    apm install gh-user/repo

### Publish

Verify `package.json` content, especially version.

    apm publish minor

See also: http://flight-manual.atom.io/hacking-atom/sections/publishing/

Misc
----

### Lifecycle of a package

This document explains nicely the steps performed during the startup of a package:

http://flight-manual.atom.io/hacking-atom/sections/package-word-count/

### Generate clean new package

It can be helpful sometimes to start clean.

- Generate package using command (`control shift p`)
  - Creates a folder with basic files
  - Registers the folder in ~/.atom/packages
