const jwt = require('jsonwebtoken');
const NoAuthError = require('../errors/no-auth-err');
// const handleAuthError = (res) => {
//   res
//     .status(401)
//     .send({ message: 'Необходима авторизация' });
// };

const extractBearerToken = (header) => header.replace('Bearer ', '');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new NoAuthError('Необходима авторизация');
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, 'super-strong-secret');
  } catch (err) {
    throw new NoAuthError('Необходима авторизация');
  }

  req.user = payload;

  next();
};
