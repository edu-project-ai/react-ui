import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { createUserService } from "@/features/authorization/services";
import { serializeError } from "@/features/authorization/utils/cognito-errors";
import type { SkillLevel, Technology } from "../constants";
import type { User } from "@/features/authorization/services/type";

interface OnboardingState {
  photoPreview: string | null;
  skillLevel: SkillLevel | null;
  technologies: Technology[];
  loading: boolean;
  error: string | null;
}

const initialState: OnboardingState = {
  photoPreview: null,
  skillLevel: null,
  technologies: [],
  loading: false,
  error: null,
};

export const uploadProfilePhoto = createAsyncThunk<string, File>(
  "onboarding/uploadPhoto",
  async (file, { signal, rejectWithValue }) => {
    try {
      const service = createUserService(signal);
      const photoPath = await service.uploadProfilePhoto(file);
      return photoPath;
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const completeOnboarding = createAsyncThunk<
  User,
  {
    firstName: string;
    lastName: string;
    displayName: string;
    photoPath: string | null;
    programmingLevel: string;
    programmingTechnologies: string[];
  }
>(
  "onboarding/complete",
  async (data, { signal, rejectWithValue, getState }) => {
    try {
      const service = createUserService(signal);

      // Get current user email from Redux
      const state = getState() as {
        user: { currentUser: { email: string } | null };
      };
      const email = state.user.currentUser?.email;

      if (!email) {
        throw new Error("User email not found");
      }

      const profile = await service.createUserProfile({
        ...data,
        email,
      });

      return profile;
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

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
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadProfilePhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePhoto.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadProfilePhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to upload photo";
      })

      .addCase(completeOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeOnboarding.fulfilled, (state) => {
        state.loading = false;
        state.photoPreview = null;
        state.skillLevel = null;
        state.technologies = [];
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to complete onboarding";
      });
  },
});

export const {
  setPhotoPreview,
  setSkillLevel,
  setTechnologies,
  clearOnboardingData,
  clearError,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
