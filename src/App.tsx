// ============================================================
//  CARESYNC — App.tsx (Fase 6 — Automatizaciones)
// ============================================================
import React, { useState } from "react";
import { useFamilyData }   from "./hooks/useFamilyData";
import PatientCard         from "./components/PatientCard";
import ProximasCitas       from "./components/ProximasCitas";
import MedicamentosHoy     from "./components/MedicamentosHoy";
import AlertasCriticas     from "./components/AlertasCriticas";
import GeminiOCR           from "./components/GeminiOCR";
import MedicationManager   from "./components/MedicationManager";
import MedicationLogger    from "./components/MedicationLogger";
import MedicationHistory   from "./components/MedicationHistory";
import MedicalExams        from "./components/MedicalExams";
import Automations         from "./components/Automations";

const FAMILY_OPTIONS = [
  { id: "FAM_001", label: "Familia García López",  email: "garcia.lopez@email.com"   },
  { id: "FAM_002", label: "Familia Martínez Soto", email: "martinez.soto@email.com"  },
];

const NAV_ITEMS = [
  { id: "inicio",       icon: "🏠", label: "Inicio"  },
  { id: "citas",        icon: "📅", label: "Citas"   },
  { id: "ia",           icon: "🤖", label: "IA",      highlight: true },
  { id: "medicamentos", icon: "💊", label: "Meds"    },
  { id: "examenes",     icon: "🧪", label: "Exáms"   },
];

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />;
}
function LoadingState() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-24 w-full" /><Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" />
    </div>
  );
}

