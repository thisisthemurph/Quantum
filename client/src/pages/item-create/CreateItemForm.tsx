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

const formSchema = z.object({
  reference: z.string().min(1, "A reference must be provided"),
  groupKey: z.string().min(1, "A group key must be provided"),
  description: z.string().optional(),
  locationId: z.string().min(1, "A location must be selected"),
});

export type CreateItemFormValues = z.infer<typeof formSchema>;

interface CreateItemFormProps {
  groups: string[] | null;
  mruGroups: string[],
  locations: Location[];
  onGroupSearched: (value: string) => void;
  onSubmit: (values: CreateItemFormValues) => Promise<void>;
}

export function CreateItemForm({groups, mruGroups, locations, onGroupSearched, onSubmit}: CreateItemFormProps) {
  const [groupCommandDialogOpen, setGroupCommandDialogOpen] = useState(false);
  const [locationCommandDialogOpen, setLocationCommandDialogOpen] = useState(false);

  const form = useForm<CreateItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reference: "",
      groupKey: "",
      description: "",
      locationId: "",
    },
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={form.control}
            name="reference"
            render={({field}) => (
              <FormItem className="w-full">
                <FormLabel>Reference</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="A unique reference for your item"/>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            name="groupKey"
            control={form.control}
            render={({field}) => (
              <FormItem>
                <FormLabel>Group</FormLabel>
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
                  pinnedItems={mruGroups}
                  onSearch={onGroupSearched}
                  onItemSelected={(groupKey) => {
                    form.setValue("groupKey", groupKey);
                    setGroupCommandDialogOpen(false);
                  }}
                  onItemCreated={(groupKey) => {
                    form.setValue("groupKey", groupKey);
                    setGroupCommandDialogOpen(false);
                  }}
                  fieldValue={field.value}
                  itemValueResolver={(groupKey) => groupKey}
                  rowDefinition={(group) => <span>{group}</span>}
                />
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
                <Input {...field} placeholder="A short description for the item"/>
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
                      : "Select a location"}
                  </Button>
                </div>
              </FormControl>
              <CommandDialogCombobox
                open={locationCommandDialogOpen}
                onOpenChange={setLocationCommandDialogOpen}
                fieldValue={field.value}
                itemValueResolver={(location) => location.id}
                label={"Location"}
                labelPlural={"Locations"}
                items={locations}
                onSearch={console.log}
                onItemSelected={(location) => {
                  form.setValue("locationId", location.id);
                  setLocationCommandDialogOpen(false);
                }}
                rowDefinition={(location) => <span>{location.name}</span>}
              />
            </FormItem>
          )}
        />

        <div className="w-full flex justify-end">
          <Button type="submit" size="sm" className="w-full sm:w-auto">
            Create item
          </Button>
        </div>
      </form>
    </Form>
  );
}
