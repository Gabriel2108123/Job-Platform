
// Native fetch is available in Node.js 18+
const API_URL = 'http://localhost:5000/api/auth';

// Helper delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testAuthFlow(role) {
    const timestamp = Date.now();
    const isCandidate = role === 'Candidate';
    const email = `${role.toLowerCase()}_${timestamp}@test.com`;
    const password = 'Password123!';

    console.log(`\n--- Testing ${role} Auth Flow ---`);

    // 1. REGISTER
    const registerPayload = {
        email,
        password,
        firstName: 'Test',
        lastName: role,
        phoneNumber: '+447000000000',
        Role: isCandidate ? 'Candidate' : 'BusinessOwner',
        agreedToTerms: true,
        agreedToPrivacy: true,
    };

    if (isCandidate) {
        registerPayload.CountryOfResidence = 'United Kingdom';
        registerPayload.PrimaryRole = 'Chef';
        registerPayload.CurrentStatus = 'Available';
        registerPayload.IsOver16 = true;
    } else {
        registerPayload.OrganizationName = `Test Hotel ${timestamp}`;
        registerPayload.AuthorizedToHire = true;
        registerPayload.CountryOfRegistration = 'United Kingdom';
        registerPayload.TradingName = `Hotel ${timestamp}`;
    }

    console.log(`1. Registering ${email}...`);
    try {
        const regRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerPayload)
        });

        if (!regRes.ok) {
            const err = await regRes.text();
            throw new Error(`Registration failed: ${err}`);
        }
        console.log('   Registration SUCCESS');

        // 2. LOGIN
        console.log(`2. Logging in...`);
        const loginPayload = { email, password };

        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload)
        });

        if (!loginRes.ok) {
            const err = await loginRes.text();
            throw new Error(`Login failed: ${err}`);
        }

        const loginData = await loginRes.json();
        console.log('   Login SUCCESS');
        console.log(`   Token received: ${loginData.token ? 'Yes' : 'No'}`);
        console.log(`   User Role: ${loginData.user.role}`);
        console.log(`   Organization ID: ${loginData.user.organizationId || 'N/A'}`);

        if (loginData.user.role !== (isCandidate ? 'Candidate' : 'BusinessOwner')) {
            console.error('   MISMATCH: Role does not match expected value!');
        }

    } catch (error) {
        console.error(`   ERROR: ${error.message}`);
    }
}

(async () => {
    try {
        await testAuthFlow('Candidate');
        await delay(1000);
        await testAuthFlow('Business');
    } catch (e) {
        console.error('Test Suite Failed', e);
    }
})();
