import express = require('express');
import { resMessage } from '../utils';
const router = express.Router({ mergeParams: true });

router.get('/', async (_, res) => {
  try {
    const result = [
      { t: 1655704889, c: 60 },
      { t: 1655708889, c: 160 },
    ];
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(resMessage((<any>err).message));
  }
});

module.exports = {
  router,
  path: '/txnshistory',
};
