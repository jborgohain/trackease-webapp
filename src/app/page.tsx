import TrackerTable from '@/components/TrackerTable';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">TrackEase Dashboard</h1>
      <div className="w-full max-w-6xl">
        <TrackerTable />
      </div>
    </main>
  );
}
