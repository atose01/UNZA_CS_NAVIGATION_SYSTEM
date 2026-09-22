import { describe, expect, it } from 'vitest';
import { runDijkstra } from './dijkstra';

describe('Dijkstra routing', () => {
  it('finds the shortest route in a simple graph', () => {
    const graph = {
      start: { id: 'start', neighbors: [{ nodeId: 'a', weight: 4 }, { nodeId: 'b', weight: 2 }] },
      a: { id: 'a', neighbors: [{ nodeId: 'c', weight: 3 }, { nodeId: 'b', weight: 1 }] },
      b: { id: 'b', neighbors: [{ nodeId: 'a', weight: 1 }, { nodeId: 'c', weight: 5 }, { nodeId: 'end', weight: 6 }] },
      c: { id: 'c', neighbors: [{ nodeId: 'end', weight: 2 }] },
      end: { id: 'end', neighbors: [] },
    };

    const result = runDijkstra(graph, 'start', 'end');

    expect(result.found).toBe(true);
    expect(result.path).toEqual(['start', 'b', 'end']);
    expect(result.totalDistance).toBe(8);
  });

  it('returns no route for unreachable nodes', () => {
    const graph = {
      start: { id: 'start', neighbors: [] },
      end: { id: 'end', neighbors: [] },
    };

    expect(runDijkstra(graph, 'start', 'end').found).toBe(false);
  });

  it('handles the same start and destination', () => {
    const graph = {
      start: { id: 'start', neighbors: [{ nodeId: 'end', weight: 5 }] },
      end: { id: 'end', neighbors: [] },
    };

    const result = runDijkstra(graph, 'start', 'start');

    expect(result.found).toBe(true);
    expect(result.path).toEqual(['start']);
    expect(result.totalDistance).toBe(0);
  });
});
