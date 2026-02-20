'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import {
    getMyProfile,
    updateMyProfile,
    getWorkExperiences,
    createWorkExperience,
    updateWorkExperience,
    deleteWorkExperience,
    WorkExperienceDto,
    CreateWorkExperienceDto,
    UpdateWorkExperienceDto
} from '@/lib/api/client';

// Local interface for form state (handling new vs existing items)
interface FormExperience extends Partial<WorkExperienceDto> {
    tempId?: string; // For new items not yet saved to DB
    isDeleted?: boolean;
}

interface CVData {
    summary: string;
    skills: string[];
    certifications: string[];
    languages: string[];
}

const defaultCVData: CVData = {
    summary: '',
    skills: [],
    certifications: [],
    languages: [],
};

// AI Helper: Hospitality skills by category
const HOSPITALITY_SKILLS = {
    service: ['Silver Service', 'Table Service', 'Cocktail Making', 'Wine Knowledge', 'Barista Skills', 'Upselling', 'Menu Knowledge', 'Fine Dining'],
    technical: ['POS Systems', 'Reservation Systems', 'Inventory Management', 'Cash Handling', 'EPOS', 'Microsoft Office', 'Booking.com', 'Opera PMS'],
    soft: ['Customer Service', 'Team Leadership', 'Communication', 'Problem Solving', 'Time Management', 'Multitasking', 'Attention to Detail', 'Adaptability'],
    culinary: ['Food Prep', 'Kitchen Management', 'Menu Planning', 'Food Safety', 'Portion Control', 'Recipe Development', 'Plating', 'Allergen Awareness'],
    management: ['Staff Scheduling', 'Training & Development', 'Performance Reviews', 'Budget Management', 'Event Coordination', 'Conflict Resolution', 'KPI Tracking', 'Vendor Relations'],
};

const HOSPITALITY_CERTIFICATIONS = [
    'Food Hygiene Level 2',
    'Food Hygiene Level 3',
    'First Aid at Work',
    'Personal License Holder',
    'WSET Level 1',
    'WSET Level 2',
    'Health & Safety',
    'Fire Safety',
    'Allergen Awareness',
    'Manual Handling',
];

