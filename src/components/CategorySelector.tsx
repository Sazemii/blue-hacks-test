"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_GROUPS, type Category } from "./categories";
import CategoryIcon from "./CategoryIcon";
import { FaTimes } from "react-icons/fa";
import { useTheme } from "./ThemeContext";

interface CategorySelectorProps {
  onSelect: (category: Category) => void;
  onClose: () => void;
  selectedId?: string;
}

export default function CategorySelector({
  onSelect,
  onClose,
  selectedId,
}: CategorySelectorProps) {
  const [activeGroup, setActiveGroup] = useState<string>(CATEGORY_GROUPS[0]);
  const theme = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] animate-slide-up">
      <div
        className={`fixed inset-0 -z-10 ${isDark ? "bg-black/50" : "bg-black/20"}`}
        onClick={onClose}
      />

      <div
        className={`mx-auto max-w-lg rounded-t-2xl border px-4 pb-6 pt-3 ${
          isDark
            ? "border-neutral-800 bg-[#0f0f0f]"
            : "border-neutral-200 bg-white"
        }`}
        style={{
          boxShadow: isDark
            ? "0 -4px 30px rgba(0,0,0,0.5)"
            : "0 -4px 30px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className={`mx-auto mb-3 h-1 w-10 rounded-full ${
            isDark ? "bg-neutral-700" : "bg-neutral-300"
          }`}
        />

        <div className="mb-4 flex items-center justify-between">
          <h2
            className={`text-base font-semibold ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            What&apos;s the issue?
          </h2>
          <button
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              isDark
                ? "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800"
            }`}
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORY_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                activeGroup === group
                  ? isDark
                    ? "bg-[#f5c542] text-black"
                    : "bg-[#b8860b] text-white"
                  : isDark
                    ? "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800"
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.filter((c) => c.group === activeGroup).map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                selectedId === category.id
                  ? isDark
                    ? "border-[#f5c542] bg-[#f5c542]/10"
                    : "border-[#b8860b] bg-[#b8860b]/10"
                  : isDark
                    ? "border-neutral-800 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-800/80"
                    : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100"
              }`}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: `${category.color}18` }}
              >
                <CategoryIcon
                  iconName={category.icon}
                  color={category.color}
                  size={20}
                />
              </div>
              <span
                className={`text-center text-[11px] leading-tight ${
                  isDark ? "text-neutral-300" : "text-neutral-600"
                }`}
              >
                {category.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
