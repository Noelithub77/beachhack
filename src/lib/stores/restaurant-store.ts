import { create } from "zustand";
import { Id, Doc } from "@/../convex/_generated/dataModel";

type Restaurant = Doc<"restaurants">;

interface RestaurantState {
  // cached restaurants by id
  restaurants: Map<Id<"restaurants">, Restaurant>;
  // track loading state per restaurant
  loading: Map<Id<"restaurants">, boolean>;
  // track if we've ever fetched this restaurant
  fetched: Set<Id<"restaurants">>;

  // actions
  setRestaurant: (id: Id<"restaurants">, data: Restaurant) => void;
  setLoading: (id: Id<"restaurants">, loading: boolean) => void;
  markFetched: (id: Id<"restaurants">) => void;
  getRestaurant: (id: Id<"restaurants">) => Restaurant | undefined;
  hasCache: (id: Id<"restaurants">) => boolean;
  isLoading: (id: Id<"restaurants">) => boolean;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  restaurants: new Map(),
  loading: new Map(),
  fetched: new Set(),

  setRestaurant: (id, data) =>
    set((state) => {
      const newRestaurants = new Map(state.restaurants);
      newRestaurants.set(id, data);
      const newFetched = new Set(state.fetched);
      newFetched.add(id);
      return { restaurants: newRestaurants, fetched: newFetched };
    }),

  setLoading: (id, loading) =>
    set((state) => {
      const newLoading = new Map(state.loading);
      newLoading.set(id, loading);
      return { loading: newLoading };
    }),

  markFetched: (id) =>
    set((state) => {
      const newFetched = new Set(state.fetched);
      newFetched.add(id);
      return { fetched: newFetched };
    }),

  getRestaurant: (id) => get().restaurants.get(id),

  hasCache: (id) => get().restaurants.has(id),

  isLoading: (id) => get().loading.get(id) ?? false,
}));
