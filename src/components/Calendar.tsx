"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function Calendar() {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      locale="pt-br"
      height="auto"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      buttonText={{
        today: "hoje",
        month: "mês",
        week: "semana",
        day: "dia",
      }}
      dayHeaderFormat={{ weekday: "short" }}
      events={[]}
      selectable
      dateClick={(info) => {
        alert(`Marcações para ${info.dateStr} virão em breve.`);
      }}
    />
  );
}
