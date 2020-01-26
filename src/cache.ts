

import is from 'type.util';
import Think from 'think.library';
import {time} from 'time.util';
import * as _EventEmitter from 'events';
import { resolve } from 'dns';

const EventEmitter: any = _EventEmitter;

interface CacheRecord {
	timeout: number;
	data: any;
}

export class Cache {

	private _cache: {[key: string]: CacheRecord};
	private _hook: {[key: string]: boolean};
	private _events: any;

	think: Think;

	constructor(interval = 60000) {
		this._cache = {};
		this._hook = {};
		this._events = new EventEmitter();
		this.think = new Think(() => {
			const o = {}, now = time.now();
			for (const i in this._cache) {
				if (this._cache[i] && this._cache[i].timeout > now) {
					o[i] = this._cache[i];
				}
			}
			this._cache = o;
		}, interval);
	}

	get(key: string): any | null {
		const now = time.now();
		if (this._cache[key] && this._cache[key].timeout > now) {
			return this._cache[key].data;
		}
		if (this._cache[key]) {
			this._cache[key] = null;
		}
		return null;
	}

	clear(key: string): Cache {
		this._cache[key] = null;
		return this;
	}

	set(key: string, data: any, timeout = 3000): Cache {
		return this.add(key, data, timeout);
	}

	add(key: string, data: any, timeout = 3000): Cache {
		this._cache[key] = {data: data, timeout: time.now() + timeout};
		return this;
	}

	auto(key: string, cd: () => Promise<any> | any, n?: number): Promise<any> {
		const cache = this.get(key);
		if (cache) {
			return Promise.resolve(cache);
		}

		if (this._hook[key]) {
			return new Promise((resolve) => {
				this._events.once(key, (data) => resolve(data));
			});
		}

		this._hook[key] = true;
		const out = cd();
		if (out instanceof Promise) {
			return out.then((data) => {
				this._hook[key] = false;
				if (is.defined(data)) {
					this.add(key, data, n);
					this._events.emit(key, data);
				}
				return data;
			});
		}
		this._hook[key] = false;
		if (is.defined(out)) {
			this.add(key, out, n);
			this._events.emit(key, out);
		}
		return Promise.resolve(out);
	}

	close(): void {
		if (this.think) {
			this.think.stop();
		}
	}

}
