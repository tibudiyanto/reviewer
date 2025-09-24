import { simpleGit } from 'simple-git';
import type { SimpleGit, DiffResult } from 'simple-git';
import type { GitFile, GitHunk, DiffLine } from "../types";

export class GitService {
  private git: SimpleGit;

  constructor(repoPath: string = process.cwd()) {
    this.git = simpleGit(repoPath);
  }

  async getDirtyFiles(): Promise<GitFile[]> {
    try {
      const status = await this.git.status();
      const files: GitFile[] = [];

      // Process staged files
      for (const file of status.staged) {
        const gitFile = await this.processFile(file, this.getFileStatus(file, status));
        if (gitFile) files.push(gitFile);
      }

      // Process modified files
      for (const file of status.modified) {
        const gitFile = await this.processFile(file, 'modified');
        if (gitFile) files.push(gitFile);
      }

      // Process created files
      for (const file of status.created) {
        const gitFile = await this.processFile(file, 'added');
        if (gitFile) files.push(gitFile);
      }

      // Process deleted files
      for (const file of status.deleted) {
        const gitFile = await this.processFile(file, 'deleted');
        if (gitFile) files.push(gitFile);
      }

      return files;
    } catch (error) {
      console.error('Error getting dirty files:', error);
      return [];
    }
  }

  private getFileStatus(file: string, status: any): 'added' | 'modified' | 'deleted' {
    if (status.created.includes(file)) return 'added';
    if (status.deleted.includes(file)) return 'deleted';
    return 'modified';
  }

  private async processFile(filePath: string, status: 'added' | 'modified' | 'deleted'): Promise<GitFile | null> {
    try {
      let diffText: string;
      
      if (status === 'added') {
        // For new files, diff against empty
        diffText = await this.git.raw(['diff', '--no-index', '/dev/null', filePath]);
      } else if (status === 'deleted') {
        // For deleted files, diff the last committed version
        diffText = await this.git.raw(['diff', 'HEAD', '--', filePath]);
      } else {
        // For modified files, diff against HEAD
        diffText = await this.git.raw(['diff', 'HEAD', '--', filePath]);
      }

      const hunks = this.parseDiff(diffText);
      
      return {
        path: filePath,
        status,
        hunks,
        language: this.detectLanguage(filePath)
      };
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
      return null;
    }
  }

  private parseDiff(diffText: string): GitHunk[] {
    const hunks: GitHunk[] = [];
    
    if (!diffText || diffText.trim() === '') {
      return hunks;
    }

    const hunkMatches = diffText.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/g);
    
    if (hunkMatches) {
      for (const hunkMatch of hunkMatches) {
          const match = hunkMatch.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);
          if (match) {
            const oldStart = parseInt(match[1] || '1');
            const oldLines = match[2] ? parseInt(match[2]) : 1;
            const newStart = parseInt(match[3] || '1');
            const newLines = match[4] ? parseInt(match[4]) : 1;

          // Extract lines for this hunk from the diff
          const lines = this.extractHunkLines(diffText, hunkMatch);
          
          hunks.push({
            oldStart,
            oldLines,
            newStart,
            newLines,
            lines
          });
        }
      }
    } else {
      // Fallback: create a single hunk with all changes
      const lines = this.extractAllLines(diffText);
      if (lines.length > 0) {
        hunks.push({
          oldStart: 1,
          oldLines: lines.filter(l => l.type !== 'added').length,
          newStart: 1,
          newLines: lines.filter(l => l.type !== 'removed').length,
          lines
        });
      }
    }

    return hunks;
  }

  private extractHunkLines(diffText: string, hunkHeader: string): DiffLine[] {
    const lines: DiffLine[] = [];
    const hunkStart = diffText.indexOf(hunkHeader);
    if (hunkStart === -1) return lines;

    const nextHunk = diffText.indexOf('@@', hunkStart + hunkHeader.length);
    const hunkEnd = nextHunk !== -1 ? nextHunk : diffText.length;
    const hunkContent = diffText.substring(hunkStart + hunkHeader.length, hunkEnd);

    const contentLines = hunkContent.split('\n').slice(1); // Skip the header line
    let oldLineNumber = this.getOldStartFromHeader(hunkHeader);
    let newLineNumber = this.getNewStartFromHeader(hunkHeader);

    for (const line of contentLines) {
      if (!line) continue;

      const firstChar = line[0];
      const content = line.substring(1);

      if (firstChar === '+') {
        lines.push({
          type: 'added',
          content,
          newLineNumber: newLineNumber++
        });
      } else if (firstChar === '-') {
        lines.push({
          type: 'removed',
          content,
          oldLineNumber: oldLineNumber++
        });
      } else if (firstChar === ' ') {
        lines.push({
          type: 'context',
          content,
          oldLineNumber: oldLineNumber++,
          newLineNumber: newLineNumber++
        });
      }
    }

    return lines;
  }

  private extractAllLines(diffText: string): DiffLine[] {
    const lines: DiffLine[] = [];
    const contentLines = diffText.split('\n');
    let oldLineNumber = 1;
    let newLineNumber = 1;

    for (const line of contentLines) {
      if (!line) continue;
      if (line.startsWith('@@') || line.startsWith('+++') || line.startsWith('---') || line.startsWith('index ')) {
        continue;
      }

      const firstChar = line[0];
      const content = line.substring(1);

      if (firstChar === '+') {
        lines.push({
          type: 'added',
          content,
          newLineNumber: newLineNumber++
        });
      } else if (firstChar === '-') {
        lines.push({
          type: 'removed',
          content,
          oldLineNumber: oldLineNumber++
        });
      } else if (firstChar === ' ') {
        lines.push({
          type: 'context',
          content,
          oldLineNumber: oldLineNumber++,
          newLineNumber: newLineNumber++
        });
      }
    }

    return lines;
  }

  private getOldStartFromHeader(header: string): number {
    const match = header.match(/@@ -(\d+),?/);
    return match ? parseInt(match[1] || '1') : 1;
  }

  private getNewStartFromHeader(header: string): number {
    const match = header.match(/\+(\d+),?/);
    return match ? parseInt(match[1] || '1') : 1;
  }

  private detectLanguage(filePath: string): string | undefined {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'cpp': 'cpp',
      'c': 'c',
      'java': 'java',
      'md': 'markdown',
      'json': 'json',
      'yml': 'yaml',
      'yaml': 'yaml',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less'
    };
    
    return ext ? languageMap[ext] : undefined;
  }
}

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