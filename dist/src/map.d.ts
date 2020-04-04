import Think from 'think.library';
import { Ref } from './ref';
import { PoolCounter } from './pool';
declare const events: any;
declare class MapData {
    node: {
        [key: string]: [string, number, number];
    };
    edge: {
        [key: string]: {
            [key: string]: [number, number];
        };
    };
}
declare class NetworkMapConfig {
    timeout: number;
    interval: number;
}
export declare class NetworkMap extends events {
    ref: Ref;
    think: Think;
    pool: {
        node: PoolCounter;
        edge: PoolCounter;
    };
    config: NetworkMapConfig;
    constructor(config: NetworkMapConfig);
    drain(): void;
    add(from: string, to: string, value: number): NetworkMap;
    get(): MapData;
    close(): void;
}
export {};
