import LOAForm from '@/components/LOAForm';

export default function NewLOAPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New LOA</h1>
            <LOAForm />
        </div>
    );
}
