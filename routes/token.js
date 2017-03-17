'use strict';

const express = require('express');
const ev = require('express-validation');
const validations = require('../validations/token');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt-as-promised');
const { camelizeKeys, decamelizeKeys } = require('humps');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

router.get('/token', (req, res) => {
  if (req.cookies.token === undefined) {
    res.set('Content-type', 'application/json');
    res.status(200).send('false');
  } else {
    res.set('Content-type', 'application/json');
    res.status(200).send('true');
  }
});

router.post('/token', ev(validations.post), (req, res, next) => {
  // if (!req.body.email) {
  //   res.set('Content-type', 'text/plain');
  //   return res.status(400).send('Email must not be blank');
  // }
  // if (!req.body.password || req.body.password < 8) {
  //   res.set('Content-type', 'text/plain');
  //   return res.status(400).send('Password must not be blank');
  // }
  return knex('users')
    .where('email', req.body.email)
    .then((users) => {
      let user = users[0];
      if (!user) {
        res.set('Content-type', 'plain/text');
        res.status(400).send('Bad email or password');
      } else {
        return bcrypt.compare(req.body.password, user.hashed_password)
        .then((res) => {
          return res;
        })
        .catch((err) => {
          res.set('Content-type', 'plain/text');
          res.status(400).send('Bad email or password');
        })
        .then((authorizedUser) => {
          delete users[0].hashed_password
          const claims = {
            user: users[0].id,
            iss: 'https://localhost:8000'
          };
          const token = jwt.sign(claims, process.env.JWT_KEY);

          res.cookie('token', token, {
            httpOnly: true
          });
          res.send(camelizeKeys(users[0]));
        });
      }
    })
    .catch((err) => {
      next(err);
    })
});

router.delete('/token', (req, res) => {
  res.clearCookie('token')
  res.set('Content-type', 'application/json');
  res.status(200).send('true');
});

module.exports = router;
