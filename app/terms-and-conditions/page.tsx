import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 text-left">
        <h1 className="text-3xl font-bold mb-10 mx-auto w-fit">
          TERMS & CONDITIONS
        </h1>

        <h2 className="text-xl font-bold mt-6">
          Effective Date: 30th November 2024
        </h2>
        <p className="mb-4">
          Welcome to Nuvante India, your premier destination for high-quality
          clothing and custom-printed apparel. Before you begin shopping, please
          review our Terms and Conditions to understand your rights and
          responsibilities while using our website.
          <br />
        </p>

        <h2 className="text-xl font-bold mt-6">Contact Information</h2>
        <p className="mb-4">
          If you have any questions, concerns, or require assistance, feel free
          to contact us at: <br></br>Email:{" "}
          <a
            href="mailto:nuvanteindia@gmail.com"
            className="text-black underline"
          >
            nuvanteindia@gmail.com
          </a>
          <br></br> Phone: 8882587922<br></br> Our customer care team is here to
          assist you.
        </p>

        <h2 className="text-xl font-bold mt-6">Effective Date for Policy</h2>
        <p className="mb-4">
          These Terms and Conditions are effective as of 30th November 2024. Any
          future updates or changes to this policy will be communicated clearly
          on our website. By continuing to use our website after any changes,
          you agree to the revised Terms and Conditions.
        </p>

        <h2 className="text-xl font-bold mt-6">Payment Terms and Methods</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            We accept payments through various methods, including credit/debit
            cards, UPI, and digital wallets. Payment details must be accurate to
            ensure successful transactions.
          </li>
          <li>
            Prices displayed on the website include applicable taxes unless
            otherwise stated.
          </li>
          <li>
            Payments are processed securely, and we are not responsible for any
            third-party payment gateway issues.
          </li>
        </ul>
        <h2 className="text-xl font-bold mt-6">Shipping and Delivery</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            Estimated delivery times and shipping costs will be provided at
            checkout. Free shipping may be applicable on orders above a
            specified amount.
          </li>
          <li>
            Delivery timelines may vary due to external factors, such as weather
            or holidays.
          </li>
          <li>Currently, we do not ship to any other countries.</li>
        </ul>
        <h2 className="text-xl font-bold mt-6">
          Return, Refund, and Exchange Policy
        </h2>

        <p className="mb-4">
          At Nuvante India, we prioritize customer satisfaction. However, to
          ensure a smooth return, refund, or exchange process, the following
          conditions must be met:
        </p>

        <strong>1. Product Unboxing Policy:</strong>
        <p className="mb-4">
          For refunds or returns to be considered, customers must provide a
          continuous unboxing video as proof of the product's condition upon
          receipt. The unboxing video must clearly show the package being
          opened, along with the product in its delivered state.
          <br />
          Without this documentation, refunds or returns cannot be initiated.
        </p>
        <strong>2. Eligible Conditions for Returns:</strong>
        <p className="mb-4">
          Products must be unused, unworn, and in their original packaging with
          all tags intact. Items that show signs of washing, use, or alteration
          are not eligible for returns or exchanges.
        </p>
        <strong>3. Exclusions:</strong>

        <p className="mb-4">
          Customized or personalized items cannot be returned or exchanged
          unless they are defective. Clearance or sale items are not eligible
          for returns.
        </p>
        <strong>4. Process:</strong>
        <p className="mb-4">
          All return or exchange requests must be initiated within 3 days of
          delivery. Once approved, the product must be shipped back within 7
          days. Return shipping costs will be borne by the customer unless the
          item is defective or there was an error on our part.
        </p>

        <h2 className="text-xl font-bold mt-6">Customization Policy</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            Customers are responsible for ensuring the accuracy of designs,
            text, or images provided for custom prints.
          </li>
          <li>
            Proofs will be sent for approval before production if applicable.
            Once approved, no changes can be made.
          </li>
          <li>
            Customized items are non-returnable and non-refundable unless
            defective.
          </li>
        </ul>
        <h2 className="text-xl font-bold mt-6">
          Limitation of Liability and Disclaimer of Warranties
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            Nuvante India provides its website and services "as is" and "as
            available." We disclaim all warranties, express or implied,
            including warranties of merchantability and fitness for a particular
            purpose.
          </li>
          <li>
            We are not liable for any direct, indirect, incidental, special, or
            consequential damages arising from the use of our website or
            services.
          </li>
        </ul>
        <h2 className="text-xl font-bold mt-6">Rules of Conduct</h2>
        <p>
          To ensure a positive shopping environment for all users, you agree to:
          <br></br>
          1. Provide accurate information when creating an account or placing an
          order.<br></br> 2. Avoid activities that disrupt or harm the platform.
          <br></br> 3. Respect the intellectual property rights of Nuvante India
          and others.<br></br>
          4. Use the website for lawful purposes only
        </p>
        <h2 className="text-xl font-bold mt-6">User Restrictions</h2>
        <p>
          1. Age Requirement: You must be at least 18 years old or in the
          presence of a Guardian or an Adult to use our services.
          <br />
          2. Account Responsibility: You are responsible for maintaining the
          confidentiality of your account information and for all activities
          conducted under your account.
          <br />
          3. Prohibited Activities: Fraudulent transactions, spamming, and
          unauthorized access attempts are strictly prohibited.
        </p>
        <h2 className="text-xl font-bold mt-6">Privacy Policy</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            We collect, use, and store personal information in accordance with
            our Privacy Policy.
          </li>
          <li>
            Your information will not be shared with third parties without your
            consent, except as required by law.
          </li>
        </ul>
        <h2 className="text-xl font-bold mt-6">Intellectual Property Rights</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            All content, designs, and trademarks on this website are the
            property of Nuvante India.
          </li>
          <li>
            Unauthorized reproduction, sale, or distribution of our intellectual
            property is strictly prohibited.
          </li>
        </ul>
        <h2 className="text-xl font-bold mt-6">Termination of Use</h2>
        <p>
          We reserve the right to suspend or terminate your account for
          violations of these Terms and Conditions or any unlawful activity.
        </p>
        <h2 className="text-xl font-bold mt-6">
          Governing Law and Jurisdiction
        </h2>
        <p>
          These Terms and Conditions are governed by the laws of India. Any
          disputes arising out of or related to the use of this website or our
          services will be subject to the exclusive jurisdiction of the courts
          located in Delhi, India.
        </p>
        <h2 className="text-xl font-bold mt-6">
          Promotions, Discounts, and Coupons
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            Promotional codes or discounts are non-transferable and may be
            subject to additional terms.
          </li>
          <li>Expired or misused codes will not be honored.</li>
        </ul>

        <h2 className="text-xl font-bold mt-6">
          Product Descriptions and Accuracy
        </h2>
        <p>
          We strive to ensure that all product descriptions and images are
          accurate. However, slight variations in color or texture may occur due
          to manufacturing processes or screen displays.
        </p>

        <h2 className="text-xl font-bold mt-6">
          Limitation of Responsibility for External Links
        </h2>
        <p>
          Our website may include links to third-party websites for your
          convenience. Nuvante India is not responsible for the content,
          products, or services of these external websites.
        </p>
        <p className="font-bold mt-4">
          Thank you for choosing Nuvante India. We are dedicated to providing
          high-quality clothing and exceptional service
        </p>
        <p className="font-bold">
          By using our website, you agree to this Privacy Policy. Thank you for
          trusting Nuvante India!
        </p>
      </div>
      <Footer />
    </>
  );
}
