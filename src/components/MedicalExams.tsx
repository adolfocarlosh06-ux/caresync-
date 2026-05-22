// ============================================================
//  MedicalExams.tsx — Repositorio de Exámenes Médicos
//  Fase 5: Subir, ver y gestionar exámenes en Google Drive
// ============================================================
import React, { useState, useRef } from "react";

const GAS_API_URL = "PEGA_AQUI_TU_URL_DE_GAS";

const EXAM_TYPES = [
  "Resonancia Magnética (MRI)",
  "Tomografía (TAC)",
  "Radiografía",
  "Electroencefalograma (EEG)",
  "Ecocardiograma",
  "Resultado de Laboratorio",
  "Audiometría",
  "Evaluación Psicológica",
  "Informe de Terapia",
  "Otro",
];

type UploadStatus = "idle" | "preview" | "uploading" | "done" | "error";

interface Exam {
  exam_id:        string;
  patient_id:     string;
  exam_type:      string;
  exam_date:      string;
  lab_name:       string;
  doctor_ordered: string;
  drive_file_url: string;
  drive_file_id:  string;
  summary:        string;
  status:         string;
  created_at:     string;
}

interface Props {
  exams:       Exam[];
  patientName: string;
  patientId:   string;
  familyId:    string;
  onExamAdded: (exam: Exam) => void;
}

