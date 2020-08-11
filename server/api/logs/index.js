'use strict';

import express from 'express';
import { index } from './log.controller';

const router = express.Router();

router.get('/', index);

export default router;
