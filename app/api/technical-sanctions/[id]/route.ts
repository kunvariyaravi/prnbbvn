import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TechnicalSanction from '@/models/TechnicalSanction';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const sanction = await TechnicalSanction.findById(id);

        if (!sanction) {
            return NextResponse.json({ success: false, error: 'Sanction not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: sanction });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        // Prevent modification of _id
        delete body._id;

        const sanction = await TechnicalSanction.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!sanction) {
            return NextResponse.json({ success: false, error: 'Sanction not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: sanction });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const deletedSanction = await TechnicalSanction.findByIdAndDelete(id);

        if (!deletedSanction) {
            return NextResponse.json({ success: false, error: 'Sanction not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
