import express from "express";
const app = express();
import dotenv from "dotenv";
import subjectsRoutes from "./src/routes/subjects.routes.js";
import tempTopicRoutes from "./src/routes/temp_topics.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import synchronisationRoute from "./src/routes/synchronisation.route.js";
import historyRoute from "./src/routes/history.routes.js";
import cors from "cors";
dotenv.config();    

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use(express.json());
app.use("/api/subjects", subjectsRoutes);
app.use("/api/subjects", tempTopicRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api", synchronisationRoute);
app.use("/api/subject", historyRoute);

app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 