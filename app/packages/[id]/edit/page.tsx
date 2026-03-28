import dbConnect from '@/lib/db';
import Package from '@/models/Package';
import PackageForm from '@/components/PackageForm';
import { notFound } from 'next/navigation';

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    let pkg;
    try {
        pkg = await Package.findById(id).lean();
    } catch (e) {
        console.error(e);
    }

    if (!pkg) {
        notFound();
    }

    // Convert _id and nestedObjectIds to strings for serialization
    const works = (pkg.works || []).map((w: any) => ({
        ...w,
        workId: w.workId ? w.workId.toString() : w.workId,
        _id: w._id ? w._id.toString() : undefined
    }));

    const serializedPackage = {
        ...pkg,
        _id: (pkg._id as any).toString(),
        approvedWorkId: (pkg.approvedWorkId as any)?.toString(), // Legacy field check
        works: works
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Package</h1>
            <PackageForm initialData={serializedPackage} isEditing={true} />
        </div>
    );
}
