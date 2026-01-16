import React, { useState } from "react";
import { TrackingEvent } from "./types";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Attachment {
  name: string;
  size: string;
  type: string;
  image?: string;
}

interface UserEventCardProps {
  event: TrackingEvent;
  onEdit?: (eventId: number, content: string) => Promise<void>;
  onDelete?: (eventId: number) => Promise<void>;
  onReply?: (eventId: number, content: string) => Promise<void>;
  isSuperAgent?: boolean;
}

const UserEventCard: React.FC<UserEventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onReply,
  isSuperAgent = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  // Mock data - in real implementation, this would come from props
  const replies: TrackingEvent[] = [];
  const allAttachments: Attachment[] = [];

  const userName = "User"; // In real implementation, this would come from event data
  const userInitials = "U";
  const timestamp = new Date(event.createdAt).toLocaleString();

  // Determine visibility based on ACLs
  const visibility = "public"; // Mock - in real implementation, this would come from event data

  const handleUpdateComment = async (
    eventId: string | number,
    content: string
  ) => {
    if (!content.trim()) return;
    if (onEdit) {
      await onEdit(Number(eventId), content);
    }
    setIsEditing(false);
  };

  const handleDeleteComment = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (onDelete) {
      await onDelete(Number(event.id));
    }
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleReplySubmit = (
    replyMessage: string,
    _visibility: "staff" | "public"
  ) => {
    if (onReply) {
      onReply(Number(event.id), replyMessage);
    }
    setShowReplyInput(false);
  };

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
                {false && ( // Mock - in real implementation, this would check if event is edited
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
          </div>

          {/* Edit form or display content */}
          {isEditing ? (
            <div className="mt-2">
              <textarea
                className="w-full rounded border border-[#E5E7EB] p-2 text-sm"
                defaultValue={event.content}
                placeholder="Edit comment..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleUpdateComment(
                      event.id,
                      (e.target as HTMLTextAreaElement).value
                    );
                  }
                  if (e.key === "Escape") {
                    setIsEditing(false);
                  }
                }}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() =>
                    handleUpdateComment(
                      event.id,
                      (
                        document.querySelector(
                          "textarea"
                        ) as HTMLTextAreaElement
                      )?.value || ""
                    )
                  }
                  className="rounded border border-[#008060] bg-[#008060] px-3 py-1 text-xs text-white hover:bg-[#006644]"
                >
                  Save
                </button>
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
              dangerouslySetInnerHTML={{ __html: event.content || "" }}
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
                <motion.div
                  animate={{ rotate: showReplies ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-3 w-3" />
                </motion.div>
              </button>
            </div>
          )}

          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-3">
              <textarea
                className="w-full rounded border border-[#E5E7EB] p-2 text-sm"
                placeholder="Write a reply..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReplySubmit(
                      (e.target as HTMLTextAreaElement).value,
                      "public"
                    );
                  }
                }}
              />
            </div>
          )}

          {/* Replies */}
          <AnimatePresence>
            {showReplies && replies.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="rounded border-l-2 border-[#E5E7EB] bg-[#F9FAFB] p-2"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-[#637381] text-[10px] text-white">
                        R
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-medium text-[#212B36]">
                            Reply
                          </span>
                          <span className="text-xs text-[#637381]">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p
                          className="text-xs text-[#637381]"
                          dangerouslySetInnerHTML={{
                            __html: reply.content || "",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded border border-[#E5E7EB] bg-white p-4 shadow-lg">
            <h3 className="mb-2 text-sm font-medium text-[#212B36]">
              Delete Comment
            </h3>
            <p className="mb-4 text-sm text-[#637381]">
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                className="rounded border border-red-600 bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserEventCard;
