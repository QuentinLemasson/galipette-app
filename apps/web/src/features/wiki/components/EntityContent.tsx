/**
 * Renders a compiled entity's metadata and body from resolved mdast.
 */

import type { CompiledEntity } from "@galipette/compiled-content";
import ReactMarkdown from "react-markdown";

import { formatTypeLabel } from "../../../common/utils/format-type-label";

import { CompiledMdast } from "./CompiledMdast";

type EntityContentProps = {
  entity: CompiledEntity;
};

/**
 * @description Renders the compiled mdast body of a compiled entity along with a
 *   metadata header and a debug dump of the type-specific `data` payload.
 * @param props - Component props.
 * @param props.entity - The compiled entity to display.
 * @returns Article element containing the entity's full content.
 */
export function EntityContent({ entity }: EntityContentProps) {
  const data = (entity as { data?: unknown }).data;
  const hasData =
    data !== undefined &&
    data !== null &&
    typeof data === "object" &&
    Object.keys(data as Record<string, unknown>).length > 0;

  return (
    <article className="entity-content">
      <header className="entity-content__header">
        <span className="entity-content__type">{formatTypeLabel(entity.type)}</span>
        <h1>{entity.name}</h1>
        <code className="entity-content__id">{entity.id}</code>
        <p className="entity-content__slug">{entity.slug}</p>
      </header>

      <div className="entity-content__body">
        {entity.compiledContent ? (
          <CompiledMdast ast={entity.compiledContent} />
        ) : (
          <ReactMarkdown>{entity.content}</ReactMarkdown>
        )}
      </div>

      {hasData ? (
        <section className="entity-content__data">
          <h3>Data</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </section>
      ) : null}

      {entity.references.length > 0 ? (
        <section className="entity-content__references">
          <h3>References</h3>
          <ul>
            {entity.references.map((ref) => (
              <li key={`${ref.operand}:${ref.refSources.join(",")}`}>
                <code>{ref.targetLabel}</code>
                {ref.targetEntityId ? (
                  <>
                    {" "}
                    → <code>{ref.targetEntityId}</code>
                    {ref.targetEntitySlug ? (
                      <>
                        {" "}
                        · <code>{ref.targetEntitySlug}</code>
                      </>
                    ) : null}
                  </>
                ) : null}
                <span className="entity-content__ref-sources">
                  {" "}
                  (operand <code>{ref.operand}</code> · {ref.refSources.join(", ")})
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
