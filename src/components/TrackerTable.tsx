'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Tracker {
  _id: string;
  tracking_code: string;
  status: string;
  carrier: string;
  to_address: {
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

  useEffect(() => {
    async function fetchTrackers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('query', searchQuery);
        if (statusFilter) params.append('status', statusFilter);
        if (carrierFilter) params.append('carrier', carrierFilter);

        const res = await fetch(`/api/trackers?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch trackers');
        }
        const data = await res.json();
        setTrackers(data);
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
  }, [searchQuery, statusFilter, carrierFilter]);

  const handleRowClick = (trackerId: string) => {
    router.push(`/trackers/${trackerId}`);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by tracking code or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded md:col-span-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="pre_transit">Pre-Transit</option>
          <option value="in_transit">In-Transit</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="failure">Failure</option>
          <option value="unknown">Unknown</option>
        </select>
        <select
          value={carrierFilter}
          onChange={(e) => setCarrierFilter(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Carriers</option>
          <option value="USPS">USPS</option>
          <option value="FedEx">FedEx</option>
          <option value="UPS">UPS</option>
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Tracking Code</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Carrier</th>
                <th className="py-2 px-4 border-b">Destination</th>
                <th className="py-2 px-4 border-b">Created At</th>
              </tr>
            </thead>
            <tbody>
              {trackers.map((tracker) => (
                <tr key={tracker._id} onClick={() => handleRowClick(tracker._id)} className="hover:bg-gray-100 cursor-pointer">
                  <td className="py-2 px-4 border-b text-blue-600 hover:underline">{tracker.tracking_code}</td>
                  <td className="py-2 px-4 border-b">{tracker.current_status}</td>
                  <td className="py-2 px-4 border-b">{tracker.carrier}</td>
                  <td className="py-2 px-4 border-b">{tracker.to_address.city}, {tracker.to_address.state}</td>
                  <td className="py-2 px-4 border-b">{new Date(tracker.easypost_created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}