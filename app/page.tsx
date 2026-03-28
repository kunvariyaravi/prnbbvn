import dbConnect from '@/lib/db';
import Tender from '@/models/Tender';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed as I used SimpleCard
import { FileText, IndianRupee, MapPin } from 'lucide-react';
import Link from 'next/link';

// Simple Card components since I assume I don't have shadcn yet
function SimpleCard({ title, value, icon: Icon, subtext }: any) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
                {subtext && <div className="text-xs text-gray-400 mt-1">{subtext}</div>}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  await dbConnect();

  const totalTenders = await Tender.countDocuments({});

  const totalAmountResult = await Tender.aggregate([
    { $group: { _id: null, total: { $sum: "$estimatedAmount" } } }
  ]);
  const totalAmount = totalAmountResult[0]?.total || 0;

  const awardedCount = await Tender.countDocuments({ status: 'Awarded' });
  const pendingCount = await Tender.countDocuments({ status: { $ne: 'Awarded' } });

  // Get recent tenders
  const recentTenders = await Tender.find({}).sort({ createdAt: -1 }).limit(5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SimpleCard title="Total Tenders" value={totalTenders} icon={FileText} />
            <SimpleCard title="Total Estimated Cost" value={formatCurrency(totalAmount)} icon={IndianRupee} />
            <SimpleCard title="Awarded Works" value={awardedCount} icon={FileText} subtext="Works already awarded" />
            <SimpleCard title="Pending / In Process" value={pendingCount} icon={FileText} subtext="Tenders in progress" />
          </div>

          {/* Recent Tenders List */}
          <div className="mt-8">
            <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Tenders</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {recentTenders.map((tender) => (
                  <li key={tender._id.toString()}>
                    <Link href={`/tenders/${tender._id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">{tender.workName}</p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tender.status === 'Awarded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {tender.status}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {tender.taluka || tender.location || 'Unknown Location'}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              <IndianRupee className="inline h-3 w-3 mr-1" />
                              {formatCurrency(tender.estimatedAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/tenders" className="font-medium text-blue-600 hover:text-blue-500">
                    View all tenders <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
