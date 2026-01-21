import React from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  className,
}) => {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer ${className || ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-blue-600"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};
