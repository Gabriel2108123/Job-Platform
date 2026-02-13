/**
 * Company Information Constants
 * Update these values with your actual company details before launch
 */

export const COMPANY_INFO = {
    // These are placeholder values - replace with actual company information
    REGISTERED_NAME: '[Company Name Ltd]',
    TRADING_NAME: 'YokeConnect',
    COMPANY_NUMBER: '[Company Number]',
    LICENSE_NUMBER: '[License Number - if applicable]',
    ADDRESS: '[Registered Company Address]',
    EMAIL: 'legal@yokeconnect.com',
    PHONE: '[Support Phone Number]',

    // Privacy & Data Protection
    DATA_PROTECTION_OFFICER: '[DPO Name]',
    DPO_EMAIL: 'privacy@yokeconnect.com',

    // For legal notices
    JURISDICTION: 'England and Wales',
    GOVERNING_LAW: 'the laws of England and Wales',
} as const;

export type CompanyInfoKey = keyof typeof COMPANY_INFO;
