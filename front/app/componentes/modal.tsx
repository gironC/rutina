"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

export type ModalProps = Omit<
  ComponentPropsWithoutRef<"dialog">,
  "children" | "title"
> & {
  children: ReactNode;
  closeable?: boolean;
  title: string;
};

const Modal = forwardRef<HTMLDialogElement, ModalProps>(
  (
    {
      children,
      closeable = true,
      id,
      onCancel,
      open,
      title,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId().replaceAll(":", "");
    const dialogRef = useRef<HTMLDialogElement>(null);
    const dialogId = id ?? `modal-${generatedId}`;

    useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, []);

    useEffect(() => {
      const dialog = dialogRef.current;

      if (!dialog || open === undefined) {
        return;
      }

      if (open && !dialog.open) {
        dialog.showModal();
      } else if (!open && dialog.open) {
        dialog.close();
      }
    }, [open]);

    return (
      <dialog
        {...props}
        className={`modal ${props.className ?? ""}`}
        id={dialogId}
        onCancel={(event) => {
          if (!closeable) {
            event.preventDefault();
          }

          onCancel?.(event);
        }}
        ref={dialogRef}
      >
        <div className="modal-box">
          {closeable && (
            <form method="dialog">
              <button
                aria-label="Cerrar modal"
                className="btn btn-ghost btn-sm btn-circle absolute right-2 top-2"
                type="submit"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </form>
          )}
          <h3 className="text-lg font-bold opacity-50">{title}</h3>
          <div className="mt-4">{children}</div>
        </div>
        {closeable && (
          <form className="modal-backdrop" method="dialog">
            <button type="submit">Cerrar</button>
          </form>
        )}
      </dialog>
    );
  },
);

Modal.displayName = "Modal";

export default Modal;
