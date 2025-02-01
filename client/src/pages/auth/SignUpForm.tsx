import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";

const formSchema = z.object({
  name: z.string().min(1, "Name must be provided"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).superRefine(({ password, confirmPassword }, ctx) => {
  if (password !== confirmPassword) {
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

export type SignUpFormValues = z.infer<typeof formSchema>;

interface SignUpFormProps {
  onSubmit: (values: SignUpFormValues) => void;
}

export function SignUpForm({onSubmit}: SignUpFormProps) {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4 w-full px-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="name"
          control={form.control}
          render={({field}) => (
            <FormItem>
              <FormLabel htmlFor={field.name} className="sr-only">Name</FormLabel>
              <FormControl>
                <Input className="md:text-2xl px-4 py-6 w-full" placeholder="What's your name" {...field} />
              </FormControl>
            </FormItem>
          )} />


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

        <FormField
          name="confirmPassword"
          control={form.control}
          render={({field}) => (
            <FormItem>
              <FormLabel htmlFor={field.password} className="sr-only">Confirm password</FormLabel>
              <FormControl>
                <Input className="md:text-2xl px-4 py-6 w-full" type="password" placeholder="confirm your password" {...field} />
              </FormControl>
            </FormItem>
          )} />

        <Button type="submit" size="lg" className="text-xl py-6">Sign up</Button>
      </form>
    </Form>
  )
}