export default function App() {
  const [familyId,         setFamilyId]        = useState("FAM_001");
  const [activePatientIdx, setActivePatientIdx] = useState(0);
  const [activeTab,        setActiveTab]        = useState("inicio");
  const [showFamilyMenu,   setShowFamilyMenu]   = useState(false);
  const [medTab,           setMedTab]           = useState<"hoy"|"gestionar"|"historial">("hoy");
  const [examsTab,         setExamsTab]         = useState<"examenes"|"automatizaciones">("examenes");
  const [logTarget,        setLogTarget]        = useState<object | null>(null);

  const { data, loading, error, logMedication } = useFamilyData(familyId);

  const currentFamily = FAMILY_OPTIONS.find(f => f.id === familyId);
  const patient       = data?.patients?.[activePatientIdx]  || null;
  const patientMeds   = data?.medications?.filter((m: {patient_id:string}) => m.patient_id === patient?.patient_id) || [];
  const patientApts   = data?.appointments?.filter((a: {patient_id:string}) => a.patient_id === patient?.patient_id) || [];
  const patientExms   = data?.exams?.filter((e: {patient_id:string}) => e.patient_id === patient?.patient_id) || [];
  const patientLogs   = data?.logsArray?.filter((l: {patient_id:string}) => l.patient_id === patient?.patient_id) || [];

  function handleFamilyChange(id: string) {
    setFamilyId(id); setActivePatientIdx(0); setShowFamilyMenu(false);
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#E0F7F4 0%,#EEF4FF 60%,#F5F0FF 100%)" }}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 px-4 pt-10 pb-3"
          style={{ background: "linear-gradient(180deg,rgba(224,247,244,0.97) 80%,transparent)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-400 flex items-center justify-center shadow-md shadow-teal-200">
                <span className="text-white text-lg">🩺</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 leading-none tracking-tight">CareSync</h1>
                <p className="text-xs text-slate-500 leading-none mt-0.5">Tu asistente médico familiar</p>
              </div>
            </div>
            <div className="relative">
              <button onClick={() => setShowFamilyMenu(!showFamilyMenu)}
                className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
                <span className="text-xs font-semibold text-slate-700 max-w-[90px] truncate">
                  {data?.family?.family_name?.replace("Familia ","") || "..."}
                </span>
                <span className="text-slate-400 text-xs">{showFamilyMenu ? "▲" : "▼"}</span>
              </button>
              {showFamilyMenu && (
                <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden w-52">
                  <p className="text-xs text-slate-400 font-semibold px-3 pt-3 pb-1 uppercase tracking-wider">Demo Multi-Tenant</p>
                  {FAMILY_OPTIONS.map(f => (
                    <button key={f.id} onClick={() => handleFamilyChange(f.id)}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-teal-50 flex items-center justify-between ${
                        f.id === familyId ? "text-teal-700 font-semibold bg-teal-50" : "text-slate-700"}`}>
                      <span>{f.label}</span>
                      {f.id === familyId && <span className="text-teal-500 text-xs">● activa</span>}
                    </button>
                  ))}
                  <div className="px-3 py-2 border-t border-slate-100">
                    <p className="text-xs text-slate-400">🔒 Datos aislados por familia</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-teal-100 border border-teal-200 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-medium text-teal-700">{familyId} · {data?.family?.plan || "—"}</span>
            </div>
          </div>
        </header>

        {/* ── CONTENIDO ──────────────────────────────────────── */}
        <main className="flex-1 px-4 pb-28 overflow-y-auto">
          {error && <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4 text-sm text-rose-700">⚠️ {error}</div>}
          {loading ? <LoadingState /> : (
            <div className="space-y-5 pt-2">

              {/* ── INICIO ─────────────────────────────────── */}
              {activeTab === "inicio" && (
                <>
                  <section>
                    <h2 className="text-base font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                      <span>👤</span>{(data?.patients?.length||0)>1?"Pacientes":"Paciente"}
                    </h2>
                    <div className="space-y-2.5">
                      {(data?.patients||[]).map((p: object, idx: number) => (
                        <PatientCard key={(p as {patient_id:string}).patient_id} patient={p} isActive={idx===activePatientIdx} onClick={()=>setActivePatientIdx(idx)} />
                      ))}
                    </div>
                  </section>
                  {patient && (<>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-200"/>
                      <span className="text-xs text-slate-400 font-medium">Resumen de {patient.name.split(" ")[0]}</span>
                      <div className="flex-1 h-px bg-slate-200"/>
                    </div>
                    <AlertasCriticas medications={patientMeds} exams={patientExms} />
                    <ProximasCitas appointments={patientApts} />
                    <MedicamentosHoy medications={patientMeds} logs={data?.logs||{}} patientName={patient.name.split(" ")[0]} />
                  </>)}
                  {/* Banners de acceso rápido */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={()=>setActiveTab("ia")}
                      className="rounded-2xl p-3 text-white text-left shadow-md active:scale-95 transition-transform"
                      style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>
                      <p className="text-xl mb-1">🤖</p>
                      <p className="font-bold text-xs">IA Médica</p>
                      <p className="text-white/70 text-xs">Analizar docs</p>
                    </button>
                    <button onClick={()=>{setActiveTab("examenes");setExamsTab("automatizaciones");}}
                      className="rounded-2xl p-3 text-white text-left shadow-md active:scale-95 transition-transform"
                      style={{background:"linear-gradient(135deg,#6366F1,#0D9488)"}}>
                      <p className="text-xl mb-1">⚡</p>
                      <p className="font-bold text-xs">Automatizar</p>
                      <p className="text-white/70 text-xs">Calendar · Gmail</p>
                    </button>
                  </div>
                </>
              )}

              {/* ── CITAS ──────────────────────────────────── */}
              {activeTab === "citas" && (
                <><h2 className="text-lg font-bold text-slate-800 pt-2">📅 Próximas Citas</h2>
                <ProximasCitas appointments={patientApts}/>
                {patient && (
                  <button onClick={()=>{setActiveTab("examenes");setExamsTab("automatizaciones");}}
                    className="w-full rounded-2xl p-4 text-white text-left shadow-lg active:scale-95 transition-transform"
                    style={{background:"linear-gradient(135deg,#6366F1,#0D9488)"}}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">📅</div>
                      <div><p className="font-bold text-sm">Agregar al Calendario</p><p className="text-white/75 text-xs mt-0.5">Crear evento y recordatorio →</p></div>
                    </div>
                  </button>
                )}</>
              )}

              {/* ── IA ──────────────────────────────────────── */}
              {activeTab === "ia" && (
                <GeminiOCR patientName={patient?.name||""} familyId={familyId} />
              )}

              {/* ── MEDICAMENTOS ────────────────────────────── */}
              {activeTab === "medicamentos" && (
                <>
                  <div className="flex gap-1.5 bg-slate-100 rounded-2xl p-1.5">
                    {[{id:"hoy",label:"📋 Hoy"},{id:"gestionar",label:"💊 Gestionar"},{id:"historial",label:"📊 Historial"}].map(t=>(
                      <button key={t.id} onClick={()=>setMedTab(t.id as typeof medTab)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${medTab===t.id?"bg-white text-teal-700 shadow-sm":"text-slate-500"}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {medTab==="hoy"      && <MedicamentosHoy medications={patientMeds} logs={data?.logs||{}} patientName={patient?.name?.split(" ")[0]||""} />}
                  {medTab==="gestionar"&& <MedicationManager medications={patientMeds} patientName={patient?.name||""} onLogRequest={(med:object)=>setLogTarget(med)} />}
                  {medTab==="historial"&& <MedicationHistory logs={patientLogs} medications={patientMeds} patientName={patient?.name?.split(" ")[0]||"Paciente"} />}
                </>
              )}

              {/* ── EXÁMENES + AUTOMATIZACIONES ─────────────── */}
              {activeTab === "examenes" && (
                <>
                  <div className="flex gap-1.5 bg-slate-100 rounded-2xl p-1.5">
                    {[{id:"examenes",label:"🧪 Exámenes"},{id:"automatizaciones",label:"⚡ Automatizar"}].map(t=>(
                      <button key={t.id} onClick={()=>setExamsTab(t.id as typeof examsTab)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${examsTab===t.id?"bg-white text-teal-700 shadow-sm":"text-slate-500"}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {examsTab==="examenes" && patient && (
                    <MedicalExams
                      exams={patientExms} patientName={patient.name}
                      patientId={patient.patient_id} familyId={familyId}
                      onExamAdded={(e)=>console.log("Nuevo examen:", e)}
                    />
                  )}

                  {examsTab==="automatizaciones" && patient && (
                    <Automations
                      appointments={patientApts}
                      medications={patientMeds}
                      patientName={patient.name}
                      familyId={familyId}
                      familyEmail={currentFamily?.email || ""}
                    />
                  )}
                </>
              )}

            </div>
          )}
        </main>

        {/* ── NAVEGACIÓN ─────────────────────────────────────── */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40
          bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-2xl pb-safe">
          <div className="flex items-center justify-around px-1 py-2">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={()=>setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] ${
                  item.highlight
                    ? activeTab===item.id
                      ? "bg-gradient-to-br from-violet-500 to-teal-500 text-white shadow-lg scale-110"
                      : "bg-gradient-to-br from-violet-400 to-teal-400 text-white shadow-md scale-105"
                    : activeTab===item.id?"bg-teal-50 text-teal-600":"text-slate-400"}`}>
                <span className="text-lg leading-none">{item.icon}</span>
                <span className={`text-[9px] font-semibold leading-none ${
                  item.highlight?"text-white":activeTab===item.id?"text-teal-600":"text-slate-400"}`}>
                  {item.label}
                </span>
                {activeTab===item.id&&!item.highlight&&<div className="w-1 h-1 rounded-full bg-teal-500"/>}
              </button>
            ))}
          </div>
        </nav>

        {/* ── MODAL MEDICATION LOGGER ────────────────────────── */}
        {logTarget && (
          <MedicationLogger
            medication={logTarget as Parameters<typeof MedicationLogger>[0]["medication"]}
            patientName={patient?.name||""}
            familyId={familyId}
            onLog={logMedication}
            onClose={()=>setLogTarget(null)}
          />
        )}

      </div>
    </div>
  );
}
