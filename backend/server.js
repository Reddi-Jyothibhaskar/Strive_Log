import express from "express";
const app = express();
import dotenv from "dotenv";
import subjectsRoutes from "./src/routes/subjects.routes.js";

dotenv.config();    

app.use(express.json());
app.use("/api/subjects", subjectsRoutes);
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 