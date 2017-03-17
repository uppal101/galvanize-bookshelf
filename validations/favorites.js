'use strict'
const Joi = require('joi');

module.exports.post = {
  body: {
    token: Joi.string()
      .label('Token')
      .required()
      .trim(),
  }
};
