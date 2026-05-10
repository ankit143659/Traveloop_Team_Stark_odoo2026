import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function CreateTrip() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const tripId = await db.trips.add({
        userId,
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: Number(budget) || 0,
      });
      navigate(`/trips/${tripId}/itinerary`);
    } catch (error) {
      console.error("Failed to create trip", error);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm font-medium text-[#AEAEB2] hover:text-white transition-colors uppercase tracking-widest text-[10px]"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Plan a New Trip</CardTitle>
            <CardDescription>Enter the basic details to start building your itinerary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Trip Name</label>
              <Input 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Euro Trip 2024"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Description</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-[#1F1F23] bg-[#0A0A0B] px-3 py-2 text-sm text-[#E4E4E6] placeholder:text-[#636366] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]"
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="A couple of sentences about this trip..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Start Date</label>
                <Input 
                  type="date" 
                  required 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">End Date</label>
                <Input 
                  type="date" 
                  required 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Total Budget Limit (₹)</label>
              <Input 
                type="number" 
                min="0"
                value={budget} 
                onChange={e => setBudget(e.target.value)} 
                placeholder="0.00"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-[#0A0A0B]/50 py-4 rounded-b-2xl border-t border-[#1F1F23] flex justify-end">
            <Button type="submit">Create Trip to Build Itinerary</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
