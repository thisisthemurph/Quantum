import {z} from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

const formSchema = z.object({
  reference: z.string().min(1, "A reference must be provided"),
  groupKey: z.string().min(1, "A group key must be provided"),
  description: z.string().optional(),
});

export type CreateItemFormValues = z.infer<typeof formSchema>;

interface CreateItemFormProps {
  groups: string[] | null;
  onSubmit: (values: CreateItemFormValues) => Promise<void>;
}

export function CreateItemForm({groups, onSubmit}: CreateItemFormProps) {
  const form = useForm<CreateItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reference: "",
      groupKey: "",
      description: "",
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
            control={form.control}
            name="groupKey"
            render={({field}) => (
              <FormItem className="flex flex-col justify-between w-full">
                <FormLabel className="sm:pt-[0.35rem] pt-0">Group</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                        {field.value
                          ? groups?.find((group) => group === field.value)
                          : "Select a group"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search groups" />
                      <CommandList>
                        <CommandEmpty>No groups found.</CommandEmpty>
                        <CommandGroup>
                          {groups?.map((group) => (
                            <CommandItem value={group} key={group} onSelect={() => form.setValue("groupKey", group)}>
                              {group}

                              <Check
                                className={cn(
                                  "ml-auto",
                                  group === field.value
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

        <div className="w-full flex justify-end">
          <Button type="submit" size="sm" className="w-full sm:w-auto">
            Create item
          </Button>
        </div>
      </form>
    </Form>
  );
}
