import api from "./axios";

export const authApi = {
  login: async ({ email, password }) => {
    const res = await api.get("/users", {
      params: { email, password },
    });

    if (res.data.length === 0) {
      throw new Error("E-posta veya şifre hatalı");
    }

    return res.data[0];
  },
};
