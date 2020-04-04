import { Counter } from './counter';
import Think from 'think.library';
declare class PoolCounterConfig {
    timeout: number;
    interval?: number;
    drain?: (any: any) => void;
}
export declare class PoolCounter {
    pool: {
        keys: {
            [key: string]: number;
        };
        valid: {
            [key: string]: number;
        };
        shard: {
            [key: string]: string;
        };
    };
    counter: Counter;
    think: Think;
    config: PoolCounterConfig;
    constructor(config: PoolCounterConfig);
    drain(): [number, {
        [key: string]: any;
    }];
    add(shard: string, key: string, value: number): PoolCounter;
    get(): {
        [key: string]: {
            [key: string]: number;
        };
    };
    close(): void;
}
export {};
