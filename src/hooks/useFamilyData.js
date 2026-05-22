// ============================================================
//  useFamilyData — Hook personalizado de CareSync
//  Ahora usa datos mock. En Fase 3 cambia API_URL por tu URL real.
// ============================================================
import { useState, useEffect } from "react";
import {
  FAMILIES, PATIENTS, APPOINTMENTS,
  MEDICATIONS, MEDICATION_LOGS_TODAY, MEDICAL_EXAMS
} from "../data/mockData";

// ── Cuando tengas tu URL de la API, ponla aquí ──────────────
// const API_URL = "https://script.google.com/macros/s/TU_URL/exec";
const USE_MOCK = true; // Cambia a false cuando conectes la API real

export function useFamilyData(familyId) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!familyId) return;

    setLoading(true);
    setError(null);

    if (USE_MOCK) {
      // Simular un pequeño delay de red (300ms) para que se vea realista
      const timer = setTimeout(() => {
        try {
          setData({
            family:       FAMILIES[familyId] || null,
            patients:     PATIENTS[familyId] || [],
            appointments: APPOINTMENTS[familyId] || [],
            medications:  MEDICATIONS[familyId] || [],
            logs:         MEDICATION_LOGS_TODAY[familyId] || {},
            exams:        MEDICAL_EXAMS[familyId] || [],
          });
        } catch (e) {
          setError("Error al cargar los datos.");
        } finally {
          setLoading(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    }

    // ── Código para API real (Fase 3+) ──────────────────────────
    // async function fetchAll() {
    //   try {
    //     const [patients, appointments, medications, exams] = await Promise.all([
    //       fetch(`${API_URL}?action=getPatients&family_id=${familyId}`).then(r => r.json()),
    //       fetch(`${API_URL}?action=getAppointments&family_id=${familyId}`).then(r => r.json()),
    //       fetch(`${API_URL}?action=getMedications&family_id=${familyId}`).then(r => r.json()),
    //       fetch(`${API_URL}?action=getMedicalExams&family_id=${familyId}`).then(r => r.json()),
    //     ]);
    //     setData({ family: FAMILIES[familyId], patients: patients.data,
    //               appointments: appointments.data, medications: medications.data,
    //               logs: {}, exams: exams.data });
    //   } catch(e) { setError(e.message); }
    //   finally { setLoading(false); }
    // }
    // fetchAll();
  }, [familyId]);

  return { data, loading, error };
}
