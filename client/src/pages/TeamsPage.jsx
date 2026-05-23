import { UsersIcon } from "../components/Icons";

export default function TeamsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold">Teams</h1>
      <p className="text-sm text-muted mt-1">Create teams to collaborate on bookings.</p>
      <div className="card mt-8 px-6 py-20 text-center">
        <UsersIcon className="mx-auto text-muted" width={28} height={28} />
        <p className="text-muted mt-3">No teams yet</p>
        <button className="btn-primary mt-4">Create a team</button>
      </div>
    </div>
  );
}
