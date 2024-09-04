const express = require('express');
const redis = require('redis');

const { Pool } = require('pg');

// init connection with pg through docker
const pgClient = new Pool({
  user: 'postgres',
  host: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
});

pgClient.connect((err, client) => {
  if (err) console.log('error connection', err);
  client
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.error(err));

  console.log('Connected to PostgreSQL instance');
});

const redisClient = redis.createClient({
  url: 'redis://redis',
  // protocol//user:password@host:port
});

const redisPublisher = redisClient.duplicate();

const init = async () => {
  await redisClient.connect();
};

redisClient.on('error', err => console.log('ERROR Connection Redis : ', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

init();

const app = express();

app.use(express.json());

app.get('/values/current', async (req, res) => {
  const values = await redisClient.hGetAll('values');

  res.send(values);
});

// grabbing visited indexes
app.get('/values/all', async (req, res) => {
  // with pg, grabd the visited indexes
  // @TODO
  const values = await pgClient.query('SELECT * from values');

  res.send(values.rows);
});

app.post('/values', (req, res) => {
  // combine redis and use the sub/pub patter to communicate with the worker

  const index = req.body.index;

  if (+index > 40) res.status(422).send('Index too high');

  // delegate to worker
  redisPublisher.publish('calculateFib', index);
  // save new index into DB
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });
});

app.listen(5000, () => console.log('Listening on port 5000'));
