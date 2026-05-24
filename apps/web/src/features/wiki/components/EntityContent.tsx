/**
 * Renders a compiled entity's metadata and body from resolved mdast.
 */

import type { CompiledEntity } from "@galipette/compiled-content";
import { Article } from "@galipette/ui/components/article";
import { ArticleHeader } from "@galipette/ui/components/article-header";
import { CodeBlock } from "@galipette/ui/components/code-block";
import { ContentSection } from "@galipette/ui/components/content-section";
import { Prose } from "@galipette/ui/components/prose";
import { ReferenceList } from "@galipette/ui/components/reference-list";
import ReactMarkdown from "react-markdown";

import { formatTypeLabel } from "../../../common/utils/format-type-label";

import { CompiledMdast } from "./CompiledMdast";

type EntityContentProps = {
  entity: CompiledEntity;
};

/**
 * @description Renders the compiled mdast body of a compiled entity along with a
 *   metadata header and a debug dump of the type-specific `data` payload.
 */
export function EntityContent({ entity }: EntityContentProps) {
  const data = (entity as { data?: unknown }).data;
  const hasData =
    data !== undefined &&
    data !== null &&
    typeof data === "object" &&
    Object.keys(data as Record<string, unknown>).length > 0;

  const references = entity.references.map((ref) => ({
    key: `${ref.operand}:${ref.refSources.join(",")}`,
    targetLabel: ref.targetLabel,
    targetEntityId: ref.targetEntityId,
    targetEntitySlug: ref.targetEntitySlug,
    operand: ref.operand,
    refSources: ref.refSources,
  }));

  return (
    <Article>
      <ArticleHeader
        typeLabel={formatTypeLabel(entity.type)}
        title={entity.name}
        id={entity.id}
        slug={entity.slug}
      />

      <Prose>
        {entity.compiledContent ? (
          <CompiledMdast ast={entity.compiledContent} />
        ) : (
          <ReactMarkdown>{entity.content}</ReactMarkdown>
        )}
      </Prose>

      {hasData ? (
        <ContentSection title="Data">
          <CodeBlock>{JSON.stringify(data, null, 2)}</CodeBlock>
        </ContentSection>
      ) : null}

      {references.length > 0 ? (
        <ContentSection title="References">
          <ReferenceList items={references} />
        </ContentSection>
      ) : null}
    </Article>
  );
}
