import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";
import {ReactNode} from "react";

interface ConfirmAlertDialogProps<T> {
  target: T,
  title: string;
  description: (item: T) => ReactNode;
  cancelText?: string;
  confirmText?: string;
  onConfirm: (item: T) => void;
  onCancel?: (item: T) => void;
  open: boolean;
  onOpenChange: (opening: boolean) => void;
}

export function ConfirmAlertDialog<T>({
  target,
  open,
  onOpenChange,
  title,
  description,
  cancelText = "Cancel",
  confirmText = "Confirm",
  onConfirm,
  onCancel,
}: ConfirmAlertDialogProps<T>) {
  const descriptionElement = target ? description(target) : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {descriptionElement}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {descriptionElement}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            if (onCancel) onCancel(target);
          }}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/80"
            onClick={() => onConfirm(target)}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}