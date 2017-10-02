'use babel';

import { CompositeDisposable } from 'atom';

function getRowsFromCursor(selection) {
  const editor = atom.workspace.getActiveTextEditor();
  const { row } = selection.start;

  const buffer = editor.getBuffer();

  const currentLine = buffer.lineForRow(row);

  // get current line's indentation characters
  const indentation = (currentLine.match(/(^\s+)/) || [''])[0];
  const indentationRE = new RegExp(`^${indentation}\\S`);

  let firstRow = row;
  let lastRow = row;

  // get first row of the indentation group
  for (let i = row - 1; i >= 0; i--) {
    if (buffer.isRowBlank(i) || !indentationRE.test(buffer.lineForRow(i))) {
      break;
    }
    firstRow = i;
  }

  // get last row of the indentation group
  for (let i = row + 1; i < buffer.getLineCount(); i++) {
    if (buffer.isRowBlank(i) || !indentationRE.test(buffer.lineForRow(i))) {
      break;
    }
    lastRow = i;
  }

  return { firstRow, lastRow };
}

function getRowsFromSelection(selection) {
  return { firstRow: selection.start.row, lastRow: selection.end.row };
}

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.commands.add('atom-text-editor', {
        'sort-indentation-group:sort': () => this.sort(),
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  sort() {
    const editor = atom.workspace.getActiveTextEditor();

    if (!editor) return;

    // Save the cursor position so that we can reset to this after sorting.
    const cursorPosition = editor.getCursorBufferPosition();

    const buffer = editor.getBuffer();
    const selection = editor.getSelectedBufferRange();

    const getRows = selection.isEmpty()
      ? getRowsFromCursor
      : getRowsFromSelection;

    const { firstRow, lastRow } = getRows(selection);

    const lines = [];
    for (let i = firstRow; i <= lastRow; i++) {
      lines.push(buffer.lineForRow(i));
    }

    lines.sort((a, b) => {
      a = a.toLowerCase();
      b = b.toLowerCase();
      return a < b ? -1 : a > b ? 1 : 0;
    });

    const range =
      buffer.rangeForRow(firstRow).union(buffer.rangeForRow(lastRow));

    buffer.setTextInRange(range, lines.join('\n'));

    editor.setCursorBufferPosition(cursorPosition);
  }
};
