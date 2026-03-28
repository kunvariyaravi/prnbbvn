import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tender from '@/models/Tender';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const tender = await Tender.findById(id);

        if (!tender) {
            return NextResponse.json({ success: false, error: 'Tender not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: tender });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        delete body._id; // Prevent updating _id

        const tender = await Tender.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!tender) {
            return NextResponse.json({ success: false, error: 'Tender not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: tender });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const deletedTender = await Tender.findByIdAndDelete(id);

        if (!deletedTender) {
            return NextResponse.json({ success: false, error: 'Tender not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
