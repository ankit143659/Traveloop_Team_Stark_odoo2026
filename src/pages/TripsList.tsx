import { useLiveQuery } from "dexie-react-hooks";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { format } from "date-fns";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Plus, Compass, Calendar, MapPin, Trash2 } from "lucide-react";
import { motion } from "motion/react";

export default function TripsList() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [tripToDelete, setTripToDelete] = useState<number | null>(null);
  const trips = useLiveQuery(() => 
    db.trips.where("userId").equals(userId!).reverse().toArray()
  );

  const deleteTrip = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setTripToDelete(id);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex justify-between items-end pb-8 border-b border-[#1F1F23]">
        <div>
           <h2 className="text-xs uppercase tracking-widest text-[#636366] font-semibold">Trips DB</h2>
           <h1 className="text-3xl font-light font-serif italic text-white mt-2">
             My Trips
           </h1>
        </div>
        <Button asChild>
          <Link to="/trips/new">
            <Plus className="w-4 h-4 mr-2"/> Plan New Trip
          </Link>
        </Button>
      </header>

      <section>
        {trips === undefined ? (
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="h-48 bg-[#141417] border border-[#1F1F23] rounded-2xl"></div>
             <div className="h-48 bg-[#141417] border border-[#1F1F23] rounded-2xl"></div>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-[#141417] border hover:border-[#2C2C2E] transition-colors border-dashed border-[#1F1F23] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#0A0A0B] border border-[#1F1F23] rounded-full flex items-center justify-center mb-4">
              <Compass className="w-8 h-8 text-[#636366]" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white mb-2">No trips planned yet</h3>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/trips/new">Plan Your First Trip</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div onClick={() => navigate(`/trips/${trip.id}/itinerary`)}>
                  <Card className="h-full hover:border-[#2C2C2E] transition-colors group relative cursor-pointer">
                    <button 
                       onClick={(e) => deleteTrip(e, trip.id!)}
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
                         <MapPin className="w-8 h-8 text-[#2C2C2E] group-hover:scale-110 transition-transform duration-500" />
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
      
      {tripToDelete !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
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
