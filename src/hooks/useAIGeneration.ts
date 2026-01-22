import { useState } from "react";
import {
  createAIService,
  AIGenerationRequest,
  AIGenerationResponse,
} from "../utils/aiService";
import toast from "react-hot-toast";

export function useAIGeneration(apiKey: string) {
  const [isGenerating, setIsGenerating] = useState(false);

  const aiService = createAIService(apiKey);

  const generateContent = async (
    request: AIGenerationRequest,
  ): Promise<AIGenerationResponse | null> => {
    setIsGenerating(true);

    try {
      const result = await aiService.generateCustomerNotification(request);
      toast.success("AI content generated successfully!");
      return result;
    } catch (error) {
      console.error("AI Generation failed:", error);
      toast.error("Failed to generate AI content. Please try again.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateContent,
  };
}
