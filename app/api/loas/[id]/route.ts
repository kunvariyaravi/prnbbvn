import dbConnect from '@/lib/db';
import LOA from '@/models/LOA';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const loa = await LOA.findById(id);
        if (!loa) {
            return NextResponse.json({ success: false, error: 'LOA not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: loa });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch LOA' }, { status: 400 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const body = await req.json();
        const loa = await LOA.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!loa) {
            return NextResponse.json({ success: false, error: 'LOA not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: loa });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update LOA' }, { status: 400 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const deletedLOA = await LOA.findByIdAndDelete(id);
        if (!deletedLOA) {
            return NextResponse.json({ success: false, error: 'LOA not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete LOA' }, { status: 400 });
    }
}
