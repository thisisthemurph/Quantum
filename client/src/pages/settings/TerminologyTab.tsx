import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form.tsx";
import {z} from "zod";
import {useForm, UseFormReturn} from "react-hook-form";
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
  group: z.string(),
  groups: z.string(),
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
      group: "",
      groups: "",
    },
  });

  useEffect(() => {
    form.reset({
      item: emptyStringIfDefault("item", terminology.item),
      items: emptyStringIfDefault("items", terminology.items),
      location: emptyStringIfDefault("location", terminology.location),
      locations: emptyStringIfDefault("locations", terminology.locations),
      group: emptyStringIfDefault("group", terminology.group),
      groups: emptyStringIfDefault("groups", terminology.groups),
    });
  }, [terminology, form]);

  function handleSubmit(values: TerminologyFormValues) {
    onUpdate({
      item: defaultIfEmptyString("item", values.item ?? ""),
      items: defaultIfEmptyString("items", values.items ?? ""),
      location: defaultIfEmptyString("location", values.location ?? ""),
      locations: defaultIfEmptyString("locations", values.locations ?? ""),
      group: defaultIfEmptyString("group", values.group ?? ""),
      groups: defaultIfEmptyString("groups", values.groups ?? ""),
    });
  }

  return (
    <>
      <h1 className="my-4 text-xl">Terminology settings</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <TerminologyFormSection form={form} name={"item"} name2={"items"} text="An item is an object that can be track from one location to another." />
          <TerminologyFormSection form={form} name={"location"} name2={"locations"} text="A location is a place that items can be traced to." />
          <TerminologyFormSection form={form} name={"group"} name2={"groups"} text="An group is a handy way to group items together You can use this to see where all similar items are." />

          <Button type="submit" className="w-full sm:w-auto" disabled={!form.formState.isDirty}>Save</Button>
        </form>
      </Form>
    </>
  );
}

interface TerminologyFormSectionProps {
  form: UseFormReturn<TerminologyFormValues>;
  name: keyof TerminologyFormValues;
  name2: keyof TerminologyFormValues;
  text: string;
}

function TerminologyFormSection({form, name, name2, text}: TerminologyFormSectionProps) {
  function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  return (
    <>
      <p>{capitalizeFirstLetter(name)}</p>
      <p className="text-sm text-muted-foreground">{text}</p>
      <div className="flex flex-col sm:flex-row gap-4 py-4">
        <FormField
          control={form.control}
          name={name}
          render={({field}) => (
            <FormItem className="w-full">
              <FormLabel>{capitalizeFirstLetter(name)} singular</FormLabel>
              <FormControl>
                <Input {...field} placeholder={capitalizeFirstLetter(name)} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={name2}
          render={({field}) => (
            <FormItem className="w-full">
              <FormLabel>{capitalizeFirstLetter(name2)} plural</FormLabel>
              <FormControl>
                <Input {...field} placeholder={capitalizeFirstLetter(name2)} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </>
  )
}