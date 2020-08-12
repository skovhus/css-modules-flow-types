'use strict';

import printFlowDefinition, {
  getLineSeparator,
} from 'css-modules-flow-types-printer';
import FileSystemLoader from './css-modules/fileSystemLoader';

export default class Converter {
  constructor(rootDir, eol) {
    this.loader = new FileSystemLoader(rootDir);
    this.eol = eol;
  }

  convert(filePath) {
    return new Promise((resolve, reject) => {
      // TODO: benchmark this (maybe this should only be cleared when watching)
      this.loader.tokensByFile = {};

      this.loader
        .fetch(filePath, '/', undefined, undefined)
        .then((res) => {
          if (res) {
            const tokens = Object.keys(res);
            const content = printFlowDefinition(
              tokens,
              this.eol || getLineSeparator(tokens[0])
            );
            resolve(content);
          } else {
            reject(res);
          }
        })
        .catch((err) => reject(err));
    });
  }
}
