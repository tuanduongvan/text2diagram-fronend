import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';

const termsSections = [
  {
    id: 'introduction',
    title: null,
    content: (
      <p>
        Welcome to the{' '}
        <strong>AI-Powered Software Technical Diagram Generator</strong>{' '}
        application (the <strong>"App"</strong>). The App is developed by
        a student from the <strong>The University of Danang - University of Science and Technology (DUT)</strong>,
        Faculty of Information Technology, under the guidance of
        <strong> MSc. Nguyen The Xuan Ly</strong>. By accessing or using the App,
        you acknowledge that you have read, understood, and agree to be legally bound
        by these Terms and Conditions (the <strong>"Terms"</strong>), along with our
        Privacy Policy. If you do not agree to these Terms, you are expressly
        prohibited from using the App.
      </p>
    )
  },
  {
    id: 'acceptance-of-terms',
    title: '1. Acceptance of Terms',
    content: (
      <>
        <ul className="list-disc ml-6 mb-4">
          <li>
            Confirm that you are at least <strong>18 years of age</strong> or
            have legal parental/guardian consent to use the App
          </li>
          <li>
            Agree to comply with all applicable laws, regulations, and
            third-party agreements in your jurisdiction
          </li>
          <li>
            Acknowledge that continued use of the App after revisions to these
            Terms constitutes acceptance of the updated terms
          </li>
        </ul>
        <p className="mb-4">
          <strong>Note:</strong> Failure to adhere to these Terms may result in
          immediate termination of your access to the App.
        </p>
      </>
    )
  },
  {
    id: 'use-of-app',
    title: '2. Use of the Application',
    content: (
      <>
        <h3 className="text-xl font-medium mt-4 mb-2">Permitted Use</h3>
        <p className="mb-2">
          The App is designed to generate software technical diagrams using AI
          algorithms. You may use it for:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>
            Personal projects, academic research, or non-commercial purposes
          </li>
          <li>
            Professional workflows, provided such use complies with these Terms
          </li>
        </ul>
        <h3 className="text-xl font-medium mt-4 mb-2">Prohibited Activities</h3>
        <p className="mb-2">You expressly agree not to:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>
            Use the App for unlawful purposes including fraud, harassment, or
            infringement of intellectual property rights
          </li>
          <li>
            Upload, transmit, or distribute content that:
            <ul className="list-circle ml-6 mt-2">
              <li>Contains viruses, malware, or harmful code</li>
              <li>
                Is defamatory, obscene, discriminatory, or violates privacy
                rights
              </li>
              <li>
                Infringes patents, trademarks, trade secrets, or copyrights
              </li>
            </ul>
          </li>
          <li>
            Reverse-engineer, decompile, or disassemble the App's source code
          </li>
          <li>
            Exploit vulnerabilities or interfere with the App's security,
            servers, or networks
          </li>
          <li>
            Use bots, scrapers, or automated tools to extract data without prior
            written consent
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'user-accounts',
    title: '3. User Accounts',
    content: (
      <>
        <h3 className="text-xl font-medium mt-4 mb-2">Account Creation</h3>
        <p className="mb-2">
          To access premium features, you must register an account by providing:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>A valid email address</li>
          <li>
            A secure password meeting complexity requirements (e.g., minimum 8
            characters, including symbols)
          </li>
          <li>Accurate and current profile information</li>
        </ul>
        <h3 className="text-xl font-medium mt-4 mb-2">
          Account Responsibilities
        </h3>
        <ul className="list-disc ml-6 mb-4">
          <li>
            You are solely responsible for maintaining the confidentiality of
            your login credentials
          </li>
          <li>
            Notify us immediately at{' '}
            <a
              href="mailto:21120426@student.hcmus.edu.vn"
              className="text-blue-600 dark:text-blue-400"
            >
              21120426@student.hcmus.edu.vn
            </a>{' '}
            of unauthorized account access or breaches
          </li>
          <li>
            Accounts inactive for 12 consecutive months may be deactivated
            without notice
          </li>
        </ul>
        <h3 className="text-xl font-medium mt-4 mb-2">Termination Rights</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>
            We reserve the right to suspend or terminate accounts that:
            <ul className="list-circle ml-6 mt-2">
              <li>Violate these Terms</li>
              <li>Engage in fraudulent or abusive behavior</li>
              <li>Are linked to spam or malicious activity</li>
            </ul>
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'intellectual-property',
    title: '4. Intellectual Property',
    content: (
      <>
        <h3 className="text-xl font-medium mt-4 mb-2">Ownership</h3>
        <p className="mb-2">
          All rights, titles, and interests in the App, including but not
          limited to:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>UI/UX designs, graphics, logos, and branding</li>
          <li>Algorithms, APIs, and documentation</li>
          <li>Generated diagrams (excluding user-provided input data)</li>
        </ul>
        <p className="mb-4">
          are the exclusive property of the development team or its licensors.
        </p>
        <h3 className="text-xl font-medium mt-4 mb-2">User Content</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>
            You retain ownership of content you upload or input into the App
            (e.g., text, documents)
          </li>
          <li>
            By using the App, you grant us a non-exclusive, royalty-free license
            to process your content solely for generating diagrams
          </li>
        </ul>
        <h3 className="text-xl font-medium mt-4 mb-2">Restrictions</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>
            You may not reproduce, modify, or distribute the App's code or
            visual assets without written permission
          </li>
          <li>
            You may not use the App to create competing products or services
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'limitation-of-liability',
    title: '5. Limitation of Liability',
    content: (
      <>
        <p className="mb-4">
          The App is provided <strong>"as is"</strong> and{' '}
          <strong>"as available."</strong> To the fullest extent permitted by
          law:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>
            We disclaim all warranties, including implied warranties of
            merchantability, fitness for a particular purpose, and
            non-infringement
          </li>
          <li>
            We are not liable for:
            <ul className="list-circle ml-6 mt-2">
              <li>
                Indirect, incidental, or consequential damages (e.g., lost
                profits, data loss)
              </li>
              <li>Errors, inaccuracies, or interruptions in service</li>
              <li>Third-party actions or content</li>
            </ul>
          </li>
          <li>
            Total liability for any claim related to the App shall not exceed{' '}
            <strong>$100 USD</strong>
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'modifications-to-terms',
    title: '6. Modifications to Terms',
    content: (
      <>
        <p className="mb-2">We may update these Terms to reflect:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Changes in legal or regulatory requirements</li>
          <li>New features or services</li>
          <li>Security or operational improvements</li>
        </ul>
        <p className="mb-4">
          Updates will be posted on our website, and your continued use of the
          App after <strong>30 days</strong> constitutes acceptance. Material
          changes will be communicated via email.
        </p>
      </>
    )
  },
  {
    id: 'termination',
    title: '7. Termination',
    content: (
      <ul className="list-disc ml-6 mb-4">
        <li>
          We reserve the right to:
          <ul className="list-circle ml-6 mt-2">
            <li>
              Terminate or restrict access to the App without prior notice
            </li>
            <li>Remove or disable content violating these Terms</li>
          </ul>
        </li>
        <li>
          Upon termination:
          <ul className="list-circle ml-6 mt-2">
            <li>Your license to use the App is revoked</li>
            <li>All data associated with your account may be deleted</li>
          </ul>
        </li>
      </ul>
    )
  },
  {
    id: 'governing-law',
    title: '8. Governing Law & Dispute Resolution',
    content: (
      <>
        <p className="mb-4">
          These Terms are governed by the laws of Vietnam. Any disputes arising
          from these Terms shall be resolved through:
        </p>
        <ol className="list-decimal ml-6 mb-4">
          <li>
            <strong>Negotiation:</strong> Parties agree to negotiate in good
            faith for 30 days
          </li>
          <li>
            <strong>Mediation:</strong> If unresolved, disputes will be mediated
            in Ho Chi Minh City
          </li>
          <li>
            <strong>Litigation:</strong> Claims may be brought before the
            competent courts of Ho Chi Minh City
          </li>
        </ol>
      </>
    )
  },
  {
    id: 'contact-information',
    title: '9. Contact Information',
    content: (
      <div className="ml-6 mb-4 space-y-2">
        <p>
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
      </div>
    )
  }
];

export function TermsAndConditionsPage() {
  useEffect(() => {
    if ('scrollBehavior' in document.documentElement.style) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }, []);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
      <Separator className="bg-[#666666] mb-6" />

      <div className="flex flex-col lg:flex-row gap-10">
        <article className="flex-1 text-lg space-y-6">
          {termsSections.map((sec) => (
            <section key={sec.id} id={sec.id}>
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
              {termsSections
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
