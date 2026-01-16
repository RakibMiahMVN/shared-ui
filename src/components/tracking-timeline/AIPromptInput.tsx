import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Lightbulb } from "lucide-react";

interface AIPromptInputProps {
  isVisible: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  selectedChannels: string[];
}

const PROMPT_SUGGESTIONS = {
  purchase: [
    "Order confirmed and being processed",
    "Payment received, preparing shipment",
    "Quality check completed, ready to ship",
    "Order delay due to high demand",
    "Refund processed successfully",
  ],
  shipping: [
    "Package shipped and tracking available",
    "Out for delivery today",
    "Package delivered successfully",
    "Delivery attempt failed, rescheduled",
    "Package held at local facility",
  ],
  general: [
    "Update on order status",
    "Important information about your order",
    "Thank you for your patience",
    "Resolution for your inquiry",
    "Follow-up on recent communication",
  ],
};

export function AIPromptInput({
  isVisible,
  onClose,
  onGenerate,
  isGenerating,
  selectedChannels,
}: AIPromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<keyof typeof PROMPT_SUGGESTIONS>("general");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating && prompt.length <= 300) {
      await onGenerate(prompt.trim());
      setPrompt("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const getPlaceholderText = () => {
    const channels = selectedChannels.join(" and ");
    return `Describe what you want to communicate to the customer for ${channels}...`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="mt-3 rounded-lg border border-purple-200 bg-white shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-purple-100 px-3 py-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  AI Assistant
                </h3>
                <p className="text-xs text-gray-500">
                  Generate content for {selectedChannels.join(" and ")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Quick suggestions - simplified */}
          <div className="border-b border-gray-100 p-3">
            <div className="mb-2 flex items-center gap-1">
              <Lightbulb className="h-3 w-3 text-amber-500" />
              <span className="text-xs font-medium text-gray-600">
                Quick suggestions
              </span>
            </div>

            <div className="mb-2 flex flex-wrap gap-1">
              {Object.keys(PROMPT_SUGGESTIONS).map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setActiveCategory(
                      category as keyof typeof PROMPT_SUGGESTIONS,
                    )
                  }
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                    activeCategory === category
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              {PROMPT_SUGGESTIONS[activeCategory]
                .slice(0, 3)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full rounded bg-gray-50 p-2 text-left text-xs text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
          </div>

          {/* Input Form - simplified */}
          <form onSubmit={handleSubmit} className="p-3">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={getPlaceholderText()}
                disabled={isGenerating}
                rows={2}
                className={`w-full resize-none rounded border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-500 focus:border-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-200 ${
                  isGenerating ? "cursor-not-allowed opacity-50" : ""
                }`}
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating || prompt.length > 300}
                className={`absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded transition-all ${
                  prompt.trim() && !isGenerating && prompt.length <= 300
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                }`}
              >
                {isGenerating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span
                className={`text-xs ${prompt.length > 250 ? "text-red-500" : "text-gray-400"}`}
              >
                {prompt.length}/300
              </span>
              {prompt.length > 300 && (
                <span className="text-xs text-red-500">Too long</span>
              )}
            </div>
          </form>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t border-purple-100 bg-purple-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </motion.div>
                <span className="text-sm font-medium text-purple-800">
                  Generating content...
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}