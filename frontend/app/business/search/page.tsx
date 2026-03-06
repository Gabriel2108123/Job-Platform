'use client';

import { useState, useEffect } from 'react';
import {
    searchCandidates,
    getJobRoles,
    CandidateSearchResult,
    JobRoleDto,
    createSavedSearch,
    getSavedSearches,
    deleteSavedSearch,
    SavedSearchDto
} from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import {
    Search,
    MapPin,
    Sparkles,
    Target,
    Save,
    Filter,
    History,
    Users,
    ChevronRight,
    SearchX,
    Bell,
    Trash2
} from 'lucide-react';
import dynamic from 'next/dynamic';

const CandidateSearchMap = dynamic(() => import('@/components/business/CandidateSearchMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-3xl" />
});

export default function CandidateDiscoveryPage() {
    return (
        <RequireAuth>
            <RequireRole allowedRoles={['BusinessOwner', 'Staff']}>
                <CandidateDiscoveryContent />
            </RequireRole>
        </RequireAuth>
    );
}

function CandidateDiscoveryContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [roles, setRoles] = useState<JobRoleDto[]>([]);
    const [results, setResults] = useState<CandidateSearchResult[]>([]);
    const [savedSearches, setSavedSearches] = useState<SavedSearchDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSavingSearch, setIsSavingSearch] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    // London as default center for demo
    const [mapCenter] = useState({ lat: 51.5074, lng: -0.1278 });

    useEffect(() => {
        const loadInitialData = async () => {
            const [rolesRes, savedRes] = await Promise.all([
                getJobRoles(),
                getSavedSearches()
            ]);

            if (rolesRes.success) setRoles(rolesRes.data || []);
            if (savedRes.success) setSavedSearches(savedRes.data || []);

            // Initial search
            handleSearch();
        };
        loadInitialData();
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await searchCandidates({
                query: searchQuery,
                jobRoleId: selectedRole || undefined,
                pageSize: 20
            });
            if (res.success && res.data) {
                setResults(res.data.items);
            }
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSearch = async () => {
        const name = prompt('Name this search (e.g., "London Head Chefs"):');
        if (!name) return;

        setIsSavingSearch(true);
        try {
            const params = JSON.stringify({ query: searchQuery, jobRoleId: selectedRole });
            const res = await createSavedSearch({ name, searchParamsJson: params, enableEmailAlerts: true });
            if (res.success && res.data) {
                setSavedSearches([res.data, ...savedSearches]);
            }
        } finally {
            setIsSavingSearch(false);
        }
    };

    const handleDeleteSaved = async (id: string) => {
        if (!confirm('Remove this saved search?')) return;
        const res = await deleteSavedSearch(id);
        if (res.success) {
            setSavedSearches(savedSearches.filter(s => s.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-indigo-600 p-1.5 rounded-lg text-white">
                                <Search size={18} />
                            </span>
                            <span className="text-indigo-600 font-black text-xs uppercase tracking-widest">Stage 4: Search & Match</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Talent Discovery</h1>
                        <p className="text-slate-500 font-medium mt-1">Connect with {results.length}+ verified professionals near you.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('list')}
                            className="rounded-xl px-6 font-bold"
                        >
                            <Users size={18} className="mr-2" /> List
                        </Button>
                        <Button
                            variant={viewMode === 'map' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('map')}
                            className="rounded-xl px-6 font-bold"
                        >
                            <MapPin size={18} className="mr-2" /> Map View
                        </Button>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <Card className="rounded-3xl border-none shadow-xl shadow-indigo-100/20 overflow-visible">
                    <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-5 space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase ml-1">Search Keywords</label>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Name, skills, or bio..."
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-3 space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase ml-1">Specialization</label>
                                <select
                                    className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 appearance-none"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="">All Roles</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-4 flex gap-2">
                                <Button
                                    onClick={handleSearch}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200"
                                >
                                    Unlock Talent
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleSaveSearch}
                                    className="p-4 rounded-2xl border-slate-200 text-slate-500 hover:text-indigo-600"
                                    disabled={isSavingSearch}
                                >
                                    <Save size={24} />
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* Sidebar: Saved Searches */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center gap-2 px-2">
                            <History size={18} className="text-indigo-500" />
                            <h2 className="font-black text-slate-800 text-sm uppercase tracking-wide">Saved Filters</h2>
                        </div>

                        <div className="space-y-3">
                            {savedSearches.length === 0 ? (
                                <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                                    <p className="text-xs font-bold text-slate-400">No saved searches yet.</p>
                                </div>
                            ) : (
                                savedSearches.map(s => (
                                    <Card key={s.id} className="rounded-2xl border-none shadow-sm group hover:ring-2 hover:ring-indigo-100 transition-all">
                                        <CardBody className="p-4 flex items-center justify-between">
                                            <div className="cursor-pointer" onClick={() => {
                                                const p = JSON.parse(s.searchParamsJson);
                                                setSearchQuery(p.query || '');
                                                setSelectedRole(p.jobRoleId || '');
                                            }}>
                                                <p className="font-bold text-slate-700 text-sm truncate">{s.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${s.enableEmailAlerts ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {s.enableEmailAlerts ? 'Alerts On' : 'Alerts Off'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSaved(s.id)}
                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </CardBody>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Smart Match Tip */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
                            <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Target size={20} className="text-indigo-200" />
                                    <span className="text-[10px] font-black uppercase tracking-[2px]">Matching Pro Tip</span>
                                </div>
                                <p className="text-sm font-bold leading-relaxed mb-4">
                                    Candidates with <span className="text-indigo-300">verified connections</span> are 3x more likely to be a culture fit.
                                </p>
                                <Button className="w-full bg-white text-indigo-600 font-black text-xs rounded-xl shadow-md border-none">
                                    Learn More
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed/Map */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
                                ))}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <SearchX size={40} className="text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">No Talent Found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto font-medium">Try broadening your search or specialization to see more professionals.</p>
                            </div>
                        ) : viewMode === 'map' ? (
                            <div className="h-[700px]">
                                <CandidateSearchMap
                                    center={mapCenter}
                                    radiusKm={10}
                                    candidates={results}
                                    onCandidateClick={(c) => console.log('Click', c)}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.map(candidate => (
                                    <CandidateProfileCard key={candidate.userId} candidate={candidate} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CandidateProfileCard({ candidate }: { candidate: CandidateSearchResult }) {
    return (
        <Card className="rounded-[2rem] border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden bg-white">
            <CardBody className="p-0">
                <div className="flex flex-col h-full">
                    {/* Top Section */}
                    <div className="p-6 flex items-start justify-between bg-gradient-to-b from-slate-50 to-white">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 overflow-hidden border-4 border-white shadow-md flex items-center justify-center relative">
                                {candidate.profilePictureUrl ? (
                                    <img src={candidate.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Users size={28} className="text-indigo-400" />
                                )}
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" title="Online now" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
                                    {candidate.firstName} {candidate.lastName?.charAt(0)}.
                                </h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{candidate.primaryRole || 'Professional'}</p>
                                    <span className="text-slate-300">•</span>
                                    <p className="text-xs font-bold text-slate-400">{candidate.city || 'United Kingdom'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 ${candidate.matchScore > 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    candidate.matchScore > 50 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-slate-50 text-slate-700 border-slate-100'
                                }`}>
                                <Sparkles size={12} className={candidate.matchScore > 80 ? 'animate-pulse' : ''} />
                                {Math.round(candidate.matchScore)}% Match
                            </div>
                        </div>
                    </div>

                    {/* Bio & Skills */}
                    <div className="px-6 pb-6 mt-2">
                        <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 min-h-[40px]">
                            {candidate.bio || "Enthusiastic hospitality professional with a focus on delivering exceptional guest experiences."}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {candidate.skills?.slice(0, 4).map(skill => (
                                <Badge key={skill} className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] px-2 py-1 rounded-lg">
                                    {skill}
                                </Badge>
                            ))}
                            {(candidate.skills?.length || 0) > 4 && (
                                <span className="text-[10px] font-black text-slate-300 ml-1">+{(candidate.skills?.length || 0) - 4} more</span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 bg-slate-50/50 mt-auto border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">Mutual Connections</span>
                        </div>
                        <Button variant="outline" className="rounded-xl font-black text-xs px-4 border-slate-200 text-indigo-600 hover:bg-white group">
                            Full Profile <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
