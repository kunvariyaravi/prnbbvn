import Link from 'next/link';
import { Building2, FileText, Home, CheckCircle } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <Building2 className="h-8 w-8 text-blue-600" />
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-gray-900 leading-tight">Panchayat R&B Division</span>
                                <span className="text-xs text-gray-500 font-medium">Bhavnagar</span>
                            </div>
                        </Link>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <Link href="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                                <Home className="w-4 h-4 mr-2" />
                                Dashboard
                            </Link>
                            <Link href="/approved-works" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approved Works
                            </Link>
                            <Link href="/technical-sanctions" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                                <FileText className="w-4 h-4 mr-2" />
                                TS and DTP
                            </Link>
                            <Link href="/packages" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                                <FileText className="w-4 h-4 mr-2" />
                                Packages
                            </Link>
                            <Link href="/tenders" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                                <FileText className="w-4 h-4 mr-2" />
                                Tenders
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
