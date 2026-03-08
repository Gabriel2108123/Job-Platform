'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { ROUTES } from '@/config/routes';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Briefcase, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getOrganizationId } from '@/lib/auth-helpers';
import { getAuthHeaders } from '@/lib/auth';

const STEPS = ['Job Details', 'Requirements', 'Visibility', 'Review'];

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Casual', 'Zero Hours'];
const DEPARTMENTS = ['Front of House', 'Kitchen', 'Bar', 'Events', 'Management', 'Housekeeping', 'Reception', 'Other'];

export default function NewJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    department: '',
    type: '',
    location: '',
    postalCode: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'GBP',
    description: '',
    requiredQualifications: '',
    benefits: '',
    status: 'Draft' as 'Draft' | 'Active',
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgId = getOrganizationId();
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...form,
          organizationId: orgId,
          salaryMin: form.salaryMin ? parseInt(form.salaryMin) : null,
          salaryMax: form.salaryMax ? parseInt(form.salaryMax) : null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create job.');
      const data = await res.json();
      router.push(ROUTES.BUSINESS.JOB_DETAIL(data.id));
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400';
  const labelCls = 'block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2';

  return (
    <RoleLayout
      pageTitle="Create New Role"
      pageActions={
        <Link href={ROUTES.BUSINESS.JOBS}>
          <Button variant="outline" className="flex items-center gap-2 rounded-xl font-black text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Button>
        </Link>
      }
    >
      <div className="max-w-3xl">
        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-12">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${i < step ? 'bg-emerald-500 text-white' :
                    i === step ? 'bg-indigo-600 text-white' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest hidden sm:block ${i === step ? 'text-indigo-600' : i < step ? 'text-emerald-500' : 'text-slate-400'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-emerald-300' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 shadow-sm">
          <CardBody className="p-8 md:p-10">
            {/* Step 0: Job Details */}
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Tell us about the role</h2>
                <div>
                  <label className={labelCls}>Job Title *</label>
                  <input className={inputCls} placeholder="e.g. Senior Bartender" value={form.title} onChange={e => update('title', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Department</label>
                    <select className={inputCls} value={form.department} onChange={e => update('department', e.target.value)}>
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Employment Type</label>
                    <select className={inputCls} value={form.type} onChange={e => update('type', e.target.value)}>
                      <option value="">Select type</option>
                      {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}><MapPin className="w-3 h-3 inline mr-1" />Location</label>
                    <input className={inputCls} placeholder="e.g. Soho, London" value={form.location} onChange={e => update('location', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Postcode</label>
                    <input className={inputCls} placeholder="e.g. W1D 3JH" value={form.postalCode} onChange={e => update('postalCode', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className={labelCls}>Currency</label>
                    <select className={inputCls} value={form.salaryCurrency} onChange={e => update('salaryCurrency', e.target.value)}>
                      <option>GBP</option><option>EUR</option><option>USD</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Min Salary (£/yr)</label>
                    <input className={inputCls} type="number" placeholder="e.g. 28000" value={form.salaryMin} onChange={e => update('salaryMin', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Max Salary (£/yr)</label>
                    <input className={inputCls} type="number" placeholder="e.g. 35000" value={form.salaryMax} onChange={e => update('salaryMax', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Requirements */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Define the requirements</h2>
                <div>
                  <label className={labelCls}>Job Description *</label>
                  <textarea rows={6} className={inputCls} placeholder="Describe the role, responsibilities, and what a great day looks like..." value={form.description} onChange={e => update('description', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Required Qualifications & Experience</label>
                  <textarea rows={4} className={inputCls} placeholder="List must-have skills, certifications, and experience levels..." value={form.requiredQualifications} onChange={e => update('requiredQualifications', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Benefits & Perks</label>
                  <textarea rows={3} className={inputCls} placeholder="e.g. Staff meals, tips, pension, 28 days holiday..." value={form.benefits} onChange={e => update('benefits', e.target.value)} />
                </div>
              </div>
            )}

            {/* Step 2: Visibility */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">When should this go live?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card
                    className={`rounded-[2rem] cursor-pointer border-2 transition-all ${form.status === 'Draft' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700'}`}
                    onClick={() => update('status', 'Draft')}
                  >
                    <CardBody className="p-8">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Clock className="w-5 h-5 text-slate-500" />
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white mb-1">Save as Draft</h3>
                      <p className="text-sm text-slate-500">Not visible to candidates. You can publish any time.</p>
                    </CardBody>
                  </Card>
                  <Card
                    className={`rounded-[2rem] cursor-pointer border-2 transition-all ${form.status === 'Active' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700'}`}
                    onClick={() => update('status', 'Active')}
                  >
                    <CardBody className="p-8">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                        <Briefcase className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white mb-1">Publish Now</h3>
                      <p className="text-sm text-slate-500">Immediately visible to matching candidates.</p>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Review & Confirm</h2>
                <p className="text-sm text-slate-500 mb-8">Check everything looks right before creating the role.</p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-8 space-y-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Title</span><span className="font-black text-slate-900 dark:text-white">{form.title || '—'}</span></div>
                  <div className="flex justify-between items-start"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Type</span><span className="font-black text-slate-900 dark:text-white">{form.type || '—'}</span></div>
                  <div className="flex justify-between items-start"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Location</span><span className="font-black text-slate-900 dark:text-white">{form.location || '—'}</span></div>
                  <div className="flex justify-between items-start"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Salary</span><span className="font-black text-slate-900 dark:text-white">{form.salaryMin && form.salaryMax ? `${form.salaryCurrency} ${form.salaryMin}–${form.salaryMax}` : 'Not specified'}</span></div>
                  <div className="flex justify-between items-start"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Status</span><span className={`text-xs font-black px-2 py-0.5 rounded-md ${form.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{form.status}</span></div>
                </div>
                {error && <p className="text-sm text-rose-600 font-bold bg-rose-50 rounded-2xl p-4">{error}</p>}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" className="rounded-xl font-black text-xs uppercase tracking-widest" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button variant="primary" className="rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2" onClick={() => setStep(s => s + 1)} disabled={step === 0 && !form.title}>
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="primary" className="rounded-xl font-black text-xs uppercase tracking-widest px-8" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating...' : form.status === 'Active' ? 'Publish Role' : 'Save Draft'}
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </RoleLayout>
  );
}
