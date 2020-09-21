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
        [id: number]: number;
    };
    children: Token[];
    synonyms: Set<Token>;
    constructor(units: string[], freq: number, pos?: string);
}
export default function cutter(): {
    dict(path: string): Promise<void>;
    tokens(): Iterable<Token>;
    cut: (text: string, exceptSelf?: boolean) => Token[];
    fullCut: (text: string) => Token[];
};
