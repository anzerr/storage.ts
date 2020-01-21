
import {Counter, Ref, PoolCounter, Cache, NetworkMap} from './index';
import * as assert from 'assert';

class Test {

	measure(cd: any): number {
		const start = process.hrtime();
		cd();
		const end = process.hrtime(start);
		return (end[0] * 1e9 + end[1]);
	}

	measureCacheSpeed(): Promise<any> {
		const NS_PER_SEC = 1e9;
		const runs = 1000000;
		const count = new Counter();

		return new Promise((resolve) => {
			count.duration('test', 200);
			for (let i = 0; i < runs; i++) {
				count.add('test', 1);
			}
			console.log(count._data.test.length);

			console.log('count.get', this.measure(() => {
				console.log('before', count.get('test').length);
			}) / NS_PER_SEC);
			setTimeout(() => {
				for (let i = 0; i < 1000; i++) {
					count.add('test', 1);
				}
				console.log('count.get clear', this.measure(() => {
					console.log('after', count.get('test').length);
					resolve();
				}) / NS_PER_SEC);
			}, 1000);
		});
	}

	testRef(): void {
		const ref = new Ref();
		assert.equal(ref.get('cat'), 1);
		assert.equal(ref.get('dog'), 2);
		assert.equal(ref.get('cat'), 1);
		assert.equal(ref.getRef(1), 'cat');
		assert.equal(ref.getRef(2), 'dog');
	}

	measurePool(): Promise<any> {
		const pool = new PoolCounter({timeout: 2000, interval: 100});

		return new Promise((resolve) => {
			for (let i = 0; i < 1000; i++) {
				pool.add('test', 'cat', 1);
				pool.add('test', 'dog', 1);
			}
			assert.equal(Object.keys(pool.get()).length, 0);
			setTimeout(() => {
				const data = pool.get();
				assert.equal(Object.keys(data).length, 1);
				assert.equal(Object.keys(data.test).length, 2);
				assert.equal(data.test.cat, 1000);
				assert.equal(data.test.dog, 1000);
				setTimeout(() => {
					assert.equal(Object.keys(pool.get()).length, 0);
					pool.close();
					resolve();
				}, 1500);
			}, 1000);
		});
	}

	testCache(): Promise<any> {
		const cache = new Cache();
		assert.equal(cache.get('test'), null);
		cache.set('test', 'tests');
		assert.equal(cache.get('test'), 'tests');
		cache.clear('test');
		assert.equal(cache.get('test'), null);
		cache.set('test', 'tests', 1000);
		assert.equal(cache.get('test'), 'tests');
		return new Promise((resolve) => {
			setTimeout(() => {
				assert.equal(cache.get('test'), null);
				cache.close();
				resolve();
			}, 1500);
		}).then(() => {
			let init = 0;
			return Promise.all([
				cache.auto('test', () => {
					init += 1;
					return 'cat';
				}).then((res) => assert.equal(res, 'cat')),
				cache.auto('test', () => {
					init += 1;
					return 'cat';
				}).then((res) => assert.equal(res, 'cat')),
				cache.auto('test', () => {
					init += 1;
					return 'cat';
				}).then((res) => assert.equal(res, 'cat')),
				cache.auto('test', () => {
					init += 1;
					return 'cat';
				})
			]).then(() => {
				assert.equal(cache.get('test'), 'cat');
				assert.equal(init, 1);
			});
		});
	}

	testMap(): any {
		const map = new NetworkMap({timeout: 2000, interval: 100});
		map.add('cat', 'dog', 100);
		map.add('cat', 'dog', 1000);
		map.add('cat', 'egg', 100);
		const data = map.get();
		assert.equal(Object.keys(data.node).length, 0);
		assert.equal(Object.keys(data.edge).length, 0);
		return new Promise((resolve) => {
			setTimeout(() => {
				const data = map.get();
				assert.equal(Object.keys(data.node).length, 3);
				assert.equal(data.node['1'][0], 'cat');
				assert.equal(data.node['1'][2], -1200);
				assert.equal(data.node['3'][0], 'egg');
				assert.equal(data.node['3'][2], 100);
				assert.equal(data.edge['1']['2'][1], 1100);
				setTimeout(() => {
					const data = map.get();
					assert.equal(Object.keys(data.node).length, 0);
					assert.equal(Object.keys(data.edge).length, 0);
					map.close();
					resolve();
				}, 2000);
			}, 500);
		});
	}

}

const t = new Test();
(async() => {
	try {
		await t.measureCacheSpeed();
		t.testRef();
		await t.measurePool();
		await t.testCache();
		await t.testMap();
		console.log('done');
	} catch(e) {
		console.log(e);
		process.exit(1);
	}
})();
