import React from "react";

export default function MajorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className={`flex md:w-[94%] w-[94%] flex-col mx-auto`}>
        {children}
      </div>
    </>
  );
}
