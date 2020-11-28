export interface Doc {
    id: any;
    [key: string]: any;
}
export default function engine(): {
    index(indexFields: string[], doc: Doc): void;
    search(text: string): Doc[];
    dict(path: string): Promise<void>;
    tokens(): Iterable<import("./trie").Token>;
    findToken: (text: string) => import("./trie").Token | undefined;
    cut: (text: string, exceptSelf?: boolean) => import("./trie").Token[];
    fullCut: (text: string) => import("./trie").Token[];
};
