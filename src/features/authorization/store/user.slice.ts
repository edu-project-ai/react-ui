import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { createUserService } from "../services/user.service";
import { serializeError } from "../utils/cognito-errors";
import type {
  User,
  SignUpRequest,
  SignInRequest,
  AuthResponse,
  UpdateUserRequest,
  SignUpResponse,
} from "../services/type";

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  theme: "light" | "dark";
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
};

export const signUp = createAsyncThunk<SignUpResponse, SignUpRequest>(
  "user/signUp",
  async (data, { signal, rejectWithValue }) => {
    try {
      const service = createUserService(signal);
      return await service.signUp(data);
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const autoSignIn = createAsyncThunk<AuthResponse>(
  "user/autoSignIn",
  async (_, { signal, rejectWithValue }) => {
    try {
      const service = createUserService(signal);
      return await service.autoSignIn();
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const confirmSignUp = createAsyncThunk<
  void,
  { email: string; code: string }
>(
  "user/confirmSignUp",
  async ({ email, code }, { signal, rejectWithValue }) => {
    try {
      const service = createUserService(signal);
      await service.confirmSignUp(email, code);
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const resendSignUpCode = createAsyncThunk<void, { email: string }>(
  "user/resendSignUpCode",
  async ({ email }, { signal, rejectWithValue }) => {
    try {
      const service = createUserService(signal);
      await service.resendSignUpCode(email);
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const signIn = createAsyncThunk<AuthResponse, SignInRequest>(
  "user/signIn",
  async (data, { signal, rejectWithValue }) => {
    try {
      const service = createUserService(signal);
      const response = await service.signIn(data);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const signOut = createAsyncThunk(
  "user/signOut",
  async (_, { signal, rejectWithValue }) => {
    try {
      const service = createUserService(signal);
      await service.signOut();
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const fetchUserProfile = createAsyncThunk<User>(
  "user/fetchProfile",
  async (_, { signal, rejectWithValue }) => {
    try {
      const service = createUserService(signal);

      // TODO: Enable when backend API is ready
      // return await service.getUserProfile();

      // For now, get user from Cognito
      const cognitoUser = await service.getCurrentCognitoUser();

      // Create user object from Cognito data
      const user: User = {
        id: cognitoUser.userId,
        email: cognitoUser.email,
        cognitoSub: cognitoUser.userId,
        firstName: "",
        lastName: "",
        displayName: cognitoUser.username,
        programmingLevel: "beginner",
        programmingTechnologies: [],
        accountStatus: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return user;
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

/**
 * Check if user has completed profile (backend)
 * Returns true if profile exists, false if 404 (no profile)
 */
export const checkUserProfileExists = createAsyncThunk<boolean>(
  "user/checkProfileExists",
  async (_, { signal }) => {
    try {
      const service = createUserService(signal);
      const profile = await service.getUserProfile();
      return !!profile; // true if profile exists, false if null
    } catch {
      // If backend endpoint not ready (404), assume no profile
      return false;
    }
  }
);

export const updateUserProfile = createAsyncThunk<User, UpdateUserRequest>(
  "user/updateProfile",
  async (data, { signal, rejectWithValue }) => {
    try {
      const service = createUserService(signal);
      return await service.updateProfile(data);
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      state.theme = newTheme;
      localStorage.setItem("theme", newTheme);
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign up
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Sign up failed";
      })

      // Confirm sign up
      .addCase(confirmSignUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmSignUp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(confirmSignUp.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Confirmation failed";
      })

      // Resend sign up code
      .addCase(resendSignUpCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendSignUpCode.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendSignUpCode.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to resend code";
      })

      // Sign in
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Sign in failed";
        state.isAuthenticated = false;
      })

      // Auto sign in (AWS Cognito)
      .addCase(autoSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(autoSignIn.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(autoSignIn.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Auto sign-in failed";
        state.isAuthenticated = false;
      })

      // Sign out
      .addCase(signOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Sign out failed";
      })

      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch profile";
        state.isAuthenticated = false;
      })

      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update profile";
      });
  },
});

export const { toggleTheme, setTheme, setCurrentUser, clearError } =
  userSlice.actions;

export default userSlice.reducer;
