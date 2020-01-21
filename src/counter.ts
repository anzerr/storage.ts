
import {time} from 'time.util';

export class Counter {

	_data: {[key: string]: {value: number; time: number}[]};
	_duration: {[key: string]: number};

	constructor() {
		this._data = {};
		this._duration = {};
	}

	clean(key: string): {value: number; time: number}[] {
		if (!this._data[key]) {
			return [];
		}
		const now = time.now() + (this._duration[key] ? this._duration[key] : -60 * 1000);
		let i = 0;
		while (this._data[key][i]) {
			if (this._data[key][i].time < now || !this._data[key][i].value) {
				i++;
			} else {
				break;
			}
		}
		if (i !== 0) {
			this._data[key].splice(0, i);
		}
		return this._data[key];
	}

	duration(key: string, duration: number): void {
		this._duration[key] = Math.abs(duration) * -1;
	}

	add(key: string, value: number): void {
		const v = Number(value) || 0;
		if (!v) {
			return;
		}
		if (!this._data[key]) {
			this._data[key] = [];
		}
		this._data[key].push({value: v, time: time.now()});
	}

	get(key: string): {value: number; time: number}[] {
		return this.clean(key);
	}

	reduce(key: string): number {
		return this.get(key).reduce((a, b) => {
			return (b.value) ? a + b.value : a;
		}, 0);
	}

	all(): {[key: string]: {value: number; time: number}[]} {
		const o = {};
		for (const i in this._data) {
			o[i] = this.clean(i);
		}
		return o;
	}

}
