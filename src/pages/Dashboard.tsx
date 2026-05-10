import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { format } from "date-fns";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Plus, Compass, Calendar, MapPin, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/src/components/ui/input";
import { autoPlanTrip } from "@/src/lib/gemini";

export default function Dashboard() {
  const { userId } = useAuth();
  const userName = useLiveQuery(() => db.users.get(userId!).then(u => u?.name));
  const recentTrips = useLiveQuery(() => 
    db.trips.where("userId").equals(userId!).reverse().limit(3).toArray()
  );
  
  const navigate = useNavigate();
  const [showAiModal, setShowAiModal] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<number | null>(null);
  
  const [aiForm, setAiForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: ""
  });

  const handleAiPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiForm.destination || !aiForm.startDate || !aiForm.endDate || !aiForm.budget) return;
    
    setIsPlanning(true);
    try {
      const tripName = `Trip to ${aiForm.destination}`;
      const tripDesc = `An AI-generated itinerary for ${aiForm.destination}.`;
      
      const tripId = await db.trips.add({
        userId: userId!,
        name: tripName,
        description: tripDesc,
        startDate: new Date(aiForm.startDate),
        endDate: new Date(aiForm.endDate),
        budget: Number(aiForm.budget),
      });

      const plan = await autoPlanTrip(
        tripName, 
        tripDesc, 
        new Date(aiForm.startDate).toISOString(), 
        new Date(aiForm.endDate).toISOString(), 
        Number(aiForm.budget)
      );
      
      let currentOrder = 0;
      let currentDate = new Date(aiForm.startDate);

      if (plan.itinerary) {
        for (const stop of plan.itinerary) {
          const stopId = await db.stops.add({
            tripId: tripId as number,
            cityName: stop.cityName,
            countryName: stop.countryName,
            startDate: currentDate,
            endDate: new Date(currentDate.getTime() + (stop.daysToStay * 24 * 60 * 60 * 1000)),
            order: currentOrder++,
          });

          currentDate = new Date(currentDate.getTime() + (stop.daysToStay * 24 * 60 * 60 * 1000));
          
          if (stop.activities) {
            for (const act of stop.activities) {
              await db.activities.add({
                stopId: stopId as number,
                name: act.name,
                description: act.description,
                cost: act.estimatedCost,
                type: act.type as any,
                date: new Date()
              });
            }
          }
        }
      }

      if (plan.packingList) {
        for (const item of plan.packingList) {
          await db.packingItems.add({
            tripId: tripId as number,
            text: item.name,
            category: item.category,
            isPacked: false
          });
        }
      }
      
      setShowAiModal(false);
      navigate(`/trips/${tripId}/itinerary`);
    } catch (error) {
      console.error(error);
      alert("Failed to auto-plan trip.");
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 relative">
      <header className="flex justify-between items-end pb-8 border-b border-[#1F1F23]">
        <div>
           <h2 className="text-xs uppercase tracking-widest text-[#636366] font-semibold">User Dashboard</h2>
           <h1 className="text-3xl font-light font-serif italic text-white mt-2">
             Welcome back, {userName?.split(' ')[0] || 'Traveler'}
           </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowAiModal(true)} className="shadow-none group border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10">
            <Sparkles className="w-4 h-4 mr-2" /> Plan with AI
          </Button>
          <Button asChild>
            <Link to="/trips/new">
              <Plus className="w-4 h-4 mr-2"/> Plan New Trip
            </Link>
          </Button>
        </div>
      </header>

      {/* AI Modal Overlay */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A0A0B] border border-[#1F1F23] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6"
            >
               <div>
                 <h2 className="text-xl font-bold text-white flex items-center">
                   <Sparkles className="w-5 h-5 mr-2 text-emerald-500" /> Auto-Plan Trip
                 </h2>
                 <p className="text-sm text-[#AEAEB2] mt-1">Let AI craft the perfect itinerary for you.</p>
               </div>

               <form onSubmit={handleAiPlan} className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Destination State/City</label>
                   <Input required placeholder="e.g. Kerala, India" value={aiForm.destination} onChange={e => setAiForm({...aiForm, destination: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Start Date</label>
                     <Input required type="date" value={aiForm.startDate} onChange={e => setAiForm({...aiForm, startDate: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">End Date</label>
                     <Input required type="date" value={aiForm.endDate} min={aiForm.startDate} onChange={e => setAiForm({...aiForm, endDate: e.target.value})} />
                   </div>
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Budget (₹)</label>
                   <Input required type="number" min="0" placeholder="e.g. 20000" value={aiForm.budget} onChange={e => setAiForm({...aiForm, budget: e.target.value})} />
                 </div>
                 
                 <div className="flex gap-3 pt-4">
                   <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAiModal(false)} disabled={isPlanning}>Cancel</Button>
                   <Button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black" disabled={isPlanning}>
                     {isPlanning ? "Planning..." : "Generate Itinerary"}
                   </Button>
                 </div>
               </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="space-y-6">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center space-x-3">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
             <h2 className="text-sm font-medium text-white">Upcoming Trips</h2>
          </div>
        </div>
        
        {recentTrips === undefined ? (
          <div className="animate-pulse flex space-x-4">
             <div className="h-48 bg-[#141417] border border-[#1F1F23] rounded-2xl w-1/3"></div>
             <div className="h-48 bg-[#141417] border border-[#1F1F23] rounded-2xl w-1/3"></div>
          </div>
        ) : recentTrips.length === 0 ? (
          <div className="bg-[#141417] border hover:border-[#2C2C2E] transition-colors border-dashed border-[#1F1F23] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#0A0A0B] border border-[#1F1F23] rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-[#636366]" />
            </div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-2">No trips planned yet</h3>
            <p className="text-[#AEAEB2] mb-6 max-w-sm text-sm">Start visualizing your journey, setting budgets, and organizing daily itineraries.</p>
            <Button asChild variant="outline">
              <Link to="/trips/new">Plan Your First Trip</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTrips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div onClick={() => navigate(`/trips/${trip.id}/itinerary`)}>
                  <Card className="h-full hover:border-[#2C2C2E] transition-colors group relative cursor-pointer">
                    <button 
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         setTripToDelete(trip.id!);
                       }}
                       className="absolute top-2 right-2 bg-[#0A0A0B]/80 hover:bg-red-500/10 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 text-[#AEAEB2] z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {trip.coverPhoto ? (
                       <div className="h-32 w-full bg-[#0A0A0B] rounded-t-2xl overflow-hidden relative border-b border-[#1F1F23]">
                         <img src={trip.coverPhoto} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" alt="" />
                       </div>
                    ) : (
                       <div className="h-32 w-full bg-[#0A0A0B] rounded-t-2xl flex items-center justify-center overflow-hidden border-b border-[#1F1F23]">
                         <MapPin className="w-8 h-8 text-[#2C2C2E]" />
                       </div>
                    )}
                    <CardHeader className="pb-3 pt-5">
                      <CardTitle className="text-white text-lg font-medium">{trip.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1 text-xs text-[#AEAEB2]">{trip.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="text-xs text-[#636366] font-mono flex items-center pt-0 pb-5 uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                      {format(trip.startDate, "MMM d")} - {format(trip.endDate, "MMM d, yyyy")}
                    </CardFooter>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Suggested generic section for hackathon fullness */}
      <section className="space-y-6 pt-6 border-t border-[#1F1F23]">
        <div className="flex items-center space-x-3 pb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
          <h2 className="text-sm font-medium text-white">Recommended Destinations</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Goa, India", "Jaipur, Rajasthan", "Manali, HP", "Munnar, Kerala"].map((dest) => (
            <div key={dest} className="relative h-24 rounded-2xl overflow-hidden group cursor-pointer bg-[#141417] border border-[#1F1F23] hover:border-[#2C2C2E] transition-colors">
               <div className="absolute inset-0 bg-transparent transition-colors z-10 flex items-center justify-center">
                 <span className="text-[#AEAEB2] group-hover:text-white font-medium text-xs tracking-widest uppercase transition-colors">{dest}</span>
               </div>
            </div>
          ))}
        </div>
      </section>

      {tripToDelete !== null && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-6">
             <div>
               <h2 className="text-xl font-bold text-white">Delete Trip</h2>
               <p className="text-sm text-[#AEAEB2] mt-2">Are you sure you want to delete this trip? This action cannot be undone.</p>
             </div>
             
             <div className="flex gap-3 pt-2">
               <Button type="button" variant="outline" className="flex-1" onClick={() => setTripToDelete(null)}>Cancel</Button>
               <Button type="button" className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 shadow-none" onClick={async () => {
                 if (tripToDelete !== null) {
                   await db.trips.delete(tripToDelete);
                   setTripToDelete(null);
                 }
               }}>Delete</Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
