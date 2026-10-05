import { forgotPassword, getMe, googleOAuth, resetPassword, userLogin, userLogout, userRegistration, verifyAccount } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userLogin,
    onSuccess: () =>
      queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: getMe,
        staleTime: 0,
      }),
  });
}
export function useRegistration() {
  return useMutation({
    mutationFn: userRegistration,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userLogout,
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.setQueryData(["user"], null);
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "user",
      });
    },
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getMe,
    retry: false,
  });
}

export function useGoogleOAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: googleOAuth,
    onSuccess: () =>
      queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: getMe,
        staleTime: 0,
      }),
  });
}

export function useVerifyAccount() {
  return useMutation({
    mutationFn: verifyAccount,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}