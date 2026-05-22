// ============================================================
//  MedicamentosHoy — Lista interactiva de medicamentos del día
// ============================================================
import React, { useState } from "react";

function buildDoseList(medications, logs) {
  const doses = [];
  (medications || []).forEach((med) => {
    (med.times || []).forEach((time) => {
      const key = `${med.medication_id}_${time.replace(":", "")}`;
      const log = logs[key] || {};
      doses.push({
        key,
        med_id:       med.medication_id,
        name:         med.name,
        dosage:       med.dosage,
        time,
        instructions: med.instructions,
        taken:        log.taken || false,
        taken_time:   log.taken_time || null,
        stock:        med.stock_days_remaining,
      });
    });
  });
  return doses.sort((a, b) => a.time.localeCompare(b.time));
}

function timeLabel(time) {
  const [h] = time.split(":").map(Number);
  if (h < 12) return "Mañana";
  if (h < 18) return "Tarde";
  return "Noche";
}

export default function MedicamentosHoy({ medications, logs, patientName }) {
  const initialDoses = buildDoseList(medications, logs);
  const [doses, setDoses] = useState(initialDoses);

  function toggleDose(key) {
    setDoses(prev =>
      prev.map(d =>
        d.key === key
          ? { ...d, taken: !d.taken, taken_time: !d.taken ? new Date().toLocaleTimeString("es-PA", { hour: "2-digit", minute: "2-digit" }) : null }
          : d
      )
    );
  }

  const taken  = doses.filter(d => d.taken).length;
  const total  = doses.length;
  const pct    = total > 0 ? Math.round((taken / total) * 100) : 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
          <span className="text-lg">💊</span> Medicamentos de Hoy
        </h2>
        <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
          {taken}/{total} tomados
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="mb-3 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? "#10B981" : "linear-gradient(90deg, #34D399, #6EE7B7)"
          }}
        />
      </div>

      {doses.length === 0 ? (
        <div className="bg-white rounded-2xl p-5 text-center border border-slate-100">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-sm text-slate-500">No hay medicamentos para hoy</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {doses.map((dose) => (
            <button
              key={dose.key}
              onClick={() => toggleDose(dose.key)}
              className={`w-full text-left rounded-2xl p-4 border-2 transition-all duration-200 ${
                dose.taken
                  ? "border-teal-300 bg-teal-50"
                  : "border-slate-100 bg-white hover:border-teal-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox visual */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  dose.taken ? "bg-teal-400" : "bg-slate-100 border-2 border-slate-200"
                }`}>
                  {dose.taken && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-semibold text-sm leading-tight ${dose.taken ? "text-teal-700 line-through" : "text-slate-800"}`}>
                      {dose.name}
                    </p>
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                      🕐 {dose.time} · {timeLabel(dose.time)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{dose.dosage} · {dose.instructions}</p>
                  {dose.taken && dose.taken_time && (
                    <p className="text-xs text-teal-600 mt-1 font-medium">✓ Registrado a las {dose.taken_time}</p>
                  )}
                </div>
              </div>

              {/* Alerta stock bajo */}
              {dose.stock <= 7 && !dose.taken && (
                <div className="mt-2 flex items-center gap-1.5 bg-amber-50 rounded-lg px-2.5 py-1.5 border border-amber-200">
                  <span className="text-amber-500 text-xs">⚠️</span>
                  <span className="text-xs text-amber-700 font-medium">
                    Solo quedan {dose.stock} días de stock
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {pct === 100 && total > 0 && (
        <div className="mt-3 bg-teal-50 border border-teal-200 rounded-2xl p-3 text-center">
          <p className="text-sm text-teal-700 font-semibold">🌟 ¡Todos los medicamentos tomados hoy!</p>
        </div>
      )}
    </section>
  );
}
