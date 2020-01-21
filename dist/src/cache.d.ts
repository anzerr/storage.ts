import Think from 'think.library';
export declare class Cache {
    private _cache;
    think: Think;
    constructor(interval?: number);
    get(key: string): any | null;
    clear(key: string): Cache;
    set(key: string, data: any, timeout?: number): Cache;
    add(key: string, data: any, timeout?: number): Cache;
    auto(key: string, cd: () => Promise<any> | any, n?: number): Promise<any>;
    close(): void;
}
