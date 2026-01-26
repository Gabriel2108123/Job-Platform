const { chromium } = require('playwright');

(async () => {
    console.log('🚀 Starting Automated Job Posting...');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 600
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(60000);

    const jobs = [
        {
            business: { email: 'owner.riverside@test.com', password: 'Test1234!' },
            job: {
                title: 'Head Waiter',
                description: 'Experienced head waiter needed for busy riverside restaurant. Must have excellent customer service skills and at least 3 years of professional experience in a high-volume hospitality environment. Leadership skills and attention to detail are paramount.',
                location: 'Manchester',
                salary: '30000',
                employmentType: 'FullTime'
            }
        },
        {
            business: { email: 'owner.riverside@test.com', password: 'Test1234!' },
            job: {
                title: 'Sous Chef',
                description: 'Talented sous chef required to support our head chef in our busy Manchester location. Experience in French cuisine preferred, with at least 5 years in a kitchen environment. Ability to work weekends and evenings is essential.',
                location: 'Manchester',
                salary: '40000',
                employmentType: 'FullTime'
            }
        },
        {
            business: { email: 'owner.seaside@test.com', password: 'Test1234!' },
            job: {
                title: 'Hotel Receptionist',
                description: 'Friendly and organized receptionist for our seaside hotel in Brighton. Must have excellent communication skills and be comfortable with guest management software. Evening and weekend shifts are part of this role.',
                location: 'Brighton',
                salary: '24000',
                employmentType: 'FullTime'
            }
        },
        {
            business: { email: 'owner.seaside@test.com', password: 'Test1234!' },
            job: {
                title: 'Restaurant Manager',
                description: 'Experienced restaurant manager to oversee our hotel restaurant in Brighton. Must have previous management experience and food safety certification. Strong focus on guest satisfaction and team development.',
                location: 'Brighton',
                salary: '42000',
                employmentType: 'FullTime'
            }
        },
        {
            business: { email: 'business@test.com', password: 'Test1234!' },
            job: {
                title: 'Bartender',
                description: 'Experienced bartender for our luxury hotel bar in London. Cocktail making skills are essential. We are looking for a professional who thrives in a fast-paced, high-end environment. Evening shifts apply.',
                location: 'London',
                salary: '26000',
                employmentType: 'FullTime'
            }
        }
    ];

    try {
        let currentUser = null;

        for (let i = 0; i < jobs.length; i++) {
            const { business, job } = jobs[i];
            console.log(`\n📝 Posting job ${i + 1}/${jobs.length}: ${job.title}...`);

            // Log in if not already logged in as this user
            if (currentUser !== business.email) {
                console.log(`  Logging in as ${business.email}...`);
                await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
                await page.waitForTimeout(1500);

                await page.fill('input[name="email"]', business.email);
                await page.fill('input[name="password"]', business.password);
                await page.click('button[type="submit"]');

                // Wait for redirection to dashboard or home
                await page.waitForTimeout(3000);

                currentUser = business.email;
                console.log(`  ✅ Logged in`);
            }

            // Navigate to job posting page
            console.log(`  Navigating to create job page...`);
            await page.goto('http://localhost:3000/business/jobs/new', { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(2000);

            // Check if we are on the right page
            if (page.url().includes('/login')) {
                console.log('  ⚠️ Redirected to login. Re-authenticating...');
                await page.fill('input[name="email"]', business.email);
                await page.fill('input[name="password"]', business.password);
                await page.click('button[type="submit"]');
                await page.waitForTimeout(3000);
                await page.goto('http://localhost:3000/business/jobs/new', { waitUntil: 'domcontentloaded' });
                await page.waitForTimeout(2000);
            }

            // Fill in job details using IDs which are more reliable
            console.log(`  Filling in job details...`);
            await page.fill('#title', job.title);
            await page.fill('#location', job.location);
            await page.selectOption('#employmentType', job.employmentType);
            await page.fill('#salary', job.salary);
            await page.fill('#description', job.description);

            // Submit the form
            console.log(`  Submitting job...`);
            // Find the button with text "Create Job"
            await page.click('button:has-text("Create Job")');

            // Wait for success redirection to jobs list
            await page.waitForTimeout(3000);

            console.log(`  ✅ Posted: ${job.title} in ${job.location}`);
        }

        console.log('\n🎉 All jobs posted successfully!');
        console.log(`\n📋 Total jobs posted: ${jobs.length}`);

        await page.waitForTimeout(3000);

    } catch (error) {
        console.error('❌ FAILED:', error.message);
        await page.screenshot({ path: 'error-screenshot.png' });
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
