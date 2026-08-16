import React from "react";

type InputProps = {
  label?: string;
  name: string;
  value: string | number;
  type?: string;
  placeholder?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

export default function Input({
  label,
  name,
  value,
  type = "text",
  placeholder,
  onChange,
}: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          {label}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </div>
  );
}