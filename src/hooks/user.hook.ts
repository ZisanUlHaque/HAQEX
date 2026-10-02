import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, uploadProfileImage, UpdateProfilePayload } from "@/api";

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useUploadProfileImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadProfileImage(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
