
import {Counter} from './src/counter';

const measure = (cd: any): number => {
	const start = process.hrtime();
	cd();
	const end = process.hrtime(start);
	return (end[0] * 1e9 + end[1]);
};

const NS_PER_SEC = 1e9;
const runs = 1000000;
const count = new Counter();

count.duration('test', 200);
for (let i = 0; i < runs; i++) {
	count.add('test', 1);
}
console.log(count._data.test.length);

console.log('count.get', measure(() => {
	console.log('before', count.get('test').length);
}) / NS_PER_SEC);
setTimeout(() => {
	for (let i = 0; i < 1000; i++) {
		count.add('test', 1);
	}
	console.log('count.get clear', measure(() => {
		console.log('after', count.get('test').length);
	}) / NS_PER_SEC);
}, 1000);
