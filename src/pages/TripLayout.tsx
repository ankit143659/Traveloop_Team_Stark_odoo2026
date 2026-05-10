import { Outlet, useLocation, useParams, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/src/lib/db";
import { Map, DollarSign, BaggageClaim, BookOpen, Share2, Printer, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { useState } from "react";

export default function TripLayout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const trip = useLiveQuery(() => db.trips.get(Number(id)), [id]);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (trip === undefined) return null;
  if (trip === null) return <div className="p-8">Trip not found</div>;

  const tabs = [
    { name: "Itinerary", href: `/trips/${id}/itinerary`, icon: Map },
    { name: "Budget", href: `/trips/${id}/budget`, icon: DollarSign },
    { name: "Packing", href: `/trips/${id}/packing`, icon: BaggageClaim },
    { name: "Notes", href: `/trips/${id}/notes`, icon: BookOpen },
  ];

  const handleShare = () => {
    const url = `${window.location.origin}/shared/${trip.id}`;
    
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
    document.body.removeChild(textArea);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const stops = await db.stops.where("tripId").equals(trip.id!).sortBy("order");
      const packings = await db.packingItems.where("tripId").equals(trip.id!).toArray();
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      let yPos = 40;
      const margin = 40;
      const pageWidth = pdf.internal.pageSize.getWidth();

      // Title
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text(trip.name, margin, yPos);
      yPos += 30;

      // Description
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const splitDesc = pdf.splitTextToSize(trip.description || '', pageWidth - 2 * margin);
      pdf.text(splitDesc, margin, yPos);
      yPos += (splitDesc.length * 15) + 20;

      // Budget
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Estimated Budget: INR ${trip.budget || 'N/A'}`, margin, yPos);
      yPos += 30;

      // Itinerary
      pdf.setFontSize(18);
      pdf.text("Itinerary", margin, yPos);
      yPos += 20;

      for (const stop of stops) {
        if (yPos > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yPos = 40;
        }

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${stop.cityName}, ${stop.countryName}`, margin, yPos);
        yPos += 20;
        
        const formatDt = (dt: Date) => dt ? new Date(dt).toLocaleDateString() : 'TBD';
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "italic");
        pdf.text(`${formatDt(stop.startDate)} - ${formatDt(stop.endDate)}`, margin, yPos);
        yPos += 15;

        // Activities
        const activities = await db.activities.where("stopId").equals(stop.id!).toArray();
        if (activities.length > 0) {
          for (const act of activities) {
            if (yPos > pdf.internal.pageSize.getHeight() - 40) {
              pdf.addPage();
              yPos = 40;
            }
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "bold");
            pdf.text(`• ${act.name} (INR ${act.cost})`, margin + 10, yPos);
            yPos += 12;

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            const splitActDesc = pdf.splitTextToSize(act.description || '', pageWidth - 2 * margin - 20);
            pdf.text(splitActDesc, margin + 20, yPos);
            yPos += (splitActDesc.length * 12) + 10;
          }
        } else {
             pdf.setFontSize(10);
             pdf.setFont("helvetica", "normal");
             pdf.text(`No activities planned.`, margin + 10, yPos);
             yPos += 15;
        }
        yPos += 10;
      }

      // Packing List
      if (packings.length > 0) {
         if (yPos > pdf.internal.pageSize.getHeight() - 100) {
            pdf.addPage();
            yPos = 40;
         } else {
            yPos += 10;
         }

         pdf.setFontSize(18);
         pdf.setFont("helvetica", "bold");
         pdf.text("Things to Carry", margin, yPos);
         yPos += 20;

         pdf.setFontSize(11);
         pdf.setFont("helvetica", "normal");
         for (const item of packings) {
            if (yPos > pdf.internal.pageSize.getHeight() - 40) {
              pdf.addPage();
              yPos = 40;
            }
            pdf.text(`[ ${item.isPacked ? 'X' : ' '} ] ${item.text} (${item.category})`, margin, yPos);
            yPos += 15;
         }
      }

      pdf.save(`${trip.name.replace(/\s+/g, '-')}-Itinerary.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col" id="pdf-content">
      <div className="bg-[#141417]/50 border-b border-[#1F1F23] px-8 pt-8 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-serif italic text-white">{trip.name}</h1>
            <p className="text-[#AEAEB2] mt-1 text-sm">{trip.description}</p>
          </div>
          <div className="flex space-x-2" data-html2canvas-ignore="true">
            <Button variant="outline" size="sm" onClick={handleShare} className="text-xs uppercase tracking-widest shadow-none">
              {isCopied ? <><Check className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Copied!</> : <><Share2 className="w-3.5 h-3.5 mr-2" /> Share</>}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting} className="text-xs uppercase tracking-widest shadow-none">
              <Printer className="w-3.5 h-3.5 mr-2" /> {isExporting ? "Saving PDF..." : "Print / PDF"}
            </Button>
          </div>
        </div>
        
        <div className="mt-8 flex space-x-6">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.href;
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={cn(
                  "pb-3 text-sm font-medium flex items-center border-b-2 transition-colors uppercase tracking-widest text-[10px]",
                  isActive 
                    ? "border-emerald-500 text-emerald-400" 
                    : "border-transparent text-[#636366] hover:text-[#AEAEB2] hover:border-[#2C2C2E]"
                )}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-8 relative print:p-0 print:overflow-visible">
        <Outlet context={{ trip }} />
      </div>
    </div>
  );
}
