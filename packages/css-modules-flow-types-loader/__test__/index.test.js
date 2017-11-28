/* eslint-env jest */
jest.mock('fs');

import fs from 'fs';
import { HEADER } from 'css-modules-flow-types-printer';
import loader from '../index';

const getStyleLoaderOutput = (exports = '') => `
// imports


// module
exports.push([module.id, ".btn__app-components-Page-styles__2BmYx {\n  background: #FFF;\n}\n", "", {"version":3,"sources":["/./app/components/Page/styles.css"],"names":[],"mappings":"AAAA;EACE,iBAAiB;CAClB","file":"styles.css","sourcesContent":[".btn {\n  background: #FFF;\n}\n"],"sourceRoot":"webpack://"}]);

// exports
${exports}
`;

const STYLE_LOADER_OUTPUT = getStyleLoaderOutput(`
exports.locals = {
"btn": "btn__app-components-Page-styles__2BmYx"
};
`);

const STYLE_LOADER_OUTPUT_WITH_JS = getStyleLoaderOutput(`
exports.locals = {
"foo": "bar" + require("-!css-loader!styles/baz.scss").locals["xyz"] + "",
"foo2": "bar" + new String('lorem lipsum') + ""
};
`);

const EMPTY_STYLE_LOADER_OUTPUT = getStyleLoaderOutput();

describe('webpack loader', () => {
  beforeEach(() => {
    fs.writeFile.mockReset();
  });

  it('emits a css.flow file for a non-empty CSS file', () => {
    loader.call(
      {
        resourcePath: 'test.css',
      },
      STYLE_LOADER_OUTPUT
    );

    expect(fs.writeFile.mock.calls.length).toBe(1);
    expect(fs.writeFile.mock.calls[0][0]).toBe('test.css.flow');

    expect(fs.writeFile.mock.calls[0][1]).toBe(
      `${HEADER}
declare module.exports: {|
  +'btn': string;
|};
`
    );
  });

  it('emits a css.flow file for an empty css file', () => {
    loader.call(
      {
        resourcePath: 'test.css',
      },
      EMPTY_STYLE_LOADER_OUTPUT
    );

    expect(fs.writeFile.mock.calls.length).toBe(1);
    expect(fs.writeFile.mock.calls[0][1]).toBe(
      `${HEADER}
declare module.exports: {|

|};
`
    );
  });

  it('does not emit a css.flow file if the file exists and has the same contents', () => {
    fs.existsSync.mockImplementationOnce(
      filePath => filePath === 'test.css.flow'
    );

    loader.call(
      {
        resourcePath: 'test.css',
      },
      STYLE_LOADER_OUTPUT
    );

    expect(fs.writeFile.mock.calls.length).toBe(0);
  });

  it('emits a css.flow file if the file exists and has the different contents', () => {
    fs.existsSync.mockImplementationOnce(
      filePath => filePath === 'test.css.flow'
    );

    fs.readFile.mockImplementationOnce((filePath, opts, cb) => {
      if (filePath === 'test.css.flow') {
        cb(null, 'Other content');
      }
    });
    loader.call(
      {
        resourcePath: 'test.css',
      },
      STYLE_LOADER_OUTPUT
    );

    expect(fs.writeFile.mock.calls.length).toBe(1);
    expect(fs.writeFile.mock.calls[0][0]).toBe('test.css.flow');

    expect(fs.writeFile.mock.calls[0][1]).toBe(
      `${HEADER}
declare module.exports: {|
  +'btn': string;
|};
`
    );
  });

  it('returns same content as given', () => {
    const emitFile = jest.fn();
    const returnedContent = loader.call(
      {
        resourcePath: 'test.css',
        emitFile,
      },
      STYLE_LOADER_OUTPUT
    );
    expect(returnedContent).toBe(STYLE_LOADER_OUTPUT);
  });

  it('does not fail on arbitrary javascript in the ICSS value', () => {
    loader.call({ resourcePath: 'test.css' }, STYLE_LOADER_OUTPUT_WITH_JS);

    expect(fs.writeFile.mock.calls[0][1]).toBe(
      `${HEADER}
declare module.exports: {|
  +'foo': string;
  +'foo2': string;
|};
`
    );
  });
});
