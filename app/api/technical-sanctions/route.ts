import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TechnicalSanction from '@/models/TechnicalSanction';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const sanction = await TechnicalSanction.create(body);

        return NextResponse.json({ success: true, data: sanction }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const sanctions = await TechnicalSanction.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: sanctions });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
