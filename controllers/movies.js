const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const BadDataError = require('../errors/not-correct-data');
const NoRightsError = require('../errors/no-rights-err');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .select('-owner')
    .then((movie) => {
      res.status(200).send(movie);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.postMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => {
      const newMov = {
        _id: movie._id,
        country: movie.country,
        director: movie.director,
        duration: movie.duration,
        year: movie.year,
        description: movie.description,
        image: movie.image,
        trailer: movie.trailer,
        thumbnail: movie.thumbnail,
        movieId: movie.movieId,
        nameRU: movie.nameRU,
        nameEN: movie.nameEN,
      };
      res.send({ data: newMov });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return (next(new BadDataError('Введены некорректные данные')));
      }
      return (next(err));
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(new NotFoundError('Фильма нет в базе'))
    .then((movie) => {
      if (JSON.stringify(movie.owner) === JSON.stringify(req.user._id)) {
        Movie.findByIdAndRemove(movie._id)
          .then((movies) => res.send({ data: movies }))
          .catch((err) => {
            if (err.name === 'ValidationError') {
              next(new BadDataError('Переданы некорректные данные'));
            }
            return (next(err));
          });
      } else {
        throw new NoRightsError('Не Ваш то фильм, любезный пользователь, благоволите не удалять его');
      }
    })
    .catch((err) => {
      next(err);
    });
};
