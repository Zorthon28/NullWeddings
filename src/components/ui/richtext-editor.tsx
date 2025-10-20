"use client";

import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { cn } from "../../lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  disabled = false,
}) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
  ];

  return (
    <div className={cn("richtext-editor", className)}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        readOnly={disabled}
        className="bg-white"
      />
      <style jsx global>{`
        .richtext-editor .ql-toolbar {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: none;
          border-radius: 0.375rem 0.375rem 0 0;
          background-color: #f9fafb;
        }
        .richtext-editor .ql-container {
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 0.375rem 0.375rem;
          min-height: 120px;
        }
        .richtext-editor .ql-editor {
          font-size: 0.875rem;
          line-height: 1.5;
          color: #374151;
        }
        .richtext-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .richtext-editor .ql-toolbar .ql-picker-label {
          color: #374151;
        }
        .richtext-editor .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        .richtext-editor .ql-toolbar .ql-fill {
          fill: #374151;
        }
        .richtext-editor .ql-toolbar button:hover,
        .richtext-editor .ql-toolbar button:focus {
          color: #d97706;
        }
        .richtext-editor .ql-toolbar button.ql-active,
        .richtext-editor .ql-toolbar .ql-picker-label.ql-active,
        .richtext-editor .ql-toolbar .ql-picker-item.ql-selected {
          color: #d97706;
        }
        .richtext-editor .ql-toolbar button:hover .ql-stroke,
        .richtext-editor .ql-toolbar button:focus .ql-stroke,
        .richtext-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #d97706;
        }
        .richtext-editor .ql-toolbar button:hover .ql-fill,
        .richtext-editor .ql-toolbar button:focus .ql-fill,
        .richtext-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #d97706;
        }
        @media (max-width: 640px) {
          .richtext-editor .ql-toolbar {
            padding: 8px;
          }
          .richtext-editor .ql-toolbar .ql-formats {
            margin-right: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
