import React from "react";

export default function Landing({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex w-[86%] flex-col mx-auto">{children}</div>
    </>
  );
}
