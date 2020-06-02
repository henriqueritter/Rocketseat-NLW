import express from 'express';

const app = express();

app.get('/users', (request, response) => {
  console.log('helo');
  response.json(['Henrique', 'Beatriz', 'Rafael']);
});

app.listen(3333);