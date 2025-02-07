import {Page} from "@/components/Page.tsx";
import {useMutation, useQuery} from "@tanstack/react-query";
import {useApi} from "@/hooks/use-api.ts";
import {useParams} from "react-router";
import {User} from "@/data/models/user.ts";
import {UserForm, UserFormResponse} from "@/components/UserForm.tsx";
import { toast } from "sonner";


export default function ManageUserPage() {
  const api = useApi();
  const { userId } = useParams();

  const {data: user} = useQuery({
    queryKey: ["user", userId],
    queryFn: () => api<User>(`/user/${userId}`).then(response => response.data),
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormResponse) => {
      const response = await api<User>(`/user/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });

      if (response.ok) {
        return response.data;
      }

      throw new Error(response.error ?? "Failed to update user");
    },
    onSuccess: (data) =>
      toast.success("User updated", {
        description: `The user ${data.username} has been successfully updated`
      }),
    onError: (error) => toast.error("Failed to update user", { description: error.message }),
  })

  return (
    <Page title={"Manage user"}>
      {user && (
        <>
          <h1 className="text-4xl font-semibold tracking-wide">{user.name}</h1>
          <UserForm submitText="Update user" onSubmit={v => updateUserMutation.mutate(v)} />
        </>
      )}
    </Page>
  )
}