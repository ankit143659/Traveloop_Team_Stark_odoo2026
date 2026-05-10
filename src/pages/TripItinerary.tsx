import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Trip, type Stop } from "@/src/lib/db";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { searchCities, autoPlanTrip } from "@/src/lib/gemini";
import { MapPin, Search, Plus, Calendar, Sparkles, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { StopActivities } from "./StopActivities";

export default function TripItinerary() {
  const { trip } = useOutletContext<{ trip: Trip }>();
  
  const stops = useLiveQuery(() => 
    db.stops.where("tripId").equals(trip.id!).sortBy("order")
  , [trip.id]);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isAutoPlanning, setIsAutoPlanning] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const results = await searchCities(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAutoPlan = async () => {
    setIsAutoPlanning(true);
    try {
      const plan = await autoPlanTrip(
        trip.name, 
        trip.description, 
        trip.startDate.toISOString(), 
        trip.endDate.toISOString(), 
        trip.budget || 20000
      );
      
      let currentOrder = stops ? stops.length : 0;
      let currentDate = new Date(trip.startDate);

      if (plan.itinerary) {
        for (const stop of plan.itinerary) {
          const stopId = await db.stops.add({
            tripId: trip.id!,
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
            tripId: trip.id!,
            text: item.name,
            category: item.category,
            isPacked: false
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAutoPlanning(false);
    }
  };

  const addStop = async (city: any) => {
    await db.stops.add({
      tripId: trip.id!,
      cityName: city.cityName,
      countryName: city.countryName,
      startDate: new Date(), // Just basic placeholder
      endDate: new Date(),
      order: stops ? stops.length : 0,
    });
    setSearchResults([]);
    setSearchQuery("");
  };

  const deleteStop = async (id: number) => {
    await db.stops.delete(id);
    // Realistically you should also delete activities
    const acts = await db.activities.where("stopId").equals(id).toArray();
    for (const act of acts) {
      await db.activities.delete(act.id!);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Trip Itinerary</h2>
          <p className="text-xs text-[#AEAEB2] mt-1 tracking-widest uppercase">Plan your stops & activities</p>
        </div>
        <Button onClick={handleAutoPlan} disabled={isAutoPlanning} className="shadow-none bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0B]">
          <Sparkles className="w-4 h-4 mr-2" />
          {isAutoPlanning ? "AI is Planning..." : "Auto-Plan My Trip"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {stops?.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-[#1F1F23] bg-[#141417]">
              <MapPin className="mx-auto w-8 h-8 text-[#636366] mb-3" />
              <p className="text-[#AEAEB2] font-medium">No stops added yet.</p>
              <p className="text-xs text-[#636366] mt-1">Search for a city on the right to add to your trip.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {stops?.map((stop, i) => (
                <div key={stop.id} className="relative pl-8">
                  {i !== stops.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-[#1F1F23]" />
                  )}
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-[#0A0A0B] bg-emerald-500 shadow-sm" />
                  
                  <div className="bg-[#141417] rounded-2xl border border-[#1F1F23] p-6 shadow-sm group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{stop.cityName}, <span className="font-normal text-[#AEAEB2]">{stop.countryName}</span></h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[#AEAEB2] bg-[#0A0A0B] px-3 py-1.5 rounded-full border border-[#1F1F23]">
                          <Calendar className="w-3 h-3 text-emerald-500" /> 
                          <span>
                            {stop.startDate ? format(stop.startDate, "MMM d") : "TBD"} - {stop.endDate ? format(stop.endDate, "MMM d") : "TBD"}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteStop(stop.id!)} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-[#636366] hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <StopActivities stop={stop} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="bg-[#141417] rounded-2xl border border-[#1F1F23] p-5 shadow-sm sticky top-4">
             <h3 className="text-[10px] tracking-widest uppercase text-[#AEAEB2] font-semibold mb-4 flex items-center">
               <Search className="w-3.5 h-3.5 mr-2 text-[#636366]" /> Discover Cities
             </h3>
             <div className="flex space-x-2">
               <Input 
                 placeholder="Search by vibe, region..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSearch()}
               />
               <Button onClick={handleSearch} disabled={isSearching} variant="outline">
                 {isSearching ? "..." : "Go"}
               </Button>
             </div>

             <div className="mt-6 space-y-4">
                {searchResults.map((city, idx) => (
                  <div key={idx} className="border border-[#1F1F23] rounded-lg p-3 hover:bg-[#1C1C1E] transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="pr-4">
                        <p className="font-medium text-sm text-white">{city.cityName}</p>
                        <p className="text-xs text-[#AEAEB2]">{city.countryName}</p>
                      </div>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => addStop(city)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-[#636366] mt-3 line-clamp-2">{city.description}</p>
                    <div className="mt-3 flex space-x-2">
                      <span className="text-[9px] uppercase tracking-widest font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{city.costIndex} Cost</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
