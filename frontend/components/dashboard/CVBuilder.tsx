'use client';

import { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

interface Experience {
    company: string;
    role: string;
    duration: string;
}

export function CVBuilder() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [experience, setExperience] = useState<Experience[]>([{ company: '', role: '', duration: '' }]);
    const [skills, setSkills] = useState<string>('');

    const addExperience = () => setExperience([...experience, { company: '', role: '', duration: '' }]);

    const handleSave = async () => {
        setLoading(true);
        // Simulating API save to ResumeJson
        setTimeout(() => {
            setLoading(false);
            setStep(3);
        }, 1500);
    };

    return (
        <div className="max-w-3xl mx-auto py-10">
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-200'}`}>1</div>
                <div className="flex-1 h-1 bg-gray-200"><div className="h-full bg-[var(--brand-primary)] transition-all" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-200'}`}>2</div>
                <div className="flex-1 h-1 bg-gray-200"><div className="h-full bg-[var(--brand-primary)] transition-all" style={{ width: step <= 2 ? '0%' : '100%' }}></div></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-200'}`}>3</div>
            </div>

            <Card variant="default" className="shadow-xl border-t-4 border-[var(--brand-primary)]">
                <CardBody className="p-8">
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold mb-2">Work Experience</h2>
                            <p className="text-gray-500 mb-6">Tell us about your previous roles in hospitality.</p>

                            <div className="space-y-6">
                                {experience.map((exp, i) => (
                                    <div key={i} className="p-4 border rounded-xl bg-gray-50/50 space-y-4">
                                        <Input placeholder="Company Name" value={exp.company} onChange={() => { }} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input placeholder="Role (e.g. Waiter)" value={exp.role} onChange={() => { }} />
                                            <Input placeholder="Duration (e.g. 2 years)" value={exp.duration} onChange={() => { }} />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addExperience} className="text-[var(--brand-primary)] text-sm font-bold flex items-center gap-1 hover:underline">
                                    + Add more experience
                                </button>
                            </div>

                            <div className="mt-10 flex justify-end">
                                <Button onClick={() => setStep(2)} variant="primary" className="px-8">Next Step</Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold mb-2">Core Skills</h2>
                            <p className="text-gray-500 mb-6">What makes you a great fit for your next role?</p>

                            <textarea
                                className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none"
                                placeholder="e.g. Silver service, Wine knowledge, POS systems, Team leadership..."
                            />

                            <div className="mt-10 flex justify-between">
                                <Button onClick={() => setStep(1)} variant="outline">Back</Button>
                                <Button onClick={handleSave} variant="primary" className="px-8" disabled={loading}>
                                    {loading ? 'Saving Profile...' : 'Finish & Save'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-10 animate-fade-in">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold mb-2">Profile Updated!</h2>
                            <p className="text-gray-500 mb-8">Your professional profile is now live and ready for applications.</p>
                            <Link href="/dashboard">
                                <Button variant="primary">Return to Dashboard</Button>
                            </Link>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
