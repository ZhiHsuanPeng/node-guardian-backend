const userModel = require('../models_RDS/user');

const validateUser = async (req, res, next) => {
  const { accountName } = req.params;
  const userId = res.locals.userId;
  const user = await userModel.getUserInfoById(userId);

  if (!(user[0].name === accountName)) {
    const url = `/a/${user[0].name}`;
    return res.status(404).render('404', { url });
  }
  res.locals.user = user;
  return next();
};

module.exports = validateUser;
