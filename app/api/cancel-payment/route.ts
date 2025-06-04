import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import clientModel from '@/models/Clients';
import connect from '@/db';

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await connect();

    // Find the user
    const client = await clientModel.findOne({ email: user.emailAddresses[0]?.emailAddress });
    if (!client) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove the order from user's orders array if it exists
    client.orders = client.orders.filter((order: any) => order.orderId !== orderId);
    await client.save();

    return NextResponse.json({ 
      message: 'Payment cancelled successfully',
      success: true 
    });
  } catch (error: any) {
    console.error('Error cancelling payment:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel payment',
      details: error.message 
    }, { status: 500 });
  }
} 