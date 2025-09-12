import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ ok: true, msg: "lets see " });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`server started on https://localhost:${PORT}`);
});
