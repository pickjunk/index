const test = require('ava');
const path = require('path');
const cutter = require('../lib/trie').default;

test('trie cut tokens', async t => {
  const c = cutter();
  await c.dict(path.resolve(__dirname, './dict/car.txt'));

  const tokens = c.cut('保时捷 Cayenne Cayenne S Coupé 2020 2.9L 手自一体变速箱(AT) 8档');
  t.deepEqual(tokens.map(v => v.text), [
    '保时捷 cayenne', 'cayenne',
    's', 'coup',
    'é', '2020',
    '2. 9 l', '手自一体',
    '变', '速',
    '箱', 'at',
    '8', '档'
  ]);
});

test('trie cut tokens fully', async t => {
  const c = cutter();
  await c.dict(path.resolve(__dirname, './dict/car.txt'));

  const tokens = c.fullCut('保时捷 Cayenne');
  t.deepEqual(tokens.map(v => v.text), [
    'porsche凯宴', '保时捷', '保',
    '时', '捷', 'porsche',
    '凯', '宴', 'porsche卡宴',
    '保时捷', '保', '时',
    '捷', 'porsche', '卡',
    '宴', 'porsche cayenne', '保时捷',
    '保', '时', '捷',
    'porsche', 'cayenne', '保时捷 cayenne',
    '保时捷', '保', '时',
    '捷', 'porsche', 'cayenne',
    '保时捷卡宴', '保时捷', '保',
    '时', '捷', 'porsche',
    '卡', '宴', '保时捷凯宴',
    '保时捷', '保', '时',
    '捷', 'porsche', '凯',
    '宴'
  ]);
});

test('trie stop word', async t => {
  const c = cutter();
  await c.dict(path.resolve(__dirname, './dict/car.txt'));

  const tokens = c.fullCut('保时捷 Cayenne');
  t.deepEqual(tokens.map(v => v.text), [
    'porsche凯宴', '保时捷', '保',
    '时', '捷', 'porsche',
    '凯', '宴', 'porsche卡宴',
    '保时捷', '保', '时',
    '捷', 'porsche', '卡',
    '宴', 'porsche cayenne', '保时捷',
    '保', '时', '捷',
    'porsche', 'cayenne', '保时捷 cayenne',
    '保时捷', '保', '时',
    '捷', 'porsche', 'cayenne',
    '保时捷卡宴', '保时捷', '保',
    '时', '捷', 'porsche',
    '卡', '宴', '保时捷凯宴',
    '保时捷', '保', '时',
    '捷', 'porsche', '凯',
    '宴'
  ]);
});