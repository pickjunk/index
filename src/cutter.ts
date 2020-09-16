import fs from 'fs';
import readline from 'readline';

export class Node {
  token?: Token;

  children: {
    [unit: string]: Node;
  } = {};
  fail?: Node;
}

export class Token {
  text: string;
  units: string[];
  freq: number;
  pos: string;

  distance: number = 0;
  docs: {
    [id: number]: number;
  } = {};
  children: Token[] = [];
  synonyms: Set<Token> = new Set();

  constructor(units: string[], freq: number, pos?: string) {
    this.text = join(units);
    this.units = units;
    this.freq = freq;
    this.pos = pos || '';
  }
}

// 切分字元
// 字元是查字典的基本单位，英文单词、连续数字、其他语言（中文）单字
function split(text: string): string[] {
  let pieces = text.match(/[a-zA-Z]+|[0-9]+|[^a-zA-Z0-9]/g) || [];

  // 过滤掉空格
  pieces = pieces.filter((v) => v != ' ');

  // 英文统一小写
  pieces = pieces.map((v) => v.toLocaleLowerCase());

  return pieces;
}

// 从字元重新拼装为字符串
function join(units: string[]) {
  let result = '';

  for (let unit of units) {
    if (/[a-zA-Z]/.test(unit)) {
      result += ' ' + unit;
    } else if (/[0-9]/.test(unit)) {
      result += ' ' + unit;
    } else {
      result += unit;
    }
  }

  return result.trim();
}

