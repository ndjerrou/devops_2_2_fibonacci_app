const express = require('express');
const redis = require('redis');

const pg = require('pg');

// init connection with pg through docker

const redisClient = redis.createClient({
  url: 'redis@redis',
});

const init = async () => {
  await redisClient.connect();
};

redisClient.on('error', err => console.log('ERROR Connection Redis : ', err));

init();

const app = express();

app.get('/values/current', async (req, res) => {
  const values = await redisClient.hGetAll('values');

  res.send(values);
});

// grabbing visited indexes
app.get('/values/all', (req, res) => {
  // with pg, grabd the visited indexes
});

app.post('/values', (req, res) => {
  // combine redis and use the sub/pub patter to communicate with the worker
});

app.listen(5000, () => console.log('Listening on port 5000'));
