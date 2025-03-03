// CustomMarkdown.jsx - Updated with better mobile responsiveness
import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/night-owl.css';

// Responsive code block component
const CodeBlock = ({ language, codeContent }) => {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [codeContent]);

  const copyCode = () => {
    navigator.clipboard.writeText(codeContent);
    // Use window.toast if available
    if (window.toast) {
      window.toast.success("Code copied to clipboard");
    }
  };

  const saveCode = () => {
    const blob = new Blob([codeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // Use window.toast if available
    if (window.toast) {
      window.toast.success("Code saved to file");
    }
  };

  return (
    <div className="relative mb-4 w-full max-w-[calc(100vw-2rem)] md:max-w-full">
      <div className="absolute right-2 top-2 flex space-x-2 z-10">
        <button
          onClick={copyCode}
          className="bg-gray-700/80 text-white p-1.5 rounded-md hover:bg-gray-600 transition-colors"
          aria-label="Copy code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={saveCode}
          className="bg-gray-700/80 text-white p-1.5 rounded-md hover:bg-gray-600 transition-colors"
          aria-label="Save code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
      <div className="bg-gray-800 rounded-md overflow-hidden">
        <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
          {language ? language : 'plaintext'}
        </div>
        <div className="overflow-x-auto w-full scrollbar-thin">
          <pre className="p-4 m-0 text-sm">
            <code ref={codeRef} className={language ? `language-${language}` : ''}>
              {codeContent}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

const CustomMarkdown = ({ children }) => {
  // Parse inline markdown (bold and inline code)
  const parseInlineMarkdown = (text) => {
    let parts = [];
    let lastIndex = 0;
    let key = 0;

    // Process inline code wrapped in single backticks
    const codeRegex = /(`([^`]+)`)/g;
    let codeMatch;
    let tempParts = [];
    while ((codeMatch = codeRegex.exec(text)) !== null) {
      if (codeMatch.index > lastIndex) {
        tempParts.push(text.slice(lastIndex, codeMatch.index));
      }
      tempParts.push(
        <code key={key++} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm whitespace-normal break-words">
          {codeMatch[2]}
        </code>
      );
      lastIndex = codeMatch.index + codeMatch[0].length;
    }
    if (lastIndex < text.length) {
      tempParts.push(text.slice(lastIndex));
    }

    // Process bold formatting wrapped in double asterisks
    tempParts = tempParts.flatMap((part) => {
      if (typeof part === 'string') {
        const boldParts = [];
        let lastBoldIndex = 0;
        const boldRegex = /(\*\*(.+?)\*\*)/g;
        let boldMatch;
        while ((boldMatch = boldRegex.exec(part)) !== null) {
          if (boldMatch.index > lastBoldIndex) {
            boldParts.push(part.slice(lastBoldIndex, boldMatch.index));
          }
          boldParts.push(
            <strong key={key++} className="font-bold">
              {boldMatch[2]}
            </strong>
          );
          lastBoldIndex = boldMatch.index + boldMatch[0].length;
        }
        if (lastBoldIndex < part.length) {
          boldParts.push(part.slice(lastBoldIndex));
        }
        return boldParts.length > 0 ? boldParts : part;
      }
      return part;
    });

    return tempParts;
  };

  // Helper: Parse text blocks into paragraphs and lists
  const parseTextBlock = (text, keyStart) => {
    const blocks = [];
    let key = keyStart;
    const lines = text.split('\n');
    let currentParagraph = [];
    let orderedItems = [];
    let bulletItems = [];

    lines.forEach((line) => {
      if (/^\d+\.\s+/.test(line)) {
        if (currentParagraph.length > 0) {
          blocks.push(
            <p key={key++} className="mb-4 break-words">
              {parseInlineMarkdown(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
        orderedItems.push(
          <li key={key++} className="mb-2 break-words">
            {parseInlineMarkdown(line.replace(/^\d+\.\s+/, ''))}
          </li>
        );
      } else if (/^[-*]\s+/.test(line)) {
        if (currentParagraph.length > 0) {
          blocks.push(
            <p key={key++} className="mb-4 break-words">
              {parseInlineMarkdown(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
        bulletItems.push(
          <li key={key++} className="mb-2 break-words">
            {parseInlineMarkdown(line.replace(/^[-*]\s+/, ''))}
          </li>
        );
      } else if (line.trim() === '') {
        if (currentParagraph.length > 0) {
          blocks.push(
            <p key={key++} className="mb-4 break-words">
              {parseInlineMarkdown(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
      } else {
        currentParagraph.push(line);
      }
    });

    if (currentParagraph.length > 0) {
      blocks.push(
        <p key={key++} className="mb-4 break-words">
          {parseInlineMarkdown(currentParagraph.join(' '))}
        </p>
      );
    }
    if (orderedItems.length > 0) {
      blocks.push(
        <ol key={`ol-${key++}`} className="list-decimal pl-6 mb-4 space-y-1 break-words">
          {orderedItems}
        </ol>
      );
    }
    if (bulletItems.length > 0) {
      blocks.push(
        <ul key={`ul-${key++}`} className="list-disc pl-6 mb-4 space-y-1 break-words">
          {bulletItems}
        </ul>
      );
    }
    return blocks;
  };

  // Parse block-level markdown (including code blocks)
  const parseMarkdown = (text) => {
    if (!text) return null;
    
    const parts = [];
    let key = 0;
    let lastIndex = 0;
    
    // Regex for code blocks delimited by triple backticks with optional language
    const codeBlockRegex = /```(\w*)\n([\s\S]+?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const preText = text.slice(lastIndex, match.index);
        parts.push(...parseTextBlock(preText, key));
        key += 100;
      }
      const language = match[1];
      const codeContent = match[2];
      parts.push(
        <CodeBlock key={key++} language={language} codeContent={codeContent} />
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      parts.push(...parseTextBlock(remainingText, key));
    }
    return parts;
  };

  return (
    <div className="markdown-content w-full max-w-[calc(100vw-3rem)] md:max-w-full break-words overflow-hidden">
      {parseMarkdown(children)}
    </div>
  );
};

export default CustomMarkdown;