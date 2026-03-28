import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ApprovedWork from '@/models/ApprovedWork';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const work = await ApprovedWork.findById(id);

        if (!work) {
            return NextResponse.json({ success: false, error: 'Work not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: work });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const work = await ApprovedWork.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!work) {
            return NextResponse.json({ success: false, error: 'Work not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: work });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const deletedWork = await ApprovedWork.findByIdAndDelete(id);

        if (!deletedWork) {
            return NextResponse.json({ success: false, error: 'Work not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
