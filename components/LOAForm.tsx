'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import Link from 'next/link';

interface LOAFormProps {
    initialData?: any;
    isEditing?: boolean;
}

/** CEILING(value, significance) — rounds up to nearest multiple of significance */
function ceiling(value: number, significance: number): number {
    return Math.ceil(value / significance) * significance;
}

/** Parse dd/mm/yyyy or ISO date string → Date object, or null */
function parseDateStr(dateStr: string): Date | null {
    if (!dateStr) return null;
    const clean = String(dateStr).trim();
    const parts = clean.split(/[\/\-\.]/);
    if (parts.length === 3) {
        let year = parts[2];
        if (year.length === 2) year = '20' + year;
        const iso = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        const d = new Date(iso);
        return isNaN(d.getTime()) ? null : d;
    }
    // Try ISO direct
    const d = new Date(clean);
    return isNaN(d.getTime()) ? null : d;
}

/** Format Date → dd/mm/yyyy */
function formatDate(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
}

/** Format Date string from DB → dd/mm/yyyy */
function formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    try {
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) return '';
        return formatDate(dateObj);
    } catch {
        return '';
    }
}

export default function LOAForm({ initialData = {}, isEditing = false }: LOAFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [tenders, setTenders] = useState<any[]>([]);
    const tendersRef = useRef<any[]>([]);
    const [tendersLoaded, setTendersLoaded] = useState(false);

    // Sanitize null/undefined from DB into empty strings so controlled inputs never get null
    const sanitized = Object.fromEntries(
        Object.entries(initialData).map(([k, v]) => [k, v == null ? '' : v])
    );

    const [formData, setFormData] = useState({
        tenderId: '',
        workDurationMonths: '',
        securityDepositAmount: '',
        securityDepositDate: '',
        stampDuty: '',
        additionalSecurityDepositAmount: '',
        additionalSecurityDepositDate: '',
        defectLiabilityPeriod: '',
        timeLimitStartsFrom: '',
        acceptanceLetterWorksheetNo: '',
        acceptanceLetterDate: '',
        ...sanitized,
    });

    // Fetch tenders (with package populated)
    useEffect(() => {
        const fetchTenders = async () => {
            try {
                const res = await fetch('/api/tenders');
                const data = await res.json();
                if (data.success) {
                    setTenders(data.data);
                    tendersRef.current = data.data;
                    setTendersLoaded(true);
                }
            } catch (error) {
                console.error('Failed to fetch tenders', error);
            }
        };
        fetchTenders();
    }, []);

    // Fix dates when editing
    useEffect(() => {
        if (isEditing) {
            setFormData((prev: any) => ({
                ...prev,
                securityDepositDate: formatDateForInput(initialData.securityDepositDate),
                additionalSecurityDepositDate: formatDateForInput(initialData.additionalSecurityDepositDate),
                acceptanceLetterDate: formatDateForInput(initialData.acceptanceLetterDate),
                defectLiabilityPeriod: formatDateForInput(initialData.defectLiabilityPeriod),
            }));
        }
    }, [initialData, isEditing]);

    // Auto-set TLSF when Acceptance Letter Date changes
    useEffect(() => {
        if (!formData.acceptanceLetterDate) return;
        const alDate = parseDateStr(String(formData.acceptanceLetterDate));
        if (!alDate) return;
        const tlsfDate = new Date(alDate);
        tlsfDate.setDate(tlsfDate.getDate() + 60);
        setFormData((prev: any) => ({ ...prev, timeLimitStartsFrom: formatDate(tlsfDate) }));
    }, [formData.acceptanceLetterDate]);

    // ─── Auto-calculations ────────────────────────────────────────────────────────
    // Effect 1: SD Amount, Additional SD — triggered when tender changes or tenders load
    useEffect(() => {
        if (!formData.tenderId) return;
        const selectedTender = tendersRef.current.find((t: any) => t._id === formData.tenderId);
        if (!selectedTender) return;

        const contractPrice: number = Number(selectedTender.contractPrice) || 0;
        const aboveBelowPct: number = Number(selectedTender.aboveBelowPercentage) || 0;
        const aboveBelowInWord: string = selectedTender.aboveBelowInWord || 'Above';
        let estimatedAmount: number = Number(selectedTender.packageId?.dtpAmount) || 0;
        if (!estimatedAmount && selectedTender.packageId?.works) {
            estimatedAmount = selectedTender.packageId.works.reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);
        }

        // U2 is Above/Below (%) signed
        const u2 = aboveBelowInWord === 'Below' ? -Math.abs(aboveBelowPct) : Math.abs(aboveBelowPct);
        const r2 = estimatedAmount; // R2 is Estimated Amount
        const t2 = contractPrice; // T2 is Contract Price

        const requiredSD = contractPrice > 0 ? ceiling(contractPrice * 5 / 100, 1000) : 0;

        let requiredAdditionalSD = 0;
        if (u2 < -20) {
            requiredAdditionalSD = ceiling(((r2 * 90 / 100) - t2) * 30 / 100, 1000);
        } else if (u2 < -10) {
            requiredAdditionalSD = ceiling(((r2 * 90 / 100) - t2) * 20 / 100, 1000);
        }
        if (requiredAdditionalSD < 0) requiredAdditionalSD = 0;

        const requiredStampDuty = ceiling((requiredSD + requiredAdditionalSD) * 4.9 / 100, 100);

        setFormData((prev: any) => ({
            ...prev,
            securityDepositAmount: requiredSD > 0 ? String(requiredSD) : prev.securityDepositAmount,
            additionalSecurityDepositAmount: String(requiredAdditionalSD),
            stampDuty: requiredStampDuty > 0 ? String(requiredStampDuty) : prev.stampDuty,
        }));
    }, [formData.tenderId, tendersLoaded]);

    // Effect 2: DLP and SD Date — recalculates from editable TLSF, work months, and tender
    useEffect(() => {
        if (!formData.timeLimitStartsFrom) return;
        const tlsfDate = parseDateStr(String(formData.timeLimitStartsFrom));
        if (!tlsfDate) return;

        // Amount Put To Tender from selected tender's package
        const selectedTender = tendersRef.current.find((t: any) => t._id === formData.tenderId);
        let estimatedAmount = Number(selectedTender?.packageId?.dtpAmount) || 0;
        if (!estimatedAmount && selectedTender?.packageId?.works) {
            estimatedAmount = selectedTender.packageId.works.reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);
        }
        const workMonths = Number(formData.workDurationMonths) || 0;

        // DLP = TLSF + workMonths×30 + (estAmt > 1Cr ? 36 : 12)×30 + 30
        const dlpMonths = estimatedAmount > 10000000 ? 36 : 12;
        const totalDays = workMonths * 30 + dlpMonths * 30 + 30;
        const dlpDate = new Date(tlsfDate);
        dlpDate.setDate(dlpDate.getDate() + totalDays);

        // SD Required Date = DLP + 60 days
        const sdDateObj = new Date(dlpDate);
        sdDateObj.setDate(sdDateObj.getDate() + 60);

        setFormData((prev: any) => ({
            ...prev,
            defectLiabilityPeriod: formatDate(dlpDate),
            securityDepositDate: formatDate(sdDateObj),
        }));
    }, [formData.timeLimitStartsFrom, formData.workDurationMonths, formData.tenderId, tendersLoaded]);

    // Effect 3: Recalculate Stamp Duty whenever SD amounts change manually
    useEffect(() => {
        const sd = Number(formData.securityDepositAmount) || 0;
        const addSd = Number(formData.additionalSecurityDepositAmount) || 0;
        if (sd === 0 && addSd === 0) return;
        const stampDuty = ceiling((sd + addSd) * 4.9 / 100, 100);
        setFormData((prev: any) => ({ ...prev, stampDuty: String(stampDuty) }));
    }, [formData.securityDepositAmount, formData.additionalSecurityDepositAmount]);
    // ─────────────────────────────────────────────────────────────────────────────

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submissionData = { ...formData };

            const parseDate = (dateStr: string) => {
                if (!dateStr) return undefined;
                const d = parseDateStr(dateStr);
                return d ? d.toISOString() : undefined;
            };

            if (submissionData.securityDepositDate)
                submissionData.securityDepositDate = parseDate(submissionData.securityDepositDate) as any;
            if (submissionData.additionalSecurityDepositDate)
                submissionData.additionalSecurityDepositDate = parseDate(submissionData.additionalSecurityDepositDate) as any;
            if (submissionData.acceptanceLetterDate)
                submissionData.acceptanceLetterDate = parseDate(submissionData.acceptanceLetterDate) as any;

            const url = isEditing ? `/api/loas/${initialData._id}` : '/api/loas';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            if (!res.ok) throw new Error('Failed to save LOA');

            router.push('/loas');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error saving LOA');
        } finally {
            setLoading(false);
        }
    };

    const selectedTender = tenders.find((t: any) => t._id === formData.tenderId);

    return (
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 bg-white p-8 shadow rounded-lg">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                <div className="sm:col-span-6">
                    <label htmlFor="tenderId" className="block text-sm font-medium text-gray-700">Select Tender *</label>
                    <select
                        id="tenderId"
                        name="tenderId"
                        required
                        value={formData.tenderId || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    >
                        <option value="">-- Select Tender --</option>
                        {tenders.map((tender: any) => (
                            <option key={tender._id} value={tender._id}>
                                ID: {tender.tenderId} - {tender.packageName ? tender.packageName.substring(0, 50) + '...' : 'Unknown Package'}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Show tender info for reference */}
                {selectedTender && (
                    <div className="sm:col-span-6 bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
                        <strong>Tender Info:</strong>&nbsp;
                        Contract Price: ₹{selectedTender.contractPrice?.toLocaleString('en-IN') ?? '-'} &nbsp;|&nbsp;
                        {selectedTender.aboveBelowInWord} {selectedTender.aboveBelowPercentage}% &nbsp;|&nbsp;
                        Amount Put To Tender: ₹{(selectedTender.packageId?.dtpAmount
                            || selectedTender.packageId?.works?.reduce((s: number, w: any) => s + (Number(w.amount) || 0), 0)
                            || 0).toLocaleString('en-IN')}
                    </div>
                )}

                <div className="sm:col-span-3">
                    <label htmlFor="workDurationMonths" className="block text-sm font-medium text-gray-700">Duration of Work (Months)</label>
                    <input type="number" name="workDurationMonths" id="workDurationMonths" value={formData.workDurationMonths} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="acceptanceLetterDate" className="block text-sm font-medium text-gray-700">Acceptance Letter Date</label>
                    <input type="text" placeholder="20/01/2025" name="acceptanceLetterDate" id="acceptanceLetterDate" value={formData.acceptanceLetterDate || ''} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="timeLimitStartsFrom" className="block text-sm font-medium text-gray-700">
                        Time Limit Starts From Date
                    </label>
                    <input
                        type="text"
                        placeholder="20/01/2025"
                        name="timeLimitStartsFrom"
                        id="timeLimitStartsFrom"
                        value={formData.timeLimitStartsFrom || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border bg-yellow-50"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="defectLiabilityPeriod" className="block text-sm font-medium text-gray-700">
                        Defect Liability Period (Date)
                    </label>
                    <input
                        type="text"
                        placeholder="20/01/2025"
                        name="defectLiabilityPeriod"
                        id="defectLiabilityPeriod"
                        value={formData.defectLiabilityPeriod || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border bg-yellow-50"
                    />
                </div>

                <div className="sm:col-span-6 border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Security Deposit Details</h3>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="securityDepositAmount" className="block text-sm font-medium text-gray-700">
                        Required SD Amount
                    </label>
                    <input
                        type="number"
                        name="securityDepositAmount"
                        id="securityDepositAmount"
                        value={formData.securityDepositAmount || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border bg-yellow-50"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="securityDepositDate" className="block text-sm font-medium text-gray-700">
                        Date upto which SD Required
                    </label>
                    <input
                        type="text"
                        placeholder="20/01/2025"
                        name="securityDepositDate"
                        id="securityDepositDate"
                        value={formData.securityDepositDate || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border bg-yellow-50"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="additionalSecurityDepositAmount" className="block text-sm font-medium text-gray-700">
                        Required Addl. Performance SD Amount
                    </label>
                    <input
                        type="number"
                        name="additionalSecurityDepositAmount"
                        id="additionalSecurityDepositAmount"
                        value={formData.additionalSecurityDepositAmount || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border bg-yellow-50"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="additionalSecurityDepositDate" className="block text-sm font-medium text-gray-700">Date upto which Addl. SD Required</label>
                    <input
                        type="text"
                        placeholder="20/01/2025"
                        name="additionalSecurityDepositDate"
                        id="additionalSecurityDepositDate"
                        value={formData.additionalSecurityDepositDate || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                </div>

                <div className="sm:col-span-6 border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Other Details</h3>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="stampDuty" className="block text-sm font-medium text-gray-700">
                        Required Stamp Duty
                    </label>
                    <input
                        type="number"
                        name="stampDuty"
                        id="stampDuty"
                        value={formData.stampDuty || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border bg-yellow-50"
                    />
                </div>

                <div className="sm:col-span-3"></div>

                <div className="sm:col-span-3">
                    <label htmlFor="acceptanceLetterWorksheetNo" className="block text-sm font-medium text-gray-700">Acceptance Letter Worksheet No.</label>
                    <input type="text" name="acceptanceLetterWorksheetNo" id="acceptanceLetterWorksheetNo" value={formData.acceptanceLetterWorksheetNo || ''} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>



            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <Link href="/loas" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</Link>
                    <button type="submit" disabled={loading} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                        <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save LOA'}
                    </button>
                </div>
            </div>
        </form>
    );
}
