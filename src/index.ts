import trie from './trie';

export interface Doc {
  id: any;
  [key: string]: any;
}

export default function engine() {
  const index = trie();
  const docs: {
    [id: string]: {
      id: string;
      [key: string]: any;
    };
  } = {};

  return {
    ...index,
    index(indexFields: string[], doc: Doc) {
      docs[doc.id] = doc;

      let fields = indexFields.map((v) => doc[v]);
      index.index(fields.join(' '), doc.id);
    },
    search(text: string): Doc[] {
      const tokens = index.cut(text);
      if (tokens.length == 0) {
        return [];
      }

      const [first, ...rest] = tokens;

      let intersect: {
        [id: string]: number;
      } = { ...first.docs };
      for (let t of rest) {
        for (let id in intersect) {
          if (!t.docs[id]) {
            delete intersect[id];
          }
        }
      }

      const result: Doc[] = [];
      for (let id in intersect) {
        result.push(docs[id]);
      }

      return result;
    },
  };
}
