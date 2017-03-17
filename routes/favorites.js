'use strict';

const express = require('express');
const ev = require('express-validation');
const validations = require('../validations/favorites');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const { decamelizeKeys, camelizeKeys } = require('humps');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

router.get('/favorites', (req, res, next) => {
  // if (req.cookies.token === undefined) {
  //   res.set('Content-type', 'plain/text');
  //   res.status(401).send('Unauthorized');
  // } else {
    knex('favorites')
      .join('books', 'favorites.book_id', '=', 'books.id')
      .select('*', '*')
      .then((favorites) => {
        res.set('Content-type', 'application/json');
        res.send(camelizeKeys(favorites));
      })
      .catch((err) => {
        res.sendStatus(404);
        next(err);
      });
});

router.get('/favorites/:check', (req, res, next) => {
  // if (req.cookies.token === undefined) {
  //   res.set('Content-type', 'plain/text');
  //   res.status(401).send('Unauthorized');
  // }
  // else {
    knex('favorites')
      .join('books', 'favorites.book_id', '=', 'books.id')
      .select('*', '*')
      .then((favorites) => {
        const favBooksId = JSON.stringify(favorites[0].book_id);

        res.set('Content-type', 'application/json');
        res.status(200).send(req.query.bookId === favBooksId);
      })
      .catch((err) => {
        res.sendStatus(404);
        next(err);
      });
});

router.post('/favorites', ev(validations.post), (req, res, next) => {
  // if (req.cookies.token === undefined) {
  //   res.set('Content-type', 'plain/text');
  //   res.status(401).send('Unauthorized');
  // }
  // else {
    const verifiedJwt = jwt.verify(req.cookies.token, process.env.JWT_KEY);
    const userId = verifiedJwt.user;
    knex('favorites')
      .insert({
        book_id: req.body.bookId,
        user_id: userId
      }, '*')
      .then((favorite) => {
        res.set('Content-type', 'application/json');
        res.status(200).send(camelizeKeys(favorite[0]));
      })
      .catch((err) => {
        res.sendStatus(404);
        next(err);
      });
});

router.delete('/favorites', (req, res, next) => {
  // if (req.cookies.token === undefined) {
  //   res.set('Content-type', 'plain/text');
  //   res.status(401).send('Unauthorized');
  // } else {
    const verifiedJwt = jwt.verify(req.cookies.token, process.env.JWT_KEY);
    const userId = verifiedJwt.user;
    let book;
    knex('favorites')
      .del()
      .where({
        book_id: req.body.bookId,
        user_id: userId
      }, '*')
      .first()
      .then((row) => {
        if (!row) {
          return next();
        }
        book = row;

        return knex('books')
          .del()
          .where('id', req.body.bookId);
      })
      .then(() => {
        delete book.id;
        res.set('Content-type', 'application/json');
        res.status(200).send(camelizeKeys(book));
      })
      .catch((err) => {
        next(err);
      });
})

module.exports = router;
