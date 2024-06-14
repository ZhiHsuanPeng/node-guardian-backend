const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

const logRouter = require('./routers/logRouter');
const viewRouter = require('./routers/viewRouter');

dotenv.config();

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));

console.log('request');

app.use('/', viewRouter);
app.use('/api/v1/logs', logRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening from port ${PORT}`);
});
