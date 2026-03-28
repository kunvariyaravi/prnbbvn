import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ApprovedWork from '@/models/ApprovedWork';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Basic validation could go here
        const work = await ApprovedWork.create(body);

        return NextResponse.json({ success: true, data: work }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const works = await ApprovedWork.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: works });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
