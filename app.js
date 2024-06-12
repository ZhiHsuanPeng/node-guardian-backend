const express = require('express');
const dotenv = require('dotenv');

const logRouter = require('./routers/logRouter');

dotenv.config();

const app = express();

app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'This is the root page' });
});

app.use('/api/v1/logs', logRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening from port ${PORT}`);
});
