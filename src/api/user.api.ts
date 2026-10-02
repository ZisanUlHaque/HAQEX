import apiClient from "@/lib/apiClient";

export type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  profileImage?: string;
};

export function updateProfile(payload: UpdateProfilePayload) {
  return apiClient("/user/me", {
    method: "PATCH",
    body: payload,
  });
}

export function uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append("profileImage", file);

  return apiClient("/user/profile-image", {
    method: "PATCH",
    body: formData,
  });
}