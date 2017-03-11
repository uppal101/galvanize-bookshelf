'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const { decamelizeKeys, camelizeKeys } = require('humps');
const cookieParser = require('cookie-parser');

router.get('/favorites', (req, res, next) => {
  if (req.cookies.token === undefined) {
    res.set('Content-type', 'plain/text');
    res.status(401).send('Unauthorized');
  } else {
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
  }
});

router.get('/favorites/:check', (req, res, next) => {
  if (req.cookies.token === undefined) {
    res.set('Content-type', 'plain/text');
    res.status(401).send('Unauthorized');
  }
  else {
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
  }
});

module.exports = router;
