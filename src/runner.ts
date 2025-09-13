import { INode, IWorkflow } from "./interfaces";

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
