import express from "express";
import cors from "cors";
import { compareRouter } from "./routes/compare";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", compareRouter);

app.get("/healthz", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Aggregator API Server running on http://localhost:${PORT}`);
});
