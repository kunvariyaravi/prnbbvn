import dbConnect from '@/lib/db';
import TechnicalSanction, { ITechnicalSanction } from '@/models/TechnicalSanction';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TechnicalSanctionsListPage() {
    await dbConnect();
    const sanctions = await TechnicalSanction.find({}).sort({ createdAt: -1 });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">TS and DTP</h1>
                    <p className="mt-2 text-sm text-gray-700">List of Technical Sanctions and DTP details.</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <Link href="/technical-sanctions/new" className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" /> Add New T.S.
                    </Link>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Work Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">T.S. Amount (Rupees)</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">T.S. Number</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">T.S. Date</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amt Not Put To Tender</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amt Put To Tender</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Village</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Edit</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {sanctions.length === 0 ? (
                                        <tr><td colSpan={6} className="py-10 text-center text-sm text-gray-500">No technical sanctions found.</td></tr>
                                    ) : (
                                        sanctions.map((ts: ITechnicalSanction) => (
                                            <tr key={ts._id as string}>
                                                <td className="whitespace-normal py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 max-w-xs">{ts.workName}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{ts.tsAmount}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{ts.tsNumber}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{ts.tsDate ? new Date(ts.tsDate).toLocaleDateString('en-GB') : '-'}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{ts.amountNotPutToTender || '-'}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{ts.amountPutToTender || '-'}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{ts.villageName}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    {/* Add Edit Link Later */}
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <Link href={`/technical-sanctions/${ts._id}/edit`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                                                    </td>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
