import { useState } from "react";

interface DatePeriod { year: number; month: number }

function currentPeriod(): DatePeriod {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function usePeriod() {
  const [period, setPeriod] = useState<DatePeriod>(currentPeriod);

  function prevMonth() {
    setPeriod(({ year, month }) =>
      month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 },
    );
  }

  function nextMonth() {
    setPeriod(({ year, month }) =>
      month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 },
    );
  }

  const isCurrentMonth =
    period.year === currentPeriod().year && period.month === currentPeriod().month;

  return { period, setPeriod, prevMonth, nextMonth, isCurrentMonth };
}