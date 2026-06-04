import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy YouTube fetches to avoid exposing API key to frontend
  app.get("/api/youtube/trending", async (req, res) => {
    try {
      if (!process.env.YOUTUBE_API_KEY) {
        return res.status(500).json({ error: "YOUTUBE_API_KEY is not configured on the server." });
      }

      const { videoCategoryId, regionCode = 'ID' } = req.query;
      let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=${regionCode}&maxResults=24&key=${process.env.YOUTUBE_API_KEY}`;
      
      if (videoCategoryId) {
        url += `&videoCategoryId=${videoCategoryId}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(await response.text());
      res.json(await response.json());
    } catch (error: any) {
      console.error("YouTube API error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch trending videos" });
    }
  });

  app.get("/api/youtube/search", async (req, res) => {
    try {
      if (!process.env.YOUTUBE_API_KEY) return res.status(500).json({ error: "API KEY is not configured." });
      const { q } = req.query;
      if (!q) return res.status(400).json({ error: "Query parameters 'q' is required" });

      // Search for Video IDs
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=id&type=video&maxResults=24&q=${encodeURIComponent(q as string)}&key=${process.env.YOUTUBE_API_KEY}`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) throw new Error(await searchRes.text());
      const searchData = await searchRes.json();
      
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
      if (!videoIds) return res.json({ items: [] });

      // Fetch detailed stats for the returned IDs
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`;
      const videosRes = await fetch(videosUrl);
      if (!videosRes.ok) throw new Error(await videosRes.text());
      res.json(await videosRes.json());
    } catch (error: any) {
      console.error("YouTube Search error:", error);
      res.status(500).json({ error: error.message || "Failed to search videos" });
    }
  });

  app.get("/api/youtube/video", async (req, res) => {
    try {
      if (!process.env.YOUTUBE_API_KEY) return res.status(500).json({ error: "API KEY is not configured." });
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID parameter is required" });

      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${id}&key=${process.env.YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(await response.text());
      res.json(await response.json());
    } catch (error: any) {
      console.error("YouTube Video fetch error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch video" });
    }
  });

  app.post("/api/generate-prompt", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { metadata, analysisMode = 'content' } = req.body;

      // Truncate description in metadata just in case it's too long
      if (metadata?.snippet?.description?.length > 1500) {
         metadata.snippet.description = metadata.snippet.description.substring(0, 1500) + "...";
      }

      let analysisInstructions = '';
      if (analysisMode === 'business') {
         analysisInstructions = `
        Please analyze this metadata deeply from a BUSINESS LOGIC and MONETIZATION perspective.
        How does this video make money? What is the sales funnel? How is the creator positioning their brand?
        Format the response in clear, elegant Markdown using these sections:
        - Target Audience & Market Fit (Who is this for and what problem does it solve?)
        - Funnel Entry & Hook (How it grabs potential customers)
        - Value Proposition & Authority (How the creator establishes trust)
        - Monetization Strategy (Ad revenue, affiliates, sponsorships, own products, CTA)
        - Actionable Business Blueprint (How to replicate this business logic for my own brand)
         `;
      } else if (analysisMode === 'audience') {
         analysisInstructions = `
        Please analyze this metadata deeply from an AUDIENCE and VIEWERSHIP perspective.
        Bedah kategori tontonan ini (dissect this watch category). Who is watching this and why? How did it accumulate these views?
        Format the response in clear, elegant Markdown using these sections:
        - Viewership Velocity & Engagement (Analysis of view counts, likes, and engagement signals based on the metadata)
        - Audience Psychographics (Why do people click and watch this specific category?)
        - Trend & Category Breakdown (Analysis of the specific YouTube category, tags, and search intent)
        - Viral Triggers (What exact emotional or visual triggers cause high retention and shares for this type of video?)
        - Audience Capture Strategy (How to capture this same audience for a new channel)
         `;
      } else if (analysisMode === 'data') {
         analysisInstructions = `
        Please analyze this metadata deeply from a DATA ANALYTICS and METRICS perspective.
        Bedah dan analisis metrik data dari video ini secara statistik.
        Format the response in clear, elegant Markdown using these sections:
        - Engagement Ratios (Analyze views, likes, comment ratios and what they indicate about audience satisfaction)
        - SEO & Algorithm Signals (Analyze the title structure, tags, description formatting, and algorithm impact)
        - Statistical Anomalies (Identify outlier metrics or specific patterns in the data that drove its success)
        - Data-Driven Recommendations (Actionable metadata and metric-targeting strategies derived entirely from the numbers)
         `;
      } else if (analysisMode === 'algorithm') {
         analysisInstructions = `
        Please analyze this metadata deeply from a YouTube ALGORITHM and ENGAGEMENT optimization perspective.
        Bedah algoritma untuk menaikan engagement secara maksimal (Dissect the algorithm to maximize engagement based on this video's metadata).
        Format the response in clear, elegant Markdown using these sections:
        - Algorithmic Triggers (What specific metadata choices signaled the algorithm to push this video)
        - Retention Engineering (What format/pacing keeps viewers watching based on the context)
        - Community Activation (How to construct hidden CTAs and hooks to drive comments, likes, and shares)
        - Engagement Multiplication Strategy (Actionable plan to replicate and scale this engagement)
         `;
      } else if (analysisMode === 'script') {
         analysisInstructions = `
        Please generate a complete VIDEO SCRIPT based on the structure and hooks of this metadata.
        Write it as a ready-to-shoot script.
        Format the response in clear, elegant Markdown using these sections:
        - Hook (0:00 - 0:15) - The initial pattern interrupt and promise
        - Intro (0:15 - 0:45) - Establishing authority and context
        - Main Body (0:45 - end) - Broken down into clear sections or steps with visual cues
        - Outro & Call To Action - Strong closing and retention driver
        - Suggested B-Roll (Visual recommendations for the editor)
         `;
      } else if (analysisMode === 'thumbnail') {
         analysisInstructions = `
        Please analyze this metadata deeply from a CTR (Click-Through Rate) optimization perspective.
        Generate a comprehensive set of viral THUMBNAIL CONCEPTS and TITLE VARIATIONS to beat the original.
        Format the response in clear, elegant Markdown using these sections:
        - Original Hook Deconstruction (Why the original title/thumbnail worked)
        - 5 Viral Title Variations (Optimized for curiosity, emotion, and search)
        - 3 Thumbnail Concepts (Detailed visual descriptions: Foregrounds, Backgrounds, Text, Expressions)
        - Color Psychology & Contrast (Recommendations to stand out in the feed)
        - A/B Testing Strategy (How to test these variations)
         `;
      } else {
         analysisInstructions = `
        Please analyze this metadata deeply from a CONTENT CREATION perspective.
        Generate a comprehensive blueprint and creative prompt for me to make a similar, high-performing video.
        Do not just tell me to copy it verbatim. Adapt the core psychological hooks, format, and pacing into a highly actionable video creation prompt.
        Format the response in clear, elegant Markdown using these sections:
        - Meta Analysis (Why this video went viral based on the metadata)
        - Content Strategy (Core concept)
        - Audience Hook (The first 5 seconds)
        - Outline & Structure
        - Presentation Style & Editing Direction
        - Prompt for AI Video Generation (If I want to generate B-roll via an AI video model)
         `;
      }

      const promptText = `
        You are an expert YouTube content strategist, creative director, and business mastermind.
        
        Here is the comprehensive JSON metadata (statistics, snippet, title, description, tags, etc.) of the highly successful video:
        \`\`\`json
        ${JSON.stringify(metadata, null, 2)}
        \`\`\`

        ${analysisInstructions}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
      });

      const textOutput = response.text;
      if (!textOutput) {
          throw new Error("No response from AI");
      }

      res.json({ prompt: textOutput });
    } catch (error: any) {
      console.error("Prompt generation error:", error);
      res.status(500).json({ error: "Failed to generate prompt using Gemini AI" });
    }
  });

  app.post("/api/refine-prompt", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { text, refinementType } = req.body;

      if (!text || !refinementType) {
        return res.status(400).json({ error: "Text and refinementType are required." });
      }

      let instruction = '';
      if (refinementType === 'professional') {
         instruction = "Rewrite the following strategy to be more formal, structured, and professional. Use executive language.";
      } else if (refinementType === 'casual') {
         instruction = "Rewrite the following strategy to be more conversational, engaging, and casual for a creator.";
      } else if (refinementType === 'simplify') {
         instruction = "Rewrite the following strategy to be much simpler, concise, and easier to digest. Cut the fluff entirely.";
      } else {
         return res.status(400).json({ error: "Invalid refinement type." });
      }

      const promptText = `
        ${instruction}
        Please maintain the Markdown formatting and structure where appropriate, but adjust the tone accordingly.

        ---
        ORIGINAL:
        ${text}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
      });

      const textOutput = response.text;
      if (!textOutput) {
          throw new Error("No response from AI");
      }

      res.json({ prompt: textOutput });
    } catch (error: any) {
      console.error("Refinement error:", error);
      res.status(500).json({ error: "Failed to refine using Gemini AI" });
    }
  });

  app.post("/api/generate-comparison", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { metadataA, metadataB } = req.body;

      if (!metadataA || !metadataB) {
        return res.status(400).json({ error: "metadataA and metadataB are required" });
      }

      const promptText = `
        You are an expert YouTube content strategist, creative director, and data analyst.
        I want to compare the engagement strategies of two different videos.
        
        Here is the metadata for Video A:
        \`\`\`json
        ${JSON.stringify({
          title: metadataA.snippet.title,
          description: metadataA.snippet.description?.substring(0, 500),
          tags: metadataA.snippet.tags,
          statistics: metadataA.statistics
        }, null, 2)}
        \`\`\`

        Here is the metadata for Video B:
        \`\`\`json
        ${JSON.stringify({
          title: metadataB.snippet.title,
          description: metadataB.snippet.description?.substring(0, 500),
          tags: metadataB.snippet.tags,
          statistics: metadataB.statistics
        }, null, 2)}
        \`\`\`

        Please generate a comprehensive side-by-side comparison blueprint highlighting the differences in their engagement strategies. 
        Format the response in clear, elegant Markdown using these sections:
        - Meta Battle (High-level overview of their metadata differences and strategies)
        - Engagement Hooks (How Video A vs. Video B captures attention based on text)
        - Audience Targeting (Differences in target audience based on titles and tags)
        - Performance Analysis (Comparing their statistics and what drove them)
        - Hybrid Strategy Blueprint (How to combine the best parts of both videos into one super-viral concept)
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
      });

      const textOutput = response.text;
      if (!textOutput) {
          throw new Error("No response from AI");
      }

      res.json({ prompt: textOutput });
    } catch (error: any) {
      console.error("Comparison AI error:", error);
      res.status(500).json({ error: "Failed to generate comparison using Gemini AI" });
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
