'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface JobRole {
    id: string;
    name: string;
    department: string;
    displayOrder: number;
}

interface JobRolesByDepartment {
    department: string;
    roles: JobRole[];
}

interface JobRoleSelectorProps {
    selectedRoleIds?: string[];
    onChange: (roleIds: string[]) => void;
    maxSelections?: number;
    placeholder?: string;
}

export default function JobRoleSelector({
    selectedRoleIds = [],
    onChange,
    maxSelections,
    placeholder = 'Select job roles...'
}: JobRoleSelectorProps) {
    const [jobRolesByDept, setJobRolesByDept] = useState<JobRolesByDepartment[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch job roles from API
    useEffect(() => {
        const fetchJobRoles = async () => {
            try {
                const response = await fetch('http://localhost:5254/api/jobroles/by-department');
                if (!response.ok) throw new Error('Failed to fetch job roles');
                const data = await response.json();
                setJobRolesByDept(data);
            } catch (error) {
                console.error('Error fetching job roles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobRoles();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get all roles flattened
    const allRoles = jobRolesByDept.flatMap(dept => dept.roles);

    // Filter roles based on search
    const filteredDepartments = jobRolesByDept
        .map(dept => ({
            ...dept,
            roles: dept.roles.filter(role =>
                role.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }))
        .filter(dept => dept.roles.length > 0);

    const handleToggleRole = (roleId: string) => {
        let newSelection: string[];

        if (selectedRoleIds.includes(roleId)) {
            newSelection = selectedRoleIds.filter(id => id !== roleId);
        } else {
            if (maxSelections && selectedRoleIds.length >= maxSelections) {
                return; // Don't allow more selections
            }
            newSelection = [...selectedRoleIds, roleId];
        }

        onChange(newSelection);
    };

    const handleRemoveRole = (roleId: string) => {
        onChange(selectedRoleIds.filter(id => id !== roleId));
    };

    const getSelectedRoles = () => {
        return allRoles.filter(role => selectedRoleIds.includes(role.id));
    };

    if (loading) {
        return <div className="text-gray-500">Loading job roles...</div>;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected roles display */}
            <div
                className="min-h-[48px] p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-[var(--brand-primary)] transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-2">
                    {getSelectedRoles().length > 0 ? (
                        getSelectedRoles().map(role => (
                            <span
                                key={role.id}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--brand-primary)] text-white rounded-full text-sm"
                            >
                                {role.name}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveRole(role.id);
                                    }}
                                    className="hover:bg-white/20 rounded-full p-0.5"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                    <ChevronDown
                        className={`ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        size={20}
                    />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[400px] overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search roles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                            />
                        </div>
                        {maxSelections && (
                            <p className="text-xs text-gray-500 mt-2">
                                {selectedRoleIds.length} / {maxSelections} selected
                            </p>
                        )}
                    </div>

                    {/* Roles list */}
                    <div className="overflow-y-auto max-h-[320px]">
                        {filteredDepartments.length > 0 ? (
                            filteredDepartments.map(dept => (
                                <div key={dept.department} className="border-b border-gray-100 last:border-0">
                                    <div className="px-4 py-2 bg-gray-50 font-semibold text-sm text-gray-700 sticky top-0">
                                        {dept.department}
                                    </div>
                                    <div className="py-1">
                                        {dept.roles.map(role => (
                                            <label
                                                key={role.id}
                                                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoleIds.includes(role.id)}
                                                    onChange={() => handleToggleRole(role.id)}
                                                    disabled={
                                                        maxSelections
                                                            ? !selectedRoleIds.includes(role.id) && selectedRoleIds.length >= maxSelections
                                                            : false
                                                    }
                                                    className="mr-3 w-4 h-4 text-[var(--brand-primary)] rounded focus:ring-[var(--brand-primary)]"
                                                />
                                                <span className="text-sm text-gray-700">{role.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                                No roles found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
