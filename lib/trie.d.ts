export declare class Node {
    token?: Token;
    children: {
        [unit: string]: Node;
    };
    fail?: Node;
}
export declare class Token {
    text: string;
    units: string[];
    freq: number;
    pos: string;
    distance: number;
    docs: {
        [id: string]: number;
    };
    synonyms: Set<Token>;
    constructor(units: string[], freq: number, pos?: string);
}
export default function cutter(): {
    dict(path: string): Promise<void>;
    tokens(): Iterable<Token>;
    findToken: (text: string) => Token | undefined;
    cut: (text: string, exceptSelf?: boolean) => Token[];
    fullCut: (text: string) => Token[];
    index(text: string, id: string): void;
};
