"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const trie_1 = __importDefault(require("./trie"));
function engine() {
    const index = trie_1.default();
    const docs = {};
    return {
        ...index,
        index(indexFields, doc) {
            docs[doc.id] = doc;
            let fields = indexFields.map((v) => doc[v]);
            index.index(fields.join(' '), doc.id);
        },
        search(text) {
            const tokens = index.cut(text);
            if (tokens.length == 0) {
                return [];
            }
            const [first, ...rest] = tokens;
            let intersect = { ...first.docs };
            for (let t of rest) {
                for (let id in intersect) {
                    if (!t.docs[id]) {
                        delete intersect[id];
                    }
                }
            }
            const result = [];
            for (let id in intersect) {
                result.push(docs[id]);
            }
            return result;
        },
    };
}
exports.default = engine;
