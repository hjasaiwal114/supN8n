import express from "express";
import cors from "cors";
import { runWorkflow } from "./runner";
import {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  updateWorkflows,
} from "./store/inMemoryStore";
import { IWorkflow } from "./interfaces";

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ ok: true, msg: "lets see " });
});

app.post("/workflow", (req, res) => {
  const body = req.body as Omit<IWorkflow, "id">;
  if (!body?.title) return res.status(400).json({ error: "title required:" });
  const wf = createWorkflow(body);
  res.json(wf);
});
app.get("/workflow/:id", (req, res) => {
  const wf = getWorkflow(Number(req.params.id));
  if (!wf) return res.status(404).json({ error: "not found" });
  res.json(wf);
});

app.put("/workflow/:id", (req, res) => {
  const id = Number(req.params.id);
  const body = req.body as Omit<IWorkflow, "id">;
  const updated = updateWorkflows(id, body);
  if (!updated) return res.status(404).json({ error: "not found" });
  res.json(updated);
});

app.post("/workflow/:id/run", async (req, res) => {
  const id = Number(req.params.id);
  const wf = getWorkflow(id);
  if (!wf) return res.status(404).json({ error: "not found" });
  const startNode = wf.nodes[0];
  if (!startNode) return res.status(400).json({ error: "no nodes" });
  const initialPayload = req.body ?? {}
  try {
    const result = await runWorkflow(wf, startNode.id, initialPayload);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`server started on https://localhost:${PORT}`);
});
