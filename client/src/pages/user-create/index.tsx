import {Page} from "@/components/Page.tsx";
import {UserForm, UserFormResponse} from "@/components/UserForm.tsx";
import {toast} from "sonner";
import {useApi} from "@/hooks/use-api.ts";
import {User} from "@/data/models/user.ts";
import {useNavigate} from "react-router";

export default function CreateUserPage() {
  const api = useApi();
  const navigate = useNavigate();

  async function handleCreateNewUser(data: UserFormResponse) {
    const response = await api<User>("/user", {
      method: "POST",
      body: JSON.stringify(data),
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
      <UserForm submitText="Create user" onSubmit={handleCreateNewUser} />
    </Page>
  )
}
