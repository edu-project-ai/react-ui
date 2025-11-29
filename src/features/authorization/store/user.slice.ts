import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { authService } from "../services/auth.service";
import { serializeError } from "../utils/cognito-errors";
import type {
  User,
  SignUpRequest,
  SignInRequest,
  AuthResponse,
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
  async (data, { rejectWithValue }) => {
    try {
      return await authService.signUp(data);
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const autoSignIn = createAsyncThunk<AuthResponse>(
  "user/autoSignIn",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.autoSignIn();
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
  async ({ email, code }, { rejectWithValue }) => {
    try {
      await authService.confirmSignUp(email, code);
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const resendSignUpCode = createAsyncThunk<void, { email: string }>(
  "user/resendSignUpCode",
  async ({ email }, { rejectWithValue }) => {
    try {
      await authService.resendSignUpCode(email);
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const signIn = createAsyncThunk<AuthResponse, SignInRequest>(
  "user/signIn",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.signIn(data);
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const signOut = createAsyncThunk(
  "user/signOut",
  async (_, { rejectWithValue }) => {
    try {
      await authService.signOut();
    } catch (error: unknown) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const fetchUserProfile = createAsyncThunk<User>(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const cognitoUser = await authService.getCurrentCognitoUser();

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

      // Fetch profile (Cognito session restoration only)
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
      });
  },
});

export const { toggleTheme, setTheme, setCurrentUser, clearError } =
  userSlice.actions;

export default userSlice.reducer;
