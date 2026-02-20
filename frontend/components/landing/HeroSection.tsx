'use client';

import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface HeroSectionProps {
    onScrollToForm: () => void;
}

export default function HeroSection({ onScrollToForm }: HeroSectionProps) {
    return (
        <section className="relative overflow-hidden bg-[var(--brand-navy)] py-20 lg:py-32 xl:py-40">

            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[var(--brand-primary)] opacity-20 blur-3xl animate-pulse"></div>
                <div className="absolute top-[30%] -left-[10%] w-[400px] h-[400px] rounded-full bg-[var(--brand-accent)] opacity-10 blur-3xl"></div>
                <div className="absolute -bottom-[20%] right-[20%] w-[500px] h-[500px] rounded-full bg-[var(--brand-gold)] opacity-5 blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

                {/* Main Headline */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 max-w-5xl mx-auto leading-[1.1]">
                    Hospitality hiring that <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-gold)]">actually moves.</span>
                </h1>

                {/* Subheadline */}
                <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
                    A global platform where hospitality employers and professionals <span className="text-white font-medium">connect directly</span>.
                    <br className="hidden md:block" />
                    No recruiters. No commission. One simple subscription.
                </p>

                {/* Incentive Badge */}
                <div className="mt-12 inline-flex items-center rounded-full bg-white/10 px-6 py-2 border border-white/20 backdrop-blur-md">
                    <span className="flex h-2 w-2 rounded-full bg-[var(--brand-accent)] mr-3 animate-pulse"></span>
                    <span className="text-sm md:text-base font-medium text-white tracking-wide">
                        First 1,000 employers & 5,000 employees get <span className="text-[var(--brand-gold)] font-bold">12 months free</span>
                    </span>
                </div>

                {/* CTA Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        size="lg"
                        onClick={onScrollToForm}
                        className="w-full sm:w-auto text-lg px-8 py-6 bg-white text-blue-700 hover:text-blue-800 hover:bg-gray-100 font-bold shadow-lg transition-all"
                    >
                        Join Waitlist
                    </Button>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <Link href="/register" className="flex-1 sm:flex-initial">
                            <Button
                                size="lg"
                                variant="primary"
                                className="w-full sm:w-80 text-lg px-8 py-6 bg-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/80 text-white font-bold shadow-lg transition-all"
                            >
                                Register Now
                            </Button>
                        </Link>
                        <Link href="/login" className="flex-1 sm:flex-initial">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto text-lg px-8 py-6 border-white text-white hover:bg-white/10 font-bold transition-all"
                            >
                                Log In
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-8">
                    <Link href="/jobs" className="text-gray-300 hover:text-[var(--brand-gold)] transition-colors flex items-center justify-center gap-2 group">
                        <span>Continue as visitor and</span>
                        <span className="font-bold underline decoration-[var(--brand-gold)]/30 group-hover:decoration-[var(--brand-gold)]">Browse Jobs →</span>
                    </Link>
                </div>

            </div>
        </section>
    );
}
