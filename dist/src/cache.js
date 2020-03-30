"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_util_1 = require("type.util");
const think_library_1 = require("think.library");
const time_util_1 = require("time.util");
const _EventEmitter = require("events");
const EventEmitter = _EventEmitter;
class Cache {
    constructor(interval = 60000) {
        this._cache = {};
        this._hook = {};
        this._events = new EventEmitter();
        this.think = new think_library_1.default(() => {
            const o = {}, now = time_util_1.time.now();
            for (const i in this._cache) {
                if (this._cache[i] && this._cache[i].timeout > now) {
                    o[i] = this._cache[i];
                }
            }
            this._cache = o;
        }, interval);
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
    set(key, data, timeout = 3000) {
        return this.add(key, data, timeout);
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
        if (this._hook[key]) {
            return new Promise((resolve, reject) => {
                this._events.once(key, (data) => {
                    if (data[0]) {
                        resolve(data[1]);
                    }
                    else {
                        reject(data[1]);
                    }
                });
            });
        }
        this._hook[key] = true;
        const out = cd();
        if (out instanceof Promise) {
            return out.then((data) => {
                this._hook[key] = false;
                if (type_util_1.default.defined(data)) {
                    this.add(key, data, n);
                    this._events.emit(key, [true, data]);
                }
                return data;
            }).catch((err) => {
                this._hook[key] = false;
                this._events.emit(key, [false, err]);
                return Promise.reject(err);
            });
        }
        this._hook[key] = false;
        if (type_util_1.default.defined(out)) {
            this.add(key, out, n);
            this._events.emit(key, out);
        }
        return Promise.resolve(out);
    }
    close() {
        if (this.think) {
            this.think.stop();
        }
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map