import { Location } from "@/data/models/location";
import { z } from "zod";
import { useSettings } from "@/hooks/use-settings.tsx";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form.tsx";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button.tsx";
import {CommandDialogCombobox} from "@/components/CommandDialogCombobox.tsx";

const formSchema = z.object({
  locationId: z.string().min(1, "A location must be selected"),
});

export type TrackItemFormValues = z.infer<typeof formSchema>;

interface TrackItemFormDialogProps {
  locations: Location[];
  currentLocationName: string;
  onSearched: (value: string) => void;
  onSubmit: (values: TrackItemFormValues) => void;
}

export function TrackItemFormDialog({ locations, currentLocationName, onSearched, onSubmit }: TrackItemFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { terminology } = useSettings();

  const form = useForm<TrackItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationId: "",
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
                    {currentLocationName.length > 0 ? currentLocationName : `Select a ${terminology.location}`}
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
                  setOpen(false);
                  form.handleSubmit((locationId) => onSubmit(locationId))();
                }}
                fieldValue={field.value}
                itemValueResolver={(location) => location.id}
                rowDefinition={(location) => <span>{location.name}</span>}
              />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}