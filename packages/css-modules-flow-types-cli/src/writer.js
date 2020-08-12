'use strict';

import fs from 'fs';

export default function writeFile(outputFilePath, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(outputFilePath, content, 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(outputFilePath);
      }
    });
  });
}
