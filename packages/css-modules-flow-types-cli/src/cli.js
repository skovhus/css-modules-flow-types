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
  --silent, -s      Silences all output except errors
    `,
    inferType: true,
  },
  {
    flags: {
      _: {
        type: 'string',
      },
      extension: {
        alias: 'e',
      },
      help: {
        alias: 'h',
      },
      silent: {
        alias: 's',
        type: 'boolean',
      },
      watch: {
        alias: 'w',
        type: 'boolean',
      },
    },
  }
);

function detectDanlingFlowFiles(filesPattern, cssFiles) {
  const flowFiles = globby.sync(filesPattern + '.flow');
  const cssFilesSet = new Set(cssFiles);
  const danglingFlowFiles = flowFiles.filter(
    (f) => !cssFilesSet.has(f.replace('.flow', ''))
  );

  if (danglingFlowFiles.length > 0) {
    console.error(
      chalk.red(
        `Detected ${danglingFlowFiles.length} dangling .flow file(s), that can be removed:`
      )
    );
    danglingFlowFiles.forEach((f) => {
      console.error(chalk.red(`- ${f}`));
    });
  }
}

const main = () => {
  const { watch, silent } = cli.flags;

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
      .then((content) => {
        const outputFilePath = path.join(f + '.flow');
        return writeFile(outputFilePath, content);
      })
      .then((outputFilePath) => {
        if (!silent) {
          console.log('Wrote ' + chalk.green(outputFilePath));
        }
      })
      .catch((reason) => console.error(chalk.red('[Error] ' + reason)));
  }

  if (!watch) {
    const cssFiles = filesList ? filesList : globby.sync(filesPattern);
    cssFiles.forEach(handleFile);

    if (!filesList) {
      detectDanlingFlowFiles(filesPattern, cssFiles);
    }
  } else {
    if (!filePath) {
      console.error(
        chalk.red(`Watch mode requires a single path... Not ${filesList}`)
      );
      return;
    }
    gaze(filesPattern, function (err, files) {
      this.on('changed', handleFile);
      this.on('added', handleFile);
    });
  }
};

main();
