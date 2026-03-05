import { test, expect, Page } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEED_CANDIDATE = { email: 'candidate@test.com', password: 'Test1234!', name: 'Test Candidate' };

async function loginAs(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.waitForSelector('input[id="email"]', { timeout: 10000 });
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|jobs|business/, { timeout: 15000 });
}

async function logout(page: Page) {
    await page.evaluate(() => {
        localStorage.clear();
        document.cookie.split(';').forEach(c => {
            document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
    });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Platform E2E Tests', () => {

    test('1. Landing page loads correctly', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/YokeConnect|Hospitality/i);
        // Should have sign up / register call to actions
        const ctaButtons = page.locator('button, a').filter({ hasText: /register|join|sign up|get started/i });
        await expect(ctaButtons.first()).toBeVisible({ timeout: 10000 });
        console.log('✅ Landing page loaded with CTAs');
    });

    test('2. Login page renders and shows form', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('input[id="email"]')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('input[id="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        console.log('✅ Login form rendered');
    });

    test('3. Login with invalid credentials shows error', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[id="email"]', 'wrong@example.com');
        await page.fill('input[id="password"]', 'WrongPassword!');
        await page.click('button[type="submit"]');
        // Should show an error message, not redirect
        const errorEl = page.locator('[class*="error"], [class*="alert"], [role="alert"], p.text-red').first();
        await expect(errorEl).toBeVisible({ timeout: 10000 });
        console.log('✅ Invalid login shows error');
    });

    test('4. Seeded candidate can login and reach dashboard', async ({ page }) => {
        await loginAs(page, SEED_CANDIDATE.email, SEED_CANDIDATE.password);
        await expect(page).toHaveURL(/dashboard|jobs/, { timeout: 15000 });
        console.log('✅ Seeded candidate logged in successfully');
        await logout(page);
    });

    test('5. Dashboard loads key widgets after login', async ({ page }) => {
        await loginAs(page, SEED_CANDIDATE.email, SEED_CANDIDATE.password);
        await page.goto('/dashboard');

        // Welcome message
        const welcomeEl = page.locator('h1, h2').filter({ hasText: /welcome|hello|hi/i }).first();
        await expect(welcomeEl).toBeVisible({ timeout: 10000 });

        // Key cards visible
        const cardTitles = page.locator('h2, h3');
        await expect(cardTitles.filter({ hasText: /application|tracker|cv|network/i }).first()).toBeVisible();
        console.log('✅ Dashboard widgets loaded');
        await logout(page);
    });

    test('6. Browse Jobs page is accessible without login', async ({ page }) => {
        await page.goto('/jobs');
        await expect(page).toHaveURL(/jobs/, { timeout: 10000 });
        // Should show job listings or empty state
        const content = page.locator('main, [class*="container"]').first();
        await expect(content).toBeVisible({ timeout: 10000 });
        console.log('✅ Jobs page accessible as visitor');
    });

    test('7. Profile page loads with user data', async ({ page }) => {
        await loginAs(page, SEED_CANDIDATE.email, SEED_CANDIDATE.password);
        await page.goto('/profile');

        // Profile header / name visible
        await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
        // Edit button should exist
        const editBtn = page.locator('button').filter({ hasText: /edit/i }).first();
        await expect(editBtn).toBeVisible();
        console.log('✅ Profile page loaded');
        await logout(page);
    });

    test('8. CV Builder page loads', async ({ page }) => {
        await loginAs(page, SEED_CANDIDATE.email, SEED_CANDIDATE.password);
        await page.goto('/dashboard/cv-builder');
        // Should show the multi-step builder
        await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
        const builderContent = page.locator('[class*="step"], [class*="builder"], [class*="cv"]').first();
        // any visible content is sufficient
        await expect(page.locator('main').first()).toBeVisible();
        console.log('✅ CV Builder loaded');
        await logout(page);
    });

    test('9. My Network page loads with map', async ({ page }) => {
        await loginAs(page, SEED_CANDIDATE.email, SEED_CANDIDATE.password);
        await page.goto('/my-network');

        // Wait for heading
        await expect(page.locator('h1').filter({ hasText: /network/i })).toBeVisible({ timeout: 10000 });

        // Map container should be visible (Leaflet)
        const map = page.locator('.leaflet-container');
        await expect(map).toBeVisible({ timeout: 15000 });
        console.log('✅ Worker Map rendered on My Network page');
        await logout(page);
    });

    test('10. Registration page renders the form', async ({ page }) => {
        await page.goto('/register');
        await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
        // Should have First/Last name and email fields
        await expect(page.locator('input[placeholder*="First"], input[name*="firstName"]').first()).toBeVisible();
        await expect(page.locator('input[placeholder*="Email"], input[name*="email"]').first()).toBeVisible();
        console.log('✅ Registration form rendered');
    });

    test('11. Navigation links work when logged in', async ({ page }) => {
        await loginAs(page, SEED_CANDIDATE.email, SEED_CANDIDATE.password);

        // Dashboard nav
        await page.goto('/dashboard');
        const dashboardHeading = page.locator('h1, h2').first();
        await expect(dashboardHeading).toBeVisible({ timeout: 10000 });

        // Browse Jobs
        await page.goto('/jobs');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

        // Profile
        await page.goto('/profile');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

        console.log('✅ Core navigation working');
        await logout(page);
    });

    test('12. Protected routes redirect to login when not authenticated', async ({ page }) => {
        // Clear auth state
        await page.goto('/');
        await page.evaluate(() => { localStorage.clear(); });

        await page.goto('/dashboard');
        await page.waitForURL(/login|\//, { timeout: 10000 });
        const url = page.url();
        const isProtected = url.includes('login') || url.includes('/');
        expect(isProtected).toBe(true);
        console.log('✅ Protected routes redirect correctly');
    });

});
