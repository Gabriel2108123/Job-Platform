const { chromium } = require('playwright');

(async () => {
    console.log('🚀 Starting Automated Job Posting & Publishing...');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 800
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(60000);

    const jobs = [
        {
            business: { email: 'owner.riverside@test.com', password: 'Test1234!' },
            job: {
                title: 'Executive Chef',
                description: 'We are looking for an Executive Chef to lead our riverside culinary team. You will be responsible for menu design, staff management, and ensuring the highest standards of food quality and presentation. At least 10 years of experience in fine dining is required.',
                location: 'Manchester',
                salary: '65000',
                employmentType: 'FullTime'
            }
        },
        {
            business: { email: 'owner.seaside@test.com', password: 'Test1234!' },
            job: {
                title: 'Spa Manager',
                description: 'Join our seaside hotel as a Spa Manager. Manage a team of therapists, oversee facilities, and ensure a world-class relaxation experience for our guests. Previous management experience in a luxury spa or wellness center is essential.',
                location: 'Brighton',
                salary: '45000',
                employmentType: 'FullTime'
            }
        }
    ];

    try {
        let currentUser = null;

        for (let i = 0; i < jobs.length; i++) {
            const { business, job } = jobs[i];
            console.log(`\n📝 Posting and Publishing job ${i + 1}/${jobs.length}: ${job.title}...`);

            // Log in if not already logged in as this user
            if (currentUser !== business.email) {
                console.log(`  Logging in as ${business.email}...`);
                await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
                await page.waitForTimeout(1500);

                await page.fill('input[name="email"]', business.email);
                await page.fill('input[name="password"]', business.password);
                await page.click('button[type="submit"]');
                await page.waitForTimeout(3000);

                currentUser = business.email;
                console.log(`  ✅ Logged in`);
            }

            // 1. Create the job
            console.log(`  Navigating to create job page...`);
            await page.goto('http://localhost:3000/business/jobs/new', { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(2000);

            console.log(`  Filling in job details...`);
            await page.fill('#title', job.title);
            await page.fill('#location', job.location);
            await page.selectOption('#employmentType', job.employmentType);
            await page.fill('#salary', job.salary);
            await page.fill('#description', job.description);

            console.log(`  Submitting job (as draft)...`);
            await page.click('button:has-text("Create Job")');
            await page.waitForTimeout(3000);

            // 2. Publish the job
            console.log(`  Publishing the job...`);

            // Define dialog handler BEFORE clicking
            page.once('dialog', dialog => dialog.accept());

            // We are now on /business/jobs. Find the "Publish" button for the job we just created (should be the first one)
            // Since it's a new job, it will likely be at the top.
            const publishButton = await page.locator('button:has-text("Publish")').first();
            await publishButton.click();

            await page.waitForTimeout(3000);

            console.log(`  ✅ Published: ${job.title}! It is now visible to everyone.`);
        }

        console.log('\n🎉 Automation complete! All jobs are now live on the platform.');

        await page.waitForTimeout(3000);

    } catch (error) {
        console.error('❌ FAILED:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
