import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Package from '@/models/Package';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const pkg = await Package.findById(id);

        if (!pkg) {
            return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: pkg });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        delete body._id;

        const pkg = await Package.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!pkg) {
            return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: pkg });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const deletedPkg = await Package.findByIdAndDelete(id);

        if (!deletedPkg) {
            return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
