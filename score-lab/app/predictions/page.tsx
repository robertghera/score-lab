"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import PredictionsList from "@/components/PredictionsList";
import { authClient } from "@/lib/auth-client";

export default function PredictionsPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { data, isPending } = authClient.useSession();

    if (isPending) {
        // TODO: maybe nicer loader
        return <Loader2 className="animate-spin mx-auto my-10" />;
    }

    if (!data) {
        // TODO
        // make a redirect to login and make toast
        // disable navigation if not auth
        // one of the 2 above
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Predictions</h1>
                <p className="text-gray-400 text-center">
                    You need to be signed in to view predictions.
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Predictions</h1>
            <div className="mb-6">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                "border-gray-700 hover:bg-primary hover:text-input",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? (
                                format(date, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border border-gray-700">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            autoFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <PredictionsList date={date} />
        </div>
    );
}
