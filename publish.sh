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

yarn lerna publish

git tag -a "${tag}" -m "${tag}"
git push origin "${tag}"
