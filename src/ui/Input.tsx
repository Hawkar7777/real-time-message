import React from "react";

type InputProps = {
  type?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  type = "text",
  value,
  onChange,
  className,
  placeholder,
  ...rest
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${className}`}
      placeholder={placeholder}
      {...rest}
    />
  );
}
