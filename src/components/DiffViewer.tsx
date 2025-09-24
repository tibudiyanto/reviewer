import { TextAttributes } from "@opentui/core";
import type { GitFile, DiffLine, GitHunk } from "../types";

interface DiffViewerProps {
  file: GitFile | null;
  focused?: boolean;
  scrollOffset?: number;
}

export function DiffViewer({ file, focused = false, scrollOffset = 0 }: DiffViewerProps) {
  const renderLine = (line: DiffLine, lineIndex: number) => {
    const getLinePrefix = () => {
      switch (line.type) {
        case 'added': return '+';
        case 'removed': return '-';
        case 'context': return ' ';
        default: return ' ';
      }
    };



    const getLineBackground = () => {
      switch (line.type) {
        case 'added': return "#002200";
        case 'removed': return "#220000";
        default: return undefined;
      }
    };

    return (
      <box key={lineIndex} flexDirection="row" backgroundColor={getLineBackground()} width="100%">
        <text marginRight={1}>
          {getLinePrefix()}
        </text>
        <text flexGrow={1}>
          {line.content}
        </text>
      </box>
    );
  };

  const renderHunk = (hunk: GitHunk, hunkIndex: number) => {
    return (
      <box key={hunkIndex} flexDirection="column" marginBottom={1} width="100%">
        <text attributes={TextAttributes.DIM} marginBottom={1}>
          @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
        </text>
        {hunk.lines.map((line, lineIndex) => renderLine(line, lineIndex))}
      </box>
    );
  };

  if (!file) {
    return (
      <box alignItems="center" justifyContent="center" flexGrow={1}>
        <text attributes={TextAttributes.DIM}>
          Select a file to view diff
        </text>
      </box>
    );
  }

  return (
    <box flexDirection="column" width="100%" paddingLeft={1} paddingRight={1}>
      <text attributes={TextAttributes.BOLD} marginBottom={1}>
        {file.path}
      </text>
      
      <scrollbox focused={focused} style={{ flexGrow: 1, width: "100%" }}>
        {file.hunks.length === 0 ? (
          <text attributes={TextAttributes.DIM}>
            No changes to display
          </text>
        ) : (
          file.hunks.map((hunk, hunkIndex) => renderHunk(hunk, hunkIndex))
        )}
      </scrollbox>
    </box>
  );
}