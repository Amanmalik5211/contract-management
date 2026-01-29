"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, FileText, Pencil } from "lucide-react";
import type { Blueprint } from "@/types/blueprint";
import { formatDistanceToNow } from "date-fns";

interface BlueprintCardProps {
  blueprint: Blueprint;
  onClick?: () => void;
  usageCount?: number; 
  version?: string;     
}

export function BlueprintCard({ 
  blueprint, 
  onClick,
   
}: BlueprintCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/blueprints/${blueprint.id}`);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/blueprints/${blueprint.id}?edit=true`);
  };
  
  return (
    <Card 
      className="group overflow-hidden hover:shadow-md transition-all cursor-pointer border-border/60 hover:border-primary/50"
      onClick={handleCardClick}
    >
      <div className="aspect-[1.6] bg-muted/30 p-6 flex flex-col gap-3 justify-center items-center border-b border-border/40 group-hover:bg-muted/50 transition-colors">
         <div className="w-1/3 h-2.5 bg-muted-foreground/10 rounded-full self-start mb-2" />
         <div className="w-full h-2 bg-muted-foreground/10 rounded-full" />
         <div className="w-full h-2 bg-muted-foreground/10 rounded-full" />
         <div className="w-3/4 h-2 bg-muted-foreground/10 rounded-full self-start" />
      </div>

      <CardContent className="p-4 pt-5 pb-2">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors flex-1 min-w-0 pr-1">
            {blueprint.name}
          </h3>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-0 text-[10px] px-1.5 h-5 shrink-0">
            Active
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 text-muted-foreground text-xs flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Button 
               variant="outline" 
               size="sm" 
               className="h-6 text-[10px] px-2 gap-1"
               onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/contracts/new?blueprintId=${blueprint.id}`);
               }}
            >
               Create Contract
            </Button>
  
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center" title={`Created ${formatDistanceToNow(new Date(blueprint.createdAt))} ago`}>
               <Clock className="h-3 w-3 hover:text-foreground transition-colors" />
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={handleEditClick}
                title="Edit Blueprint"
            >
                <Pencil className="h-3.5 w-3.5" />
            </Button>
         </div>
      </CardFooter>
    </Card>
  );
}
