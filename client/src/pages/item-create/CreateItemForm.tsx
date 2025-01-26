import {z} from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Location} from "@/data/models/location";
import {useState} from "react";

const formSchema = z.object({
  reference: z.string().min(1, "A reference must be provided"),
  groupKey: z.string().min(1, "A group key must be provided"),
  description: z.string().optional(),
  locationId: z.string().min(1, "A location must be selected"),
});

export type CreateItemFormValues = z.infer<typeof formSchema>;

interface CreateItemFormProps {
  groups: string[] | null;
  locations: Location[];
  onGroupSearched: (value: string) => void;
  onSubmit: (values: CreateItemFormValues) => Promise<void>;
}

export function CreateItemForm({ groups, locations, onGroupSearched, onSubmit }: CreateItemFormProps) {
  const [groupIsOpen, setGroupIsOpen] = useState(false);
  const [groupInputValue, setGroupInputValue] = useState("");

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
                  <Input {...field} placeholder="A unique reference for your item" />
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
                      onClick={() => setGroupIsOpen(!groupIsOpen)}
                    >
                      {field.value?.length > 0  ? field.value : "Select a group"}
                    </Button>
                  </div>
                </FormControl>
                <CommandDialog open={groupIsOpen} onOpenChange={setGroupIsOpen}>
                  <CommandInput placeholder="Search groups" onValueChange={(value) => {
                    setGroupInputValue(value);
                    onGroupSearched(value);
                  }} />
                  <CommandList>
                    <CommandEmpty>
                      <p className="px-4 pb-4 text-muted-foreground text-left">
                        Group <span className="font-semibold underline underline-offset-2">{groupInputValue}</span> does not exist, would you like to create it?
                      </p>
                      <section className="flex items-center gap-2 px-4">
                        <Input placeholder="Create a new group" disabled={true} value={groupInputValue} />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            form.setValue("groupKey", groupInputValue);
                            setGroupIsOpen(false);
                          }}
                        >
                          Create
                        </Button>
                      </section>
                    </CommandEmpty>
                    <CommandGroup>
                      {groups?.map((group) => (
                        <CommandItem
                          value={group}
                          key={group}
                          onSelect={() => {
                            form.setValue("groupKey", group);
                            setGroupIsOpen(false);
                          }}
                        >
                          {group}
                          <Check className={cn("ml-auto", group === field.value ? "opacity-100" : "opacity-0")} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </CommandDialog>
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
                <Input {...field} placeholder="A short description for the item" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationId"
          render={({field}) => (
            <FormItem className="flex flex-col justify-between w-full">
              <FormLabel className="sm:pt-[0.35rem] pt-0">Location</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                      {field.value
                        ? locations?.find((location) => location.id === field.value)?.name
                        : "Select a location"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search groups" />
                    <CommandList>
                      <CommandEmpty>No locations found.</CommandEmpty>
                      <CommandGroup>
                        {locations?.map((location) => (
                          <CommandItem value={location.id} key={location.id} onSelect={() => form.setValue("locationId", location.id)}>
                            {location.name}

                            <Check
                              className={cn(
                                "ml-auto",
                                location.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
