import * as React from 'react';

// IE mapping
var key_mapping: { [key: string]: string } = {
  'SPACEBAR': ' ',
  'UP': 'ArrowUP',
  'DOWN': 'ArrowDown',
  'LEFT': 'ArrowLeft',
  'RIGHT': 'ArrowRight',
  'DEL': 'Delete',
  'MULTIPLY': '*',
  'DIVIDE': '/',
  'SUBTRACT': '-',
  'ADD': '+'
};
function ie_key_fix(e: React.KeyboardEvent<HTMLTextAreaElement>): string {
  var key = e.key.toUpperCase();
  if (key_mapping[key]) {
    return key_mapping[key];
  }
  return key;
}
function get_key(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key) {
    var key = ie_key_fix(e).toUpperCase();
    if (key === 'CONTROL') {
      return 'CTRL';
    } else {
      var combo = [];
      if (e.ctrlKey) {
        combo.push('CTRL');
      }
      if (e.metaKey && key !== 'META') {
        combo.push('META');
      }
      if (e.shiftKey && key !== 'SHIFT') {
        combo.push('SHIFT');
      }
      if (e.altKey && key !== 'ALT') {
        combo.push('ALT');
      }
      if (combo.length && key === ' ') {
        key = 'SPACEBAR';
      }
      if (e.key) {
        combo.push(key);
      }
      return combo.join('+');
    }
  }
  return '';
}

export type KeymapT = {
  [key: string]: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
};

export function withHokey(keymap: KeymapT = {}) {
  return function(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const key = get_key(e);
    if (keymap[key]) {
      keymap[key](e);
    }
  };
}
