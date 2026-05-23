import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { ClockIcon, ChevronRight } from "../components/Icons";

function Avatar({ name }) {
  return (
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-amber-300 to-stone-700 flex items-center justify-center shadow-inner">
      <span className="text-3xl font-bold text-stone-800/90">{name[0]}</span>
    </div>
  );
}

export default function PublicProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/u/${username}`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.error || "User not found"));
  }, [username]);

  if (error)
    return <div className="min-h-screen flex items-center justify-center text-muted">{error}</div>;
  if (!data)
    return <div className="min-h-screen flex items-center justify-center text-muted">Loading…</div>;

  return (
    <div className="min-h-screen bg-bg text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="rounded-2xl border border-border bg-bg p-5 sm:p-6">
          <Avatar name={data.name} />
          <h1 className="text-2xl font-semibold mt-5">{data.name}</h1>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-bg divide-y divide-border overflow-hidden">
          {data.eventTypes.map((et) => (
            <Link
              key={et.id}
              to={`/${data.username}/${et.slug}`}
              className="group flex items-center justify-between px-5 sm:px-6 py-5 hover:bg-[#161616] transition-colors gap-3"
            >
              <div>
                <h3 className="font-semibold">{et.title}</h3>
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-muted bg-[#1d1d1d] rounded-md px-2 py-1">
                  <ClockIcon width={12} height={12} /> {et.duration}m
                </span>
              </div>
              <ChevronRight className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>

        <div className="text-center mt-12 text-xs text-muted">Cal.com</div>
      </div>
    </div>
  );
}
