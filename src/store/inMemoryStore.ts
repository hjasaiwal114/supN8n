import { IWorkflow } from "interfaces";

let workflowedId = 1;
let credentialId = 1;
let webhookId = 1;

export const db = {
  workflows: [] as IWorkflow[],
  credtials: [] as any[],
  webhooks: [] as any[],
};

export function createWorkflow(wf: Omit<IWorkflow, "id">): IWorkflow {
  const row: IWorkflow = { ...wf, id: workflowedId++ };
  db.workflows.push(row);
  return row;
}

export function getWorkflow(id: number) {
  return db.workflows.find((w) => w.id === id) ?? null;
}

export function listWorkflows() {
  return db.workflows;
}

export function updateWorkflows(id: number, wf: Omit<IWorkflow, "id">) {
  const idx = db.workflows.findIndex((w) => w.id === w.id);
  if (idx === -1) return null;
  db.workflows[idx] = { ...wf, id };
  return db.workflows[idx];
}
