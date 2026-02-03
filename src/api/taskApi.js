import api from "./axios";

export const taskApi = {
  getAll: () => api.get("/tasks"),
  create: (task) => api.post("/tasks", task),
  update: (id, task) => {
    // JSON Server büyük sayıları kabul etmez, string yap
    const stringId = String(id);
    const cleanTask = { ...task };
    delete cleanTask.id;
    
    return api.put(`/tasks/${stringId}`, cleanTask);
  },
  remove: (id) => {
    // JSON Server büyük sayıları kabul etmez, string yap
    const stringId = String(id);
    
    return api.delete(`/tasks/${stringId}`);
  },
};