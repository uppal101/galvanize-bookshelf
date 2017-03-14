'use strict';

const express = require('express');
const ev = require('express-validation');
const validations = require('../validations/users');

// eslint-disable-next-line new-cap
const router = express.Router();
const bcrypt = require('bcrypt-as-promised');
const knex = require('../knex');
const camelizeKeys = require('humps');

router.post('/users', ev(validations.post), (req, res, next) => {
  // if (!req.body.email) {
  //   res.set('Content-type', 'text/plain');
  //   return res.status(400).send('Email must not be blank');
  // }
  //
  // if (!req.body.password || req.body.password < 8) {
  //   res.set('Content-type', 'text/plain');
  //   return res.status(400).send('Password must be at least 8 characters long');
  // }
  bcrypt.hash(req.body.password, 12)
        .then((hashed_password) => {
          return knex('users')
                .where('email', req.body.email)
                .then((userEmail) => {
                  if (userEmail[0]) {
                    res.set('Content-type', 'text/plain');
                    return res.status(400).send('Email already exists');
                  }
                  return userEmail;
                })
                .then((user) => {
                    return knex('users')
                        .insert({
                          first_name: req.body.firstName,
                          last_name: req.body.lastName,
                          email: req.body.email,
                          hashed_password: hashed_password
                        }, '*');
                })
                .then((users) => {
                  const user = users[0];
                  delete user.hashed_password;
                  res.send(camelizeKeys(user));
                })
                .catch((err) => {
                  next(err);
                });
        });
});

module.exports = router;
