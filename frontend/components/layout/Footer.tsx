export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              For Job Seekers
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="/jobs" className="text-gray-600 hover:text-gray-900">
                  Browse Jobs
                </a>
              </li>
              <li>
                <a href="/candidate/profile" className="text-gray-600 hover:text-gray-900">
                  Create Profile
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              For Employers
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="/employer/post-job" className="text-gray-600 hover:text-gray-900">
                  Post a Job
                </a>
              </li>
              <li>
                <a href="/employer/pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="/about" className="text-gray-600 hover:text-gray-900">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-gray-900">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-gray-900">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © {currentYear} UK Hospitality Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