export function CVBuilder() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Split state: CV Data (JSON) vs Work History (API)
    const [cvData, setCvData] = useState<CVData>(defaultCVData);
    const [experiences, setExperiences] = useState<FormExperience[]>([]);
    const [originalExperienceIds, setOriginalExperienceIds] = useState<string[]>([]);

    const [skillInput, setSkillInput] = useState('');
    const [certInput, setCertInput] = useState('');
    const [langInput, setLangInput] = useState('');
    const [profile, setProfile] = useState<{ firstName?: string; lastName?: string; email?: string } | null>(null);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

    // Load existing CV data & Work History
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Parallel fetch
                const [profileRes, experiencesRes] = await Promise.all([
                    getMyProfile(),
                    getWorkExperiences()
                ]);

                // 1. Handle Profile & CV JSON
                if (profileRes.success && profileRes.data) {
                    setProfile(profileRes.data);
                    if (profileRes.data.resumeJson) {
                        try {
                            const parsed = JSON.parse(profileRes.data.resumeJson);
                            // Only take the non-experience fields
                            setCvData({
                                summary: parsed.summary || '',
                                skills: parsed.skills || [],
                                certifications: parsed.certifications || [],
                                languages: parsed.languages || []
                            });
                        } catch {
                            console.log('No existing CV data or invalid JSON');
                        }
                    }
                }

                // 2. Handle Work Experiences
                if (experiencesRes) {
                    setExperiences(experiencesRes);
                    setOriginalExperienceIds(experiencesRes.map(e => e.id));
                }

            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const addExperience = () => {
        setExperiences(prev => [
            ...prev,
            {
                tempId: `new_${Date.now()}`,
                employerName: '',
                roleTitle: '',
                startDate: '',
                description: '',
                city: '',
                postalCode: '',
                locationText: '', // Will be auto-filled or asked
                visibilityLevel: 'private', // Default
                isMapEnabled: true // Default to true for better visibility
            }
        ]);
    };

    const updateExperience = (index: number, field: keyof FormExperience, value: any) => {
        setExperiences(prev => prev.map((exp, i) => {
            if (i !== index) return exp;

            const updated = { ...exp, [field]: value };

            // Auto-update LocationText if City changes
            if (field === 'city' && value) {
                updated.locationText = value;
            }

            return updated;
        }));
    };

    const removeExperience = (index: number) => {
        setExperiences(prev => prev.filter((_, i) => i !== index));
    };

    const addSkill = () => {
        if (skillInput.trim() && !cvData.skills.includes(skillInput.trim())) {
            setCvData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        setCvData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const addCertification = () => {
        if (certInput.trim() && !cvData.certifications.includes(certInput.trim())) {
            setCvData(prev => ({ ...prev, certifications: [...prev.certifications, certInput.trim()] }));
            setCertInput('');
        }
    };

    const removeCertification = (cert: string) => {
        setCvData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c !== cert) }));
    };

    const addLanguage = () => {
        if (langInput.trim() && !cvData.languages.includes(langInput.trim())) {
            setCvData(prev => ({ ...prev, languages: [...prev.languages, langInput.trim()] }));
            setLangInput('');
        }
    };

    const removeLanguage = (lang: string) => {
        setCvData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }));
    };

    // AI Helper: Generate professional summary based on experience
    const generateAISummary = async () => {
        setAiGenerating(true);
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const roles = experiences.map(e => e.roleTitle).filter(Boolean);
        const companies = experiences.map(e => e.employerName).filter(Boolean);
        const yearsExp = experiences.length > 0 ? `${experiences.length}+ years` : 'extensive';

        let summary = '';
        if (roles.length > 0) {
            const primaryRole = roles[0] || '';
            summary = `Dedicated hospitality professional with ${yearsExp} of experience in the industry. `;

            if (primaryRole.toLowerCase().includes('chef') || primaryRole.toLowerCase().includes('cook')) {
                summary += `Passionate about culinary excellence and creating memorable dining experiences. Skilled in menu development, kitchen operations, and maintaining the highest food safety standards.`;
            } else if (primaryRole.toLowerCase().includes('manager') || primaryRole.toLowerCase().includes('supervisor')) {
                summary += `Proven leader with expertise in team management, operational efficiency, and delivering exceptional guest experiences. Strong track record of achieving targets while maintaining high service standards.`;
            } else if (primaryRole.toLowerCase().includes('waiter') || primaryRole.toLowerCase().includes('server')) {
                summary += `Customer-focused professional with excellent communication skills and attention to detail. Known for providing attentive service and creating positive dining experiences for guests.`;
            } else if (primaryRole.toLowerCase().includes('bartender') || primaryRole.toLowerCase().includes('bar')) {
                summary += `Creative mixologist with extensive knowledge of classic and contemporary cocktails. Experienced in high-volume service while maintaining quality and customer satisfaction.`;
            } else {
                summary += `Committed to delivering outstanding service and contributing to team success. Known for reliability, adaptability, and a positive attitude in fast-paced environments.`;
            }

            if (companies.length > 0) {
                summary += ` Previously at ${companies.slice(0, 2).join(' and ')}.`;
            }
        } else {
            summary = `Enthusiastic hospitality professional seeking opportunities to contribute to a dynamic team. Committed to delivering exceptional guest experiences and maintaining high service standards. Known for adaptability, strong work ethic, and excellent interpersonal skills.`;
        }

        setCvData(prev => ({ ...prev, summary }));
        setAiGenerating(false);
    };

    // AI Helper: Add suggested skill
    const addSuggestedSkill = (skill: string) => {
        if (!cvData.skills.includes(skill)) {
            setCvData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
        }
    };

    // AI Helper: Add suggested certification
    const addSuggestedCertification = (cert: string) => {
        if (!cvData.certifications.includes(cert)) {
            setCvData(prev => ({ ...prev, certifications: [...prev.certifications, cert] }));
        }
    };

    // Get skills not already added
    const getAvailableSkills = (category: keyof typeof HOSPITALITY_SKILLS) => {
        return HOSPITALITY_SKILLS[category].filter(skill => !cvData.skills.includes(skill));
    };

    const getAvailableCertifications = () => {
        return HOSPITALITY_CERTIFICATIONS.filter(cert => !cvData.certifications.includes(cert));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Save CV JSON (Profile parts)
            // Note: We deliberately exclude experiences from JSON now, as they live in the DB
            const profileRes = await updateMyProfile({
                resumeJson: JSON.stringify(cvData)
            });

            if (!profileRes.success) throw new Error('Failed to save profile details');

            // 2. Sync Work Experiences
            const currentIds = experiences.map(e => e.id).filter(Boolean) as string[];

            // A. Deletions
            const toDelete = originalExperienceIds.filter(id => !currentIds.includes(id));
            for (const id of toDelete) {
                await deleteWorkExperience(id);
            }

            // B. Updates & Creations
            for (const exp of experiences) {
                if (exp.id) {
                    // Update existing
                    // Only if we have an ID (not a temp one)
                    if (!exp.tempId) {
                        await updateWorkExperience(exp.id, {
                            employerName: exp.employerName,
                            roleTitle: exp.roleTitle,
                            description: exp.description,
                            city: exp.city,
                            postalCode: exp.postalCode,
                            startDate: exp.startDate ? new Date(exp.startDate).toISOString() : undefined,
                            // Maintain existing settings
                            locationText: exp.locationText,
                            visibilityLevel: exp.visibilityLevel as any,
                            isMapEnabled: exp.isMapEnabled
                        });
                    }
                } else {
                    // Create new
                    await createWorkExperience({
                        employerName: exp.employerName || 'Unknown Employer',
                        roleTitle: exp.roleTitle || 'Unknown Role',
                        description: exp.description || '',
                        city: exp.city || '',
                        postalCode: exp.postalCode || '',
                        locationText: exp.city || exp.locationText || 'Unknown Location',
                        startDate: exp.startDate ? new Date(exp.startDate).toISOString() : undefined,
                        visibilityLevel: 'private', // Default
                        isMapEnabled: true // Enable map by default
                    });
                }
            }

            // Refresh original IDs after save
            const refreshed = await getWorkExperiences();
            setExperiences(refreshed);
            setOriginalExperienceIds(refreshed.map(e => e.id));

            setStep(4);
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save CV. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleExportPDF = () => {
        // Create a printable version and use browser print dialog
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow pop-ups to export your CV');
            return;
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${profile?.firstName || ''} ${profile?.lastName || ''} - CV</title>
                <style>
                    body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
                    h1 { color: #1a365d; margin-bottom: 5px; font-size: 28px; }
                    h2 { color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px; font-size: 18px; }
                    .contact { color: #718096; margin-bottom: 20px; }
                    .summary { font-style: italic; color: #4a5568; margin: 20px 0; line-height: 1.6; }
                    .experience { margin-bottom: 16px; }
                    .experience-header { display: flex; justify-content: space-between; }
                    .company { font-weight: bold; }
                    .role { color: #4a5568; }
                    .duration { color: #718096; font-size: 14px; }
                    .description { margin-top: 8px; color: #4a5568; font-size: 14px; }
                    .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
                    .tag { background: #edf2f7; padding: 4px 12px; border-radius: 16px; font-size: 13px; }
                    .footer { margin-top: 40px; text-align: center; color: #a0aec0; font-size: 12px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <h1>${profile?.firstName || ''} ${profile?.lastName || ''}</h1>
                <div class="contact">${profile?.email || ''}</div>
                
                ${cvData.summary ? `<div class="summary">${cvData.summary}</div>` : ''}
                
                <h2>Professional Experience</h2>
                ${experiences.filter(e => e.employerName || e.roleTitle).map(exp => `
                    <div class="experience">
                        <div class="experience-header">
                            <div>
                                <span class="company">${exp.employerName}</span>
                                ${exp.roleTitle ? `<span class="role"> — ${exp.roleTitle}</span>` : ''}
                                ${exp.city ? `<span class="role"> (${exp.city})</span>` : ''}
                            </div>
                            <span class="duration">${exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''}</span>
                        </div>
                        ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
                    </div>
                `).join('')}
                
                ${cvData.skills.length > 0 ? `
                    <h2>Skills</h2>
                    <div class="tags">${cvData.skills.map(s => `<span class="tag">${s}</span>`).join('')}</div>
                ` : ''}
                
                ${cvData.certifications.length > 0 ? `
                    <h2>Certifications</h2>
                    <div class="tags">${cvData.certifications.map(c => `<span class="tag">${c}</span>`).join('')}</div>
                ` : ''}
                
                ${cvData.languages.length > 0 ? `
                    <h2>Languages</h2>
                    <div class="tags">${cvData.languages.map(l => `<span class="tag">${l}</span>`).join('')}</div>
                ` : ''}
                
                <div class="footer">Created with YokeConnect</div>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto py-10">
                <Card variant="default" className="shadow-xl">
                    <CardBody className="p-8 text-center">
                        <div className="animate-pulse">Loading your profile...</div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                    <button
                        key={s}
                        onClick={() => step < 4 && setStep(s)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-200 text-gray-500'
                            } ${step < 4 ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                    >
                        {s}
                    </button>
                ))}
                <div className="flex-1 h-1 bg-gray-200 rounded">
                    <div
                        className="h-full bg-[var(--brand-primary)] rounded transition-all duration-300"
                        style={{ width: `${Math.min(100, ((step - 1) / 3) * 100)}%` }}
                    />
                </div>
            </div>

            <Card variant="default" className="shadow-xl border-t-4 border-[var(--brand-primary)]">
                <CardBody className="p-8">
                    {/* Step 1: Experience */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold mb-2">Professional Summary & Experience</h2>
                            <p className="text-gray-500 mb-6">Share your hospitality journey. <strong>This automatically updates your Worker Map.</strong></p>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
                                    <button
                                        onClick={generateAISummary}
                                        disabled={aiGenerating}
                                        className="text-sm px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 transition-all flex items-center gap-1 disabled:opacity-50"
                                    >
                                        {aiGenerating ? (
                                            <>⏳ Generating...</>
                                        ) : (
                                            <>✨ AI Generate</>
                                        )}
                                    </button>
                                </div>
                                <textarea
                                    value={cvData.summary}
                                    onChange={(e) => setCvData(prev => ({ ...prev, summary: e.target.value }))}
                                    placeholder="A brief overview of your hospitality career and what you bring to any team..."
                                    className="w-full h-28 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">💡 Tip: Fill in your work experience first, then use AI Generate for a personalized summary</p>
                            </div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">Work Experience</label>
                            <div className="space-y-4">
                                {experiences.map((exp, i) => (
                                    <div key={i} className="p-4 border rounded-xl bg-gray-50/50 space-y-3 relative">
                                        <button
                                            onClick={() => removeExperience(i)}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
                                        >
                                            ×
                                        </button>

                                        <Input
                                            placeholder="Company/Venue Name"
                                            value={exp.employerName || ''}
                                            onChange={(e) => updateExperience(i, 'employerName', e.target.value)}
                                            className="font-bold"
                                        />

                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                placeholder="Job Title (e.g. Head Waiter)"
                                                value={exp.roleTitle || ''}
                                                onChange={(e) => updateExperience(i, 'roleTitle', e.target.value)}
                                            />
                                            <Input
                                                type="date"
                                                placeholder="Start Date"
                                                value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => updateExperience(i, 'startDate', e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                placeholder="City (e.g. Brighton)"
                                                value={exp.city || ''}
                                                onChange={(e) => updateExperience(i, 'city', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Postal Code"
                                                value={exp.postalCode || ''}
                                                onChange={(e) => updateExperience(i, 'postalCode', e.target.value)}
                                            />
                                        </div>

                                        {/* Privacy Settings */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 mt-3">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium text-gray-700">Visibility</label>
                                                    <select
                                                        value={exp.visibilityLevel || 'private'}
                                                        onChange={(e) => updateExperience(i, 'visibilityLevel', e.target.value)}
                                                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                                                    >
                                                        <option value="private">Private</option>
                                                        <option value="applied_only">When Applied</option>
                                                        <option value="shortlisted_only">Shortlisted Only</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={exp.isMapEnabled !== false}
                                                        onChange={(e) => updateExperience(i, 'isMapEnabled', e.target.checked)}
                                                        className="rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                                                    />
                                                    <span className="text-sm text-gray-700">Show on Worker Map</span>
                                                </div>
                                            </div>
                                        </div>

                                        <textarea
                                            placeholder="Brief description of your responsibilities and achievements..."
                                            value={exp.description || ''}
                                            onChange={(e) => updateExperience(i, 'description', e.target.value)}
                                            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={addExperience}
                                    className="text-[var(--brand-primary)] text-sm font-bold flex items-center gap-1 hover:underline"
                                >
                                    + Add more experience
                                </button>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <Button onClick={() => setStep(2)} variant="primary" className="px-8">Next: Skills</Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Skills & Certifications */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold mb-2">Skills & Certifications</h2>
                            <p className="text-gray-500 mb-6">Highlight what makes you stand out in hospitality.</p>

                            {/* Skills */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Skills</label>
                                    <button
                                        onClick={() => setShowSkillSuggestions(!showSkillSuggestions)}
                                        className="text-sm px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 transition-all"
                                    >
                                        ✨ {showSkillSuggestions ? 'Hide' : 'Show'} Suggestions
                                    </button>
                                </div>

                                {/* AI Skill Suggestions */}
                                {showSkillSuggestions && (
                                    <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                                        <p className="text-sm text-gray-600 mb-3">✨ Click to add hospitality skills:</p>

                                        {Object.entries(HOSPITALITY_SKILLS).map(([category, skills]) => (
                                            <div key={category} className="mb-3">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{category}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {skills.filter(skill => !cvData.skills.includes(skill)).slice(0, 5).map(skill => (
                                                        <button
                                                            key={skill}
                                                            onClick={() => addSuggestedSkill(skill)}
                                                            className="text-xs px-2 py-1 bg-white border border-purple-200 text-purple-700 rounded-full hover:bg-purple-100 transition-colors"
                                                        >
                                                            + {skill}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        placeholder="e.g. Silver Service, POS Systems..."
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    />
                                    <Button onClick={addSkill} variant="outline">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cvData.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                                            {skill}
                                            <button onClick={() => removeSkill(skill)} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Certifications */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>

                                {/* Certification Suggestions */}
                                {getAvailableCertifications().length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-1">
                                        <span className="text-xs text-gray-500 mr-1">✨ Quick add:</span>
                                        {getAvailableCertifications().slice(0, 5).map(cert => (
                                            <button
                                                key={cert}
                                                onClick={() => addSuggestedCertification(cert)}
                                                className="text-xs px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                                            >
                                                + {cert}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={certInput}
                                        onChange={(e) => setCertInput(e.target.value)}
                                        placeholder="e.g. Food Hygiene Level 2, First Aid..."
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                                    />
                                    <Button onClick={addCertification} variant="outline">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cvData.certifications.map(cert => (
                                        <span key={cert} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                                            {cert}
                                            <button onClick={() => removeCertification(cert)} className="ml-1 text-green-600 hover:text-green-800">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Languages */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={langInput}
                                        onChange={(e) => setLangInput(e.target.value)}
                                        placeholder="e.g. English (Native), Spanish (Fluent)..."
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                                    />
                                    <Button onClick={addLanguage} variant="outline">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cvData.languages.map(lang => (
                                        <span key={lang} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                                            {lang}
                                            <button onClick={() => removeLanguage(lang)} className="ml-1 text-purple-600 hover:text-purple-800">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between">
                                <Button onClick={() => setStep(1)} variant="outline">Back</Button>
                                <Button onClick={() => setStep(3)} variant="primary" className="px-8">Preview CV</Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Preview Your CV</h2>
                                    <p className="text-gray-500">Review before saving</p>
                                </div>
                                <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
                                    📄 Export PDF
                                </Button>
                            </div>

                            {/* CV Preview */}
                            <div className="border rounded-xl p-8 bg-white shadow-inner">
                                <h3 className="text-2xl font-bold text-gray-900">{profile?.firstName} {profile?.lastName}</h3>
                                <p className="text-gray-500 mb-4">{profile?.email}</p>

                                {cvData.summary && (
                                    <p className="text-gray-600 italic mb-6 border-l-4 border-[var(--brand-primary)] pl-4">{cvData.summary}</p>
                                )}

                                <h4 className="font-bold text-gray-800 border-b pb-2 mb-4">Experience</h4>
                                {experiences.filter(e => e.employerName || e.roleTitle).map((exp, i) => (
                                    <div key={i} className="mb-4">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">{exp.employerName}</span>
                                            <span className="text-gray-500 text-sm">{exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''}</span>
                                        </div>
                                        <p className="text-gray-600">{exp.roleTitle}</p>
                                        {exp.city && <p className="text-gray-500 text-xs">{exp.city}</p>}
                                        {exp.description && <p className="text-gray-500 text-sm mt-1">{exp.description}</p>}
                                    </div>
                                ))}

                                {cvData.skills.length > 0 && (
                                    <>
                                        <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 mt-6">Skills</h4>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {cvData.skills.map(s => <span key={s} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{s}</span>)}
                                        </div>
                                    </>
                                )}

                                {cvData.certifications.length > 0 && (
                                    <>
                                        <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 mt-6">Certifications</h4>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {cvData.certifications.map(c => <span key={c} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">{c}</span>)}
                                        </div>
                                    </>
                                )}

                                {cvData.languages.length > 0 && (
                                    <>
                                        <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 mt-6">Languages</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {cvData.languages.map(l => <span key={l} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">{l}</span>)}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-8 flex justify-between">
                                <Button onClick={() => setStep(2)} variant="outline">Back to Edit</Button>
                                <Button onClick={handleSave} variant="primary" className="px-8" disabled={saving}>
                                    {saving ? 'Saving...' : '✓ Save Profile'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="text-center py-10 animate-fade-in">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold mb-2">CV Saved Successfully!</h2>
                            <p className="text-gray-500 mb-6">Your profile and work history have been updated.</p>
                            <div className="flex justify-center gap-4">
                                <Button onClick={handleExportPDF} variant="outline">📄 Download PDF</Button>
                                <Link href="/dashboard">
                                    <Button variant="primary">Return to Dashboard</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
