import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tender from '@/models/Tender';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Basic validation
        if (!body.packageId || !body.tenderId) {
            return NextResponse.json({ success: false, error: 'Package ID and Tender ID are required' }, { status: 400 });
        }

        const tender = await Tender.create(body);
        return NextResponse.json({ success: true, data: tender }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const tenders = await Tender.find({}).populate('packageId').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: tenders });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
