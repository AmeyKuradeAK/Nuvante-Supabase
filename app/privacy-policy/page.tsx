import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 text-left">
        <h1 className="text-3xl font-bold mb-10 mx-auto w-fit">
          PRIVACY POLICY
        </h1>
        <p className="font-semibold text-lg mb-4">
          At Nuvante India, we value your privacy and are committed to
          protecting your personal information. This Privacy Policy explains how
          we collect, use, and safeguard the information you provide while using
          our website or services. By accessing or using our website, you agree
          to the terms of this Privacy Policy.
        </p>

        <h2 className="text-xl font-bold mt-6">Information We Collect</h2>
        <p className="mb-4">
          We may collect the following types of information:
          <br />
          <strong>1. Personal Information:</strong>
          <br />- Name, email address, phone number, and mailing address.
          <br />- Payment details (e.g., credit/debit card information) for
          order processing.
          <br />
          <strong>2. Non-Personal Information:</strong>
          <br />- Browser type, device type, IP address, and other technical
          details about your visit to our website.
          <br />- Information collected through cookies, including browsing
          behavior and preferences.
        </p>

        <h2 className="text-xl font-bold mt-6">How We Use Your Information</h2>
        <p className="mb-4">
          The information we collect is used for the following purposes:
          <br />- Order fulfillment and processing.
          <br />- Customer support and responding to inquiries.
          <br />- Improving our services, website functionality, and user
          experience.
          <br />- Legal compliance to meet obligations as referenced in our
          Terms and Conditions.
        </p>

        <h2 className="text-xl font-bold mt-6">Sharing Your Information</h2>
        <p className="mb-4">
          We do not sell, trade, or rent your personal information to third
          parties. However, we may share your information in the following
          circumstances:
          <br />- <strong>Service Providers:</strong> With third-party partners
          who assist in payment processing, shipping, or analytics under strict
          confidentiality agreements.
          <br />- <strong>Legal Requirements:</strong> If required by law to
          protect our legal rights or prevent fraud.
        </p>

        <h2 className="text-xl font-bold mt-6">Data Security</h2>
        <p className="mb-4">
          We implement industry-standard security measures to protect your
          personal information from unauthorized access, alteration, disclosure,
          or destruction. However, no online system is entirely secure, and we
          cannot guarantee absolute data security.
        </p>

        <h2 className="text-xl font-bold mt-6">Your Rights</h2>
        <p className="mb-4">
          You have the right to:
          <br />- Access, update, or delete your personal information.
          <br />- Opt out of receiving marketing communications by clicking the
          "unsubscribe" link in our emails.
        </p>

        <h2 className="text-xl font-bold mt-6">Use of Cookies</h2>
        <p className="mb-4">
          Our website uses cookies to enhance your browsing experience. Cookies
          allow us to:
          <br />- Track and analyze website traffic.
          <br />- Remember your preferences for future visits.
        </p>

        <h2 className="text-xl font-bold mt-6">Third-Party Links</h2>
        <p className="mb-4">
          Our website may contain links to third-party websites. Nuvante India
          is not responsible for their privacy practices. Please review their
          policies before providing personal information.
        </p>

        <h2 className="text-xl font-bold mt-6">Children's Privacy</h2>
        <p className="mb-4">
          Our website is not designed for children under the age of 13. We do
          not knowingly collect personal information from children.
        </p>

        <h2 className="text-xl font-bold mt-6">
          Changes to This Privacy Policy
        </h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page, and we encourage you to review it periodically.
        </p>

        <h2 className="text-xl font-bold mt-6">Contact Us</h2>
        <p className="mb-4">
          If you have any questions, concerns, or requests regarding this
          Privacy Policy, please contact us:
          <br />
          Email:{" "}
          <a
            href="mailto:nuvanteindia@gmail.com"
            className="text-black underline"
          >
            nuvanteindia@gmail.com
          </a>
          <br />
          Phone: +91 8882587922
        </p>

        <p className="font-semibold">Effective Date: 30th November, 2024</p>
        <p className="font-bold mt-6">
          By using our website, you agree to this Privacy Policy. Thank you for
          trusting Nuvante India!
        </p>
      </div>
      <Footer />
    </>
  );
}
