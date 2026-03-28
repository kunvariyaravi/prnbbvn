import dbConnect from '@/lib/db';
import TenderForm from '@/components/TenderForm';

export default async function NewTenderPage() {
    await dbConnect();
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Tender</h1>
            <TenderForm />
        </div>
    );
}
