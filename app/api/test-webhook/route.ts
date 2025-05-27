import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const data = JSON.parse(body);
    
    // Return exactly what Clerk sent
    return NextResponse.json({
      received: true,
      eventType: data.type,
      userData: {
        id: data.data?.id,
        email_addresses: data.data?.email_addresses,
        first_name: data.data?.first_name,
        last_name: data.data?.last_name,
        phone_numbers: data.data?.phone_numbers,
        public_metadata: data.data?.public_metadata,
        unsafe_metadata: data.data?.unsafe_metadata,
        created_at: data.data?.created_at,
        updated_at: data.data?.updated_at
      },
      fullPayload: data
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to parse webhook",
      details: error.message 
    }, { status: 500 });
  }
} 