'use client';

import { useEffect, useState } from 'react';

interface Tracker {
  _id: string;
  tracking_code: string;
  current_status: string;
  carrier: string;
  to_address: {
    city: string;
    state: string;
  };
  easypost_created_at: string;
}

export default function TrackerTable() {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrackers() {
      try {
        const res = await fetch('/api/trackers');
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

    fetchTrackers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
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
            <tr key={tracker._id}>
              <td className="py-2 px-4 border-b">{tracker.tracking_code}</td>
              <td className="py-2 px-4 border-b">{tracker.current_status}</td>
              <td className="py-2 px-4 border-b">{tracker.carrier}</td>
              <td className="py-2 px-4 border-b">{tracker.to_address.city}, {tracker.to_address.state}</td>
              <td className="py-2 px-4 border-b">{new Date(tracker.easypost_created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}