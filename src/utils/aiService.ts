import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

export interface AIGenerationRequest {
  type: "email" | "timeline" | "both";
  context: string;
  emailSubject?: string;
  emailBody?: string;
  timelineMessage?: string;
}

export interface AIGenerationResponse {
  emailSubject?: string;
  emailBody?: string;
  timelineMessage?: string;
}

export function createAIService(apiKey: string) {
  // Initialize Groq client
  const groqClient = createGroq({
    apiKey,
  });

  return {
    async generateCustomerNotification(
      request: AIGenerationRequest,
    ): Promise<AIGenerationResponse> {
      const { context, emailSubject, emailBody, timelineMessage } = request;

      // Check if API key is available
      if (!apiKey) {
        throw new Error("AI service unavailable: API key not provided");
      }

      // Always generate all three fields
      const prompt = `
You are a professional customer service assistant for MoveOn, an e-commerce platform. Generate customer notification content based on the provided context.

IMPORTANT: Only use information from the provided context. Do not add extra details, assumptions, or hallucinate information that isn't explicitly mentioned.

Context: ${context}

Current content (if any):
- Email Subject: ${emailSubject || "Not provided"}
- Email Body: ${emailBody || "Not provided"}
- Timeline Message: ${timelineMessage || "Not provided"}

Generate improved versions of all three fields. Focus on:
1. Making the content clearer and more professional
2. Using only information from the context
3. Keeping the same meaning but improving clarity
4. Making it more customer-friendly

CRITICAL: Return ONLY a valid JSON object. Do NOT wrap it in markdown code blocks, backticks, or any other formatting. Do NOT include any text before or after the JSON. Start your response directly with { and end with }. No explanations, no code blocks, just pure JSON.

Example of correct response format:
{"emailSubject":"Your order update","emailBody":"We wanted to inform you about your recent order...","timelineMessage":"Order status updated to processing"}

Return the JSON object:`;

      try {
        const result = await generateText({
          model: groqClient("llama-3.3-70b-versatile"),
          prompt,
          temperature: 0.7,
          maxOutputTokens: 500,
        });

        // Parse the JSON response - handle potential code blocks despite instructions
        let jsonText = result.text.trim();

        // First, check if the response is a structured AI SDK response
        try {
          const aiResponse = JSON.parse(jsonText);
          if (aiResponse.content) {
            jsonText = aiResponse.content.trim();
          }
        } catch (e) {
          // Not a structured response, continue with original text
        }

        // More robust extraction of JSON from code blocks (fallback for when AI ignores instructions)
        // Handle cases like: ```json\n{...}\n``` or ```\n{...}\n```
        const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/;
        const match = jsonText.match(codeBlockRegex);
        if (match) {
          jsonText = match[1].trim();
        } else {
          // Fallback: remove any leading/trailing ``` markers
          jsonText = jsonText
            .replace(/^```(?:json)?\s*/, "")
            .replace(/\s*```$/, "")
            .trim();
        }

        let parsed;
        try {
          parsed = JSON.parse(jsonText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Failed to parse:", jsonText);
          // Additional fallback: try to extract JSON if it's embedded in text
          const jsonExtractRegex = /\{[\s\S]*\}/;
          const jsonMatch = jsonText.match(jsonExtractRegex);
          if (jsonMatch) {
            try {
              parsed = JSON.parse(jsonMatch[0]);
            } catch (fallbackError) {
              throw new Error(
                `AI returned invalid JSON format. Raw response: ${result.text}`,
              );
            }
          } else {
            throw new Error(
              `AI returned invalid JSON format. Raw response: ${result.text}`,
            );
          }
        }

        // Validate the response structure - always expect all three fields
        if (
          !parsed.emailSubject ||
          !parsed.emailBody ||
          !parsed.timelineMessage
        ) {
          throw new Error(
            "Invalid AI response: missing required content fields",
          );
        }

        return parsed;
      } catch (error) {
        console.error("AI generation error:", error);
        throw new Error("Failed to generate AI content");
      }
    },
  };
}
