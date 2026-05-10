import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Files, Search, GitGraph, Bug, Square, Settings, User, 
  ChevronRight, ChevronDown, Folder, FileCode, X, Plus,
  Terminal as TerminalIcon, Maximize2, SplitSquareHorizontal,
  MoreHorizontal, Play, RefreshCw, Check, AlertCircle, Bell,
  Database, Command, Moon, Sun,
  Trash2, FilePlus, FolderPlus
} from 'lucide-react';
import { FileNode, Tab, SideBarView, CommandPaletteItem } from './types';
import './App.css';

// Initial file system structure
const initialFiles: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        isOpen: false,
        children: [
          { id: '3', name: 'Button.tsx', type: 'file', language: 'typescript', content: `import React from 'react';\n\ninterface ButtonProps {\n  children: React.ReactNode;\n  onClick?: () => void;\n  variant?: 'primary' | 'secondary';\n}\n\nexport const Button: React.FC<ButtonProps> = ({\n  children,\n  onClick,\n  variant = 'primary'\n}) => {\n  return (\n    <button\n      className={\`btn btn-\${variant}\`}\n      onClick={onClick}\n    >\n      {children}\n    </button>\n  );\n};` },
          { id: '4', name: 'Input.tsx', type: 'file', language: 'typescript', content: `import React from 'react';\n\ninterface InputProps {\n  value: string;\n  onChange: (value: string) => void;\n  placeholder?: string;\n  type?: 'text' | 'password' | 'email';\n}\n\nexport const Input: React.FC<InputProps> = ({\n  value,\n  onChange,\n  placeholder,\n  type = 'text'\n}) => {\n  return (\n    <input\n      type={type}\n      value={value}\n      onChange={(e) => onChange(e.target.value)}\n      placeholder={placeholder}\n      className="input"\n    />\n  );\n};` }
        ]
      },
      { id: '5', name: 'App.tsx', type: 'file', language: 'typescript', content: `import React from 'react';\nimport { Button } from './components/Button';\nimport { Input } from './components/Input';\n\nfunction App() {\n  const [count, setCount] = React.useState(0);\n\n  return (\n    <div className="app">\n      <h1>VSCode Clone</h1>\n      <p>Count: {count}</p>\n      <Button onClick={() => setCount(c => c + 1)}>\n        Increment\n      </Button>\n      <Input value="" onChange={() => {}} placeholder="Enter text..." />\n    </div>\n  );\n}\n\nexport default App;` },
      { id: '6', name: 'main.tsx', type: 'file', language: 'typescript', content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);` },
      { id: '7', name: 'index.css', type: 'file', language: 'css', content: `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n  background: #1e1e1e;\n  color: #cccccc;\n}\n\n.app {\n  padding: 20px;\n}` },
      { id: '8', name: 'utils.ts', type: 'file', language: 'typescript', content: `export const cn = (...classes: (string | undefined | null | false)[]) => {\n  return classes.filter(Boolean).join(' ');\n};\n\nexport const debounce = <T extends (...args: any[]) => any>(\n  func: T,\n  wait: number\n): ((...args: Parameters<T>) => void) => {\n  let timeout: NodeJS.Timeout;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => func(...args), wait);\n  };\n};` }
    ]
  },
  {
    id: '9',
    name: 'public',
    type: 'folder',
    isOpen: false,
    children: [
      { id: '10', name: 'index.html', type: 'file', language: 'html', content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>VSCode Clone</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>` },
      { id: '11', name: 'favicon.ico', type: 'file', language: 'plaintext', content: '' }
    ]
  },
  { id: '12', name: 'package.json', type: 'file', language: 'json', content: `{\n  "name": "vscode-clone",\n  "version": "1.0.0",\n  "private": true,\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}` },
  { id: '13', name: 'tsconfig.json', type: 'file', language: 'json', content: `{\n  "compilerOptions": {\n    "target": "ES2020",\n    "useDefineForClassFields": true,\n    "lib": ["ES2020", "DOM", "DOM.Iterable"],\n    "module": "ESNext",\n    "skipLibCheck": true,\n    "moduleResolution": "bundler",\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "jsx": "react-jsx",\n    "strict": true,\n    "noEmit": true,\n    "esModuleInterop": true,\n    "allowSyntheticDefaultImports": true,\n    "forceConsistentCasingInFileNames": true\n  },\n  "include": ["src"]\n}` },
  {
    id: '14',
    name: 'README.md',
    type: 'file',
    language: 'markdown',
    content: `# VSCode Clone\n\nA web-based Visual Studio Code clone built with React and Monaco Editor.\n\n## Features\n\n- File Explorer\n- Code Editor with Syntax Highlighting\n- Terminal\n- Tabs\n- Command Palette\n- Search\n- Git Integration (UI)\n- Extensions Panel\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``
  },
  { id: '15', name: '.gitignore', type: 'file', language: 'plaintext', content: `node_modules\ndist\n.env\n.env.local\n*.log` }
];

function App() {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [sideBarView, setSideBarView] = useState<SideBarView>('explorer');
  const [showSideBar, setShowSideBar] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalHeight] = useState(200);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [gitBranch] = useState('main');
  const [gitChanges] = useState(3);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [editorContent, setEditorContent] = useState('');
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'warning' | 'error' }[]>([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [terminalCommands, setTerminalCommands] = useState<string[]>(['Welcome to VSCode Terminal', '$ npm install', 'Done in 2.3s']);
  const [terminalInput, setTerminalInput] = useState('');
  const editorRef = useRef<any>(null);

  // Flatten files for search
  const flattenFiles = (nodes: FileNode[]): FileNode[] => {
    let result: FileNode[] = [];
    for (const node of nodes) {
      result.push(node);
      if (node.children) {
        result = result.concat(flattenFiles(node.children));
      }
    }
    return result;
  };

  const allFiles = flattenFiles(files);

  // Open file in tab
  const openFile = useCallback((file: FileNode) => {
    if (file.type !== 'file') return;
    
    const existingTab = tabs.find(t => t.fileId === file.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const newTab: Tab = {
      id: `tab-${file.id}`,
      fileId: file.id,
      name: file.name,
      language: file.language || 'plaintext',
      content: file.content || '',
      isDirty: false
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setEditorContent(file.content || '');
  }, [tabs]);

  // Close tab
  const closeTab = useCallback((tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId) {
        const closedTabIndex = prev.findIndex(t => t.id === tabId);
        const newActiveTab = newTabs[closedTabIndex - 1] || newTabs[closedTabIndex] || null;
        setActiveTabId(newActiveTab?.id || null);
        if (newActiveTab) {
          const file = allFiles.find(f => f.id === newActiveTab.fileId);
          setEditorContent(file?.content || '');
        }
      }
      return newTabs;
    });
  }, [activeTabId, allFiles]);

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Handle editor change
  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || '';
    setEditorContent(newContent);
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return { ...tab, content: newContent, isDirty: true };
      }
      return tab;
    }));
  };

  // Save file
  const saveFile = useCallback(() => {
    if (!activeTabId) return;
    
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return;

    setFiles(prev => updateFileContent(prev, activeTab.fileId, editorContent));
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return { ...tab, isDirty: false };
      }
      return tab;
    }));

    addNotification('File saved successfully', 'info');
  }, [activeTabId, tabs, editorContent]);

  // Update file content in file tree
  const updateFileContent = (nodes: FileNode[], fileId: string, content: string): FileNode[] => {
    return nodes.map(node => {
      if (node.id === fileId) {
        return { ...node, content };
      }
      if (node.children) {
        return { ...node, children: updateFileContent(node.children, fileId, content) };
      }
      return node;
    });
  };

  // Add notification
  const addNotification = (message: string, type: 'info' | 'warning' | 'error') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Command palette items
  const commandPaletteItems: CommandPaletteItem[] = [
    { id: 'new-file', label: 'File: New File', category: 'File', action: () => addNotification('New file created', 'info') },
    { id: 'open-file', label: 'File: Open File...', category: 'File', action: () => addNotification('Open file dialog', 'info') },
    { id: 'save', label: 'File: Save', category: 'File', action: saveFile },
    { id: 'save-all', label: 'File: Save All', category: 'File', action: () => addNotification('All files saved', 'info') },
    { id: 'close-tab', label: 'View: Close Editor', category: 'View', action: () => activeTabId && closeTab(activeTabId, { stopPropagation: () => {} } as any) },
    { id: 'toggle-terminal', label: 'View: Toggle Terminal', category: 'View', action: () => setShowTerminal(prev => !prev) },
    { id: 'toggle-sidebar', label: 'View: Toggle Sidebar', category: 'View', action: () => setShowSideBar(prev => !prev) },
    { id: 'toggle-theme', label: 'Preferences: Toggle Theme', category: 'Preferences', action: () => setIsDarkTheme(prev => !prev) },
    { id: 'format-doc', label: 'Format Document', category: 'Edit', action: () => addNotification('Document formatted', 'info') },
    { id: 'find', label: 'Find in File', category: 'Edit', action: () => addNotification('Find dialog opened', 'info') },
    { id: 'replace', label: 'Replace in File', category: 'Edit', action: () => addNotification('Replace dialog opened', 'info') },
    { id: 'git-commit', label: 'Git: Commit', category: 'Git', action: () => addNotification('Git commit dialog', 'info') },
    { id: 'git-push', label: 'Git: Push', category: 'Git', action: () => addNotification('Git push initiated', 'info') },
    { id: 'git-pull', label: 'Git: Pull', category: 'Git', action: () => addNotification('Git pull initiated', 'info') },
    { id: 'run-task', label: 'Tasks: Run Task', category: 'Tasks', action: () => addNotification('Task runner opened', 'info') },
    { id: 'build', label: 'Run Build Task', category: 'Tasks', action: () => {
      setTerminalCommands(prev => [...prev, '$ npm run build', 'Build completed successfully!']);
    }},
  ];

  const filteredCommands = commandPaletteItems.filter(cmd =>
    cmd.label.toLowerCase().includes(commandQuery.toLowerCase())
  );

  // Handle terminal input
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    setTerminalCommands(prev => [...prev, `$ ${cmd}`]);

    // Simulate command responses
    setTimeout(() => {
      let response = '';
      if (cmd === 'ls' || cmd === 'dir') {
        response = allFiles.filter(f => f.type === 'file').map(f => f.name).join('  ');
      } else if (cmd === 'pwd') {
        response = '/home/user/vscode-clone';
      } else if (cmd === 'clear') {
        setTerminalCommands([]);
        setTerminalInput('');
        return;
      } else if (cmd === 'help') {
        response = 'Available commands: ls, pwd, clear, help, npm install, npm run dev, npm run build';
      } else if (cmd === 'npm install') {
        response = 'Done in 1.2s\n15 packages installed';
      } else if (cmd === 'npm run dev') {
        response = 'Starting development server...\nServer running at http://localhost:5173';
      } else if (cmd === 'npm run build') {
        response = 'Building...\nBuild completed successfully!';
      } else if (cmd.startsWith('echo ')) {
        response = cmd.slice(5);
      } else if (cmd === 'git status') {
        response = `On branch ${gitBranch}\nChanges not staged for commit:\n  modified: src/App.tsx\n\n${gitChanges} files changed`;
      } else {
        response = `Command not found: ${cmd}`;
      }
      setTerminalCommands(prev => [...prev, response]);
    }, 100);

    setTerminalInput('');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
        setCommandQuery('');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setShowTerminal(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setShowSideBar(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveFile]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  // File tree component
  const FileTree = ({ nodes, level = 0 }: { nodes: FileNode[]; level?: number }) => {
    return (
      <div className="file-tree">
        {nodes.map(node => {
          const isExpanded = expandedFolders.has(node.id);
          const isFolder = node.type === 'folder';

          return (
            <div key={node.id}>
              <div
                className={`file-item ${isFolder ? 'folder' : 'file'} ${level === 0 ? 'root' : ''}`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={() => isFolder ? toggleFolder(node.id) : openFile(node)}
              >
                <span className="file-icon">
                  {isFolder ? (
                    isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                  ) : (
                    <span style={{ width: 14 }} />
                  )}
                </span>
                <span className="file-icon-type">
                  {isFolder ? (
                    <Folder size={14} className="folder-icon" />
                  ) : (
                    getFileIcon(node.name)
                  )}
                </span>
                <span className="file-name">{node.name}</span>
              </div>
              {isFolder && isExpanded && node.children && (
                <FileTree nodes={node.children} level={level + 1} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return <FileCode size={14} className="ts-icon" />;
      case 'js':
      case 'jsx':
        return <FileCode size={14} className="js-icon" />;
      case 'css':
        return <FileCode size={14} className="css-icon" />;
      case 'html':
        return <FileCode size={14} className="html-icon" />;
      case 'json':
        return <FileCode size={14} className="json-icon" />;
      case 'md':
        return <FileCode size={14} className="md-icon" />;
      default:
        return <FileCode size={14} />;
    }
  };

  // Search results
  const searchResults = searchQuery
    ? allFiles.filter(f => 
        f.type === 'file' && 
        (f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         f.content?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className={`vscode-container ${isDarkTheme ? 'dark' : 'light'}`}>
      {/* Command Palette */}
      {showCommandPalette && (
        <div className="command-palette-overlay" onClick={() => setShowCommandPalette(false)}>
          <div className="command-palette" onClick={e => e.stopPropagation()}>
            <div className="command-palette-input">
              <Command size={18} />
              <input
                type="text"
                placeholder="Type a command or search..."
                value={commandQuery}
                onChange={e => setCommandQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="command-palette-results">
              {filteredCommands.map(cmd => (
                <div
                  key={cmd.id}
                  className="command-item"
                  onClick={() => {
                    cmd.action();
                    setShowCommandPalette(false);
                  }}
                >
                  <span className="command-label">{cmd.label}</span>
                  {cmd.category && <span className="command-category">{cmd.category}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Bar */}
      <div className="activity-bar">
        <div className="activity-item active" onClick={() => { setSideBarView('explorer'); setShowSideBar(true); }}>
          <Files size={24} />
        </div>
        <div className="activity-item" onClick={() => { setSideBarView('search'); setShowSideBar(true); }}>
          <Search size={24} />
        </div>
        <div className="activity-item" onClick={() => { setSideBarView('source-control'); setShowSideBar(true); }}>
          <div className="activity-badge">
            <GitGraph size={24} />
            <span className="badge-count">{gitChanges}</span>
          </div>
        </div>
        <div className="activity-item" onClick={() => { setSideBarView('debug'); setShowSideBar(true); }}>
          <Bug size={24} />
        </div>
        <div className="activity-item" onClick={() => { setSideBarView('extensions'); setShowSideBar(true); }}>
          <Square size={24} />
        </div>
        <div className="activity-spacer" />
        <div className="activity-item" onClick={() => addNotification('Settings opened', 'info')}>
          <Settings size={24} />
        </div>
        <div className="activity-item" onClick={() => addNotification('Account menu', 'info')}>
          <User size={24} />
        </div>
      </div>

      {/* Side Bar */}
      {showSideBar && (
        <div className="side-bar">
          <div className="side-bar-header">
            <span className="side-bar-title">
              {sideBarView === 'explorer' && 'EXPLORER'}
              {sideBarView === 'search' && 'SEARCH'}
              {sideBarView === 'source-control' && 'SOURCE CONTROL'}
              {sideBarView === 'debug' && 'RUN AND DEBUG'}
              {sideBarView === 'extensions' && 'EXTENSIONS'}
            </span>
            <div className="side-bar-actions">
              <MoreHorizontal size={16} className="action-icon" />
            </div>
          </div>

          {/* Explorer View */}
          {sideBarView === 'explorer' && (
            <div className="explorer-content">
              <div className="explorer-section">
                <div className="explorer-section-header">
                  <ChevronDown size={14} />
                  <span>VSCODE-CLONE</span>
                </div>
                <div className="explorer-actions">
                  <FilePlus size={14} className="explorer-action" />
                  <FolderPlus size={14} className="explorer-action" />
                  <RefreshCw size={14} className="explorer-action" />
                </div>
                <FileTree nodes={files} />
              </div>
            </div>
          )}

          {/* Search View */}
          {sideBarView === 'search' && (
            <div className="search-content">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="search-results">
                {searchResults.map(file => (
                  <div key={file.id} className="search-result-item" onClick={() => openFile(file)}>
                    <FileCode size={14} />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Control View */}
          {sideBarView === 'source-control' && (
            <div className="source-control-content">
              <div className="sc-header">
                <span>SOURCE CONTROL</span>
                <RefreshCw size={14} className="refresh-icon" />
              </div>
              <div className="sc-input">
                <input type="text" placeholder="Message (Ctrl+Enter to commit)" />
              </div>
              <div className="sc-changes">
                <div className="sc-section">
                  <ChevronDown size={14} />
                  <span>Changes ({gitChanges})</span>
                </div>
                <div className="sc-file-change">
                  <FileCode size={14} className="modified" />
                  <span>src/App.tsx</span>
                  <span className="sc-status">M</span>
                </div>
              </div>
            </div>
          )}

          {/* Debug View */}
          {sideBarView === 'debug' && (
            <div className="debug-content">
              <div className="debug-actions">
                <button className="debug-btn primary">
                  <Play size={16} fill="currentColor" /> Run and Debug
                </button>
              </div>
              <div className="debug-section">
                <ChevronRight size={14} />
                <span>RUN AND DEBUG</span>
              </div>
              <div className="debug-info">
                <p>To customize Run and Debug create a launch.json file.</p>
              </div>
            </div>
          )}

          {/* Extensions View */}
          {sideBarView === 'extensions' && (
            <div className="extensions-content">
              <div className="extensions-search">
                <input type="text" placeholder="Search Extensions in Marketplace" />
              </div>
              <div className="extensions-list">
                <div className="extension-item">
                  <div className="extension-icon"><FileCode size={20} /></div>
                  <div className="extension-info">
                    <span className="extension-name">Prettier</span>
                    <span className="extension-desc">Code formatter</span>
                  </div>
                </div>
                <div className="extension-item">
                  <div className="extension-icon"><FileCode size={20} /></div>
                  <div className="extension-info">
                    <span className="extension-name">ESLint</span>
                    <span className="extension-desc">JavaScript linting</span>
                  </div>
                </div>
                <div className="extension-item">
                  <div className="extension-icon"><FileCode size={20} /></div>
                  <div className="extension-info">
                    <span className="extension-name">GitLens</span>
                    <span className="extension-desc">Git supercharged</span>
                  </div>
                </div>
                <div className="extension-item">
                  <div className="extension-icon"><FileCode size={20} /></div>
                  <div className="extension-info">
                    <span className="extension-name">Live Server</span>
                    <span className="extension-desc">Launch dev server</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
                onClick={() => {
                  setActiveTabId(tab.id);
                  const file = allFiles.find(f => f.id === tab.fileId);
                  setEditorContent(file?.content || tab.content);
                }}
              >
                {getFileIcon(tab.name)}
                <span>{tab.name}</span>
                {tab.isDirty && <span className="dirty-indicator">●</span>}
                <X size={14} className="tab-close" onClick={e => closeTab(tab.id, e)} />
              </div>
            ))}
          </div>
          <div className="tabs-actions">
            <Plus size={18} className="tab-action" />
            <SplitSquareHorizontal size={18} className="tab-action" />
            <MoreHorizontal size={18} className="tab-action" />
          </div>
        </div>

        {/* Breadcrumb */}
        {activeTab && (
          <div className="breadcrumb">
            <span>src</span>
            <ChevronRight size={14} />
            <span>components</span>
            <ChevronRight size={14} />
            <span>{activeTab.name}</span>
          </div>
        )}

        {/* Editor */}
        <div className="editor-container">
          {activeTab ? (
            <Editor
              height="100%"
              language={activeTab.language}
              value={editorContent}
              onChange={handleEditorChange}
              theme={isDarkTheme ? 'vs-dark' : 'light'}
              onMount={(editor) => {
                editorRef.current = editor;
                editor.onDidChangeCursorPosition((e: any) => {
                  setCursorPosition({
                    line: e.position.lineNumber,
                    column: e.position.column
                  });
                });
              }}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderWhitespace: 'selection',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                padding: { top: 8 },
              }}
            />
          ) : (
            <div className="editor-empty">
              <Command size={64} className="empty-icon" />
              <h2>VSCode Clone</h2>
              <p>Select a file to start editing</p>
              <div className="empty-hints">
                <div className="hint"><span className="hint-key">Ctrl+P</span> Search files</div>
                <div className="hint"><span className="hint-key">Ctrl+Shift+P</span> Command palette</div>
                <div className="hint"><span className="hint-key">Ctrl+`</span> Toggle terminal</div>
                <div className="hint"><span className="hint-key">Ctrl+B</span> Toggle sidebar</div>
                <div className="hint"><span className="hint-key">Ctrl+S</span> Save file</div>
              </div>
            </div>
          )}
        </div>

        {/* Terminal */}
        {showTerminal && (
          <div className="terminal-container" style={{ height: terminalHeight }}>
            <div className="terminal-header">
              <div className="terminal-tabs">
                <div className="terminal-tab active">
                  <TerminalIcon size={14} />
                  <span>Terminal</span>
                </div>
                <div className="terminal-tab">
                  <Play size={14} />
                  <span>Output</span>
                </div>
                <div className="terminal-tab">
                  <AlertCircle size={14} />
                  <span>Problems</span>
                </div>
                <div className="terminal-tab">
                  <Database size={14} />
                  <span>Debug Console</span>
                </div>
              </div>
              <div className="terminal-actions">
                <Plus size={14} className="terminal-action" />
                <Trash2 size={14} className="terminal-action" />
                <Maximize2 size={14} className="terminal-action" />
                <X size={14} className="terminal-action" onClick={() => setShowTerminal(false)} />
              </div>
            </div>
            <div className="terminal-content">
              <div className="terminal-output">
                {terminalCommands.map((cmd, i) => (
                  <div key={i} className="terminal-line">{cmd}</div>
                ))}
              </div>
              <form onSubmit={handleTerminalSubmit} className="terminal-input-form">
                <span className="terminal-prompt">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={e => setTerminalInput(e.target.value)}
                  className="terminal-input"
                  autoFocus
                />
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <div className="status-item" onClick={() => setSideBarView('source-control')}>
            <GitGraph size={14} />
            <span>{gitBranch}</span>
            {gitChanges > 0 && <span className="status-badge">{gitChanges}</span>}
          </div>
          <div className="status-item">
            <RefreshCw size={14} />
            <span>0↓ 1↑</span>
          </div>
          <div className="status-item">
            <AlertCircle size={14} />
            <span>0</span>
            <AlertCircle size={14} />
            <span>0</span>
          </div>
        </div>
        <div className="status-right">
          {activeTab && (
            <>
              <div className="status-item">
                <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
              </div>
              <div className="status-item">
                <span>Spaces: 2</span>
              </div>
              <div className="status-item">
                <span>UTF-8</span>
              </div>
              <div className="status-item">
                <span>{activeTab.language.toUpperCase()}</span>
              </div>
            </>
          )}
          <div className="status-item" onClick={() => setIsDarkTheme(prev => !prev)}>
            {isDarkTheme ? <Moon size={14} /> : <Sun size={14} />}
          </div>
          <div className="status-item">
            <Bell size={14} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            {notification.type === 'info' && <Check size={16} />}
            {notification.type === 'warning' && <AlertCircle size={16} />}
            {notification.type === 'error' && <AlertCircle size={16} />}
            <span>{notification.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
