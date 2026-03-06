'use client';

import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className = '', ...props }) => {
    return (
        <label className={`inline-flex items-center cursor-pointer ${className}`}>
            <input
                type="checkbox"
                className="w-4 h-4 text-[var(--brand-primary)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--brand-primary)] focus:ring-2 transition-all duration-200"
                {...props}
            />
            {label && <span className="ml-2 text-sm font-medium text-gray-700">{label}</span>}
        </label>
    );
};
