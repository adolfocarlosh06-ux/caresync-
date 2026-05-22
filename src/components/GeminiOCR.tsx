// ============================================================
//  GeminiOCR.tsx — Módulo OCR Médico (Fase 3 — via GAS + Gemini)
//  El frontend sube la imagen → GAS la envía a Gemini → devuelve resultado
// ============================================================
import React, { useState, useRef } from "react";

// ── PON AQUÍ TU URL DE LA WEB APP DE GOOGLE APPS SCRIPT ─────
// Es la misma URL que obtuviste en la Fase 1
const GAS_API_URL = "PEGA_AQUI_TU_URL_DE_GAS";

// ── Tipos de documento ────────────────────────────────────────
const DOC_TYPES = [
  { id: "receta",      label: "Receta Médica",    icon: "💊", color: "teal"   },
  { id: "laboratorio", label: "Resultado de Lab", icon: "🧪", color: "blue"   },
  { id: "imagen",      label: "Imagen Médica",    icon: "🩻", color: "violet" },
  { id: "informe",     label: "Informe Médico",   icon: "📋", color: "amber"  },
];

const COLOR_MAP: Record<string, { active: string; border: string }> = {
  teal:   { active: "bg-teal-50 border-teal-400 text-teal-700",     border: "border-slate-200 text-slate-600" },
  blue:   { active: "bg-blue-50 border-blue-400 text-blue-700",     border: "border-slate-200 text-slate-600" },
  violet: { active: "bg-violet-50 border-violet-400 text-violet-700", border: "border-slate-200 text-slate-600" },
  amber:  { active: "bg-amber-50 border-amber-400 text-amber-700",  border: "border-slate-200 text-slate-600" },
};

type Status = "idle" | "preview" | "analyzing" | "done" | "error";

interface Medicamento { nombre: string; dosis: string; frecuencia: string; instrucciones: string; }
interface Examen      { nombre: string; resultado: string; valor_referencia: string; estado: string; }
interface OCRResult {
  tipo_documento:  string;
  paciente_nombre: string;
  fecha:           string;
  medico:          string;
  diagnostico:     string;
  medicamentos:    Medicamento[];
  examenes:        Examen[];
  indicaciones:    string[];
  alertas:         string[];
  proxima_cita:    string;
  resumen:         string;
}

// ── Convierte File a base64 ───────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

