"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const think_library_1 = require("think.library");
const ref_1 = require("./ref");
const pool_1 = require("./pool");
const _events = require("events");
const type_util_1 = require("type.util");
const events = _events;
class MapData {
}
class NetworkMapConfig {
}
class NetworkMap extends events {
    constructor(config) {
        super();
        this.config = config;
        this.ref = new ref_1.Ref();
        this.pool = {
            node: new pool_1.PoolCounter({ timeout: this.config.timeout, interval: null }),
            edge: new pool_1.PoolCounter({ timeout: this.config.timeout, interval: null })
        };
        if (type_util_1.default.defined(this.config.interval)) {
            if (!type_util_1.default.number(this.config.interval)) {
                throw new Error(`interval can be null or a number "${typeof this.config.interval}" is invalid`);
            }
            this.think = new think_library_1.default(() => this.drain(), this.config.interval);
        }
    }
    drain() {
        let drain = {
            edge: this.pool.edge.drain(),
            node: this.pool.node.drain()
        };
        if (drain.edge[0] || drain.node[0]) {
            drain = { edge: drain.edge[1], node: drain.node[1] };
            for (const i in drain.node) {
                drain.node[i] = [
                    this.ref.getRef(i),
                    drain.node[i][`${i}-tx`],
                    drain.node[i][`${i}-value`]
                ];
            }
            const edge = {};
            for (const i in drain.edge) {
                const side = i.split('-');
                if (!edge[side[0]]) {
                    edge[side[0]] = {};
                }
                edge[side[0]][side[1]] = [
                    drain.edge[i][`${i}-tx`],
                    drain.edge[i][`${i}-value`]
                ];
            }
            drain.edge = edge;
            this.emit('update', drain);
        }
    }
    add(from, to, value, count = 1) {
        if (from === to || value === 0) {
            return this;
        }
        const fromRef = this.ref.get(from), id = [fromRef, this.ref.get(to)].sort(), absValue = (fromRef === id[0]) ? value : -value;
        this.pool.node.add(id[0], `${id[0]}-tx`, count)
            .add(id[1], `${id[1]}-tx`, count)
            .add(id[0], `${id[0]}-value`, -absValue)
            .add(id[1], `${id[1]}-value`, absValue);
        const edge = `${id[0]}-${id[1]}`;
        this.pool.edge.add(edge, `${edge}-tx`, count)
            .add(edge, `${edge}-value`, absValue);
        return this;
    }
    get() {
        const out = { edge: {}, node: {} }, data = { edge: this.pool.edge.get(), node: this.pool.node.get() };
        for (const i in data.node) {
            out.node[i] = [
                this.ref.getRef(i),
                data.node[i][`${i}-tx`],
                data.node[i][`${i}-value`]
            ];
        }
        for (const i in data.edge) {
            const edge = i.split('-');
            if (!out.edge[edge[0]]) {
                out.edge[edge[0]] = {};
            }
            out.edge[edge[0]][edge[1]] = [
                data.edge[i][`${i}-tx`],
                data.edge[i][`${i}-value`]
            ];
        }
        return out;
    }
    close() {
        if (this.think) {
            this.think.stop();
        }
        this.pool.node.close();
        this.pool.edge.close();
    }
}
exports.NetworkMap = NetworkMap;
//# sourceMappingURL=map.js.map