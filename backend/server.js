import express from "express";
const app = express();
import dotenv from "dotenv";
import subjectsRoutes from "./src/routes/subjects.routes.js";
import tempTopicRoutes from "./src/routes/temp_topics.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";

dotenv.config();    

app.use(express.json());
app.use("/api/subjects", subjectsRoutes);
app.use("/api/subjects", tempTopicRoutes);
app.use("/api/analytics", analyticsRoutes);
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 