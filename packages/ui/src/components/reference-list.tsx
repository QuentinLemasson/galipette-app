import { InlineCode } from "@galipette/ui/components/inline-code";
import { cn } from "@galipette/ui/lib/utils";

export type ReferenceListItem = {
  key: string;
  targetLabel: string;
  targetEntityId?: string;
  targetEntitySlug?: string;
  operand: string;
  refSources: readonly string[];
};

type ReferenceListProps = {
  items: readonly ReferenceListItem[];
  className?: string;
};

function ReferenceList({ items, className }: ReferenceListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul
      data-slot="reference-list"
      className={cn("m-0 list-disc space-y-2 pl-5", className)}
    >
      {items.map((ref) => (
        <li key={ref.key}>
          <InlineCode>{ref.targetLabel}</InlineCode>
          {ref.targetEntityId ? (
            <>
              {" → "}
              <InlineCode>{ref.targetEntityId}</InlineCode>
              {ref.targetEntitySlug ? (
                <>
                  {" · "}
                  <InlineCode>{ref.targetEntitySlug}</InlineCode>
                </>
              ) : null}
            </>
          ) : null}
          <span className="text-sm text-muted-foreground">
            {" "}
            (operand <InlineCode>{ref.operand}</InlineCode> · {ref.refSources.join(", ")})
          </span>
        </li>
      ))}
    </ul>
  );
}

export { ReferenceList };
