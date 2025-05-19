import productModel from "@/models/Product";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

/**
 * T̶O̶D̶O̶:̶ c̶o̶n̶s̶i̶d̶e̶r̶i̶n̶g̶ u̶s̶i̶n̶g̶ r̶e̶a̶d̶a̶b̶l̶e̶ v̶a̶r̶i̶a̶b̶l̶e̶s̶ f̶o̶r̶ t̶h̶e̶ s̶a̶k̶e̶ o̶f̶ c̶o̶n̶v̶e̶n̶i̶e̶n̶t̶ d̶e̶b̶u̶g̶g̶i̶n̶g̶.
 * T̶O̶D̶O̶:̶ u̶s̶e̶ p̶r̶o̶m̶i̶s̶e̶s̶,̶ f̶o̶r̶ a̶s̶y̶n̶c̶/̶a̶w̶a̶i̶t̶ o̶p̶e̶r̶a̶t̶i̶o̶n̶s̶
 * T̶O̶D̶O̶:̶ t̶r̶y̶ t̶o̶ c̶o̶n̶d̶i̶t̶i̶o̶n̶ u̶s̶i̶n̶g̶ "̶c̶o̶n̶d̶i̶t̶i̶o̶n̶s̶"̶
 */

export async function POST(request: any) {
  // using currentUser from @clerkjs/server to fetch details about the currentUser (if needed)
  const user = await currentUser();
  try {
    // fetching body from the requested url, similar to request.body..... in express.
    const body = await request.json();
    const full_query = body.every;

    const invalid_arguments =
      body.id === null || body.id === undefined || !body.id || body.id === "";

    if (!full_query && invalid_arguments) {
      console.log("identifier was undefined / invalid.");
      return new NextResponse("404");
    }

    const database = await productModel.find({}).then((data) => {
      console.log("data from the server: \n", data);
      return data;
    });

    const specific = await productModel
      .findOne({ _id: body.id })
      .then((data) => {
        console.log("data from the server: \n", data);
        return data;
      });

    return new NextResponse(JSON.stringify(full_query ? database : specific));
  } catch (error: any) {
    console.error("in api/propagation/route.ts: ", error);
    return new NextResponse("404");
  }
}
