'use strict'
const Joi = require('joi');

module.exports.post = {
  body: {
    title: Joi.string()
      .label('title')
      .required()
      .email()
      .trim(),

    author: Joi.string()
      .label('author')
      .required()
      .trim(),

    genre: Joi.string()
      .label('genre')
      .required()
      .trim(),

    description: Joi.string()
      .label('description')
      .required()
      .trim(),

    cover: Joi.string()
      .label('cover')
      .required()
      .trim()

  }
};
