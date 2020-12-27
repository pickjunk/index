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

  const tokens = c.fullCut('保时捷 Cayenne');
  t.deepEqual(tokens.map(v => v.text), [
    '保时捷cayenne', '保时捷',
    '保', '时',
    '捷', 'porsche',
    'cayenne', '保时捷卡宴',
    '卡', '宴',
    '保时捷凯宴', '凯',
    'porsche cayenne', 'porsche卡宴',
    'porsche凯宴'
  ]);
});

test('trie stop word', async t => {
  const c = trie();
  await c.dict(path.resolve(__dirname, './dict/car.txt'));

  const tokens = c.fullCut('保时捷 Cayenne');
  t.deepEqual(tokens.map(v => v.text), [
    '保时捷cayenne', '保时捷',
    '保', '时',
    '捷', 'porsche',
    'cayenne', '保时捷卡宴',
    '卡', '宴',
    '保时捷凯宴', '凯',
    'porsche cayenne', 'porsche卡宴',
    'porsche凯宴'
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

  const r2 = c.fullCut('百度网站').map(token => token.text);
  t.deepEqual(r2, [
    '百度网站', '百度',
    '百', '度',
    'baidu', 'baidu.com',
    'seo', '莆田',
    '莆', '田',
    '.', 'com',
    '网', '站',
    '百度图片', '图',
    '片', 'baidu网站',
    'baidu.com网站', 'seo网站',
    '莆田网站', 'baidu图片',
    'baidu.com图片', 'seo图片',
    '莆田图片'
  ]);
});
