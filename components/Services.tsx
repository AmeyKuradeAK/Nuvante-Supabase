import React from "react";
import Image from "next/image";

const services = [
  {
    // TODO: Corrected: Add leading slash for public directory
    img: "/services_.png",
    title: "FREE AND FAST DELIVERY",
    description: "Free delivery for all orders over Rs.999",
  },
  {
    img: "/services__.png",
    title: "24/7 CUSTOMER SERVICE",
    description: "Friendly 24/7 customer support",
  },
  {
    img: "/services___.png",
    title: "MONEY BACK GUARANTEE",
    description: "We return money within 30 days",
  },
];

export default function Services() {
  return (
    <div className="services-section mt-36">
      <div className="container mx-auto flex flex-auto flex-wrap md:flex-nowrap justify-between items-center flex-row gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="service-card flex flex-col items-center text-center gap-4 w-full md:w-[30%] px-4"
          >
            <div className="icon-wrapper w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
              <Image
                src={service.img}
                width={40}
                height={40}
                alt={service.title}
              />
            </div>
            <h3 className="text-black font-semibold text-lg">
              {service.title}
            </h3>
            <p className="text-gray-600 text-sm">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
