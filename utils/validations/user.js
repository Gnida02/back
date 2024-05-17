const { check } = require('express-validator');

const validation = {
    registration: [
        check('username', "Имя пользвателя не может быть пустым").notEmpty(),
        check('email', "Email пользователя не может быть пустым").notEmpty(),
        check('password', "Пароль должен быть не меньше 4 и больше 10 символов").isLength({min:4, max:10})
  ]
};

module.exports = validation;