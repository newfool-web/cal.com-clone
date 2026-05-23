import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useToast } from "./Toast";
import {
  LinkIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  GridIcon,
  RouteIcon,
  BoltIcon,
  BarsIcon,
  SearchIcon,
  ChevronDown,
  ExternalIcon,
  CopyIcon,
  GiftIcon,
  SettingsIcon,
} from "./Icons";

const navItems = [
  { to: "/event-types", icon: LinkIcon, label: "Event types" },
  { to: "/bookings", icon: CalendarIcon, label: "Bookings" },
  { to: "/availability", icon: ClockIcon, label: "Availability" },
  { to: "/teams", icon: UsersIcon, label: "Teams" },
  { to: "/apps", icon: GridIcon, label: "Apps", expandable: true },
  { to: "/routing", icon: RouteIcon, label: "Routing" },
  { to: "/workflows", icon: BoltIcon, label: "Workflows" },
  { to: "/insights", icon: BarsIcon, label: "Insights", expandable: true },
];

export default function Sidebar({ onNavigate }) {
  const user = useSelector((s) => s.user.data);
  const toast = useToast();

  const copyLink = () => {
    if (!user) return;
    const url = `${window.location.origin}/${user.username}`;
    navigator.clipboard.writeText(url);
    toast.show("Link Copied!");
  };

  const initial = user?.name?.[0] || "?";

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] border-r border-border px-3 py-4">
      <div className="flex items-center justify-between px-2 py-1">
        <button className="flex items-center gap-2 group min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#1d1d1d] flex items-center justify-center text-sm font-semibold relative shrink-0">
            {initial}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-[#0c0c0c]" />
          </div>
          <span className="text-sm font-medium truncate">{user?.name || "Guest"}</span>
          <ChevronDown width={14} height={14} className="text-muted shrink-0" />
        </button>
        <button className="text-muted hover:text-white p-1.5 rounded-md hover:bg-[#1f1f1f]">
          <SearchIcon />
        </button>
      </div>

      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map(({ to, icon: Icon, label, expandable }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md",
                isActive
                  ? "bg-[#1f1f1f] text-white"
                  : "text-[#cfcfcf] hover:bg-[#171717] hover:text-white",
              ].join(" ")
            }
          >
            <Icon />
            <span className="flex-1">{label}</span>
            {expandable && <ChevronDown width={14} height={14} className="text-muted" />}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 mt-4 text-sm">
        <button
          onClick={() => user && window.open(`/${user.username}`, "_blank")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[#cfcfcf] hover:bg-[#171717] hover:text-white"
        >
          <ExternalIcon />
          View public page
        </button>
        <button
          onClick={copyLink}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[#cfcfcf] hover:bg-[#171717] hover:text-white"
        >
          <CopyIcon />
          Copy public page link
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[#cfcfcf] hover:bg-[#171717] hover:text-white">
          <GiftIcon />
          Refer and earn
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[#cfcfcf] hover:bg-[#171717] hover:text-white">
          <SettingsIcon />
          Settings
        </button>
        <div className="px-3 pt-2 text-[11px] text-muted">© 2026 Cal.com, Inc. v.6.5.7-h-675eb77</div>
      </div>
    </div>
  );
}
