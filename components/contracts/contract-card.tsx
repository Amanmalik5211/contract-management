"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Pencil, FileCheck, FileX, FileClock, ListChecks } from "lucide-react";
import type { Contract } from "@/types/contract";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ContractCardProps {
  contract: Contract;
  onClick?: () => void;
  onStatusClick?: () => void;
}

export function ContractCard({ 
  contract, 
  onClick,
  onStatusClick
}: ContractCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/contracts/${contract.id}`);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/contracts/${contract.id}?edit=true`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed": 
      case "locked": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50";
      case "revoked": return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/50";
      case "created":
      case "approved":
      case "sent": return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200/50";
    }
  };

  const getStatusIcon = (status: string) => {
      switch (status) {
        case "signed": 
        case "locked": return <FileCheck className="h-4 w-4" />;
        case "revoked": return <FileX className="h-4 w-4" />;
        default: return <FileClock className="h-4 w-4" />;
      }
  };
  
  return (
    <Card 
      className="group overflow-hidden hover:shadow-md transition-all cursor-pointer border-border/60 hover:border-primary/50"
      onClick={handleCardClick}
    >
      {/* Placeholder Image Area */}
      <div className="aspect-[1.6] bg-muted/30 p-6 flex flex-col gap-3 justify-center items-center border-b border-border/40 group-hover:bg-muted/50 transition-colors">
         {/* Skeleton-like design matching the image provided */}
         <div className="w-1/3 h-2.5 bg-muted-foreground/10 rounded-full self-start mb-2" />
         <div className="w-full h-2 bg-muted-foreground/10 rounded-full" />
         <div className="w-full h-2 bg-muted-foreground/10 rounded-full" />
         <div className="w-3/4 h-2 bg-muted-foreground/10 rounded-full self-start" />
      </div>

      <CardContent className="p-4 pt-5 pb-2">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="space-y-1 flex-1 min-w-0">
             <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors pr-1">
                {contract.name}
             </h3>
             <p className="text-xs text-muted-foreground line-clamp-1">
                {contract.blueprintName || "No Blueprint"}
             </p>
          </div>
          <Badge variant="secondary" className={cn("border text-[10px] px-1.5 h-5 capitalize shrink-0", getStatusColor(contract.status))}>
            {contract.status}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 text-muted-foreground text-xs flex items-center justify-between">
         <Button 
             variant="outline" 
             size="sm" 
             className="h-7 text-[10px] px-2 gap-1.5 border-dashed hover:border-solid hover:bg-primary/5 active:scale-95 transition-all" 
             onClick={(e) => {
                e.stopPropagation();
                if (onStatusClick) onStatusClick();
             }}
         >
             <ListChecks className="h-3.5 w-3.5" />
             Change Status
         </Button>

         <div className="flex items-center gap-3">
            <div className="flex items-center" title={`Updated ${formatDistanceToNow(new Date(contract.updatedAt))} ago`}>
               <Clock className="h-3 w-3 hover:text-foreground transition-colors" />
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={handleEditClick}
                title="Edit Contract"
            >
                <Pencil className="h-3.5 w-3.5" />
            </Button>
         </div>
      </CardFooter>
    </Card>
  );
}
