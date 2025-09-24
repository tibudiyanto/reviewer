# Reviewer - TUI Code Review Tool

A terminal-based code review interface built with [OpenTUI React](https://github.com/sst/opentui) that runs in git repositories to display file changes and allow interactive commenting on code.

## Project Overview

Reviewer is a TUI application that provides an intuitive interface for reviewing code changes directly in the terminal. It parses git diffs, presents them in a readable format, and allows users to add comments to specific lines or sections of code.

### Key Features

- **Git Integration**: Automatically detects git repositories and reads diff information
- **Interactive Diff Viewer**: Navigate through changed files with keyboard shortcuts
- **Line-by-line Comments**: Add, edit, and view comments on specific code lines
- **Syntax Highlighting**: Enhanced readability for different file types
- **Keyboard Navigation**: Vim-like keybindings for efficient navigation
- **Comment Persistence**: Save and load comments for ongoing reviews

## Architecture

### Core Components

#### 1. **DiffViewer** (`src/components/DiffViewer.tsx`)
Main component that renders the diff interface
- Displays file changes in unified diff format
- Handles keyboard navigation between files and hunks
- Manages comment overlay rendering

#### 2. **FileTree** (`src/components/FileTree.tsx`)
Sidebar component showing changed files
- Lists all modified files with change indicators
- Allows quick navigation to specific files
- Shows file status (added, modified, deleted)

#### 3. **CommentPanel** (`src/components/CommentPanel.tsx`)
Interface for adding and viewing comments
- Floating panel for comment input
- Comment thread display for existing comments
- Markdown support for rich comment formatting

#### 4. **StatusBar** (`src/components/StatusBar.tsx`)
Bottom status bar with navigation hints
- Display current file and position
- Show available keyboard shortcuts
- Git branch and commit information

### Services

#### 1. **GitService** (`src/services/git.ts`)
Handles all git-related operations
- Parse git diff output
- Extract file changes and hunks
- Detect repository information

#### 2. **GitNotesService** (`src/services/git-notes.ts`)
Manages PR review data using git notes
- Store/retrieve review data as git notes on commits
- Handle PR comment persistence and synchronization
- Manage review state across different commits

#### 3. **SyntaxHighlighter** (`src/services/syntax.ts`)
Provides syntax highlighting for code
- Language detection based on file extensions
- Terminal-compatible color schemes
- Diff-aware highlighting

### State Management

#### 1. **AppState** (`src/state/app.ts`)
Global application state
```typescript
interface AppState {
  currentFile: string | null;
  currentLine: number;
  files: GitFile[];
  comments: Comment[];
  mode: 'diff' | 'comment' | 'help';
  viewport: ViewportState;
}
```

#### 2. **Navigation State** (`src/state/navigation.ts`)
Handles navigation between files and lines
- Track current position in diff
- Manage scroll position
- Handle keyboard shortcuts

## Key Interactions

### Navigation
- `j/k` - Navigate up/down by line
- `J/K` - Navigate up/down by hunk
- `n/p` - Next/previous file
- `g/G` - Go to beginning/end of file
- `/` - Search within current file

### Comments
- `c` - Add comment at current line
- `e` - Edit existing comment
- `d` - Delete comment
- `v` - View comment thread
- `Enter` - Save comment
- `Escape` - Cancel comment editing

### Views
- `f` - Toggle file tree sidebar
- `h` - Show help
- `q` - Quit application
- `r` - Refresh diff

## Git Notes Integration

### Storage Strategy
PR review data is stored using git notes with the namespace `refs/notes/reviewer`:

```bash
# Store review data for a commit
git notes --ref=reviewer add -m '{"to":"abc123","comments":[...]}' <commit>

# Retrieve review data
git notes --ref=reviewer show <commit>

# List all reviewed commits
git notes --ref=reviewer list
```

### Git Notes Service Implementation
```typescript
class GitNotesService {
  private static NOTES_REF = 'reviewer';
  
  async saveReview(commitHash: string, reviewData: PRReviewData): Promise<void>
  async loadReview(commitHash: string): Promise<PRReviewData | null>
  async listReviews(): Promise<string[]> // Returns commit hashes with reviews
  async deleteReview(commitHash: string): Promise<void>
  async syncNotes(): Promise<void> // Push/pull notes to/from remote
}
```

### Review Data Flow
1. **Load**: On startup, scan git notes to load existing reviews
2. **Save**: When comments are added/modified, update git notes immediately
3. **Sync**: Option to push/pull notes to share reviews across team
4. **Associate**: Comments are linked to specific commits and file lines

## Data Models

### PR Review Data (Git Notes)
```typescript
interface PRReviewData {
  to: string; // Target commit hash
  comments: PRComment[];
  metadata?: {
    author: string;
    timestamp: Date;
    reviewId: string;
  };
}
```

### PRComment
```typescript
interface PRComment {
  id: string;
  file: string;
  lines: {
    start: number;
    end?: number; // For multi-line comments
  };
  comment: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
  thread?: PRComment[]; // Reply threads
}
```

### GitFile
```typescript
interface GitFile {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  hunks: GitHunk[];
  language?: string;
  comments?: PRComment[]; // Associated comments
}
```

### GitHunk
```typescript
interface GitHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}
```

### DiffLine
```typescript
interface DiffLine {
  type: 'added' | 'removed' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
  hasComment?: boolean; // Visual indicator
}
```

## Technical Requirements

### Dependencies
- **@opentui/react**: TUI rendering framework
- **@opentui/core**: Core TUI functionality
- **react**: Component library
- **simple-git**: Git operations and notes management
- **highlight.js**: Syntax highlighting
- **markdown-it**: Markdown parsing for comments

### File Structure
```
src/
├── components/
│   ├── DiffViewer.tsx
│   ├── FileTree.tsx
│   ├── CommentPanel.tsx
│   ├── StatusBar.tsx
│   └── HelpPanel.tsx
├── services/
│   ├── git.ts
│   ├── git-notes.ts
│   └── syntax.ts
├── state/
│   ├── app.ts
│   └── navigation.ts
├── hooks/
│   ├── useGit.ts
│   ├── useGitNotes.ts
│   └── useKeyboard.ts
├── utils/
│   ├── diff-parser.ts
│   ├── file-utils.ts
│   └── color-scheme.ts
└── index.tsx
```

## Development Guidelines

### Code Style
- Use TypeScript for all source files
- Follow React functional component patterns
- Use custom hooks for state logic
- Implement keyboard-first navigation
- Maintain terminal-friendly color schemes

### Testing
- Unit tests for services and utilities
- Integration tests for git operations
- Manual testing on various repository types
- Test keyboard navigation flows

### Performance Considerations
- Lazy load large diffs
- Virtual scrolling for long files
- Debounce keyboard input
- Cache syntax highlighting results

## Usage Examples

### Basic Usage
```bash
# Navigate to git repository
cd /path/to/repo

# Run reviewer
reviewer

# Or specify commit range
reviewer HEAD~3..HEAD

# Compare branches
reviewer main..feature-branch
```

### Git Notes Operations
```bash
# Review specific commit range
reviewer HEAD~3..HEAD

# Review and sync notes with remote
reviewer --sync-notes

# Export review data
reviewer --export-review review.md

# Import review from another repository
reviewer --import-notes origin/reviewer
```

### Collaborative Reviews
```bash
# Push review notes to remote
git push origin refs/notes/reviewer

# Fetch review notes from remote  
git fetch origin refs/notes/reviewer:refs/notes/reviewer

# Merge review notes from team members
git notes --ref=reviewer merge origin/reviewer
```

This TUI application provides a focused, keyboard-driven interface for efficient code review workflows directly in the terminal, leveraging the power of OpenTUI for rich terminal interfaces.