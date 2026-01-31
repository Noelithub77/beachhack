import { create } from "zustand";

interface CallState {
    isInCall: boolean;
    callSessionId: string | null;
    remoteUserId: string | null;
    remoteUserName: string | null;
    isMuted: boolean;
    isSpeakerOn: boolean;
    callStartTime: number | null;
    startCall: (sessionId: string, remoteId: string, remoteName: string) => void;
    endCall: () => void;
    toggleMute: () => void;
    toggleSpeaker: () => void;
}

export const useCallStore = create<CallState>((set) => ({
    isInCall: false,
    callSessionId: null,
    remoteUserId: null,
    remoteUserName: null,
    isMuted: false,
    isSpeakerOn: true,
    callStartTime: null,
    startCall: (sessionId, remoteId, remoteName) =>
        set({
            isInCall: true,
            callSessionId: sessionId,
            remoteUserId: remoteId,
            remoteUserName: remoteName,
            callStartTime: Date.now(),
            isMuted: false,
            isSpeakerOn: true,
        }),
    endCall: () =>
        set({
            isInCall: false,
            callSessionId: null,
            remoteUserId: null,
            remoteUserName: null,
            callStartTime: null,
        }),
    toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
    toggleSpeaker: () => set((s) => ({ isSpeakerOn: !s.isSpeakerOn })),
}));
