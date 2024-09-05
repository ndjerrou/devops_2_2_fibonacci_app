import express from 'express';
import redis from 'redis';

import pkg from 'pg';
const { Pool } = pkg;

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

const redisClient = redis.createClient({ host: 'redis', port: 6379 });

redisClient.on('error', err => console.log('ERROR Connection Redis : ', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

const redisPublisher = redisClient.duplicate();

const app = express();

app.use(express.json());

app.get('/values/current', (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

// grabbing visited indexes
app.get('/values/all', async (req, res) => {
  // with pg, grabd the visited indexes
  // @TODO
  try {
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows);
  } catch (err) {
    console.log(err.message);
  }
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
