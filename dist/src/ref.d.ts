export declare class Ref {
    enum: {
        id: {
            [key: string]: string;
        };
        ref: {
            [key: string]: string;
        };
    };
    prefix: string;
    id: number;
    constructor();
    getRef(id: string | number): string;
    get(ref: string): string;
}
