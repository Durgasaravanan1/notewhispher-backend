import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const patients = [];

const VOICE_WEBHOOK =
  "https://dharinisrisubramanian.n8n-wsk.com/webhook/prodvoicebasedurl";

const SAVE_WEBHOOK =
  "https://dharinisrisubramanian.n8n-wsk.com/webhook/savetodrive";

/* ---------- VOICE ---------- */
router.post("/voice", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Audio missing" });
    }

    const formData = new FormData();
    const audioBlob = new Blob([req.file.buffer], {
      type: req.file.mimetype,
    });

    formData.append("audio", audioBlob, req.file.originalname);

    const response = await fetch(VOICE_WEBHOOK, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Webhook failed");
    }

    const data = await response.json();

    res.json({
      patient_id: `P-${Date.now()}`,
      patient_name: data.patient_name || "",
      symptoms: data.symptoms || "",
      medicines: data.medicines || "",
      doctor_notes: data.doctor_notes || "",
      follow_up_required: false,
    });
  } catch (err) {
    console.error("VOICE ERROR:", err);
    res.status(500).json({ error: "Voice processing failed" });
  }
});

/* ---------- CONFIRM ---------- */
router.post("/confirm", async (req, res) => {
  try {
    const patient = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    patients.push(patient);

    await fetch(SAVE_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ error: "Save failed" });
  }
});

/* ---------- DASHBOARD ---------- */
router.get("/patients", (req, res) => {
  res.json(patients);
});

export default router;
