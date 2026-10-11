"use client";

import type { ReactNode } from "react";
import { Ellipsis } from "lucide-react";

export type TableColumn<T extends TableRow> = {
  id: keyof T & string;
  title: string;
};

export type TableAction = {
  id: string;
  texto: string;
};

export type TableRow = {
  id: string | number;
  [key: string]: ReactNode;
};

export type TableProps<T extends TableRow> = {
  actions?: readonly TableAction[];
  data: readonly T[];
  headers: readonly TableColumn<T>[];
  onAction?: (actionId: string, rowId: T["id"]) => void;
  showActions?: boolean;
};

export default function Table<T extends TableRow>({
  actions = [],
  data,
  headers,
  onAction,
  showActions = false,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header.id}>{header.title}</th>
            ))}
            {showActions && <th aria-label="Acciones" />}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {headers.map((header) => (
                <td key={header.id}>{row[header.id]}</td>
              ))}
              {showActions && (
                <td>
                  <details className="dropdown dropdown-end">
                    <summary
                      aria-label={`Acciones para ${row.id}`}
                      className="btn btn-ghost btn-circle btn-sm list-none"
                    >
                      <Ellipsis aria-hidden="true" className="size-4" />
                    </summary>
                    <ul
                      className="menu dropdown-content z-10 w-52 rounded-box bg-base-100 p-2 shadow-md"
                      tabIndex={0}
                    >
                      {actions.map((action) => (
                        <li key={action.id}>
                          <button
                            onClick={(event) => {
                              onAction?.(action.id, row.id);
                              event.currentTarget
                                .closest("details")
                                ?.removeAttribute("open");
                            }}
                            type="button"
                          >
                            {action.texto}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </details>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
