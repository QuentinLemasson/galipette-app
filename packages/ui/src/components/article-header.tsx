import { Badge } from "@galipette/ui/components/badge";
import { Typography } from "@galipette/ui/components/typography";
import { cn } from "@galipette/ui/lib/utils";

type ArticleHeaderProps = {
  typeLabel: string;
  title: string;
  id: string;
  slug: string;
  className?: string;
};

function ArticleHeader({ typeLabel, title, id, slug, className }: ArticleHeaderProps) {
  return (
    <header
      data-slot="article-header"
      className={cn("flex flex-col gap-1 border-b border-border pb-4", className)}
    >
      <Badge variant="outline" className="w-fit border-primary/30 text-primary">
        {typeLabel}
      </Badge>
      <Typography variant="h1" as="h1">
        {title}
      </Typography>
      {/* TODO : tagList ui component */}
      <div className="flex flex-row gap-2">
        <Badge variant="outline">{id}</Badge>
        <Badge variant="outline">{slug}</Badge>
      </div>
    </header>
  );
}

export { ArticleHeader };
