import React from "react";

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  name: string;
  value: string;
  options: Option[];
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
};

export default function Select({
  label,
  name,
  value,
  options,
  onChange,
}: SelectProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          {label}
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 outline-none"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}