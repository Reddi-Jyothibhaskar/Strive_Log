import express from "express";
const router = express.Router();

import { getSubjectHistory } from "../controllers/history.controller.js";

router.get("/:id/history", getSubjectHistory);

export default router;