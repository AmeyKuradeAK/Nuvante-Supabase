import { NextRequest, NextResponse } from "next/server";
import clientModel from "@/models/Clients";
import connect from "@/db";

export async function POST(req: NextRequest) {
  try {
    await connect();

    // Find all clients with orders
    const clients = await clientModel.find({ 
      orders: { $exists: true, $not: { $size: 0 } } 
    });

    let totalDuplicatesRemoved = 0;
    let clientsProcessed = 0;
    const duplicateReport = [];

    for (const client of clients) {
      if (!client.orders || !Array.isArray(client.orders)) continue;

      const originalOrderCount = client.orders.length;
      const seenOrderIds = new Set();
      const seenPaymentIds = new Set();
      const uniqueOrders = [];
      const duplicatesFound = [];

      // Sort orders by timestamp to keep the earliest one
      const sortedOrders = client.orders.sort((a: any, b: any) => 
        new Date(a.timestamp || a.createdAt || 0).getTime() - 
        new Date(b.timestamp || b.createdAt || 0).getTime()
      );

      for (const order of sortedOrders) {
        const orderId = order.orderId;
        const paymentId = order.paymentId;

        // Check for duplicate orderId or paymentId
        if (seenOrderIds.has(orderId) || seenPaymentIds.has(paymentId)) {
          duplicatesFound.push({
            orderId,
            paymentId,
            timestamp: order.timestamp || order.createdAt,
            amount: order.amount
          });
        } else {
          // First occurrence - keep this order
          seenOrderIds.add(orderId);
          seenPaymentIds.add(paymentId);
          uniqueOrders.push(order);
        }
      }

      // If duplicates were found, update the client
      if (duplicatesFound.length > 0) {
        client.orders = uniqueOrders;
        await client.save();

        totalDuplicatesRemoved += duplicatesFound.length;
        duplicateReport.push({
          userEmail: client.email,
          originalOrderCount,
          finalOrderCount: uniqueOrders.length,
          duplicatesRemoved: duplicatesFound.length,
          duplicates: duplicatesFound
        });
      }

      clientsProcessed++;
    }

    return NextResponse.json({
      message: "Duplicate cleanup completed",
      summary: {
        clientsProcessed,
        totalDuplicatesRemoved,
        clientsWithDuplicates: duplicateReport.length
      },
      duplicateReport
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to cleanup duplicates",
      details: error.message 
    }, { status: 500 });
  }
}

// GET - Check for duplicates without removing them
export async function GET(req: NextRequest) {
  try {
    await connect();

    const clients = await clientModel.find({ 
      orders: { $exists: true, $not: { $size: 0 } } 
    });

    let totalDuplicates = 0;
    const duplicateReport = [];

    for (const client of clients) {
      if (!client.orders || !Array.isArray(client.orders)) continue;

      const seenOrderIds = new Set();
      const seenPaymentIds = new Set();
      const duplicatesFound = [];

      for (const order of client.orders) {
        const orderId = order.orderId;
        const paymentId = order.paymentId;

        if (seenOrderIds.has(orderId) || seenPaymentIds.has(paymentId)) {
          duplicatesFound.push({
            orderId,
            paymentId,
            timestamp: order.timestamp || order.createdAt,
            amount: order.amount
          });
        } else {
          seenOrderIds.add(orderId);
          seenPaymentIds.add(paymentId);
        }
      }

      if (duplicatesFound.length > 0) {
        totalDuplicates += duplicatesFound.length;
        duplicateReport.push({
          userEmail: client.email,
          totalOrders: client.orders.length,
          duplicatesFound: duplicatesFound.length,
          duplicates: duplicatesFound
        });
      }
    }

    return NextResponse.json({
      message: "Duplicate scan completed",
      summary: {
        totalDuplicates,
        usersWithDuplicates: duplicateReport.length
      },
      duplicateReport
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to check duplicates",
      details: error.message 
    }, { status: 500 });
  }
} 