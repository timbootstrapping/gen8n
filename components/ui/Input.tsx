'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, type, ...props }, ref) => {
    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <motion.input
          type={type}
          className={`
            w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3
            text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent
            transition-all duration-200 ease-in-out
            hover:border-[#3a3a3a]
            ${className}
          `}
          ref={ref}
          whileFocus={{ 
            scale: 1.02,
            boxShadow: "0 0 20px rgba(162, 89, 255, 0.3)"
          }}
          transition={{ duration: 0.2 }}
          {...(props as any)}
        />
      </motion.div>
    );
  }
);

Input.displayName = 'Input'; 