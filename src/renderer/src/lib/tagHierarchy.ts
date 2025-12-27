/**
 * Tag Hierarchy - Support for nested tags using path notation
 *
 * Tags like #research/statistics/mediation create a hierarchy:
 * - research
 *   - statistics
 *     - mediation
 */

import { TagWithCount } from '../types'

export interface TagTreeNode {
  name: string
  fullPath: string
  tag?: TagWithCount  // The actual tag if it exists as a standalone tag
  children: TagTreeNode[]
  totalCount: number  // Sum of all descendant counts
}

/**
 * Parse a tag name into path segments
 * e.g., "research/statistics/mediation" -> ["research", "statistics", "mediation"]
 */
export function parseTagPath(tagName: string): string[] {
  return tagName.split('/').filter(Boolean)
}

/**
 * Get the parent path of a tag
 * e.g., "research/statistics/mediation" -> "research/statistics"
 */
export function getParentPath(tagName: string): string | null {
  const segments = parseTagPath(tagName)
  if (segments.length <= 1) return null
  return segments.slice(0, -1).join('/')
}

/**
 * Get the leaf name (last segment) of a tag
 * e.g., "research/statistics/mediation" -> "mediation"
 */
export function getLeafName(tagName: string): string {
  const segments = parseTagPath(tagName)
  return segments[segments.length - 1] || tagName
}

/**
 * Check if a tag is a child of another tag
 */
export function isChildOf(tagName: string, parentPath: string): boolean {
  return tagName.startsWith(parentPath + '/')
}

/**
 * Build a tree structure from flat tags
 */
export function buildTagTree(tags: TagWithCount[]): TagTreeNode[] {
  const root: TagTreeNode[] = []
  const nodeMap = new Map<string, TagTreeNode>()

  // Sort tags by path depth (parents before children)
  const sortedTags = [...tags].sort((a, b) => {
    const depthA = parseTagPath(a.name).length
    const depthB = parseTagPath(b.name).length
    return depthA - depthB
  })

  for (const tag of sortedTags) {
    const segments = parseTagPath(tag.name)
    let currentPath = ''
    let parentNode: TagTreeNode | null = null

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const isLast = i === segments.length - 1
      currentPath = currentPath ? `${currentPath}/${segment}` : segment

      let node = nodeMap.get(currentPath)

      if (!node) {
        // Create new node
        node = {
          name: segment,
          fullPath: currentPath,
          children: [],
          totalCount: 0
        }
        nodeMap.set(currentPath, node)

        // Attach to parent or root
        if (parentNode) {
          parentNode.children.push(node)
        } else {
          root.push(node)
        }
      }

      // If this is the actual tag (not an intermediate path), attach it
      if (isLast) {
        node.tag = tag
        node.totalCount = tag.note_count

        // Propagate count up to parents
        let parent = parentNode
        while (parent) {
          parent.totalCount += tag.note_count
          const parentPath = getParentPath(parent.fullPath)
          parent = parentPath ? nodeMap.get(parentPath) || null : null
        }
      }

      parentNode = node
    }
  }

  // Sort children alphabetically
  const sortTree = (nodes: TagTreeNode[]): TagTreeNode[] => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortTree(node.children)
      }
    })
    return nodes
  }

  return sortTree(root)
}

/**
 * Flatten tree back to sorted list (for flat view)
 */
export function flattenTree(nodes: TagTreeNode[]): TagWithCount[] {
  const result: TagWithCount[] = []

  const traverse = (node: TagTreeNode) => {
    if (node.tag) {
      result.push(node.tag)
    }
    node.children.forEach(traverse)
  }

  nodes.forEach(traverse)
  return result
}

/**
 * Get all ancestor paths for a tag
 * e.g., "research/statistics/mediation" -> ["research", "research/statistics"]
 */
export function getAncestorPaths(tagName: string): string[] {
  const segments = parseTagPath(tagName)
  const ancestors: string[] = []

  for (let i = 1; i < segments.length; i++) {
    ancestors.push(segments.slice(0, i).join('/'))
  }

  return ancestors
}

/**
 * Check if any tag in the list is a descendant of the given path
 */
export function hasDescendants(path: string, tags: TagWithCount[]): boolean {
  return tags.some(tag => isChildOf(tag.name, path))
}

/**
 * Group tags by their top-level parent
 */
export function groupByTopLevel(tags: TagWithCount[]): Map<string, TagWithCount[]> {
  const groups = new Map<string, TagWithCount[]>()

  for (const tag of tags) {
    const segments = parseTagPath(tag.name)
    const topLevel = segments[0]

    const existing = groups.get(topLevel) || []
    existing.push(tag)
    groups.set(topLevel, existing)
  }

  return groups
}
