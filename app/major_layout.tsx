import React from "react";

export default function MajorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className={`flex md:mt-72 xl:mt-0 lg:mt-0 md:w-[94%] w-[94%] flex-col mx-auto`}>
        {children}
      </div>
    </>
  );
}
