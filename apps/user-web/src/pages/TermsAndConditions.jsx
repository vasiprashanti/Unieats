import React from "react";
import Navbar from "../components/Navigation/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

export default function TermsAndConditions() {
  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Container Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 ">
          <h1
            className="text-4xl font-bold text-center mb-8"
            style={{ color: "#ff6600" }}
          >
            Terms and Conditions
          </h1>
          <p>
            Welcome to UniEats WebApp (“UniEats”, “we”, “our”, “us”). These
            Terms of Service (“Terms”) govern your use of the UniEats website,
            platform, and related services. By using UniEats, you agree to these
            Terms. If you do not agree, please do not use our services.
          </p>

          <h2 className="text-xl font-bold text-orange-600 mt-6">
            1. Eligibility
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              You must be at least 18 years old (or the legal age in your
              region) to place orders.
            </li>
            <li>
              If under 18, you may use UniEats only under the supervision of a
              parent or guardian.
            </li>
            <li>You must provide accurate details when creating an account.</li>
          </ul>

          <h2 className="text-xl font-bold text-orange-600 mt-6">
            2. Account & Security
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              You are responsible for maintaining the confidentiality of your
              login details.
            </li>
            <li>Any activity on your account is your responsibility.</li>
            <li>Notify us immediately if you suspect unauthorized access.</li>
          </ul>

          <h2 className="text-xl font-bold text-orange-600 mt-6">
            3. Ordering & Payments
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              By placing an order, you agree to pay the listed price (including
              taxes, delivery charges, and platform fees).
            </li>
            <li>
              Payments must be made through our authorized payment gateways.
            </li>
            <li>
              Once an order is placed, it may not be modified or cancelled
              unless allowed by the restaurant.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-orange-600 mt-6">
            4. Delivery
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Estimated delivery times are shown for convenience but are not
              guaranteed.
            </li>
            <li>
              Delivery may be delayed due to traffic, weather, or other
              conditions.
            </li>
            <li>
              You must be available at the delivery address and contactable at
              the provided phone number.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-orange-600 mt-6">
            5. Refunds & Cancellations
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Refunds are issued only in specific cases (e.g., order not
              delivered, wrong/defective item).
            </li>
            <li>
              Refund timelines depend on payment providers (banks, wallets,
              etc.).
            </li>
            <li>
              UniEats reserves the right to approve or deny refund requests at
              its discretion.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-orange-600 mt-6">
            6. User Conduct
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              You agree not to misuse UniEats services for unlawful purposes.
            </li>
            <li>Create fake accounts or place fraudulent orders.</li>
            <li>
              Post offensive, defamatory, or harmful content in reviews or
              communications.
            </li>
            <li>We may suspend or terminate accounts violating these terms.</li>
          </ul>

          <h2 className="text-xl font-bold text-orange-600 mt-6">
            7. Restaurant & Partner Content
          </h2>
          <p>
            Menus, prices, images, and descriptions are provided by restaurants.
            UniEats is not responsible for inaccuracies. Food safety and quality
            are the responsibility of restaurant partners.
          </p>

          <h2 className="text-xl font-bold text-orange-600 mt-6">
            8. Intellectual Property
          </h2>
          <p>
            UniEats WebApp design, logo, software, and content belong to
            UniEats. You may not copy, modify, or distribute our content without
            permission.
          </p>

          <h2 className="text-xl font-bold text-orange-600 mt-6">
            9. Limitation of Liability
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>UniEats provides services “as is” without guarantees.</li>
            <li>
              We are not liable for delays, food quality, or misuse of our
              platform.
            </li>
            <li>
              To the extent permitted by law, our liability is limited to the
              amount you paid for the order.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-orange-600 mt-6">
            10. Privacy
          </h2>
          <p>
            Your use of UniEats is also governed by our{" "}
            <span className="text-orange-600 underline">
              <Link to="/privacy">Privacy Policy</Link>
            </span>
            Please review it to understand how we handle your data.
          </p>

          <h2 className="text-xl font-bold text-orange-600 mt-6">
            11. Changes to Terms
          </h2>
          <p>
            We may update these Terms occasionally. Updates will be posted on
            this page, and continued use of UniEats means you accept the updated
            Terms.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
