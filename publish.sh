#!/usr/bin/env bash

set -euo pipefail

version=$(cat lerna.json | jq -r .version)
tag="v${version}"

publishedVersion=$(yarn info css-modules-flow-types-cli --json | jq -r .data.\"dist-tags\".latest)

if [ "$version" = "$publishedVersion" ]; then
    echo "Newest version is already deployed."
    exit 0
fi

yarn install
yarn run verify:bail

# Until we enforce semantic commits (and can use lerna publish), we need to publish in the right order
cd packages/css-modules-flow-types-printer && npm publish && cd ../../
cd packages/css-modules-flow-types-cli && npm publish && cd ../../
cd packages/css-modules-flow-types-loader && npm publish && cd ../../

git tag -a "${tag}" -m "${tag}"
git push origin "${tag}"
