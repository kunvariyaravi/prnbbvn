import dbConnect from '@/lib/db';
import Tender from '@/models/Tender';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, IndianRupee, MapPin, Calendar, FileText, CheckCircle } from 'lucide-react';

export default async function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    // Validate ID format if necessary or try-catch
    let tender;
    try {
        console.log(`[TenderDetail] Fetching ID: ${id}`);
        // Ensure connection is established
        await dbConnect();
        tender = await Tender.findById(id);
        console.log(`[TenderDetail] Found: ${tender ? tender._id : 'null'}`);
    } catch (e) {
        console.error(`[TenderDetail] Error fetching ID ${id}:`, e);
        notFound();
    }

    if (!tender) {
        console.log(`[TenderDetail] Tender not found, triggering 404`);
        notFound();
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link href="/tenders" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tenders
            </Link>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Tender Details</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">{tender.tenderId ? `ID: ${tender.tenderId}` : `Serial: ${tender.serialNo}`}</p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tender.status === 'Awarded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {tender.status}
                    </span>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Name of Work</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tender.workName}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Location</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                {tender.location} {tender.taluka ? `(${tender.taluka})` : ''}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Agency Name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tender.agencyName || 'N/A'}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Estimated Amount</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                                {formatCurrency(tender.estimatedAmount)}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Contract Price</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                                {formatCurrency(tender.contractPrice)}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Year</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tender.year}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Created At</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(tender.createdAt).toLocaleDateString()}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
