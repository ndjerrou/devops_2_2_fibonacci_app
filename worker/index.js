const redis = require('redis');

const client = redis.createClient();

(async () => {
  await client.connect();
})();

const sub = client.duplicate();

const fib = index => {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
};

sub.on('message', (channel, message) => {
  redisClient.hset('values', message, fib(message));
});
