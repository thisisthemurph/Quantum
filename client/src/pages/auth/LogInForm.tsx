import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LogInFormValues = z.infer<typeof formSchema>;

interface LogInFormProps {
  onSubmit: (values: LogInFormValues) => void;
}

export function LogInForm({onSubmit}: LogInFormProps) {
  const form = useForm<LogInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4 w-full px-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="email"
          control={form.control}
          render={({field}) => (
            <FormItem>
              <FormLabel htmlFor={field.email} className="sr-only">Email</FormLabel>
              <FormControl>
                <Input className="md:text-2xl px-4 py-6 w-full" type="email" placeholder="you@yourdomain.com" {...field} />
              </FormControl>
            </FormItem>
          )} />


        <FormField
          name="password"
          control={form.control}
          render={({field}) => (
            <FormItem>
              <FormLabel htmlFor={field.password} className="sr-only">Password</FormLabel>
              <FormControl>
                <Input className="md:text-2xl px-4 py-6 w-full" type="password" placeholder="password" {...field} />
              </FormControl>
            </FormItem>
          )} />

        <Button type="submit" size="lg" className="text-xl py-6">Sign in</Button>
      </form>
    </Form>
  )
}