"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import { createCurrentTimePlugin } from "@schedule-x/current-time";
import "@schedule-x/theme-default/dist/index.css";

import {
  deleteAppointment,
  rescheduleAppointment,
} from "@/app/(app)/dashboard/actions";
import AppointmentForm, { type AppointmentInitial } from "./AppointmentForm";
import CompleteAppointmentDialog from "./CompleteAppointmentDialog";

export type AppointmentWithDog = {
  id: number;
  dogId: number;
  startsAt: Date;
  durationMin: number;
  service: string | null;
  dog: { id: number; name: string };
};

type Dog = { id: number; name: string };

type ModalState =
  | { type: "none" }
  | { type: "create"; date?: string; time?: string }
  | { type: "view"; appt: AppointmentWithDog }
  | { type: "edit"; appt: AppointmentWithDog }
  | { type: "complete"; appt: AppointmentWithDog };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateToSxString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function addMinutes(date: Date, min: number): Date {
  return new Date(date.getTime() + min * 60_000);
}

function appointmentToEvent(appt: AppointmentWithDog) {
  return {
    id: String(appt.id),
    title: appt.service
      ? `${appt.dog.name} — ${appt.service}`
      : appt.dog.name,
    start: dateToSxString(appt.startsAt),
    end: dateToSxString(addMinutes(appt.startsAt, appt.durationMin)),
  };
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export default function DashboardClient({
  appointments,
  dogs,
}: {
  appointments: AppointmentWithDog[];
  dogs: Dog[];
}) {
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const apptsRef = useRef(appointments);
  apptsRef.current = appointments;

  const events = useMemo(
    () => appointments.map(appointmentToEvent),
    [appointments],
  );

  const calendar = useNextCalendarApp(
    {
      locale: "pt-BR",
      views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
      defaultView: createViewWeek().name,
      // Cast: Schedule-X types want Temporal objects, but runtime accepts
      // "YYYY-MM-DD HH:mm" strings (and that's what we use).
      events: events as unknown as never,
      callbacks: {
        onEventClick: (event) => {
          const id = Number(event.id);
          const found = apptsRef.current.find((a) => a.id === id);
          if (found) setModal({ type: "view", appt: found });
        },
        onClickDate: (date) => {
          const s = String(date).slice(0, 10);
          setModal({ type: "create", date: s });
        },
        onClickDateTime: (dateTime) => {
          const s = String(dateTime);
          setModal({
            type: "create",
            date: s.slice(0, 10),
            time: s.slice(11, 16),
          });
        },
        onEventUpdate: async (event) => {
          const id = Number(event.id);
          const startStr = String(event.start);
          const isoLocal = startStr.length >= 16
            ? `${startStr.slice(0, 10)}T${startStr.slice(11, 16)}:00`
            : startStr;
          const dt = new Date(isoLocal);
          if (!Number.isNaN(dt.getTime())) {
            await rescheduleAppointment(id, dt.toISOString());
          }
        },
      },
    },
    [createDragAndDropPlugin(15), createCurrentTimePlugin()],
  );

  // Sync events when props change (e.g. after revalidatePath refresh)
  useEffect(() => {
    if (!calendar) return;
    calendar.events.set(events as unknown as never);
  }, [calendar, events]);

  const closeModal = () => setModal({ type: "none" });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Agenda</h1>
          <p className="text-sm text-gray-500">
            {appointments.length}{" "}
            {appointments.length === 1 ? "marcação" : "marcações"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: "create" })}
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition"
        >
          + Nova
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-2 sm:p-3">
        <ScheduleXCalendar calendarApp={calendar} />
      </div>

      {/* Create / Edit form modal */}
      {(modal.type === "create" || modal.type === "edit") && (
        <Modal title={modal.type === "create" ? "Nova marcação" : "Editar marcação"} onClose={closeModal}>
          <AppointmentForm
            dogs={dogs}
            initial={
              modal.type === "create"
                ? { date: modal.date, time: modal.time }
                : apptToInitial(modal.appt)
            }
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {/* View details modal */}
      {modal.type === "view" && (
        <Modal title="Detalhes" onClose={closeModal}>
          <ViewDetails
            appt={modal.appt}
            onEdit={() => setModal({ type: "edit", appt: modal.appt })}
            onComplete={() => setModal({ type: "complete", appt: modal.appt })}
            onDelete={async () => {
              if (!confirm("Excluir esta marcação?")) return;
              await deleteAppointment(modal.appt.id);
              closeModal();
            }}
          />
        </Modal>
      )}

      {/* Complete (mark as done) modal */}
      {modal.type === "complete" && (
        <Modal title="Concluir marcação" onClose={closeModal}>
          <CompleteAppointmentDialog
            appt={modal.appt}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}

function apptToInitial(appt: AppointmentWithDog): AppointmentInitial {
  const d = appt.startsAt;
  return {
    id: appt.id,
    dogId: appt.dogId,
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    durationMin: appt.durationMin,
    service: appt.service,
  };
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ViewDetails({
  appt,
  onEdit,
  onComplete,
  onDelete,
}: {
  appt: AppointmentWithDog;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500">Cachorro</p>
        <p className="font-semibold text-gray-800">{appt.dog.name}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm text-gray-500">Data</p>
          <p className="text-gray-800">{dateFmt.format(appt.startsAt)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Hora</p>
          <p className="text-gray-800">
            {timeFmt.format(appt.startsAt)} ({appt.durationMin} min)
          </p>
        </div>
      </div>
      {appt.service && (
        <div>
          <p className="text-sm text-gray-500">Serviço</p>
          <p className="text-gray-800">{appt.service}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 pt-2">
        <button
          type="button"
          onClick={onComplete}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg py-2.5 transition"
        >
          Marcar como feita
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg py-2.5 transition"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg py-2.5 transition"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
