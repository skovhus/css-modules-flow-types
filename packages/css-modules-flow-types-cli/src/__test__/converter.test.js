/* eslint-env jest */
import { HEADER } from 'css-modules-flow-types-printer';
import Converter from '../converter';

const converter = new Converter('./fixtures');

it('returns sorted content from simple css', () => {
  return converter.convert('./example.css').then(content => {
    expect(content).toBe(`${HEADER}
declare module.exports: {|
  +'a': string,
  +'my-class': string,
  +'myClass': string,
  +'primary': string,
  +'while': string,
|};
`);
  });
});

it('returns content from empty css files', () => {
  return converter.convert('./empty.css').then(content => {
    expect(content).toBe(`${HEADER}
declare module.exports: {|

|};
`);
  });
});

it('rejects invalid CSS', () => {
  expect.assertions(1);
  return converter.convert('./errorCss.css').catch(err => {
    expect(err.name).toBe('CssSyntaxError');
  });
});

it('returns content from composing css', () => {
  return converter.convert('./composer.css').then(content => {
    expect(content).toBe(`${HEADER}
declare module.exports: {|
  +'root': string,
|};
`);
  });
});

it('returns content from composing css whose has invalid import/composes', () => {
  return converter.convert('./invalidComposer.scss').then(content => {
    expect(content).toBe(`${HEADER}
declare module.exports: {|
  +'myClass': string,
|};
`);
  });
});
