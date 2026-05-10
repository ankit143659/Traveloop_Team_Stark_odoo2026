import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Trip } from "@/src/lib/db";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function TripBudget() {
  const { trip } = useOutletContext<{ trip: Trip }>();
  
  const stops = useLiveQuery(() => db.stops.where("tripId").equals(trip.id!).toArray(), [trip.id]);
  
  // Get all activities for these stops
  const activities = useLiveQuery(async () => {
    if (!stops || stops.length === 0) return [];
    const stopIds = stops.map(s => s.id!);
    return await db.activities.where("stopId").anyOf(stopIds).toArray();
  }, [stops]);
  
  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6366F1'];
  
  const chartData = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [];
    }

    const costsByType: Record<string, number> = {};
    activities.forEach(act => {
      const type = act.type || 'Other';
      costsByType[type] = (costsByType[type] || 0) + act.cost;
    });

    return Object.entries(costsByType).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [activities]);

  const totalSpent = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-[#141417] p-6 rounded-2xl border border-[#1F1F23]">
          <h3 className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Total Budget</h3>
          <p className="text-3xl font-light font-serif italic mt-2 text-white">₹{trip.budget || 0}</p>
        </div>
        <div className="col-span-1 bg-[#141417] p-6 rounded-2xl border border-[#1F1F23]">
          <h3 className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Estimated Total Spent</h3>
          <p className="text-3xl font-light font-serif italic mt-2 text-white">₹{totalSpent}</p>
        </div>
        <div className="col-span-1 bg-[#141417] p-6 rounded-2xl border border-[#1F1F23]">
          <h3 className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold">Remaining</h3>
          <p className={`text-3xl font-light font-serif italic mt-2 ${(trip.budget || 0) - totalSpent < 0 ? "text-red-400" : "text-emerald-400"}`}>
            ₹{(trip.budget || 0) - totalSpent}
          </p>
        </div>
      </div>

      <div className="bg-[#141417] p-6 rounded-2xl border border-[#1F1F23]">
        <h3 className="text-[10px] uppercase tracking-widest text-[#AEAEB2] font-semibold mb-6">Cost Breakdown</h3>
        <div className="h-64 w-full">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#AEAEB2] text-sm italic">
              No expenses added yet. Auto-plan your trip to see the breakdown.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
