"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SearchFilter({
  searchTerm,
  onSearchChange,
}: SearchFilterProps) {
  return (
    <div className="flex-1">
      <div className="text-sm font-medium mb-2 text-muted-foreground">
        Search
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by title or content..."
          className="pl-9 h-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
