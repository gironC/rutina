"use client";

import { format } from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  DayPicker,
  type DateRange,
  type DayPickerProps,
  type OnSelectHandler,
  type PropsMulti,
  type PropsRange,
} from "react-day-picker";
import "react-day-picker/style.css";

type DatePickerSharedProps = Omit<
  DayPickerProps,
  "mode" | "onSelect" | "required" | "selected"
> & {
  required?: boolean;
  title: string;
};

type DatePickerSingleProps = DatePickerSharedProps & {
  mode?: "single";
  onSelect?: OnSelectHandler<Date | undefined>;
  selected?: Date;
};

type DatePickerMultipleProps = DatePickerSharedProps & {
  mode: "multiple";
  onSelect?: OnSelectHandler<Date[] | undefined>;
  selected?: Date[];
} & Pick<PropsMulti, "min" | "max">;

type DatePickerRangeProps = DatePickerSharedProps & {
  mode: "range";
  onSelect?: OnSelectHandler<DateRange | undefined>;
  selected?: DateRange;
} & Pick<
    PropsRange,
    "disabled" | "excludeDisabled" | "max" | "min" | "resetOnSelect"
  >;

export type DatePickerProps =
  (
    | DatePickerSingleProps
    | DatePickerMultipleProps
    | DatePickerRangeProps
  );

type DatePickerSelection = Date | Date[] | DateRange | undefined;

const dateFormat = "dd/MM/yyyy";

function formatSelection(
  mode: DatePickerProps["mode"],
  selection: DatePickerSelection,
) {
  if (mode === "multiple") {
    return Array.isArray(selection) && selection.length > 0
      ? `${selection.length} fechas seleccionadas`
      : "Selecciona una fecha...";
  }

  if (mode === "range") {
    const range =
      selection && typeof selection === "object" && "from" in selection
        ? selection
        : undefined;

    if (!range?.from) {
      return "Selecciona una fecha...";
    }

    return range.to
      ? `${format(range.from, dateFormat)} - ${format(range.to, dateFormat)}`
      : `${format(range.from, dateFormat)} - ...`;
  }

  return selection instanceof Date
    ? format(selection, dateFormat)
    : "Selecciona una fecha...";
}

export default function DatePicker({
  className,
  mode = "single",
  onSelect,
  style,
  selected,
  title,
  ...dayPickerProps
}: DatePickerProps) {
  const generatedId = useId();
  const pickerId = dayPickerProps.id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const [internalSelection, setInternalSelection] = useState<DatePickerSelection>(
    selected,
  );
  const selectedValue = selected ?? internalSelection;
  const selectionLabel = formatSelection(mode, selectedValue);
  const hasSelection = selectionLabel !== "Selecciona una fecha...";

  useEffect(() => {
    if (!open) {
      return;
    }

    const updatePlacement = () => {
      const container = containerRef.current;
      const dropdown = dropdownRef.current;

      if (!container || !dropdown) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const dropdownGap = 8;
      const shouldOpenAbove =
        containerRect.bottom + dropdown.offsetHeight + dropdownGap >
        window.innerHeight;

      setOpenAbove((current) =>
        current === shouldOpenAbove ? current : shouldOpenAbove,
      );
    };

    const frame = window.requestAnimationFrame(updatePlacement);
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [open]);

  const handleSelect: OnSelectHandler<DatePickerSelection> = (
    selection,
    triggerDate,
    modifiers,
    event,
  ) => {
    setInternalSelection(selection);
    (onSelect as OnSelectHandler<DatePickerSelection> | undefined)?.(
      selection,
      triggerDate,
      modifiers,
      event,
    );

    const rangeIsComplete =
      mode === "range" &&
      selection &&
      typeof selection === "object" &&
      "from" in selection &&
      Boolean(selection.from && selection.to);

    if (mode === "single" || rangeIsComplete) {
      setOpenAbove(false);
      setOpen(false);
    }
  };

  const dayPickerPropsWithSelection = {
    ...dayPickerProps,
    className: `text-base-content ${className ?? ""}`,
    mode,
    onSelect: handleSelect,
    selected: selectedValue,
    style: {
      ...style,
      "--rdp-accent-background-color":
        "color-mix(in oklab, var(--color-primary) 15%, transparent)",
      "--rdp-accent-color": "var(--color-primary)",
    } as CSSProperties,
  } as unknown as DayPickerProps;

  return (
    <div ref={containerRef} className="relative mb-2">
      <label className="mb-1 block text-xs" htmlFor={pickerId}>
        {title}
      </label>
      <div className="input w-full border border-base-300 transition-colors focus-within:border-primary focus-within:outline-none">
        <Calendar
          aria-hidden="true"
          className="mr-1 size-4 shrink-0 text-base-content/25"
        />
        <button
          aria-expanded={open}
          aria-haspopup="dialog"
          className={`min-w-0 flex-1 truncate bg-base-100 text-left outline-none ${
            hasSelection ? "text-base-content" : "text-base-content/50"
          }`}
          id={pickerId}
          onClick={() => {
            if (open) {
              setOpenAbove(false);
            }
            setOpen((isOpen) => !isOpen);
          }}
          type="button"
        >
          {selectionLabel}
        </button>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-base-content/50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className={`absolute left-0 z-20 rounded-box border border-base-300 bg-base-100 p-3 shadow-md ${
            openAbove ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <DayPicker {...dayPickerPropsWithSelection} />
        </div>
      )}
    </div>
  );
}
