import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { NotificationPayload } from "../types";

export interface NotificationItem {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: NotificationPayload;
}

interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<NotificationItem, "id" | "timestamp" | "read">>) => {
      const newNotification: NotificationItem = {
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.items.unshift(newNotification);
      state.unreadCount += 1;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find((item) => item.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((item) => {
        item.read = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.items.find((item) => item.id === action.payload);
      if (notification) {
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter((item) => item.id !== action.payload);
      }
    },
    clearAllNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
