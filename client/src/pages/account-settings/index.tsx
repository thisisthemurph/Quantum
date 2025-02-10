import { Page } from "@/components/Page.tsx";
import {UpdatePasswordForm} from "@/pages/account-settings/UpdatePasswordForm.tsx";
import {toast} from "sonner";
import {useMutation} from "@tanstack/react-query";
import {useApi} from "@/hooks/use-api.ts";
import {useUser} from "@/hooks/use-user.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccountSettingsPage() {
  const api = useApi();
  const user = useUser();

  const updatePasswordMutation = useMutation({
    mutationFn: async (values: {currentPassword: string; newPassword: string;}) => {
      const response = await api<void>(`/auth/user/${user.id}/password`, {
        method: "PUT",
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(response.error || "There has been an issue updating your password");
      }
    },
    onSuccess: () => {
      toast.success("Password updated", {
        description: () => "Your password has been updated successfully"
      });
    },
    onError: (error) => {
      toast.error("Could not update password", {
        description: () => error.message,
      })
    }
  })

  async function handlePasswordUpdate(values: {newPassword: string; currentPassword: string}) {
    try {
      await updatePasswordMutation.mutateAsync(values);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  return (
    <Page title="Account settings">
      <section className="mb-6">
        <p>Keep your personal information up-to-date by updating your account settings.</p>
      </section>

      <Card className="max-w-96">
        <CardHeader>
          <CardTitle>Update your password</CardTitle>
          <CardDescription>Update your password using this form</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdatePasswordForm onSubmit={handlePasswordUpdate} />
        </CardContent>
      </Card>
    </Page>
  )
}