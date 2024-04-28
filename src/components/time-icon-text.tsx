import { Badge } from "@/components/ui/badge";
import { format, intlFormatDistance } from "date-fns";
import { Clock } from "lucide-react";

type Props = {
  date: Date;
  dateFormat?: "relative" | "date" | "datetime";
};

export function TimeIconText({ date, dateFormat: dateFormat = "date" }: Props) {
  const dateString =
    dateFormat === "relative"
      ? intlFormatDistance(date, new Date())
      : dateFormat === "date"
        ? format(date, "MMM d, yyyy")
        : format(date, "MMM d, yyyy hh:mm a");

  return (
    <Badge variant="secondary" className="flex items-center rounded-sm">
      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{dateString}</span>
    </Badge>
  );
}

TimeIconText.displayName = "TimeIconText";
