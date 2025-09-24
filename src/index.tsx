import { useState } from "react";
import { render, useKeyboard } from "@opentui/react";
import { Layout } from "./components/Layout";
import { createMockGitFiles } from "./services/git";

type FocusedPane = 'files' | 'diff';

function App() {
  const [files] = useState(() => createMockGitFiles());
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [focusedPane, setFocusedPane] = useState<FocusedPane>('files');
  const [scrollOffsets, setScrollOffsets] = useState({
    files: 0,
    diff: 0
  });

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
        } else {
          // Scroll down in diff view
          setScrollOffsets(prev => ({
            ...prev,
            diff: prev.diff + 1
          }));
        }
        break;
      case "k": 
      case "up":
        if (focusedPane === 'files') {
          setSelectedFileIndex(prev => 
            prev > 0 ? prev - 1 : prev
          );
        } else {
          // Scroll up in diff view
          setScrollOffsets(prev => ({
            ...prev,
            diff: Math.max(0, prev.diff - 1)
          }));
        }
        break;
      case "escape":
      case "q":
        process.exit(0);
        break;
    }
  });

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
