import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Trip } from "@/src/lib/db";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { suggestPackingList } from "@/src/lib/gemini";
import { Sparkles, Check, Trash2, RotateCcw } from "lucide-react";

export default function TripPacking() {
  const { trip } = useOutletContext<{ trip: Trip }>();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const items = useLiveQuery(() => 
    db.packingItems.where("tripId").equals(trip.id!).toArray()
  , [trip.id]);

  const generateList = async () => {
    setIsGenerating(true);
    try {
      const suggestions = await suggestPackingList(`${trip.name}. ${trip.description}`);
      for (const item of suggestions) {
        await db.packingItems.add({
          tripId: trip.id!,
          text: item.text,
          category: item.category,
          isPacked: false,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleItem = async (id: number, isPacked: boolean) => {
    await db.packingItems.update(id, { isPacked: !isPacked });
  };
  
  const deleteItem = async (id: number) => {
    await db.packingItems.delete(id);
  };

  const resetList = async () => {
    if (!items) return;
    await db.transaction('rw', db.packingItems, async () => {
      for (const item of items) {
         if (item.isPacked) {
           await db.packingItems.update(item.id!, { isPacked: false });
         }
      }
    });
  };

  // Group items by category
  const groupedItems = items?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-[#141417] p-6 rounded-2xl border border-[#1F1F23]">
         <div>
           <h3 className="text-[10px] uppercase tracking-widest text-[#E4E4E6] font-semibold">Smart Checklist</h3>
           <p className="text-sm text-[#AEAEB2] mt-1">Let AI generate a custom packing list based on your trip.</p>
         </div>
         <div className="flex space-x-3">
           {items && items.length > 0 && (
             <Button onClick={resetList} variant="outline" title="Reset all checked items" className="shadow-none hidden sm:flex">
               <RotateCcw className="w-4 h-4 mr-2 text-[#AEAEB2]" />
               Reset
             </Button>
           )}
           <Button onClick={generateList} disabled={isGenerating} variant="outline" className="shadow-none">
             <Sparkles className="w-4 h-4 mr-2 text-emerald-500" />
             {isGenerating ? "Generating..." : "Auto-Generate List"}
           </Button>
         </div>
      </div>

      {items?.length === 0 && !isGenerating && (
         <div className="text-center py-12 text-[#636366]">
            <p className="text-sm font-mono uppercase tracking-widest">Your checklist is empty.</p>
         </div>
      )}

      {groupedItems && Object.entries(groupedItems).map(([category, catItems]) => (
        <div key={category} className="space-y-4">
          <h4 className="font-semibold text-white border-b border-[#1F1F23] pb-2 capitalize tracking-widest text-[10px]">{category}</h4>
          <div className="space-y-2">
            {catItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-[#141417] border border-[#1F1F23] rounded-xl group hover:border-[#2C2C2E] transition-colors">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => toggleItem(item.id!, item.isPacked)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.isPacked ? 'bg-emerald-500 border-emerald-500 text-[#0A0A0B]' : 'border-[#2C2C2E] text-transparent hover:border-emerald-500'}`}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <span className={`text-sm ${item.isPacked ? 'text-[#636366] line-through' : 'text-[#E4E4E6]'}`}>{item.text}</span>
                </div>
                <button onClick={() => deleteItem(item.id!)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
