
### `Intro`
![GitHub Actions status | publish](https://github.com/anzerr/storage.ts/workflows/publish/badge.svg)

// explain

#### `Install`
``` bash
npm install --save git+https://git@github.com/anzerr/storage.ts.git
npm install --save @anzerr/storage.ts
```

### `Example`
``` javascript
import {Counter, Ref, PoolCounter, Cache, NetworkMap} from 'storage.ts';

const count = new Counter();
count.duration('test', 200);
for (let i = 0; i < runs; i++) {
    count.add('test', 1);
}
console.log(count.get('test'), count.reduce('test'));
            
const ref = new Ref();
console.log(ref.get('cat'), ref.get('dog'), ref.get('cat'), ref.getRef(2)) // 1, 2, 1, 'dog'

const pool = new PoolCounter({
    timeout: 2000, // how long added data exists 
    interval: 100 // how long the pool be drained
});
for (let i = 0; i < 1000; i++) {
    pool.add('test', 'cat', 1);
    pool.add('test', 'dog', 1);
}
console.log(pool.get());
setTimeout(() => {
    console.log(pool.get());
}, 1000);

const cache = new Cache();
console.log(cache.get('test')); // null
cache.set('test', 'tests', 1000);
console.log(cache.get('test')); // tests
cache.clear('test');
console.log(cache.get('test')); // null

const map = new NetworkMap({
    timeout: 2000, // when the data added should time out and be dropped
    interval: 100 // at what interval should the pooled data be drained and added to it's map
});
map.add('cat', 'dog', 100);
map.add('cat', 'dog', 1000);
map.add('cat', 'egg', 100);
console.log(map.get());
```