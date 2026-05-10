import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Users, PlaneTakeoff, MapPin, Activity } from "lucide-react";

export default function AdminDashboard() {
  const users = useLiveQuery(() => db.users.toArray());
  const trips = useLiveQuery(() => db.trips.toArray());
  const stops = useLiveQuery(() => db.stops.toArray());
  const activities = useLiveQuery(() => db.activities.toArray());

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
       <header className="pb-8 border-b border-[#1F1F23]">
         <h2 className="text-xs uppercase tracking-widest text-[#636366] font-semibold">Platform Analytics</h2>
         <h1 className="text-3xl font-light font-serif italic text-white mt-2">
           Admin Dashboard
         </h1>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="bg-[#141417] border border-[#1F1F23]">
           <CardContent className="p-6 flex items-center space-x-4">
             <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
               <Users className="w-6 h-6" />
             </div>
             <div>
               <p className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Total Users</p>
               <h3 className="text-2xl font-semibold text-white">{users?.length || 0}</h3>
             </div>
           </CardContent>
         </Card>
         <Card className="bg-[#141417] border border-[#1F1F23]">
           <CardContent className="p-6 flex items-center space-x-4">
             <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
               <PlaneTakeoff className="w-6 h-6" />
             </div>
             <div>
               <p className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Total Trips</p>
               <h3 className="text-2xl font-semibold text-white">{trips?.length || 0}</h3>
             </div>
           </CardContent>
         </Card>
         <Card className="bg-[#141417] border border-[#1F1F23]">
           <CardContent className="p-6 flex items-center space-x-4">
             <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
               <MapPin className="w-6 h-6" />
             </div>
             <div>
               <p className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Cities Planned</p>
               <h3 className="text-2xl font-semibold text-white">{stops?.length || 0}</h3>
             </div>
           </CardContent>
         </Card>
         <Card className="bg-[#141417] border border-[#1F1F23]">
           <CardContent className="p-6 flex items-center space-x-4">
             <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
               <Activity className="w-6 h-6" />
             </div>
             <div>
               <p className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Activities Saved</p>
               <h3 className="text-2xl font-semibold text-white">{activities?.length || 0}</h3>
             </div>
           </CardContent>
         </Card>
       </div>

       <Card className="bg-[#141417] border border-[#1F1F23]">
         <CardHeader>
           <CardTitle className="text-white text-lg">Platform Users</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-[10px] text-[#636366] uppercase bg-[#0A0A0B] border-b border-[#1F1F23]">
                 <tr>
                   <th className="px-6 py-3 font-medium">Name</th>
                   <th className="px-6 py-3 font-medium">Email</th>
                   <th className="px-6 py-3 font-medium">Currency</th>
                 </tr>
               </thead>
               <tbody>
                 {users?.map(u => (
                   <tr key={u.id} className="border-b border-[#1F1F23] text-[#AEAEB2]">
                     <td className="px-6 py-4">{u.name}</td>
                     <td className="px-6 py-4">{u.email}</td>
                     <td className="px-6 py-4">{u.preferences?.currency || 'USD'}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </CardContent>
       </Card>
    </div>
  );
}
