'use client';

import { cva, VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef } from 'react';

const buttonStyles = cva(
  'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 ease-in-out',
  {
    variants: {
      intent: {
        primary: 'bg-highlight text-foreground hover:bg-highlight/90 hover:shadow-[0_0_10px_rgba(162,89,255,0.4)] hover:scale-[1.03] active:scale-[0.98] active:shadow-[0_0_5px_rgba(162,89,255,0.3)]',
        secondary: 'border border-border text-foreground hover:bg-border/20 hover:shadow-[0_0_10px_rgba(162,89,255,0.3)] hover:scale-[1.03] active:scale-[0.98] active:shadow-[0_0_5px_rgba(162,89,255,0.2)]',
        ghost: 'text-foreground hover:bg-surface hover:shadow-[0_0_8px_rgba(162,89,255,0.2)] hover:scale-[1.03] active:scale-[0.98]',
        danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-[0_0_10px_rgba(239,68,68,0.4)] hover:scale-[1.03] active:scale-[0.98]'
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
      },
      rounded: {
        full: 'rounded-full',
        xl: 'rounded-2xl',
        md: 'rounded-md'
      }
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
      rounded: 'full'
    }
  }
);

export interface ButtonProps extends HTMLMotionProps<'button'>, VariantProps<typeof buttonStyles> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ intent, size, rounded, className, children, ...props }, ref) => (
  <motion.button
    ref={ref}
    className={buttonStyles({ intent, size, rounded, className })}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    {...props}
  >
    {children}
  </motion.button>
));

Button.displayName = 'Button'; 