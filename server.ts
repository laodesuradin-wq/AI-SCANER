import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  const upload = multer({ storage: multer.memoryStorage() });

  // API routes
  const database: any[] = [];

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/database", (req, res) => {
    res.json(database);
  });

  app.post("/api/database", (req, res) => {
    const record = { ...req.body, id: Date.now().toString(), timestamp: new Date().toISOString() };
    database.push(record);
    res.json({ success: true, record });
  });

  app.post("/api/extract", upload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No document uploaded" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Image = req.file.buffer.toString("base64");
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: base64Image,
                  mimeType: req.file.mimetype,
                },
              },
              {
                text: "Extract data from this document. If it's an ID card (KTP), extract NIK, Name, Date/Place of Birth, Address, etc. If it's a generic document, extract key-value pairs. Return the result strictly as a JSON object with 'fields' (array of {key, value}), 'summary' (brief string), 'confidence_score' (number 0-100), and 'document_type' (e.g. 'KTP', 'Invoice', 'Shipping Label', etc.). Do NOT use markdown code blocks like ```json ... ```, just pure JSON text.",
              },
            ],
          },
        ],
      });

      const textOutput = response.text;
      if (!textOutput) {
          throw new Error("No response from AI");
      }

      let extractedData;
      try {
          extractedData = JSON.parse(textOutput);
      } catch (e) {
          const cleanedText = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
          extractedData = JSON.parse(cleanedText || "{}");
      }

      res.json(extractedData);
    } catch (error) {
      console.error("Extraction error:", error);
      res.status(500).json({ error: "Failed to extract data using AI Vision" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
