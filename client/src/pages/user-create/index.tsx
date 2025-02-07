import {Page} from "@/components/Page.tsx";
import {NewUserForm, NewUserFormValues} from "@/pages/user-create/NewUserForm.tsx";
import {toast} from "sonner";
import {useApi} from "@/hooks/use-api.ts";
import {User} from "@/data/models/user.ts";
import {useNavigate} from "react-router";

export default function CreateUserPage() {
  const api = useApi();
  const navigate = useNavigate();

  async function handleCreateNewUser(data: NewUserFormValues) {
    const body = {
      name: data.name,
      username: data.username,
      roles: Object.entries(data)
        .filter(([key, value]) => value && key !== "name" && key !== "username")
        .map(([key]) => key),
    }

    const response = await api<User>("/user", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      toast.error("Failed to create user", {
        description: response.error ?? null,
      });
      return
    }

    toast.success("User has been created", {
      description: <>User <span className="font-medium">{response.data.username}</span> has been created</>,
      action: {
        label: "View user",
        onClick: () => {
          navigate(`/user/${response.data.id}`);
        },
      }
    });
  }

  return (
    <Page title="Create new user" >
      <NewUserForm onCreate={handleCreateNewUser} />
    </Page>
  )
}
