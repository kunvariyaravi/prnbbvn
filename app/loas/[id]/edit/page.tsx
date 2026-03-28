import dbConnect from '@/lib/db';
import LOA from '@/models/LOA';
import LOAForm from '@/components/LOAForm';
import { notFound } from 'next/navigation';

export default async function EditLOAPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    let loa;
    try {
        loa = await LOA.findById(id).lean();
    } catch (e) {
        console.error(e);
    }

    if (!loa) {
        notFound();
    }

    // Serialize: convert ObjectIds → string, Dates → ISO string, null → undefined
    const serializedLOA = Object.fromEntries(
        Object.entries({ ...loa }).map(([k, v]) => {
            if (v === null || v === undefined) return [k, ''];
            if (v instanceof Date) return [k, v.toISOString()];
            if (typeof v === 'object' && 'toString' in v) return [k, v.toString()];
            return [k, v];
        })
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit LOA</h1>
            <LOAForm initialData={serializedLOA} isEditing={true} />
        </div>
    );
}
