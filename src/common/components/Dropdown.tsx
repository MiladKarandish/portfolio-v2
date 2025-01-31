"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import clsx from "clsx";
import useClickOutside from "../hooks/useClickOutside";

interface DropdownProps {
  options: { value: string; label: string }[];
  value: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
}

const Dropdown = ({ options, value, onSelect, placeholder = "Select an option" }: DropdownProps) => {
  const [ref, isOpen, setIsOpen] = useClickOutside();

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
  };

  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between px-4 py-3 rounded-full transition-colors",
          "bg-500 hover:bg-600 text-text-100",
          "focus:outline-none focus:ring-2 focus:ring-700"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedLabel}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute w-full mt-2 rounded-lg shadow-lg overflow-hidden z-50"
            role="listbox"
          >
            {options.map((option, index) => (
              <motion.li
                key={option.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                ref={ref}
              >
                <button
                  onClick={() => handleSelect(option.value)}
                  className={clsx(
                    "w-full px-4 py-3 text-left transition-colors",
                    "hover:bg-400 text-text-100",
                    "focus:bg-400 focus:outline-none",
                    { "bg-400": option.value === value }
                  )}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {option.label}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
