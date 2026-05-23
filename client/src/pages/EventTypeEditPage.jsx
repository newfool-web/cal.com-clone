import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/client";
import { ArrowLeft, TrashIcon, PlusIcon } from "../components/Icons";

const QUESTION_TYPES = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
];

function QuestionRow({ q, onChange, onDelete }) {
  const isSelect = q.type === "select";
  return (
    <div className="border border-border rounded-md p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-xs text-muted">Label</label>
          <input
            className="input mt-1"
            placeholder="e.g. What would you like to discuss?"
            value={q.label}
            onChange={(e) => onChange({ ...q, label: e.target.value })}
          />
        </div>
        <div className="sm:w-44">
          <label className="text-xs text-muted">Type</label>
          <select
            className="input mt-1"
            value={q.type}
            onChange={(e) => onChange({ ...q, type: e.target.value })}
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isSelect && (
        <div>
          <label className="text-xs text-muted">Options (one per line)</label>
          <textarea
            className="input mt-1"
            rows="3"
            value={(q.options || []).join("\n")}
            onChange={(e) =>
              onChange({
                ...q,
                options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder={"Option 1\nOption 2"}
          />
        </div>
      )}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={q.required}
            onChange={(e) => onChange({ ...q, required: e.target.checked })}
          />
          Required
        </label>
        <button
          onClick={onDelete}
          className="text-muted hover:text-red-400 text-sm flex items-center gap-1"
        >
          <TrashIcon /> Remove
        </button>
      </div>
    </div>
  );
}

export default function EventTypeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user.data);
  const [et, setEt] = useState(null);
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api
      .get(`/api/event-types/${id}`)
      .then((r) => {
        setEt(r.data);
        setForm({
          title: r.data.title,
          slug: r.data.slug,
          description: r.data.description || "",
          duration: r.data.duration,
          location: r.data.location,
        });
        setQuestions(r.data.questions || []);
      })
      .catch((e) =>
        setLoadError(
          e.response?.data?.error ||
            "Could not reach server. Is the backend running on " +
              (import.meta.env.VITE_API_URL || "http://localhost:4000") +
              "?"
        )
      );
  }, [id]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await api.put(`/api/event-types/${id}`, { ...form, questions });
      setEt(res.data);
      setQuestions(res.data.questions || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this event type?")) return;
    await api.delete(`/api/event-types/${id}`);
    navigate("/event-types");
  };

  const addQuestion = () => {
    setQuestions([...questions, { label: "", type: "text", required: false, options: [] }]);
  };

  const updateQuestion = (i, q) => {
    setQuestions(questions.map((x, idx) => (idx === i ? q : x)));
  };

  const removeQuestion = (i) => {
    setQuestions(questions.filter((_, idx) => idx !== i));
  };

  if (loadError) return <div className="text-red-400 text-sm">{loadError}</div>;
  if (!et || !form) return <div className="text-muted">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-6">
        <Link to="/event-types" className="btn-ghost px-2 -ml-2 text-muted">
          <ArrowLeft />
          <span className="hidden sm:inline">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={remove}
            className="btn-secondary text-red-400 border-red-900"
            title="Delete"
          >
            <TrashIcon />
          </button>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-semibold break-words">{et.title}</h1>
      <p className="text-sm text-muted mt-1 break-all">
        {user && `/${user.username}/${et.slug}`}
      </p>

      <div className="card p-4 sm:p-6 mt-6 space-y-5">
        <div>
          <label className="text-xs font-medium text-muted">Title</label>
          <input
            className="input mt-1"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">URL slug</label>
          <input
            className="input mt-1"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Description</label>
          <textarea
            className="input mt-1"
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label className="text-xs font-medium text-muted">Location</label>
            <input
              className="input mt-1"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <div className="card p-4 sm:p-6 mt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Booking questions</h2>
            <p className="text-sm text-muted mt-1">
              Custom questions shown on the booking form.
            </p>
          </div>
          <button onClick={addQuestion} className="btn-secondary shrink-0">
            <PlusIcon /> <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="border border-dashed border-border rounded-md px-4 py-8 text-center text-sm text-muted mt-4">
            No custom questions yet. Click <span className="text-white">Add</span> to create one.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {questions.map((q, i) => (
              <QuestionRow
                key={i}
                q={q}
                onChange={(next) => updateQuestion(i, next)}
                onDelete={() => removeQuestion(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