export default function cutter() {
  // 词典根节点
  const root = new Node();
  // 总词频
  let totalFreq = 0;

  function addToken(token: Token) {
    let node = root;
    for (let unit of token.units) {
      if (!node.children[unit]) {
        node.children[unit] = new Node();
      }
      node = node.children[unit];
    }
    node.token = token;
  }

  function findToken(text: string) {
    const units = split(text);

    let node = root;
    for (let unit of units) {
      if (!node.children[unit]) {
        return;
      }
      node = node.children[unit];
    }

    return node.token;
  }

  function* tokens(node: Node): Iterable<Token> {
    for (let unit in node.children) {
      const child = node.children[unit];
      if (child.token) {
        yield child.token;
      }
      yield* tokens(child);
    }
  }

  // 构建 fail 引用（AC自动机）
  function buildFail() {
    const queue = [root];
    while (queue.length) {
      const curr = queue.shift() as Node;
      for (let unit in curr.children) {
        const child = curr.children[unit];

        let fail = curr.fail;
        while (fail) {
          if (fail.children[unit]) {
            child.fail = fail.children[unit];
            break;
          }
          fail = fail.fail;
        }
        if (!fail) {
          child.fail = root;
        }

        queue.push(child);
      }
    }
  }

  // 计算路径值，算法来自 huichen/sego
  // 解释：log2(总词频/该分词词频)，等于log2(1/p(分词))，即为动态规划中该
  // 分词的路径值。求解prod(p(分词))的最大值，等于求解sum(distance(分词))
  // 的最小值，即为求最短路径
  function calcDistance() {
    const total = Math.log2(totalFreq);
    for (let token of tokens(root)) {
      token.distance = total - Math.log2(token.freq);
    }
  }

  // 分词
  function cut(text: string, exceptSelf = false) {
    const units = split(text);

    if (exceptSelf && units.length == 1) {
      return [];
    }

    // 动态规划中，记录每个字元处的最短路径
    const jumpers: {
      distance: number;
      token?: Token;
    }[] = units.map(() => ({
      distance: 0,
    }));

    let p = root;
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const jumper = jumpers[i];

      // 没有匹配中，且 fail 引用不为空
      // 则一直退到匹配中的节点，或到 root 为止
      while (!p.children[unit] && p.fail) {
        p = p.fail as Node;
      }

      // 有匹配中节点
      if (p.children[unit]) {
        p = p.children[unit];

        // 从这个节点开始，顺着 fail 链找出所有可能的词
        let node = p;
        while (node.fail) {
          if (node.token) {
            const token = node.token;

            // 分词长度就是字元长度，说明整个文本就是该词自身
            const isSelf = token.units.length == units.length;
            // 如果有排除自身的标记，且分到自身，跳过
            if (exceptSelf && isSelf) {
              node = node.fail as Node;
              continue;
            }

            // 该词前一个字元处的最短路径值
            let base = 0;
            if (i >= token.units.length) {
              base = jumpers[i - token.units.length].distance;
            }
            // 动态规划，若存在更短的路径值，更新记录
            if (
              jumper.distance == 0 ||
              jumper.distance > base + token.distance
            ) {
              jumper.distance = base + token.distance;
              jumper.token = token;
            }
          }

          node = node.fail as Node;
        }
      }

      // 如果当前字元处的路径值为零，表明没有匹配到任何分词
      if (jumper.distance == 0) {
        // 没有分词则补加一个伪分词
        const token = new Token([unit], 1);
        token.distance = 32;

        let base = 0;
        if (i > 1) {
          base = jumpers[i - 1].distance;
        }
        jumper.distance = base + token.distance;
        jumper.token = token;
      }
    }

    // 从后往前，找出最短路径的分词方案
    const tokens: Token[] = [];
    for (let i = jumpers.length - 1; i >= 0; ) {
      const token = jumpers[i].token as Token;
      tokens.unshift(token);
      i -= token.units.length;
    }

    return tokens;
  }

  // 全分词，一般用于提升召回率的场景
  // 1. 加入所有子分词
  // 2. 加入同义词
  function fullCut(text: string) {
    const tokens = cut(text);

    const allTokens: Token[] = [];
    for (let token of tokens) {
      const queue = [token];
      while (queue.length) {
        const t = queue.shift() as Token;
        allTokens.push(...t.synonyms);
        queue.push(...t.synonyms);
        allTokens.push(...t.children);
        queue.push(...t.children);
      }
    }
    return allTokens;
  }

  return {
    async dictionary(path: string) {
      // read line by line
      // https://nodejs.org/api/readline.html#readline_example_read_file_stream_line_by_line
      const rl = readline.createInterface({
        input: fs.createReadStream(path),
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        // 同义词
        const synonyms: Set<Token> = new Set();

        line
          .replace(/\s+/g, ' ')
          .trim()
          .split('|')
          .forEach((v) => {
            let [pos, freq, ...text] = v.trim().split(' ').reverse();
            if (!isNaN(Number(pos))) {
              text.unshift(freq);
              freq = pos;
              pos = '';
            }

            const word = text.reverse().join(' ');
            const units = split(word);
            const token = new Token(units, Number(freq), pos);
            synonyms.add(token);
            // 注意同义词表是包含自己的
            token.synonyms = synonyms;

            addToken(token);

            totalFreq += Number(freq);
          });

        buildFail();
        calcDistance();

        for (let token of tokens(root)) {
          // 预先切好子分词，用于全分词时快速分词
          token.children = cut(token.text, true);

          // 遍历子分词的同义词，通过笛卡尔积构建所有可能存在的同义词
          let synonyms = new Set([new Token([], token.freq, token.pos)]);
          for (let c of token.children) {
            const cartesian: Set<Token> = new Set();

            for (let a of synonyms) {
              for (let b of c.synonyms) {
                cartesian.add(
                  new Token([...a.units, ...b.units], token.freq, token.pos),
                );
              }
            }

            synonyms = cartesian;
          }

          // 更新旧词或新词的同义词表
          for (let token of synonyms) {
            let found = findToken(token.text);
            if (found) {
              // 旧词
              synonyms.delete(token);
              for (let s of found.synonyms) {
                synonyms.add(s);
                s.synonyms = synonyms;
              }
            } else {
              // 新词
              token.children = cut(token.text, true);
              token.synonyms = synonyms;
              addToken(token);
            }
          }
        }

        // 有可能加入了新词，这里再构建多一次
        buildFail();
        calcDistance();
      }
    },
    tokens() {
      return tokens(root);
    },
    cut,
    fullCut,
  };
}
