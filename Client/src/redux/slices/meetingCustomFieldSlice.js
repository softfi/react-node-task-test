import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApi } from "../../services/api";

export const fetchMeetingCustomFiled = createAsyncThunk(
  "meetingCustomField",
  async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const response = await getApi(`api/custom-field/?moduleName=Meeting`);
      return response;
    } catch (error) {
      throw error;
    }
  }
);

const meetingCustomFieldSlice = createSlice({
  name: "meetingCustomFieldData",
  initialState: {
    data: [],
    isLoading: false,
    error: "",
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeetingCustomFiled.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMeetingCustomFiled.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = "";
      })
      .addCase(fetchMeetingCustomFiled.rejected, (state, action) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.error.message;
      });
  },
});

export default meetingCustomFieldSlice.reducer;
