'use strict';

import express from 'express';
import { index } from './report.controller';

const router = express.Router();

router.get('/', index);

export default router;
