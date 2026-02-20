/**
 * User roles in the platform
 */
export enum UserRole {
  Candidate = 'Candidate',
  BusinessOwner = 'BusinessOwner',
  Staff = 'Staff',
  Admin = 'Admin',
  Support = 'Support',
}

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  role?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;

  // Extended fields
  position?: string;
  countryOfResidence?: string;
  primaryRole?: string;
  currentStatus?: string;
}

/**
 * Organization interface
 */
export interface Organization {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresAt: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  Role?: string;  // 'Candidate' or 'BusinessOwner'

  // Common
  phoneNumber?: string;
  agreedToTerms?: boolean;
  agreedToPrivacy?: boolean;

  // Employee
  CountryOfResidence?: string;
  PrimaryRole?: string;
  CurrentStatus?: string;
  ReferralCode?: string;
  IsOver16?: boolean;

  // Business
  OrganizationName?: string;
  TradingName?: string;
  CountryOfRegistration?: string;
  VATNumber?: string;
  DiscountCode?: string;
  AuthorizedToHire?: boolean;
}
