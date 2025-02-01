import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button} from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Location } from "@/data/models/location";
import { useState } from "react";
import { CommandDialogCombobox } from "@/components/CommandDialogCombobox.tsx";
import {useSettings} from "@/hooks/use-settings.tsx";

const formSchema = z.object({
  identifier: z.string().min(1, "A barcode must be provided"),
  reference: z.string().min(1, "A reference must be provided"),
  groupKey: z.string().min(1, "A group key must be provided"),
  description: z.string().optional(),
  locationId: z.string().min(1, "A location must be selected"),
});

export type CreateItemFormValues = z.infer<typeof formSchema>;

interface CreateItemFormProps {
  groups: string[] | null;
  recentGroups: string[],
  locations: Location[];
  onGroupSearched: (value: string) => void;
  onLocationSearched: (value: string) => void;
  onSubmit: (values: CreateItemFormValues) => Promise<void>;
}

export function CreateItemForm({
  groups,
  recentGroups,
  locations,
  onGroupSearched,
  onLocationSearched,
  onSubmit,
}: CreateItemFormProps) {
  const [groupCommandDialogOpen, setGroupCommandDialogOpen] = useState(false);
  const [locationCommandDialogOpen, setLocationCommandDialogOpen] = useState(false);
  const { terminology } = useSettings();

  const form = useForm<CreateItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      reference: "",
      groupKey: "",
      description: "",
      locationId: "",
    },
  });

  function setBarcodeValue(reference: string, groupKey: string) {
    if (!reference.trim() || !groupKey.trim()) {
      form.setValue("identifier", "");
    } else {
      form.setValue("identifier", `${reference.trim()}-${groupKey.trim()}`);
    }
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <FormField
            control={form.control}
            name="reference"
            render={({field}) => (
              <FormItem className="md:col-span-2" onChange={() => setBarcodeValue(field.value, form.getValues().groupKey)}>
                <FormLabel>Reference</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={`A unique reference for your ${terminology.item.toLowerCase()}`}  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            name="groupKey"
            control={form.control}
            render={({field}) => (
              <FormItem className="">
                <FormLabel>{terminology.group}</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className={cn("min-w-48 w-full justify-start px-3", !field.value && "text-muted-foreground")}
                      onClick={() => setGroupCommandDialogOpen(!groupCommandDialogOpen)}
                    >
                      {field.value?.length > 0 ? field.value : "Select a group"}
                    </Button>
                  </div>
                </FormControl>
                <CommandDialogCombobox
                  open={groupCommandDialogOpen}
                  onOpenChange={(open) => {
                    if (!open) onGroupSearched("");
                    setGroupCommandDialogOpen(open);
                  }}
                  label={"Group"}
                  labelPlural={"Groups"}
                  items={groups ?? []}
                  pinnedItems={recentGroups}
                  onSearch={onGroupSearched}
                  onItemSelected={(groupKey) => {
                    form.setValue("groupKey", groupKey);
                    setBarcodeValue(form.getValues().reference, groupKey);
                    setGroupCommandDialogOpen(false);
                  }}
                  onItemCreated={(groupKey) => {
                    form.setValue("groupKey", groupKey);
                    setGroupCommandDialogOpen(false);
                  }}
                  fieldValue={field.value}
                  itemValueResolver={(groupKey) => groupKey}
                  rowDefinition={(groupKey) => <span>{groupKey}</span>}
                />
              </FormItem>
            )}
          />

          <FormField name="identifier" control={form.control}
            render={({field}) => (
              <FormItem className="sm:col-span-2 md:col-span-1">
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <Input {...field}
                    placeholder={`A barcode for the ${terminology.item.toLowerCase()}`}
                    disabled={true}
                    className="font-mono" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({field}) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder={`A short description for the ${terminology.item.toLowerCase()}`} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="locationId"
          control={form.control}
          render={({field}) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={cn("min-w-48 w-full justify-start px-3", !field.value && "text-muted-foreground")}
                    onClick={() => setLocationCommandDialogOpen(!locationCommandDialogOpen)}
                  >
                    {field.value?.length > 0
                      ? locations.find((location) => location.id === field.value)?.name
                      : `Select a ${terminology.location.toLowerCase()}`}
                  </Button>
                </div>
              </FormControl>
              <CommandDialogCombobox
                open={locationCommandDialogOpen}
                onOpenChange={(open) => {
                  if (!open) onLocationSearched("");
                  setLocationCommandDialogOpen(open);
                }}
                label={terminology.location}
                labelPlural={terminology.locations}
                items={locations}
                onSearch={onLocationSearched}
                onItemSelected={(location) => {
                  form.setValue("locationId", location.id);
                  setLocationCommandDialogOpen(false);
                }}
                fieldValue={field.value}
                itemValueResolver={(location) => location.id}
                rowDefinition={(location) => <span>{location.name}</span>}
              />
            </FormItem>
          )}
        />

        <div className="w-full flex justify-end">
          <Button type="submit" size="sm" className="w-full sm:w-auto">
            Create {terminology.item.toLowerCase()}
          </Button>
        </div>
      </form>
    </Form>
  );
}
