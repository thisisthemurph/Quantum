import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button";
import {DefaultSettings, TerminologySettings} from "@/data/models/settings.ts";
import {useEffect} from "react";

const formSchema = z.object({
  item: z.string(),
  items: z.string(),
  location: z.string(),
  locations: z.string(),
});

export type TerminologyFormValues = z.infer<typeof formSchema>;

interface TerminologyTabProps {
  terminology: TerminologySettings;
  onUpdate: (values: TerminologyFormValues) => void;
}

function emptyStringIfDefault(key: keyof TerminologySettings, value: string) {
  return value === DefaultSettings.terminology[key] ? "" : value;
}

function defaultIfEmptyString(key: keyof TerminologySettings, value: string) {
  return value === "" ? DefaultSettings.terminology[key] : value;
}

export function TerminologyTab({ terminology, onUpdate }: TerminologyTabProps) {
  const form = useForm<TerminologyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item: "",
      items: "",
      location: "",
      locations: "",
    },
  });

  useEffect(() => {
    form.reset({
      item: emptyStringIfDefault("item", terminology.item),
      items: emptyStringIfDefault("items", terminology.items),
      location: emptyStringIfDefault("location", terminology.location),
      locations: emptyStringIfDefault("locations", terminology.locations),
    });
  }, [terminology, form]);

  function handleSubmit(values: TerminologyFormValues) {
    onUpdate({
      item: defaultIfEmptyString("item", values.item ?? ""),
      items: defaultIfEmptyString("items", values.items ?? ""),
      location: defaultIfEmptyString("location", values.location ?? ""),
      locations: defaultIfEmptyString("locations", values.locations ?? ""),
    });
  }

  return (
    <>
      <h1 className="my-4 text-xl">Terminology settings</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <p className="text-sm text-muted-foreground">An item is an object that can be tracked from one location to another.</p>
          <div className="flex flex-col sm:flex-row gap-4 py-4">
            <FormField
              control={form.control}
              name="item"
              render={({field}) => (
                <FormItem className="w-full">
                  <FormLabel>Item singular</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Item" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="items"
              render={({field}) => (
                <FormItem className="w-full">
                  <FormLabel>Item plural</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Items" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <p className="text-sm text-muted-foreground">An location is the place an item is tracked to and from.</p>
          <div className="flex flex-col sm:flex-row gap-4 py-4">
            <FormField
              control={form.control}
              name="location"
              render={({field}) => (
                <FormItem className="w-full">
                  <FormLabel>Location singular</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Location" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="locations"
              render={({field}) => (
                <FormItem className="w-full">
                  <FormLabel>Location plural</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Locations" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full sm:w-auto" disabled={!form.formState.isDirty}>Save</Button>
        </form>
      </Form>
    </>
  );
}