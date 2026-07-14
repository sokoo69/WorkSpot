"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { toast } from "sonner";

export function CsvExport({ data, filename }: { data: any[]; filename: string }) {
  
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => `"${row[h] || ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </Button>
  );
}
