const test = require('ava');
const path = require('path');
const engine = require('../lib/index').default;

const docs = [{
  id: '1',
  title: '百度真的不行',
  desc: '搜东西搜不出来'
}, {
  id: '2',
  title: '百度莆田',
  desc: '倒是很多结果'
}, {
  id: '3',
  title: '我是中国人',
  desc: '浓度过高'
}, {
  id: '4',
  title: '分词不在词库中',
  desc: '默认全分词，组合几个字也可以搜到'
}]

test('engine search text', async t => {
  const e = engine();
  await e.dict(path.resolve(__dirname, './dict/doc.txt'));

  for (let doc of docs) {
    e.index(['title'], doc);
  }

  t.deepEqual(e.search('baidu'), [{
    id: '1',
    title: '百度真的不行',
    desc: '搜东西搜不出来'
  }, {
    id: '2',
    title: '百度莆田',
    desc: '倒是很多结果'
  }]);

  t.deepEqual(e.search('百度莆田'), [{
    id: '2',
    title: '百度莆田',
    desc: '倒是很多结果'
  }]);

  t.deepEqual(e.search('我'), [{
    id: '3',
    title: '我是中国人',
    desc: '浓度过高'
  }]);

  t.deepEqual(e.search('谷歌'), []);

  t.deepEqual(e.search('词在中'), [{
    id: '4',
    title: '分词不在词库中',
    desc: '默认全分词，组合几个字也可以搜到'
  }]);
});
