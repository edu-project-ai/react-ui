import type { FileNode, TreeData } from '../types';

// ─────────────────────────────────────────────
// Icon mapping by file extension
// ─────────────────────────────────────────────

const EXT_ICON_MAP: Record<string, string> = {
  '.ts': 'codicon-file-code',
  '.tsx': 'codicon-file-code',
  '.js': 'codicon-file-code',
  '.jsx': 'codicon-file-code',
  '.py': 'codicon-file-code',
  '.go': 'codicon-file-code',
  '.rs': 'codicon-file-code',
  '.java': 'codicon-file-code',
  '.c': 'codicon-file-code',
  '.cpp': 'codicon-file-code',
  '.cs': 'codicon-file-code',
  '.rb': 'codicon-file-code',
  '.php': 'codicon-file-code',
  '.swift': 'codicon-file-code',
  '.kt': 'codicon-file-code',
  '.sh': 'codicon-symbol-event',
  '.bash': 'codicon-symbol-event',
  '.json': 'codicon-json',
  '.yaml': 'codicon-file-code',
  '.yml': 'codicon-file-code',
  '.html': 'codicon-file-code',
  '.css': 'codicon-file-code',
  '.scss': 'codicon-file-code',
  '.md': 'codicon-markdown',
  '.mdx': 'codicon-markdown',
  '.svg': 'codicon-file-media',
  '.png': 'codicon-file-media',
  '.jpg': 'codicon-file-media',
  '.gif': 'codicon-file-media',
  '.toml': 'codicon-settings-gear',
  '.xml': 'codicon-file-code',
  '.sql': 'codicon-database',
};

export function getFileIcon(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot < 0) return 'codicon-file';
  const ext = name.slice(dot).toLowerCase();
  return EXT_ICON_MAP[ext] ?? 'codicon-file';
}

// ─────────────────────────────────────────────
// Sort file tree nodes (folders first, alphabetical)
// ─────────────────────────────────────────────

export function sortFileTreeNodes(nodes: FileNode[]): FileNode[] {
  const folders = nodes
    .filter((n) => n.type === 'folder')
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );

  const files = nodes
    .filter((n) => n.type === 'file')
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );

  return [
    ...folders.map((f) => ({
      ...f,
      children: f.children ? sortFileTreeNodes(f.children) : undefined,
    })),
    ...files,
  ];
}

// ─────────────────────────────────────────────
// Tree data transformation
// ─────────────────────────────────────────────

function buildTreeFromFlat(nodes: FileNode[]): TreeData[] {
  const root: Map<string, TreeData> = new Map();
  const allNodes: Map<string, TreeData> = new Map();

  nodes.forEach((node) => {
    const treeNode: TreeData = {
      id: node.path,
      name: node.name,
      isFolder: node.type === 'folder',
      children: node.type === 'folder' ? [] : undefined,
    };
    allNodes.set(node.path, treeNode);
  });

  nodes.forEach((node) => {
    const pathParts = node.path.split('/');

    if (pathParts.length === 1) {
      root.set(node.path, allNodes.get(node.path)!);
    } else {
      let currentPath = '';
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        const parentPath = currentPath ? `${currentPath}/${part}` : part;
        if (!allNodes.has(parentPath)) {
          const parentNode: TreeData = {
            id: parentPath,
            name: part,
            isFolder: true,
            children: [],
          };
          allNodes.set(parentPath, parentNode);
          if (i === 0) {
            root.set(parentPath, parentNode);
          }
        }

        currentPath = parentPath;
      }
      const parentPath = pathParts.slice(0, -1).join('/');
      const parent = allNodes.get(parentPath);
      const currentNode = allNodes.get(node.path);

      if (parent && currentNode && parent.children) {
        if (!parent.children.some((child) => child.id === currentNode.id)) {
          parent.children.push(currentNode);
        }
      }
    }
  });

  return Array.from(root.values());
}

export function toTreeData(nodes: FileNode[]): TreeData[] {
  const hasNestedChildren = nodes.some(
    (n) => n.children && n.children.length > 0,
  );

  if (hasNestedChildren) {
    return nodes.map((n) => ({
      id: n.path,
      name: n.name,
      isFolder: n.type === 'folder',
      children: n.children ? toTreeData(n.children) : undefined,
    }));
  } else {
    return buildTreeFromFlat(nodes);
  }
}
