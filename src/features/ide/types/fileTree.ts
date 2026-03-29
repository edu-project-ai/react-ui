export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export interface TreeData {
  id: string;
  name: string;
  children?: TreeData[];
  isFolder: boolean;
}
