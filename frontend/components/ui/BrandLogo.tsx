import Image from 'next/image';

interface BrandLogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export const BrandLogo = ({
    className = '',
    width = 200,
    height = 200
}: BrandLogoProps) => {
    const logoSrc = '/logos/yoke-candidate.png';

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Text: YOKE / CONNECT */}
            <div className="flex flex-col leading-none justify-center text-[var(--brand-gold)]">
                <span className="font-bold text-3xl tracking-wide mb-0.5">YOKE</span>
                <span className="text-[0.7rem] tracking-[0.3em] font-medium opacity-90">CONNECT</span>
            </div>
            {/* Icon on the RIGHT */}
            <div className="relative aspect-square" style={{ height }}>
                <Image
                    src={logoSrc}
                    alt="Yoke Connect Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </div>
    );
};
