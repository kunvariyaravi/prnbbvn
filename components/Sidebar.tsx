'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, FileText, Home, CheckCircle, Package, Layers } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Approved Works', href: '/approved-works', icon: CheckCircle },
        { name: 'TS and DTP', href: '/technical-sanctions', icon: Layers },
        { name: 'Packages', href: '/packages', icon: Package },
        { name: 'Tender & Approval', href: '/tenders', icon: FileText },
        { name: 'LOA', href: '/loas', icon: CheckCircle },
    ];

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
            {/* Logo Section */}
            <div className="flex flex-col items-center justify-center h-20 border-b border-gray-200 px-4">
                <div className="flex items-center gap-2">
                    <Building2 className="h-8 w-8 text-blue-600" />
                    <span className="font-bold text-lg text-gray-900 leading-tight">Panchayat R&B</span>
                </div>
                <span className="text-xs text-gray-500 font-medium mt-1">Bhavnagar</span>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
                <nav className="mt-5 flex-1 px-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile / Footer (Optional placeholder) */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Admin User</p>
                        <p className="text-xs font-medium text-gray-500">View Profile</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
