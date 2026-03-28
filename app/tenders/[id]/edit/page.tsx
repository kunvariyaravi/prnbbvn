import dbConnect from '@/lib/db';
import Tender from '@/models/Tender';
import TenderForm from '@/components/TenderForm';
import { notFound } from 'next/navigation';

export default async function EditTenderPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    let tender;
    try {
        tender = await Tender.findById(id).lean();
    } catch (e) {
        console.error(e);
    }

    if (!tender) {
        notFound();
    }

    // Convert _id and packageId to string for serialization
    const serializedTender = {
        ...tender,
        _id: (tender._id as any).toString(),
        packageId: (tender.packageId as any).toString(),
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Tender</h1>
            <TenderForm initialData={serializedTender} isEditing={true} />
        </div>
    );
}
