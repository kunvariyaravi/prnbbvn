import dbConnect from '@/lib/db';
import Tender from '@/models/Tender';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TendersListPage() {
    await dbConnect();
    const tenders = await Tender.find({}).sort({ createdAt: -1 });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Tenders</h1>
                    <p className="mt-2 text-sm text-gray-700">List of all tenders.</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <Link href="/tenders/new" className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" /> Add New Tender
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
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Tender ID</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Package Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trial No</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contractor Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contract Price</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Proposal Date</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Approval Details</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Date</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Edit</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {tenders.length === 0 ? (
                                        <tr><td colSpan={7} className="py-10 text-center text-sm text-gray-500">No tenders found.</td></tr>
                                    ) : (
                                        tenders.map((tender: any) => (
                                            <tr key={tender._id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{tender.tenderId}</td>
                                                <td className="whitespace-normal px-3 py-4 text-sm text-gray-500 max-w-xs">{tender.packageName}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tender.trialNo}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tender.contractorName || '-'}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">₹{tender.contractPrice}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tender.proposalDate ? new Date(tender.proposalDate).toLocaleDateString('en-GB') : '-'}</td>
                                                <td className="whitespace-normal px-3 py-4 text-sm text-gray-500 max-w-xs">
                                                    {tender.tenderApprovalNo ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900">{tender.tenderApprovalNo}</span>
                                                            <span className="text-xs">{tender.tenderApprovalOffice}</span>
                                                            <span className="text-xs text-gray-400">{tender.tenderApprovalDate ? new Date(tender.tenderApprovalDate).toLocaleDateString('en-GB') : '-'}</span>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tender.lastDateOfSubmission ? new Date(tender.lastDateOfSubmission).toLocaleDateString('en-GB') : '-'}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <Link href={`/tenders/${tender._id}/edit`} className="text-blue-600 hover:text-blue-900">Edit</Link>
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
