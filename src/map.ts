
import Think from 'think.library';
import {Ref} from './ref';
import {PoolCounter} from './pool';
import * as events from 'events';

class MapData {

	node: {[key: string]: [string, number, number]};
	edge: {[key: string]: {[key: string]: [number, number]}};

}

export class NetworkMap extends events {

	ref: Ref;
	think: Think;
	pool: {node: PoolCounter; edge: PoolCounter}

	constructor(config: {timeout: number; interval: number}) {
		super();
		this.ref = new Ref();
		this.pool = {
			node: new PoolCounter({timeout: config.timeout, interval: null}),
			edge: new PoolCounter({timeout: config.timeout, interval: null})
		};
		this.think = new Think(() => {
			let drain: any = {
				edge: this.pool.edge.drain(),
				node: this.pool.node.drain()
			};
			if (drain.edge[0] || drain.node[0]) {
				drain = {edge: drain.edge[1], node: drain.node[1]};
				for (const i in drain.node) {
					drain.node[i] = [drain.node[i][`${i}-tx`], drain.node[i][`${i}-value`]];
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
		}, config.interval);
	}

	add(from: string, to: string, value: number): NetworkMap {
		if (from === to || value === 0) {
			return this;
		}
		const fromRef = this.ref.get(from),
			id = [fromRef, this.ref.get(to)].sort(),
			absValue = (fromRef === id[0]) ? value : -value;

		this.pool.node.add(id[0], `${id[0]}-tx`, 1)
			.add(id[1], `${id[1]}-tx`, 1)
			.add(id[0], `${id[0]}-value`, -absValue)
			.add(id[1], `${id[1]}-value`, absValue);
		const edge = `${id[0]}-${id[1]}`;
		this.pool.edge.add(edge, `${edge}-tx`, 1)
			.add(edge, `${edge}-value`, value);
		return this;
	}

	get(): MapData {
		const out: any = {edge: {}, node: {}},
			data = {edge: this.pool.edge.get(), node: this.pool.node.get()};
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

	close(): void {
		if (this.think) {
			this.think.stop();
		}
		this.pool.node.close();
		this.pool.edge.close();
	}

}
