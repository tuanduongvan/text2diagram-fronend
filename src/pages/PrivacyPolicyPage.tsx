import { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    id: 'introduction',
    title: null,
    content: (
      <p>
        Welcome to the{' '}
        <strong>"AI-Powered Software Technical Diagram Generator"</strong>{' '}
        application (the <strong>"App"</strong>). This App is developed by a
        student from the <strong>University of Science and Technology – The University of Danang (DUT)</strong>,
        Faculty of Information Technology, under the guidance of
        <strong> MSc. Nguyen The Xuan Ly</strong>. We are committed to safeguarding
        your privacy and ensuring that your personal information is processed
        securely, ethically, and transparently. This Privacy Policy explains in
        detail how we collect, use, share, and protect your information when you
        interact with our App. By using the App, you agree to the terms outlined in
        this policy.
      </p>
    )
  },
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    content: (
      <>
        <p>
          When you use the App, we may collect the following categories of
          information:
        </p>
        <h3 className="text-xl font-medium mt-4 mb-1">
          a. Personal Information
        </h3>
        <ul className="list-disc ml-6 mb-4">
          <li>
            <strong>Registration Details</strong>: During account creation, we
            collect information such as your full name, email address, username,
            and password. Additional verification details (e.g., email,
            password) may be requested for enhanced security.
          </li>
          <li>
            <strong>Profile Information</strong>: You may voluntarily provide
            additional details, including a profile picture, contact
            information, professional affiliations, or biographical data to
            customize your account.
          </li>
        </ul>
        <h3 className="text-xl font-medium mt-4 mb-1">b. Usage Data</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>
            <strong>Interaction Data</strong>: We collect information about your
            activities within the App, such as the frequency and duration of
            sessions, features accessed (e.g., diagram generation, file
            uploads), and interactions with user interfaces.
          </li>
          <li>
            <strong>Technical Data</strong>: Includes device-specific
            information such as IP address, browser type, operating system
            version, device model, unique device identifiers (e.g., UUID),
            language preferences, and network connection details (e.g., mobile
            carrier, Wi-Fi SSID).
          </li>
          <li>
            <strong>Diagnostic Data</strong>: Crash logs, performance metrics
            (e.g., latency, load times), and error reports to optimize App
            functionality.
          </li>
        </ul>
        <h3 className="text-xl font-medium mt-4 mb-1">c. Input Data</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>
            <strong>Uploaded Documents</strong>: When you upload files (e.g.,
            TXT, PDF, DOCX), we process their contents to generate software
            technical diagrams. Metadata such as file size, format, and upload
            timestamps are also recorded.
          </li>
          <li>
            <strong>Direct Text Input</strong>: Text entered manually into the
            App's interface is processed to create diagrams. We retain
            anonymized snippets for quality assurance and model training unless
            explicitly deleted by the user.
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    content: (
      <ul className="list-disc ml-6 mb-4">
        <li>
          <strong>Service Delivery</strong>: Generate, display, and export
          technical diagrams based on your inputs
        </li>
        <li>
          <strong>Account Management</strong>: Authenticate users, reset
          passwords, and personalize your experience
        </li>
        <li>
          <strong>Customer Support</strong>: Address inquiries and provide
          technical assistance via email or in-app chat
        </li>
        <li>
          <strong>Analytics & Improvement</strong>: Analyze usage patterns to
          enhance performance and AI accuracy
        </li>
        <li>
          <strong>Security & Compliance</strong>: Detect fraudulent activities
          and comply with legal obligations
        </li>
        <li>
          <strong>Research & Development</strong>: Train AI models using
          anonymized, aggregated data
        </li>
      </ul>
    )
  },
  {
    id: 'information-sharing',
    title: '3. Information Sharing',
    content: (
      <ul className="list-disc ml-6 mb-4">
        <li>
          <strong>Service Providers</strong>: Trusted third-party vendors (e.g.,
          AWS, Google Cloud) bound by confidentiality agreements
        </li>
        <li>
          <strong>Legal Requirements</strong>: Disclosure required by law or to
          protect user safety/public interest
        </li>
        <li>
          <strong>Business Transfers</strong>: Data transfer during
          mergers/acquisitions with policy compliance
        </li>
      </ul>
    )
  },
  {
    id: 'data-security',
    title: '4. Data Security',
    content: (
      <ul className="list-disc ml-6 mb-4">
        <li>
          <strong>Encryption</strong>: HTTPS/TLS for transmissions, AES-256 for
          stored data
        </li>
        <li>
          <strong>Access Controls</strong>: Role-based access with MFA for
          administrative accounts
        </li>
        <li>
          <strong>Infrastructure Security</strong>: ISO-certified data centers
          with firewalls and intrusion detection
        </li>
        <li>
          <strong>Audits & Testing</strong>: Regular penetration tests and
          vulnerability assessments
        </li>
      </ul>
    )
  },
  {
    id: 'your-rights',
    title: '5. Your Rights',
    content: (
      <ul className="list-disc ml-6 mb-4">
        <li>
          <strong>Access & Portability</strong>: Request data in
          machine-readable format
        </li>
        <li>
          <strong>Correction</strong>: Update inaccurate information
        </li>
        <li>
          <strong>Deletion</strong>: Remove account/data (excluding legal
          requirements)
        </li>
        <li>
          <strong>Restriction/Objection</strong>: Limit specific data processing
          activities
        </li>
        <li>
          <strong>Withdraw Consent</strong>: Revoke non-essential processing
          permissions
        </li>
      </ul>
    )
  },
  {
    id: 'cookies-tracking',
    title: '6. Cookies and Tracking Technologies',
    content: (
      <ul className="list-disc ml-6 mb-4">
        <li>
          <strong>Session Management</strong>: Maintain login states and
          preferences
        </li>
        <li>
          <strong>Analytics</strong>: Google Analytics with anonymized IPs
        </li>
        <li>
          <strong>Performance</strong>: Server load-balancing and asset caching
        </li>
      </ul>
    )
  },
  {
    id: 'childrens-privacy',
    title: '7. Children’s Privacy',
    content: (
      <p>
        Not intended for users under 13. We do not knowingly collect children's
        data. Contact us immediately if underage data is processed.
      </p>
    )
  },
  {
    id: 'policy-changes',
    title: '8. Policy Changes',
    content: (
      <p>
        Updates communicated via email or in-app notifications. Archived
        versions available upon request. Continued use implies acceptance.
      </p>
    )
  },
  {
    id: 'contact-us',
    title: '9. Contact Us',
    content: (
      <p>
        Data Protection Team
        <br />
        <strong>Email:</strong>{' '}
        <a
          href="mailto:102220302@sv1.dut.udn.vn"
          className="text-blue-600 dark:text-blue-400"
        >
          102220302@sv1.dut.udn.vn
        </a>
        <br />
        <strong>Mailing Address:</strong>
        <br />
        Faculty of Information Technology,
        <br />
        The University of Danang - University of Science and Technology (DUT),
        <br />
        54 Nguyen Luong Bang Street,
        <br />
        Hoa Khanh Ward, Lien Chieu District,
        <br />
        Da Nang City, Vietnam
      </p>
    )
  }
];

export function PrivacyPolicyPage() {
  useEffect(() => {
    if ('scrollBehavior' in document.documentElement.style) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 scroll-smooth">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <Separator className="bg-[#666666] mb-6" />

      <div className="flex flex-col md:flex-row gap-10">
        <article className="flex-1 text-lg space-y-6">
          {sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="pt-8">
              {sec.title && (
                <h2 className="text-2xl font-semibold mb-2">{sec.title}</h2>
              )}
              {sec.content}
            </section>
          ))}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Effective Date: April 2, 2025
          </p>
        </article>

        <aside className="hidden md:block w-80 sticky top-28 self-start p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Table of Contents</h2>
          <Separator className="dark:bg-[#666666]" />
          <nav className="space-y-2 text-base mt-4">
            <ul className="list-none space-y-1">
              {sections
                .filter((sec) => sec.title)
                .map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className="hover:underline leading-[1.3rem] block py-1"
                    >
                      {sec.title}
                    </a>
                  </li>
                ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
