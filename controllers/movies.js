const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const BadDataError = require('../errors/not-found-err');
const NoRightsError = require('../errors/no-rights-err');

module.exports.getMovies = (req, res) => {
  Movie.find()
    .orFail(new Error('NotValidId'))
    .then((movie) => {
      res.status(200).send(movie);
    })
    .catch((err) => {
      if (err.message === 'NotValidId') { throw new NotFoundError('Фильмов нет в базе'); }
    });
};

module.exports.postMovie = (req, res) => {
  const { country, director, duration, year, description, image, trailer, thumbnail, movieId, nameRU, nameEN } = req.body;
  const owner = req.user._id;

  Movie.create({ country, director, duration, year, description, image, trailer, thumbnail, owner, movieId, nameRU, nameEN })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') { throw new BadDataError('Введены некорректные данные'); }
    });
};

module.exports.deleteMovie = (req, res) => {
  Movie.findById(req.params.movieId)
    .orFail(new Error('NotValidId'))
    .then((movie) => {
      if (JSON.stringify(movie.owner) === JSON.stringify(req.user._id)) {
        Movie.findByIdAndRemove(movie._id)
          .orFail(new Error('NotValidId'))
          .then((movies) => res.send({ data: movies }))
          .catch((err) => {
            if (err.name === 'ValidationError') { throw new BadDataError('Переданы некорректные данные'); }
            if (err.message === 'NotValidId') { throw new NotFoundError('Фильма нет в базе'); }
          });
      } else {
        throw new NoRightsError('Не Ваш то фильм, любезный пользователь, благоволите не удалять его');
      }
    })
    .catch((err) => {
      if (err.message === 'NotValidId') { throw new NotFoundError('Фильма нет в базе'); }
    });
};
