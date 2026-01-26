const { chromium } = require('playwright');

(async () => {
    console.log('🚀 Starting Automated Account Creation...');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 800  // Slow down so you can see what's happening
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Increase default timeout
    page.setDefaultTimeout(60000);

    try {
        // Create 2 Candidate accounts
        const candidates = [
            { email: 'sarah.jones@test.com', name: 'Sarah Jones' },
            { email: 'mike.wilson@test.com', name: 'Mike Wilson' }
        ];

        for (const candidate of candidates) {
            console.log(`\n👤 Creating Candidate: ${candidate.name}...`);

            console.log('  Navigating to register page...');
            await page.goto('http://localhost:3000/register', { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(2000);

            console.log('  Filling in form...');

            // Fill in the form
            await page.fill('input[name="email"]', candidate.email);
            await page.fill('input[name="password"]', 'Test1234!');
            await page.fill('input[name="fullName"]', candidate.name);

            // Check if there's a role selector, if so select Candidate
            const roleSelect = await page.$('select[name="role"]');
            if (roleSelect) {
                await page.selectOption('select[name="role"]', 'Candidate');
            }

            // Click register button
            await page.click('button[type="submit"]');

            // Wait for navigation or success
            await page.waitForTimeout(2000);

            console.log(`✅ Created candidate: ${candidate.email}`);
        }

        // Create 2 Business Owner accounts
        const businesses = [
            { email: 'owner.riverside@test.com', name: 'Tom Riverside', org: 'Riverside Restaurant' },
            { email: 'owner.seaside@test.com', name: 'Emma Seaside', org: 'Seaside Hotel' }
        ];

        for (const business of businesses) {
            console.log(`\n🏢 Creating Business Owner: ${business.name} (${business.org})...`);

            await page.goto('http://localhost:3000/register');
            await page.waitForTimeout(1000);

            // Fill in the form
            await page.fill('input[name="email"]', business.email);
            await page.fill('input[name="password"]', 'Test1234!');
            await page.fill('input[name="fullName"]', business.name);

            // Fill organization name if field exists
            const orgField = await page.$('input[name="organizationName"]');
            if (orgField) {
                await page.fill('input[name="organizationName"]', business.org);
            }

            // Select BusinessOwner role if selector exists
            const roleSelect = await page.$('select[name="role"]');
            if (roleSelect) {
                await page.selectOption('select[name="role"]', 'BusinessOwner');
            }

            // Click register button
            await page.click('button[type="submit"]');

            // Wait for navigation or success
            await page.waitForTimeout(2000);

            console.log(`✅ Created business owner: ${business.email}`);
        }

        console.log('\n🎉 All accounts created successfully!');
        console.log('\n📋 Summary:');
        console.log('Candidates:');
        candidates.forEach(c => console.log(`  - ${c.email} / Test1234!`));
        console.log('\nBusiness Owners:');
        businesses.forEach(b => console.log(`  - ${b.email} / Test1234! (${b.org})`));

        // Keep browser open for a moment
        await page.waitForTimeout(3000);

    } catch (error) {
        console.error('❌ FAILED:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
