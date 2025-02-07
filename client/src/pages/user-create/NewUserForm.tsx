import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button} from "@/components/ui/button.tsx";
import {toast} from "sonner";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {TerminologySettings} from "@/data/models/settings.ts";
import {useSettings} from "@/hooks/use-settings.tsx";
import { UserRole } from "@/data/models/user";

const formSchema = z.object({
  name: z.string().min(1, "A name must be provided"),
  username: z.string().min(1, "A username must be provided"),
  admin: z.boolean().default(false).optional(),
  writer: z.boolean().default(false).optional(),
  reader: z.boolean().default(true).optional(),
  tracker: z.boolean().default(false).optional(),
});

export type NewUserFormValues = z.infer<typeof formSchema>;

type RoleField = {
  key: UserRole;
  label: string;
  description: (terminology: TerminologySettings) => string;
}

const roleFields: RoleField[] = [
  {
    key: "admin",
    label: "Admin",
    description: (terms) => `An administrator can manage users, ${terms.items.toLowerCase()}, and ${terms.locations.toLowerCase()} though they cannot track ${terms.items.toLowerCase()}.`,
  },
  {
    key: "tracker",
    label: "Tracker",
    description: (terms) => `A tracker can track ${terms.items.toLowerCase()} from one ${terms.location.toLowerCase()} to another.`,
  },
  {
    key: "writer",
    label: "Writer",
    description: (terms) => `A writer can create and update ${terms.items.toLowerCase()} and ${terms.locations.toLowerCase()}, but they cannot delete.`,
  },
  {
    key: "reader",
    label: "Reader",
    description: (terms) => `A reader is limited to viewing ${terms.items.toLowerCase()} and ${terms.locations.toLowerCase()} but cannot track or change anything.`,
  },
];

interface NewUserFormProps {
  onCreate: (data: NewUserFormValues) => void;
}

export function NewUserForm({ onCreate }: NewUserFormProps) {
  const { terminology } = useSettings();
  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      admin: false,
      writer: false,
      reader: true,
      tracker: false,
    },
  });

  function handleRoleSelectionChanged(role: UserRole, value: boolean) {
    const current = form.getValues();

    if (role === "admin" && value && (current.reader || current.writer)) {
      form.reset({ ...current, admin: true, writer: false, reader: false });
    }

    if (role === "tracker" && value && current.reader) {
      form.reset({ ...current, tracker: true, reader: false });
    }

    if (role === "writer" && value && current.reader) {
      form.reset({ ...current, reader: false });
    }

    if ((role === "writer" || role === "reader") && current.admin) {
      toast(`The admin role already satisfies the permissions of the ${role} role.`)
      form.reset({ ...current, [role]: false });
    }

    if (role === "reader" && value && (current.writer || current.tracker)) {
      const both = current.writer && current.tracker;
      const currentRoleValue = current.writer && current.tracker ? "tracker and writer" : current.writer ? "writer" : "tracker";
      toast(`The ${currentRoleValue} role${both ? "s" : ""} already ${both ? "satisfy" : "satisfies"} the permissions of the reader role.`)
      form.reset({ ...current, reader: false });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onCreate)}
        className="flex flex-col gap-4 max-w-lg"
      >
        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="What is the user's name?"  />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({field}) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} placeholder="A unique username for the user"  />
              </FormControl>
            </FormItem>
          )}
        />

        <section className="border border-sidebar-border px-2 py-4 rounded-lg">
          <p className="text-sm font-medium leading-none">User roles</p>
          <p className="text-sm text-muted-foreground">Select the roles that apply to this user.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {roleFields.map((role) => (
              <FormField
                control={form.control}
                name={role.key}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:shadow transition-all">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          handleRoleSelectionChanged(role.key, value as boolean);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{role.label}</FormLabel>
                      <FormDescription className="text-sm">{role.description(terminology)}</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </section>

        <Button type="submit">Create</Button>
      </form>
    </Form>
  )
}