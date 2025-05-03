"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import PredictionsList from "@/components/PredictionsList";
import { authClient } from "@/lib/auth-client";
import LeagueFilter from "@/components/LeagueFilter";
import CalendarBox from "@/components/CalendarBox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PredictionsPage() {
    const [date, setDate] = useState<Date>(new Date());
    const { data, isPending } = authClient.useSession();
    const [selectedLeague, setSelectedLeague] = useState<string[]>(["all"]);
    const [showAiPredictions, setShowAiPredictions] = useState<boolean>(false);
    const [open, setOpen] = useState(false);

    if (isPending) {
        return <Loader2 className="animate-spin mx-auto my-10" />;
    }

    if (!data) {
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
            <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700">
                Predictions
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <CalendarBox date={date} setDate={setDate} />

                <LeagueFilter
                    open={open}
                    setOpen={setOpen}
                    selectedLeague={selectedLeague}
                    setSelectedLeague={setSelectedLeague}
                />

                <div>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-[240px] justify-start text-left",
                            "border-gray-500",
                            "flex items-center h-9"
                        )}
                        onClick={() => setShowAiPredictions(!showAiPredictions)}
                    >
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="aiPredictions"
                                checked={showAiPredictions}
                                onChange={(e) =>
                                    setShowAiPredictions(e.target.checked)
                                }
                                className="mr-2 h-4 w-4 rounded"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <span>AI Predictions Only</span>
                        </div>
                    </Button>
                </div>
            </div>
            <PredictionsList
                date={date}
                leagueIds={
                    selectedLeague.includes("all")
                        ? undefined
                        : selectedLeague.map((id) => Number.parseInt(id))
                }
                onlyAiPredictions={showAiPredictions}
            />
        </div>
    );
}
