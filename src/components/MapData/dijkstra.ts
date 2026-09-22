export interface DijkstraResult {
  path: string[];
  totalDistance: number;
  found: boolean;
}

export interface GraphNodeMap {
  [nodeId: string]: {
    id: string;
    neighbors: Array<{
      nodeId: string;
      weight: number;
    }>;
  };
}

export function buildAdjacencyMap(graph: GraphNodeMap): GraphNodeMap {
  const adjacency: GraphNodeMap = {};

  for (const nodeId of Object.keys(graph)) {
    adjacency[nodeId] = {
      id: nodeId,
      neighbors: [...graph[nodeId].neighbors],
    };
  }

  for (const nodeId of Object.keys(adjacency)) {
    const node = adjacency[nodeId];
    for (const neighbor of node.neighbors) {
      if (!adjacency[neighbor.nodeId]) {
        adjacency[neighbor.nodeId] = { id: neighbor.nodeId, neighbors: [] };
      }
    }
  }

  return adjacency;
}

export function runDijkstra(
  graph: GraphNodeMap,
  startNodeId: string,
  destinationNodeId: string,
): DijkstraResult {
  if (!graph[startNodeId] || !graph[destinationNodeId]) {
    return { path: [], totalDistance: 0, found: false };
  }

  if (startNodeId === destinationNodeId) {
    return { path: [startNodeId], totalDistance: 0, found: true };
  }

  const adjacency = buildAdjacencyMap(graph);
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();

  for (const nodeId of Object.keys(adjacency)) {
    distances[nodeId] = Number.POSITIVE_INFINITY;
    previous[nodeId] = null;
  }

  distances[startNodeId] = 0;

  let currentNodeId = startNodeId;

  while (currentNodeId) {
    visited.add(currentNodeId);

    if (currentNodeId === destinationNodeId) {
      break;
    }

    const neighbors = adjacency[currentNodeId]?.neighbors ?? [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.nodeId)) {
        continue;
      }

      const tentativeDistance = distances[currentNodeId] + neighbor.weight;
      if (tentativeDistance < distances[neighbor.nodeId]) {
        distances[neighbor.nodeId] = tentativeDistance;
        previous[neighbor.nodeId] = currentNodeId;
      }
    }

    let nextNodeId: string | null = null;
    let nextDistance = Number.POSITIVE_INFINITY;

    for (const nodeId of Object.keys(adjacency)) {
      if (visited.has(nodeId)) {
        continue;
      }

      const candidateDistance = distances[nodeId];
      if (candidateDistance < nextDistance) {
        nextDistance = candidateDistance;
        nextNodeId = nodeId;
      }
    }

    currentNodeId = nextNodeId ?? null;
    if (currentNodeId === null) {
      break;
    }
  }

  if (distances[destinationNodeId] === Number.POSITIVE_INFINITY) {
    return { path: [], totalDistance: 0, found: false };
  }

  const path: string[] = [];
  let cursor: string | null = destinationNodeId;

  while (cursor) {
    path.unshift(cursor);
    const prev = previous[cursor];
    if (prev === null || prev === undefined) {
      break;
    }
    cursor = prev;
  }

  return {
    path,
    totalDistance: distances[destinationNodeId],
    found: true,
  };
}
