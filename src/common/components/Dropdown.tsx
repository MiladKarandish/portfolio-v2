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
  /** Accessible name for the trigger, since the visible text is the current value. */
  label?: string;
}

const Dropdown = ({ options, value, onSelect, placeholder = "Select an option", label }: DropdownProps) => {
  // The ref goes on the container — see the note in useClickOutside.
  const [ref, isOpen, setIsOpen] = useClickOutside<HTMLDivElement>();

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
  };

  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between gap-1 px-3 py-2 rounded-full text-sm transition-colors",
          "bg-500 hover:bg-600"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
      >
        <span className="truncate">{selectedLabel}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} aria-hidden="true">
          <FiChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 w-full min-w-max mt-2 bg-600 rounded-xl shadow-xl overflow-y-auto max-h-72 z-50 border border-400/30 backdrop-blur-md"
            role="listbox"
          >
            {options.map((option, index) => (
              <motion.li
                key={option.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.2) }}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={clsx("w-full px-4 py-2.5 text-left text-sm transition-colors", "hover:bg-400", {
                    "bg-400": option.value === value,
                  })}
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
