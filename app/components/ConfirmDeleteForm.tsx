"use client";
import { useState } from "react";

export default function ConfirmDeleteForm({
  action,
  id,
  label = "Delete",
  confirmMessage = "Are you sure you want to delete this item? This action cannot be undone.",
  buttonClassName = "text-red-600",
  formClassName,
}: {
  action: string;
  id: string;
  label?: string;
  confirmMessage?: string;
  buttonClassName?: string;
  formClassName?: string;
}) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action={action}
      method="POST"
      className={formClassName}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
          return;
        }
        setSubmitting(true);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className={buttonClassName} type="submit" disabled={submitting}>
        {submitting ? "Deleting..." : label}
      </button>
    </form>
  );
}
