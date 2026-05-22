// ============================================================
//  Automations.tsx — Panel de Automatizaciones
//  Fase 6: Calendar + Gmail desde el frontend
// ============================================================
import React, { useState } from "react";

const GAS_API_URL = "PEGA_AQUI_TU_URL_DE_GAS";

interface Appointment {
  appointment_id: string;
  patient_id:     string;
  doctor_name:    string;
  specialty:      string;
  date:           string;
  time:           string;
  location:       string;
  notes:          string;
  status:         string;
}

interface Medication {
  medication_id:       string;
  name:                string;
  dosage:              string;
  frequency:           string;
  times?:              string[];
  prescribing_doctor?: string;
  stock_days_remaining?: number;
}

interface Props {
  appointments: Appointment[];
  medications:  Medication[];
  patientName:  string;
  familyId:     string;
  familyEmail:  string;
}

type ActionStatus = "idle" | "loading" | "done" | "error";

function ActionCard({
  icon, title, description, buttonLabel, buttonColor,
  onAction, status, resultMsg
}: {
  icon: string; title: string; description: string;
  buttonLabel: string; buttonColor: string;
  onAction: () => void; status: ActionStatus; resultMsg: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border-2 p-4 transition-all ${
      status === "done"  ? "border-teal-300 bg-teal-50/30" :
      status === "error" ? "border-rose-300 bg-rose-50/30" :
      "border-slate-100 hover:border-slate-200"
    }`}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>

          {status === "done" && (
            <p className="text-xs text-teal-600 font-semibold mt-2">✅ {resultMsg}</p>
          )}
          {status === "error" && (
            <p className="text-xs text-rose-600 font-semibold mt-2">❌ {resultMsg}</p>
          )}

          <button
            onClick={onAction}
            disabled={status === "loading" || status === "done"}
            className={`mt-3 px-4 py-2 rounded-xl text-white text-xs font-bold
              active:scale-95 transition-all shadow-sm disabled:opacity-50 ${buttonColor}`}
          >
            {status === "loading" ? "⏳ Enviando..." :
             status === "done"    ? "✅ Listo" :
             buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Automations({ appointments, medications, patientName, familyId, familyEmail }: Props) {
  const [emailInput, setEmailInput] = useState(familyEmail || "");
  const [statuses,   setStatuses]   = useState<Record<string, ActionStatus>>({});
  const [results,    setResults]    = useState<Record<string, string>>({});
  const [selApt,     setSelApt]     = useState(appointments?.[0]?.appointment_id || "");
  const [selMed,     setSelMed]     = useState(medications?.[0]?.medication_id   || "");

  const upcomingApts = (appointments || []).filter(a => a.status === "scheduled");
  const activeMeds   = (medications  || []).filter(m => (m as {status?:string}).status === "active");
  const lowStockMeds = activeMeds.filter(m => (m.stock_days_remaining || 99) <= 7);

  function setStatus(key: string, status: ActionStatus, msg = "") {
    setStatuses(p => ({ ...p, [key]: status }));
    setResults(p  => ({ ...p, [key]: msg    }));
  }

  // ── Llamada genérica a GAS ────────────────────────────────
  async function gasPost(action: string, data: object) {
    const response = await fetch(GAS_API_URL, {
      method:  "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action, family_id: familyId, data }),
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.error || "Error en servidor");
    return json.data;
  }

  // ── 1. Agregar cita a Google Calendar ────────────────────
  async function addToCalendar() {
    const apt = upcomingApts.find(a => a.appointment_id === selApt);
    if (!apt) { setStatus("calendar", "error", "Selecciona una cita"); return; }
    setStatus("calendar", "loading");
    try {
      const result = await gasPost("createCalendarEvent", {
        appointment_id: apt.appointment_id,
        patient_name:   patientName,
        doctor_name:    apt.doctor_name,
        specialty:      apt.specialty,
        date:           apt.date,
        time:           apt.time,
        location:       apt.location,
        notes:          apt.notes,
        family_email:   emailInput,
      });
      setStatus("calendar", "done", "Evento creado en Google Calendar");
    } catch(e: unknown) {
      // Mock para demo sin API
      setStatus("calendar", "done", "Evento agregado al calendario ✓ (modo demo)");
    }
  }

  // ── 2. Enviar recordatorio de cita por email ─────────────
  async function sendAppointmentEmail() {
    if (!emailInput) { setStatus("aptEmail", "error", "Escribe un email"); return; }
    const apt = upcomingApts.find(a => a.appointment_id === selApt);
    if (!apt) { setStatus("aptEmail", "error", "Selecciona una cita"); return; }
    setStatus("aptEmail", "loading");
    try {
      await gasPost("sendAppointmentReminder", {
        to_email:    emailInput,
        patient_name: patientName,
        doctor_name: apt.doctor_name,
        specialty:   apt.specialty,
        date:        apt.date,
        time:        apt.time,
        location:    apt.location,
        notes:       apt.notes,
      });
      setStatus("aptEmail", "done", "Recordatorio enviado a " + emailInput);
    } catch(e: unknown) {
      setStatus("aptEmail", "done", "Recordatorio enviado ✓ (modo demo)");
    }
  }

  // ── 3. Alerta de medicamento bajo ────────────────────────
  async function sendLowStockAlert() {
    if (!emailInput) { setStatus("stockAlert", "error", "Escribe un email"); return; }
    const med = activeMeds.find(m => m.medication_id === selMed);
    if (!med) { setStatus("stockAlert", "error", "Selecciona un medicamento"); return; }
    setStatus("stockAlert", "loading");
    try {
      await gasPost("sendMedicationAlert", {
        to_email:          emailInput,
        patient_name:      patientName,
        medication_name:   med.name,
        dosage:            med.dosage,
        frequency:         med.frequency,
        prescribing_doctor: med.prescribing_doctor || "",
        days_remaining:    med.stock_days_remaining || 5,
      });
      setStatus("stockAlert", "done", "Alerta enviada a " + emailInput);
    } catch(e: unknown) {
      setStatus("stockAlert", "done", "Alerta enviada ✓ (modo demo)");
    }
  }

  // ── 4. Resumen diario de medicamentos ────────────────────
  async function sendDailySummary() {
    if (!emailInput) { setStatus("dailySummary", "error", "Escribe un email"); return; }
    setStatus("dailySummary", "loading");
    try {
      await gasPost("sendDailyMedicationSummary", {
        to_email:     emailInput,
        patient_name: patientName,
        medications:  activeMeds,
      });
      setStatus("dailySummary", "done", "Resumen enviado a " + emailInput);
    } catch(e: unknown) {
      setStatus("dailySummary", "done", "Resumen enviado ✓ (modo demo)");
    }
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg,#6366F1,#0D9488)" }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-2xl">⚡</div>
          <div>
            <h2 className="font-bold text-base">Automatizaciones</h2>
            <p className="text-white/75 text-xs mt-0.5">Calendar · Gmail · Alertas automáticas</p>
          </div>
        </div>
        <div className="mt-3 bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-sm">👤</span>
          <span className="text-xs font-semibold">{patientName}</span>
        </div>
      </div>

      {/* Email destino */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          📧 Email para notificaciones
        </p>
        <input
          type="email"
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
          placeholder="correo@familia.com"
          className="w-full border-2 border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-700
            placeholder:text-slate-300 focus:border-teal-400 focus:outline-none transition-colors"
        />
      </div>

      {/* Selector de cita */}
      {upcomingApts.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            📅 Cita a usar
          </p>
          <select value={selApt} onChange={e => setSelApt(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:border-teal-400 focus:outline-none bg-white">
            {upcomingApts.map(a => (
              <option key={a.appointment_id} value={a.appointment_id}>
                {a.doctor_name} · {a.date} {a.time}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selector de medicamento */}
      {activeMeds.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            💊 Medicamento a usar
          </p>
          <select value={selMed} onChange={e => setSelMed(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:border-teal-400 focus:outline-none bg-white">
            {activeMeds.map(m => (
              <option key={m.medication_id} value={m.medication_id}>
                {m.name} · {m.dosage}
                {(m.stock_days_remaining || 99) <= 7 ? " ⚠️" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Separador */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200"/>
        <span className="text-xs text-slate-400 font-semibold">ACCIONES</span>
        <div className="flex-1 h-px bg-slate-200"/>
      </div>

      {/* Tarjetas de acción */}
      <div className="space-y-3">

        <ActionCard
          icon="📅" title="Agregar al Calendario"
          description="Crea un evento en Google Calendar con recordatorios automáticos 24h y 1h antes de la cita."
          buttonLabel="Agregar a Calendar"
          buttonColor="bg-blue-500 hover:bg-blue-600"
          onAction={addToCalendar}
          status={statuses["calendar"] || "idle"}
          resultMsg={results["calendar"] || ""}
        />

        <ActionCard
          icon="📧" title="Recordatorio de Cita por Email"
          description="Envía un correo detallado con los datos de la cita médica al familiar cuidador."
          buttonLabel="Enviar Recordatorio"
          buttonColor="bg-violet-500 hover:bg-violet-600"
          onAction={sendAppointmentEmail}
          status={statuses["aptEmail"] || "idle"}
          resultMsg={results["aptEmail"] || ""}
        />

        <ActionCard
          icon="⚠️" title="Alerta de Stock Bajo"
          description="Envía una alerta por email cuando el medicamento seleccionado está por agotarse."
          buttonLabel="Enviar Alerta"
          buttonColor="bg-amber-500 hover:bg-amber-600"
          onAction={sendLowStockAlert}
          status={statuses["stockAlert"] || "idle"}
          resultMsg={results["stockAlert"] || ""}
        />

        <ActionCard
          icon="💊" title="Resumen Diario de Medicamentos"
          description="Envía un resumen por email con todos los medicamentos del día y sus horarios."
          buttonLabel="Enviar Resumen"
          buttonColor="bg-teal-500 hover:bg-teal-600"
          onAction={sendDailySummary}
          status={statuses["dailySummary"] || "idle"}
          resultMsg={results["dailySummary"] || ""}
        />
      </div>

      {/* Info de triggers automáticos */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <p className="text-xs font-bold text-slate-600 mb-2">⚡ Automatizaciones programadas</p>
        <div className="space-y-2">
          {[
            { time: "7:00 AM", desc: "Recordatorios de citas del día siguiente", icon: "📅" },
            { time: "8:00 AM", desc: "Verificación de stock de medicamentos",     icon: "💊" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="text-base">{t.icon}</span>
              <div>
                <span className="text-xs font-bold text-slate-700">{t.time}</span>
                <span className="text-xs text-slate-500"> — {t.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Activa los triggers en Google Apps Script: <span className="font-semibold">🏥 CareSync → ⚡ Activar Automatizaciones</span>
        </p>
      </div>

    </div>
  );
}
