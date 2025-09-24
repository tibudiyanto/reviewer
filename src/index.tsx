import { useState, useEffect } from "react";
import { render, useKeyboard } from "@opentui/react";
import { Layout } from "./components/Layout";
import { GitService } from "./services/git";
import type { GitFile } from "./types";

type FocusedPane = 'files' | 'diff';

function App() {
  const [files, setFiles] = useState<GitFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [focusedPane, setFocusedPane] = useState<FocusedPane>('files');
  const [scrollOffsets, setScrollOffsets] = useState({
    files: 0,
    diff: 0
  });

  useEffect(() => {
    const loadGitFiles = async () => {
      try {
        setLoading(true);
        const gitService = new GitService();
        const gitFiles = await gitService.getDirtyFiles();
        setFiles(gitFiles);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load git files');
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    loadGitFiles();
  }, []);

  useKeyboard((key) => {
    // Vim-like pane switching: Ctrl+w
    if (key.ctrl && key.name === 'w') {
      setFocusedPane(prev => prev === 'files' ? 'diff' : 'files');
      return;
    }

    // Vim-like left/right navigation
    if (key.name === 'h') {
      setFocusedPane('files');
      return;
    }
    if (key.name === 'l') {
      setFocusedPane('diff');
      return;
    }

    // Only handle keyboard events if not in diff pane, or if it's not a scroll key
    if (focusedPane === 'diff' && (key.name === 'j' || key.name === 'k' || key.name === 'down' || key.name === 'up')) {
      // Don't handle these keys when diff pane is focused - let scrollbox handle them
      return;
    }

    switch (key.name) {
      case "tab":
        setFocusedPane(prev => prev === 'files' ? 'diff' : 'files');
        break;
      case "j":
      case "down":
        if (focusedPane === 'files') {
          setSelectedFileIndex(prev => 
            prev < files.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case "k": 
      case "up":
        if (focusedPane === 'files') {
          setSelectedFileIndex(prev => 
            prev > 0 ? prev - 1 : prev
          );
        }
        break;
      case "escape":
      case "q":
        process.exit(0);
        break;
    }
  });

  if (loading) {
    return (
      <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
        <text>Loading git changes...</text>
      </box>
    );
  }

  if (error) {
    return (
      <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
        <text>Error: {error}</text>
        <text>Make sure you're in a git repository with changes</text>
      </box>
    );
  }

  if (files.length === 0) {
    return (
      <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
        <text>No changes found</text>
        <text>Working directory is clean</text>
      </box>
    );
  }

  return (
    <Layout 
      files={files}
      selectedFileIndex={selectedFileIndex}
      onFileSelect={setSelectedFileIndex}
      focusedPane={focusedPane}
      scrollOffsets={scrollOffsets}
    />
  );
}

render(<App />);
