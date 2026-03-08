'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Plus, Upload, Trash2, Edit2, Download, Briefcase, GraduationCap, Award, FileBadge2, Sparkles, Wand2 } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import Link from 'next/link';

interface Experience {
    id: string;
    role: string;
    company: string;
    duration: string;
    description: string;
}

interface Education {
    id: string;
    degree: string;
    institution: string;
    year: string;
}

interface Document {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedAt: string;
}

const mockExperiences: Experience[] = [
    { id: '1', role: 'Head Bartender', company: 'The Ivy', duration: '2021 - Present', description: 'Managed a team of 5 bartenders, cocktail menu creation, inventory management.' },
    { id: '2', role: 'Bartender', company: 'Dishoom', duration: '2019 - 2021', description: 'High-volume cocktail preparation, customer service.' }
];

const mockEducation: Education[] = [
    { id: '1', degree: 'WSET Level 2', institution: 'Wine & Spirit Education Trust', year: '2020' },
    { id: '2', degree: 'BA Hospitality Management', institution: 'University of Westminster', year: '2019' }
];

const mockDocuments: Document[] = [
    { id: '1', name: 'Resume_2024.pdf', type: 'PDF', size: '245 KB', uploadedAt: '2 days ago' },
    { id: '2', name: 'Food_Safety_Level_2.pdf', type: 'Certificate', size: '1.2 MB', uploadedAt: '1 month ago' }
];

export default function CandidateDocumentsPage() {
    const [activeTab, setActiveTab] = useState<'builder' | 'uploads'>('builder');

    return (
        <RoleLayout
            pageTitle="CV & Documents"
            pageActions={
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export CV
                    </Button>
                    <Button variant="primary" className="rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Upload Doc
                    </Button>
                </div>
            }
        >
            <div className="max-w-5xl">
                {/* Tabs */}
                <div className="flex items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-px">
                    <button
                        onClick={() => setActiveTab('builder')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-colors relative ${activeTab === 'builder' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                    >
                        CV Builder
                        {activeTab === 'builder' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t border-b-0" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('uploads')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-colors relative ${activeTab === 'uploads' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                    >
                        Uploaded Docs
                        {activeTab === 'uploads' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t border-b-0" />}
                    </button>
                </div>

                {activeTab === 'builder' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-8">
                            {/* AI CV Generator Widget */}
                            <Card className="rounded-[2rem] border-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden relative shadow-lg">
                                {/* Background decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-900/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

                                <CardBody className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                                    <div className="flex-1">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest mb-3 border border-white/10">
                                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                            <span>AI-Powered</span>
                                        </div>
                                        <h2 className="text-2xl font-black mb-2">Build a Yoke Connect Style CV</h2>
                                        <p className="text-indigo-100 text-sm font-medium max-w-md">
                                            Let our AI analyze your profile and experiences to suggest the perfect hospitality CV format, helping you stand out to top venues.
                                        </p>
                                    </div>
                                    <button className="shrink-0 bg-white text-indigo-600 hover:bg-slate-50 border-0 rounded-xl font-black text-xs uppercase tracking-widest px-6 py-4 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 group">
                                        <span className="flex items-center gap-2">
                                            <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                            Generate CV
                                        </span>
                                    </button>
                                </CardBody>
                            </Card>

                            {/* Work Experience */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-indigo-500" /> Work Experience
                                    </h2>
                                    <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Role
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {mockExperiences.map(exp => (
                                        <Card key={exp.id} className="rounded-2xl border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors group">
                                            <CardBody className="p-5 flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white">{exp.role}</h3>
                                                    <p className="text-xs font-bold text-slate-500 mt-1">{exp.company} • {exp.duration}</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">{exp.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Edit2 className="w-4 h-4" /></button>
                                                    <button className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            </section>

                            {/* Education */}
                            <section className="pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-emerald-500" /> Education & Qualifications
                                    </h2>
                                    <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Education
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {mockEducation.map(edu => (
                                        <Card key={edu.id} className="rounded-2xl border-slate-200 dark:border-slate-800 hover:border-emerald-200 transition-colors group">
                                            <CardBody className="p-5 flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white">{edu.degree}</h3>
                                                    <p className="text-xs font-bold text-slate-500 mt-1">{edu.institution} • {edu.year}</p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Edit2 className="w-4 h-4" /></button>
                                                    <button className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar Stats */}
                        <div className="lg:col-span-4">
                            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">
                                <CardBody className="p-6">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Profile Completeness</h3>
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-3xl font-black text-indigo-600">85%</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-6">
                                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '85%' }} />
                                    </div>
                                    <ul className="space-y-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        <li className="flex items-center gap-2"><Award className="w-4 h-4 text-emerald-500" /> Professional Summary added</li>
                                        <li className="flex items-center gap-2"><Award className="w-4 h-4 text-emerald-500" /> 2+ Work Experiences</li>
                                        <li className="flex items-center gap-2 text-slate-400"><div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700" /> Add 3 skills (Missing)</li>
                                    </ul>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'uploads' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-800 text-indigo-900">
                            <div>
                                <h3 className="font-black text-indigo-900 dark:text-indigo-100 text-lg">Secure Document Vault</h3>
                                <p className="text-xs font-bold text-indigo-600/70 dark:text-indigo-300 mt-1 uppercase tracking-widest">Store references, certificates, and ID documents</p>
                            </div>
                            <Button variant="primary" className="rounded-xl font-black flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Browse Files
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mockDocuments.map(doc => (
                                <Card key={doc.id} className="rounded-2xl border-slate-200 dark:border-slate-800">
                                    <CardBody className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <FileBadge2 className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <button className="text-slate-400 hover:text-rose-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate" title={doc.name}>{doc.name}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{doc.type}</span>
                                            <span className="text-xs font-bold text-slate-400">{doc.size}</span>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}

                            <button className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-all flex flex-col items-center justify-center py-10 gap-2 group">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 group-hover:bg-indigo-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">Upload New</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </RoleLayout>
    );
}
