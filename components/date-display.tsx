
"use client";

import { useEffect, useState } from "react";

interface DateDisplayProps {
  showWeekday?: boolean;
}

export default function DateDisplay({
  showWeekday = true,
}: DateDisplayProps) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const date = new Date();

    setFormattedDate(
      date.toLocaleDateString("id-ID", {
        weekday: showWeekday ? "long" : undefined,
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, [showWeekday]);

  return <span>{formattedDate}</span>;
}
