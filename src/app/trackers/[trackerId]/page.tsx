'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface TrackingDetail {
  message: string;
  current_status: string;
  status: string;
  datetime: string;
  source: string;
  location?: {
    city: string | null;
    state: string | null;
    country: string | null;
    zip: string | null;
  } | null;
}

interface Tracker {
  _id: string;
  easypost_tracker_id: string;
  tracking_code: string;
  current_status: string;
  carrier: string;
  public_tracking_url: string;
  postage_label_url: string | null;
  to_address?: {
    name: string;
    street1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    email: string;
    phone: string;
  };
  from_address?: {
    name: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    email: string;
    phone: string;
  };
  tracking_history: TrackingDetail[];
}

export default function TrackerDetailPage() {
  const params = useParams();
  const trackerId = params.trackerId as string;
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatLocation = (location: { city?: string | null; state?: string | null } | null | undefined): string => {
    if (!location) {
        return 'N/A';
    }
    const { city, state } = location;
    const parts = [city, state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  useEffect(() => {
    if (trackerId) {
      fetch(`/api/trackers/${trackerId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch tracker details');
          }
          return res.json();
        })
        .then((data) => {
          setTracker(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [trackerId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!tracker) return <div className="p-4">Tracker not found.</div>;

  return (
    <div className="bg-gray-50 container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Shipment Details</h1>
        <Link href="/" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Back to Home
        </Link>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold">{tracker.tracking_code}</h2>
            <p className="text-sm text-gray-600">Carrier: {tracker.carrier}</p>
            <p className="text-sm text-gray-600">Status: <span className="font-medium text-blue-600">{tracker.current_status}</span></p>
          </div>
          <div className="text-right">
            <a href={tracker.public_tracking_url} target="_blank" rel="noopener noreferrer" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Track the package
            </a>
            {tracker.postage_label_url && (
              <a href={tracker.postage_label_url} target="_blank" rel="noopener noreferrer" className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                View Postage Label
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">To Address</h3>
                {tracker.to_address ? (
                    <>
                        <p>{tracker.to_address.name}</p>
                        <p>{tracker.to_address.street1},</p>
                        <p>{tracker.to_address.city}, {tracker.to_address.state} {tracker.to_address.zip}</p>
                        <p>{tracker.to_address.country}</p>
                        <p>{tracker.to_address.email}</p>
                        <p>{tracker.to_address.phone}</p>
                    </>
                ) : <p>N/A</p>}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">From Address</h3>
                {tracker.from_address ? (
                    <>
                        <p>{tracker.from_address.name}</p>
                        <p>{tracker.from_address.city}, {tracker.from_address.state} {tracker.from_address.zip}</p>
                        <p>{tracker.from_address.country}</p>
                        <p>{tracker.from_address.email}</p>
                        <p>{tracker.from_address.phone}</p>
                    </>
                ) : <p>N/A</p>}
            </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Tracking History</h3>
          <div className="border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tracker.tracking_history?.filter(Boolean).map((detail, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(detail.datetime).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{detail.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detail.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatLocation(detail.location)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}