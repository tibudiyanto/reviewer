import type { GitFile } from "../types";

export function createMockGitFiles(): GitFile[] {
  return [
    {
      path: "src/components/Layout.tsx",
      status: "added",
      hunks: [
        {
          oldStart: 0,
          oldLines: 0,
          newStart: 1,
          newLines: 31,
          lines: [
            { type: "added", content: "import type { GitFile } from \"../types\";", newLineNumber: 1 },
            { type: "added", content: "import { FileTree } from \"./FileTree\";", newLineNumber: 2 },
            { type: "added", content: "import { DiffViewer } from \"./DiffViewer\";", newLineNumber: 3 },
            { type: "added", content: "", newLineNumber: 4 },
            { type: "added", content: "export function Layout() {", newLineNumber: 5 },
            { type: "added", content: "  return (", newLineNumber: 6 },
            { type: "added", content: "    <box flexDirection=\"row\" flexGrow={1}>", newLineNumber: 7 },
            { type: "added", content: "      <FileTree />", newLineNumber: 8 },
            { type: "added", content: "      <DiffViewer />", newLineNumber: 9 },
            { type: "added", content: "    </box>", newLineNumber: 10 },
            { type: "added", content: "  );", newLineNumber: 11 },
            { type: "added", content: "}", newLineNumber: 12 }
          ]
        }
      ]
    },
    {
      path: "src/types/index.ts", 
      status: "modified",
      hunks: [
        {
          oldStart: 1,
          oldLines: 5,
          newStart: 1,
          newLines: 8,
          lines: [
            { type: "context", content: "export interface GitFile {", oldLineNumber: 1, newLineNumber: 1 },
            { type: "context", content: "  path: string;", oldLineNumber: 2, newLineNumber: 2 },
            { type: "removed", content: "  status: string;", oldLineNumber: 3 },
            { type: "added", content: "  status: 'added' | 'modified' | 'deleted';", newLineNumber: 3 },
            { type: "added", content: "  hunks: GitHunk[];", newLineNumber: 4 },
            { type: "added", content: "  language?: string;", newLineNumber: 5 },
            { type: "context", content: "}", oldLineNumber: 4, newLineNumber: 6 }
          ]
        }
      ]
    },
    {
      path: "README.md",
      status: "deleted", 
      hunks: [
        {
          oldStart: 1,
          oldLines: 3,
          newStart: 0,
          newLines: 0,
          lines: [
            { type: "removed", content: "# Old Project", oldLineNumber: 1 },
            { type: "removed", content: "", oldLineNumber: 2 },
            { type: "removed", content: "This is the old README", oldLineNumber: 3 }
          ]
        }
      ]
    }
  ];
}