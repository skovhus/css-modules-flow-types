/* eslint-env jest */
import printer, { HEADER } from '../index';

describe('printer', () => {
  it('prints given tokens', () => {
    const result = printer(['btn1', 'btn2']);
    expect(result).toBe(
      `${HEADER}
declare module.exports: {|
  +'btn1': string;
  +'btn2': string;
|};
`
    );
  });
});
