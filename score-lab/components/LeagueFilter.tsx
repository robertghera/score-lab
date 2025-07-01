import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Check } from "lucide-react";
import { Dispatch, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface League {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
}

interface LeagueFilterProps {
    open: boolean;
    setOpen: Dispatch<React.SetStateAction<boolean>>;
    selectedLeague: string[];
    setSelectedLeague: Dispatch<React.SetStateAction<string[]>>;
    maxWidth?: number;
}

export default function LeagueFilter({
    open,
    setOpen,
    selectedLeague,
    setSelectedLeague,
    maxWidth = 240,
}: LeagueFilterProps) {
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

    const getLeagueName = (id: string) => {
        if (id === "all") return "All Leagues";
        const league = leagues.find((l) => l.id.toString() === id);
        return league?.name || id;
    };

    const toggleLeague = (leagueId: string) => {
        if (leagueId === "all") {
            setSelectedLeague(["all"]);
            return;
        }

        setSelectedLeague((prev) => {
            const withoutAll = prev.filter((id) => id !== "all");

            if (withoutAll.includes(leagueId)) {
                const result = withoutAll.filter((id) => id !== leagueId);
                return result.length === 0 ? ["all"] : result;
            }

            return [...withoutAll, leagueId];
        });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "justify-between border-gray-500",
                        `w-[${maxWidth}px] `
                    )}
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
                                    {selectedLeague.length} leagues selected
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
            <PopoverContent className="w-[260px] p-0">
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
                                        toggleLeague(league.id.toString());
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
    );
}
