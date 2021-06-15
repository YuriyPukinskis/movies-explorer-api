const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const routesMovies = require('./movies');
const routesUsers = require('./users');
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-err');
const { errorLogger } = require('../middlewares/logger');
const errorHandler = require('../middlewares/errorHandler');

module.exports = function (app) {
  app.post('/signup', celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).required(),
      email: Joi.string().email({ tlds: { allow: false } }).required(),
      password: Joi.string().required(),
    }),
  }), createUser);
  app.post('/signin', celebrate({
    body: Joi.object().keys({
      email: Joi.string().email({ tlds: { allow: false } }).required(),
      password: Joi.string().required(),
    }),
  }), login);

  app.use('/users', auth, routesUsers);
  app.use('/movies', auth, routesMovies);

  app.use(errorLogger);
  app.use(errors());
  app.use('*', auth, () => {
    throw new NotFoundError('Запрашиваемый ресурс не найден');
  });

  app.use(errorHandler);
};
