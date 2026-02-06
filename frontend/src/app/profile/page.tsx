"use client";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

const start = DateTime.fromISO("2025-06-19T00:00:00", { zone: "Europe/Bucharest" });

import Link from "next/link";

export default function Profile() {
  const [now, setNow] = useState(DateTime.now().setZone("Europe/Bucharest"));

  useEffect(() => {
    const id = setInterval(() => setNow(DateTime.now().setZone("Europe/Bucharest")), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = now.diff(start, ["years", "months", "days", "hours", "minutes", "seconds"]).toObject();

  // Următoarea aniversare anuală (19 iunie)
  const nextYear = now >= start.set({ year: now.year }) ? now.year + 1 : now.year;
  const nextYearAnniv = DateTime.fromObject({ year: nextYear, month: 6, day: 19 }, { zone: "Europe/Bucharest" });

  // Următoarea aniversare lunară (ziua 19 a lunii)
  let nextMonthAnniv = DateTime.fromObject({ year: now.year, month: now.month, day: 19 }, { zone: "Europe/Bucharest" });
  if (nextMonthAnniv <= now) nextMonthAnniv = nextMonthAnniv.plus({ months: 1 });
  // dar nu înainte de data de start (prima aniversare lunară după start)
  if (nextMonthAnniv < start) nextMonthAnniv = start.plus({ months: 1 });

  const toMonth = nextMonthAnniv.diff(now, ["days", "hours", "minutes", "seconds"]).toObject();
  const toYear = nextYearAnniv.diff(now, ["days", "hours", "minutes", "seconds"]).toObject();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Împreună de la 19 iunie 2025 ❤️</h1>
        <Link href="/arcade" className="text-sm text-candy hover:underline">← Înapoi la Arcade</Link>
      </div>
      <div className="text-lg">
        {Math.floor(diff.years || 0)} ani, {Math.floor(diff.months || 0)} luni, {Math.floor(diff.days || 0)} zile,{" "}
        {Math.floor(diff.hours || 0)}h {Math.floor(diff.minutes || 0)}m {Math.floor(diff.seconds || 0)}s
      </div>
      <div className="text-white/70">
        Zile totale: {Math.floor(now.diff(start, "days").days)}
      </div>

      <div className="space-y-2">
        <div className="font-semibold">Următoarea aniversare lunară:</div>
        <div>{nextMonthAnniv.toFormat("dd LLLL yyyy")} (vor fi {Math.round(start.diff(nextMonthAnniv, "months").months * -1)} luni)</div>
        <div>
          În {Math.floor(toMonth.days || 0)} zile, {Math.floor(toMonth.hours || 0)}h {Math.floor(toMonth.minutes || 0)}m{" "}
          {Math.floor(toMonth.seconds || 0)}s
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-semibold">Următoarea aniversare anuală:</div>
        <div>{nextYearAnniv.toFormat("dd LLLL yyyy")}</div>
        <div>
          În {Math.floor(toYear.days || 0)} zile, {Math.floor(toYear.hours || 0)}h {Math.floor(toYear.minutes || 0)}m{" "}
          {Math.floor(toYear.seconds || 0)}s
        </div>
      </div>
    </div>
  );
}
