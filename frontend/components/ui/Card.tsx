import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'rounded-lg transition-all duration-200';

  const variantStyles = {
    default: 'bg-white border border-[var(--gray-200)]',
    elevated: 'bg-white shadow-lg border border-[var(--gray-100)]',
    outline: 'bg-[var(--brand-off-white)] border-2 border-[var(--brand-navy)]',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`px-6 py-4 border-b border-[var(--gray-200)] ${className}`} {...props}>
    {children}
  </div>
);

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardBody: React.FC<CardBodyProps> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`px-6 py-4 border-t border-[var(--gray-200)] bg-[var(--gray-50)] rounded-b-lg ${className}`} {...props}>
    {children}
  </div>
);
