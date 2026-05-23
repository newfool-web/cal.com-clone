import { GridIcon } from "../components/Icons";

export default function AppsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold">App store</h1>
      <p className="text-sm text-muted mt-1">Connect calendars, video conferencing and payment apps.</p>
      <div className="card mt-8 px-6 py-20 text-center">
        <GridIcon className="mx-auto text-muted" width={28} height={28} />
        <p className="text-muted mt-3">No apps installed yet</p>
      </div>
    </div>
  );
}
