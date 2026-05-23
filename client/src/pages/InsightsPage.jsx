import { BarsIcon } from "../components/Icons";

export default function InsightsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold">Insights</h1>
      <p className="text-sm text-muted mt-1">Booking analytics will appear here.</p>
      <div className="card mt-8 px-6 py-20 text-center">
        <BarsIcon className="mx-auto text-muted" width={28} height={28} />
        <p className="text-muted mt-3">Not enough data yet</p>
      </div>
    </div>
  );
}
