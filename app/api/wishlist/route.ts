import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

function popElement(array: any[], victim: any) {
  const current = array.filter((element) => {
    return element != victim;
  });
  return current;
}

export async function POST(request: any) {
  const user = await currentUser();
  const global_user_email = user?.emailAddresses[0].emailAddress;
  if (user) {
    try {
      const body = await request.json();
      const existingModel = await clientModel
        .findOne({
          email: global_user_email,
        })
        .then((data) => {
          return data;
        });

      if (body.append) {
        if (!existingModel.wishlist.includes(body.identifier)) {
          existingModel.wishlist.push(body.identifier);
        }
      } else {
        existingModel.wishlist = popElement(
          existingModel.wishlist,
          body.identifier
        );
      }
      await existingModel.save();
      return new NextResponse("200");
    } catch (error) {
      console.log(error);
      return new NextResponse("400");
    }
  } else {
    console.log("No active session is found");
    return new NextResponse("400");
  }
}
