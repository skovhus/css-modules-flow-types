'use strict';

import fs from 'fs';
import printFlowDefinition from 'css-modules-flow-types-printer';
import Tokenizer from 'css-selector-tokenizer';

function getTokens(content) {
  const tokens = [];

  // Only `locals` export is desired
  const locals = content.match(/exports\.locals = ([\s\S]*);/);

  if (!locals) return tokens;
  let match;

  // RegExp.exec is state-full, so we need to initialize new one for each run
  const re = /"(.*?)":.*\n/g;
  while ((match = re.exec(locals[1])) !== null) tokens.push(match[1]);

  return tokens;
}

const getAllClassNames = tokens => {
  const names = tokens.nodes.reduce((acc, node) => {
    if (node.type == 'selector') {
      const names = getAllClassNames(node).filter(n => n.type == 'class');
      return acc.concat(names);
    } else if (node.type == 'class') {
      acc.push(node);
    }
    return acc;
  }, []);
  return names;
};

const getCssModuleImport = (resourcePath, content) => {
  if (fs.existsSync(resourcePath)) {
    const cssContents = fs.readFileSync(resourcePath, 'utf8');
    const nodes = getAllClassNames(Tokenizer.parse(cssContents));
    return nodes.map(n => n.name);
  } else {
    return getTokens(content);
  }
};

module.exports = function cssModulesFlowTypesLoader(content) {
  // NOTE: We cannot use .emitFile as people might use this with devServer
  // (e.g. in memory storage).
  const outputPath = this.resourcePath + '.flow';
  const importObj = getCssModuleImport(this.resourcePath, content);
  const output = printFlowDefinition(importObj);
  fs.writeFile(outputPath, output, {}, function() {});

  return content;
};
