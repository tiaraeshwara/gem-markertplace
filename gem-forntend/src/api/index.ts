import api from "./client";

export interface LoginData {
  email: string;
  password: string;
}
export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: "seller" | "buyer";
  phone?: string;
}

export const authApi = {
  login: (data: LoginData) => api.post("/auth/login", data),
  register: (data: RegisterData) => api.post("/auth/register", data),
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
  verifyEmail: (token: string) => api.post("/auth/verify-email", { token }),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),
  getMe: () => api.get("/auth/me"),
};

export const gemsApi = {
  list: (params?: Record<string, unknown>) => api.get("/gems", { params }),
  getOne: (id: string) => api.get(`/gems/${id}`),
  create: (data: FormData) =>
    api.post("/gems", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/gems/${id}`, data),
  delete: (id: string) => api.delete(`/gems/${id}`),
  myGems: () => api.get("/gems/my"),
  submitForReview: (id: string) => api.post(`/gems/${id}/submit`),
  addImages: (id: string, files: FormData) =>
    api.post(`/gems/${id}/images`, files, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  removeImage: (gemId: string, imageId: string) =>
    api.delete(`/gems/${gemId}/images/${imageId}`),
  uploadCertificate: (id: string, file: FormData) =>
    api.post(`/gems/${id}/certificate`, file, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const reservationsApi = {
  create: (gemId: string) => api.post("/reservations", { gemId }),
  cancel: (id: string) => api.delete(`/reservations/${id}`),
  myReservations: () => api.get("/reservations/my"),
  gemReservations: (gemId: string) => api.get(`/reservations/gem/${gemId}`),
};

export const valuationsApi = {
  submit: (
    gemId: string,
    data: { reservationId: string; offeredPrice: number; message?: string },
  ) => api.post(`/gems/${gemId}/valuations`, data),
  getGemValuations: (gemId: string) => api.get(`/gems/${gemId}/valuations`),
  selectValuation: (id: string) => api.put(`/valuations/${id}/select`),
  select: (id: string) => api.put(`/valuations/${id}/select`),
  myValuations: () => api.get("/valuations/my"),
};

export const chatApi = {
  getRooms: () => api.get("/chats"),
  getMessages: (roomId: string, page?: number) =>
    api.get(`/chats/${roomId}/messages`, { params: { page } }),
  sendMessage: (roomId: string, data: { content: string }) =>
    api.post(`/chats/${roomId}/messages`, data),
  getRoom: (roomId: string) => api.get(`/chats/${roomId}`),
};

export const notificationsApi = {
  getAll: () => api.get("/notifications"),
  markAllRead: () => api.put("/notifications/read-all"),
  markOneRead: (id: string) => api.put(`/notifications/${id}/read`),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
};

export const adminApi = {
  getStats: () => api.get("/admin/dashboard"),
  getDashboard: () => api.get("/admin/dashboard"),
  getPendingGems: () => api.get("/admin/gems/pending"),
  getAllGems: (status?: string) =>
    api.get("/admin/gems", { params: { status } }),
  approveGem: (id: string) => api.put(`/admin/gems/${id}/approve`),
  rejectGem: (id: string, reason: string) =>
    api.put(`/admin/gems/${id}/reject`, { reason }),
  getAllUsers: (role?: string) => api.get("/admin/users", { params: { role } }),
  getUsers: (params?: Record<string, unknown>) =>
    api.get("/admin/users", { params }),
  toggleUserStatus: (id: string) =>
    api.patch(`/admin/users/${id}/toggle-status`),
  toggleUser: (id: string) => api.patch(`/admin/users/${id}/toggle-status`),
  getChatRooms: () => api.get("/admin/chats"),
};
