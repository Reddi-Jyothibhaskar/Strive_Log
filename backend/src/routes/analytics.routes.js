import express from "express";
import { getSummary } from "../controllers/analytics.controller.js";

const router = express.Router();
router.get("/summary", getSummary);

export default router;