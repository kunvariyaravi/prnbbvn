'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface PackageFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function PackageForm({ initialData = {}, isEditing = false }: PackageFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Basic info
    const [packageName, setPackageName] = useState(initialData.packageName || '');

    // Selected works list
    const [selectedWorks, setSelectedWorks] = useState<{ workId: string, workName: string, amount: number }[]>(initialData.works || []);

    // Available works from DB (Technical Sanctions)
    const [availableWorks, setAvailableWorks] = useState<{ _id: string, workName: string, amountPutToTender: number }[]>([]);

    // Temporary selection state for the dropdown
    const [currentSelectionId, setCurrentSelectionId] = useState('');

    // DTP Details State
    const [dtpDetails, setDtpDetails] = useState({
        dtpAmount: initialData.dtpAmount || '',
        dtpSubmissionDate: initialData.dtpSubmissionDate || '',
        dtpApprovalLetterNo: initialData.dtpApprovalLetterNo || '',
        dtpApprovalDate: initialData.dtpApprovalDate || '',
        approvalAuthority: initialData.approvalAuthority || ''
    });

    // Date formatting for edit mode
    useEffect(() => {
        if (initialData.dtpSubmissionDate || initialData.dtpApprovalDate) {
            const formatDate = (dateString: string) => {
                if (!dateString) return '';
                const dateObj = new Date(dateString);
                if (isNaN(dateObj.getTime())) return '';
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const year = dateObj.getFullYear();
                return `${day}/${month}/${year}`;
            };

            setDtpDetails(prev => ({
                ...prev,
                dtpSubmissionDate: formatDate(initialData.dtpSubmissionDate),
                dtpApprovalDate: formatDate(initialData.dtpApprovalDate)
            }));
        }
    }, [initialData]);

    const handleDtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDtpDetails(prev => ({ ...prev, [name]: value }));
    };

    // Auto-calculate DTP Amount based on sum of works' amount Put To Tender
    useEffect(() => {
        const totalAmount = selectedWorks.reduce((sum, work) => sum + (Number(work.amount) || 0), 0);
        setDtpDetails(prev => ({
            ...prev,
            dtpAmount: totalAmount > 0 ? String(totalAmount) : ''
        }));
    }, [selectedWorks]);

    useEffect(() => {
        const fetchAvailableWorks = async () => {
            try {
                const res = await fetch('/api/technical-sanctions');
                const data = await res.json();
                if (data.success) {
                    setAvailableWorks(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch available works", error);
            }
        };
        fetchAvailableWorks();
    }, []);

    const handleAddWork = () => {
        if (!currentSelectionId) return;

        const workToAdd = availableWorks.find(w => w._id === currentSelectionId);
        if (workToAdd) {
            // Check if already added
            if (selectedWorks.some(sw => sw.workId === workToAdd._id)) {
                alert("Work already added to this package.");
                return;
            }

            setSelectedWorks(prev => [...prev, {
                workId: workToAdd._id,
                workName: workToAdd.workName,
                amount: workToAdd.amountPutToTender || 0
            }]);
            setCurrentSelectionId(''); // Reset selection
        }
    };

    const handleRemoveWork = (id: string) => {
        setSelectedWorks(prev => prev.filter(w => w.workId !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedWorks.length === 0) {
            alert("Please add at least one work to the package.");
            return;
        }

        setLoading(true);

        try {
            const submissionData = {
                packageName,
                works: selectedWorks,
                ...dtpDetails
            };

            // Date Parsing Logic for DTP Dates
            const parseDate = (dateStr: string) => {
                if (!dateStr) return undefined;
                const cleanDate = String(dateStr).trim();
                const parts = cleanDate.split(/[\/\-\.]/);
                if (parts.length === 3) {
                    let year = parts[2];
                    if (year.length === 2) year = '20' + year;
                    const isoDate = `${year}-${parts[1]}-${parts[0]}`;
                    const dateObj = new Date(isoDate);
                    return !isNaN(dateObj.getTime()) ? dateObj.toISOString() : undefined;
                }
                return undefined; // Or throw error/alert
            };

            if (submissionData.dtpSubmissionDate) submissionData.dtpSubmissionDate = parseDate(submissionData.dtpSubmissionDate) as any;
            if (submissionData.dtpApprovalDate) submissionData.dtpApprovalDate = parseDate(submissionData.dtpApprovalDate) as any;

            const url = isEditing ? `/api/packages/${initialData._id}` : '/api/packages';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            if (!res.ok) {
                throw new Error('Failed to save package');
            }

            router.push('/packages');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error saving package');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 bg-white p-8 shadow rounded-lg">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                <div className="sm:col-span-6">
                    <label htmlFor="packageName" className="block text-sm font-medium text-gray-700"> Package Name * </label>
                    <input
                        type="text"
                        id="packageName"
                        required
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                </div>

                <div className="sm:col-span-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Approved Works in Package</h3>

                    {/* Selection Area */}
                    <div className="flex gap-4 mb-4">
                        <select
                            value={currentSelectionId}
                            onChange={(e) => setCurrentSelectionId(e.target.value)}
                            className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                        >
                            <option value="">Select a Work to Add...</option>
                            {availableWorks.map(work => (
                                <option key={work._id} value={work._id}>{work.workName} (Est: ₹{work.amountPutToTender})</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleAddWork}
                            disabled={!currentSelectionId}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                        </button>
                    </div>

                    {/* Works List */}
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        {selectedWorks.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No works added yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {selectedWorks.map((work, index) => (
                                    <li key={work.workId} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{work.workName}</p>
                                            <p className="text-xs text-gray-500">Amount: ₹{work.amount}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveWork(work.workId)}
                                            className="text-red-600 hover:text-red-900 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* DTP Details */}
                <div className="sm:col-span-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">DTP Details</h3>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="dtpAmount" className="block text-sm font-medium text-gray-700">DTP Amount (Rupees) - Auto Calculated</label>
                            <input type="number" step="1" name="dtpAmount" id="dtpAmount" value={dtpDetails.dtpAmount || ''} readOnly className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border bg-gray-50" />
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="dtpSubmissionDate" className="block text-sm font-medium text-gray-700">DTP Submission Date (DD/MM/YYYY)</label>
                            <input type="text" placeholder="20/01/2025" name="dtpSubmissionDate" id="dtpSubmissionDate" value={dtpDetails.dtpSubmissionDate || ''} onChange={handleDtpChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="approvalAuthority" className="block text-sm font-medium text-gray-700">Approval Authority</label>
                            <input type="text" name="approvalAuthority" id="approvalAuthority" value={dtpDetails.approvalAuthority || ''} onChange={handleDtpChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="dtpApprovalLetterNo" className="block text-sm font-medium text-gray-700">DTP Approval Letter No</label>
                            <input type="text" name="dtpApprovalLetterNo" id="dtpApprovalLetterNo" value={dtpDetails.dtpApprovalLetterNo || ''} onChange={handleDtpChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                        </div>
                        <div className="sm:col-span-3">
                            <label htmlFor="dtpApprovalDate" className="block text-sm font-medium text-gray-700">DTP Approval Date (DD/MM/YYYY)</label>
                            <input type="text" placeholder="20/01/2025" name="dtpApprovalDate" id="dtpApprovalDate" value={dtpDetails.dtpApprovalDate || ''} onChange={handleDtpChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                        </div>
                    </div>
                </div>

            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <Link href="/packages" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</Link>
                    <button type="submit" disabled={loading} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                        <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Package'}
                    </button>
                </div>
            </div>
        </form >
    );
}
