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

const init = async () => {
  await redisClient.connect();
};

redisClient.on('error', err => console.log('ERROR Connection Redis : ', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

init();

const app = express();

app.get('/values/current', async (req, res) => {
  const values = await redisClient.hGetAll('values');

  res.send(values);
});

// grabbing visited indexes
app.get('/values/all', (req, res) => {
  // with pg, grabd the visited indexes
  // @TODO
});

app.post('/values', (req, res) => {
  // combine redis and use the sub/pub patter to communicate with the worker
});

app.listen(5000, () => console.log('Listening on port 5000'));
