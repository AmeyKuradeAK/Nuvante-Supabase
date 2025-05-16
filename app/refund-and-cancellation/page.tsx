import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundCancellationPolicy() {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 text-left">
        <h1 className="text-3xl font-bold mb-10 mx-auto w-fit">
          REFUND & CANCELLATION POLICY
        </h1>
        <p className="font-semibold text-lg mb-4">
          At Nuvante India, we strive to ensure customer satisfaction with every
          purchase. However, we understand that there may be instances where you
          need to request a refund or cancel your order. Below are the details:
        </p>

        <h2 className="text-xl font-bold mt-6">Refund Policy</h2>
        <h3 className="text-lg font-bold mt-4">Eligibility for Refunds:</h3>
        <p className="mb-4">
          Refunds are applicable only if the product is defective, damaged, or
          significantly different from the description provided.
          <br />
          Customers must provide a continuous unboxing video clearly showing the
          package being opened and the product's condition upon receipt.
          <br />
          Refund requests must be initiated within [3 days] from the date of
          delivery.
        </p>

        <h3 className="text-lg font-bold mt-4">Non-Refundable Items:</h3>
        <p className="mb-4">
          - Customized or personalized products, including custom-printed
          apparel.
          <br />
          - Clearance or sale items.
          <br />- Products showing signs of wear, washing, or alteration.
        </p>

        <h3 className="text-lg font-bold mt-4">Refund Process:</h3>
        <p className="mb-4">
          Once the returned item is received and inspected, we will notify you
          of the approval or rejection of your refund.
          <br />
          Approved refunds will be processed within [14 business days] and
          credited back to the original payment method.
        </p>

        <h2 className="text-xl font-bold mt-6">Cancellation Policy</h2>
        <h3 className="text-lg font-bold mt-4">
          Order Cancellation by Customer:
        </h3>
        <p className="mb-4">
          Orders can be canceled within [24 hours] of placing the order,
          provided the order has not been shipped.
          <br />
          To cancel an order, contact us immediately at our WhatsApp number
          [8882587922].
          <br />
          If the order has already been shipped, cancellation requests will not
          be entertained, and the product must be returned following the refund
          policy.
        </p>

        <h3 className="text-lg font-bold mt-4">
          Order Cancellation by Nuvante India:
        </h3>
        <p className="mb-4">
          We reserve the right to cancel orders in case of:
          <br />
          - Non-availability of stock.
          <br />
          - Issues with the payment process.
          <br />
          - Incomplete or inaccurate customer details.
          <br />
          In such cases, customers will be notified, and a full refund will be
          issued.
        </p>

        <h2 className="text-xl font-bold mt-6">
          How to Request a Refund or Cancellation
        </h2>
        <p className="mb-4">
          To request a refund or cancellation, please contact us with the
          following details:
          <br />
          - Order ID
          <br />
          - Reason for refund/cancellation
          <br />
          - Proof (e.g., unboxing video or photos of the product)
          <br />
          Contact us via:
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
          We value your trust and strive to resolve all issues promptly and
          fairly. If you have any questions about our Refund & Cancellation
          Policy, feel free to contact us!
        </p>
      </div>
      <Footer />
    </>
  );
}
