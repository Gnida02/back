const { check } = require('express-validator');

const validation = {
  createServices: [
    check('category').isLength({ min: 3, max: 100 }),
    check('name').isLength({ min: 3, max: 100 }),
    check('price').isInt({ min: 0, max: 200000 }),

  ],
  updateServices: [
    check('category').isLength({ min: 3, max: 100 }),
    check('name').isLength({ min: 3, max: 100 }),
    check('price').isInt({ min: 0, max: 200000 }),
  ]
};

module.exports = validation;