export type NodeType = 'webhook' | 'telegram' | 'noop' | 'httpRequest';

export interface IConnection {
  from: string;
  to: string;
}

export interface INode {
  id: string;
  name?: string;
  type: NodeType;
  parameters?: Record<string, any>;
  credentialsId?: number | null;
  disable?: boolean;
}

export interface IWorkflow {
  id?: number;
  title: string;
  enable?: boolean; nodes: INode[];
  connections: IConnection[];
} 
