import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function POST(request: Request) {
  const user = await currentUser();
  const global_user_email = user?.emailAddresses[0]?.emailAddress;

  if (!user || !global_user_email) {
    return NextResponse.json(
      { message: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // request might be empty (first-time signup)
      body = {};
    }

    const email = global_user_email;
    const firstName = user.firstName || "New";
    const lastName = user.lastName || "User";

    let hashedPassword: string | undefined = undefined;
    if (body.password && body.password !== "existing") {
      hashedPassword = await bcrypt.hash(body.password, SALT_ROUNDS);
    }

    const upsertData: any = {
      email,
      username: firstName,
      firstName,
      lastName,
      cart: [],
      wishlist: [],
    };

    if (body.address) upsertData.address = body.address;
    if (hashedPassword) upsertData.password = hashedPassword;

    const { error: upsertError } = await supabase
      .from("clients")
      .upsert(upsertData, { onConflict: "email" });

    if (upsertError) {
      console.error("Supabase upsert error:", upsertError);
      throw upsertError;
    }

    return NextResponse.json({ message: "User synced to Supabase ✅" }, { status: 200 });
  } catch (error: any) {
    console.error("Error in populate route:", error);
    return NextResponse.json(
      { message: "Failed to populate", error: error.message || error },
      { status: 500 }
    );
  }
}
