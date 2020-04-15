const authMiddleware = (req, res, next) => {
  const { query = {} } = req
  if (query.secret !== '112358') return res.sendStatus(404)

  next();
};

module.exports = authMiddleware;
