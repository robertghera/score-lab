"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Loader2, MapPin, User } from "lucide-react";

interface GameData {
    fixture: {
        id: number;
        referee: string;
        date: string;
        venue: {
            name: string;
            city: string;
        };
        status: {
            long: string;
            short: string;
            elapsed: number | null;
        };
    };
    league: {
        name: string;
        logo: string;
        round: string;
    };
    teams: {
        home: {
            name: string;
            logo: string;
        };
        away: {
            name: string;
            logo: string;
        };
    };
    statistics: [
        {
            team: {
                id: number;
                name: string;
            };
            statistics: {
                type: string;
                value: string;
            }[];
        },
        {
            team: {
                id: number;
                name: string;
            };
            statistics: {
                type: string;
                value: string;
            }[];
        }
    ];
}

// Update the statistics section to use the new layout
const statisticsToShow = [
    "Ball Possession",
    "Total Shots",
    "Shots on Goal",
    "Shots off Goal",
    "Shots insidebox",
    "Shots outsidebox",
    "Corner Kicks",
    "Offsides",
    "Fouls",
    "Yellow Cards",
    "Red Cards",
    "Goalkeeper Saves",
    "Total passes",
    "Passes accurate",
    "Passes %",
    "expected_goals",
];

export default function MatchPage() {
    const { id } = useParams();
    const [gameData, setGameData] = useState<GameData | null>(null);

    useEffect(() => {
        fetch(`/api/match?id=${id}`)
            .then((res) => res.json())
            .then((data) => {
                setGameData(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [id]);

    if (!gameData) {
        return <Loader2 className="animate-spin mx-auto my-10" />;
    }

    const isLive =
        gameData.fixture.status.short === "1H" ||
        gameData.fixture.status.short === "2H" ||
        gameData.fixture.status.short === "HT";

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="mb-8 overflow-hidden bg-card">
                <div className="relative">
                    {isLive && (
                        <div className="absolute top-4 right-4 flex items-center">
                            <span className="animate-pulse inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            <span className="text-red-500 text-sm font-medium">
                                LIVE
                            </span>
                        </div>
                    )}
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-center mb-8">
                            {gameData.teams.home.name} vs{" "}
                            {gameData.teams.away.name}
                        </h1>

                        <div className="flex justify-between items-center mb-12">
                            <div className="text-center flex-1">
                                <div className="w-20 h-20 mx-auto mb-4 relative">
                                    <Image
                                        src={
                                            gameData.teams.home.logo ||
                                            "/placeholder.svg"
                                        }
                                        alt={gameData.teams.home.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <h2 className="text-xl font-semibold">
                                    {gameData.teams.home.name}
                                </h2>
                            </div>

                            <div className="text-4xl font-bold mx-8">VS</div>

                            <div className="text-center flex-1">
                                <div className="w-20 h-20 mx-auto mb-4 relative">
                                    <Image
                                        src={
                                            gameData.teams.away.logo ||
                                            "/placeholder.svg"
                                        }
                                        alt={gameData.teams.away.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <h2 className="text-xl font-semibold">
                                    {gameData.teams.away.name}
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <Calendar className="w-5 h-5 mr-3" />
                                <span>
                                    {format(
                                        new Date(gameData.fixture.date),
                                        "MMMM d, yyyy"
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 mr-3" />
                                <span>
                                    {format(
                                        new Date(gameData.fixture.date),
                                        "HH:mm 'UTC'"
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-5 h-5 mr-3" />
                                <span>
                                    {gameData.fixture.venue.name},{" "}
                                    {gameData.fixture.venue.city}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <User className="w-5 h-5 mr-3" />
                                <span>Referee: {gameData.fixture.referee}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-center space-x-4">
                            <div className="league-logo-wrapper">
                                <Image
                                    src={
                                        gameData.league.logo ||
                                        "/placeholder.svg"
                                    }
                                    alt={gameData.league.name}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-sm">
                                {gameData.league.name} - {gameData.league.round}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {gameData?.statistics !== undefined && (
                <Card className="mb-8 bg-card">
                    <CardContent className="pt-6">
                        <h3 className="text-xl font-bold mb-6">
                            Match Statistics
                        </h3>
                        <div className="space-y-4">
                            {statisticsToShow.map((type) => {
                                // TODO FIND A NICER WAY TO DO THIS
                                const homeStat =
                                    gameData.statistics[0].statistics.find(
                                        (stat) => stat.type === type
                                    );
                                const awayStat =
                                    gameData.statistics[1].statistics.find(
                                        (stat) => stat.type === type
                                    );

                                // Handle percentage stats differently
                                if (
                                    type === "Ball Possession" ||
                                    type === "Passes %"
                                ) {
                                    const homeValue = Number.parseInt(
                                        homeStat?.value?.toString() || "0"
                                    );
                                    const awayValue = Number.parseInt(
                                        awayStat?.value?.toString() || "0"
                                    );

                                    return (
                                        <div key={type} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>
                                                    {homeStat?.value || "0%"}
                                                </span>
                                                <span className="font-medium">
                                                    {type}
                                                </span>
                                                <span>
                                                    {awayStat?.value || "0%"}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="h-2 w-full text-foreground rounded-l overflow-hidden flex justify-end">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{
                                                            width: `${homeValue}%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="h-2 w-full text-foregroundrounded-r overflow-hidden flex justify-start">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{
                                                            width: `${awayValue}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                // Handle numeric stats
                                const homeValue = Number(homeStat?.value || 0);
                                const awayValue = Number(awayStat?.value || 0);
                                const total = homeValue + awayValue;
                                const homePercentage =
                                    total > 0 ? (homeValue / total) * 100 : 0;
                                const awayPercentage =
                                    total > 0 ? (awayValue / total) * 100 : 0;

                                if (type === "expected_goals") {
                                    type = "Expected Goals";
                                }

                                return (
                                    <div key={type} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>{homeValue}</span>
                                            <span className="font-medium">
                                                {type}
                                            </span>
                                            <span>{awayValue}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="h-2 w-full text-foreground rounded-l overflow-hidden flex justify-end">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{
                                                        width: `${homePercentage}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="h-2 w-full text-foreground rounded-r overflow-hidden flex justify-start">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{
                                                        width: `${awayPercentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="mb-8 bg-card">
                <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-6">AI Predictions</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                                {gameData.teams.home.name} Win
                            </span>
                            <div className="flex items-center">
                                <span className="text-sm font-bold mr-2">
                                    45%
                                </span>
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500"
                                        style={{ width: "45%" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Draw</span>
                            <div className="flex items-center">
                                <span className="text-sm font-bold mr-2">
                                    30%
                                </span>
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500"
                                        style={{ width: "30%" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                                {gameData.teams.away.name} Win
                            </span>
                            <div className="flex items-center">
                                <span className="text-sm font-bold mr-2">
                                    25%
                                </span>
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500"
                                        style={{ width: "25%" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold mb-2">
                            Key Factors
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                            <li>
                                Recent form: {gameData.teams.home.name} has won
                                3 out of their last 5 matches
                            </li>
                            <li>
                                Head-to-head: {gameData.teams.home.name} has a
                                slight advantage in recent encounters
                            </li>
                            <li>
                                Home advantage: Playing at{" "}
                                {gameData.fixture.venue.name} could be a
                                significant factor
                            </li>
                        </ul>
                    </div>
                    <Button className="mt-6 w-full">
                        View Detailed Analysis
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
