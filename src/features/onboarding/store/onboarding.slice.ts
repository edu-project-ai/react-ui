import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SkillLevel, Technology } from "../constants";

/**
 * Onboarding Slice - UI State Management
 * 
 * This slice only manages UI state for the onboarding flow.
 * For backend operations, use RTK Query hooks from userApi:
 * - useUploadProfilePhotoMutation
 * - useCreateUserMutation
 */

interface OnboardingState {
  photoPreview: string | null;
  skillLevel: SkillLevel | null;
  technologies: Technology[];
}

const initialState: OnboardingState = {
  photoPreview: null,
  skillLevel: null,
  technologies: [],
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setPhotoPreview: (state, action: PayloadAction<string | null>) => {
      state.photoPreview = action.payload;
    },
    setSkillLevel: (state, action: PayloadAction<SkillLevel>) => {
      state.skillLevel = action.payload;
    },
    setTechnologies: (state, action: PayloadAction<Technology[]>) => {
      state.technologies = action.payload;
    },
    clearOnboardingData: (state) => {
      state.photoPreview = null;
      state.skillLevel = null;
      state.technologies = [];
    },
  },
});

export const {
  setPhotoPreview,
  setSkillLevel,
  setTechnologies,
  clearOnboardingData,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
