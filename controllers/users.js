const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadDataError = require('../errors/not-correct-data');
const SecondRegError = require('../errors/second-reg-err');

module.exports.getUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getMe = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new NotFoundError('Пользователя нет в базе'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadDataError('Переданы некорректные данные'));
        return (true);
      }
      next(err);
      return (true);
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
      if (err.name === 'MongoError' && err.code === 11000) {
        next(new SecondRegError('Повторная регистрация на тот же адрес почты'));
        return (true);
      }
      if (err.name === 'ValidationError') {
        next(new BadDataError('Введены некорректные данные'));
        return (true);
      }
      next(err);
      return (true);
    });
};

module.exports.patchUserData = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, { name: req.body.name, email: req.body.email },
    { new: true, runValidators: true })
    .orFail(new NotFoundError('Пользователя нет в базе'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadDataError('Введены некорректные данные'));
        return (true);
      }
      if (err.name === 'CastError') {
        next(new BadDataError('Переданы некорректные данные'));
      } else {
        if (err.name === 'MongoError' && err.code === 11000) {
          next(new SecondRegError('Такая почта уже есть'));
          return (true);
        }
        next(err);
      }
      return (true);
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
      next(err);
    });
};
