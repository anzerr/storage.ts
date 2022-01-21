
import {Counter, Ref, PoolCounter, Cache, NetworkMap} from './index';
import * as assert from 'assert';

const NS_PER_SEC = 1e9;

class Test {

	measure(cd: any): number {
		const start = process.hrtime();
		cd();
		const end = process.hrtime(start);
		return (end[0] * 1e9 + end[1]);
	}

	measureCacheSpeed(): Promise<void> {
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

	measurePool(): Promise<void> {
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

	testCache(): Promise<void> {
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
				resolve(null);
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
		}).then(() => {
			let fail = 0, valid = 0, run = 0;
			return Promise.all([
				cache.auto('error', () => {
					run += 1;
					return Promise.reject('fuck');
				}).then(() => {
					fail += 1;
				}).catch(() => {
					valid += 1;
				}),
				cache.auto('error', () => {
					run += 1;
					return Promise.reject('fuck');
				}).then(() => {
					fail += 1;
				}).catch(() => {
					valid += 1;
				}),
				cache.auto('error', () => {
					run += 1;
					return Promise.reject('fuck');
				}).then(() => {
					fail += 1;
				}).catch(() => {
					valid += 1;
				})
			]).then(() => {
				assert.equal(fail, 0);
				assert.equal(valid, 3);
				assert.equal(run, 1);
			});
		});
	}

	testMap(): Promise<any> {
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
				console.log('NetworkMap.get calls 1000000', this.measure(() => {
					for (let i = 0; i < 1000000; i++) {
						map.get();
					}
				}) / NS_PER_SEC);
				console.log('NetworkMap.add calls 1000000', this.measure(() => {
					for (let i = 0; i < 1000000; i++) {
						map.add('cat', 'dog', 100);
					}
				}) / NS_PER_SEC);
				setTimeout(() => {
					const data = map.get();
					assert.equal(Object.keys(data.node).length, 0);
					assert.equal(Object.keys(data.edge).length, 0);
					map.close();
					resolve(null);
				}, 2100);
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
