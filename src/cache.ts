

import is from 'type.util';
import Think from 'think.library';
import {time} from 'time.util';

interface CacheRecord {
	timeout: number;
	data: any;
}

export default class Cache {

	private _cache: {[key: string]: CacheRecord};

	think: Think;

	constructor() {
		this._cache = {};
		this.think = new Think(() => {
			const o = {}, now = time.now();
			for (const i in this._cache) {
				if (this._cache[i] && this._cache[i].timeout > now) {
					o[i] = this._cache[i];
				}
			}
			this._cache = o;
		}, 1000 * 60);
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

	add(key: string, data: any, timeout = 3000): Cache {
		this._cache[key] = {data: data, timeout: time.now() + timeout};
		return this;
	}

	auto(key: string, cd: () => Promise<any> | any, n?: number): Promise<any> {
		const cache = this.get(key);
		if (cache) {
			return Promise.resolve(cache);
		}

		const out = cd();
		return ((out instanceof Promise) ? out : Promise.resolve(out)).then((data) => {
			if (is.defined(data)) {
				this.add(key, data, n);
			}
			return data;
		});
	}

}
