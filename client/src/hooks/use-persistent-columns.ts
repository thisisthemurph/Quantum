import { useEffect, useState } from "react";

interface PersistentColumnsOptions<TColName extends string> {
  key: string;
  defaults: Record<TColName, boolean>;
}

export interface PersistentColumnsContext<TColName extends string> {
  columns: Record<TColName, boolean>;
  setColumnVisibility: (column: TColName, visibility: boolean) => void;
}

export function usePersistentColumns<TColName extends string>({ key, defaults }: PersistentColumnsOptions<TColName>): PersistentColumnsContext<TColName> {
  const localStorageKey = `quantum:persistent-columns:${key}`;
  const [columns, setColumns] = useState<Record<TColName, boolean>>(defaults);

  useEffect(() => {
    const storedColumns = localStorage.getItem(localStorageKey);
    if (storedColumns) {
      setColumns(JSON.parse(storedColumns) as Record<TColName, boolean>);
    }
  }, [localStorageKey]);

  function setColumnVisibility(column: TColName, visibility: boolean) {
    console.log({ column, visibility });
    setColumns((prev) => {
      const updatedColumns = { ...prev, [column]: visibility };
      localStorage.setItem(localStorageKey, JSON.stringify(updatedColumns));
      return updatedColumns;
    });
  }

  return { columns, setColumnVisibility };
}
