const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { requestLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/moviedb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
app.listen(PORT, () => {

});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use(cors({
  origin: true,
  exposedHeaders: '*',
  credentials: true,
}));

app.use(requestLogger);
require('./middlewares/rateLimit')(app);
require('./routes')(app);
