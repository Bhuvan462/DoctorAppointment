const asyncHandler = require("express-async-handler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Rule-based fallback if API is unavailable or fails
const ruleBasedTriage = (symptomsText) => {
  const s = symptomsText.toLowerCase();
  
  if (s.includes("chest pain") || s.includes("heart") || s.includes("shortness of breath") || s.includes("severe pain")) {
    return {
      department: "Cardiology",
      urgency: "High",
      recommendation: "Please seek immediate medical attention or visit an emergency room."
    };
  }
  
  if (s.includes("fever") || s.includes("cough") || s.includes("cold") || s.includes("flu")) {
    return {
      department: "General Medicine",
      urgency: "Low",
      recommendation: "Rest and stay hydrated. Consult a General Physician for medication."
    };
  }

  if (s.includes("skin") || s.includes("rash") || s.includes("itch")) {
    return {
      department: "Dermatology",
      urgency: "Low",
      recommendation: "Book an appointment with a Dermatologist."
    };
  }

  if (s.includes("stomach") || s.includes("vomit") || s.includes("diarrhea") || s.includes("nausea")) {
    return {
      department: "Gastroenterology",
      urgency: "Moderate",
      recommendation: "Consult a Gastroenterologist. Stay hydrated."
    };
  }

  if (s.includes("bone") || s.includes("joint") || s.includes("fracture") || s.includes("muscle")) {
    return {
      department: "Orthopedics",
      urgency: "Moderate",
      recommendation: "Consult an Orthopedic doctor for your symptoms."
    };
  }

  if (s.includes("eye") || s.includes("vision") || s.includes("blur")) {
    return {
      department: "Ophthalmology",
      urgency: "Moderate",
      recommendation: "Consult an Eye Specialist."
    };
  }

  return {
    department: "General Medicine",
    urgency: "Moderate",
    recommendation: "Please consult a General Physician for a proper checkup."
  };
};

// @desc    Analyze symptoms and recommend department
// @route   POST /api/v1/ai/triage
// @access  Public / Patient
const triageSymptoms = asyncHandler(async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || symptoms.trim().length === 0) {
    return sendError(res, 400, "Please provide symptoms to analyze.");
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("No GEMINI_API_KEY found, using rule-based fallback.");
    const result = ruleBasedTriage(symptoms);
    return sendSuccess(res, 200, "Triage completed (Fallback Mode)", result);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an AI medical triage assistant.
      The user describes the following symptoms: "${symptoms}"
      
      Provide a JSON response with exactly three keys:
      1. "department": The most suitable medical department or doctor specialization.
      2. "urgency": Either "Low", "Moderate", or "High".
      3. "recommendation": A brief, comforting recommendation and advice. Add a reminder that this is not a medical diagnosis.

      Return ONLY valid JSON. No markdown formatting or code blocks.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown from the response
    const jsonStr = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    try {
      const parsedData = JSON.parse(jsonStr);
      return sendSuccess(res, 200, "Triage completed via AI", {
        department: parsedData.department || "General Medicine",
        urgency: parsedData.urgency || "Moderate",
        recommendation: parsedData.recommendation || "Consult a doctor."
      });
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      const fallbackResult = ruleBasedTriage(symptoms);
      return sendSuccess(res, 200, "Triage completed (Fallback Mode due to parse error)", fallbackResult);
    }
    
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    const fallbackResult = ruleBasedTriage(symptoms);
    return sendSuccess(res, 200, "Triage completed (Fallback Mode due to API error)", fallbackResult);
  }
});

module.exports = {
  triageSymptoms,
};
