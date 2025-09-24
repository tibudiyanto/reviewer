import { TextAttributes } from "@opentui/core";
import type { GitFile } from "../types";

interface FileTreeProps {
  files: GitFile[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  focused?: boolean;
  scrollOffset?: number;
}

export function FileTree({ files, selectedIndex, onSelect, focused = false, scrollOffset = 0 }: FileTreeProps) {
  const getStatusIndicator = (status: GitFile['status']) => {
    switch (status) {
      case 'added': return 'A';
      case 'modified': return 'M'; 
      case 'deleted': return 'D';
      default: return ' ';
    }
  };

  return (
    <box flexDirection="column">
      <text attributes={TextAttributes.BOLD} marginBottom={1}>
        Files Changed
      </text>
      
      {files.length === 0 ? (
        <text attributes={TextAttributes.DIM}>
          No files changed
        </text>
      ) : (
        files.map((file, index) => (
          <box 
            key={file.path}
            flexDirection="row"
            backgroundColor={index === selectedIndex ? "#334455" : undefined}
            paddingLeft={1}
            paddingRight={1}

          >
            <text attributes={TextAttributes.BOLD} marginRight={1}>
              [{getStatusIndicator(file.status)}]
            </text>
            <text>
              {file.path}
            </text>
          </box>
        ))
      )}
    </box>
  );
}