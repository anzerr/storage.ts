export declare class Counter {
    _data: {
        [key: string]: {
            value: number;
            time: number;
        }[];
    };
    _duration: {
        [key: string]: number;
    };
    constructor();
    clean(key: string): {
        value: number;
        time: number;
    }[];
    duration(key: string, duration: number): void;
    add(key: string, value: number): void;
    get(key: string): {
        value: number;
        time: number;
    }[];
    reduce(key: string): number;
    all(): {
        [key: string]: {
            value: number;
            time: number;
        }[];
    };
}
