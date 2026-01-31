import { create } from "zustand";

interface CallState {
    isInCall: boolean;
    conversationId: string | null;
    agentName: string;
    isMuted: boolean;
    callStartTime: number | null;
    agentMode: "listening" | "speaking";
    startCall: (conversationId: string, agentName?: string) => void;
    endCall: () => void;
    setAgentMode: (mode: "listening" | "speaking") => void;
    toggleMute: () => void;
}

export const useCallStore = create<CallState>((set) => ({
    isInCall: false,
    conversationId: null,
    agentName: "SAGE",
    isMuted: false,
    callStartTime: null,
    agentMode: "listening",
    startCall: (conversationId, agentName = "SAGE") =>
        set({
            isInCall: true,
            conversationId,
            agentName,
            callStartTime: Date.now(),
            isMuted: false,
            agentMode: "listening",
        }),
    endCall: () =>
        set({
            isInCall: false,
            conversationId: null,
            callStartTime: null,
            agentMode: "listening",
        }),
    setAgentMode: (mode) => set({ agentMode: mode }),
    toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
}));
