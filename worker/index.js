import redis from 'redis';

const redisClient = redis.createClient({ host: 'redis', port: 6379 });

const sub = redisClient.duplicate();

redisClient.on('error', err => console.log('ERROR Connection Redis : ', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

const fib = index => {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
};

sub.on('message', (channel, message) => {
  console.log(typeof message);
  redisClient.hset('values', message, fib(+message));
});
sub.subscribe('calculateFib');
