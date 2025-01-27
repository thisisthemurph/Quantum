import { JSX, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Check, Pin } from "lucide-react";
import { cn } from "@/lib/utils.ts";

interface CommandDialogComboboxProps<TItem> {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  label: string;
  labelPlural: string;
  items: TItem[];
  // Items to be pinned to the top of the combobox
  pinnedItems?: TItem[];

  // Action to be taken when the search value changes.
  onSearch: (value: string) => void;
  // Action to be taken when an item is selected from the available items.
  onItemSelected: (value: TItem) => void;
  // Action to be taken when a new item is created, if not provided the option to create an item is not presented.
  onItemCreated?: (value: string) => void;

  // The value of the field that the combobox is controlling.
  fieldValue: string;
  // Function to extract the value of the item that is used to compare with the fieldValue.
  itemValueResolver: (item: TItem) => string;
  // Function to render the row of the item in the combobox.
  rowDefinition: (item: TItem) => JSX.Element;
}

export function CommandDialogCombobox<TItem>(props: CommandDialogComboboxProps<TItem>) {
  const { labelPlural, pinnedItems } = props;

  const [searchValue, setSearchValue] = useState("");
  const showPinnedItems = searchValue === "" && pinnedItems && pinnedItems.length > 0;
  const showCreateItemScreen = props.onItemCreated !== undefined;

  const filteredItems = showPinnedItems
    ? props.items.filter(item => !pinnedItems.includes(item))
    : props.items;

  return (
    <CommandDialog
      open={props.open}
      shouldFilter={false}
      onOpenChange={(open) => {
        if (!open) setSearchValue("");
        props.onOpenChange(open);
      }}
    >
      <CommandInput placeholder={`Search ${labelPlural.toLowerCase()}`} onValueChange={(value) => {
        setSearchValue(value);
        props.onSearch(value);
      }} />
      <CommandList>
        <CommandEmpty>
          {showCreateItemScreen
            ? <CreateItemScreen searchValue={searchValue} {...props} />
            : <p className="text-center text-muted-foreground text-left">
                No {labelPlural.toLowerCase()} found.
              </p>}
        </CommandEmpty>
        {showPinnedItems && (
          <CommandGroup heading={`Recent ${labelPlural}`}>
            {pinnedItems.map((pinnedItem, idx) => {
              const itemValue = props.itemValueResolver(pinnedItem);
              return (
                <PinnedItemRow
                  key={`pinned-${itemValue}-${idx}`}
                  item={pinnedItem}
                  itemValue={itemValue}
                  {...props} />
              );
            })}
            <CommandSeparator className="my-2" />
          </CommandGroup>
        )}
        <CommandGroup>
          {filteredItems.map((item, idx) => {
            const itemValue = props.itemValueResolver(item);
            return (
              <StandardItemRow
                key={`${itemValue}-${idx}`}
                item={item}
                itemValue={itemValue}
                {...props} />
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

interface CreateItemScreenProps {
  label: string;
  searchValue: string;
  onItemCreated?: (value: string) => void;
}

function CreateItemScreen({label, searchValue, onItemCreated}: CreateItemScreenProps) {
  if (!onItemCreated) return null;
  return (
    <>
      <p className="px-4 pb-4 text-muted-foreground text-left">
        {label} <span className="font-semibold underline underline-offset-2">{searchValue}</span> was not found,
        would you like to create it?
      </p>
      <section className="flex items-center gap-2 px-4">
        <Input placeholder={`Create a new ${label}`} disabled={true} value={searchValue}/>
        <Button
          type="button"
          variant="outline"
          onClick={() => onItemCreated(searchValue)}
          disabled={!searchValue.trim()}
        >
          Create
        </Button>
      </section>
    </>
  )
}

interface PinnedItemsGroupProps<TItem> {
  item: TItem;
  itemValue: string;
  fieldValue: string;
  rowDefinition: (item: TItem) => JSX.Element;
  onItemSelected: (value: TItem) => void;
  labelPlural: string;
}

function PinnedItemRow<TItem>({
  item,
  itemValue,
  fieldValue,
  rowDefinition,
  onItemSelected,
}: PinnedItemsGroupProps<TItem>) {
  return (
    <CommandItem
      value={itemValue}
      key={itemValue}
      className="cursor-pointer"
      onSelect={() => onItemSelected(item)}
    >
      <span className="font-semibold text-muted-foreground">{rowDefinition(item)}</span>
      <Check strokeWidth={1.5} className={cn("ml-auto", itemValue === fieldValue ? "opacity-100" : "opacity-0")} />
      <Pin strokeWidth={1.4} />
    </CommandItem>
  );
}

interface StandardItemRowProps<TItem> {
  item: TItem;
  itemValue: string;
  fieldValue: string;
  onItemSelected: (item: TItem) => void;
  rowDefinition: (item: TItem) => JSX.Element;
}

function StandardItemRow<TItem>({item, itemValue, fieldValue, rowDefinition, onItemSelected}: StandardItemRowProps<TItem>) {
  return (
    <CommandItem
      value={itemValue}
      className="cursor-pointer"
      onSelect={() => onItemSelected(item)}
    >
      {rowDefinition(item)}
      <Check className={cn("ml-auto", itemValue === fieldValue ? "opacity-100" : "opacity-0")} />
    </CommandItem>
  );
}
