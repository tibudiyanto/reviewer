import type { GitFile } from "../types";
import { FileTree } from "./FileTree";
import { DiffViewer } from "./DiffViewer";
import { StatusBar } from "./StatusBar";

type FocusedPane = 'files' | 'diff';

interface LayoutProps {
  files: GitFile[];
  selectedFileIndex: number;
  onFileSelect: (index: number) => void;
  focusedPane: FocusedPane;
  scrollOffsets: {
    files: number;
    diff: number;
  };
}

export function Layout({ files, selectedFileIndex, onFileSelect, focusedPane, scrollOffsets }: LayoutProps) {
  return (
    <box flexDirection="column" flexGrow={1}>
      {/* Main content area */}
      <box flexDirection="row" flexGrow={1}>
        {/* Left Panel - File Tree (max 1/3 width) */}
        <box 
          width="33%" 
          border 
          borderStyle="single" 
          borderColor={focusedPane === 'files' ? "#00aaff" : "#666666"}
          title={focusedPane === 'files' ? "Files (focused)" : "Files"}
          titleAlignment="center"
        >
          <FileTree 
            files={files}
            selectedIndex={selectedFileIndex}
            onSelect={onFileSelect}
            focused={focusedPane === 'files'}
            scrollOffset={scrollOffsets.files}
          />
        </box>
        
        {/* Right Panel - Diff Viewer (remaining 2/3 width) */}  
        <box 
          flexGrow={1} 
          border
          borderStyle="single"
          borderColor={focusedPane === 'diff' ? "#00aaff" : "#666666"}
          title={focusedPane === 'diff' ? "Diff (focused)" : "Diff"}
          titleAlignment="center"
        >
          <DiffViewer 
            file={files[selectedFileIndex] || null}
            focused={focusedPane === 'diff'}
            scrollOffset={scrollOffsets.diff}
          />
        </box>
      </box>
      
      {/* Status bar at bottom */}
      <StatusBar focusedPane={focusedPane} />
    </box>
  );
}