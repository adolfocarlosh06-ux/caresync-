// ============================================================
//  CARESYNC — Datos de Prueba (Mock)
//  Simula las respuestas de la API de la Fase 1.
//  En Fase 3+, esto se reemplaza por llamadas reales a tu GAS API.
// ============================================================

export const FAMILIES = {
  FAM_001: {
    family_id: "FAM_001",
    family_name: "Familia García López",
    plan: "Premium",
  },
  FAM_002: {
    family_id: "FAM_002",
    family_name: "Familia Martínez Soto",
    plan: "Básico",
  },
};

export const PATIENTS = {
  FAM_001: [
    {
      patient_id: "PAT_001",
      family_id: "FAM_001",
      name: "Sofía García López",
      date_of_birth: "2018-03-15",
      gender: "Femenino",
      diagnosis: "Parálisis Cerebral Espástica",
      allergies: "Penicilina",
      blood_type: "O+",
      insurance_number: "CSS-2024-001",
      notes: "Requiere silla de ruedas. Fisioterapia 3x semana.",
      avatar_initials: "SG",
      avatar_color: "#6EE7B7",
    },
  ],
  FAM_002: [
    {
      patient_id: "PAT_002",
      family_id: "FAM_002",
      name: "Diego Martínez Soto",
      date_of_birth: "2015-07-22",
      gender: "Masculino",
      diagnosis: "Trastorno del Espectro Autista (TEA)",
      allergies: "Ninguna conocida",
      blood_type: "A+",
      insurance_number: "MINSA-2023-445",
      notes: "Terapia ABA en proceso. Sensible a ruidos fuertes.",
      avatar_initials: "DM",
      avatar_color: "#93C5FD",
    },
  ],
};

export const APPOINTMENTS = {
  FAM_001: [
    {
      appointment_id: "APT_001",
      patient_id: "PAT_001",
      doctor_name: "Dra. Rosa Morales",
      specialty: "Neurología Pediátrica",
      date: "2025-08-28",
      time: "09:00",
      location: "Hospital del Niño, Consulta 304",
      status: "scheduled",
    },
    {
      appointment_id: "APT_002",
      patient_id: "PAT_001",
      doctor_name: "Dr. Ernesto Vargas",
      specialty: "Fisioterapia",
      date: "2025-08-20",
      time: "10:30",
      location: "Clínica San Fernando, Sala 12",
      status: "scheduled",
    },
  ],
  FAM_002: [
    {
      appointment_id: "APT_003",
      patient_id: "PAT_002",
      doctor_name: "Dra. Lucía Fong",
      specialty: "Psicología Infantil",
      date: "2025-08-22",
      time: "14:00",
      location: "Centro de Desarrollo Infantil, Of. 5",
      status: "scheduled",
    },
  ],
};

export const MEDICATIONS = {
  FAM_001: [
    {
      medication_id: "MED_001",
      patient_id: "PAT_001",
      name: "Baclofeno",
      dosage: "5mg",
      frequency: "3 veces al día",
      times: ["07:00", "13:00", "19:00"],
      prescribing_doctor: "Dra. Rosa Morales",
      instructions: "Administrar con comida. No partir la pastilla.",
      status: "active",
      stock_days_remaining: 4, // ⚠️ Bajo inventario → alerta
    },
    {
      medication_id: "MED_002",
      patient_id: "PAT_001",
      name: "Vitamina D3",
      dosage: "1000 UI",
      frequency: "1 vez al día",
      times: ["08:00"],
      prescribing_doctor: "Dra. Rosa Morales",
      instructions: "Con el desayuno.",
      status: "active",
      stock_days_remaining: 21,
    },
  ],
  FAM_002: [
    {
      medication_id: "MED_003",
      patient_id: "PAT_002",
      name: "Risperidona",
      dosage: "0.5mg",
      frequency: "2 veces al día",
      times: ["08:00", "20:00"],
      prescribing_doctor: "Dra. Lucía Fong",
      instructions: "Vigilar somnolencia excesiva.",
      status: "active",
      stock_days_remaining: 12,
    },
  ],
};

export const MEDICATION_LOGS_TODAY = {
  FAM_001: {
    MED_001_07: { taken: true,  taken_time: "07:05" },
    MED_001_13: { taken: false, taken_time: null },
    MED_001_19: { taken: false, taken_time: null },
    MED_002_08: { taken: true,  taken_time: "08:10" },
  },
  FAM_002: {
    MED_003_08: { taken: true,  taken_time: "08:02" },
    MED_003_20: { taken: false, taken_time: null },
  },
};

export const MEDICAL_EXAMS = {
  FAM_001: [
    {
      exam_id: "EXAM_001",
      patient_id: "PAT_001",
      exam_type: "Resonancia Magnética Cerebral",
      exam_date: "2025-05-10",
      lab_name: "Laboratorio Pacífico",
      status: "uploaded",
      summary: "Sin cambios desde último estudio.",
    },
  ],
  FAM_002: [
    {
      exam_id: "EXAM_002",
      patient_id: "PAT_002",
      exam_type: "Electroencefalograma (EEG)",
      exam_date: "2025-07-20",
      lab_name: "Hospital Santo Tomás",
      status: "pending_upload", // ⚠️ Sin subir → alerta
      summary: "",
    },
  ],
};
