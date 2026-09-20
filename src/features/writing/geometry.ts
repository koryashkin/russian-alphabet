export type Point = { x: number; y: number }
export type Stroke = Point[]
export const tracePaths: Record<string, string[]> = {
  'М': ['M 25 80 L 25 20', 'M 25 20 L 50 58 L 75 20', 'M 75 20 L 75 80'],
  'О': ['M 50 18 C 10 18 10 82 50 82 C 90 82 90 18 50 18'],
  'Ё': ['M 30 25 L 30 82', 'M 30 25 L 73 25', 'M 30 52 L 65 52', 'M 30 82 L 73 82', 'M 39 12 L 39 13', 'M 63 12 L 63 13'],
  'Ь': ['M 30 20 L 30 80', 'M 30 50 C 85 43 85 88 30 80'],
}
export function normalizePoint(clientX: number, clientY: number, rect: Pick<DOMRect, 'left'|'top'|'width'|'height'>): Point {
  return { x: Math.max(0, Math.min(100, (clientX - rect.left) / rect.width * 100)), y: Math.max(0, Math.min(100, (clientY - rect.top) / rect.height * 100)) }
}
