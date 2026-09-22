export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  bidirectional?: boolean;
}

export const navigationGraphNodes: GraphNode[] = [
  { id: 'entrance-door', label: 'Department Entrance', x: 57, y: 97 },
  { id: 'main-corridor-1', label: 'Main Corridor 1', x: 53, y: 82 },
  { id: 'main-corridor-2', label: 'Main Corridor 2', x: 53, y: 60 },
  { id: 'main-corridor-3', label: 'Main Corridor 3', x: 53, y: 40 },
  { id: 'main-corridor-4', label: 'Main Corridor 4', x: 53, y: 20 },
  { id: 'left-corridor-1', label: 'Left Corridor 1', x: 22, y: 82 },
  { id: 'left-corridor-2', label: 'Left Corridor 2', x: 22, y: 60 },
  { id: 'left-corridor-3', label: 'Left Corridor 3', x: 22, y: 40 },
  { id: 'left-corridor-4', label: 'Left Corridor 4', x: 22, y: 20 },
  { id: 'right-corridor-1', label: 'Right Corridor 1', x: 75, y: 82 },
  { id: 'right-corridor-2', label: 'Right Corridor 2', x: 75, y: 60 },
  { id: 'right-corridor-3', label: 'Right Corridor 3', x: 75, y: 40 },
  { id: 'right-corridor-4', label: 'Right Corridor 4', x: 75, y: 20 },
  { id: 'hod-door', label: 'Head of Computer Science', x: 12, y: 17 },
  { id: 'secretary-door', label: "Secretary's Office", x: 12, y: 27 },
  { id: 'messenger-door', label: "Messenger's Office", x: 12, y: 35 },
  { id: 'electrical-services-door', label: 'Electrical Services', x: 9, y: 7 },
  { id: 'cs-r2-door', label: 'Computer Studies Room 2', x: 12, y: 37 },
  { id: 'cs-r3-door', label: 'Computer Studies Room 3', x: 12, y: 47 },
  { id: 'cs-r4-door', label: 'Computer Studies Room 4', x: 12, y: 57 },
  { id: 'cs-r5-door', label: 'Computer Studies Room 5', x: 12, y: 67 },
  { id: 'cs-r6-door', label: 'Computer Studies Room 6', x: 12, y: 77 },
  { id: 'staff-only-door', label: 'Staff Only', x: 12, y: 88 },
  { id: 'ladies-door', label: "Ladies' Toilet", x: 7, y: 10 },
  { id: 'lab-1-door', label: 'Computer Lab 1', x: 53, y: 22 },
  { id: 'lab-2-door', label: 'Computer Lab 2', x: 53, y: 42 },
  { id: 'lab-3-door', label: 'Computer Lab 3', x: 53, y: 62 },
  { id: 'seminar-door', label: 'Seminar Room', x: 62, y: 87 },
  { id: 'visitors-toilet-door', label: 'Students and Visitors Toilet', x: 73, y: 88 },
  { id: 'hardware-lab-door', label: 'Hardware Lab', x: 91, y: 89 },
];

export const navigationGraphEdges: GraphEdge[] = [
  { from: 'entrance-door', to: 'main-corridor-1', weight: 15 },
  { from: 'main-corridor-1', to: 'left-corridor-1', weight: 34 },
  { from: 'main-corridor-1', to: 'right-corridor-1', weight: 22 },
  { from: 'main-corridor-1', to: 'main-corridor-2', weight: 22 },
  { from: 'main-corridor-2', to: 'left-corridor-2', weight: 31 },
  { from: 'main-corridor-2', to: 'right-corridor-2', weight: 22 },
  { from: 'main-corridor-2', to: 'main-corridor-3', weight: 20 },
  { from: 'main-corridor-3', to: 'left-corridor-3', weight: 31 },
  { from: 'main-corridor-3', to: 'right-corridor-3', weight: 22 },
  { from: 'main-corridor-3', to: 'main-corridor-4', weight: 20 },
  { from: 'main-corridor-4', to: 'left-corridor-4', weight: 31 },
  { from: 'main-corridor-4', to: 'right-corridor-4', weight: 22 },
  { from: 'left-corridor-1', to: 'staff-only-door', weight: 8 },
  { from: 'left-corridor-1', to: 'cs-r6-door', weight: 8 },
  { from: 'left-corridor-2', to: 'cs-r5-door', weight: 8 },
  { from: 'left-corridor-2', to: 'cs-r4-door', weight: 8 },
  { from: 'left-corridor-3', to: 'cs-r3-door', weight: 8 },
  { from: 'left-corridor-3', to: 'cs-r2-door', weight: 8 },
  { from: 'left-corridor-4', to: 'secretary-door', weight: 8 },
  { from: 'left-corridor-4', to: 'messenger-door', weight: 8 },
  { from: 'left-corridor-4', to: 'hod-door', weight: 13 },
  { from: 'left-corridor-4', to: 'electrical-services-door', weight: 12 },
  { from: 'left-corridor-4', to: 'ladies-door', weight: 10 },
  { from: 'right-corridor-1', to: 'seminar-door', weight: 12 },
  { from: 'right-corridor-1', to: 'visitors-toilet-door', weight: 12 },
  { from: 'right-corridor-1', to: 'hardware-lab-door', weight: 18 },
  { from: 'right-corridor-2', to: 'lab-3-door', weight: 8 },
  { from: 'right-corridor-3', to: 'lab-2-door', weight: 8 },
  { from: 'right-corridor-4', to: 'lab-1-door', weight: 8 },
  { from: 'main-corridor-1', to: 'entrance-door', weight: 15 },
  { from: 'main-corridor-1', to: 'staff-only-door', weight: 20 },
  { from: 'main-corridor-2', to: 'lab-3-door', weight: 18 },
  { from: 'main-corridor-3', to: 'lab-2-door', weight: 18 },
  { from: 'main-corridor-4', to: 'lab-1-door', weight: 18 },
];

export const navigationGraphById = new Map(navigationGraphNodes.map((node) => [node.id, node]));

export function getNodeCoordinates(nodeId: string): { x: number; y: number } | null {
  const node = navigationGraphById.get(nodeId);
  return node ? { x: node.x, y: node.y } : null;
}
