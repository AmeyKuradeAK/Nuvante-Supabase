import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 text-left">
        <h1 className="text-3xl w-fit mx-auto font-bold mb-10">CONTACT US</h1>
        <p className="font-semibold text-lg mb-4">
          We're here to help! Whether you have a question, need assistance, or
          simply want to share your feedback, the Nuvante India team is always
          ready to listen. Feel free to reach out to us through any of the
          channels below.
        </p>

        <h2 className="text-xl font-bold mt-6">Customer Support</h2>
        <p className="mb-4">
          For general inquiries, order-related questions, or product support,
          please contact our customer support team:
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
          <br />
          WhatsApp: +91 8882587922
          <br />
          Our customer support team is available Monday to Saturday, from 10:00
          AM to 6:00 PM IST.
        </p>

        <h2 className="text-xl font-bold mt-6">Business Inquiries</h2>
        <p className="mb-4">
          Interested in collaborations, bulk orders, or partnerships? We'd love
          to hear from you! Reach out to us at:
          <br />
          Email:{" "}
          <a
            href="mailto:nuvanteindia@gmail.com"
            className="text-black underline"
          >
            nuvanteindia@gmail.com
          </a>
        </p>

        <h2 className="text-xl font-bold mt-6">Head Office</h2>
        <p className="mb-4">
          If you'd like to visit us or send us a letter, here's where you can
          find us:
          <br />
          Nuvante India
          <br />G - 41/2, Molarbband Extn.
          <br />
          Badarpur Border
          <br />
          New Delhi, India - 110001
        </p>

        <h2 className="text-xl font-bold mt-6">Feedback and Suggestions</h2>
        <p className="mb-4">
          We value your opinions and suggestions! Please share your feedback at:
          <br />
          Email:{" "}
          <a
            href="mailto:nuvanteindia@gmail.com"
            className="text-black underline"
          >
            nuvanteindia@gmail.com
          </a>
        </p>

        <h2 className="text-xl font-bold mt-6">Follow Us on Social Media</h2>
        <p className="mb-4">
          Stay connected and keep up with the latest trends, offers, and
          updates:
          <br />
          Instagram:{" "}
          <a
            href="https://instagram.com/nuvante.in"
            className="text-black underline"
          >
            @nuvante.in
          </a>
        </p>

        <p className="font-bold mt-6">Thank You for Choosing Nuvante India!</p>
        <p className="font-semibold mb-4">
          Your satisfaction is our priority, and we're committed to providing
          you with the best service possible. We look forward to hearing from
          you!
        </p>
      </div>
      <Footer />
    </>
  );
}
