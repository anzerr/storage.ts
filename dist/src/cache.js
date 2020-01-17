"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_util_1 = require("type.util");
const think_library_1 = require("think.library");
const time_util_1 = require("time.util");
class Cache {
    constructor() {
        this._cache = {};
        this.think = new think_library_1.default(() => {
            const o = {}, now = time_util_1.time.now();
            for (const i in this._cache) {
                if (this._cache[i] && this._cache[i].timeout > now) {
                    o[i] = this._cache[i];
                }
            }
            this._cache = o;
        }, 1000 * 60);
    }
    get(key) {
        const now = time_util_1.time.now();
        if (this._cache[key] && this._cache[key].timeout > now) {
            return this._cache[key].data;
        }
        if (this._cache[key]) {
            this._cache[key] = null;
        }
        return null;
    }
    clear(key) {
        this._cache[key] = null;
        return this;
    }
    add(key, data, timeout = 3000) {
        this._cache[key] = { data: data, timeout: time_util_1.time.now() + timeout };
        return this;
    }
    auto(key, cd, n) {
        const cache = this.get(key);
        if (cache) {
            return Promise.resolve(cache);
        }
        const out = cd();
        return ((out instanceof Promise) ? out : Promise.resolve(out)).then((data) => {
            if (type_util_1.default.defined(data)) {
                this.add(key, data, n);
            }
            return data;
        });
    }
}
exports.default = Cache;
//# sourceMappingURL=cache.js.map