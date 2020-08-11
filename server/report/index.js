'use strict';

import express from 'express';
import { index, pdf } from './report.controller';

const router = express.Router();

router.get('/', index);
router.get('/pdf', pdf);

export default router;
