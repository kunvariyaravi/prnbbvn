'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import Link from 'next/link';

interface TenderFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function TenderForm({ initialData = {}, isEditing = false }: TenderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [packages, setPackages] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        packageId: '',
        packageName: '',
        tenderId: '',
        trialNo: 1,
        tenderCreationDate: '',
        lastDateOfSubmission: '',
        tenderOpeningDate: '',
        tenderValidityDate: '',
        reInvite: false,
        contractorName: '',
        contractPrice: '',
        aboveBelowPercentage: '',
        aboveBelowInWord: 'Above',
        proposalDate: '',
        tenderApprovalOffice: '',
        tenderApprovalNo: '',
        tenderApprovalDate: '',
        ...initialData
    });

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await fetch('/api/packages');
                const data = await res.json();
                if (data.success) {
                    setPackages(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch packages", error);
            }
        };
        fetchPackages();
    }, []);

    // Helper to format dates for input fields (DD/MM/YYYY)
    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
            const dateObj = new Date(dateString);
            if (isNaN(dateObj.getTime())) return '';
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return '';
        }
    };

    // Initialize dates if editing (converting string/date to YYYY-MM-DD)
    useEffect(() => {
        if (isEditing) {
            setFormData(prev => ({
                ...prev,
                tenderCreationDate: formatDateForInput(initialData.tenderCreationDate),
                lastDateOfSubmission: formatDateForInput(initialData.lastDateOfSubmission),
                tenderOpeningDate: formatDateForInput(initialData.tenderOpeningDate),
                proposalDate: formatDateForInput(initialData.proposalDate),
                tenderApprovalDate: formatDateForInput(initialData.tenderApprovalDate),
                tenderValidityDate: formatDateForInput(initialData.tenderValidityDate)
            }));
        }
    }, [initialData, isEditing]);

    // Auto calculate tenderValidityDate: Last Date of Submission + 120 Days
    useEffect(() => {
        if (!formData.lastDateOfSubmission) return;
        try {
            const cleanDate = String(formData.lastDateOfSubmission).trim();
            const parts = cleanDate.split(/[\/\-\.]/);
            if (parts.length === 3) {
                let year = parts[2];
                if (year.length === 2) year = '20' + year;
                const isoDate = `${year}-${parts[1]}-${parts[0]}`;
                const dateObj = new Date(isoDate);

                if (!isNaN(dateObj.getTime())) {
                    dateObj.setDate(dateObj.getDate() + 120);

                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const yyyy = dateObj.getFullYear();

                    setFormData(prev => ({ ...prev, tenderValidityDate: `${day}/${month}/${yyyy}` }));
                }
            }
        } catch (e) {
            // ignore
        }
    }, [formData.lastDateOfSubmission]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Auto-update Package Name if Package ID changes
        if (name === 'packageId') {
            const selectedPkg = packages.find(p => p._id === value);
            if (selectedPkg) {
                setFormData(prev => ({
                    ...prev,
                    packageId: value,
                    packageName: selectedPkg.packageName,
                    // Optionally auto-fill estimated amount if desired, but user might want to override
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submissionData = { ...formData };

            // Date Parsing Logic for Tender Dates (DD/MM/YYYY -> ISO)
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
                return undefined;
            };

            if (submissionData.tenderCreationDate) submissionData.tenderCreationDate = parseDate(submissionData.tenderCreationDate) as any;
            if (submissionData.lastDateOfSubmission) submissionData.lastDateOfSubmission = parseDate(submissionData.lastDateOfSubmission) as any;
            if (submissionData.tenderOpeningDate) submissionData.tenderOpeningDate = parseDate(submissionData.tenderOpeningDate) as any;
            if (submissionData.tenderValidityDate) submissionData.tenderValidityDate = parseDate(submissionData.tenderValidityDate) as any;
            if (submissionData.proposalDate) submissionData.proposalDate = parseDate(submissionData.proposalDate) as any;
            if (submissionData.tenderApprovalDate) submissionData.tenderApprovalDate = parseDate(submissionData.tenderApprovalDate) as any;

            const url = isEditing ? `/api/tenders/${initialData._id}` : '/api/tenders';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            if (!res.ok) throw new Error('Failed to save tender');

            router.push('/tenders');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error saving tender');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 bg-white p-8 shadow rounded-lg">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                <div className="sm:col-span-6">
                    <label htmlFor="packageId" className="block text-sm font-medium text-gray-700">Select Package *</label>
                    <select
                        id="packageId"
                        name="packageId"
                        required
                        value={formData.packageId}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    >
                        <option value="">-- Select Package --</option>
                        {packages.map(pkg => (
                            <option key={pkg._id} value={pkg._id}>{pkg.packageName}</option>
                        ))}
                    </select>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="tenderId" className="block text-sm font-medium text-gray-700">Tender ID *</label>
                    <input type="text" name="tenderId" id="tenderId" required value={formData.tenderId} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="trialNo" className="block text-sm font-medium text-gray-700">Trial No.</label>
                    <input type="number" name="trialNo" id="trialNo" value={formData.trialNo} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="tenderCreationDate" className="block text-sm font-medium text-gray-700">Creation Date (DD/MM/YYYY)</label>
                    <input type="text" placeholder="20/01/2025" name="tenderCreationDate" id="tenderCreationDate" value={formData.tenderCreationDate} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="lastDateOfSubmission" className="block text-sm font-medium text-gray-700">Last Submission Date (DD/MM/YYYY)</label>
                    <input type="text" placeholder="20/01/2025" name="lastDateOfSubmission" id="lastDateOfSubmission" value={formData.lastDateOfSubmission} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="tenderOpeningDate" className="block text-sm font-medium text-gray-700">Opening Date (DD/MM/YYYY)</label>
                    <input type="text" placeholder="20/01/2025" name="tenderOpeningDate" id="tenderOpeningDate" value={formData.tenderOpeningDate} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="tenderValidityDate" className="block text-sm font-medium text-gray-700">Tender Validity Date</label>
                    <input type="text" name="tenderValidityDate" id="tenderValidityDate" value={formData.tenderValidityDate || ''} readOnly className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border bg-gray-50" />
                </div>


                <div className="sm:col-span-6 flex items-center">
                    <input
                        id="reInvite"
                        name="reInvite"
                        type="checkbox"
                        checked={formData.reInvite}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="reInvite" className="ml-2 block text-sm text-gray-900">
                        Re-Invite?
                    </label>
                </div>

                <div className="sm:col-span-6 border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Details</h3>
                </div>

                <div className="sm:col-span-full">
                    <label htmlFor="contractorName" className="block text-sm font-medium text-gray-700">Contractor Name</label>
                    <input type="text" name="contractorName" id="contractorName" value={formData.contractorName} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="contractPrice" className="block text-sm font-medium text-gray-700">Contract Price</label>
                    <input type="number" name="contractPrice" id="contractPrice" value={formData.contractPrice} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="aboveBelowPercentage" className="block text-sm font-medium text-gray-700">Above/Below (%)</label>
                    <input type="number" step="0.01" name="aboveBelowPercentage" id="aboveBelowPercentage" value={formData.aboveBelowPercentage} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="aboveBelowInWord" className="block text-sm font-medium text-gray-700">Above/Below (Word)</label>
                    <select
                        id="aboveBelowInWord"
                        name="aboveBelowInWord"
                        value={formData.aboveBelowInWord}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    >
                        <option value="Above">Above</option>
                        <option value="Below">Below</option>
                        <option value="At Par">At Par</option>
                    </select>
                </div>

                <div className="sm:col-span-6 border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tender Approval Details</h3>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="proposalDate" className="block text-sm font-medium text-gray-700">Proposal Date (DD/MM/YYYY)</label>
                    <input type="text" placeholder="20/01/2025" name="proposalDate" id="proposalDate" value={formData.proposalDate} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-4">
                    <label htmlFor="tenderApprovalOffice" className="block text-sm font-medium text-gray-700">Tender Approval Office</label>
                    <input type="text" name="tenderApprovalOffice" id="tenderApprovalOffice" value={formData.tenderApprovalOffice} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="tenderApprovalNo" className="block text-sm font-medium text-gray-700">Tender Approval No.</label>
                    <input type="text" name="tenderApprovalNo" id="tenderApprovalNo" value={formData.tenderApprovalNo} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="tenderApprovalDate" className="block text-sm font-medium text-gray-700">Tender Approval Date (DD/MM/YYYY)</label>
                    <input type="text" placeholder="20/01/2025" name="tenderApprovalDate" id="tenderApprovalDate" value={formData.tenderApprovalDate} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <Link href="/tenders" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</Link>
                    <button type="submit" disabled={loading} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                        <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Tender'}
                    </button>
                </div>
            </div>
        </form>
    );
}
