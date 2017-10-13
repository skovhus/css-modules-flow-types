'use strict';

import printFlowDefinition from 'css-modules-flow-types-printer';
import FileSystemLoader from './css-modules/fileSystemLoader';

export default class Converter {
  constructor(rootDir) {
    this.loader = new FileSystemLoader(rootDir);
  }

  convert(filePath) {
    return new Promise((resolve, reject) => {
      // TODO: benchmark this (maybe this should only be cleared when watching)
      this.loader.tokensByFile = {};

      this.loader
        .fetch(filePath, '/', undefined, undefined)
        .then(res => {
          if (res) {
            const content = printFlowDefinition(Object.keys(res));
            resolve(content);
          } else {
            reject(res);
          }
        })
        .catch(err => reject(err));
    });
  }
}
