import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  const global_user_email = user?.emailAddresses[0].emailAddress;
  if (user) {
    try {
      return new NextResponse(global_user_email);
    } catch (error) {
      console.log(error);
      return new NextResponse("error");
    }
  } else {
    console.log("No user is signed in.");
    return new NextResponse("400");
  }
}
