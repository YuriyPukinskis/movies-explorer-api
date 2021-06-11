const router = require('express').Router();
const express = require('express');
const { celebrate, Joi } = require('celebrate');

router.use(express.urlencoded({ extended: false }));

const {
  getUsers, getMe, patchUserData,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getMe);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
  }),
}), patchUserData);

module.exports = router;
