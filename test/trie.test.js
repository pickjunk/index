const test = require('ava');
const path = require('path');
const trie = require('../lib/trie').default;

test('trie cut tokens', async t => {
  const c = trie();
  await c.dict(path.resolve(__dirname, './dict/car.txt'));

  const tokens = c.cut('保时捷 Cayenne Cayenne S Coupé 2020 2.9L 手自一体变速箱(AT) 8档');
  t.deepEqual(tokens.map(v => v.text), [
    '保时捷cayenne', 'cayenne',
    's', 'coup',
    'é', '2020',
    '2.9 l', '手自一体',
    '变', '速',
    '箱', 'at',
    '8', '档'
  ]);
});

test('trie cut tokens fully', async t => {
  const c = trie();
  await c.dict(path.resolve(__dirname, './dict/car.txt'));

  const r = c.fullCut('保时捷 Cayenne').map(v => v.text);
  // console.log(r);
  t.deepEqual(r, [
    '保时捷cayenne', '保时捷卡宴',
    '保时捷凯宴', 'porsche cayenne',
    'porsche卡宴', 'porsche凯宴',
    '保时捷', 'porsche',
    '保', '时',
    '捷', 'cayenne',
    '卡', '宴',
    '凯'
  ]);
});

test('trie stop word', async t => {
  const c = trie();
  await c.dict(path.resolve(__dirname, './dict/car.txt'));

  const r = c.fullCut('保时捷 Cayenne').map(v => v.text);
  // console.log(r);
  t.deepEqual(r, [
    '保时捷cayenne', '保时捷卡宴',
    '保时捷凯宴', 'porsche cayenne',
    'porsche卡宴', 'porsche凯宴',
    '保时捷', 'porsche',
    '保', '时',
    '捷', 'cayenne',
    '卡', '宴',
    '凯'
  ]);
});

test('trie complicated synonyms', async t => {
  const c = trie();
  await c.dict(path.resolve(__dirname, './dict/synonym.txt'));

  const r = [];
  c.findToken('baidu').synonyms.forEach(token => r.push(token.text));
  t.deepEqual(r, ['百度', 'baidu', 'baidu.com', 'seo', '莆田']);

  const r1 = [];
  c.findToken('百度网站').synonyms.forEach(token => r1.push(token.text));
  t.deepEqual(r1, [
    '百度网站',
    '百度图片',
    'baidu网站',
    'baidu.com网站',
    'seo网站',
    '莆田网站',
    'baidu图片',
    'baidu.com图片',
    'seo图片',
    '莆田图片'
  ]);

  const r2 = c.fullCut('自动变速器').map(token => token.text);
  // console.log(r2);
  t.deepEqual(r2, [
    '自动', '自动变速',
    '自动变速器', '自动变速箱',
    'at', '手自一体',
    '自', '动',
    '变', '速',
    '器', '箱',
    '手', '一',
    '体'
  ]);
});
