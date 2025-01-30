import { z } from "zod";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useSettings } from "@/hooks/use-settings.tsx";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "A name must be provided"),
  description: z.string().optional(),
});

export type CreateLocationFormValues = z.infer<typeof formSchema>;

interface CreateLocationFormProps {
  onSubmit: (values: CreateLocationFormValues) => void;
}

export function CreateLocationForm({ onSubmit }: CreateLocationFormProps) {
  const { terminology } = useSettings();

  const form = useForm<CreateLocationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function handleErrors(errors: FieldErrors<CreateLocationFormValues>) {
    toast.error(errors.name ? errors.name.message : "Please fix the errors in the form");
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit, handleErrors)}
      >
        <section>
          <h2 className="text-xl font-semibold mb-1">Create a new {terminology.location}</h2>
          <p className="text-lg text-slate-600">Create a new {terminology.location.toLowerCase()} to track {terminology.items.toLowerCase()} to</p>
        </section>

        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="A unique name for your location" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({field}) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A short description about the location" className="resize-none" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="w-full flex justify-end">
          <Button type="submit">Create location</Button>
        </div>
      </form>
    </Form>
  );
}