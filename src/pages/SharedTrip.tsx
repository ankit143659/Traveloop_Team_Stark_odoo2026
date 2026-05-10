import { useParams, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { format } from "date-fns";
import { Plane, Calendar, MapPin, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";

export default function SharedTrip() {
  const { id } = useParams<{ id: string }>();
  
  const trip = useLiveQuery(() => db.trips.get(Number(id)));
  const stops = useLiveQuery(() => db.stops.where("tripId").equals(Number(id)).toArray());

  if (trip === undefined) return <div className="p-12 text-center text-white">Loading public itinerary...</div>;
  if (trip === null) return <div className="p-12 text-center text-white">Trip not found.</div>;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E6] pb-24">
      {/* Header */}
      <div className="relative h-64 md:h-80 w-full bg-[#141417]">
        {trip.coverPhoto ? (
          <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center border-b border-[#1F1F23]">
            <Plane className="w-16 h-16 text-[#2C2C2E]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-5xl mx-auto">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-emerald-400 font-mono uppercase tracking-widest text-xs mb-2">Public Itinerary</p>
              <h1 className="text-4xl md:text-5xl font-serif italic text-white leading-tight">{trip.name}</h1>
              <div className="flex items-center text-[#AEAEB2] mt-4 font-mono text-sm uppercase tracking-widest">
                <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                {format(trip.startDate, "MMM d, yyyy")} - {format(trip.endDate, "MMM d, yyyy")}
              </div>
            </div>
            <Button variant="outline" className="hidden md:flex" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 pt-12">
        <p className="text-lg text-[#AEAEB2] leading-relaxed max-w-3xl mb-12">{trip.description}</p>
        
        {stops && stops.length > 0 ? (
          <div className="space-y-8">
            <div className="flex items-center space-x-3 pb-4 border-b border-[#1F1F23]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
              <h2 className="text-sm font-medium text-white uppercase tracking-widest">Journey Destinations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stops.map((stop) => (
                <Card key={stop.id} className="bg-[#141417] border-[#1F1F23]">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="p-2 bg-[#0A0A0B] rounded-lg mr-4 border border-[#1F1F23]">
                        <MapPin className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{stop.cityName}</h3>
                        <p className="text-sm text-[#AEAEB2]">{stop.countryName}</p>
                        {stop.startDate && stop.endDate && (
                          <div className="text-xs text-[#636366] mt-3 font-mono">
                            {format(stop.startDate, "MMM d")} - {format(stop.endDate, "MMM d")}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-[#1F1F23] bg-[#141417]">
             <p className="text-[#AEAEB2]">No stops planned for this trip yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
