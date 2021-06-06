const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const {
  deleteMovie, postMovie, getMovies,
} = require('../controllers/movies');

router.get('/', getMovies);

router.post('/', celebrate({
  body: Joi.object().keys({
    image: Joi.string().required().custom((value, helpers) => {
      if (validator.isURL(value)) {
        return value;
      }
      return helpers.message('Поле "image" должно быть валидным url-адресом');
    })
      .messages({
        'string.required': 'Поле "image" должно быть заполнено',
      }),
    trailer: Joi.string().required().custom((value, helpers) => {
      if (validator.isURL(value)) {
        return value;
      }
      return helpers.message('Поле "trailer" должно быть валидным url-адресом');
    })
      .messages({
        'string.required': 'Поле "trailer" должно быть заполнено',
      }),
      thumbnail: Joi.string().required().custom((value, helpers) => {
      if (validator.isURL(value)) {
        return value;
      }
      return helpers.message('Поле "thumbnail" должно быть валидным url-адресом');
    })
      .messages({
        'string.required': 'Поле "thumbnail" должно быть заполнено',
      }),
  }).unknown(true),
}), postMovie);

router.delete('/:movieId', deleteMovie);

module.exports = router;
