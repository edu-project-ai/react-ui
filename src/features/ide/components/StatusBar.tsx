interface StatusBarProps {
  language: string | null;
  cursorPosition: { line: number; column: number } | null;
}

export function StatusBar({ language, cursorPosition }: StatusBarProps) {
  return (
    <div className="status-bar">
      {language && <div className="status-bar-item">{language}</div>}

      {cursorPosition && (
        <div className="status-bar-item">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </div>
      )}

      <div className="status-bar-item">UTF-8</div>
    </div>
  );
}
