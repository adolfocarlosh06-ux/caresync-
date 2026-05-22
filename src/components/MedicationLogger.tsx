// ============================================================
//  MedicationLogger.tsx — Registro Interactivo de Tomas
//  Fase 4: Marcar como tomado/omitido/retrasado + notas
// ============================================================
import React, { useState } from "react";

type LogStatus = "taken" | "missed" | "delayed";

interface Medication {
  medication_id: string;
  patient_id:    string;
  name:          string;
  dosage:        string;
  times?:        string[];
  instructions?: string;
}

interface Props {
  medication:    Medication | null;
  patientName:   string;
  familyId:      string;
  onLog:         (payload: object) => Promise<unknown>;
  onClose:       () => void;
}

const STATUS_OPTIONS: { id: LogStatus; label: string; icon: string; desc: string; color: string; active: string }[] = [
  {
    id:     "taken",
    label:  "Tomado",
    icon:   "✅",
    desc:   "El medicamento fue administrado correctamente",
    color:  "border-slate-200 bg-white text-slate-700",
    active: "border-teal-400 bg-teal-50 text-teal-700 shadow-md shadow-teal-100",
  },
  {
    id:     "missed",
    label:  "Omitido",
    icon:   "❌",
    desc:   "No se administró en el horario programado",
    color:  "border-slate-200 bg-white text-slate-700",
    active: "border-rose-400 bg-rose-50 text-rose-700 shadow-md shadow-rose-100",
  },
  {
    id:     "delayed",
    label:  "Retrasado",
    icon:   "⏰",
    desc:   "Se administró fuera del horario programado",
    color:  "border-slate-200 bg-white text-slate-700",
    active: "border-amber-400 bg-amber-50 text-amber-700 shadow-md shadow-amber-100",
  },
];

export default function MedicationLogger({ medication, patientName, familyId, onLog, onClose }: Props) {
  const [selectedStatus,  setSelectedStatus]  = useState<LogStatus>("taken");
  const [selectedTime,    setSelectedTime]    = useState(medication?.times?.[0] || "");
  const [administeredBy,  setAdministeredBy]  = useState("");
  const [notes,           setNotes]           = useState("");
  const [saving,          setSaving]          = useState(false);
  const [saved,           setSaved]           = useState(false);
  const [error,           setError]           = useState("");

  if (!medication) return null;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const timeStr  = now.toTimeString().slice(0, 5);

  async function handleSubmit() {
    if (!selectedTime) { setError("Selecciona el horario programado."); return; }
    setSaving(true);
    setError("");

    try {
      const payload = {
        medication_id:   medication.medication_id,
        patient_id:      medication.patient_id,
        scheduled_time:  `${todayStr} ${selectedTime}`,
        taken_time:      selectedStatus === "taken" || selectedStatus === "delayed"
                           ? `${todayStr} ${timeStr}`
                           : "",
        status:          selectedStatus,
        administered_by: administeredBy.trim(),
        notes:           notes.trim(),
      };

      await onLog(payload);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}>

      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: "92vh", overflowY: "auto" }}>

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-4 pt-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">Registrar Toma</h3>
              <p className="text-sm text-slate-500 mt-0.5">{patientName}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              ✕
            </button>
          </div>

          {/* Info del medicamento */}
          <div className="mt-3 bg-teal-50 border border-teal-200 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💊</div>
            <div>
              <p className="font-bold text-teal-800 text-sm">{medication.name}</p>
              <p className="text-xs text-teal-600">{medication.dosage} · {medication.instructions}</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-6 space-y-5">

          {/* Selector de estado */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              ¿Cómo fue administrado?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedStatus(opt.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 ${
                    selectedStatus === opt.id ? opt.active : opt.color
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-xs font-bold leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              {STATUS_OPTIONS.find(o => o.id === selectedStatus)?.desc}
            </p>
          </div>

          {/* Selector de horario programado */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              🕐 Horario programado
            </p>
            {medication.times && medication.times.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {medication.times.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTime(t)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                      selectedTime === t
                        ? "border-teal-400 bg-teal-50 text-teal-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="time"
                value={selectedTime}
                onChange={e => setSelectedTime(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:border-teal-400 focus:outline-none"
              />
            )}
          </div>

          {/* Administrado por */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              👤 Administrado por
            </p>
            <input
              type="text"
              placeholder="Ej: María García (mamá)"
              value={administeredBy}
              onChange={e => setAdministeredBy(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-700
                placeholder:text-slate-300 focus:border-teal-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Notas del cuidador */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              📝 Notas u observaciones
            </p>
            <textarea
              placeholder={
                selectedStatus === "missed"  ? "Ej: La paciente estaba dormida durante la cita médica..." :
                selectedStatus === "delayed" ? "Ej: Se administró 30 minutos tarde por visita familiar..." :
                "Ej: Lo tomó sin dificultad, buen ánimo..."
              }
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full border-2 border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-700
                placeholder:text-slate-300 focus:border-teal-400 focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2">
              <span className="text-rose-500">⚠️</span>
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          )}

          {/* Botón guardar */}
          <button
            onClick={handleSubmit}
            disabled={saving || saved}
            className={`w-full py-4 rounded-2xl text-white font-bold text-base
              transition-all active:scale-95 shadow-lg ${
                saved    ? "bg-emerald-500 shadow-emerald-200" :
                saving   ? "bg-slate-300 cursor-not-allowed" :
                selectedStatus === "taken"   ? "shadow-teal-200"  :
                selectedStatus === "missed"  ? "shadow-rose-200"  :
                "shadow-amber-200"
              }`}
            style={!saving && !saved ? {
              background: selectedStatus === "taken"
                ? "linear-gradient(135deg, #0D9488, #34D399)"
                : selectedStatus === "missed"
                ? "linear-gradient(135deg, #E11D48, #FB7185)"
                : "linear-gradient(135deg, #D97706, #FCD34D)"
            } : {}}
          >
            {saved   ? "✅ ¡Registrado correctamente!" :
             saving  ? "Guardando..." :
             selectedStatus === "taken"   ? "✅ Confirmar Toma" :
             selectedStatus === "missed"  ? "❌ Registrar Omisión" :
             "⏰ Registrar Retraso"}
          </button>

          {/* Fecha y hora actual */}
          <p className="text-center text-xs text-slate-400">
            📅 {todayStr} · 🕐 {timeStr} (hora actual)
          </p>
        </div>
      </div>
    </div>
  );
}
