import React from 'react';

/**
 * Formats AI text (ChatGPT / Gemini style):
 * - Replaces **bold** text with styled <strong> elements
 * - Replaces *italic* text with styled <em> elements
 * - Strips trailing/stray asterisks
 * - Preserves line breaks with whitespace-pre-wrap
 */
export function FormattedMessageText({ text = '', className = '' }) {
  if (!text) return null;

  // Clean stray trailing asterisks
  let cleaned = text.trim();

  // Helper to parse line by line and paragraph by paragraph
  const lines = cleaned.split('\n');

  return (
    <div className={`whitespace-pre-wrap leading-relaxed space-y-1.5 ${className}`}>
      {lines.map((line, lineIdx) => {
        if (!line.trim()) return <div key={lineIdx} className="h-1.5" />;

        // Parse **bold** and *italic*
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);

        return (
          <p key={lineIdx}>
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                return (
                  <strong key={partIdx} className="font-extrabold text-amber-300">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                return (
                  <em key={partIdx} className="italic text-sky-300 font-medium">
                    {part.slice(1, -1)}
                  </em>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}
