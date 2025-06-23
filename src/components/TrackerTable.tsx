'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Tracker {
  _id: string;
  tracking_code: string;
  current_status: string;
  carrier: string;
  to_address: {
    name: string;
    city: string;
    state: string;
  };
  easypost_created_at: string;
}

export default function TrackerTable() {
  const router = useRouter();
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTrackers, setTotalTrackers] = useState(0);
  const trackersPerPage = 20;

  useEffect(() => {
    async function fetchTrackers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('query', searchQuery);
        if (statusFilter) params.append('status', statusFilter);
        if (carrierFilter) params.append('carrier', carrierFilter);
        params.append('page', currentPage.toString());
        params.append('limit', trackersPerPage.toString());

        const res = await fetch(`/api/trackers?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch trackers');
        }
        const data = await res.json();
        setTrackers(data.trackers);
        setTotalTrackers(data.totalTrackers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    const debounceFetch = setTimeout(() => {
      fetchTrackers();
    }, 500);

    return () => clearTimeout(debounceFetch);
  }, [searchQuery, statusFilter, carrierFilter, currentPage]);

  const handleRowClick = (trackerId: string) => {
    router.push(`/trackers/${trackerId}`);
  };

  const getStatusChip = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    switch (status) {
      case 'pre_transit':
        return <span className={`${baseClasses} bg-gray-200 text-gray-800`}>Pre-Transit</span>;
      case 'in_transit':
        return <span className={`${baseClasses} bg-blue-200 text-blue-800`}>In-Transit</span>;
      case 'out_for_delivery':
        return <span className={`${baseClasses} bg-yellow-200 text-yellow-800`}>Out for Delivery</span>;
      case 'delivered':
        return <span className={`${baseClasses} bg-green-200 text-green-800`}>Delivered</span>;
      case 'failure':
        return <span className={`${baseClasses} bg-red-200 text-red-800`}>Failure</span>;
        case 'cancelled':
          return <span className={`${baseClasses} bg-red-200 text-red-800`}>Cancelled</span>;
      default:
        return <span className={`${baseClasses} bg-gray-200 text-gray-800`}>Unknown</span>;
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by tracking code or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pre_transit">Pre-Transit</option>
          <option value="in_transit">In-Transit</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="failure">Failure</option>
          <option value="cancelled">Cancelled</option>
          <option value="unknown">Unknown</option>
        </select>
        <select
          value={carrierFilter}
          onChange={(e) => setCarrierFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Carriers</option>
          <option value="USPS">USPS</option>
          <option value="FedEx">FedEx</option>
          <option value="UPS">UPS</option>
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-500 bg-red-50 rounded-md">
            <p className="font-semibold">Error: {error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex justify-end items-center mb-4">
            <span className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * trackersPerPage + 1, totalTrackers)} - {Math.min(currentPage * trackersPerPage, totalTrackers)} of {totalTrackers}
            </span>
          </div>
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking Code</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trackers.map((tracker) => (
                <tr key={tracker._id} onClick={() => handleRowClick(tracker._id)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">{tracker.tracking_code}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{tracker.to_address.name}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm">{getStatusChip(tracker.current_status)}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{tracker.carrier}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{tracker.to_address.city}, {tracker.to_address.state}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{new Date(tracker.easypost_created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">Page {currentPage} of {Math.ceil(totalTrackers / trackersPerPage)}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalTrackers / trackersPerPage)))}
              disabled={currentPage === Math.ceil(totalTrackers / trackersPerPage)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}