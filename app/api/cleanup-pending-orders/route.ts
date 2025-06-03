import { NextResponse } from "next/server";
import connect from "@/db";
import clientModel from "@/models/Clients";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    
    // Only allow admin users or system calls
    const adminEmails = [
      'admin@nuvante.com',
      // Add other admin emails here
      'ameykurade60@gmail.com',
    ];
    
    const userEmail = user?.emailAddresses[0]?.emailAddress;
    const isAdmin = adminEmails.includes(userEmail || '');
    
    if (!user && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const now = new Date();
    let totalCleaned = 0;
    let usersProcessed = 0;

    // Find all users with orders
    const clients = await clientModel.find({});

    for (const client of clients) {
      let hasExpiredOrders = false;
      
      // Filter out expired pending orders
      const activeOrders = client.orders.filter((order: any) => {
        const isExpired = order.status === 'pending' && 
                         order.expiresAt && 
                         new Date(order.expiresAt) < now;
        
        if (isExpired) {
          hasExpiredOrders = true;
          totalCleaned++;
        }
        
        return !isExpired;
      });

      // Update client if they had expired orders
      if (hasExpiredOrders) {
        client.orders = activeOrders;
        await client.save();
        usersProcessed++;
      }
    }

    return NextResponse.json({
      message: "Cleanup completed successfully",
      totalCleaned,
      usersProcessed,
      success: true
    });

  } catch (error: any) {
    console.error("Error cleaning up pending orders:", error);
    return NextResponse.json(
      { error: "Failed to cleanup pending orders", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const now = new Date();
    let totalExpired = 0;
    let totalPending = 0;

    // Count expired and pending orders across all users
    const clients = await clientModel.find({});

    for (const client of clients) {
      for (const order of client.orders) {
        if (order.status === 'pending') {
          totalPending++;
          
          if (order.expiresAt && new Date(order.expiresAt) < now) {
            totalExpired++;
          }
        }
      }
    }

    return NextResponse.json({
      totalPending,
      totalExpired,
      success: true
    });

  } catch (error: any) {
    console.error("Error getting pending orders stats:", error);
    return NextResponse.json(
      { error: "Failed to get stats", details: error.message },
      { status: 500 }
    );
  }
} 