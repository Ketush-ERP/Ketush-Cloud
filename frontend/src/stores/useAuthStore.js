import { create } from "zustand";

const USER_KEY = "user";

const getInitialAuth = () => {
  const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
  return { user };
};

const useAuthStore = create((set) => ({
  ...getInitialAuth(),

  login: (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    set({ user: userData });
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("token");
    set({ user: null });
  },
}));

export default useAuthStore;
