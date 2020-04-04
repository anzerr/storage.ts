
import {time} from 'time.util';
import {Counter} from './counter';
import Think from 'think.library';
import is from 'type.util';

class PoolCounterConfig {

	timeout: number;
	interval?: number;
	drain?: (any) => void

}

export class PoolCounter {

	pool: {
		keys: {[key: string]: number};
		valid: {[key: string]: number};
		shard: {[key: string]: string};
	};
	counter: Counter;
	think: Think;
	config: PoolCounterConfig

	constructor(config: PoolCounterConfig) {
		this.config = config;
		this.counter = new Counter();
		this.pool = {keys: null, valid: {}, shard: {}};
		if (is.defined(this.config.interval)) {
			if (!is.number(this.config.interval)) {
				throw new Error(`interval can be null or a number "${typeof this.config.interval}" is invalid`);
			}
			this.think = new Think(() => {
				if (this.pool.keys) {
					const drain = this.drain();
					if (drain[0] && is.function(this.config.drain)) {
						this.config.drain(drain[1]);
					}
				}
			}, this.config.interval);
		}
	}

	drain(): [number, {[key: string]: any}] {
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
				this.pool.valid[i] = time.now() + this.config.timeout;
				out[shard][i] = k;
				count += 1;
			}
		}
		const now = time.now(), valid = {};
		for (const i in this.pool.valid) {
			if (this.pool.valid[i] > now) {
				valid[i] = this.pool.valid[i];
			}
		}
		this.pool.keys = null;
		this.pool.valid = valid;
		return [count, out];
	}

	add(shard: string, key: string, value: number): PoolCounter {
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

	get(): {[key: string]: {[key: string]: number}} {
		const now = time.now(), valid = {}, out = {};
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

	close(): void {
		if (this.think) {
			this.think.stop();
		}
	}

}
