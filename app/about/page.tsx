import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 text-left">
        <h1 className="text-3xl font-bold mb-10 w-fit mx-auto">ABOUT US</h1>
        <p className="font-semibold text-lg mb-4">
          Welcome to Nuvante India, where fashion meets individuality and
          quality. Founded with a passion for creativity and craftsmanship,
          Nuvante India is more than just a clothing brand—we are a lifestyle
          that celebrates self-expression, sustainability, and style.
        </p>

        <h2 className="text-xl font-bold mt-6">Our Vision</h2>
        <p className="mb-4">
          At Nuvante India, we envision a world where everyone has the freedom
          to showcase their unique personality through fashion. Our goal is to
          provide premium, thoughtfully designed clothing that empowers
          individuals to express their story while staying aligned with modern
          trends.
        </p>

        <h2 className="text-xl font-bold mt-6">Who We Are</h2>
        <p className="mb-4">
          Based in the heart of Delhi, India, Nuvante India was born out of a
          desire to bring high-quality, stylish, and premium apparel to people
          who value comfort, durability, and personalization.
        </p>

        <h2 className="text-xl font-bold mt-6">What Makes Us Different?</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            <strong>Quality You Can Trust:</strong> We source the finest fabrics
            to ensure comfort and durability.
          </li>
          <li>
            <strong>Sustainability:</strong> We embrace ethical practices to
            reduce environmental impact.
          </li>
          <li>
            <strong>Customer-Centric Approach:</strong> Your satisfaction is at
            the heart of everything we do.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-6">Our Product Range</h2>
        <p className="mb-4">
          Our collection includes a wide variety of high-quality clothing items,
          designed with meticulous attention to detail.
        </p>

        <h2 className="text-xl font-bold mt-6">Our Commitment</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Delivering exceptional products that exceed expectations.</li>
          <li>Embracing sustainable and ethical business practices.</li>
          <li>
            Supporting individuality and creativity in every aspect of our
            designs.
          </li>
          <li>
            Building a community of fashion enthusiasts who appreciate quality
            and originality.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-6">Join Our Journey</h2>
        <p className="mb-4">
          We are excited to be a part of your wardrobe and story. Explore our
          collections and embrace your unique style.
        </p>

        <h2 className="text-xl font-bold mt-6">Stay Connected</h2>
        <p className="mb-4">
          Follow us on social media and share your Nuvante India moments. Let's
          inspire each other to live boldly and fashionably.
        </p>

        <p className="font-bold mt-6">Thank you for choosing Nuvante India.</p>
      </div>
      <Footer />
    </>
  );
}
