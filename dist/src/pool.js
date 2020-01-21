"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const time_util_1 = require("time.util");
const counter_1 = require("./counter");
const think_library_1 = require("think.library");
const type_util_1 = require("type.util");
class PoolCounterConfig {
}
class PoolCounter {
    constructor(config) {
        this.config = config;
        this.counter = new counter_1.Counter();
        this.pool = { keys: null, valid: {}, shard: {} };
        if (this.config.interval !== null) {
            this.think = new think_library_1.default(() => {
                if (this.pool.keys) {
                    const drain = this.drain();
                    if (drain[0] && type_util_1.default.function(this.config.drain)) {
                        this.config.drain(drain[1]);
                    }
                }
            }, this.config.interval);
        }
    }
    drain() {
        const out = {};
        let count = 0;
        for (const i in this.pool.keys) {
            const k = Number(this.pool.keys[i]) || 0;
            if (k) {
                const shard = this.pool.shard[i] || '';
                if (!out[shard]) {
                    out[shard] = {};
                }
                this.counter.add(i, k);
                this.pool.valid[i] = time_util_1.time.now() + this.config.timeout;
                out[shard][i] = k;
                count += 1;
            }
        }
        const now = time_util_1.time.now(), valid = {};
        for (const i in this.pool.valid) {
            if (this.pool.valid[i] > now) {
                valid[i] = this.pool.valid[i];
            }
        }
        this.pool.keys = null;
        this.pool.valid = valid;
        return [count, out];
    }
    add(shard, key, value) {
        if (!this.pool.keys) {
            this.pool.keys = {};
        }
        this.pool.keys[key] = (this.pool.keys[key] || 0) + (Number(value) || 0);
        this.pool.shard[key] = shard;
        if (!this.counter._duration[key]) {
            this.counter.duration(key, this.config.timeout);
        }
        return this;
    }
    get() {
        const now = time_util_1.time.now(), valid = {}, out = {};
        for (const i in this.pool.valid) {
            if (this.pool.valid[i] > now) {
                valid[i] = this.pool.valid[i];
                const shard = this.pool.shard[i] || '';
                if (!out[shard]) {
                    out[shard] = {};
                }
                out[shard][i] = this.counter.reduce(i);
            }
        }
        return out;
    }
    close() {
        if (this.think) {
            this.think.stop();
        }
    }
}
exports.PoolCounter = PoolCounter;
//# sourceMappingURL=pool.js.map