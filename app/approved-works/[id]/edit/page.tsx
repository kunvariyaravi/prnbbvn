import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ApprovedWorkForm from '@/components/ApprovedWorkForm';
import dbConnect from '@/lib/db';
import ApprovedWork from '@/models/ApprovedWork';
import { notFound } from 'next/navigation';

export default async function EditApprovedWorkPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    let work;
    try {
        const workDoc = await ApprovedWork.findById(id);
        if (!workDoc) return notFound();
        work = JSON.parse(JSON.stringify(workDoc)); // Serialize for client component
    } catch (e) {
        return notFound();
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <Link href="/approved-works" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
                    </Link>
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Edit Approved Work
                    </h2>
                </div>
            </div>

            <ApprovedWorkForm initialData={work} isEditing={true} />
        </div>
    );
}
