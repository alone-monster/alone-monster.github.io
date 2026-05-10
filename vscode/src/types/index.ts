export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
  isOpen?: boolean;
  parentId?: string;
}

export interface Tab {
  id: string;
  fileId: string;
  name: string;
  language: string;
  content: string;
  isDirty: boolean;
}

export interface TerminalState {
  id: string;
  name: string;
  isActive: boolean;
}

export type SideBarView = 'explorer' | 'search' | 'source-control' | 'debug' | 'extensions';

export type ActivityBarItem = 'explorer' | 'search' | 'source-control' | 'debug' | 'extensions' | 'settings' | 'account';

export interface CommandPaletteItem {
  id: string;
  label: string;
  category?: string;
  action: () => void;
}

export interface EditorState {
  tabs: Tab[];
  activeTabId: string | null;
  cursorPosition: { line: number; column: number };
}

export interface FileSystemState {
  files: FileNode[];
  expandedFolders: Set<string>;
  selectedFileId: string | null;
}
