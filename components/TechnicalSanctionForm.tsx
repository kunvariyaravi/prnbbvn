'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface TechnicalSanctionFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function TechnicalSanctionForm({ initialData = {}, isEditing = false }: TechnicalSanctionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        workName: '',
        civilWorkCost: '',
        gstAmount: '',
        qcAmount: '',
        lsAmount: '',
        miscellaneousAmount: '',
        tsAmount: '',
        tsNumber: '',
        tsDate: '',
        villageName: '',
        villagePopulation: '',
        existingSurface: '',
        amountNotPutToTender: '',
        amountPutToTender: '',
        ...initialData
    });

    const [approvedWorks, setApprovedWorks] = useState<any[]>([]);

    useEffect(() => {
        const fetchApprovedWorks = async () => {
            try {
                const res = await fetch('/api/approved-works');
                const data = await res.json();
                if (data.success) {
                    setApprovedWorks(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch approved works", error);
            }
        };
        fetchApprovedWorks();
    }, []);

    useEffect(() => {
        // Format date if editing
        if (initialData.tsDate) {
            try {
                const dateObj = new Date(initialData.tsDate);
                if (!isNaN(dateObj.getTime())) {
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const year = dateObj.getFullYear();
                    setFormData((prev: any) => ({
                        ...prev,
                        tsDate: `${day}/${month}/${year}`
                    }));
                }
            } catch (e) {
                console.error("Error formatting initial date", e);
            }
        }
    }, [initialData.tsDate]);

    // Auto-calculate Amount Not Put To Tender removed as per request
    // The user will enter Amount Not Put To Tender manually.

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submissionData = { ...formData };

            // Date Parsing
            if (submissionData.tsDate) {
                const cleanDate = String(submissionData.tsDate).trim();
                const parts = cleanDate.split(/[\/\-\.]/);

                if (parts.length === 3) {
                    let year = parts[2];
                    if (year.length === 2) year = '20' + year;
                    const isoDate = `${year}-${parts[1]}-${parts[0]}`;
                    const dateObj = new Date(isoDate);

                    if (!isNaN(dateObj.getTime())) {
                        submissionData.tsDate = dateObj.toISOString();
                    } else {
                        alert(`Invalid Date format: "${cleanDate}". Please use DD/MM/YYYY`);
                        setLoading(false);
                        return;
                    }
                } else if (cleanDate.length > 0) {
                    alert(`Invalid Date format: "${cleanDate}". Please use DD/MM/YYYY`);
                    setLoading(false);
                    return;
                }
            }

            const url = isEditing ? `/api/technical-sanctions/${initialData._id}` : '/api/technical-sanctions';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            if (!res.ok) {
                throw new Error('Failed to save sanction');
            }

            router.push('/technical-sanctions');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error saving sanction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 bg-white p-8 shadow rounded-lg">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                    <label htmlFor="workName" className="block text-sm font-medium text-gray-700"> Name of Work * </label>
                    <select
                        id="workName"
                        name="workName"
                        required
                        value={formData.workName}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    >
                        <option value="">Select a Work</option>
                        {approvedWorks.map(work => (
                            <option key={work._id} value={work.workName}>{work.workName}</option>
                        ))}
                    </select>
                </div>

                {/* Cost Details */}
                <div className="sm:col-span-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Cost Details (Rupees)</h4>
                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                            <label htmlFor="civilWorkCost" className="block text-sm font-medium text-gray-700">Civil Work Cost</label>
                            <input type="number" step="0.01" name="civilWorkCost" id="civilWorkCost" value={formData.civilWorkCost} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="gstAmount" className="block text-sm font-medium text-gray-700">GST Amount</label>
                            <input type="number" step="0.01" name="gstAmount" id="gstAmount" value={formData.gstAmount} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="qcAmount" className="block text-sm font-medium text-gray-700">QC Amount</label>
                            <input type="number" step="0.01" name="qcAmount" id="qcAmount" value={formData.qcAmount} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="lsAmount" className="block text-sm font-medium text-gray-700">LS Amount</label>
                            <input type="number" step="0.01" name="lsAmount" id="lsAmount" value={formData.lsAmount} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="miscellaneousAmount" className="block text-sm font-medium text-gray-700">Misc. Amount</label>
                            <input type="number" step="0.01" name="miscellaneousAmount" id="miscellaneousAmount" value={formData.miscellaneousAmount} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="tsAmount" className="block text-sm font-medium text-gray-700">Total T.S. Amount</label>
                            <input type="number" step="0.01" name="tsAmount" id="tsAmount" value={formData.tsAmount} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="amountNotPutToTender" className="block text-sm font-medium text-gray-700">Amount Not Put To Tender</label>
                            <input type="number" step="0.01" name="amountNotPutToTender" id="amountNotPutToTender" value={formData.amountNotPutToTender} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border bg-yellow-50" />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="amountPutToTender" className="block text-sm font-medium text-gray-700">Amount Put To Tender</label>
                            <input type="number" step="0.01" name="amountPutToTender" id="amountPutToTender" value={formData.amountPutToTender || ''} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                        </div>
                    </div>
                </div>

                {/* T.S. Details */}
                <div className="sm:col-span-3">
                    <label htmlFor="tsNumber" className="block text-sm font-medium text-gray-700">T.S. Number</label>
                    <input type="text" name="tsNumber" id="tsNumber" value={formData.tsNumber} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
                <div className="sm:col-span-3">
                    <label htmlFor="tsDate" className="block text-sm font-medium text-gray-700">T.S. Date (DD/MM/YYYY)</label>
                    <input type="text" placeholder="20/01/2025" name="tsDate" id="tsDate" value={formData.tsDate} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                {/* Village Details */}
                <div className="sm:col-span-2">
                    <label htmlFor="villageName" className="block text-sm font-medium text-gray-700">Village Name</label>
                    <input type="text" name="villageName" id="villageName" value={formData.villageName} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="villagePopulation" className="block text-sm font-medium text-gray-700">Village Population</label>
                    <input type="number" name="villagePopulation" id="villagePopulation" value={formData.villagePopulation} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="existingSurface" className="block text-sm font-medium text-gray-700">Existing Surface</label>
                    <input type="text" name="existingSurface" id="existingSurface" value={formData.existingSurface} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <Link href="/technical-sanctions" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</Link>
                    <button type="submit" disabled={loading} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                        <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Sanction'}
                    </button>
                </div>
            </div>
        </form>
    );
}
