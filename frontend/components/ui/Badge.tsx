import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-block font-poppins font-semibold rounded-full';

  const variantStyles = {
    primary: 'bg-[var(--brand-navy)] text-white',
    success: 'bg-[var(--success)] text-white',
    warning: 'bg-[var(--warning)] text-white',
    error: 'bg-[var(--error)] text-white',
    info: 'bg-[var(--info)] text-white',
    neutral: 'bg-[var(--gray-300)] text-[var(--gray-800)]',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
