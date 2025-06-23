import TrackerTable from '@/components/TrackerTable';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center">
            <img src="/Track_easy_logo.png" alt="TrackEase Logo" className="h-12 mr-4" />
            <h1 className="text-3xl font-bold">TrackEase</h1>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Shipment Tracker</h1>
        <p className="text-lg text-gray-600 mb-8">Track all your White Label Pharmacy shipments in one place. Get real-time updates and manage your deliveries with ease.</p>
        <TrackerTable />
      </main>
      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            {/* <img src="/Track_easy_logo.png" alt="TrackEase Logo" className="h-8" /> */}
          </div>
          <div>
            <p className="text-sm">&copy; 2024 TrackEase - a White Label Pharmacy internal to0l. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
