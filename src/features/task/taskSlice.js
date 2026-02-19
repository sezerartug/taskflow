import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { taskApi } from "../../api/taskApi";

// ---------- Async Thunks ----------
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, { rejectWithValue }) => {
    try {
      console.log("📡 fetchTasks çağrılıyor...");
      const res = await taskApi.getAll();
      console.log("✅ fetchTasks cevabı:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ fetchTasks hatası:", error);
      return rejectWithValue(
        error.response?.data?.message || "Görevler yüklenemedi",
      );
    }
  },
);

export const addTask = createAsyncThunk(
  "tasks/addTask",
  async ({ task }, { rejectWithValue }) => {
    try {
      console.log("📡 addTask çağrıldı:", { task });
      const res = await taskApi.create(task);
      console.log("✅ addTask cevabı:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ addTask hatası:", error);
      console.error("Hata detayı:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Görev eklenemedi",
      );
    }
  },
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, updatedTask }, { rejectWithValue }) => {
    try {
      console.log("📡 updateTask çağrıldı:", { id, updatedTask });
      const res = await taskApi.update(id, updatedTask);
      console.log("✅ updateTask cevabı:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ updateTask hatası:", error);
      return rejectWithValue(
        error.response?.data?.message || "Görev güncellenemedi",
      );
    }
  },
);

export const updateTaskStatus = createAsyncThunk(
  "tasks/updateTaskStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      console.log("📡 updateTaskStatus çağrıldı:", { id, status });
      const res = await taskApi.updateStatus(id, status);
      console.log("✅ updateTaskStatus cevabı:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ updateTaskStatus hatası:", error);
      return rejectWithValue(
        error.response?.data?.message || "Görev durumu güncellenemedi",
      );
    }
  },
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async ({ id }, { rejectWithValue }) => {
    try {
      console.log("📡 deleteTask çağrıldı:", { id });
      await taskApi.delete(id);
      console.log("✅ deleteTask başarılı");
      return id;
    } catch (error) {
      console.error("❌ deleteTask hatası:", error);
      return rejectWithValue(
        error.response?.data?.message || "Görev silinemedi",
      );
    }
  },
);

// ---------- Initial State ----------
const initialState = {
  items: [],
  loading: false,
  error: null,
};

// ---------- Slice ----------
const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchTasks
    builder.addCase(fetchTasks.pending, (state) => {
      console.log("⏳ fetchTasks pending...");
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      console.log("✅ fetchTasks fulfilled, gelen veri:", action.payload);
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      console.log("❌ fetchTasks rejected:", action.payload);
      state.loading = false;
      state.error = action.payload;
    });

    // addTask
    builder.addCase(addTask.pending, (state) => {
      console.log("⏳ addTask pending...");
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addTask.fulfilled, (state, action) => {
      console.log("✅ addTask fulfilled, yeni görev:", action.payload);
      state.loading = false;
      state.items.push(action.payload);
    });
    builder.addCase(addTask.rejected, (state, action) => {
      console.log("❌ addTask rejected:", action.payload);
      state.loading = false;
      state.error = action.payload;
    });

    // updateTask
    builder.addCase(updateTask.pending, (state) => {
      console.log("⏳ updateTask pending...");
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTask.fulfilled, (state, action) => {
      console.log("✅ updateTask fulfilled, güncellenen görev:", action.payload);
      state.loading = false;
      const index = state.items.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });
    builder.addCase(updateTask.rejected, (state, action) => {
      console.log("❌ updateTask rejected:", action.payload);
      state.loading = false;
      state.error = action.payload;
    });

    // updateTaskStatus
    builder.addCase(updateTaskStatus.pending, (state) => {
      console.log("⏳ updateTaskStatus pending...");
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTaskStatus.fulfilled, (state, action) => {
      console.log("✅ updateTaskStatus fulfilled, güncellenen görev:", action.payload);
      state.loading = false;
      const index = state.items.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });
    builder.addCase(updateTaskStatus.rejected, (state, action) => {
      console.log("❌ updateTaskStatus rejected:", action.payload);
      state.loading = false;
      state.error = action.payload;
    });

    // deleteTask
    builder.addCase(deleteTask.pending, (state) => {
      console.log("⏳ deleteTask pending...");
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      console.log("✅ deleteTask fulfilled, silinen ID:", action.payload);
      state.loading = false;
      state.items = state.items.filter((t) => t._id !== action.payload);
    });
    builder.addCase(deleteTask.rejected, (state, action) => {
      console.log("❌ deleteTask rejected:", action.payload);
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearError } = taskSlice.actions;
export default taskSlice.reducer;