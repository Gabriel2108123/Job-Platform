interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
}

export function PageHeader({ title, description, action, backLink }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {backLink && (
        <a
          href={backLink.href}
          className="text-[var(--brand-primary)] hover:underline mb-4 inline-flex items-center text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLink.label}
        </a>
      )}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    </div>
  );
}
