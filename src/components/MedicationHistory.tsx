// ============================================================
//  MedicationHistory.tsx — Historial de Adherencia
//  Fase 4: Log de auditoría con filtros y estadísticas
// ============================================================
import React, { useState, useMemo } from "react";

interface LogEntry {
  log_id:          string;
  medication_id:   string;
  patient_id:      string;
  scheduled_time:  string;
  taken_time:      string;
  status:          string;
  administered_by: string;
  notes:           string;
  created_at:      string;
}

interface Medication {
  medication_id: string;
  name:          string;
  dosage:        string;
}

interface Props {
  logs:        LogEntry[];
  medications: Medication[];
  patientName: string;
}

const STATUS_CONFIG = {
  taken:   { label: "Tomado",    icon: "✅", bg: "bg-teal-50",   border: "border-teal-200",  text: "text-teal-700",   dot: "bg-teal-400"  },
  missed:  { label: "Omitido",   icon: "❌", bg: "bg-rose-50",   border: "border-rose-200",  text: "text-rose-700",   dot: "bg-rose-400"  },
  delayed: { label: "Retrasado", icon: "⏰", bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-700",  dot: "bg-amber-400" },
  default: { label: "Pendiente", icon: "⏳", bg: "bg-slate-50",  border: "border-slate-200", text: "text-slate-600",  dot: "bg-slate-300" },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.default;
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-PA", { day: "numeric", month: "short" }) +
           " · " + d.toLocaleTimeString("es-PA", { hour: "2-digit", minute: "2-digit" });
  } catch { return dateStr; }
}

export default function MedicationHistory({ logs, medications, patientName }: Props) {
  const [filter, setFilter] = useState<"all" | "taken" | "missed" | "delayed">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Mapa de medicamentos para lookup rápido
  const medMap = useMemo(() => {
    const map: Record<string, Medication> = {};
    (medications || []).forEach(m => { map[m.medication_id] = m; });
    return map;
  }, [medications]);

  // Filtrar y ordenar logs
  const filtered = useMemo(() => {
    const arr = (logs || [])
      .filter(l => filter === "all" || l.status === filter)
      .sort((a, b) => new Date(b.created_at || b.scheduled_time).getTime() -
                      new Date(a.created_at || a.scheduled_time).getTime());
    return arr;
  }, [logs, filter]);

  // Estadísticas de adherencia
  const stats = useMemo(() => {
    const total   = (logs || []).length;
    const taken   = (logs || []).filter(l => l.status === "taken").length;
    const missed  = (logs || []).filter(l => l.status === "missed").length;
    const delayed = (logs || []).filter(l => l.status === "delayed").length;
    const pct     = total > 0 ? Math.round((taken / total) * 100) : 0;
    return { total, taken, missed, delayed, pct };
  }, [logs]);

  return (
    <div className="space-y-4">

      {/* Tarjeta de adherencia general */}
      <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg, #0D9488, #6366F1)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Adherencia</p>
            <p className="text-3xl font-bold">{stats.pct}%</p>
            <p className="text-white/70 text-xs mt-0.5">{patientName}</p>
          </div>
          <div className="text-5xl opacity-20">📊</div>
        </div>

        {/* Barra de progreso */}
        <div className="bg-white/20 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-white transition-all duration-700"
            style={{ width: `${stats.pct}%` }}
          />
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: "Tomados",   value: stats.taken,   icon: "✅" },
            { label: "Omitidos",  value: stats.missed,  icon: "❌" },
            { label: "Retrasados",value: stats.delayed, icon: "⏰" },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl p-2 text-center">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-white/70 text-xs">{s.icon} {s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Filtrar por estado</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "all",     label: "Todos",     count: stats.total   },
            { id: "taken",   label: "✅ Tomados", count: stats.taken   },
            { id: "missed",  label: "❌ Omitidos",count: stats.missed  },
            { id: "delayed", label: "⏰ Retraso", count: stats.delayed },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === f.id
                  ? "bg-teal-500 border-teal-500 text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                filter === f.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de registros */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm text-slate-500">No hay registros {filter !== "all" ? "con este filtro" : "aún"}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(log => {
            const s   = getStatus(log.status);
            const med = medMap[log.medication_id];
            const isExpanded = expanded === log.log_id;

            return (
              <button
                key={log.log_id}
                onClick={() => setExpanded(isExpanded ? null : log.log_id)}
                className={`w-full text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                  isExpanded ? `${s.border} ${s.bg}` : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                {/* Fila principal */}
                <div className="flex items-center gap-3 p-3.5">
                  <div className={`w-2 h-10 rounded-full flex-shrink-0 ${s.dot}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {med ? med.name : "Medicamento"}
                        {med && <span className="text-slate-400 font-normal"> · {med.dosage}</span>}
                      </p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 border ${s.bg} ${s.border} ${s.text}`}>
                        {s.icon} {s.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">
                        📅 {formatDateTime(log.scheduled_time)}
                      </span>
                      {log.administered_by && (
                        <span className="text-xs text-slate-400 truncate">
                          👤 {log.administered_by}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-slate-300 text-xs flex-shrink-0">{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* Detalle expandido */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 border-t border-white/50">
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-white/60 rounded-xl p-2.5">
                        <p className="text-xs text-slate-400 font-semibold">Programado</p>
                        <p className="text-xs text-slate-700 font-medium mt-0.5">
                          {formatDateTime(log.scheduled_time)}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-xl p-2.5">
                        <p className="text-xs text-slate-400 font-semibold">Administrado</p>
                        <p className="text-xs text-slate-700 font-medium mt-0.5">
                          {log.taken_time ? formatDateTime(log.taken_time) : "—"}
                        </p>
                      </div>
                    </div>
                    {log.notes && (
                      <div className="bg-white/60 rounded-xl p-2.5">
                        <p className="text-xs text-slate-400 font-semibold mb-1">📝 Notas del cuidador</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{log.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
