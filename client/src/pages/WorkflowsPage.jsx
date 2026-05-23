import { BoltIcon } from "../components/Icons";

export default function WorkflowsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold">Workflows</h1>
      <p className="text-sm text-muted mt-1">Automate notifications and reminders.</p>
      <div className="card mt-8 px-6 py-20 text-center">
        <BoltIcon className="mx-auto text-muted" width={28} height={28} />
        <p className="text-muted mt-3">No workflows yet</p>
      </div>
    </div>
  );
}
