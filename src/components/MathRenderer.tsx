import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer = ({ content, className = '' }: MathRendererProps) => {
  // Split content by math delimiters
  const renderMathContent = (text: string) => {
    const parts = [];
    let currentIndex = 0;
    
    // Find all math expressions
    const mathRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
    let match;
    
    while ((match = mathRegex.exec(text)) !== null) {
      // Add text before math
      if (match.index > currentIndex) {
        const textPart = text.slice(currentIndex, match.index);
        if (textPart) {
          parts.push(
            <span key={`text-${currentIndex}`} className="whitespace-pre-wrap">
              {textPart}
            </span>
          );
        }
      }
      
      // Add math expression
      const mathContent = match[1] || match[2]; // $$...$$ or $...$
      const isBlock = match[1]; // $$...$$ is block math
      
      if (isBlock) {
        parts.push(
          <BlockMath key={`math-${match.index}`} math={mathContent} />
        );
      } else {
        parts.push(
          <InlineMath key={`math-${match.index}`} math={mathContent} />
        );
      }
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      if (remainingText) {
        parts.push(
          <span key={`text-${currentIndex}`} className="whitespace-pre-wrap">
            {remainingText}
          </span>
        );
      }
    }
    
    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className={`math-content ${className}`}>
      {renderMathContent(content)}
    </div>
  );
};
