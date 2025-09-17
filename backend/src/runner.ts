import { INode, IWorkflow } from "./interfaces";
import { db } from "store/inMemoryStore";
import axios from "axios";

type NodeExecutor = (node: INode, input: any) => Promise<any>;
const executors: Record<string, NodeExecutor> = {};

executors.noop = async (node, input) => ({ ok: true, nodeId: node.id, input });

export function registerExecutor(type: string, fn: NodeExecutor) {
  executors[type] = fn;
}

export async function runWorkflow(workflow: IWorkflow, startNodeId: string, initialPayload: any) {
  const adj: Record<string, string[]> = {};
  for (const n of workflow.nodes) adj[n.id] = [];
  for (const c of workflow.connections) {
    adj[c.from] = adj[c.from] || [];
    adj[c.from].push(c.to);
  }
  const q: Array<{ nodeId: string; payload: any }> = [{ nodeId: startNodeId, payload: initialPayload }];
  const results: Record<string, any> = {};

  while (q.length) {
    const { nodeId, payload } = q.shift()!;
    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (!node) continue;
    if (node.disable) continue;

    const exec = executors[node.type];
    if (!exec) {
      results[nodeId] = { skipped: `no executor for ${node.type}` };
      for (const nid of adj[nodeId] ?? []) q.push({ nodeId: nid, payload: results[nodeId] });
      continue;
    }
    try {
      const out = await exec(node, payload);
      results[nodeId] = out;
      for (const nid of adj[nodeId] ?? []) q.push({ nodeId: nid, payload: out });
    } catch (err) {
      results[nodeId] = { error: (err as Error).message ?? String(err) };
      for (const nid of adj[nodeId] ?? []) q.push({ nodeId: nid, payload: results[nodeId] })
    }
  }
  return results;
}

executors.telegram = async (node, input) => {
  if (!node.credentialsId) throw new Error("telegram bhai kha ho");
  const cred = db.credentials.find((c) => c.id === node.credentialsId);
  if (!cred) throw new Error("telegram credential not found");
  const token = cred.data.api_key || cred.data.token;
  if (!token) throw new Error("telegram token missing in credentials");
  const chatId = node.parameters?.chat_id;
  const template = node.parameters?.message ?? "{{body}}";
  const message = template.replace("{body}}", JSON.stringify(input?.body ?? input));
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const resp = await axios.post(url, { chat_id: chatId, text: message });
  return resp.data;
};
