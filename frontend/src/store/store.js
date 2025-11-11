import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from './slices/studentSlice';

export const store = configureStore({
  reducer: {
    students: studentsReducer,
  },
});