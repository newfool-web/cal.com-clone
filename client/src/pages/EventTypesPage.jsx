import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/client";
import { useToast } from "../components/Toast";
import {
  ClockIcon,
  ExternalIcon,
  LinkIcon,
  MoreIcon,
  PlusIcon,
  SearchIcon,
  EyeOffIcon,
  TrashIcon,
  PencilIcon,
} from "../components/Icons";

function NewEventTypeModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", slug: "", description: "", duration: 30 });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/api/event-types", form);
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md card p-6 mx-4"
      >
        <h3 className="text-lg font-semibold">Add a new event type</h3>
        <p className="text-sm text-muted mt-1">
          Create a new event type for people to book times with.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">Title</label>
            <input
              autoFocus
              className="input mt-1"
              placeholder="Quick chat"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">URL slug</label>
            <div className="flex items-center mt-1">
              <span className="text-sm text-muted bg-[#141414] border border-r-0 border-border rounded-l-md px-3 py-2">
                /...
              </span>
              <input
                className="input rounded-l-none"
                placeholder="quick-chat"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Description</label>
            <textarea
              className="input mt-1"
              rows="2"
              placeholder="A short summary"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Duration (minutes)</label>
            <input
              type="number"
              min="5"
              className="input mt-1"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EventTypeRow({ et, user, onToggle, onDelete, onCopy }) {
  const path = `/${user.username}/${et.slug}`;
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3 group hover:bg-[#161616] transition-colors">
      <Link to={`/event-types/${et.id}`} className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
          <h3 className={`font-semibold truncate ${et.hidden ? "text-muted" : "text-white"}`}>
            {et.title}
          </h3>
          <span className="text-xs sm:text-sm text-muted truncate">
            /{user.username}/{et.slug}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1">
            <ClockIcon width={12} height={12} /> {et.duration}m
          </span>
          {et.hidden && (
            <span className="inline-flex items-center gap-1 rounded-md bg-yellow-500/10 text-yellow-400 px-2 py-1">
              <EyeOffIcon width={12} height={12} /> Hidden
            </span>
          )}
        </div>
      </Link>
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!et.hidden}
            onChange={() => onToggle(et)}
          />
          <div className="w-9 h-5 bg-[#2a2a2a] rounded-full peer peer-checked:bg-white relative transition-colors">
            <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-[#0c0c0c] peer-checked:bg-[#0c0c0c] rounded-full transition-transform peer-checked:translate-x-4" />
          </div>
        </label>
        <a
          href={path}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex p-2 rounded-md border border-border hover:bg-[#1f1f1f]"
          title="Preview"
        >
          <ExternalIcon />
        </a>
        <button
          onClick={() => onCopy(path)}
          className="hidden sm:inline-flex p-2 rounded-md border border-border hover:bg-[#1f1f1f]"
          title="Copy link"
        >
          <LinkIcon />
        </button>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md border border-border hover:bg-[#1f1f1f]"
          >
            <MoreIcon />
          </button>
          {open && (
            <div className="absolute right-0 top-10 z-20 w-40 card py-1 text-sm">
              <Link
                to={`/event-types/${et.id}`}
                className="flex items-center gap-2 px-3 py-2 hover:bg-[#1f1f1f]"
              >
                <PencilIcon width={14} height={14} /> Edit
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete(et);
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-[#1f1f1f] text-red-400"
              >
                <TrashIcon width={14} height={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventTypesPage() {
  const user = useSelector((s) => s.user.data);
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/event-types");
      setItems(res.data);
    } catch (e) {
      setError(e.response?.data?.error || "Could not reach server. Is the backend running on " + (import.meta.env.VITE_API_URL || "http://localhost:4000") + "?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (et) => {
    const res = await api.put(`/api/event-types/${et.id}`, { hidden: !et.hidden });
    setItems((prev) => prev.map((x) => (x.id === et.id ? res.data : x)));
  };

  const remove = async (et) => {
    if (!confirm(`Delete "${et.title}"?`)) return;
    await api.delete(`/api/event-types/${et.id}`);
    setItems((prev) => prev.filter((x) => x.id !== et.id));
  };

  const copyLink = (path) => {
    navigator.clipboard.writeText(`${window.location.origin}${path}`);
    toast.show("Link Copied!");
  };

  const filtered = items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Event types</h1>
          <p className="text-sm text-muted mt-1">
            Configure different events for people to book on your calendar.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="input pl-9 sm:w-56"
            />
          </div>
          <button onClick={() => setShowNew(true)} className="btn-primary shrink-0">
            <PlusIcon /> <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      <div className="card divide-y divide-border">
        {loading ? (
          <div className="px-6 py-10 text-center text-muted text-sm">Loading…</div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-red-400 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-muted">No event types yet.</p>
            <button onClick={() => setShowNew(true)} className="btn-primary mt-4">
              <PlusIcon /> Create your first event type
            </button>
          </div>
        ) : (
          filtered.map((et) => (
            <EventTypeRow
              key={et.id}
              et={et}
              user={user}
              onToggle={toggle}
              onDelete={remove}
              onCopy={copyLink}
            />
          ))
        )}
      </div>

      {showNew && (
        <NewEventTypeModal
          onClose={() => setShowNew(false)}
          onCreated={(item) => {
            setItems([...items, item]);
            setShowNew(false);
          }}
        />
      )}
    </div>
  );
}
