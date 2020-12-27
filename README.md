# lookup

微型 nodejs 中文全文搜索引擎

### 快速启动

```javascript
import lookup from '@pickjunk/lookup';

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

async function main() {
  // 实例化引擎
  const engine = lookup();
  // 加载词库
  await engine.dict('./dict.txt');

  // 进行文章索引
  for (let doc of docs) {
    engine.index(['title'], doc);
  }
  
  console.log(engine.search('baidu'));
  // [{
  //  id: '1',
  //  title: '百度真的不行',
  //  desc: '搜东西搜不出来'
  // }, {
  //  id: '2',
  //  title: '百度莆田',
  //  desc: '倒是很多结果'
  // }]
  
  console.log(engine.search('百度莆田'));
  // [{
  //  id: '2',
  //  title: '百度莆田',
  //  desc: '倒是很多结果'
  // }]
  
  console.log(engine.search('我'));
  // [{
  //  id: '3',
  //  title: '我是中国人',
  //  desc: '浓度过高'
  // }]
  
  console.log(engine.search('谷歌'));
  // []
  
  console.log(e.search('词在中'));
  // [{
  //  id: '4',
  //  title: '分词不在词库中',
  //  desc: '默认全分词，组合几个字也可以搜到'
  // }]
}

main();
```

```
// 词库 ./dict.txt
百度 2 brand|baidu 2 brand
baidu 莆田 2 desc
我是中国人 2 brand
```

### API

代码以 typescript 写就，具体 API 可看编辑器的补全提示

### 特性

* 支持同义词，在词库中同一行，用 | 分隔的多个词即为同义词
* 支持词组的同义词联想，例如词典中定义了 `百度` 和 `baidu` 为同义词，又定义了 `百度网站` 这个词，则引擎在构建字典树索引的时候，会自动生成一个 `baidu网站` 的词，作为 `百度网站` 的同义词
* 默认全分词，零词典也能进行文章索引
