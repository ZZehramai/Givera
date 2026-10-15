/* import { useEffect, useState } from "react";
import { Send, MessageSquare, User, Loader2 } from "lucide-react";
import api from "../api/axios";
import { useLanguage } from "../i18n/LanguageContext";

export default function CommentsSection({ campaignId }) {
  const { formatDate, t } = useLanguage();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isLoggedIn = Boolean(localStorage.getItem("access"));

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/campaigns/${campaignId}/comments/`);
        setComments(data);
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) fetchComments();
  }, [campaignId]);

  // Submit new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const { data } = await api.post(`/campaigns/${campaignId}/comments/`, {
        content: text.trim(),
      });
      setComments((prev) => [data, ...prev]);
      setText("");
    } catch (err) {
      setError(t("commentPostError"));
      console.log(err)
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <MessageSquare className="text-[#6F52D9]" size={22} />
        <h3 className="text-xl font-bold text-slate-800">
          Comments ({comments.length})
        </h3>
      </div>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mt-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-within focus-within:border-[#6F52D9] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#6F52D9]">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Leave a comment or word of support..."
              maxLength={500}
              className="w-full resize-none bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
            
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-[11px] font-medium text-slate-400">
                {text.length}/500
              </span>

              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#6F52D9] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#5b3fd1] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Posting...
                  </>
                ) : (
                  <>
                    <Send size={13} /> Post Comment
                  </>
                )}
              </button>
            </div>
          </div>
          {error && <p className="mt-1.5 text-xs font-semibold text-rose-500">{error}</p>}
        </form>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs font-medium text-slate-500">
            Please log in to share your support and join the conversation.
          </p>
        </div>
      )}

      {/* Comments List }
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAE5FF] text-[#6F52D9]">
                <User size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">
                    {item.author_name || item.user || "Supporter"}
                  </p>
                  <span className="text-[11px] font-medium text-slate-400">
                    {formatDate ? formatDate(item.created_at) : new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                  {item.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-xs font-medium text-slate-400">
            No comments yet. Be the first to leave a message!
          </p>
        )}
      </div>
    </div>
  );
}*/

import { useEffect, useState } from "react";
import { Send, MessageSquare, User, Loader2, CornerDownRight } from "lucide-react";
import api from "../api/axios";
import { useLanguage } from "../i18n/LanguageContext";

export default function CommentsSection({ campaignId }) {
  const { formatDate, t } = useLanguage();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // State for threaded replies
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem("access"));

  // Fetch comments tree
  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/campaigns/${campaignId}/comments/`);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!campaignId) return undefined;
    let active = true;
    api.get(`/campaigns/${campaignId}/comments/`)
      .then(({ data }) => {
        if (active) setComments(data);
      })
      .catch((err) => {
        console.error("Failed to load comments:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [campaignId]);

  // Submit top-level comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      await api.post(`/campaigns/${campaignId}/comments/`, {
        content: text.trim(),
      });
      setText("");
      fetchComments();
    } catch (err) {
      setError("Failed to post comment. Please try again.");
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply to a parent comment
  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setReplySubmitting(true);
    setError("");
    try {
      await api.post(`/campaigns/${campaignId}/comments/`, {
        content: replyText.trim(),
        parent: parentId,
      });
      setReplyText("");
      setReplyToId(null);
      fetchComments();
    } catch (err) {
      setError(t("replyPostError"));
      console.error("Failed to post reply:", err);
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2.5 pb-2">
        <MessageSquare className="text-[#6F52D9]" size={22} />
        <h3 className="text-xl font-bold text-slate-800">
          {t("comments")} ({comments.length})
        </h3>
      </div>

      {/* Interactive Comment Box */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mt-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-within">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("commentPlaceholder")}
              maxLength={500}
              className="w-full resize-none bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
            
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-[11px] font-medium text-slate-400">
                {text.length}/500
              </span>

              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#6F52D9] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#5b3fd1] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> {t("postingComment")}
                  </>
                ) : (
                  <>
                    <Send size={13} /> {t("postComment")}
                  </>
                )}
              </button>
            </div>
          </div>
          {error && <p className="mt-1.5 text-xs font-semibold text-rose-500">{error}</p>}
        </form>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs font-medium text-slate-500">
            {t("loginToComment")}
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((item) => (
            <div key={item.id} className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAE5FF] text-[#6F52D9]">
                  <User size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">
                      {item.author || item.author_name || item.user || t("supporter")}
                    </p>
                    <span className="text-[11px] font-medium text-slate-400">
                      {formatDate ? formatDate(item.created_at) : new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                    {item.content}
                  </p>

                  {/* Toggle Reply Input */}
                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        setReplyToId(replyToId === item.id ? null : item.id);
                        setReplyText("");
                      }}
                      className="mt-2 text-xs font-bold text-[#6F52D9] hover:underline"
                    >
                      {replyToId === item.id ? t("cancel") : t("reply")}
                    </button>
                  )}

                  {/* Reply Form */}
                  {replyToId === item.id && (
                    <form onSubmit={(e) => handleReplySubmit(e, item.id)} className="mt-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`${t("replyTo")} ${item.author || t("user")}...`}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#6F52D9]"
                        />
                        <button
                          type="submit"
                          disabled={replySubmitting || !replyText.trim()}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#6F52D9] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                        >
                          {replySubmitting ? <Loader2 size={12} className="animate-spin" /> : t("reply")}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Threaded Child Replies */}
              {item.replies && item.replies.length > 0 && (
                <div className="mt-3 ml-6 space-y-3 border-l-2 border-slate-200 pl-4 pt-2">
                  {item.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-2.5">
                      <CornerDownRight size={14} className="mt-1 text-slate-400 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">
                            {reply.author || reply.author_name || reply.user || t("supporter")}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {formatDate ? formatDate(reply.created_at) : new Date(reply.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600 whitespace-pre-line">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-xs font-medium text-slate-400">
            {t("noCommentsYet")}
          </p>
        )}
      </div>
    </div>
  );
}
