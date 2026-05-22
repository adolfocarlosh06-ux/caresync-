// ============================================================
//  PatientCard — Tarjeta del paciente activo
// ============================================================
import React from "react";

function calcAge(dob) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PatientCard({ patient, isActive, onClick }) {
  if (!patient) return null;
  const age = calcAge(patient.date_of_birth);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 transition-all duration-200 border-2 ${
        isActive
          ? "border-teal-400 bg-white shadow-lg shadow-teal-100"
          : "border-transparent bg-white/60 hover:bg-white hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-inner"
          style={{ backgroundColor: patient.avatar_color || "#6EE7B7" }}
        >
          {patient.avatar_initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-base leading-tight truncate">
            {patient.name}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">{age} años · {patient.blood_type}</p>
          <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium border border-teal-100">
            {patient.diagnosis}
          </span>
        </div>

        {isActive && (
          <div className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
        )}
      </div>

      {/* Alerta de alergias */}
      {patient.allergies && patient.allergies !== "Ninguna conocida" && (
        <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
          <span className="text-amber-500 text-sm">⚠️</span>
          <span className="text-xs text-amber-700 font-medium">
            Alergia: {patient.allergies}
          </span>
        </div>
      )}
    </button>
  );
}
