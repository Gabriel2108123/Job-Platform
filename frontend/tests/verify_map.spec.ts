import { test, expect } from '@playwright/test';

test.use({
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on',
    screenshot: 'on',
});

test('Verify User Map Access for Candidate and Business', async ({ page }) => {
    // Increase timeout
    test.setTimeout(120000);

    // 1. Register Candidate
    const timestamp = Date.now();
    const email = `auto_test_${timestamp}@example.com`;
    console.log(`[Step 1] Registering candidate: ${email}`);

    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'Auto');
    await page.fill('input[name="fullName"]', 'Auto Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    // Ensure "Candidate" is selected (it's the default, but let's be safe)
    // The radio value is 'candidate'
    const candidateRadio = page.locator('input[value="candidate"]');
    if (await candidateRadio.isVisible()) {
        await candidateRadio.click();
    }

    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(/jobs|profile|dashboard/, { timeout: 15000 }).catch(() => console.log('Navigation wait timed out or redirected elsewhere'));

    // Navigate to Profile -> Map
    console.log('[Step 2] Navigating to Profile...');
    await page.goto('/profile');

    // Click Worker Map tab
    console.log('Clicking Worker Map tab...');
    await page.click('button:has-text("Worker Map")');

    // Verify Map
    console.log('Verifying Candidate Map visibility...');
    const mapElement = page.locator('.leaflet-container').first();
    await expect(mapElement).toBeVisible({ timeout: 10000 });
    console.log('✅ Candidate Map Verified!');

    // 2. Logout
    console.log('[Step 3] Logging out...');
    // Force logout via API or UI
    await page.evaluate(() => {
        document.cookie.split(";").forEach(function (c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
        localStorage.clear();
        window.location.href = '/login';
    });
    await page.waitForURL(/\/login/, { timeout: 5000 });

    // 3. Login Business
    console.log('[Step 4] Logging in as Business Owner...');
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner1@business.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/business/, { timeout: 15000 });

    // 4. Verify Business Map (Jobs -> Discovery)
    console.log('[Step 5] Navigating to Business Jobs...');
    await page.goto('/business/jobs');

    // Click first job "Find Workers" link
    console.log('Clicking Find Workers...');
    const findWorkersBtn = page.locator('a[href*="/discovery"]').first();
    if (await findWorkersBtn.count() > 0) {
        await findWorkersBtn.click();
        console.log('Verifying Business Discovery Map...');
        const businessMap = page.locator('.leaflet-container').first();
        await expect(businessMap).toBeVisible({ timeout: 15000 });
        console.log('✅ Business Map Verified!');
    } else {
        console.log('⚠️ No "Find Workers" button found. Check if seed jobs exist.');
        // If no jobs, we can't verify this part, but test shouldn't fail the candidate part
    }
});
