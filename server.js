import express from "express";
import cors from "cors";
import medibotRoutes from "./routes/medibot.js"; // ✅ EXACT path

const app = express();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 // 👈 IMPORTANT (match frontend)

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/medibot", medibotRoutes);

app.get("/", (req, res) => {
  res.send("MediBot backend running 🚀");
});
