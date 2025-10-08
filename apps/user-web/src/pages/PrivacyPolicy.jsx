import React from "react";
import Navbar from "../components/Navigation/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <div
      className="min-h-screen transition-colors duration-300 flex flex-col"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-6 py-24">
        {/* Container around the policy content */}
        <div className="bg-white  rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200">
          <h1
            className="text-4xl font-bold text-center mb-10"
            style={{ color: "#ff8c00" }}
          >
            UniEats Privacy Policy
          </h1>
          <div className="space-y-8 ">
            <p>
              Welcome to <strong>UniEats WebApp</strong> (“we”, “our”, “us”).
              This Privacy Policy explains how we collect, use, share, and
              safeguard your information when you use our website or related
              services. By accessing or using UniEats WebApp, you agree to this
              policy.
            </p>

            {/* Section 1 */}
            <section>
              <h2
                className="text-2xl font-bold mb-2 "
                style={{ color: "#ff8c00" }}
              >
                1. Information We Collect
              </h2>
              <ul className="list-disc ml-6 space-y-1 ">
                <li>
                  <strong>a) Information you provide:</strong> Account details
                  (name, email, phone number, password), order details (food
                  items, delivery address, payment method), and feedback or
                  support messages (reviews, ratings).
                </li>
                <li>
                  <strong>b) Information collected automatically:</strong>{" "}
                  Device & browser info (IP address, browser type, OS), usage
                  data (pages visited, time spent, clicks), and cookies or
                  tracking tools to improve experience.
                </li>
                <li>
                  <strong>c) Information from partners:</strong> Payment
                  gateways, restaurant partners, and analytics or service
                  providers may share data necessary for order fulfillment and
                  performance tracking.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "#ff8c00" }}
              >
                2. How We Use Your Information
              </h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>Process and deliver your orders.</li>
                <li>Show personalized restaurant and dish recommendations.</li>
                <li>Improve website performance and fix issues.</li>
                <li>
                  Send order confirmations, updates, offers, and promotions (you
                  may opt out anytime).
                </li>
                <li>
                  Ensure account security, fraud detection, and legal
                  compliance.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "#ff8c00" }}
              >
                3. Sharing of Information
              </h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>
                  Restaurants & delivery partners (for order fulfillment).
                </li>
                <li>Payment service providers (for transaction processing).</li>
                <li>
                  Analytics & support tools (to enhance webapp functionality).
                </li>
                <li>
                  Legal authorities (if required by law or to protect rights).
                </li>
                <li>
                  Business transfers (in case of merger, acquisition, or sale).
                </li>
              </ul>
              <p className="mt-2">We do not sell your data to advertisers.</p>
            </section>

            {/* Section 4 */}
            <section>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "#ff8c00" }}
              >
                4. Cookies & Tracking
              </h2>
              <p>
                UniEats WebApp uses cookies and similar technologies to keep you
                logged in, remember preferences, analyze site usage, and provide
                relevant recommendations. You can control cookies in your
                browser settings, but some features may not work properly if
                disabled.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "#ff8c00" }}
              >
                5. Data Retention
              </h2>
              <p>
                We retain your data only as long as necessary to provide
                services, maintain your account, comply with legal obligations,
                and resolve disputes. Afterward, your data is securely deleted
                or anonymized.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "#ff8c00" }}
              >
                6. Your Rights
              </h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>Access or update your personal data.</li>
                <li>Request deletion of your account and data.</li>
                <li>Opt out of promotional communications.</li>
                <li>Request a copy (export) of your data.</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, contact us at{" "}
                <a
                  href="mailto:support@unieats.com"
                  className="text-blue-600 hover:underline"
                >
                  support@unieats.com
                </a>
                .
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "#ff8c00" }}
              >
                7. Security
              </h2>
              <p>
                We use encryption, secure servers, and restricted access to
                protect your data. However, no system is completely
                secure—please keep your login credentials safe.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "#ff8c00" }}
              >
                8. Third-Party Links
              </h2>
              <p>
                Our webapp may include links to external websites. We are not
                responsible for their privacy practices—please review their
                respective policies.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "#ff8c00" }}
              >
                9. Updates to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. Changes
                will be posted on this page with the updated date, and
                significant updates may also be notified via email or site
                notification.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
