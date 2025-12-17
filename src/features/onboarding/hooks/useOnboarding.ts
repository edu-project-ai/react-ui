import { useAppDispatch, useAppSelector } from "@/hooks";
import { toast } from "react-hot-toast";
import {
  useUploadProfilePhotoMutation,
  useCreateUserMutation,
} from "@/features/authorization/api";
import {
  setPhotoPreview as setPhotoPreviewAction,
  setSkillLevel as setSkillLevelAction,
  setTechnologies as setTechnologiesAction,
  clearOnboardingData,
} from "../store/onboarding.slice";
import type { SkillLevel, Technology } from "../constants";

/**
 * Hook for onboarding flow
 * Uses RTK Query for backend operations and Redux for UI state
 */
export const useOnboarding = () => {
  const dispatch = useAppDispatch();

  // RTK Query mutations
  const [uploadPhoto, { isLoading: isUploadingPhoto }] =
    useUploadProfilePhotoMutation();
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();

  // Redux state
  const photoPreview = useAppSelector(
    (state) => state.onboarding?.photoPreview
  );
  const skillLevel = useAppSelector((state) => state.onboarding?.skillLevel);
  const technologies = useAppSelector(
    (state) => state.onboarding?.technologies
  );
  const currentUserEmail = useAppSelector(
    (state) => state.user?.currentUser?.email
  );

  const setPhotoPreview = (preview: string | null) => {
    dispatch(setPhotoPreviewAction(preview));
  };

  const setSkillLevel = (level: SkillLevel) => {
    dispatch(setSkillLevelAction(level));
  };

  const setTechnologies = (techs: Technology[]) => {
    dispatch(setTechnologiesAction(techs));
  };

  const clearData = () => {
    dispatch(clearOnboardingData());
  };

  /**
   * Upload profile photo using RTK Query
   */
  const uploadProfilePhoto = async (file: File) => {
    try {
      const result = await uploadPhoto(file).unwrap();
      toast.success("Photo uploaded successfully!");
      return {
        success: true,
        photoPath: result.photoPath,
      };
    } catch (error) {
      const errorMessage = "Failed to upload photo";
      toast.error(errorMessage);
      console.error("Upload photo error:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  /**
   * Complete onboarding by creating user profile using RTK Query
   */
  const complete = async (data: {
    firstName: string;
    lastName: string;
    displayName: string;
    photoFile: File | null;
    programmingLevel: string;
    programmingTechnologies: string[];
  }) => {
    try {
      if (!currentUserEmail) {
        throw new Error("User email not found");
      }

      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("displayName", data.displayName);
      formData.append("email", currentUserEmail);
      formData.append("programmingLevel", data.programmingLevel);
      
      data.programmingTechnologies.forEach((tech) => {
        formData.append("programmingTechnologies", tech);
      });

      if (data.photoFile) {
        formData.append("photo", data.photoFile);
      }

      const profile = await createUser(formData).unwrap();

      toast.success("Profile created successfully!");
      dispatch(clearOnboardingData());
      return {
        success: true,
        profile,
      };
    } catch (error) {
      const errorMessage = "Failed to complete onboarding";
      toast.error(errorMessage);
      console.error("Complete onboarding error:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    photoPreview,
    skillLevel,
    technologies,
    loading: isUploadingPhoto || isCreatingUser,
    error: null, // Error handling now done via toast in mutations
    setPhotoPreview,
    setSkillLevel,
    setTechnologies,
    clearData,
    uploadPhoto: uploadProfilePhoto,
    complete,
  };
};
