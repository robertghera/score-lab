"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Check, Loader2 } from "lucide-react";
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
import Image from "next/image";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

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
    const [selectedLeague, setSelectedLeague] = useState<string[]>(["all"]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [open, setOpen] = useState(false);

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

    const toggleLeague = (leagueId: string) => {
        if (leagueId === "all") {
            setSelectedLeague(["all"]);
            return;
        }

        setSelectedLeague((prev) => {
            // If "all" is currently selected, remove it
            const withoutAll = prev.filter((id) => id !== "all");

            // If this league is already selected, remove it
            if (withoutAll.includes(leagueId)) {
                const result = withoutAll.filter((id) => id !== leagueId);
                // If nothing is selected, default to "all"
                return result.length === 0 ? ["all"] : result;
            }

            // Otherwise, add this league
            return [...withoutAll, leagueId];
        });
    };

    const getLeagueName = (id: string) => {
        if (id === "all") return "All Leagues";
        const league = leagues.find((l) => l.id.toString() === id);
        return league?.name || id;
    };

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

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full sm:w-[280px] justify-between border-gray-500"
                        >
                            {selectedLeague.includes("all") ? (
                                <span>All Leagues</span>
                            ) : (
                                <div className="flex flex-wrap gap-1 max-w-[220px] overflow-hidden">
                                    {selectedLeague.length > 1 ? (
                                        <Badge
                                            variant="secondary"
                                            className="rounded-sm"
                                        >
                                            {selectedLeague.length} leagues
                                            selected
                                        </Badge>
                                    ) : (
                                        selectedLeague.map((id) => (
                                            <Badge
                                                key={id}
                                                variant="secondary"
                                                className="rounded-sm"
                                            >
                                                {getLeagueName(id)}
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0">
                        <Command>
                            <CommandInput placeholder="Search leagues..." />
                            <CommandList>
                                <CommandEmpty>No league found.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => {
                                            setSelectedLeague(["all"]);
                                            setOpen(false);
                                        }}
                                        className="flex items-center justify-between"
                                    >
                                        <span>All Leagues</span>
                                        {selectedLeague.includes("all") && (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </CommandItem>
                                    {leagues.map((league) => (
                                        <CommandItem
                                            key={league.id}
                                            onSelect={() => {
                                                toggleLeague(
                                                    league.id.toString()
                                                );
                                            }}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center">
                                                <div className="league-logo-wrapper-mini mr-2 flex items-center justify-center w-5 h-5">
                                                    <Image
                                                        src={
                                                            league.logo ||
                                                            "/placeholder.svg"
                                                        }
                                                        alt={league.name}
                                                        width={15}
                                                        height={15}
                                                        className="object-contain"
                                                    />
                                                </div>
                                                <span>{league.name}</span>
                                            </div>
                                            {selectedLeague.includes(
                                                league.id.toString()
                                            ) && <Check className="h-4 w-4" />}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <PredictionsList
                date={date}
                leagueIds={
                    selectedLeague.includes("all")
                        ? undefined
                        : selectedLeague.map((id) => Number.parseInt(id))
                }
            />
        </div>
    );
}
