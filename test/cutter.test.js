const test = require('ava');
const path = require('path');
const cutter = require('../lib/cutter').default;

test('cut', async t => {
  const c = cutter();
  await c.dictionary(path.resolve(__dirname, './dict/brand.txt'));
  await c.dictionary(path.resolve(__dirname, './dict/series.txt'));
  // for (let token of c.tokens()) {
  //   console.log(token.text);
  // }

  const tokens = c.cut('保时捷 Cayenne Cayenne S Coupé 2020 2.9L 手自一体变速箱(AT) 8档');
  console.log(tokens.map(v => v.text));
});