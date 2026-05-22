// ============================================================
//  ProximasCitas — Sección de próximas citas médicas
// ============================================================
import React from "react";

const SPECIALTY_ICONS = {
  "Neurología Pediátrica": "🧠",
  "Fisioterapia":          "🏃",
  "Psicología Infantil":   "💬",
  "Cardiología":           "❤️",
  "Oftalmología":          "👁️",
  "Fonoaudiología":        "🗣️",
  default:                 "🏥",
};

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  const opts = { weekday: "short", day: "numeric", month: "short" };
  return date.toLocaleDateString("es-PA", opts);
}

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return { label: "Hoy", color: "text-rose-600 bg-rose-50 border-rose-200" };
  if (diff === 1) return { label: "Mañana", color: "text-amber-600 bg-amber-50 border-amber-200" };
  if (diff <= 7)  return { label: `En ${diff} días`, color: "text-teal-600 bg-teal-50 border-teal-200" };
  return { label: `En ${diff} días`, color: "text-slate-500 bg-slate-50 border-slate-200" };
}

export default function ProximasCitas({ appointments }) {
  const upcoming = (appointments || [])
    .filter(a => a.status === "scheduled")
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
          <span className="text-lg">📅</span> Próximas Citas
        </h2>
        <span className="text-xs text-slate-400">{upcoming.length} pendiente{upcoming.length !== 1 ? "s" : ""}</span>
      </div>

      {upcoming.length === 0 ? (
        <div className="bg-white rounded-2xl p-5 text-center border border-slate-100">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-sm text-slate-500">No hay citas próximas</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {upcoming.map((apt) => {
            const icon  = SPECIALTY_ICONS[apt.specialty] || SPECIALTY_ICONS.default;
            const badge = daysUntil(apt.date);
            return (
              <div
                key={apt.appointment_id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">
                          {apt.doctor_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{apt.specialty}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span>🗓 {formatDate(apt.date)} a las {apt.time}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-400 truncate">
                      📍 {apt.location}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
