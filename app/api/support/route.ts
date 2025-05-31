import { NextResponse } from "next/server";
import supportTicketModel from "@/models/SupportTicket";
import mongoose from "mongoose";

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to MongoDB for support tickets");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { email, issueType, subject, details, images = [] } = await request.json();

    // Validate required fields
    if (!email || !issueType || !subject || !details) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Generate unique ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create new support ticket
    const newTicket = new supportTicketModel({
      email,
      issueType,
      subject,
      details,
      images,
      ticketId
    });

    await newTicket.save();

    return NextResponse.json(
      { 
        success: true, 
        message: "Support ticket created successfully",
        ticketId: ticketId
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all support tickets (for admin use)
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const ticketId = url.searchParams.get('ticketId');
    
    let query = {};
    
    if (email) {
      query = { email };
    } else if (ticketId) {
      query = { ticketId };
    }
    
    const tickets = await supportTicketModel.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ tickets }, { status: 200 });

  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 