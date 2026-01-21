import React from "react";
import Card from "./Card.jsx";
import Button from "./Button.jsx";

export default function EmptyState({
  eyebrow = "Notice",
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <Card className="p-8" hover={false}>
      <p className="ds-eyebrow">{eyebrow}</p>
      <h2 className="ds-title mt-2">{title}</h2>
      {description ? <p className="ds-body mt-2 max-w-xl">{description}</p> : null}

      {(primaryActionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {primaryActionLabel ? (
            <Button onClick={onPrimaryAction}>{primaryActionLabel}</Button>
          ) : null}
          {secondaryActionLabel ? (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          ) : null}
        </div>
      )}
    </Card>
  );
}

