"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, Loader2, MapPin, User } from "lucide-react";
import { Legend, PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectValue,
    SelectLabel,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";

const chartConfig = {
    homeTeam: {
        label: "Home Team",
        color: "hsl(var(--chart-1))",
    },
    awayTeam: {
        label: "Away Team",
        color: "hsl(var(--chart-2))",
    },
    leagueAverage: {
        label: "League Average",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig;

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
    goals: {
        home: number;
        away: number;
    };
    score: {
        halftime: { home: number; away: number };
        fulltime: { home: number; away: number };
        extratime: { home: number; away: number };
        penalty: { home: number; away: number };
    };
    lineups:
        | [
              {
                  team: {
                      id: number;
                      name: string;
                      logo: string;
                  };
                  formation: string;
                  startXI: {
                      player: {
                          id: number;
                          name: string;
                          number: number | null;
                          pos: string;
                          grid: string;
                      };
                  }[];
              },
              {
                  team: {
                      id: number;
                      name: string;
                      logo: string;
                  };
                  formation: string;
                  startXI: {
                      player: {
                          id: number;
                          name: string;
                          number: number | null;
                          pos: string;
                          grid: string;
                      };
                  }[];
              }
          ]
        | null;
    players:
        | [
              {
                  team: {
                      id: number;
                      name: string;
                      logo: string;
                  };
                  players: {
                      player: {
                          id: number;
                          name: string;
                          photo: string;
                      };
                  }[];
              },
              {
                  team: {
                      id: number;
                      name: string;
                      logo: string;
                  };
                  players: {
                      player: {
                          id: number;
                          name: string;
                          photo: string;
                      };
                  }[];
              }
          ]
        | null;
    statistics:
        | [
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
          ]
        | undefined;
    final_prediction: {
        [key: string]: "W" | "D" | "L";
    } | null;
    prediction: {
        [key: string]: number[];
    } | null;
    prediction_given: {
        [key: string]: "W" | "D" | "L";
    } | null;
    result: string | null;
}

const CustomAngleTick = ({
    payload,
    x,
    y,
    textAnchor,
}: {
    payload: { value: string };
    x: number;
    y: number;
    textAnchor: string;
}) => {
    const label = payload.value;

    // Customize angle per label
    // let angle = 0;
    // if (label === "Blocked Shots") angle = 20;
    // else if (label === "Shots insidebox") angle = 30;
    // else if (label.length > 12) angle = 45;

    return (
        <text
            className="text-xs dark:fill-white"
            x={x}
            y={y}
            textAnchor={textAnchor}
            dominantBaseline="central"
            transform={`rotate(${x}, ${y})`}
        >
            {label}
        </text>
    );
};

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
    const { data, isPending } = authClient.useSession();
    const [prediction, setPrediction] = useState<"W" | "L" | "D" | null>(null);
    const [showHomeTeam, setShowHomeTeam] = useState(true);
    const [showAwayTeam, setShowAwayTeam] = useState(true);
    const [showLeagueAverage, setShowLeagueAverage] = useState(true);
    const [chartData, setChartData] = useState<
        Array<Array<Array<{ stat: string; [team: string]: number | string }>>>
    >([]);

    const handlePredictionSubmit = async (
        userId: string | undefined,
        prediction: "W" | "L" | "D",
        fixtureId: number
    ) => {
        try {
            setPrediction(prediction);
            const response = await fetch("/api/match/prediction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    fixtureId: fixtureId,
                    prediction: prediction,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit prediction");
            }

            const responseData = await response.json();
            console.log("Prediction submitted successfully:", responseData);
        } catch (err) {
            console.error("Error submitting prediction:", err);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teamPositions: any = {
        home: {},
        away: {},
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatPositions: any = {
        1: [50],
        2: [30, 70],
        3: [20, 50, 80],
        4: [20, 40, 60, 80],
        5: [10, 28, 50, 72, 90],
    };

    useEffect(() => {
        if (isPending) {
            return;
        }

        fetch(`/api/match/prediction?fixtureId=${id}&userId=${data?.user.id}`)
            .then((res) => res.json())
            .then((responseData) => {
                if (responseData.prediction) {
                    setPrediction(responseData.prediction);
                }
            })
            .catch((err) => {
                console.log(err);
            });

        fetch(`/api/match?id=${id}`)
            .then((res) => res.json())
            .then((responseData) => {
                setGameData(responseData);
                fetch(
                    `/api/match/stats?homeTeam=${responseData.teams.home.name}&awayTeam=${responseData.teams.away.name}`
                )
                    .then((res) => res.json())
                    .then((responseData) => {
                        setChartData(responseData);
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    }, [data?.user.id, id, isPending]);

    if (!gameData) {
        return <Loader2 className="animate-spin mx-auto my-10" />;
    }

    if (gameData && gameData?.lineups?.length === 2) {
        for (const elem of gameData.lineups[0].startXI) {
            console.log(elem.player.grid);
            const value = elem.player.grid.split(":")[0];
            if (teamPositions.home[value] === undefined) {
                teamPositions.home[value] = 1;
            } else {
                teamPositions.home[value] += 1;
            }
        }

        for (const elem of gameData.lineups[1].startXI) {
            const value = elem.player.grid.split(":")[0];
            if (teamPositions.away[value] === undefined) {
                teamPositions.away[value] = 1;
            } else {
                teamPositions.away[value] += 1;
            }
        }
    }

    const getPlayerPhotoById = (id: number, whereIsPlayed: "home" | "away") => {
        let position = 0;
        if (whereIsPlayed === "home") {
            position = 0;
        } else {
            position = 1;
        }

        const player = gameData.players?.[position]?.players.find(
            (p) => p.player.id === id
        );
        return player ? player.player.photo : "/placeholder.svg";
    };

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

                            {gameData?.goals?.home !== undefined &&
                            gameData?.goals?.away !== undefined ? (
                                <div className="text-4xl font-bold mx-8 flex items-center">
                                    <span className="text-5xl">
                                        {gameData.goals.home}
                                    </span>
                                    <span className="mx-3">-</span>
                                    <span className="text-5xl">
                                        {gameData.goals.away}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-4xl font-bold mx-8">
                                    vs
                                </div>
                            )}

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

                        <div className="flex-1 items-center text-center justify-between mb-8 mx-auto md:w-1/4 1/3 rounded-lg border border-gray-500">
                            <Select
                                value={prediction || ""}
                                onValueChange={(value) =>
                                    handlePredictionSubmit(
                                        data?.user.id,
                                        value as "W" | "L" | "D",
                                        gameData.fixture.id
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Make Prediction" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Predictions</SelectLabel>
                                        <SelectItem value="W">
                                            {gameData.teams.home.name} Win
                                        </SelectItem>
                                        <SelectItem value="D">Draw</SelectItem>
                                        <SelectItem value="L">
                                            {gameData.teams.away.name} Win
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
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

            {gameData.lineups && gameData.lineups.length > 0 && (
                <Card className="mb-8 overflow-hidden bg-card">
                    <div className="p-4 rounded-t-lg">
                        <h3 className="text-xl font-bold">Lineups</h3>
                    </div>
                    <div className="relative rounded-b-lg h-[600px] w-full overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full rounded-lg">
                                {/* Home team - Left side */}
                                {gameData.lineups[0].startXI.map(
                                    ({ player }) => {
                                        // Skip if no grid position
                                        if (!player.grid) return null;

                                        const [row, col] = player.grid
                                            .split(":")
                                            .map(Number);
                                        const isGoalkeeper = player.pos === "G";
                                        const valueToSplit = gameData.lineups
                                            ? gameData.lineups[0].formation.split(
                                                  "-"
                                              ).length
                                            : 3;

                                        let posX, posY;

                                        if (isGoalkeeper) {
                                            posX = "7%";
                                            posY = "50%";
                                        } else {
                                            // Adjust positioning for outfield players - ensure they stay on left half
                                            posX = `${
                                                row * (35 / valueToSplit)
                                            }%`;
                                            posY = `${
                                                formatPositions[
                                                    teamPositions.home[row]
                                                ][col - 1]
                                            }%`;
                                        }

                                        return (
                                            <div
                                                key={`home-${player.id}`}
                                                className="absolute -translate-x-1/2 -translate-y-1/2"
                                                style={{
                                                    left: posX,
                                                    top: posY,
                                                }}
                                            >
                                                {/* Player icon */}
                                                <div
                                                    className={`w-10 h-10 flex items-center text-xs font-bold backdrop-blur-sm bg-slate-800/70 relative rounded-2xl overflow-hidden shadow-lg`}
                                                >
                                                    <Image
                                                        src={
                                                            getPlayerPhotoById(
                                                                player.id,
                                                                "home"
                                                            ) ||
                                                            "/placeholder.svg"
                                                        }
                                                        alt={player.name}
                                                        fill
                                                        className="object-contain absolute "
                                                    />
                                                </div>

                                                {/* Player name */}
                                                <div className="text-center">
                                                    <span className="text-xs font-medium text-white bg-black bg-opacity-50 px-1 py-0.5 rounded">
                                                        {player.number}{" "}
                                                        {player.name
                                                            .split(" ")
                                                            .pop()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}

                                {/* Away team - Right side */}
                                {gameData.lineups[1].startXI.map(
                                    ({ player }) => {
                                        // Skip if no grid position
                                        if (!player.grid) return null;

                                        const [row, col] = player.grid
                                            .split(":")
                                            .map(Number);
                                        const isGoalkeeper = player.pos === "G";
                                        const valueToSplit = gameData.lineups
                                            ? gameData.lineups[1].formation.split(
                                                  "-"
                                              ).length
                                            : 3;

                                        // Find player statistics if available
                                        // const playerStats =
                                        //     gameData.players?.[1]?.players.find(
                                        //         (p) =>
                                        //             p.player.id ===
                                        //             player.id
                                        //     );
                                        // const rating =
                                        //     playerStats?.statistics[0]
                                        //         ?.games?.rating || "6.0";

                                        // Position calculation - right side of the field
                                        let posX, posY;

                                        if (isGoalkeeper) {
                                            posX = "7%";
                                            posY = "50%";
                                        } else {
                                            // Adjust positioning for outfield players - ensure they stay on left half
                                            posX = `${
                                                row * (35 / valueToSplit)
                                            }%`;
                                            posY = `${
                                                formatPositions[
                                                    teamPositions.away[row]
                                                ][col - 1]
                                            }%`;
                                        }

                                        return (
                                            <div
                                                key={`away-${player.id}`}
                                                className="absolute transform translate-x-1/2 translate-y-1/2"
                                                style={{
                                                    right: posX,
                                                    bottom: posY,
                                                }}
                                            >
                                                {/* Rating badge */}
                                                {/* <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#8dc63f] text-black text-xs font-bold rounded-full w-8 h-5 flex items-center justify-center">
                                                        {rating}
                                                    </div> */}

                                                {/* Player icon */}
                                                <div
                                                    className={`w-10 h-10 flex items-center text-xs font-bold backdrop-blur-sm bg-slate-800/70 relative rounded-2xl overflow-hidden p-2 shadow-lg`}
                                                >
                                                    <Image
                                                        src={
                                                            getPlayerPhotoById(
                                                                player.id,
                                                                "away"
                                                            ) ||
                                                            "/placeholder.svg"
                                                        }
                                                        alt={player.name}
                                                        fill
                                                        className="object-contain absolute "
                                                    />
                                                </div>

                                                {/* Player name */}
                                                <div className="text-center">
                                                    <span className="text-xs font-medium text-white bg-black bg-opacity-50 rounded">
                                                        {player.number}{" "}
                                                        {player.name
                                                            .split(" ")
                                                            .pop()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>

                        {/* Team formations display */}
                        <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-md">
                            <div className="flex items-center">
                                <Image
                                    src={
                                        gameData.lineups[0].team.logo ||
                                        "/placeholder.svg"
                                    }
                                    alt={gameData.lineups[0].team.name}
                                    width={20}
                                    height={20}
                                    className="mr-2"
                                />
                                <span className="text-sm font-semibold">
                                    {gameData.lineups[0].formation}
                                </span>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-3 py-1 rounded-md">
                            <div className="flex items-center">
                                <span className="text-sm font-semibold">
                                    {gameData.lineups[1].formation}
                                </span>
                                <Image
                                    src={
                                        gameData.lineups[1].team.logo ||
                                        "/placeholder.svg"
                                    }
                                    alt={gameData.lineups[1].team.name}
                                    width={20}
                                    height={20}
                                    className="ml-2"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="mb-8 bg-card">
                <CardHeader className="items-center pb-4 text-xl font-bold">
                    <CardTitle>Past Games Stats</CardTitle>
                </CardHeader>
                <CardContent className="gap-0 flex flex-col items-center lg:grid lg:grid-cols-3">
                    {chartData.map((item, index) => (
                        <ChartContainer
                            key={index}
                            config={chartConfig}
                            className="mx-auto aspect-square max-h-[280px] w-full"
                        >
                            <RadarChart
                                data={item}
                                margin={{
                                    top: -10,
                                    bottom: -10,
                                }}
                                outerRadius={75}
                            >
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent indicator="line" />
                                    }
                                />
                                <PolarAngleAxis
                                    dataKey="stat"
                                    tick={(props) => (
                                        <CustomAngleTick {...props} />
                                    )}
                                />
                                <PolarGrid
                                    radialLines={true}
                                    stroke="hsl(var(--chart-4))"
                                />
                                <Radar
                                    hide={!showHomeTeam}
                                    dataKey={gameData.teams.home.name}
                                    fill="var(--color-homeTeam)"
                                    isAnimationActive={false}
                                    fillOpacity={0.9}
                                />
                                <Radar
                                    hide={!showAwayTeam}
                                    dataKey={gameData.teams.away.name}
                                    fill="var(--color-awayTeam)"
                                    fillOpacity={
                                        0.7 + (!showHomeTeam ? 0.3 : 0)
                                    }
                                    isAnimationActive={false}
                                />
                                <Radar
                                    hide={!showLeagueAverage}
                                    dataKey={"League Average"}
                                    fill="var(--color-leagueAverage)"
                                    fillOpacity={
                                        0.4 +
                                        (!showHomeTeam ? 0.3 : 0) +
                                        (!showAwayTeam ? 0.2 : 0)
                                    }
                                    isAnimationActive={false}
                                />
                                <Legend
                                    onClick={(e) => {
                                        if (
                                            e.dataKey ===
                                            gameData.teams.home.name
                                        ) {
                                            setShowHomeTeam(!showHomeTeam);
                                        } else if (
                                            e.dataKey ===
                                            gameData.teams.away.name
                                        ) {
                                            setShowAwayTeam(!showAwayTeam);
                                        } else if (
                                            e.dataKey === "League Average"
                                        ) {
                                            setShowLeagueAverage(
                                                !showLeagueAverage
                                            );
                                        }
                                    }}
                                    wrapperStyle={{ cursor: "pointer" }}
                                    formatter={(value, entry) => {
                                        const color = entry.color;
                                        return (
                                            <span
                                                style={{
                                                    color,
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {value}
                                            </span>
                                        );
                                    }}
                                />
                            </RadarChart>
                        </ChartContainer>
                    ))}
                </CardContent>
                <CardFooter></CardFooter>
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
                                if (gameData?.statistics === undefined) {
                                    return;
                                }

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
                                                        className="h-full bg-gray-900 dark:bg-white"
                                                        style={{
                                                            width: `${homeValue}%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="h-2 w-full text-foregroundrounded-r overflow-hidden flex justify-start">
                                                    <div
                                                        className="h-full bg-gray-900 dark:bg-white"
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
                                                    className="h-full bg-gray-900 dark:bg-white"
                                                    style={{
                                                        width: `${homePercentage}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="h-2 w-full text-foreground rounded-r overflow-hidden flex justify-start">
                                                <div
                                                    className="h-full bg-gray-900 dark:bg-white"
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
                    {gameData.final_prediction ? (
                        <>
                            <h3 className="text-xl font-bold mb-6 flex items-center">
                                AI Predictions:
                                <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500 text-white">
                                    {gameData.final_prediction.test === "W"
                                        ? "Home Win"
                                        : gameData.final_prediction.test === "D"
                                        ? "Draw"
                                        : gameData.final_prediction.test === "L"
                                        ? "Away Win"
                                        : gameData.final_prediction.test}
                                </span>
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        {gameData.teams.home.name} Win
                                    </span>
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold mr-2">
                                            {gameData.prediction
                                                ? `${Math.round(
                                                      gameData.prediction
                                                          .test[2] * 100
                                                  )}%`
                                                : "45%"}
                                        </span>
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500"
                                                style={{
                                                    width: gameData.prediction
                                                        ? `${Math.round(
                                                              gameData
                                                                  .prediction
                                                                  .test[2] * 100
                                                          )}%`
                                                        : "45%",
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        Draw
                                    </span>
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold mr-2">
                                            {gameData.prediction
                                                ? `${Math.round(
                                                      gameData.prediction
                                                          .test[1] * 100
                                                  )}%`
                                                : "30%"}
                                        </span>
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-500"
                                                style={{
                                                    width: gameData.prediction
                                                        ? `${Math.round(
                                                              gameData
                                                                  .prediction
                                                                  .test[1] * 100
                                                          )}%`
                                                        : "30%",
                                                }}
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
                                            {gameData.prediction
                                                ? `${Math.round(
                                                      gameData.prediction
                                                          .test[0] * 100
                                                  )}%`
                                                : "25%"}
                                        </span>
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500"
                                                style={{
                                                    width: gameData.prediction
                                                        ? `${Math.round(
                                                              gameData
                                                                  .prediction
                                                                  .test[0] * 100
                                                          )}%`
                                                        : "25%",
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {gameData.result && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold mb-2">
                                        Match Result
                                    </h4>
                                    <div className="flex items-center">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                gameData.result ===
                                                gameData.final_prediction.test
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                            }`}
                                        >
                                            {gameData.result === "W"
                                                ? "Home Win"
                                                : gameData.result === "D"
                                                ? "Draw"
                                                : gameData.result === "L"
                                                ? "Away Win"
                                                : gameData.result}
                                        </span>
                                        {gameData.result ===
                                        gameData.final_prediction.test ? (
                                            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                                Prediction correct
                                            </span>
                                        ) : (
                                            <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                                                Prediction incorrect
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-bold mb-4">
                                AI Prediction Pending
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Our AI is analyzing this match and will provide
                                predictions soon.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
