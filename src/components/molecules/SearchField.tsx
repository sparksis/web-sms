"use client";

import React from "react";
import Icon from "../atoms/Icon";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchField: React.FC<SearchFieldProps> = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative flex items-center w-full px-4 py-2">
      <Icon
        name="search"
        size={18}
        className="absolute left-7 text-zinc-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 dark:text-zinc-100"
      />
    </div>
  );
};

export default SearchField;
