import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/src/lib/auth";
import { Plane, Compass, ListTodo, Map, Settings, LogOut, ShieldAlert } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/src/lib/db";

export default function Layout() {
  const { userId, logout } = useAuth();
  const location = useLocation();
  const user = useLiveQuery(() => db.users.get(userId || -1));

  if (!userId) {
    return <Navigate to="/auth" />;
  }

  const navItems = [
    { name: "Dashboard", href: "/", icon: Compass },
    { name: "My Trips", href: "/trips", icon: Map },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  if (user?.isAdmin) {
    navItems.push({ name: "Admin Setup", href: "/admin", icon: ShieldAlert });
  }

  return (
    <div className="flex h-screen bg-[#0A0A0B] text-[#E4E4E6] font-sans">
      <aside className="w-64 border-r border-[#1F1F23] flex flex-col justify-between">
        <div className="w-full">
          <div className="h-20 flex flex-col justify-center px-8 border-b border-[#1F1F23]">
            <div className="flex items-center space-x-2">
              <Plane className="w-5 h-5 text-white" />
              <h1 className="text-2xl tracking-tight font-light font-serif italic text-white">Traveloop</h1>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#636366] mt-1 pl-7">Planning Engine</p>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors",
                  location.pathname === item.href
                    ? "bg-[#141417] text-white font-medium border border-[#1F1F23]"
                    : "text-[#8E8E93] hover:text-white border border-transparent hover:bg-[#141417]/50"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-6 border-t border-[#1F1F23] w-full">
           <button 
             onClick={logout}
             className="flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-[#8E8E93] hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
           </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-[#0A0A0B]">
        <Outlet />
      </main>
    </div>
  );
}
