'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ApprovedWorkForm from '@/components/ApprovedWorkForm';

export default function NewApprovedWorkPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <Link href="/approved-works" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
                    </Link>
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Add New Approved Work
                    </h2>
                </div>
            </div>

            <ApprovedWorkForm />
        </div>
    );
}
