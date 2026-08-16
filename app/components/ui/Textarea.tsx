import React from "react";

type TextareaProps = {
  label?: string;
  name: string;
  value: string;
  rows?: number;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

export default function Textarea({
  label,
  name,
  value,
  rows = 4,
  onChange,
}: TextareaProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          {label}
        </label>
      )}

      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 outline-none"
      />
    </div>
  );
}