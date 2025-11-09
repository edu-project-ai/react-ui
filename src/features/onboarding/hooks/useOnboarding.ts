import { useAppDispatch, useAppSelector } from "@/hooks";
import { toast } from "react-hot-toast";
import {
  setPhotoPreview as setPhotoPreviewAction,
  setSkillLevel as setSkillLevelAction,
  setTechnologies as setTechnologiesAction,
  clearOnboardingData,
  clearError,
  uploadProfilePhoto,
  completeOnboarding,
} from "../store/onboarding.slice";
import type { SkillLevel, Technology } from "../constants";

export const useOnboarding = () => {
  const dispatch = useAppDispatch();

  const photoPreview = useAppSelector(
    (state) => state.onboarding?.photoPreview
  );
  const skillLevel = useAppSelector((state) => state.onboarding?.skillLevel);
  const technologies = useAppSelector(
    (state) => state.onboarding?.technologies
  );
  const loading = useAppSelector((state) => state.onboarding?.loading);
  const error = useAppSelector((state) => state.onboarding?.error);

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

  const clearErrorMessage = () => {
    dispatch(clearError());
  };

  const uploadPhoto = async (file: File) => {
    const result = await dispatch(uploadProfilePhoto(file));

    if (result.meta.requestStatus === "fulfilled") {
      return {
        success: true,
        photoPath: result.payload as string,
      };
    }

    const errorMessage = (result.payload as string) || "Failed to upload photo";
    toast.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  };

  const complete = async (data: {
    firstName: string;
    lastName: string;
    displayName: string;
    photoPath: string | null;
    programmingLevel: string;
    programmingTechnologies: string[];
  }) => {
    const result = await dispatch(completeOnboarding(data));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Profile created successfully!");
      return {
        success: true,
        profile: result.payload,
      };
    }

    const errorMessage =
      (result.payload as string) || "Failed to complete onboarding";
    toast.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  };

  return {
    photoPreview,
    skillLevel,
    technologies,
    loading,
    error,
    setPhotoPreview,
    setSkillLevel,
    setTechnologies,
    clearData,
    clearError: clearErrorMessage,
    uploadPhoto,
    complete,
  };
};
