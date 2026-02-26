import express from 'express';
import { getTempTopics, createTempTopic, updateTempTopic, deleteTempTopic } from '../controllers/temp_topics.controllers.js';

const router = express.Router();

router.get('/:subject_id/temp_topics', getTempTopics);
router.post('/:subject_id/temp_topics', createTempTopic);
router.put('/:subject_id/temp_topics/:id', updateTempTopic);
router.delete('/:subject_id/temp_topics/:id', deleteTempTopic);

export default router;