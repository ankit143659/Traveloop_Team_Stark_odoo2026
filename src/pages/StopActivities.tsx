import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Stop, type Activity } from "@/src/lib/db";
import { suggestActivities } from "@/src/lib/gemini";
import { Button } from "@/src/components/ui/button";
import { Sparkles, Plus, Trash2, Tag } from "lucide-react";

export function StopActivities({ stop }: { stop: Stop }) {
  const activities = useLiveQuery(() => 
    db.activities.where("stopId").equals(stop.id!).toArray()
  , [stop.id]);

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleSuggest = async () => {
    setIsSuggesting(true);
    try {
      const results = await suggestActivities(stop.cityName, "all");
      setSuggestions(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const addActivity = async (sugg: any) => {
    await db.activities.add({
      stopId: stop.id!,
      name: sugg.name,
      description: sugg.description,
      cost: sugg.estimatedCost,
      type: sugg.type,
      date: new Date() // just default to now for demo purposes
    });
    // Remove from suggestions array
    setSuggestions(prev => prev.filter(s => s.name !== sugg.name));
  };

  const deleteActivity = async (id: number) => {
    await db.activities.delete(id);
  };

  return (
    <div className="mt-4 pt-4 border-t border-[#1F1F23]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] uppercase tracking-widest text-[#AEAEB2] font-semibold">Planned Activities</h4>
        <Button size="sm" variant="secondary" onClick={handleSuggest} disabled={isSuggesting} className="h-7 text-[10px] uppercase tracking-widest px-2">
          <Sparkles className="w-3 h-3 mr-1" />
          {isSuggesting ? "..." : "AI Suggest"}
        </Button>
      </div>

      {activities?.length === 0 && suggestions.length === 0 ? (
        <div className="bg-[#0A0A0B] rounded-lg p-6 border border-[#1F1F23] flex flex-col items-center justify-center text-center">
           <span className="text-sm text-[#636366]">No activities planned for {stop.cityName}.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {activities?.map(act => (
            <div key={act.id} className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg p-3 group flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-white font-medium">{act.name}</p>
                  <span className="px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest bg-[#1F1F23] text-[#AEAEB2]">{act.type}</span>
                </div>
                <p className="text-xs text-[#636366] mt-1">{act.description}</p>
              </div>
              <div className="flex flex-col items-end pl-4">
                <span className="text-xs text-white font-serif italic mb-2">₹{act.cost}</span>
                <button onClick={() => deleteActivity(act.id!)} className="text-[#636366] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-6">
          <h4 className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold mb-3 flex items-center">
            <Sparkles className="w-3 h-3 mr-1" /> Suggestions
          </h4>
          <div className="space-y-3">
            {suggestions.map((sugg, idx) => (
              <div key={idx} className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 group flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-emerald-100 font-medium">{sugg.name}</p>
                    <span className="px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest bg-emerald-500/20 text-emerald-400">{sugg.type}</span>
                  </div>
                  <p className="text-xs text-emerald-200/50 mt-1">{sugg.description}</p>
                </div>
                <div className="flex flex-col items-end pl-4">
                  <span className="text-xs text-emerald-400 font-serif italic mb-2">₹{sugg.estimatedCost}</span>
                  <Button size="icon" className="h-6 w-6 bg-emerald-500 hover:bg-emerald-400 text-black" onClick={() => addActivity(sugg)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
