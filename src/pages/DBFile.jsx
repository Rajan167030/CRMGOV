import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import T from "../constants/tokens";
import useIsMobile from "../hooks/useIsMobile";
import {
  continueModelComplaintChat,
  saveComplaintRequest,
  startModelComplaintChat,
} from "../services/api";
import {
  AUTO_LANGUAGE,
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTIONS,
  buildLocalizedAssistantReply,
  detectLanguage,
  extractModelLocation,
  extractModelTicketId,
  getCommonVoiceCopy,
  getSpeechRecognitionConstructor,
  getVoiceSupport,
  getVoiceTuning,
  getVoiceUiCopy,
  pickBestSpeechVoice,
  resolveLanguage,
} from "../utils/voiceChat";

const resolveBrowserLanguage = () => {
  if (typeof navigator === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const preferredLocales = [...(navigator.languages || []), navigator.language]
    .filter(Boolean)
    .map((locale) => locale.toLowerCase());

  for (const locale of preferredLocales) {
    const matchedOption = LANGUAGE_OPTIONS.find((option) => {
      if (option.value === AUTO_LANGUAGE) {
        return false;
      }

      const prefix = option.value.toLowerCase().split("-")[0];
      return locale === option.value.toLowerCase() || locale.startsWith(prefix);
    });

    if (matchedOption) {
      return matchedOption.value;
    }
  }

  return DEFAULT_LANGUAGE;
};

const checkMicrophoneAvailability = async () => {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return {
      ok: false,
      reason: "unsupported",
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { ok: true };
  } catch (error) {
    if (error?.name === "NotAllowedError" || error?.name === "SecurityError") {
      return { ok: false, reason: "permission-denied" };
    }

    if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
      return { ok: false, reason: "no-device" };
    }

    if (error?.name === "NotReadableError" || error?.name === "TrackStartError") {
      return { ok: false, reason: "device-busy" };
    }

    return {
      ok: false,
      reason: "unknown",
      error,
    };
  }
};