// ── Componente principal ──────────────────────────────────────
export default function GeminiOCR({ patientName, familyId }: { patientName: string; familyId: string }) {
  const [docType,   setDocType]   = useState("receta");
  const [status,    setStatus]    = useState<Status>("idle");
  const [previewUrl,setPreviewUrl]= useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result,    setResult]    = useState<OCRResult | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [savedOk,   setSavedOk]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Seleccionar archivo ───────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Solo se aceptan imágenes (JPG, PNG) o PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo no debe superar 10MB.");
      return;
    }

    setError(null);
    setImageFile(file);

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target?.result as string);
      setStatus("preview");
    };
    reader.readAsDataURL(file);
  }

  // ── Enviar a GAS → Gemini ─────────────────────────────────────
  async function analyzeDocument() {
    if (!imageFile) return;
    setStatus("analyzing");
    setResult(null);
    setError(null);
    setSavedOk(false);

    try {
      // Convertir imagen a base64
      const base64   = await fileToBase64(imageFile);
      const mimeType = imageFile.type || "image/jpeg";

      // Llamar al backend GAS
      const response = await fetch(GAS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" }, // GAS requiere text/plain en fetch cross-origin
        body: JSON.stringify({
          action:    "analyzeDocument",
          family_id: familyId,
          data: {
            base64,
            mimeType,
            docType,
          },
        }),
      });

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || "Error desconocido en el servidor.");
      }

      setResult(json.data as OCRResult);
      setStatus("done");

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado.";
      setError(msg);
      setStatus("error");
    }
  }

  // ── Simular guardado en expediente ────────────────────────────
  function saveToRecord() {
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 3000);
  }

  // ── Reiniciar ─────────────────────────────────────────────────
  function reset() {
    setStatus("idle");
    setPreviewUrl(null);
    setImageFile(null);
    setResult(null);
    setError(null);
    setSavedOk(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  // ─────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Encabezado degradado */}
      <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg, #7C3AED, #0D9488)" }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            🤖
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight">IA Médica · Gemini</h2>
            <p className="text-white/75 text-xs mt-0.5">Análisis inteligente de documentos</p>
          </div>
        </div>
        {patientName && (
          <div className="mt-3 bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-sm">👤</span>
            <span className="text-xs font-semibold">Paciente: {patientName}</span>
          </div>
        )}
      </div>

      {/* ── SELECTOR DE TIPO DE DOCUMENTO ─────────────────────── */}
      {(status === "idle" || status === "preview") && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            ¿Qué tipo de documento vas a subir?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DOC_TYPES.map(dt => {
              const c = COLOR_MAP[dt.color];
              return (
                <button
                  key={dt.id}
                  onClick={() => setDocType(dt.id)}
                  className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 text-left
                    transition-all duration-200 font-semibold text-xs
                    ${docType === dt.id ? c.active : "bg-white " + c.border + " hover:bg-slate-50"}`}
                >
                  <span className="text-xl leading-none">{dt.icon}</span>
                  <span className="leading-tight">{dt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ZONA DE SUBIDA ────────────────────────────────────── */}
      {status === "idle" && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Sube tu documento
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            id="ocr-file-input"
          />
          <label
            htmlFor="ocr-file-input"
            className="flex flex-col items-center justify-center gap-4 w-full
              border-2 border-dashed border-teal-300 rounded-2xl p-10
              bg-gradient-to-br from-teal-50/80 to-blue-50/80
              hover:from-teal-100/80 hover:border-teal-400
              cursor-pointer transition-all active:scale-98"
          >
            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-4xl">
              📸
            </div>
            <div className="text-center">
              <p className="font-bold text-teal-700 text-sm">Toca para subir o tomar foto</p>
              <p className="text-xs text-teal-500 mt-1.5">JPG · PNG · PDF — máximo 10MB</p>
            </div>
          </label>

          {error && (
            <div className="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2">
              <span className="text-rose-500">⚠️</span>
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* ── VISTA PREVIA + BOTÓN ANALIZAR ────────────────────── */}
      {status === "preview" && previewUrl && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Vista previa del documento
          </p>
          <div className="relative rounded-2xl overflow-hidden border-2 border-teal-200 shadow-md bg-slate-100">
            <img
              src={previewUrl}
              alt="Documento médico"
              className="w-full max-h-60 object-contain bg-white"
            />
            <div className="absolute top-2.5 right-2.5">
              <span className="bg-teal-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow">
                ✓ Listo
              </span>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={analyzeDocument}
              className="flex-1 text-white font-bold py-4 rounded-xl text-sm
                shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #7C3AED, #0D9488)" }}
            >
              <span className="text-base">🤖</span>
              Analizar con Gemini
            </button>
            <button
              onClick={reset}
              className="w-12 h-14 bg-slate-100 text-slate-500 rounded-xl font-bold text-lg
                hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── CARGANDO / ANALIZANDO ────────────────────────────── */}
      {status === "analyzing" && (
        <div className="rounded-2xl p-8 flex flex-col items-center gap-5 text-center border border-violet-100"
          style={{ background: "linear-gradient(135deg, #F5F3FF, #F0FDFA)" }}>
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: "linear-gradient(135deg, #7C3AED, #0D9488)" }}>
              🤖
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-teal-400 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg">Analizando documento...</p>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed max-w-xs">
              Gemini está leyendo y extrayendo toda la información médica
            </p>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 180}ms` }} />
            ))}
          </div>
          <p className="text-xs text-slate-400 italic">Esto puede tomar 10-20 segundos...</p>
        </div>
      )}

      {/* ── ERROR ────────────────────────────────────────────── */}
      {status === "error" && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 text-center">
          <p className="text-4xl mb-3">😔</p>
          <p className="font-bold text-rose-700 text-base mb-1">No se pudo analizar</p>
          <p className="text-rose-600 text-sm leading-relaxed">{error}</p>
          <div className="flex gap-2 mt-4">
            <button onClick={reset}
              className="flex-1 bg-rose-100 text-rose-700 font-semibold py-3 rounded-xl text-sm hover:bg-rose-200 active:scale-95 transition-all">
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}

      {/* ── RESULTADO DEL ANÁLISIS ───────────────────────────── */}
      {status === "done" && result && (
        <div className="space-y-3">

          {/* Banner éxito */}
          <div className="rounded-2xl p-4 flex items-center gap-3 text-white"
            style={{ background: "linear-gradient(135deg, #059669, #0D9488)" }}>
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-bold text-base">¡Análisis completado!</p>
              <p className="text-white/80 text-xs mt-0.5">{result.tipo_documento}</p>
            </div>
          </div>

          {/* Resumen para la familia */}
          {result.resumen && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">📝 Resumen</p>
              <p className="text-sm text-slate-700 leading-relaxed">{result.resumen}</p>
            </div>
          )}

          {/* Datos básicos */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            {[
              { label: "Paciente",    value: result.paciente_nombre, icon: "👤" },
              { label: "Fecha",       value: result.fecha,           icon: "📅" },
              { label: "Médico",      value: result.medico,          icon: "🩺" },
              { label: "Diagnóstico", value: result.diagnostico,     icon: "📋" },
              { label: "Próx. Cita",  value: result.proxima_cita,    icon: "🗓"  },
            ].filter(r => r.value).map((row, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-b-0">
                <span className="text-base flex-shrink-0 mt-0.5">{row.icon}</span>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">{row.label}</p>
                  <p className="text-sm text-slate-800 mt-0.5 leading-snug">{row.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Alertas importantes — primero si existen */}
          {result.alertas?.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">⚠️ Alertas Importantes</p>
              {result.alertas.map((alerta, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 flex-shrink-0">⚠️</span>
                  <p className="text-sm text-amber-800 font-semibold">{alerta}</p>
                </div>
              ))}
            </div>
          )}

          {/* Medicamentos */}
          {result.medicamentos?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                💊 Medicamentos detectados ({result.medicamentos.length})
              </p>
              <div className="space-y-2.5">
                {result.medicamentos.map((med, i) => (
                  <div key={i} className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
                    <p className="font-bold text-teal-800 text-sm">{med.nombre}</p>
                    <div className="grid grid-cols-2 gap-3 mt-2.5">
                      {med.dosis && (
                        <div className="bg-white/70 rounded-xl p-2">
                          <p className="text-xs text-teal-500 font-bold">Dosis</p>
                          <p className="text-sm text-teal-900 font-semibold mt-0.5">{med.dosis}</p>
                        </div>
                      )}
                      {med.frecuencia && (
                        <div className="bg-white/70 rounded-xl p-2">
                          <p className="text-xs text-teal-500 font-bold">Frecuencia</p>
                          <p className="text-sm text-teal-900 font-semibold mt-0.5">{med.frecuencia}</p>
                        </div>
                      )}
                    </div>
                    {med.instrucciones && (
                      <div className="mt-2.5 bg-white/60 rounded-xl px-3 py-2 flex items-start gap-2">
                        <span className="text-teal-500 text-xs flex-shrink-0 mt-0.5">📌</span>
                        <p className="text-xs text-teal-700 leading-relaxed">{med.instrucciones}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultados de laboratorio */}
          {result.examenes?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                🧪 Resultados de Laboratorio
              </p>
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                {result.examenes.map((ex, i) => {
                  const estadoColor = ex.estado === "normal"
                    ? "text-teal-600 bg-teal-50"
                    : ex.estado === "alto" || ex.estado === "anormal"
                    ? "text-rose-600 bg-rose-50"
                    : "text-amber-600 bg-amber-50";
                  return (
                    <div key={i} className="px-4 py-3 border-b border-slate-50 last:border-b-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800 text-sm">{ex.nombre}</p>
                        {ex.estado && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${estadoColor}`}>
                            {ex.estado.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5">
                        <div>
                          <p className="text-xs text-slate-400">Resultado</p>
                          <p className="text-sm font-bold text-slate-800">{ex.resultado}</p>
                        </div>
                        {ex.valor_referencia && (
                          <div>
                            <p className="text-xs text-slate-400">Referencia</p>
                            <p className="text-xs text-slate-500">{ex.valor_referencia}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Indicaciones */}
          {result.indicaciones?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                📌 Indicaciones del médico
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
                {result.indicaciones.map((ind, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-blue-800 leading-relaxed">{ind}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2.5 pt-1">
            <button onClick={reset}
              className="flex-1 bg-slate-100 text-slate-700 font-bold py-3.5 rounded-xl text-sm
                hover:bg-slate-200 active:scale-95 transition-all">
              📸 Analizar otro
            </button>
            <button onClick={saveToRecord}
              className={`flex-1 font-bold py-3.5 rounded-xl text-sm shadow-lg
                active:scale-95 transition-all text-white ${savedOk ? "bg-emerald-500" : ""}`}
              style={!savedOk ? { background: "linear-gradient(135deg, #7C3AED, #0D9488)" } : {}}>
              {savedOk ? "✅ ¡Guardado!" : "💾 Guardar"}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
