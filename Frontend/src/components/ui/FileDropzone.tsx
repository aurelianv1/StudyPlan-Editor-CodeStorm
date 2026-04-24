"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "./button";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  className?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  accept = "*/*",
  label = "Drag & drop your file here, or click to browse",
  className = "",
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        setFileName(file.name);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleClick = () => inputRef.current?.click();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
        isDragActive
          ? "border-black bg-neutral-50"
          : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50/50"
      } p-8 ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
      {fileName ? (
        <div className="text-center">
          <p className="text-lg font-medium text-black truncate max-w-xs">📄 {fileName}</p>
          <p className="text-sm text-neutral-500 mt-1">File loaded successfully</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-base text-neutral-600">{label}</p>
        </div>
      )}
    </div>
  );
};