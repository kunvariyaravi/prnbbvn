import dbConnect from '@/lib/db';
import LOA from '@/models/LOA';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const loa = await LOA.create(body);
        return NextResponse.json({ success: true, data: loa }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to create LOA' }, { status: 400 });
    }
}

export async function GET() {
    await dbConnect();
    try {
        const loas = await LOA.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: loas });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch LOAs' }, { status: 500 });
    }
}