function DBFile() {
  const isMobile = useIsMobile(768);
  const [modelSessionId, setModelSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(AUTO_LANGUAGE);
  const [activeLanguage, setActiveLanguage] = useState(DEFAULT_LANGUAGE);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: getVoiceUiCopy(DEFAULT_LANGUAGE).assistantMessage,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceRepliesEnabled, setVoiceRepliesEnabled] = useState(true);
  const [error, setError] = useState("");
  const [complaintId, setComplaintId] = useState("");
  const [ticket, setTicket] = useState(null);
  const [savedTicketId, setSavedTicketId] = useState("");
  const [availableVoices, setAvailableVoices] = useState([]);
  const listRef = useRef(null);
  const recognitionRef = useRef(null);
  const pendingVoiceSubmitRef = useRef("");
  const messagesRef = useRef(messages);
  const modelSessionIdRef = useRef(modelSessionId);
  const savedTicketIdRef = useRef(savedTicketId);
  const voiceSupport = getVoiceSupport();
  const commonVoiceCopy = getCommonVoiceCopy();
  const uiLanguage =
    selectedLanguage === AUTO_LANGUAGE ? activeLanguage : selectedLanguage;
  const uiCopy = getVoiceUiCopy(uiLanguage);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    modelSessionIdRef.current = modelSessionId;
  }, [modelSessionId]);

  useEffect(() => {
    savedTicketIdRef.current = savedTicketId;
  }, [savedTicketId]);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, isSubmitting]);

  useEffect(() => {
    if (!voiceRepliesEnabled && voiceSupport.synthesis) {
      window.speechSynthesis.cancel();
    }
  }, [voiceRepliesEnabled, voiceSupport.synthesis]);

  useEffect(() => {
    if (!voiceSupport.synthesis) {
      return undefined;
    }

    const loadVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voiceSupport.synthesis]);

  useEffect(() => {
    if (
      messages.length === 1 &&
      messages[0]?.role === "assistant" &&
      messages[0]?.content !== uiCopy.assistantMessage &&
      !modelSessionId &&
      !ticket &&
      !complaintId &&
      !input
    ) {
      setMessages([{ role: "assistant", content: uiCopy.assistantMessage }]);
    }
  }, [uiCopy.assistantMessage, messages, modelSessionId, ticket, complaintId, input]);

  useEffect(
    () => () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      if (voiceSupport.synthesis) {
        window.speechSynthesis.cancel();
      }
    },
    [voiceSupport.synthesis]
  );

  const btnStyle = {
    background: T.gradientRed,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px 24px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all .2s",
    boxShadow: `0 6px 20px ${T.primary}33`,
  };

  const pillButtonStyle = {
    borderRadius: 999,
    border: `1px solid ${T.border}`,
    background: T.white,
    color: T.text,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };

  const p = isMobile ? "16px" : "28px 34px";

  const stopSpeaking = () => {
    if (voiceSupport.synthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const speakAssistantReply = (text, language) => {
    if (
      !voiceRepliesEnabled ||
      !voiceSupport.synthesis ||
      typeof text !== "string" ||
      !text.trim()
    ) {
      return;
    }

    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = language || DEFAULT_LANGUAGE;
    const tuning = getVoiceTuning(utterance.lang);
    const voice = pickBestSpeechVoice(availableVoices, utterance.lang);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.rate = tuning.rate;
    utterance.pitch = tuning.pitch;
    utterance.volume = tuning.volume;

    window.speechSynthesis.speak(utterance);
  };

  const resetConversation = () => {
    pendingVoiceSubmitRef.current = "";

    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    stopSpeaking();
    setIsListening(false);
    setModelSessionId(null);
    setInput("");
    setComplaintId("");
    setTicket(null);
    setSavedTicketId("");
    setError("");
    setMessages([
      {
        role: "assistant",
        content: uiCopy.assistantMessage,
      },
    ]);
  };

  const submitMessage = async (overrideMessage) => {
    const sourceMessage =
      typeof overrideMessage === "string" ? overrideMessage : input;
    const trimmedMessage = sourceMessage.trim();

    if (!trimmedMessage || isSubmitting) {
      return;
    }

    const resolvedLanguage = resolveLanguage(selectedLanguage, trimmedMessage);
    const previousMessages = messagesRef.current;
    const nextMessages = [
      ...previousMessages,
      { role: "user", content: trimmedMessage },
    ];

    setActiveLanguage(resolvedLanguage);
    setError("");
    setIsSubmitting(true);
    setMessages(nextMessages);
    setInput("");

    try {
      const response = modelSessionIdRef.current
        ? await continueModelComplaintChat({
            sessionId: modelSessionIdRef.current,
            text: trimmedMessage,
            conversationHistory: nextMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          })
        : await startModelComplaintChat({
            text: trimmedMessage,
          });

      if (response?.session_id) {
        setModelSessionId(response.session_id);
      }

      const assistantReply = buildLocalizedAssistantReply(
        response,
        resolvedLanguage
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "assistant", content: assistantReply },
      ]);

      speakAssistantReply(assistantReply, resolvedLanguage);

      const ticketId = extractModelTicketId(response);
      if (ticketId && ticketId !== savedTicketIdRef.current) {
        const complaintPayload = {
          complaint: response?.slots?.DESCRIPTION?.trim() || trimmedMessage,
          department: response?.department || "General",
          location: extractModelLocation(response),
          priority: "Medium",
          ticketId,
        };

        const savedComplaint = await saveComplaintRequest(complaintPayload);
        const complaintRecord = savedComplaint.complaint;

        setSavedTicketId(ticketId);
        setComplaintId(complaintRecord.ticketId || complaintRecord._id);
        setTicket(complaintRecord);
      }
    } catch (requestError) {
      setMessages(previousMessages);
      setError(requestError.message || "Unable to process your message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stopListening = () => {
    pendingVoiceSubmitRef.current = "";

    if (recognitionRef.current) {
      recognitionRef.current.onend = () => {
        recognitionRef.current = null;
        setIsListening(false);
      };
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
  };

  const startListening = async () => {
    if (!voiceSupport.recognition) {
      setError(commonVoiceCopy.micNotSupported);
      return;
    }

    if (!voiceSupport.secureContext) {
      setError(commonVoiceCopy.insecureContext);
      return;
    }

    if (isSubmitting) {
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      setError(commonVoiceCopy.micNotSupported);
      return;
    }

    const microphoneCheck = await checkMicrophoneAvailability();

    if (!microphoneCheck.ok) {
      if (microphoneCheck.reason === "permission-denied") {
        setError("Microphone permission is blocked for this site. Allow microphone access in the browser site settings and try again.");
        return;
      }

      if (microphoneCheck.reason === "no-device") {
        setError(commonVoiceCopy.noMicrophone);
        return;
      }

      if (microphoneCheck.reason === "device-busy") {
        setError("Your microphone is busy in another app or browser tab. Close the other recording app and try again.");
        return;
      }
    }

    const recognitionLanguage =
      selectedLanguage === AUTO_LANGUAGE
        ? activeLanguage !== DEFAULT_LANGUAGE
          ? activeLanguage
          : resolveBrowserLanguage()
        : selectedLanguage;
    const recognition = new SpeechRecognition();

    recognition.lang = recognitionLanguage || DEFAULT_LANGUAGE;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    pendingVoiceSubmitRef.current = "";
    setError("");
    setIsListening(true);

    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript || "";
      }

      const normalizedTranscript = transcript.trim();
      if (!normalizedTranscript) {
        return;
      }

      const detectedVoiceLanguage =
        selectedLanguage === AUTO_LANGUAGE
          ? detectLanguage(normalizedTranscript)
          : selectedLanguage;

      setActiveLanguage(detectedVoiceLanguage);
      setInput(normalizedTranscript);

      const hasFinalChunk = Array.from(event.results).some((result) => result.isFinal);
      if (hasFinalChunk) {
        pendingVoiceSubmitRef.current = normalizedTranscript;
      }
    };

    recognition.onerror = (event) => {
      recognitionRef.current = null;
      setIsListening(false);

      if (event.error === "aborted") {
        return;
      }

      if (event.error === "service-not-allowed") {
        setError(commonVoiceCopy.speechServiceBlocked);
        return;
      }

      if (event.error === "not-allowed") {
        setError("Microphone permission is blocked for speech recognition. Check browser site permissions and speech/privacy settings, then try again.");
        return;
      }

      if (event.error === "no-speech") {
        setError("No speech was detected. Please try again.");
        return;
      }

      setError(`Voice input failed: ${event.error}`);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);

      const finalTranscript = pendingVoiceSubmitRef.current.trim();
      pendingVoiceSubmitRef.current = "";

      if (finalTranscript) {
        submitMessage(finalTranscript);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (error) {
      recognitionRef.current = null;
      setIsListening(false);

      if (error?.name === "NotAllowedError" || error?.name === "SecurityError") {
        setError(commonVoiceCopy.speechServiceBlocked);
        return;
      }

      setError("Voice input could not start in this browser. Try Chrome or Edge on localhost or HTTPS.");
    }
  };

  const activeLanguageLabel =
    LANGUAGE_OPTIONS.find((option) => option.value === uiLanguage)?.label ||
    "English";
  const activeSpeechVoice =
    pickBestSpeechVoice(availableVoices, uiLanguage)?.name || "System default";

  const suggestedPrompts = getVoiceUiCopy(uiLanguage).prompts;

  return (
    <div style={{ padding: p, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1
          style={{
            color: T.text,
            fontSize: isMobile ? 24 : 32,
            fontWeight: 900,
            margin: "0 0 8px",
            fontFamily: "'Poppins',sans-serif",
          }}
        >
          Voice Complaint Assistant
        </h1>
        <p style={{ color: T.sub, fontSize: 15, margin: 0 }}>
          {uiCopy.description}
        </p>
      </div>
      <div style={{ display: "grid", gap: 20 }}>
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 24,
            padding: isMobile ? "20px" : "28px",
            boxShadow: T.shadow,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: T.text,
                  fontSize: 18,
                  fontWeight: 800,
                  fontFamily: "'Poppins',sans-serif",
                }}
              >
                Live Complaint Chat
              </div>
              <div style={{ color: T.sub, fontSize: 13, marginTop: 4 }}>
                Voice input uses browser ASR, replies can be spoken back with TTS,
                and language switches automatically from your input.
              </div>
            </div>
            <button
              onClick={resetConversation}
              style={{ ...btnStyle, padding: "10px 16px", fontSize: 13 }}
            >
              New Chat
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <label
              style={{
                display: "grid",
                gap: 6,
                color: T.sub,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Input Language
              <select
                value={selectedLanguage}
                onChange={(event) => {
                  const nextLanguage = event.target.value;
                  setSelectedLanguage(nextLanguage);
                  if (nextLanguage !== AUTO_LANGUAGE) {
                    setActiveLanguage(nextLanguage);
                  }
                }}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${T.border}`,
                  background: T.bg,
                  color: T.text,
                  padding: "12px 14px",
                  fontSize: 14,
                  outline: "none",
                }}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div
              style={{
                background: T.bg,
                border: `1px solid ${T.borderLight}`,
                borderRadius: 14,
                padding: "12px 14px",
                display: "grid",
                gap: 4,
              }}
            >
              <div
                style={{
                  color: T.sub,
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Active Language
              </div>
              <div style={{ color: T.text, fontSize: 15, fontWeight: 800 }}>
                {activeLanguageLabel}
              </div>
              <div style={{ color: T.sub, fontSize: 12 }}>
                {selectedLanguage === AUTO_LANGUAGE
                  ? "Detected from your latest message"
                  : "Locked from your language selection"}
              </div>
            </div>

            <div
              style={{
                background: T.bg,
                border: `1px solid ${T.borderLight}`,
                borderRadius: 14,
                padding: "12px 14px",
                display: "grid",
                gap: 4,
              }}
            >
              <div
                style={{
                  color: T.sub,
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Browser Support
              </div>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>
                Mic: {voiceSupport.recognition ? "Ready" : "Unavailable"}
              </div>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>
                Voice: {voiceSupport.synthesis ? "Ready" : "Unavailable"}
              </div>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>
                Secure page: {voiceSupport.secureContext ? "Yes" : "No"}
              </div>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>
                Active voice: {activeSpeechVoice}
              </div>
            </div>
          </div>

          <div
            ref={listRef}
            style={{
              background: T.bg,
              border: `1px solid ${T.borderLight}`,
              borderRadius: 18,
              padding: "16px",
              minHeight: 360,
              maxHeight: 480,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                style={{
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: isMobile ? "88%" : "72%",
                  background: message.role === "user" ? T.gradientRed : T.white,
                  color: message.role === "user" ? "#fff" : T.text,
                  border:
                    message.role === "user"
                      ? "none"
                      : `1px solid ${T.border}`,
                  borderRadius: 18,
                  padding: "12px 14px",
                  boxShadow:
                    message.role === "user"
                      ? `0 8px 18px ${T.primary}22`
                      : "none",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {message.content}
              </div>
            ))}
            {isSubmitting && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: T.white,
                  border: `1px solid ${T.border}`,
                  borderRadius: 18,
                  padding: "12px 14px",
                  color: T.sub,
                }}
              >
                {uiCopy.submitting}
              </div>
            )}
          </div>

          {ticket && (
            <div
              style={{
                marginTop: 16,
                background: T.white,
                border: `1px solid ${T.border}`,
                borderRadius: 18,
                padding: isMobile ? "18px" : "22px",
                boxShadow: T.shadow,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      color: T.green,
                      fontSize: 13,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Ticket Generated
                  </div>
                  <div
                    style={{
                      color: T.text,
                      fontSize: 22,
                      fontWeight: 900,
                      fontFamily: "'Poppins',sans-serif",
                      marginTop: 4,
                    }}
                  >
                    Complaint Filed
                  </div>
                </div>
                <Link
                  to="/dashboard/my-complaints"
                  style={{ ...btnStyle, padding: "10px 16px", fontSize: 13 }}
                >
                  Track Status
                </Link>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.borderLight}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      color: T.sub,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    Complaint ID
                  </div>
                  <div
                    style={{
                      color: T.primary,
                      fontSize: 17,
                      fontWeight: 900,
                      fontFamily: "monospace",
                    }}
                  >
                    {complaintId}
                  </div>
                </div>
                <div
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.borderLight}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      color: T.sub,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    Department
                  </div>
                  <div style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>
                    {ticket?.department || "General"}
                  </div>
                </div>
                <div
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.borderLight}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      color: T.sub,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    Location
                  </div>
                  <div style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>
                    {ticket?.location || "Not provided"}
                  </div>
                </div>
                <div
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.borderLight}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      color: T.sub,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    Priority
                  </div>
                  <div style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>
                    {ticket?.priority || "Medium"}
                  </div>
                </div>
                <div
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.borderLight}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      color: T.sub,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    Status
                  </div>
                  <div style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>
                    {ticket?.status || "Pending"}
                  </div>
                </div>
                <div
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.borderLight}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      color: T.sub,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    Created
                  </div>
                  <div style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>
                    {ticket?.createdAt
                      ? new Date(ticket.createdAt).toLocaleString()
                      : "Just now"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: T.bg,
                  border: `1px solid ${T.borderLight}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    color: T.sub,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  Complaint Summary
                </div>
                <div style={{ color: T.text, fontSize: 15, lineHeight: 1.6 }}>
                  {ticket?.complaint ||
                    "Your complaint has been registered successfully."}
                </div>
              </div>

              <button
                onClick={resetConversation}
                style={{
                  ...btnStyle,
                  marginTop: 16,
                  background: T.white,
                  color: T.text,
                  border: `1px solid ${T.border}`,
                  boxShadow: "none",
                }}
              >
                File Another
              </button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 16,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <input
              value={input}
              onChange={(event) => {
                const nextValue = event.target.value;
                setInput(nextValue);
                setError("");

                if (selectedLanguage === AUTO_LANGUAGE && nextValue.trim()) {
                  setActiveLanguage(detectLanguage(nextValue));
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitMessage();
                }
              }}
              placeholder={uiCopy.placeholder}
              style={{
                flex: 1,
                padding: "14px 16px",
                background: T.white,
                border: `1px solid ${error ? T.red : T.border}`,
                borderRadius: 12,
                color: T.text,
                fontSize: 15,
                outline: "none",
              }}
              disabled={isSubmitting}
            />
            <button
              onClick={startListening}
              style={{
                ...pillButtonStyle,
                minWidth: isMobile ? "100%" : 140,
                background: isListening ? `${T.accent}15` : T.white,
                border: `1px solid ${isListening ? T.accent : T.border}`,
                color: isListening ? T.accent : T.text,
              }}
              disabled={isSubmitting}
            >
              {isListening ? uiCopy.stopVoice : uiCopy.startVoice}
            </button>
            <button
              onClick={() => {
                setVoiceRepliesEnabled((currentValue) => !currentValue);
              }}
              style={{
                ...pillButtonStyle,
                minWidth: isMobile ? "100%" : 150,
                background: voiceRepliesEnabled ? `${T.green}12` : T.white,
                border: `1px solid ${voiceRepliesEnabled ? T.green : T.border}`,
                color: voiceRepliesEnabled ? T.green : T.text,
              }}
            >
              {voiceRepliesEnabled ? uiCopy.voiceOn : uiCopy.voiceOff}
            </button>
            <button
              onClick={() => submitMessage()}
              style={btnStyle}
              disabled={isSubmitting}
            >
              {uiCopy.send}
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            {isListening && (
              <div
                style={{
                  background: `${T.accent}14`,
                  color: T.accent,
                  border: `1px solid ${T.accent}33`,
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {uiCopy.listening}
              </div>
            )}
            {!voiceSupport.recognition && (
              <div style={{ color: T.sub, fontSize: 12 }}>
                {commonVoiceCopy.micNotSupported}
              </div>
            )}
            {!voiceSupport.synthesis && (
              <div style={{ color: T.sub, fontSize: 12 }}>
                {commonVoiceCopy.voiceNotSupported}
              </div>
            )}
          </div>

          {error && (
            <div
              style={{
                color: T.red,
                fontSize: 13,
                marginTop: 10,
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 24,
            padding: isMobile ? "20px" : "28px",
            boxShadow: T.shadow,
          }}
        >
          <div
            style={{
              color: T.text,
              fontSize: 18,
              fontWeight: 800,
              fontFamily: "'Poppins',sans-serif",
              marginBottom: 12,
            }}
          >
            Suggested prompts
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt);
                  if (selectedLanguage === AUTO_LANGUAGE) {
                    setActiveLanguage(detectLanguage(prompt));
                  }
                }}
                style={{
                  border: `1px solid ${T.border}`,
                  background: T.bg,
                  color: T.text,
                  borderRadius: 999,
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DBFile;
