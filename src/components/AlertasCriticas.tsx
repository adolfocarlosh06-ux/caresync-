// ============================================================
//  AlertasCriticas — Panel de alertas importantes
// ============================================================
import React, { useState } from "react";

function buildAlerts(medications, exams) {
  const alerts = [];

  // Alerta: medicamento con stock bajo
  (medications || []).forEach(med => {
    if (med.stock_days_remaining <= 7) {
      alerts.push({
        id:       `stock_${med.medication_id}`,
        level:    med.stock_days_remaining <= 3 ? "critical" : "warning",
        icon:     "💊",
        title:    `Stock bajo: ${med.name}`,
        body:     `Solo quedan ${med.stock_days_remaining} días de medicamento. Renueva la receta pronto.`,
        action:   "Contactar al médico",
      });
    }
  });

  // Alerta: examen sin subir
  (exams || []).forEach(exam => {
    if (exam.status === "pending_upload") {
      alerts.push({
        id:    `exam_${exam.exam_id}`,
        level: "info",
        icon:  "🧪",
        title: `Examen pendiente de subir`,
        body:  `${exam.exam_type} del ${exam.exam_date} aún no está en el archivo digital.`,
        action: "Subir resultado",
      });
    }
  });

  return alerts;
}

const LEVEL_STYLES = {
  critical: {
    border: "border-rose-300",
    bg:     "bg-rose-50",
    badge:  "bg-rose-100 text-rose-700 border-rose-200",
    dot:    "bg-rose-500",
    label:  "Urgente",
  },
  warning: {
    border: "border-amber-300",
    bg:     "bg-amber-50",
    badge:  "bg-amber-100 text-amber-700 border-amber-200",
    dot:    "bg-amber-500",
    label:  "Atención",
  },
  info: {
    border: "border-blue-200",
    bg:     "bg-blue-50",
    badge:  "bg-blue-100 text-blue-700 border-blue-200",
    dot:    "bg-blue-400",
    label:  "Pendiente",
  },
};

export default function AlertasCriticas({ medications, exams }) {
  const alerts = buildAlerts(medications, exams);
  const [dismissed, setDismissed] = useState([]);
  const visible = alerts.filter(a => !dismissed.includes(a.id));

  if (visible.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
            <span className="text-lg">🔔</span> Alertas
          </h2>
        </div>
        <div className="bg-white rounded-2xl p-5 text-center border border-slate-100">
          <p className="text-3xl mb-2">✨</p>
          <p className="text-sm text-slate-500">Todo está en orden</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
          <span className="text-lg">🔔</span> Alertas Críticas
        </h2>
        <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
          {visible.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {visible.map((alert) => {
          const s = LEVEL_STYLES[alert.level];
          return (
            <div
              key={alert.id}
              className={`rounded-2xl p-4 border-2 ${s.border} ${s.bg}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-0.5">{alert.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800 text-sm">{alert.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${s.badge}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{alert.body}</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <button className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 active:scale-95 transition-transform">
                      {alert.action}
                    </button>
                    <button
                      onClick={() => setDismissed(p => [...p, alert.id])}
                      className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
