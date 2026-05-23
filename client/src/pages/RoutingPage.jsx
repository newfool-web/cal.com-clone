import { RouteIcon } from "../components/Icons";

export default function RoutingPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold">Routing</h1>
      <p className="text-sm text-muted mt-1">Route bookings to the right team member.</p>
      <div className="card mt-8 px-6 py-20 text-center">
        <RouteIcon className="mx-auto text-muted" width={28} height={28} />
        <p className="text-muted mt-3">No routing forms yet</p>
      </div>
    </div>
  );
}
