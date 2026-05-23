import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/client";

export const fetchMe = createAsyncThunk("user/fetchMe", async () => {
  const res = await api.get("/api/me");
  return res.data;
});

const userSlice = createSlice({
  name: "user",
  initialState: { data: null, status: "idle", loggedIn: false },
  reducers: {
    login(state) {
      state.loggedIn = true;
    },
    logout(state) {
      state.loggedIn = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = "ready";
        state.data = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = "error";
      });
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
