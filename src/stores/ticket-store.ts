import { create } from "zustand";
import { Id } from "../../convex/_generated/dataModel";

interface TicketState {
    currentTicketId: Id<"tickets"> | null;
    setCurrentTicket: (id: Id<"tickets"> | null) => void;
}

export const useTicketStore = create<TicketState>((set) => ({
    currentTicketId: null,
    setCurrentTicket: (id) => set({ currentTicketId: id }),
}));
