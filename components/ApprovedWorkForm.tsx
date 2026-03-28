'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import Link from 'next/link';

interface ApprovedWorkFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ApprovedWorkForm({ initialData = {}, isEditing = false }: ApprovedWorkFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        circle: 'Panchayat R&B Circle, Rajkot',
        district: 'Bhavnagar',
        taluka: '',
        constituencyName: '',
        budgetItemName: '',
        budgetType: '',
        wmsItemCode: '',
        approvalYear: '2025-26',
        jobNumberApprovalDate: '',
        jobNumberAmount: '',
        workName: '',
        proposedLength: '',
        contractProvision: '',
        rpmsCode: '',
        type: '',
        budgetHead: '',
        projectType: '',
        mlaName: '',
        roadCategory: '',
        workType: '',
        parliamentaryConstituency: '',
        mpName: '',
        ...initialData
    });

    // Format initial date to DD/MM/YYYY if coming from DB (ISO String)
    useEffect(() => {
        if (initialData.jobNumberApprovalDate) {
            try {
                const dateObj = new Date(initialData.jobNumberApprovalDate);
                if (!isNaN(dateObj.getTime())) {
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const year = dateObj.getFullYear();
                    setFormData((prev: any) => ({
                        ...prev,
                        jobNumberApprovalDate: `${day}/${month}/${year}`
                    }));
                }
            } catch (e) {
                console.error("Error formatting initial date", e);
            }
        }
    }, [initialData.jobNumberApprovalDate]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Parse DD/MM/YYYY to ISO Date if present
            const submissionData = { ...formData };

            if (submissionData.jobNumberApprovalDate) {
                const cleanDate = String(submissionData.jobNumberApprovalDate).trim();
                // Match DD/MM or DD/MM/YYYY or DD-MM-YYYY
                const parts = cleanDate.split(/[\/\-\.]/);

                if (parts.length === 3) {
                    // DD/MM/YYYY -> YYYY-MM-DD
                    // Ensure 4 digit year
                    let year = parts[2];
                    if (year.length === 2) year = '20' + year;

                    const isoDate = `${year}-${parts[1]}-${parts[0]}`;
                    const dateObj = new Date(isoDate);

                    if (!isNaN(dateObj.getTime())) {
                        submissionData.jobNumberApprovalDate = dateObj.toISOString();
                    } else {
                        console.error('Date parse failed for:', isoDate);
                        alert(`Invalid Date format: "${cleanDate}". parsed as ${isoDate}. Please use DD/MM/YYYY`);
                        setLoading(false);
                        return;
                    }
                } else if (cleanDate.length > 0) {
                    // If they entered something that isn't 3 parts but logic triggers
                    alert(`Invalid Date format: "${cleanDate}". Please use DD/MM/YYYY`);
                    setLoading(false);
                    return;
                }
            }

            const url = isEditing ? `/api/approved-works/${initialData._id}` : '/api/approved-works';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            if (!res.ok) {
                throw new Error('Failed to save work');
            }

            router.push('/approved-works');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error saving work');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 bg-white p-8 shadow rounded-lg">

            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                    <label htmlFor="workName" className="block text-sm font-medium text-gray-700">
                        Name of Work *
                    </label>
                    <div className="mt-1">
                        <textarea
                            id="workName"
                            name="workName"
                            rows={3}
                            required
                            value={formData.workName}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="circle" className="block text-sm font-medium text-gray-700">Circle</label>
                    <input type="text" name="circle" id="circle" value={formData.circle} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">District</label>
                    <input type="text" name="district" id="district" value={formData.district} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="taluka" className="block text-sm font-medium text-gray-700">Taluka</label>
                    <input type="text" name="taluka" id="taluka" value={formData.taluka} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
            </div>

            {/* Budget & Approval Details */}
            <div className="pt-8">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Budget & Approval</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label htmlFor="budgetItemName" className="block text-sm font-medium text-gray-700">Name of Budget Item</label>
                        <input type="text" name="budgetItemName" id="budgetItemName" value={formData.budgetItemName} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                    <div className="sm:col-span-3">
                        <label htmlFor="budgetHead" className="block text-sm font-medium text-gray-700">Budget Head</label>
                        <input type="text" name="budgetHead" id="budgetHead" value={formData.budgetHead} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="approvalYear" className="block text-sm font-medium text-gray-700">Year of Approval</label>
                        <input type="text" name="approvalYear" id="approvalYear" value={formData.approvalYear} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="jobNumberAmount" className="block text-sm font-medium text-gray-700">Job Number Amount</label>
                        <input type="number" step="1" name="jobNumberAmount" id="jobNumberAmount" value={formData.jobNumberAmount} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="jobNumberApprovalDate" className="block text-sm font-medium text-gray-700">Approval Date (DD/MM/YYYY)</label>
                        <input
                            type="text"
                            placeholder="20/01/2025"
                            name="jobNumberApprovalDate"
                            id="jobNumberApprovalDate"
                            value={formData.jobNumberApprovalDate}
                            onChange={handleChange}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                        />
                    </div>
                </div>
            </div>

            {/* Classification */}
            <div className="pt-8">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Classification Details</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                        <label htmlFor="constituencyName" className="block text-sm font-medium text-gray-700">Constituency Name</label>
                        <input type="text" name="constituencyName" id="constituencyName" value={formData.constituencyName} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="mlaName" className="block text-sm font-medium text-gray-700">MLA Name</label>
                        <input type="text" name="mlaName" id="mlaName" value={formData.mlaName} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="mpName" className="block text-sm font-medium text-gray-700">MP Name</label>
                        <input type="text" name="mpName" id="mpName" value={formData.mpName} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="wmsItemCode" className="block text-sm font-medium text-gray-700">WMS Item Code</label>
                        <input type="text" name="wmsItemCode" id="wmsItemCode" value={formData.wmsItemCode} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="rpmsCode" className="block text-sm font-medium text-gray-700">RPMS Code</label>
                        <input type="text" name="rpmsCode" id="rpmsCode" value={formData.rpmsCode} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="roadCategory" className="block text-sm font-medium text-gray-700">Category of Road</label>
                        <input type="text" name="roadCategory" id="roadCategory" value={formData.roadCategory} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <Link
                        href="/approved-works"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Work'}
                    </button>
                </div>
            </div>
        </form>
    );
}
