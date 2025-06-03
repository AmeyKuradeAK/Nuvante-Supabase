import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connect from "@/db";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    const url = new URL(req.url);
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    let query = {};
    if (search) {
      query = {
        $or: [
          { productName: { $regex: search, $options: 'i' } },
          { productDescription: { $regex: search, $options: 'i' } },
          { productId: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const products = await Product.find(query)
      .select('_id productName productPrice productImages productDescription')
      .limit(limit)
      .sort({ productName: 1 });

    return NextResponse.json({
      success: true,
      products: products.map(product => ({
        _id: product._id,
        productId: product._id,
        productName: product.productName,
        productPrice: product.productPrice,
        productImage: product.productImages?.[0] || '',
        productDescription: product.productDescription
      }))
    });

  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({
      error: "Failed to fetch products",
      details: error.message
    }, { status: 500 });
  }
} 