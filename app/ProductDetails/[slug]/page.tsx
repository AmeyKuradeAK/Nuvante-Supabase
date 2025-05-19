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
      <div className="p-4 w-[94%] mx-auto">
        <div className="mt-6 ml-4 flex flex-col gap-6">
          <Bread />
          <Preview />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Page;
