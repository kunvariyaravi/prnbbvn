import dbConnect from '@/lib/db';
import TechnicalSanction from '@/models/TechnicalSanction';
import TechnicalSanctionForm from '@/components/TechnicalSanctionForm';
import { notFound } from 'next/navigation';

export default async function EditTechnicalSanctionPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    let sanction;
    try {
        sanction = await TechnicalSanction.findById(id).lean();
    } catch (e) {
        console.error(e);
    }

    if (!sanction) {
        notFound();
    }

    // Convert _id to string for serialization
    const serializedSanction = {
        ...sanction,
        _id: (sanction._id as any).toString(),
        // Keep raw dates if they are already strings or handle in component
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Technical Sanction</h1>
            <TechnicalSanctionForm initialData={serializedSanction} isEditing={true} />
        </div>
    );
}
