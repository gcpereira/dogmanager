import Calendar from "@/components/Calendar";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Agenda</h1>
        <p className="text-sm text-gray-500">
          Gerencie marcações em breve. Por enquanto, o calendário é apenas visual.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4">
        <Calendar />
      </div>
    </div>
  );
}
