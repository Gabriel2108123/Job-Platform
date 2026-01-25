const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🚀 Starting Automated Login Test...');

    // Launch browser
    const browser = await chromium.launch({ headless: false }); // Headless: false so user can see it
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // 1. Navigate to Login Page
        console.log('📍 Navigating to login page...');
        await page.goto('http://localhost:3000/login');

        // 2. Fill Credentials
        console.log('✍️ Entering credentials for Candidate...');
        await page.fill('input[name="email"]', 'candidate@test.com');
        await page.fill('input[name="password"]', 'Test1234!');

        // 3. Click Login
        console.log('🖱️ Clicking Login...');
        await page.click('button[type="submit"]');

        // 4. Verify Redirection
        console.log('⏳ Waiting for redirection...');
        await page.waitForURL('**/jobs', { timeout: 10000 });

        console.log('✅ SUCCESS: Redirected to /jobs page!');

        // 5. Take Screenshot
        const screenshotPath = path.join(__dirname, 'login-success.png');
        await page.screenshot({ path: screenshotPath });
        console.log(`📸 Screenshot saved to: ${screenshotPath}`);

        // Keep open for a moment so user can see
        await page.waitForTimeout(3000);

    } catch (error) {
        console.error('❌ TEST FAILED:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
