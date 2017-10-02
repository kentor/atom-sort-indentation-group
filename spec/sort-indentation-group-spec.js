describe('SortIndentationGroup', () => {
  let activationPromise;
  let editor;
  let editorView;

  function sort(callback) {
    atom.commands.dispatch(editorView, 'sort-indentation-group:sort');
    waitsForPromise(() => activationPromise);
    runs(callback);
  }

  function test(input, cursorPosition, output) {
    it(`input ${input}, cursorPosition: ${cursorPosition}, output: ${output}`, () => {
      editor.setText(input);
      editor.setCursorBufferPosition(cursorPosition);
      sort(() => {
        expect(editor.getText()).toBe(output);
        expect(editor.getCursorBufferPosition()).toEqual({
          row: cursorPosition[0],
          column: cursorPosition[1],
        })
      });
    });
  }

  beforeEach(() => {
    waitsForPromise(() => atom.workspace.open());
    runs(() => {
      editor = atom.workspace.getActiveTextEditor();
      editorView = atom.views.getView(editor);
      activationPromise = atom.packages.activatePackage('sort-indentation-group');
    });
  });

  describe('sort', () => {
    test(
      [
        'c',
        '',
        'b',
        'ab',
      ].join('\n'),
      [2, 0],
      [
        'c',
        '',
        'ab',
        'b',
      ].join('\n')
    );

    test(
      [
        'c',
        '',
        'b',
        'ab',
      ].join('\n'),
      [3, 0],
      [
        'c',
        '',
        'ab',
        'b',
      ].join('\n')
    );

    test(
      [
        '  b',
        '  a',
        '    c',
        '    b',
      ].join('\n'),
      [0, 0],
      [
        '  a',
        '  b',
        '    c',
        '    b',
      ].join('\n')
    );

    test(
      [
        '  b',
        '  a',
        '    c',
        '    b',
      ].join('\n'),
      [3, 0],
      [
        '  b',
        '  a',
        '    b',
        '    c',
      ].join('\n')
    );
  });
});
