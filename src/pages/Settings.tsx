import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuth } from "../lib/auth";

export default function Settings() {
  const { userId, logout } = useAuth();
  const user = useLiveQuery(() => db.users.get(userId || -1));
  
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setLanguage(user.preferences?.language || "en");
      setCurrency(user.preferences?.currency || "INR");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    await db.users.update(userId, {
      name,
      preferences: { language, currency }
    });
    alert("Profile updated!");
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    if (confirm("Are you sure? This cannot be undone.")) {
      await db.users.delete(userId);
      // Let auth handle logout which will redirect
      logout();
    }
  };

  if (!user) return null;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
       <header className="pb-8 border-b border-[#1F1F23]">
         <h2 className="text-xs uppercase tracking-widest text-[#636366] font-semibold">Preferences</h2>
         <h1 className="text-3xl font-light font-serif italic text-white mt-2">
           Settings & Profile
         </h1>
       </header>

       <Card className="bg-[#141417] border border-[#1F1F23]">
         <form onSubmit={handleSave}>
           <CardHeader>
             <CardTitle className="text-white">Profile Information</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Name</label>
               <Input value={name} onChange={e => setName(e.target.value)} required />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Email</label>
               <Input value={user.email} disabled />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Currency</label>
                 <select 
                   value={currency} 
                   onChange={e => setCurrency(e.target.value)}
                   className="flex h-10 w-full rounded-md border border-[#1F1F23] bg-[#0A0A0B] px-3 py-2 text-sm text-[#E4E4E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                 >
                   <option value="INR">INR (₹)</option>
                   <option value="USD">USD ($)</option>
                   <option value="EUR">EUR (€)</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Language</label>
                 <select 
                   value={language} 
                   onChange={e => setLanguage(e.target.value)}
                   className="flex h-10 w-full rounded-md border border-[#1F1F23] bg-[#0A0A0B] px-3 py-2 text-sm text-[#E4E4E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                 >
                   <option value="en">English</option>
                   <option value="hi">Hindi</option>
                 </select>
               </div>
             </div>
             <div className="pt-4 flex justify-between items-center border-t border-[#1F1F23] mt-6">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
             </div>
           </CardContent>
         </form>
       </Card>
    </div>
  );
}
