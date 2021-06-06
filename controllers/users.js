const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadDataError = require('../errors/not-correct-data');
const SecondRegError = require('../errors/second-reg-err');
const AuthError = require('../errors/no-auth-err');

module.exports.getUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getMe = (req, res) => {
  User.findById(req.user._id)
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') { throw new BadDataError('Переданы некорректные данные'); }
      if (err.name === 'Error') { throw new NotFoundError('Пользователя нет в базе'); }
    });
};

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name: req.body.name,
      email: req.body.email,
      password: hash,
    }))
    .then((user) => {
      res.status(201).send({
        _id: user._id,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.name === 'MongoError') {
        next(new SecondRegError('Повторная регистрация на тот же адрес почты'));
      }
      if (err.name === 'ValidationError') { throw new BadDataError('Введены некорректные данные'); }
    });
};

module.exports.patchUserData = (req, res) => {
  User.findByIdAndUpdate(req.user._id, { name: req.body.name, email: req.body.email },
    { new: true, runValidators: true })
    .orFail(new Error('NotValidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') { throw new BadDataError('Переданы некорректные данные'); }
      if (err.name === 'Error') { throw new NotFoundError('Пользователя нет в базе'); }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' }),
      });
    })
    .catch((err) => {
      if (err.name === 'Error') {
        next(new AuthError('Неверный логин/пароль'));
      }
    });
};
