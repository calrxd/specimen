/**
 * The tree model shared by Tree, TreeTable and OrgChart: flatten the visible nodes for
 * rendering and keyboard movement, find parents, collect descendants, and move a node for
 * drag and keyboard reordering. Pure functions over plain data, no React.
 */

export type TreeData = { id: string; children?: TreeData[] }

export type FlatNode<T extends TreeData> = {
  node: T
  level: number
  parentId: string | null
  posinset: number
  setsize: number
  hasChildren: boolean
}

/** The nodes a reader can see, in reading order, with their ARIA position data. */
export function flattenVisible<T extends TreeData>(nodes: T[], expanded: Set<string>, level = 1, parentId: string | null = null, out: FlatNode<T>[] = []) {
  nodes.forEach((node, i) => {
    const kids = (node.children ?? []) as T[]
    out.push({ node, level, parentId, posinset: i + 1, setsize: nodes.length, hasChildren: kids.length > 0 })
    if (kids.length && expanded.has(node.id)) flattenVisible(kids, expanded, level + 1, node.id, out)
  })
  return out
}

/** Every id below a node, not including the node itself. */
export function descendantIds<T extends TreeData>(node: T): string[] {
  return (node.children ?? []).flatMap((c) => [c.id, ...descendantIds(c)])
}

export function findNode<T extends TreeData>(nodes: T[], id: string): T | null {
  for (const n of nodes) {
    if (n.id === id) return n
    const hit = findNode((n.children ?? []) as T[], id)
    if (hit) return hit
  }
  return null
}

/** The siblings array that holds `id`, and its index there. */
function locate<T extends TreeData>(nodes: T[], id: string): { list: T[]; index: number } | null {
  const index = nodes.findIndex((n) => n.id === id)
  if (index >= 0) return { list: nodes, index }
  for (const n of nodes) {
    const hit = locate((n.children ?? []) as T[], id)
    if (hit) return hit
  }
  return null
}

const clone = <T extends TreeData>(nodes: T[]): T[] => nodes.map((n) => ({ ...n, children: n.children ? clone(n.children as T[]) : undefined }))

/**
 * Moves `id` next to `targetId` (before or after it, as a sibling). Returns the new tree,
 * or the same tree when the move is impossible: onto itself, or into its own branch.
 */
export function moveNode<T extends TreeData>(nodes: T[], id: string, targetId: string, place: 'before' | 'after'): T[] {
  if (id === targetId) return nodes
  const moving = findNode(nodes, id)
  if (!moving || descendantIds(moving).includes(targetId)) return nodes
  const next = clone(nodes)
  const from = locate(next, id)
  if (!from) return nodes
  const [node] = from.list.splice(from.index, 1)
  const to = locate(next, targetId)
  if (!to) return nodes
  to.list.splice(place === 'before' ? to.index : to.index + 1, 0, node)
  return next
}

/** Moves `id` one place up or down among its siblings. */
export function shiftNode<T extends TreeData>(nodes: T[], id: string, by: -1 | 1): T[] {
  const next = clone(nodes)
  const at = locate(next, id)
  if (!at) return nodes
  const to = at.index + by
  if (to < 0 || to >= at.list.length) return nodes
  const [node] = at.list.splice(at.index, 1)
  at.list.splice(to, 0, node)
  return next
}

/** Selection state of a parent in a multi-select tree: all, some, or none of its branch. */
export function branchState<T extends TreeData>(node: T, selected: Set<string>): 'all' | 'some' | 'none' {
  const ids = descendantIds(node)
  if (!ids.length) return selected.has(node.id) ? 'all' : 'none'
  const n = ids.filter((i) => selected.has(i)).length
  return n === ids.length ? 'all' : n === 0 ? 'none' : 'some'
}
