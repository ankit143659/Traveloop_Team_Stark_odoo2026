import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Trip } from "@/src/lib/db";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Plus, Trash2, Box } from "lucide-react";

export default function TripNotes() {
  const { trip } = useOutletContext<{ trip: Trip }>();
  const [noteText, setNoteText] = useState("");
  
  const notes = useLiveQuery(() => 
    db.notes.where("tripId").equals(trip.id!).reverse().sortBy("createdAt")
  , [trip.id]);

  const addNote = async () => {
    if (!noteText.trim()) return;
    await db.notes.add({
      tripId: trip.id!,
      text: noteText,
      createdAt: new Date(),
    });
    setNoteText("");
  };

  const deleteNote = async (id: number) => {
    await db.notes.delete(id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-[#141417] p-6 rounded-2xl border border-[#1F1F23]">
        <h3 className="text-[10px] uppercase tracking-widest text-[#636366] font-semibold mb-4">Add a Note</h3>
        <div className="flex space-x-4">
          <textarea 
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            className="flex-1 min-h-[100px] w-full rounded-md border border-[#1F1F23] bg-[#0A0A0B] px-3 py-2 text-sm text-[#E4E4E6] placeholder:text-[#636366] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]"
            placeholder="Jot down ideas, reservation confirming numbers, important links..."
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={addNote}>Save Note</Button>
        </div>
      </div>

      <div className="space-y-4">
        {notes?.length === 0 ? (
          <div className="text-center py-12 text-[#636366]">
             <Box className="w-6 h-6 mx-auto mb-2 opacity-30" />
             <p className="text-sm font-mono uppercase tracking-widest">Your journal is empty.</p>
          </div>
        ) : (
          notes?.map(note => (
            <div key={note.id} className="bg-[#141417] p-6 rounded-2xl border border-[#1F1F23] group flex justify-between items-start">
              <div className="whitespace-pre-wrap text-[#AEAEB2] text-sm leading-relaxed">{note.text}</div>
              <button 
                onClick={() => deleteNote(note.id!)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 p-2 hover:bg-red-500/10 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
