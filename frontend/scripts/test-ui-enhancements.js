const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🚀 Starting Automated UI Verification...');

    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // 1. Navigate to Landing Page
        console.log('📍 Navigating to landing page...');
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(2000);

        // Capture landing page
        const landingScreenshot = path.join(__dirname, 'landing-page.png');
        await page.screenshot({ path: landingScreenshot });
        console.log(`📸 Landing page screenshot saved to: ${landingScreenshot}`);

        // 2. Scroll down to see hover effects on benefit cards
        console.log('📜 Scrolling to benefits section...');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(1000);

        // 3. Navigate to Jobs Page
        console.log('📍 Navigating to jobs page...');
        await page.goto('http://localhost:3000/jobs');
        await page.waitForTimeout(2000);

        // Capture list view
        const listViewScreenshot = path.join(__dirname, 'jobs-list-view.png');
        await page.screenshot({ path: listViewScreenshot });
        console.log(`📸 List view screenshot saved to: ${listViewScreenshot}`);

        // 4. Click Map View Toggle
        console.log('🗺️ Switching to Map View...');
        await page.click('button:has-text("Map View")');
        await page.waitForTimeout(3000); // Wait for map to load

        // Capture map view
        const mapViewScreenshot = path.join(__dirname, 'jobs-map-view.png');
        await page.screenshot({ path: mapViewScreenshot });
        console.log(`📸 Map view screenshot saved to: ${mapViewScreenshot}`);

        // 5. Interact with a marker (if any jobs exist)
        console.log('📍 Looking for job markers on map...');
        try {
            // Wait for Leaflet markers to appear
            await page.waitForSelector('.leaflet-marker-icon', { timeout: 5000 });

            // Click on the first marker
            await page.click('.leaflet-marker-icon');
            await page.waitForTimeout(1500);

            // Capture popup
            const popupScreenshot = path.join(__dirname, 'map-popup.png');
            await page.screenshot({ path: popupScreenshot });
            console.log(`📸 Map popup screenshot saved to: ${popupScreenshot}`);

            console.log('✅ SUCCESS: Found and clicked job marker!');
        } catch (error) {
            console.log('⚠️ No markers found on map (expected if no jobs have location data)');
        }

        // 6. Switch back to List View
        console.log('📋 Switching back to List View...');
        await page.click('button:has-text("List View")');
        await page.waitForTimeout(1500);

        console.log('✅ SUCCESS: UI verification complete!');

        // Keep browser open for a moment so user can see
        await page.waitForTimeout(3000);

    } catch (error) {
        console.error('❌ TEST FAILED:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