// ── Subcomponente: Tarjeta de examen existente ────────────────
function ExamCard({ exam, onDelete }: { exam: Exam; onDelete: (exam: Exam) => void }) {
  const [showDelete, setShowDelete] = useState(false);

  const statusConfig = {
    uploaded:       { label: "✓ Subido",   bg: "bg-teal-50",   text: "text-teal-700",  border: "border-teal-200"  },
    pending_upload: { label: "⏳ Pendiente",bg: "bg-amber-50",  text: "text-amber-700", border: "border-amber-200" },
    deleted:        { label: "🗑 Eliminado", bg: "bg-slate-50",  text: "text-slate-500", border: "border-slate-200" },
  };
  const s = statusConfig[exam.status as keyof typeof statusConfig] || statusConfig.pending_upload;

  const examIcons: Record<string, string> = {
    "Resonancia": "🧲", "Tomografía": "💿", "Radiografía": "🩻",
    "Electro": "⚡", "Ecoca": "❤️", "Laboratorio": "🧪",
    "Audio": "👂", "Psicológ": "🧠", "Terapia": "💬", "default": "📋"
  };
  function getIcon(type: string) {
    for (const key in examIcons) {
      if (type?.includes(key)) return examIcons[key];
    }
    return examIcons.default;
  }

  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm transition-all ${
      showDelete ? "border-rose-300" : "border-slate-100 hover:border-slate-200"
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-blue-100">
            {getIcon(exam.exam_type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-slate-800 text-sm leading-tight">{exam.exam_type}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${s.bg} ${s.text} ${s.border}`}>
                {s.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {exam.exam_date && (
                <span className="text-xs text-slate-500">📅 {exam.exam_date}</span>
              )}
              {exam.lab_name && (
                <span className="text-xs text-slate-400">· {exam.lab_name}</span>
              )}
            </div>
            {exam.doctor_ordered && (
              <p className="text-xs text-slate-500 mt-0.5">🩺 {exam.doctor_ordered}</p>
            )}
          </div>
        </div>

        {exam.summary && (
          <div className="mt-3 bg-slate-50 rounded-xl px-3 py-2">
            <p className="text-xs text-slate-600 leading-relaxed">{exam.summary}</p>
          </div>
        )}

        {/* Botones de acción */}
        {exam.status === "uploaded" && exam.drive_file_url && (
          <div className="flex gap-2 mt-3">
            <a
              href={exam.drive_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold
                hover:bg-blue-100 active:scale-95 transition-all"
            >
              <span>👁</span> Ver en Drive
            </a>
            <a
              href={`https://drive.google.com/uc?export=download&id=${exam.drive_file_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold
                hover:bg-teal-100 active:scale-95 transition-all"
            >
              <span>⬇️</span> Descargar
            </a>
            <button
              onClick={() => setShowDelete(!showDelete)}
              className="w-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-sm hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-all"
            >
              🗑
            </button>
          </div>
        )}

        {/* Confirmar eliminación */}
        {showDelete && (
          <div className="mt-2 bg-rose-50 border border-rose-200 rounded-xl p-3">
            <p className="text-xs text-rose-700 font-semibold mb-2">¿Eliminar este examen permanentemente?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { onDelete(exam); setShowDelete(false); }}
                className="flex-1 bg-rose-500 text-white text-xs font-bold py-2 rounded-lg active:scale-95 transition-all"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function MedicalExams({ exams, patientName, patientId, familyId, onExamAdded }: Props) {
  const [showUpload,    setShowUpload]    = useState(false);
  const [uploadStatus,  setUploadStatus]  = useState<UploadStatus>("idle");
  const [previewUrl,    setPreviewUrl]    = useState<string | null>(null);
  const [selectedFile,  setSelectedFile]  = useState<File | null>(null);
  const [error,         setError]         = useState("");
  const [localExams,    setLocalExams]    = useState<Exam[]>(exams || []);

  // Formulario
  const [examType,       setExamType]       = useState(EXAM_TYPES[0]);
  const [examDate,       setExamDate]       = useState(new Date().toISOString().slice(0,10));
  const [labName,        setLabName]        = useState("");
  const [doctorOrdered,  setDoctorOrdered]  = useState("");
  const [notes,          setNotes]          = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const activeExams  = localExams.filter(e => e.status !== "deleted");
  const pendingExams = activeExams.filter(e => e.status === "pending_upload");

  // ── Seleccionar archivo ───────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { setError("El archivo no debe superar 15MB."); return; }
    setError("");
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = ev => { setPreviewUrl(ev.target?.result as string); setUploadStatus("preview"); };
    reader.readAsDataURL(file);
  }

  // ── Subir a Drive vía GAS ────────────────────────────────
  async function handleUpload() {
    if (!selectedFile || !previewUrl) return;
    setUploadStatus("uploading");
    setError("");

    try {
      const base64 = previewUrl.split(",")[1];

      const response = await fetch(GAS_API_URL, {
        method:  "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action:    "uploadMedicalExam",
          family_id: familyId,
          data: {
            patient_id:      patientId,
            exam_type:       examType,
            exam_date:       examDate,
            lab_name:        labName,
            doctor_ordered:  doctorOrdered,
            notes,
            file_base64:     base64,
            file_name:       selectedFile.name,
            file_mime_type:  selectedFile.type,
          },
        }),
      });

      const json = await response.json();
      if (!json.success) throw new Error(json.error || "Error al subir el archivo.");

      const newExam: Exam = {
        exam_id:        json.data.exam_id,
        patient_id:     patientId,
        exam_type:      examType,
        exam_date:      examDate,
        lab_name:       labName,
        doctor_ordered: doctorOrdered,
        drive_file_url: json.data.drive_file_url,
        drive_file_id:  json.data.drive_file_id,
        summary:        notes,
        status:         "uploaded",
        created_at:     new Date().toISOString(),
      };

      setLocalExams(prev => [newExam, ...prev]);
      onExamAdded(newExam);
      setUploadStatus("done");
      setTimeout(() => { resetForm(); setShowUpload(false); }, 2000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir. Intenta de nuevo.");
      setUploadStatus("error");
    }
  }

  // ── Eliminar examen ───────────────────────────────────────
  async function handleDelete(exam: Exam) {
    try {
      if (exam.drive_file_id) {
        await fetch(GAS_API_URL, {
          method:  "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            action:    "deleteMedicalExam",
            family_id: familyId,
            data: { exam_id: exam.exam_id, drive_file_id: exam.drive_file_id },
          }),
        });
      }
      setLocalExams(prev => prev.map(e => e.exam_id === exam.exam_id ? { ...e, status: "deleted" } : e));
    } catch {
      // Mock: eliminar localmente
      setLocalExams(prev => prev.map(e => e.exam_id === exam.exam_id ? { ...e, status: "deleted" } : e));
    }
  }

  function resetForm() {
    setUploadStatus("idle"); setPreviewUrl(null); setSelectedFile(null);
    setExamType(EXAM_TYPES[0]); setExamDate(new Date().toISOString().slice(0,10));
    setLabName(""); setDoctorOrdered(""); setNotes(""); setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">🧪 Exámenes Médicos</h2>
          <p className="text-xs text-slate-500 mt-0.5">{patientName} · {activeExams.length} archivo{activeExams.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setShowUpload(!showUpload); resetForm(); }}
          className="flex items-center gap-1.5 bg-teal-500 text-white text-xs font-bold
            px-3 py-2.5 rounded-xl shadow-md shadow-teal-200 active:scale-95 transition-all"
        >
          <span>+</span> Subir
        </button>
      </div>

      {/* Alerta de pendientes */}
      {pendingExams.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-bold text-amber-800">
              {pendingExams.length} examen{pendingExams.length > 1 ? "es" : ""} sin subir
            </p>
            <p className="text-xs text-amber-600 mt-0.5">Súbelos para tener el expediente completo</p>
          </div>
        </div>
      )}

      {/* ── FORMULARIO DE SUBIDA ──────────────────────────── */}
      {showUpload && (
        <div className="bg-white rounded-2xl border-2 border-teal-200 overflow-hidden shadow-md">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <p className="font-bold text-slate-800 text-sm">📁 Subir nuevo examen</p>
            <button onClick={() => { setShowUpload(false); resetForm(); }}
              className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">✕</button>
          </div>

          <div className="p-4 space-y-3">
            {/* Tipo de examen */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tipo de examen</p>
              <select value={examType} onChange={e => setExamType(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:border-teal-400 focus:outline-none bg-white">
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Fecha y laboratorio */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Fecha</p>
                <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:border-teal-400 focus:outline-none" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Laboratorio</p>
                <input type="text" placeholder="Ej: Lab. Pacífico" value={labName} onChange={e => setLabName(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:border-teal-400 focus:outline-none" />
              </div>
            </div>

            {/* Médico que ordenó */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Ordenado por</p>
              <input type="text" placeholder="Ej: Dra. Rosa Morales" value={doctorOrdered} onChange={e => setDoctorOrdered(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:border-teal-400 focus:outline-none" />
            </div>

            {/* Notas / resumen */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Resumen o notas</p>
              <textarea placeholder="Ej: Resultados normales para su edad..." value={notes} onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:border-teal-400 focus:outline-none resize-none" />
            </div>

            {/* Zona de archivo */}
            <input ref={fileRef} type="file" accept="image/*,application/pdf"
              capture="environment" onChange={handleFileChange} className="hidden" id="exam-file-input" />

            {uploadStatus === "idle" && (
              <label htmlFor="exam-file-input"
                className="flex flex-col items-center gap-3 w-full border-2 border-dashed border-blue-300
                  rounded-2xl p-6 bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-colors">
                <div className="w-12 h-12 bg-white rounded-xl shadow flex items-center justify-center text-3xl">📎</div>
                <div className="text-center">
                  <p className="font-bold text-blue-700 text-sm">Toca para adjuntar archivo</p>
                  <p className="text-xs text-blue-400 mt-1">PDF · JPG · PNG — máx. 15MB</p>
                </div>
              </label>
            )}

            {uploadStatus === "preview" && previewUrl && selectedFile && (
              <div className="space-y-2">
                <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-slate-200">
                  <span className="text-2xl">{selectedFile.type === "application/pdf" ? "📄" : "🖼"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={resetForm} className="text-slate-400 hover:text-rose-500 text-lg transition-colors">✕</button>
                </div>
                {selectedFile.type.startsWith("image/") && (
                  <img src={previewUrl} alt="Preview" className="w-full max-h-40 object-contain rounded-xl border border-slate-200 bg-slate-50" />
                )}
              </div>
            )}

            {uploadStatus === "uploading" && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-3 border-blue-300 border-t-blue-600 animate-spin flex-shrink-0" style={{borderWidth:"3px"}} />
                <div>
                  <p className="text-sm font-bold text-blue-700">Subiendo a Google Drive...</p>
                  <p className="text-xs text-blue-500 mt-0.5">Esto puede tomar unos segundos</p>
                </div>
              </div>
            )}

            {uploadStatus === "done" && (
              <div className="bg-teal-50 border border-teal-300 rounded-2xl p-4 text-center">
                <p className="text-3xl mb-1">✅</p>
                <p className="font-bold text-teal-700 text-sm">¡Archivo subido exitosamente!</p>
                <p className="text-xs text-teal-500 mt-0.5">Guardado en Google Drive</p>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2">
                <span className="text-rose-500">⚠️</span>
                <p className="text-xs text-rose-700">{error}</p>
              </div>
            )}

            {/* Botón subir */}
            {(uploadStatus === "preview" || uploadStatus === "error") && (
              <button onClick={handleUpload}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm
                  active:scale-95 transition-all shadow-lg shadow-blue-200"
                style={{ background: "linear-gradient(135deg,#2563EB,#0D9488)" }}>
                📤 Subir a Google Drive
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── LISTA DE EXÁMENES ─────────────────────────────── */}
      {activeExams.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <p className="text-4xl mb-3">🗂</p>
          <p className="font-semibold text-slate-600 text-sm">No hay exámenes registrados</p>
          <p className="text-xs text-slate-400 mt-1">Toca "+ Subir" para agregar el primer examen</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeExams.map(exam => (
            <ExamCard key={exam.exam_id} exam={exam} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
