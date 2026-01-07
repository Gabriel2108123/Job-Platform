import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-poppins px-4 py-2.5 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-navy)] focus:border-transparent transition-all duration-200 disabled:bg-[var(--gray-100)] disabled:cursor-not-allowed';

  const errorStyles = error ? 'border-[var(--error)] focus:ring-[var(--error)]' : '';

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <div className={widthStyles}>
      {label && (
        <label className="block text-sm font-poppins font-medium text-[var(--charcoal)] mb-2">
          {label}
        </label>
      )}
      <input
        className={`${baseStyles} ${errorStyles} ${widthStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[var(--error)] font-poppins">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-[var(--gray-500)] font-poppins">
          {helperText}
        </p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  fullWidth = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-poppins px-4 py-2.5 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-navy)] focus:border-transparent transition-all duration-200 disabled:bg-[var(--gray-100)] disabled:cursor-not-allowed';

  const errorStyles = error ? 'border-[var(--error)] focus:ring-[var(--error)]' : '';

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <div className={widthStyles}>
      {label && (
        <label className="block text-sm font-poppins font-medium text-[var(--charcoal)] mb-2">
          {label}
        </label>
      )}
      <select
        className={`${baseStyles} ${errorStyles} ${widthStyles} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-[var(--error)] font-poppins">
          {error}
        </p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-poppins px-4 py-2.5 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-navy)] focus:border-transparent transition-all duration-200 disabled:bg-[var(--gray-100)] disabled:cursor-not-allowed resize-vertical';

  const errorStyles = error ? 'border-[var(--error)] focus:ring-[var(--error)]' : '';

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <div className={widthStyles}>
      {label && (
        <label className="block text-sm font-poppins font-medium text-[var(--charcoal)] mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`${baseStyles} ${errorStyles} ${widthStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[var(--error)] font-poppins">
          {error}
        </p>
      )}
    </div>
  );
};
