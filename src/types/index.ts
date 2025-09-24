export interface GitFile {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  hunks: GitHunk[];
  language?: string;
  comments?: PRComment[];
}

export interface GitHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'added' | 'removed' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
  hasComment?: boolean;
}

export interface PRComment {
  id: string;
  file: string;
  lines: {
    start: number;
    end?: number;
  };
  comment: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
  thread?: PRComment[];
}

export interface AppState {
  currentFile: string | null;
  currentLine: number;
  files: GitFile[];
  comments: PRComment[];
  mode: 'diff' | 'comment' | 'help';
  selectedFileIndex: number;
  focusedPane: 'files' | 'diff';
  scrollOffsets: {
    files: number;
    diff: number;
  };
}

export interface ViewportState {
  scrollTop: number;
  scrollLeft: number;
  height: number;
  width: number;
}