import { memo, useState, useMemo, useCallback, type ReactNode } from "react";

// ============================================================================
// Types
// ============================================================================

interface FileExplorerProps {
  files: string[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
}

// ============================================================================
// Icons
// ============================================================================

const getFileIcon = (fileName: string): ReactNode => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  
  const iconMap: Record<string, { color: string; icon: ReactNode }> = {
    py: { 
      color: "text-[#3572A5]", 
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9.585 11.692h4.328s2.432.039 2.432-2.35V5.391S16.714 3 11.936 3C7.362 3 7.647 4.983 7.647 4.983l.006 2.055h4.363v.617H5.92s-2.927-.332-2.927 4.282 2.555 4.45 2.555 4.45h1.524v-2.141s-.083-2.554 2.513-2.554zm-.056-6.123a.828.828 0 110 1.656.828.828 0 010-1.656z"/><path d="M14.415 12.308h-4.328s-2.432-.039-2.432 2.35v3.951s-.369 2.391 4.409 2.391c4.573 0 4.288-1.983 4.288-1.983l-.006-2.055h-4.363v-.617h6.097s2.927.332 2.927-4.282-2.555-4.45-2.555-4.45h-1.524v2.141s.083 2.554-2.513 2.554zm.056 6.123a.828.828 0 110-1.656.828.828 0 010 1.656z"/></svg>
    },
    js: { 
      color: "text-[#F7DF1E]", 
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3V3zm16.525 13.707c-.131-.821-.666-1.511-2.252-2.155-.552-.259-1.165-.438-1.349-.854-.068-.248-.078-.382-.034-.529.113-.484.687-.629 1.137-.495.293.09.563.315.732.676.775-.507.775-.507 1.316-.844-.203-.314-.304-.451-.439-.586-.473-.528-1.103-.798-2.126-.775l-.528.067c-.507.124-.991.395-1.283.754-.855.968-.608 2.655.427 3.354 1.023.765 2.521.933 2.712 1.653.18.878-.652 1.159-1.475 1.058-.607-.136-.945-.439-1.316-1.002l-1.372.788c.157.359.337.517.607.832 1.305 1.316 4.568 1.249 5.153-.754.021-.067.18-.528.056-1.237l.006.003zm-6.737-5.434h-1.686c0 1.453-.007 2.898-.007 4.354 0 .924.047 1.772-.104 2.033-.247.517-.886.451-1.175.359-.297-.146-.448-.349-.623-.641-.047-.078-.082-.146-.095-.146l-1.368.844c.229.473.563.879.994 1.137.641.383 1.502.507 2.404.305.588-.17 1.095-.519 1.358-1.059.384-.697.302-1.553.299-2.509.008-1.541 0-3.083 0-4.635l.003-.042z"/></svg>
    },
    ts: { 
      color: "text-[#3178C6]", 
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/></svg>
    },
    tsx: { color: "text-[#3178C6]", icon: <span className="text-[10px] font-bold">TSX</span> },
    jsx: { color: "text-[#61DAFB]", icon: <span className="text-[10px] font-bold">JSX</span> },
    cs: { color: "text-[#512BD4]", icon: <span className="text-[10px] font-bold">C#</span> },
    java: { color: "text-[#ED8B00]", icon: <span className="text-[10px] font-bold">JA</span> },
    go: { color: "text-[#00ADD8]", icon: <span className="text-[10px] font-bold">GO</span> },
    rs: { color: "text-[#CE422B]", icon: <span className="text-[10px] font-bold">RS</span> },
    rb: { color: "text-[#CC342D]", icon: <span className="text-[10px] font-bold">RB</span> },
    php: { color: "text-[#777BB4]", icon: <span className="text-[10px] font-bold">PHP</span> },
    html: { color: "text-[#E34F26]", icon: <span className="text-[10px] font-bold">HTM</span> },
    css: { color: "text-[#1572B6]", icon: <span className="text-[10px] font-bold">CSS</span> },
    json: { color: "text-[#CBCB41]", icon: <span className="text-[10px] font-bold">{"{}"}</span> },
    md: { color: "text-[#083FA1]", icon: <span className="text-[10px] font-bold">MD</span> },
    txt: { color: "text-zinc-400", icon: <span className="text-[10px] font-bold">TXT</span> },
    yaml: { color: "text-[#CB171E]", icon: <span className="text-[10px] font-bold">YML</span> },
    yml: { color: "text-[#CB171E]", icon: <span className="text-[10px] font-bold">YML</span> },
  };

  const config = iconMap[ext];
  if (config) {
    return <span className={`${config.color} w-4 h-4 flex items-center justify-center`}>{config.icon}</span>;
  }
  
  // Default file icon
  return (
    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
};

const ChevronIcon = memo(({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-3 h-3 text-zinc-500 transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
));
ChevronIcon.displayName = "ChevronIcon";

const FolderIcon = memo(({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-4 h-4 ${isOpen ? "text-[#dcb67a]" : "text-[#c09553]"}`}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    {isOpen ? (
      <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v1H3v9a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7z" />
    ) : (
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    )}
  </svg>
));
FolderIcon.displayName = "FolderIcon";

// ============================================================================
// Tree Builder Utility
// ============================================================================

const buildFileTree = (files: string[]): TreeNode[] => {
  const root: TreeNode[] = [];
  
  files.forEach(filePath => {
    const parts = filePath.split("/");
    let currentLevel = root;
    
    parts.forEach((part, index) => {
      const isFolder = index < parts.length - 1;
      const existingNode = currentLevel.find(n => n.name === part);
      
      if (existingNode) {
        currentLevel = existingNode.children;
      } else {
        const newNode: TreeNode = {
          name: part,
          path: parts.slice(0, index + 1).join("/"),
          isFolder,
          children: [],
        };
        currentLevel.push(newNode);
        currentLevel = newNode.children;
      }
    });
  });
  
  // Sort: folders first, then files, alphabetically
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .map(node => ({
        ...node,
        children: sortNodes(node.children),
      }))
      .sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });
  };
  
  return sortNodes(root);
};

// ============================================================================
// Sub-components
// ============================================================================

interface TreeNodeItemProps {
  node: TreeNode;
  depth: number;
  activeFile: string | null;
  expandedFolders: Set<string>;
  onFileSelect: (path: string) => void;
  onToggleFolder: (path: string) => void;
}

const TreeNodeItem = memo(({ 
  node, 
  depth, 
  activeFile, 
  expandedFolders, 
  onFileSelect, 
  onToggleFolder 
}: TreeNodeItemProps) => {
  const isExpanded = expandedFolders.has(node.path);
  const isActive = node.path === activeFile;
  const paddingLeft = 8 + depth * 12;

  if (node.isFolder) {
    return (
      <div>
        <button
          onClick={() => onToggleFolder(node.path)}
          className="w-full flex items-center gap-1 py-0.5 text-sm text-left text-zinc-300 hover:bg-[#2a2d2e] transition-colors"
          style={{ paddingLeft }}
        >
          <ChevronIcon isOpen={isExpanded} />
          <FolderIcon isOpen={isExpanded} />
          <span className="truncate">{node.name}</span>
        </button>
        {isExpanded && (
          <div>
            {node.children.map(child => (
              <TreeNodeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                expandedFolders={expandedFolders}
                onFileSelect={onFileSelect}
                onToggleFolder={onToggleFolder}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onFileSelect(node.path)}
      className={`
        w-full flex items-center gap-2 py-0.5 text-sm text-left transition-colors
        ${isActive
          ? "bg-[#37373d] text-zinc-100"
          : "text-zinc-400 hover:bg-[#2a2d2e] hover:text-zinc-200"
        }
      `}
      style={{ paddingLeft: paddingLeft + 16 }}
    >
      {getFileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </button>
  );
});
TreeNodeItem.displayName = "TreeNodeItem";

// ============================================================================
// Main Component
// ============================================================================

export const FileExplorer = memo(({ files, activeFile, onFileSelect }: FileExplorerProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    // Expand all folders by default
    const folders = new Set<string>();
    files.forEach(file => {
      const parts = file.split("/");
      for (let i = 1; i < parts.length; i++) {
        folders.add(parts.slice(0, i).join("/"));
      }
    });
    return folders;
  });

  const fileTree = useMemo(() => buildFileTree(files), [files]);

  const handleToggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-xs text-zinc-500 text-center">
          Немає файлів для відображення
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Project Root Header */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] uppercase tracking-wider text-zinc-500 font-semibold border-b border-[#1a1a1a]">
        <span>Sandbox</span>
      </div>

      {/* File Tree */}
      <div className="py-1">
        {fileTree.map(node => (
          <TreeNodeItem
            key={node.path}
            node={node}
            depth={0}
            activeFile={activeFile}
            expandedFolders={expandedFolders}
            onFileSelect={onFileSelect}
            onToggleFolder={handleToggleFolder}
          />
        ))}
      </div>
    </div>
  );
});

FileExplorer.displayName = "FileExplorer";
