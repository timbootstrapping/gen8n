'use client';

import { cva, VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef } from 'react';

const buttonStyles = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      intent: {
        primary: 'bg-highlight text-foreground hover:bg-highlight/80',
        secondary: 'border border-border text-foreground hover:bg-border/20'
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
      },
      rounded: {
        full: 'rounded-full',
        xl: 'rounded-2xl'
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
    {...props}
  >
    {children}
  </motion.button>
));

Button.displayName = 'Button'; 