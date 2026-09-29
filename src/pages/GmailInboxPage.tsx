import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  X,
  ExternalLink,
  Inbox,
  Star,
  Clock,
  User,
  Shield,
  FileText,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import {
  googleSignIn,
  googleLogout,
  getAccessToken,
  getGoogleUser,
  initGoogleAuth,
  isGoogleAuthenticated,
} from '../services/googleAuth';
import { gmailService, GmailMessage, SAMPLE_CAMPUS_EMAILS } from '../services/gmailService';
import { useNotification } from '../context/NotificationContext';
import { User as FirebaseUser } from 'firebase/auth';

export const GmailInboxPage: React.FC = () => {
  const { showToast } = useNotification();

  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(getGoogleUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isGoogleAuthenticated());
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [messages, setMessages] = useState<GmailMessage[]>(SAMPLE_CAMPUS_EMAILS);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'timetable' | 'notices'>('all');

  // Compose Modal states
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Destructive confirmation modals (Mandatory by skill)
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState<string | null>(null);
  const [pendingSendParams, setPendingSendParams] = useState<{
    to: string;
    subject: string;
    body: string;
  } | null>(null);

  // Initialize Auth state listener on mount
  useEffect(() => {
    const unsub = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setIsAuthenticated(true);
        loadLiveEmails();
      },
      () => {
        setGoogleUser(null);
        setIsAuthenticated(false);
      }
    );
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const loadLiveEmails = async (query?: string) => {
    setIsLoading(true);
    try {
      const data = await gmailService.listMessages(query || searchQuery, 20);
      setMessages(data);
      if (data.length > 0 && !selectedMessage) {
        setSelectedMessage(data[0]);
      }
    } catch (err: any) {
      console.warn('Failed to fetch live emails:', err);
      showToast({
        type: 'warning',
        title: 'Gmail Sync Notice',
        message: err.message || 'Displaying cached campus messages.',
      });
      setMessages(SAMPLE_CAMPUS_EMAILS);
      setSelectedMessage(SAMPLE_CAMPUS_EMAILS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setIsAuthenticated(true);
        showToast({
          type: 'success',
          title: 'Google Connected',
          message: `Signed in as ${res.user.email}. Loading your Gmail inbox...`,
        });
        await loadLiveEmails();
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Sign In Failed',
        message: err.message || 'Could not complete Google authentication.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await googleLogout();
    setGoogleUser(null);
    setIsAuthenticated(false);
    setMessages(SAMPLE_CAMPUS_EMAILS);
    setSelectedMessage(SAMPLE_CAMPUS_EMAILS[0]);
    showToast({
      type: 'info',
      title: 'Google Disconnected',
      message: 'Signed out of Gmail session. Displaying offline campus messages.',
    });
  };

  // Compose templates for comrades
  const applyTemplate = (type: 'timetable_clash' | 'lab_issue' | 'leave') => {
    if (type === 'timetable_clash') {
      setComposeTo('registrar.academic@must.ac.ke');
      setComposeSubject('Inquiry Regarding Lab 3 Timetable Collision on Monday');
      setComposeBody(
        `Dear Academic Registrar & Timetable Coordinator,\n\nI am writing to formally report an overlap in Science Complex Lab 3 on Monday morning between BCS 3101 (Database Systems) and BBIT 2204 (Web Application Development). Both cohorts require practical lab workstations.\n\nCould you please advise if BBIT 2204 has been relocated to Lab 2 as indicated on CampusEcho?\n\nThank you,\nComrade Brian Mwangi\nBSc Computer Science (Year 3)`
      );
    } else if (type === 'lab_issue') {
      setComposeTo('ict.support@must.ac.ke');
      setComposeSubject('Fault Report: Projector Signal Failure in Room 204');
      setComposeBody(
        `Dear ICT Support Team,\n\nDuring our morning lecture in Engineering Block Room 204, the ceiling projector continually disconnected and flashed every few minutes.\n\nKindly send a technician to inspect the HDMI cable connection and signal splitter.\n\nRegards,\nComrade Brian Mwangi`
      );
    } else if (type === 'leave') {
      setComposeTo('evans.otieno@must.ac.ke');
      setComposeSubject('Notice of Absence: Database Systems Practical');
      setComposeBody(
        `Dear Dr. Evans Otieno,\n\nI am writing to notify you that I may be delayed for the upcoming practical session due to a medical appointment at the university clinic.\n\nI will complete the laboratory lab exercise write-up with my group.\n\nSincerely,\nBrian Mwangi (CT201/0142/23)`
      );
    }
  };

  // Step 1 of Sending: Trigger Confirmation Dialog (MANDATORY User Confirmation)
  const initiateSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing Fields',
        message: 'Please provide both a recipient email and subject.',
      });
      return;
    }

    setPendingSendParams({
      to: composeTo.trim(),
      subject: composeSubject.trim(),
      body: composeBody,
    });
  };

  // Step 2 of Sending: Confirmed by User in Dialog
  const handleConfirmedSend = async () => {
    if (!pendingSendParams) return;

    setIsSending(true);
    try {
      if (isAuthenticated) {
        await gmailService.sendEmail(pendingSendParams);
        showToast({
          type: 'success',
          title: 'Email Sent via Gmail',
          message: `✓ Message dispatched to ${pendingSendParams.to} successfully.`,
        });
      } else {
        // Mock send in offline/demo mode
        const mockMsg: GmailMessage = {
          id: `sent-${Date.now()}`,
          threadId: `th-${Date.now()}`,
          subject: pendingSendParams.subject,
          from: 'Me <brian.mwangi@student.must.ac.ke>',
          to: pendingSendParams.to,
          date: new Date().toISOString(),
          snippet: pendingSendParams.body.slice(0, 100),
          body: pendingSendParams.body,
          isUnread: false,
          labels: ['SENT'],
        };
        setMessages((prev) => [mockMsg, ...prev]);
        setSelectedMessage(mockMsg);
        showToast({
          type: 'success',
          title: 'Email Dispatched (Demo)',
          message: `✓ Email sent to ${pendingSendParams.to}. Connect Google to send via live Gmail.`,
        });
      }

      setIsComposeOpen(false);
      setPendingSendParams(null);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Send Error',
        message: err.message || 'Failed to dispatch email.',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Step 1 of Delete: Trigger Confirmation Dialog (MANDATORY User Confirmation)
  const initiateTrashMessage = (msgId: string) => {
    setConfirmDeleteMessageId(msgId);
  };

  // Step 2 of Delete: Confirmed by User in Dialog
  const handleConfirmedTrash = async () => {
    if (!confirmDeleteMessageId) return;

    try {
      if (isAuthenticated) {
        await gmailService.trashMessage(confirmDeleteMessageId);
      }
      setMessages((prev) => prev.filter((m) => m.id !== confirmDeleteMessageId));
      if (selectedMessage?.id === confirmDeleteMessageId) {
        setSelectedMessage(null);
      }
      showToast({
        type: 'info',
        title: 'Email Deleted',
        message: 'Message was moved to Trash.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not move message to trash.',
      });
    } finally {
      setConfirmDeleteMessageId(null);
    }
  };

  const handleSelectMessage = (msg: GmailMessage) => {
    setSelectedMessage(msg);
    if (msg.isUnread) {
      msg.isUnread = false;
      if (isAuthenticated) {
        gmailService.markAsRead(msg.id).catch(() => {});
      }
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'unread' && !m.isUnread) return false;
    if (
      activeFilter === 'timetable' &&
      !m.subject.toLowerCase().includes('timetable') &&
      !m.subject.toLowerCase().includes('lab')
    ) {
      return false;
    }
    if (
      activeFilter === 'notices' &&
      !m.subject.toLowerCase().includes('exam') &&
      !m.subject.toLowerCase().includes('notice') &&
      !m.subject.toLowerCase().includes('hackathon')
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        m.subject.toLowerCase().includes(q) ||
        m.from.toLowerCase().includes(q) ||
        m.snippet.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Campus Gmail & Official Communications
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Access your official university emails, timetable notices, and communicate directly with faculty and administration.
            </p>
          </div>

          {/* Google Connection Status / Sign-In */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated && googleUser ? (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="font-bold text-emerald-950 leading-tight">
                      {googleUser.displayName || 'Google Account'}
                    </p>
                    <p className="text-[10px] text-emerald-700 truncate max-w-[150px]">
                      {googleUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGoogleLogout}
                  className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-lg text-[10px] font-bold transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              /* Official Google Sign-In button */
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.25C.45 8.22 0 10.05 0 12s.45 3.78 1.25 5.39l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
                <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}

            <button
              onClick={() => setIsComposeOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Compose Email</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Refresh */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search emails by sender, subject, or keywords (e.g. Lab 3, Exams)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                activeFilter === 'all'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Mail ({messages.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                activeFilter === 'unread'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unread ({messages.filter((m) => m.isUnread).length})
            </button>
            <button
              onClick={() => setActiveFilter('timetable')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                activeFilter === 'timetable'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Timetable & Labs
            </button>
            <button
              onClick={() => setActiveFilter('notices')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                activeFilter === 'notices'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Official Notices
            </button>
            <button
              onClick={() => loadLiveEmails()}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              title="Refresh Emails"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Mail Grid: List (Left) & Reader (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
        {/* Email List Column */}
        <div
          className={`lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col ${
            selectedMessage ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Inbox Messages ({filteredMessages.length})</span>
            {isAuthenticated ? (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                ✓ Live Gmail Sync
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-medium">
                Showing Campus Memos
              </span>
            )}
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-[620px]">
            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-600">No emails found</p>
                <p className="text-slate-400 mt-1">Try clearing filters or search term.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-4 cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-rose-50/60 border-l-4 border-rose-600'
                        : msg.isUnread
                        ? 'bg-white font-bold'
                        : 'bg-slate-50/30 hover:bg-slate-50 font-normal'
                    }`}
                  >
                    <div className="mt-1 shrink-0">
                      {msg.isUnread ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 block ring-2 ring-rose-200" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 block" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`truncate text-xs ${msg.isUnread ? 'font-black text-slate-900' : 'text-slate-700'}`}>
                          {msg.from.split('<')[0].replace(/"/g, '')}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {new Date(msg.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h4 className={`text-xs truncate ${msg.isUnread ? 'font-black text-slate-900' : 'text-slate-800'}`}>
                        {msg.subject}
                      </h4>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-snug">
                        {msg.snippet}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Email Reader View (Right Column) */}
        <div
          className={`lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between ${
            !selectedMessage ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {selectedMessage ? (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              <div>
                {/* Back button for mobile */}
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="lg:hidden flex items-center gap-1 text-xs text-rose-600 font-bold mb-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to inbox list</span>
                </button>

                {/* Email Subject & Actions Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                      <span className="font-bold text-slate-800">From: {selectedMessage.from}</span>
                      <span>•</span>
                      <span>To: {selectedMessage.to || 'Me'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setComposeTo(selectedMessage.from.match(/<(.+)>/)?.[1] || selectedMessage.from);
                        setComposeSubject(`Re: ${selectedMessage.subject}`);
                        setComposeBody(`\n\n--- In reply to ---\n${selectedMessage.body}`);
                        setIsComposeOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-rose-600" />
                      <span>Reply</span>
                    </button>

                    <button
                      onClick={() => initiateTrashMessage(selectedMessage.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete email"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Date & Labels */}
                <div className="py-2.5 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(selectedMessage.date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedMessage.labels.map((lbl) => (
                      <span
                        key={lbl}
                        className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase"
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Body Content */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedMessage.body || selectedMessage.snippet}
                </div>
              </div>

              {/* Quick Reply Bar */}
              <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs text-slate-500">
                <span>Direct Gmail communication protocol</span>
                <button
                  onClick={() => {
                    setComposeTo(selectedMessage.from.match(/<(.+)>/)?.[1] || selectedMessage.from);
                    setComposeSubject(`Re: ${selectedMessage.subject}`);
                    setComposeBody(`\n\n--- In reply to ---\n${selectedMessage.body}`);
                    setIsComposeOpen(true);
                  }}
                  className="font-bold text-rose-600 hover:underline"
                >
                  Write Response →
                </button>
              </div>
            </div>
          ) : (
            <div className="m-auto text-center text-slate-400 text-xs p-10">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-slate-700">No message selected</h3>
              <p className="mt-1">Select an email from the left to read full contents or reply.</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-slate-900">Compose Campus Email</h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Quick Templates Bar */}
            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-2 text-xs overflow-x-auto">
              <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Templates:</span>
              </span>
              <button
                type="button"
                onClick={() => applyTemplate('timetable_clash')}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-lg text-[11px] font-semibold whitespace-nowrap transition"
              >
                Timetable Clash (Lab 3)
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('lab_issue')}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-lg text-[11px] font-semibold whitespace-nowrap transition"
              >
                Fault Report (Room 204)
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('leave')}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-lg text-[11px] font-semibold whitespace-nowrap transition"
              >
                Absence Notice
              </button>
            </div>

            <form onSubmit={initiateSendEmail} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">To (Recipient Email)</label>
                <input
                  type="email"
                  required
                  placeholder="recipient@must.ac.ke or comrade@student.must.ac.ke"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inquire regarding Science Complex Lab 3 room allocation"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Body</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write your email message to campus administration or fellow comrades..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 leading-relaxed font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isAuthenticated
                    ? 'Dispatched directly from your connected Gmail address.'
                    : 'Demo sender mode (Sign in with Google for live dispatch).'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2 text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION DIALOG: SEND EMAIL */}
      {pendingSendParams && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold mx-auto">
              <Send className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-900">Confirm Sending Email</h3>
              <p className="text-slate-600">
                Are you sure you want to send this email via your Gmail account?
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 space-y-1">
              <p>
                <strong>To:</strong> {pendingSendParams.to}
              </p>
              <p>
                <strong>Subject:</strong> {pendingSendParams.subject}
              </p>
              <p className="text-slate-500 line-clamp-2">
                <strong>Body:</strong> {pendingSendParams.body}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingSendParams(null)}
                disabled={isSending}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmedSend}
                disabled={isSending}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                {isSending ? 'Sending...' : 'Yes, Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION DIALOG: DELETE / TRASH EMAIL */}
      {confirmDeleteMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-900">Move Message to Trash?</h3>
              <p className="text-slate-600">
                Are you sure you want to delete this email? This operation mutates your Gmail mailbox.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteMessageId(null)}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmedTrash}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
