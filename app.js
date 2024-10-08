const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const logRouter = require('./routers/logRouter');
const viewRouter = require('./routers/viewRouter');
const userRouter = require('./routers/userRouter');
const projectRouter = require('./routers/projectRouter');
const { errorHandler } = require('./utils/errorHandler');

dotenv.config();

const app = express();

app.get('/', (req, res) => {
  return res.redirect('/home');
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use('/', viewRouter);
app.use('/api/v1/logs', logRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/projects', projectRouter);

app.all('*', (req, res) => {
  const url = '/home';
  return res.status(404).render('404', { url });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening from port ${PORT}`);
});

module.exports = { app };
