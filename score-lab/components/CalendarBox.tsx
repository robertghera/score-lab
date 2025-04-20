import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Dispatch } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CalendarBoxProps {
    date: Date;
    setDate: Dispatch<React.SetStateAction<Date>>;
    maxWidth?: number;
}

export default function CalendarBox({
    date,
    setDate,
    maxWidth = 240,
}: CalendarBoxProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        `w-[${maxWidth}px] justify-start text-left font-normal`,
                        "border-gray-500 hover:bg-primary hover:text-input",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border border-gray-500">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    autoFocus
                    required
                />
            </PopoverContent>
        </Popover>
    );
}
