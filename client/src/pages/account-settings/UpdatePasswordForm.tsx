import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button} from "@/components/ui/button.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator.tsx";

const formSchema = z.object({
  currentPassword: z.string().min(1, "Please enter your current password"),
  newPassword: z.string().min(8, "Your password must be at least 8 characters long"),
});

export type UpdatePasswordFormValues = z.infer<typeof formSchema>;

interface UpdatePasswordFormProps {
  onSubmit: (values: UpdatePasswordFormValues) => Promise<void>;
}

export function UpdatePasswordForm({ onSubmit }: UpdatePasswordFormProps) {
  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const newPassword = form.watch("newPassword");

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          onSubmit(values).then(() => form.reset({
            currentPassword: "",
            newPassword: "",
          }));
        })}
      >
        <FormField
          name="currentPassword"
          control={form.control}
          render={({field}) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Your current password" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="newPassword"
          control={form.control}
          render={({field}) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <PasswordStrengthIndicator password={newPassword}>
                  <Input type="password" placeholder="Your new password" {...field} />
                </PasswordStrengthIndicator>
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={!form.formState.isDirty || !form.formState.isValid}>Update</Button>
      </form>
    </Form>
  )
}
