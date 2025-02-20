"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Prediction } from "@/types/predictions";
interface PredictionsListProps {
    date: Date | undefined;
}

interface PredictionResponse {
    predictions: Prediction[] | [];
    msg: string;
}

export default function PredictionsList({ date }: PredictionsListProps) {
    const [data, setData] = useState<PredictionResponse | null>(null); // maybe type here
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (date) {
            setIsLoading(true);
            fetch(`/api/predictions?date=${format(date, "yyyy-MM-dd")}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log(1);
                    console.log(data);
                    setData(data);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching predictions:", error);
                    setIsLoading(false);
                });
        }
    }, [date]);

    if (isLoading || data === null) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    console.log(data);
    if (data.predictions.length === 0) {
        return (
            <p className="text-center text-gray-400">
                No predictions available for this date. {data.msg}
            </p>
        );
    }
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.predictions.map((prediction) => (
                <Link
                    href={`/match/${prediction.fixture.id}`}
                    key={prediction._id.$oid}
                    className="block h-full"
                >
                    <Card className="bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors h-full flex flex-col">
                        <CardHeader className="bg-secondary flex-shrink-0">
                            <CardTitle className="flex justify-between items-center">
                                <div className="league-logo-wrapper">
                                    <Image
                                        src={
                                            prediction.league.logo ||
                                            "/placeholder.svg"
                                        }
                                        alt={prediction.league.name}
                                        width={24}
                                        height={24}
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-sm font-semibold">
                                    {prediction.league.name}
                                </span>
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                {prediction.league.round}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 flex-grow">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <Image
                                        src={
                                            prediction.teams.home.logo ||
                                            "/placeholder.svg"
                                        }
                                        alt={prediction.teams.home.name}
                                        width={40}
                                        height={40}
                                    />
                                    <span className="ml-2 font-semibold">
                                        {prediction.teams.home.name}
                                    </span>
                                </div>
                                <span className="text-muted-foreground">
                                    vs
                                </span>
                                <div className="flex items-center">
                                    <span className="mr-2 font-semibold">
                                        {prediction.teams.away.name}
                                    </span>
                                    <Image
                                        src={
                                            prediction.teams.away.logo ||
                                            "/placeholder.svg"
                                        }
                                        alt={prediction.teams.away.name}
                                        width={40}
                                        height={40}
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {format(
                                    new Date(prediction.fixture.date),
                                    "PPP"
                                )}{" "}
                                at{" "}
                                {format(new Date(prediction.fixture.date), "p")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {prediction.fixture.venue.name},{" "}
                                {prediction.fixture.venue.city}
                            </p>
                        </CardContent>
                        <CardFooter className="mt-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Make Prediction
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onSelect={() => console.log("Home win")}
                                    >
                                        {prediction.teams.home.name} Win
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => console.log("Draw")}
                                    >
                                        Draw
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => console.log("Away win")}
                                    >
                                        {prediction.teams.away.name} Win
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardFooter>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
