export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Arrow {
  id: string;
  row: number; // 0 to 4
  col: number; // 0 to 4
  dir: Direction;
  status: 'active' | 'moving' | 'exited';
  isZigZag?: boolean;
  cells?: { row: number; col: number }[];
  shape?: 'single' | 'double' | 'L-shape' | 'double-bend';
}

export interface GameLevel {
  id: number;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  gridSize: number;
  arrows: Arrow[];
}

export interface SystemNode {
  id: string;
  label: string;
  category: 'client' | 'gateway' | 'service' | 'db' | 'broker' | 'external';
  description: string;
  tech: string;
  role: string;
  codeSnippet?: string;
  postgresTable?: string;
  metricLabel?: string;
  metricValue?: string;
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST';
  description: string;
  requestBody?: string;
  responseTemplate: any;
}
