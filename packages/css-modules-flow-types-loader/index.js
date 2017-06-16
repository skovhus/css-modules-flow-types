'use strict';

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
    this.emitFile(this.resourcePath + '.flow', printFlowDefinition(tokens));
  }
  return content;
};
