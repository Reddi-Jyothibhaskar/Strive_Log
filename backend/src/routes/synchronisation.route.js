import syncTodayHandler from '../controllers/synchronisation.controller.js'
import express from 'express'

const router = express.Router();

router.post('/sync-today', syncTodayHandler);

export default router;