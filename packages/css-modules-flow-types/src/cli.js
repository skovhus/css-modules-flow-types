#!/usr/bin/env node
'use strict';

import path from 'path';

import chalk from 'chalk';
import gaze from 'gaze';
import globby from 'globby';
import meow from 'meow';

import Converter from './converter';
import writeFile from './writer';

const cli = meow(
  {
    description: 'Creates .flow type definition files from CSS Modules files',
    help: `
Usage
  $ css-modules-flow-types <path> [<path>] [options]

path    directory to search for CSS Modules (or concrete files to convert)

Options
  --watch, -w       Run in watch mode
  --extension, -e   File extension (defaults to "css")
    `,
  },
  {
    boolean: ['watch'],
    string: ['_'],
    alias: {
      e: 'extension',
      h: 'help',
      w: 'watch',
    },
  }
);

const main = () => {
  const { watch } = cli.flags;

  if (!cli.input || cli.input.length === 0) {
    return cli.showHelp();
  }

  const extension = cli.flags.extension || 'css';

  const filesList = cli.input.length > 1 ? cli.input : null;
  const filePath = cli.input.length === 1 ? cli.input[0] : null;
  const filesPattern = filePath && path.join(filePath, `**/*.${extension}`);

  const rootDir = process.cwd();
  const converter = new Converter(rootDir);

  function handleFile(filePath) {
    const f = path.resolve(filePath);
    converter
      .convert(f)
      .then(content => {
        const outputFilePath = path.join(f + '.flow');
        return writeFile(outputFilePath, content);
      })
      .then(outputFilePath => {
        console.log('Wrote ' + chalk.green(outputFilePath));
      })
      .catch(reason => console.error(chalk.red('[Error] ' + reason)));
  }

  if (!watch) {
    const files = filesList ? filesList : globby.sync(filesPattern);
    files.forEach(handleFile);
  } else {
    if (!filePath) {
      console.error(
        chalk.red(`Watch mode requires a single path... Not ${filesList}`)
      );
      return;
    }
    gaze(filesPattern, function(err, files) {
      this.on('changed', handleFile);
      this.on('added', handleFile);
    });
  }
};

main();
