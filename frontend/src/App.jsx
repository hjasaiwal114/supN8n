import { useState, useCallbak, useCallback } from 'react';
import { ReactFlow, appNodeChanages, applyEdgeChanges, addEdge } from "@xyflow/react";
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const appNodeChanages = useCallback e(
    (changes) => setNodes((nodesSnapshot) => applyEdgeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setNode((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (param) => setEdges((edgesSnapshot) => assEdge(params, edgesSnapshot)),
  )


  return (
    <div>
      yha logic lagega kuch to
    </div>
  )
}
