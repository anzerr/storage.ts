import Think from 'think.library';
export default class Cache {
    private _cache;
    think: Think;
    constructor();
    get(key: string): any | null;
    clear(key: string): Cache;
    add(key: string, data: any, timeout?: number): Cache;
    auto(key: string, cd: () => Promise<any> | any, n?: number): Promise<any>;
}
