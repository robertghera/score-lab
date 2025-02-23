"use client";

import { useEffect, useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface League {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
}

export default function PredictionsPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { data, isPending } = authClient.useSession();
    const [selectedLeague, setSelectedLeague] = useState<string>("all");
    const [leagues, setLeagues] = useState<League[]>([]);

    useEffect(() => {
        fetch(`/api/league`)
            .then((res) => res.json())
            .then((data) => {
                setLeagues(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

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
            <h1 className="text-3xl font-bold mb-6">Predictions</h1>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                "border-gray-500 hover:bg-primary hover:text-input",
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
                    <PopoverContent className="w-auto p-0 border border-gray-500">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            autoFocus
                        />
                    </PopoverContent>
                </Popover>

                <Select
                    value={selectedLeague}
                    onValueChange={setSelectedLeague}
                >
                    <SelectTrigger className="w-[280px] hover:bg-primary hover:text-input border-gray-500 ">
                        <SelectValue placeholder="Select a league" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Leagues</SelectLabel>
                            <SelectItem value="all">All Leagues</SelectItem>
                            {leagues.map((league) => (
                                <SelectItem
                                    key={league.id}
                                    value={league.id.toString()}
                                >
                                    <div className="flex items-center">
                                        <div className="league-logo-wrapper-mini">
                                            <Image
                                                src={
                                                    league.logo ||
                                                    "/placeholder.svg"
                                                }
                                                alt={league.name}
                                                width={15}
                                                height={15}
                                            />
                                        </div>
                                        {league.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <PredictionsList
                date={date}
                leagueId={
                    selectedLeague === "all"
                        ? undefined
                        : Number.parseInt(selectedLeague)
                }
            />
        </div>
    );
}
