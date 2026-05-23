import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import { MenuIcon, XIcon } from "./Icons";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const user = useSelector((s) => s.user.data);

  // Route badalne pe drawer band karo
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Drawer khula ho to body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-bg text-white md:flex">
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0c0c0c] border-b border-border">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md hover:bg-[#1f1f1f] text-white"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <span className="font-semibold text-sm truncate">{user?.name || "Cal.com"}</span>
        <span className="w-9" />
      </header>

      <aside className="hidden md:flex md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0">
        <Sidebar />
      </aside>

      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw]">
            <div className="relative h-full">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-md hover:bg-[#1f1f1f] text-muted"
                aria-label="Close menu"
              >
                <XIcon />
              </button>
              <Sidebar onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </>
      )}

      <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
