'use strict';

import fs from 'fs';
import printFlowDefinition from 'css-modules-flow-types-printer';

function getTokens(content) {
  const cssTokens = content.replace(/\s/g, '').match('exports.locals=(.*);');
  if (cssTokens) {
    return JSON.parse(cssTokens[1]);
  }
  return null;
}

module.exports = function cssModulesFlowTypesLoader(content) {
  const tokens = getTokens(content);
  if (tokens) {
    // NOTE: We cannot use .emitFile as people might use this with devServer
    // (e.g. in memory storage).
    const outputPath = this.resourcePath + '.flow';
    fs.writeFile(outputPath, printFlowDefinition(tokens), {}, function() {});
  }
  return content;
};
