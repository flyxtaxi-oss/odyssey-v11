"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

export function MarkdownRenderer({ content, isUser = false }: MarkdownRendererProps) {
  if (isUser) {
    return <p className="whitespace-pre-wrap font-medium">{content}</p>;
  }

  // Parse blocks: code blocks, tables, quotes, lists, headers, paragraphs
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBuffer.join("\n");
        elements.push(
          <CodeBlock key={`code-${i}`} code={codeText} language={codeLanguage} />
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLanguage = "";
      } else {
        // Start code block
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={`space-${i}`} className="h-2" />);
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={`h3-${i}`} className="text-base font-bold text-[var(--text-0)] mt-3 mb-1.5 font-display flex items-center gap-2">
          {renderInlineText(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={`h2-${i}`} className="text-lg font-extrabold text-[var(--text-0)] mt-4 mb-2 font-display border-b border-[var(--border-0)] pb-1">
          {renderInlineText(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h2 key={`h1-${i}`} className="text-xl font-black text-[var(--text-0)] mt-4 mb-2 font-display">
          {renderInlineText(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-2 border-[var(--primary)] pl-3.5 py-1 my-2 text-[var(--text-2)] italic bg-[var(--bg-2)]/40 rounded-r-lg"
        >
          {renderInlineText(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List (- or *)
    if (/^(\s*[-*•])\s+/.test(line)) {
      const match = line.match(/^(\s*)[-*•]\s+(.*)$/);
      const indent = match ? match[1].length : 0;
      const text = match ? match[2] : line;
      elements.push(
        <div
          key={`li-${i}`}
          className="flex items-start gap-2.5 my-1 text-[var(--text-1)]"
          style={{ paddingLeft: `${indent * 12}px` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 mt-2" />
          <span className="flex-1 leading-relaxed">{renderInlineText(text)}</span>
        </div>
      );
      continue;
    }

    // Numbered list (1. 2. etc)
    if (/^\s*\d+\.\s+/.test(line)) {
      const match = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      const num = match ? match[2] : "•";
      const text = match ? match[3] : line;
      elements.push(
        <div key={`nli-${i}`} className="flex items-start gap-2.5 my-1 text-[var(--text-1)]">
          <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded-md shrink-0 font-mono mt-0.5">
            {num}
          </span>
          <span className="flex-1 leading-relaxed">{renderInlineText(text)}</span>
        </div>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-[var(--text-1)] leading-relaxed">
        {renderInlineText(line)}
      </p>
    );
  }

  // Flush any dangling code buffer
  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <CodeBlock key="code-dangling" code={codeBuffer.join("\n")} language={codeLanguage} />
    );
  }

  return <div className="space-y-1 text-[15px]">{elements}</div>;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[var(--border-1)] bg-[var(--bg-0)]/90 shadow-inner">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--bg-2)]/80 border-b border-[var(--border-0)] text-xs text-[var(--text-3)] font-mono">
        <span>{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-[var(--text-0)] transition-colors p-1 rounded"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copié</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-[var(--text-0)] overflow-x-auto custom-scroll leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInlineText(text: string): React.ReactNode {
  // Parse bold (**text**), inline code (`code`), and links ([text](url))
  // Split by bold first
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-[var(--text-0)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 text-xs rounded bg-[var(--bg-2)] text-[var(--primary)] font-mono border border-[var(--border-0)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
