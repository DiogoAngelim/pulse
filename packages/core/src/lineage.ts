import type { LineageEdge, LineageNode } from "./entities.js";

export function traceLineage(edges: LineageEdge[], target: LineageNode): { nodes: LineageNode[]; edges: LineageEdge[] } {
  const discoveredNodes = new Map<string, LineageNode>();
  const discoveredEdges: LineageEdge[] = [];
  const queue: string[] = [target.id];

  discoveredNodes.set(target.id, target);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const edge of edges) {
      if (edge.to.id !== currentId) {
        continue;
      }

      discoveredEdges.push(edge);
      if (!discoveredNodes.has(edge.from.id)) {
        discoveredNodes.set(edge.from.id, edge.from);
        queue.push(edge.from.id);
      }
      if (!discoveredNodes.has(edge.to.id)) {
        discoveredNodes.set(edge.to.id, edge.to);
      }
    }
  }

  return {
    nodes: [...discoveredNodes.values()],
    edges: discoveredEdges
  };
}

