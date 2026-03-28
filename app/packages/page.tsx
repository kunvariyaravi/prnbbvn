import dbConnect from '@/lib/db';
import Package, { IPackage } from '@/models/Package';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PackagesListPage() {
    await dbConnect();
    const packages = await Package.find({}).sort({ createdAt: -1 });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Packages</h1>
                    <p className="mt-2 text-sm text-gray-700">List of all packages containing approved works.</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <Link href="/packages/new" className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" /> Add New Package
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
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Package Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Works Included</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estimated Amount</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Approval Info</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Edit</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {packages.length === 0 ? (
                                        <tr><td colSpan={4} className="py-10 text-center text-sm text-gray-500">No packages found.</td></tr>
                                    ) : (
                                        packages.map((pkg: any) => (
                                            <tr key={pkg._id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{pkg.packageName}</td>
                                                <td className="px-3 py-4 text-sm text-gray-500 max-w-md">
                                                    <ul className="list-disc pl-4">
                                                        {pkg.works && pkg.works.map((w: any, idx: number) => (
                                                            <li key={idx} className="truncate">{w.workName}</li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {/* Calculate total */}
                                                    ₹{pkg.works ? pkg.works.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) : 0}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {pkg.approvalAuthority || '-'} <br />
                                                    <span className="text-xs text-gray-400">{pkg.dtpApprovalDate ? new Date(pkg.dtpApprovalDate).toLocaleDateString('en-GB') : ''}</span>
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <Link href={`/packages/${pkg._id}/edit`} className="text-blue-600 hover:text-blue-900">Edit</Link>
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
