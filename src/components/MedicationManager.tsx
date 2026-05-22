// ============================================================
//  MedicationManager.tsx — Vista de Medicamentos Activos
//  Fase 4: Tarjetas visuales por paciente con estado y detalles
// ============================================================
import React, { useState } from "react";

const FREQUENCY_ICONS = {
  "1 vez al día":   { icon: "🌅", color: "bg-amber-50 text-amber-700 border-amber-200" },
  "2 veces al día": { icon: "🔁", color: "bg-blue-50 text-blue-700 border-blue-200"   },
  "3 veces al día": { icon: "⏰", color: "bg-violet-50 text-violet-700 border-violet-200" },
  "default":        { icon: "💊", color: "bg-slate-50 text-slate-600 border-slate-200" },
};

function getFrequencyStyle(frequency) {
  for (const key in FREQUENCY_ICONS) {
    if (frequency?.toLowerCase().includes(key.toLowerCase())) return FREQUENCY_ICONS[key];
  }
  return FREQUENCY_ICONS.default;
}

function StockBadge({ days }) {
  if (!days && days !== 0) return null;
  if (days <= 3)  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">🚨 {days} días</span>;
  if (days <= 7)  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">⚠️ {days} días</span>;
  return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-200">✓ {days} días</span>;
}

function MedicationCard({ med, onLog, patientName }) {
  const [expanded, setExpanded] = useState(false);
  const freqStyle = getFrequencyStyle(med.frequency);

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden shadow-sm
      ${expanded ? "border-teal-300 shadow-md shadow-teal-100" : "border-slate-100 hover:border-slate-200"}`}>

      {/* Cabecera de la tarjeta */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start gap-3">
          {/* Ícono del medicamento */}
          <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-teal-100">
            💊
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-slate-800 text-sm leading-tight">{med.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">{med.dosage}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <StockBadge days={med.stock_days_remaining} />
                <span className="text-slate-300 text-sm">{expanded ? "▲" : "▼"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${freqStyle.color}`}>
                {freqStyle.icon} {med.frequency}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                med.status === "active"
                  ? "bg-teal-50 text-teal-600 border border-teal-200"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {med.status === "active" ? "● Activo" : "○ Inactivo"}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Detalle expandido */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-50 pt-3 space-y-3">

          {/* Horarios */}
          {med.times && med.times.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">🕐 Horarios</p>
              <div className="flex gap-2 flex-wrap">
                {med.times.map((t, i) => (
                  <span key={i} className="bg-teal-50 border border-teal-200 text-teal-700 text-sm font-bold px-3 py-1.5 rounded-xl">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detalles */}
          <div className="bg-slate-50 rounded-xl p-3 space-y-2">
            {med.prescribing_doctor && (
              <div className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">🩺</span>
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Prescrito por</p>
                  <p className="text-xs text-slate-700">{med.prescribing_doctor}</p>
                </div>
              </div>
            )}
            {med.instructions && (
              <div className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">📌</span>
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Instrucciones</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{med.instructions}</p>
                </div>
              </div>
            )}
            {med.start_date && (
              <div className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">📅</span>
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Período</p>
                  <p className="text-xs text-slate-700">{med.start_date} → {med.end_date || "Indefinido"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Botón registrar toma */}
          <button
            onClick={() => onLog(med)}
            className="w-full py-3 rounded-xl text-white font-bold text-sm
              active:scale-95 transition-all shadow-md"
            style={{ background: "linear-gradient(135deg, #0D9488, #6EE7B7)" }}
          >
            ✅ Registrar Toma
          </button>
        </div>
      )}
    </div>
  );
}

export default function MedicationManager({ medications, patientName, onLogRequest }) {
  const active   = (medications || []).filter(m => m.status === "active");
  const inactive = (medications || []).filter(m => m.status !== "active");

  if (!medications || medications.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
        <p className="text-4xl mb-3">💊</p>
        <p className="font-semibold text-slate-600">No hay medicamentos registrados</p>
        <p className="text-sm text-slate-400 mt-1">Los medicamentos de {patientName} aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Activos",   value: active.length,   color: "bg-teal-50 border-teal-200",   text: "text-teal-700"   },
          { label: "Alertas",   value: (medications || []).filter(m => m.stock_days_remaining <= 7).length, color: "bg-amber-50 border-amber-200", text: "text-amber-700" },
          { label: "Total",     value: medications.length, color: "bg-slate-50 border-slate-200", text: "text-slate-600" },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl border p-3 text-center ${stat.color}`}>
            <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
            <p className={`text-xs font-semibold mt-0.5 ${stat.text}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Medicamentos activos */}
      {active.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            ● Medicamentos Activos
          </p>
          <div className="space-y-2.5">
            {active.map(med => (
              <MedicationCard
                key={med.medication_id}
                med={med}
                patientName={patientName}
                onLog={onLogRequest}
              />
            ))}
          </div>
        </div>
      )}

      {/* Medicamentos inactivos */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            ○ Historial / Inactivos
          </p>
          <div className="space-y-2">
            {inactive.map(med => (
              <div key={med.medication_id}
                className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3 opacity-60">
                <span className="text-xl">💊</span>
                <div>
                  <p className="text-sm font-semibold text-slate-600">{med.name} · {med.dosage}</p>
                  <p className="text-xs text-slate-400">{med.frequency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
