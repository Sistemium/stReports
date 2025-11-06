import express from 'express';
import { renderHandler } from './report.controller.js';

const router = express.Router();

router.get('/:format', renderHandler);

export default router;
