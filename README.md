# css-modules-flow-types [![Build Status](https://travis-ci.org/skovhus/css-modules-flow-types.svg?branch=master)](https://travis-ci.org/skovhus/css-modules-flow-types)

CLI and Webpack loader for creating [Flow](https://flow.org/) type definitions based on [CSS Modules](https://github.com/css-modules/css-modules) files.

This gives you:
- auto-completing for css files in most editors
- flow type safety showing usage of non existing classes

Read more the background in the medium blog post ["Type safe CSS Modules with Flow"](https://hackernoon.com/type-safe-css-modules-with-flow-dd95e761bbe5).

## Example

Given the following css file using CSS Modules:
```css
@value primary: red;

.myClass {
  color: primary;
}
```

`css-modules-flow-types` creates the following .flow file next to it:

```javascript
// @flow
/* This file is automatically generated by css-modules-flow-types */
declare module.exports: {|
  +'myClass': string;
  +'primary': string;
|};
```

## Usage (Webpack loader)

The `css-modules-flow-types-loader` need to be added right after after `style-loader`:

```sh
$ npm install --dev css-modules-flow-types-loader
$ yarn install -D css-modules-flow-types-loader
```

```javascript
{
  test: /\.css$/,  // or the file format you are using for your CSS Modules
  use: [
    'style-loader',
    'css-modules-flow-types-loader',
    // Other loaders like css-loader after this:
    {
      ...
    }
  ]
}
```


## Usage (CLI)

```sh
$ npm install --dev css-modules-flow-types-cli
$ yarn install -D css-modules-flow-types-cli
```

This installs the runner as `css-modules-flow-types`.

And run `css-modules-flow-types <input directory or glob>` command.

For example, if you have .css files under `src` directory, exec the following:

Running,

```sh
css-modules-flow-types src
```

Creates `*.css.flow` files next to all css files.

```text
(your project root)
- src/
    | myStyle.css
    | myStyle.css.flow [created]
```

## Inspiration

- https://github.com/Quramy/typed-css-modules
- https://github.com/Jimdo/typings-for-css-modules-loader


## Contributing

To get started, run:

	yarn

When developing:

	yarn run check  # (runs lint and unit test)
	yarn run lint
	yarn run test
	yarn run test:cov
	yarn run test:watch


## License
This software is released under the MIT License.
