import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// Async thunks
export const fetchStudents = createAsyncThunk(
  "students/fetchStudents",
  async () => {
    const response = await axios.get(`${API_URL}/students`);
    return response.data;
  }
);

export const addStudent = createAsyncThunk(
  "students/addStudent",
  async (studentData) => {
    const response = await axios.post(`${API_URL}/students`, studentData);
    return response.data;
  }
);

export const updateStudent = createAsyncThunk(
  "students/updateStudent",
  async ({ id, data }) => {
    const response = await axios.put(`${API_URL}/students/${id}`, data);
    return response.data;
  }
);

export const deleteStudent = createAsyncThunk(
  "students/deleteStudent",
  async (id) => {
    await axios.delete(`${API_URL}/students/${id}`);
    return id;
  }
);

export const parseBarcodeData = createAsyncThunk(
  "students/parseBarcodeData",
  async (barcodeText) => {
    const response = await axios.post(`${API_URL}/parse-barcode`, {
      barcode_text: barcodeText,
    });
    return response.data;
  }
);

export const scanLicenseImage = createAsyncThunk(
  "students/scanLicenseImage",
  async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${API_URL}/scan-license`, formData);
    return response.data.student_data;
  }
);

// Slice
const studentsSlice = createSlice({
  name: "students",
  initialState: {
    students: [],
    loading: false,
    error: null,
    scanLoading: false,
    scannedData: null,
    filterText: "",
  },
  reducers: {
    clearScannedData: (state) => {
      state.scannedData = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilterText: (state, action) => {
      state.filterText = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch students
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add student
      .addCase(addStudent.fulfilled, (state, action) => {
        state.students.push(action.payload);
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.error = action.error.message;
      })
      // Update student
      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      // Delete student
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter((s) => s.id !== action.payload);
      })
      // Parse barcode
      .addCase(parseBarcodeData.pending, (state) => {
        state.scanLoading = true;
      })
      .addCase(parseBarcodeData.fulfilled, (state, action) => {
        state.scanLoading = false;
        state.scannedData = action.payload;
      })
      .addCase(parseBarcodeData.rejected, (state, action) => {
        state.scanLoading = false;
        state.error = action.error.message;
      })
      // Scan license image
      .addCase(scanLicenseImage.pending, (state) => {
        state.scanLoading = true;
      })
      .addCase(scanLicenseImage.fulfilled, (state, action) => {
        state.scanLoading = false;
        state.scannedData = action.payload;
      })
      .addCase(scanLicenseImage.rejected, (state, action) => {
        state.scanLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearScannedData, clearError, setFilterText } =
  studentsSlice.actions;
export default studentsSlice.reducer;
