import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button} from "@/components/ui/button.tsx";import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {useEffect} from "react";
import {User} from "@/data/models/user.ts";
import {cn} from "@/lib/utils.ts";

const formSchema = z.object({
  name: z.string().min(1, "A name must be provided"),
  username: z.string().min(1, "A username must be provided"),
});

type FormValues = z.infer<typeof formSchema>;

export function UserForm({user, className}: {user: User, className?: string}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
    },
  });

  useEffect(() => {
    form.reset({
      name: user.name,
      username: user.username,
    })
  }, [user, form]);

  return (
    <Form {...form}>
      <form className={cn("flex flex-col gap-6", className)}>
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">Update details</Button>
      </form>
    </Form>
  );
}