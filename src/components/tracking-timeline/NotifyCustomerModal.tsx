import { X, Bell, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { TextArea, Input, Checkbox, Button } from "../ui";
import Modal from "../ui/Modal";
import Tooltip from "../ui/Tooltip";
import { EmailPreviewModal } from "../ui/EmailPreviewModal";
import { useAIGeneration } from "../../hooks/useAIGeneration";
import { AIGenerationRequest } from "../../utils/aiService";
import toast from "react-hot-toast";

interface NotifyCustomerModalProps {
  onClose: () => void;
  buyProductId: string;
  // App-specific dependencies that need to be provided
  onSendNotification?: (data: {
    message: string;
    emailSubject?: string;
    emailBody?: string;
    channels: string[];
  }) => Promise<void>;
  // AI functionality (optional)
  apiKey?: string;
}

export function NotifyCustomerModal({
  onClose,
  buyProductId: _buyProductId,
  onSendNotification,
  apiKey,
}: NotifyCustomerModalProps) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "timeline",
  ]);
  const [message, setMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [aiGenerated, setAiGenerated] = useState({
    emailSubject: false,
    emailBody: false,
    timelineMessage: false,
  });

  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // AI functionality
  const { isGenerating, generateContent } = useAIGeneration(apiKey || "");

  const handleSmartRewrite = async () => {
    if (!generateContent || !apiKey) return;

    // Collect all current content as context
    const contextParts = [];

    if (emailSubject.trim()) {
      contextParts.push(`Subject: ${emailSubject}`);
    }
    if (emailBody.trim()) {
      contextParts.push(`Email Body: ${emailBody}`);
    }
    if (message.trim()) {
      contextParts.push(`Timeline: ${message}`);
    }

    const context = contextParts.join("\n\n") || "order update";

    const aiRequest: AIGenerationRequest = {
      type:
        selectedChannels.includes("email") &&
        selectedChannels.includes("timeline")
          ? "both"
          : selectedChannels.includes("email")
            ? "email"
            : "timeline",
      context: context,
      emailSubject: emailSubject || undefined,
      emailBody: emailBody || undefined,
      timelineMessage: message || undefined,
    };

    const result = await generateContent(aiRequest);

    if (result) {
      // Update all fields with AI-generated content
      if (result.emailSubject) {
        setEmailSubject(result.emailSubject);
        setAiGenerated((prev) => ({ ...prev, emailSubject: true }));
      }
      if (result.emailBody) {
        setEmailBody(result.emailBody);
        setAiGenerated((prev) => ({ ...prev, emailBody: true }));
      }
      if (result.timelineMessage) {
        setMessage(result.timelineMessage);
        setAiGenerated((prev) => ({ ...prev, timelineMessage: true }));
      }
    }
  };

  const handleEmailSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailSubject(e.target.value);
    if (aiGenerated.emailSubject) {
      setAiGenerated((prev) => ({ ...prev, emailSubject: false }));
    }
  };

  const handleEmailBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmailBody(e.target.value);
    if (aiGenerated.emailBody) {
      setAiGenerated((prev) => ({ ...prev, emailBody: false }));
    }
  };

  const handleChannelToggle = (channel: string) => {
    // Timeline is always selected and cannot be deselected
    if (channel === "timeline") return;

    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (aiGenerated.timelineMessage) {
      setAiGenerated((prev) => ({ ...prev, timelineMessage: false }));
    }
  };

  const handleSend = async () => {
    if (!onSendNotification) return;

    setIsSending(true);
    try {
      await onSendNotification({
        message,
        emailSubject: selectedChannels.includes("email")
          ? emailSubject
          : undefined,
        emailBody: selectedChannels.includes("email") ? emailBody : undefined,
        channels: selectedChannels,
      });
      toast.success(`Notification sent via: ${selectedChannels.join(", ")}`);
      onClose();
    } catch (error) {
      console.error("Failed to send notification:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal open={true} handleClose={onClose}>
      <Modal.Header
        handleClose={onClose}
        className="border-b border-gray-100 pb-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <Bell className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Notify customer about this order
              </h2>
              <p className="text-xs text-gray-500">
                Add a clear update to the customer timeline and optionally send
                an email.
              </p>
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Content>
        <div className="flex flex-col gap-2">
          {/* Channel selection + AI helper */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-gray-800">
                  Choose how you want to notify the customer
                </p>
                <p className="text-[11px] text-gray-500">
                  A timeline entry is always created. You can also send an
                  email.
                </p>
              </div>
              {apiKey && (
                <Tooltip
                  content="Let AI polish your message based on what you've written"
                  side="bottom"
                >
                  <Button
                    variant="outline"
                    size="small"
                    loading={isGenerating}
                    disabled={
                      !message.trim() &&
                      !emailSubject.trim() &&
                      !emailBody.trim()
                    }
                    onClick={handleSmartRewrite}
                    className="flex items-center gap-1.5 rounded-full border-gray-300 px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Improve with AI</span>
                  </Button>
                </Tooltip>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-1.5 text-blue-800">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Timeline update</span>
                </div>
              </div>

              <Checkbox
                label="Also email the customer"
                checked={selectedChannels.includes("email")}
                onChange={() => handleChannelToggle("email")}
                className="flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs hover:border-blue-200 hover:bg-blue-50"
              />
            </div>
          </div>

          {/* Message editors */}
          <div
            className={`grid gap-4 ${selectedChannels.includes("email") ? "md:grid-cols-2" : ""}`}
          >
            {/* Timeline */}
            {selectedChannels.includes("timeline") && (
              <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-800">
                      Timeline message
                    </p>
                    <p className="text-[11px] text-gray-500">
                      This appears in the customer timeline and internal tools.
                    </p>
                  </div>
                  {aiGenerated.timelineMessage && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                      <Sparkles className="h-2.5 w-2.5" /> AI
                    </span>
                  )}
                </div>

                <div className="relative flex-1">
                  <TextArea
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Explain what changed, what the customer should expect next, and any important details."
                    disabled={isGenerating}
                    rows={selectedChannels.includes("email") ? 7 : 10}
                    containerProps={{
                      className: `relative ${isGenerating ? "cursor-not-allowed opacity-50" : ""}`,
                    }}
                  />

                  {isGenerating && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-white/70">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-purple-200 bg-white">
                          <Sparkles className="h-3.5 w-3.5 text-purple-500 animate-spin" />
                        </div>
                        <p className="text-[11px] font-medium text-purple-700">
                          AI is improving your message…
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            {selectedChannels.includes("email") && (
              <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-800">
                      Customer email
                    </p>
                    <p className="text-[11px] text-gray-500">
                      This is sent to the customer&apos;s email address on file.
                    </p>
                  </div>
                  {(aiGenerated.emailSubject || aiGenerated.emailBody) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                      <Sparkles className="h-2.5 w-2.5" /> AI
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label="Subject"
                    value={emailSubject}
                    onChange={handleEmailSubjectChange}
                    placeholder="e.g. Update on your order status"
                    className="w-full text-sm"
                  />

                  <TextArea
                    label="Body"
                    value={emailBody}
                    onChange={handleEmailBodyChange}
                    placeholder="Write a clear, friendly update for the customer."
                    rows={6}
                    disabled={isGenerating}
                    containerProps={{
                      className: isGenerating
                        ? "cursor-not-allowed opacity-50"
                        : "",
                    }}
                  />

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setShowEmailPreview(true)}
                      disabled={!emailSubject.trim() || !emailBody.trim()}
                    >
                      Preview Email
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal.Content>

      <Modal.Footer>
        <div className="flex w-full flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 text-xs text-gray-500 sm:pr-4">
            {selectedChannels.length === 0 ? (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2.5">
                <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-100">
                  <X className="h-3 w-3 text-red-600" />
                </div>
                <p className="text-xs text-red-700">
                  Please select at least one notification channel to send this
                  update.
                </p>
              </div>
            ) : (
              <p>
                This update will be sent via
                <span className="font-medium text-gray-800">
                  {" "}
                  {selectedChannels.join(", ")}
                </span>
                .
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="small" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="small"
              loading={isSending}
              disabled={
                isSending ||
                selectedChannels.length === 0 ||
                (selectedChannels.includes("timeline") && !message.trim())
              }
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
              Send update
            </Button>
          </div>
        </div>
      </Modal.Footer>

      <EmailPreviewModal
        isOpen={showEmailPreview}
        onClose={() => setShowEmailPreview(false)}
        emailSubject={emailSubject}
        emailBody={emailBody}
      />
    </Modal>
  );
}
