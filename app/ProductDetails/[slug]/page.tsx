import React from "react";
import Bread from "./specificComponents/Bread";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Preview from "./specificComponents/Preview";
import Suggestion from "./specificComponents/Suggestion";
import Heading from "@/components/Heading";
import Pre from "./specificComponents/Pre";

const Page = () => {
  return (
    <>
      <Navbar />
      <div className="py-4 md:w-[94%] w-full mx-auto">
        <div className="mt-6 md:ml-4 flex flex-col gap-6">
          <div className="ml-4">
            <Bread />
          </div>
          <Preview />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Page;
