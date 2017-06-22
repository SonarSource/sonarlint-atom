'use babel';

import SonarlintView from './sonarlint-view';
import { CompositeDisposable } from 'atom';

export default {

  sonarlintView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.sonarlintView = new SonarlintView(state.sonarlintViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.sonarlintView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sonarlint:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.sonarlintView.destroy();
  },

  serialize() {
    return {
      sonarlintViewState: this.sonarlintView.serialize()
    };
  },

  toggle() {
    console.log('Sonarlint was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
