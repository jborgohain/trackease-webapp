import TrackerTable from '@/components/TrackerTable';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Shipment Tracker</h1>
        <p className="text-lg text-gray-600 mb-8">Track all your shipments in one place. Get real-time updates and manage your deliveries with ease.</p>
        <TrackerTable />
    </div>
  );
}
