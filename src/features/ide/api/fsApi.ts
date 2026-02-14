import axios from 'axios';

const PROXY_HTTP_URL =
  import.meta.env.VITE_WS_PROXY_URL
    ?.replace('ws://', 'http://')
    ?.replace('wss://', 'https://') ?? 'http://localhost:8080';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export async function fetchFileTree(containerId: string): Promise<FileNode[]> {
  const { data } = await axios.get<FileNode[]>(`${PROXY_HTTP_URL}/fs/tree`, {
    params: { id: containerId },
  });
  return data;
}

export async function readFile(
  containerId: string,
  path: string,
): Promise<string> {
  const { data } = await axios.get<string>(`${PROXY_HTTP_URL}/fs/file`, {
    params: { id: containerId, path },
    responseType: 'text',
    transformResponse: [(d) => d], // prevent axios from auto-parsing JSON
  });
  return data;
}

export async function writeFile(
  containerId: string,
  path: string,
  content: string,
): Promise<void> {
  await axios.post(`${PROXY_HTTP_URL}/fs/file`, content, {
    params: { id: containerId, path },
    headers: { 'Content-Type': 'text/plain' },
  });
}
