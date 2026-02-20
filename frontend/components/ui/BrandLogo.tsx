import Image from 'next/image';

interface BrandLogoProps {
    variant?: 'candidate' | 'business';
    className?: string;
    width?: number;
    height?: number;
}

export const BrandLogo = ({
    variant = 'candidate',
    className = '',
    width = 160,
    height = 40
}: BrandLogoProps) => {
    const logoSrc = variant === 'business'
        ? '/logos/yoke-business.png'
        : '/logos/yoke-candidate.png';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative aspect-square" style={{ height }}>
                <Image
                    src={logoSrc}
                    alt="Yoke Connect Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            <div className={`flex flex-col leading-none justify-center ${variant === 'candidate' ? 'text-[var(--brand-gold)]' : 'text-neutral-900'}`}>
                <span className="font-bold text-2xl tracking-wide mb-0.5">YOKE</span>
                <span className="text-[0.65rem] tracking-[0.3em] font-medium opacity-90">CONNECT</span>
            </div>
        </div>
    );
};
