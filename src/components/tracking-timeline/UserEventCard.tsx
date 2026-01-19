import React, { useState, useCallback } from "react";
import { TrackingEventModel } from "../../models/trackingEventCollectionModel";
import { formatDistance } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  MessageSquare,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterType } from "./types";

interface Attachment {
  name: string;
  size: string;
  type: string;
  image?: string;
}

interface UserEventCardProps {
  event: TrackingEventModel;
  onEdit?: (eventId: number, content: string) => Promise<void>;
  onDelete?: (eventId: number) => Promise<void>;
  onReply?: (eventId: number, content: string) => Promise<void>;
  isSuperAgent?: boolean;
  RichTextEditor: React.ComponentType<{
    onSubmit: (html: string) => Promise<void>;
    isSubmitting: boolean;
    onVisibilityChange: (filter: FilterType) => void;
    visibility: FilterType;
  }>;
}

const UserEventCard: React.FC<UserEventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onReply,
  isSuperAgent = false,
  RichTextEditor,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [imagePreview, setImagePreview] = useState<{
    images: Attachment[];
    index: number;
  } | null>(null);

  // Get replies from the event
  const replies: TrackingEventModel[] = event.getChildren();

  const handleReplyToComment = async (eventId: number, content: string) => {
    if (!content.trim()) return;
    if (onReply) {
      await onReply(eventId, content);
    }
    setShowReplyInput(false);
  };

  const handleUpdateComment = async (eventId: number, content: string) => {
    if (!content.trim()) return;
    if (onEdit) {
      await onEdit(eventId, content);
    }
    setIsEditing(false);
  };

  const handleDeleteComment = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (onDelete) {
      await onDelete(event.getId());
    }
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleReplySubmit = useCallback(
    (replyMessage: string, _visibility: "staff" | "public") => {
      handleReplyToComment(event.getId(), replyMessage);
    },
    [event.getId()],
  );

  // Mock attachments - in real implementation, this would come from the event model
  const allAttachments: Attachment[] = [];
  const imageAttachments = allAttachments.filter(
    (att) => att.image && !imageError[allAttachments.indexOf(att)],
  );

  const userName = event.getCauser()?.getName() || "User";
  const userInitials =
    event.getCauser()?.getName()?.charAt(0).toUpperCase() || "U";
  const timestamp = formatDistance(new Date(event.getCreatedAt()), new Date(), {
    addSuffix: true,
  }).replace(/about /g, "");

  // Determine visibility based on ACLs
  const visibility =
    event.getAcls().getRoleData().length > 0 ? "staff" : "public";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded border border-[#E5E7EB] bg-white p-3 transition-colors hover:border-[#D1D5DB]"
    >
      <div className="flex items-start gap-2.5">
        {/* Minimal Avatar */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-[#008060] text-xs text-white">
          {userInitials}
        </div>

        {/* Comment Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-[#212B36]">{userName}</span>
              <span className="text-xs text-[#637381]">
                {timestamp}
                {event.isEdited() && (
                  <span className="ml-1 text-[#9CA3AF]">(edited)</span>
                )}
              </span>
              {/* Visibility Badge */}
              <span
                className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs ${
                  visibility === "public"
                    ? "bg-blue-10 border-blue-200 text-blue-500"
                    : "border-[#D1D5DB] bg-white text-[#637381]"
                }`}
              >
                {visibility === "public" ? "Public" : "Staff only"}
              </span>
            </div>

            {isSuperAgent && (
              <div className="relative">
                <button className="rounded p-1 text-[#637381] transition-colors hover:bg-[#F3F4F6] hover:text-[#212B36]">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {/* Simplified dropdown - in real implementation, this would use a proper dropdown library */}
                <div className="absolute right-0 top-8 z-10 hidden w-40 rounded border border-[#E5E7EB] bg-white p-1 shadow-lg group-hover:block">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[#F9FAFB]"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteComment}
                    className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-red-600 hover:bg-[#F9FAFB]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>{" "}
          {/* Edit form or display content */}
          {isEditing ? (
            <div className="mt-2">
              <RichTextEditor
                onSubmit={async (content) =>
                  await handleUpdateComment(event.getId(), content)
                }
                isSubmitting={false}
                onVisibilityChange={() => {}}
                visibility="public"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              className="mb-2 text-sm leading-relaxed text-[#212B36]"
              dangerouslySetInnerHTML={{ __html: event.getContent() || "" }}
            />
          )}
          {/* Attachments Grid */}
          {allAttachments.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-5">
              {allAttachments.map((att, index) => (
                <div
                  key={index}
                  className={`flex h-[120px] w-[120px] flex-col rounded border border-[#E5E7EB] bg-[#F9FAFB] p-1.5 transition-colors ${
                    att.image && !imageError[index]
                      ? "cursor-pointer hover:border-[#008060] hover:shadow-sm"
                      : ""
                  }`}
                  onClick={() => {
                    if (att.image && !imageError[index]) {
                      const imgIndex = imageAttachments.indexOf(att);
                      setImagePreview({
                        images: imageAttachments,
                        index: imgIndex >= 0 ? imgIndex : 0,
                      });
                    }
                  }}
                >
                  {att.image && !imageError[index] ? (
                    <div className="group relative mb-1 flex-shrink-0">
                      <img
                        src={att.image}
                        alt={att.name}
                        className="h-[80px] w-full cursor-pointer rounded object-cover"
                        onError={() =>
                          setImageError({ ...imageError, [index]: true })
                        }
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded bg-black/0 transition-colors group-hover:bg-black/20">
                        <ImageIcon className="h-4 w-4 text-white opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  ) : null}

                  <div className="flex min-h-0 flex-1 items-start gap-1">
                    <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-[#E5E7EB] bg-white">
                      {att.image && !imageError[index] ? (
                        <ImageIcon className="h-2.5 w-2.5 text-[#008060]" />
                      ) : (
                        <FileText className="h-2.5 w-2.5 text-[#008060]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p
                        className="truncate text-[9px] leading-tight text-[#212B36]"
                        title={att.name}
                      >
                        {att.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-0.5">
                        <span className="rounded bg-[#212B36] px-0.5 py-0.5 text-[8px] uppercase leading-none text-white">
                          {att.type}
                        </span>
                        <span className="text-[8px] text-[#637381]">
                          {att.size}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Reply Toggle Button */}
          {replies.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  const newShowReplies = !showReplies;
                  setShowReplies(newShowReplies);
                  if (newShowReplies) {
                    setShowReplyInput(true);
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-[#637381] transition-colors hover:text-[#212B36]"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>
                  {replies.length} {replies.length === 1 ? "reply" : "replies"}
                </span>
              </button>
            </div>
          )}
          {/* Reply Button - Always visible */}
          {replies.length === 0 ? (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setShowReplyInput(true)}
                className="flex items-center gap-1.5 text-xs text-[#637381] transition-colors hover:text-[#212B36]"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Reply</span>
              </button>
            </div>
          ) : null}
          {/* Replies Thread */}
          <AnimatePresence>
            {showReplies && replies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-2 mt-2 space-y-1 overflow-hidden border-l-2 border-[#E5E7EB] pl-3"
              >
                {replies.map((reply) => {
                  const replyUserName = reply.causer?.name || "User";
                  const replyUserInitials =
                    reply.causer?.name?.charAt(0).toUpperCase() || "U";
                  const replyTimestamp = formatDistance(
                    new Date(reply.created_at),
                    new Date(),
                    { addSuffix: true },
                  ).replace(/about /g, "");

                  return (
                    <div key={reply.id} className="rounded bg-[#F9FAFB] p-2">
                      <div className="flex items-start gap-2">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-[#637381] text-xs text-white">
                          {replyUserInitials}
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs text-[#212B36]">
                              {replyUserName}
                            </span>
                            <span className="text-xs text-[#637381]">
                              {replyTimestamp}
                            </span>
                            {reply.isEdited() && (
                              <span className="text-xs text-[#9CA3AF]">
                                (edited)
                              </span>
                            )}
                          </div>
                          <p
                            className="text-xs text-[#212B36]"
                            dangerouslySetInnerHTML={{
                              __html: reply.message || "",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Reply Input */}
          <AnimatePresence>
            {showReplyInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 overflow-hidden"
              >
                <div className="rounded bg-[#F9FAFB] p-3">
                  <RichTextEditor
                    onSubmit={async (content) =>
                      await handleReplySubmit(content, "public")
                    }
                    isSubmitting={false}
                    onVisibilityChange={() => {}}
                    visibility="public"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => setShowReplyInput(false)}
                      className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>{" "}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Comment
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative flex max-h-screen max-w-5xl items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={() => setImagePreview(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Previous button */}
            {imagePreview.images.length > 1 && imagePreview.index > 0 && (
              <button
                onClick={() =>
                  setImagePreview({
                    ...imagePreview,
                    index: imagePreview.index - 1,
                  })
                }
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Next button */}
            {imagePreview.images.length > 1 &&
              imagePreview.index < imagePreview.images.length - 1 && (
                <button
                  onClick={() =>
                    setImagePreview({
                      ...imagePreview,
                      index: imagePreview.index + 1,
                    })
                  }
                  className="absolute right-16 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

            {/* Main image */}
            <div className="flex max-h-full max-w-full items-center justify-center">
              <img
                src={imagePreview.images[imagePreview.index]?.image}
                alt={imagePreview.images[imagePreview.index]?.name || "Preview"}
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                style={{ maxHeight: "90vh", maxWidth: "90vw" }}
              />
            </div>

            {/* Image counter */}
            {imagePreview.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                {imagePreview.index + 1} / {imagePreview.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserEventCard;
