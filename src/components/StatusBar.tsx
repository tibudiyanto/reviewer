import { TextAttributes } from "@opentui/core";

type FocusedPane = 'files' | 'diff';

interface StatusBarProps {
  focusedPane: FocusedPane;
}

export function StatusBar({ focusedPane }: StatusBarProps) {
  return (
    <box 
      flexDirection="row" 
      justifyContent="space-between"
      paddingLeft={1}
      paddingRight={1}
      backgroundColor="#1a1a1a"
      border
      borderColor="#666666"
    >
      <text attributes={TextAttributes.DIM}>
        Focused: {focusedPane === 'files' ? 'File Tree' : 'Diff Viewer'}
      </text>
      
      <text attributes={TextAttributes.DIM}>
        Ctrl+w: Switch panes | h/l: Left/Right | j/k: Up/Down | q: Quit
      </text>
    </box>
  );
}