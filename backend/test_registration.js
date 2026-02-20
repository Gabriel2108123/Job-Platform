// Native fetch is available in Node.js 18+

const API_URL = 'http://localhost:5000/api/auth';

async function registerCandidate() {
    const payload = {
        email: `candidate_${Date.now()}@test.com`,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'Candidate',
        phoneNumber: '+447000000000',
        Role: 'Candidate',

        // Common
        agreedToTerms: true,
        agreedToPrivacy: true,

        // Specific
        CountryOfResidence: 'United Kingdom',
        PrimaryRole: 'Chef',
        CurrentStatus: 'Available',
        IsOver16: true
    };

    console.log('Registering Candidate:', payload.email);
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Candidate Registration SUCCESS:', data.user.email);
            if (data.user.primaryRole !== 'Chef') console.error('PrimaryRole mismatch!');
        } else {
            console.error('Candidate Registration FAILED:', data);
        }
    } catch (error) {
        console.error('Candidate Error:', error.message);
    }
}

async function registerBusiness() {
    const payload = {
        email: `business_${Date.now()}@test.com`,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'Owner',
        phoneNumber: '+447000000001',
        Role: 'BusinessOwner',

        // Common
        agreedToTerms: true,
        agreedToPrivacy: true,

        // Specific
        OrganizationName: `Test Hotel ${Date.now()}`,
        AuthorizedToHire: true,
        CountryOfRegistration: 'United Kingdom',
        TradingName: 'The Test Hotel'
    };

    console.log('Registering Business:', payload.email);
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Business Registration SUCCESS:', data.user.email);
            if (!data.user.organizationId) console.error('OrganizationId missing!');
        } else {
            console.error('Business Registration FAILED:', data);
        }
    } catch (error) {
        console.error('Business Error:', error.message);
    }
}

// Run tests
(async () => {
    // Wait for backend?
    console.log('Starting tests...');
    await registerCandidate();
    await registerBusiness();
})();
