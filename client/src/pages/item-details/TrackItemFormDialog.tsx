import { TrackableLocation } from "@/data/models/location";
import { z } from "zod";
import { useSettings } from "@/hooks/use-settings.tsx";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form.tsx";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button.tsx";
import {CommandDialogCombobox} from "@/components/CommandDialogCombobox.tsx";
import {User, Map} from "lucide-react";
import {ItemCurrentLocation} from "@/data/models/item.ts";

const formSchema = z.object({
  locationId: z.string().min(1, "A location must be selected"),
  isUser: z.boolean().optional(),
});

export type TrackItemFormValues = z.infer<typeof formSchema>;

interface TrackItemFormDialogProps {
  locations: TrackableLocation[];
  currentLocation: ItemCurrentLocation;
  onSearched: (value: string) => void;
  onSubmit: (values: { location: TrackableLocation }) => void;
}

export function TrackItemFormDialog({ locations, currentLocation, onSearched, onSubmit }: TrackItemFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { terminology } = useSettings();

  const form = useForm<TrackItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationId: "",
      isUser: false,
    },
  });

  return (
    <Form {...form}>
      <form>
        <FormField
          name="locationId"
          control={form.control}
          render={({field}) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormLabel className="sr-only sm:relative sm:w-auto sm:h-auto sm:m-0 text-muted-foreground">
                  Current {terminology.location.toLowerCase()}
                </FormLabel>
                <FormControl>
                  <Button type="button" variant="outline" onClick={() => setOpen(true)}>
                    {currentLocation.trackedToUser ? <User /> : <Map />}
                    {currentLocation.name}
                  </Button>
                </FormControl>
              </div>
              <CommandDialogCombobox
                open={open}
                onOpenChange={(isOpen) => {
                  if (!isOpen) onSearched("");
                  setOpen(isOpen);
                }}
                label={terminology.location}
                labelPlural={terminology.locations}
                items={locations}
                onSearch={onSearched}
                onItemSelected={(location) => {
                  form.setValue("locationId", location.id);
                  form.setValue("isUser", location.isUser);
                  setOpen(false);

                  form.handleSubmit(() => onSubmit({ location }))();
                }}
                fieldValue={field.value}
                itemValueResolver={(location) => location.id}
                rowDefinition={(location) => (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium tracking-wide">{location.name}</span>
                      {location.isUser && <span className="font-mono text-muted-foreground">{location.description}</span>}
                    </div>
                    {location.isUser ? <User/> : <Map />}
                  </div>
                )}
              />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}