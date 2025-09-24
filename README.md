# Reviewer - TUI Code Review Tool

A terminal-based code review interface built with [OpenTUI React](https://github.com/sst/opentui) that runs in git repositories to display file changes and allow interactive navigation of code diffs.

![Reviewer TUI Screenshot](docs/screenshot.png)

## Features

- **Real Git Integration**: Automatically detects git repositories and reads actual diff information
- **Interactive Diff Viewer**: Navigate through changed files with keyboard shortcuts
- **Syntax Highlighting**: Enhanced readability with color-coded additions and removals
- **Vim-like Navigation**: Efficient keyboard shortcuts for power users
- **Scrollable Interface**: Smooth scrolling through large diffs
- **File Status Support**: Handles added, modified, and deleted files

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/reviewer.git
cd reviewer
bun install
```

## Usage

Navigate to any git repository with changes and run:

```bash
bun run src/index.tsx
```

The application will automatically detect dirty files in your git repository and display their diffs.

## Keyboard Shortcuts

### Navigation
- `h` / `l` - Switch between file list and diff viewer
- `Ctrl+w` - Switch panes (alternative)
- `Tab` - Switch panes (alternative)

### File Navigation (when file list is focused)
- `j` / `k` or `↓` / `↑` - Navigate up/down through files

### Diff Navigation (when diff viewer is focused)
- `j` / `k` or `↓` / `↑` - Scroll through diff content

### General
- `q` or `Escape` - Quit application

## Supported File States

- **Modified** (`M`) - Files with changes compared to HEAD
- **Added** (`A`) - New files added to the repository
- **Deleted** (`D`) - Files removed from the repository
- **Staged** - Files staged for commit

## Technical Details

### Architecture

- **GitService**: Handles git operations using `simple-git`
- **DiffViewer**: Renders diffs with syntax highlighting and scrolling
- **FileTree**: Displays changed files with status indicators
- **Layout**: Manages the two-pane interface

### Dependencies

- **@opentui/react**: TUI rendering framework
- **@opentui/core**: Core TUI functionality
- **react**: Component library
- **simple-git**: Git operations and diff generation

### Diff Parsing

The application parses unified diff format and extracts:
- Hunk headers (`@@ -old,count +new,count @@`)
- Added lines (prefixed with `+`)
- Removed lines (prefixed with `-`)
- Context lines (unchanged, prefixed with space)

## Development

To run in development mode:

```bash
bun run src/index.tsx
```

## Requirements

- **Bun**: Fast JavaScript runtime and package manager
- **Git**: Must be run in a git repository with changes
- **Terminal**: VT100 compatible terminal emulator

## Roadmap

- [ ] Comment system for line-by-line reviews
- [ ] Git notes integration for persistent comments
- [ ] Branch comparison mode
- [ ] Search functionality within diffs
- [ ] Export reviews to various formats

---

This project was built using [Bun](https://bun.com) and [OpenTUI](https://github.com/sst/opentui).
