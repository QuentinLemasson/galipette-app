/**
 * Landing page rendered for the `/` route.
 */

import { contentRepository } from "@galipette/compiled-content";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@galipette/ui/components/avatar";
import { Button } from "@galipette/ui/components/button";
import { Typography } from "@galipette/ui/components/typography";
import { Link } from "@tanstack/react-router";

import { formatTypeLabel } from "../../common/utils/format-type-label";
import { useNavigationTree } from "../../features/wiki/hooks/useNavigationTree";

/**
 * @description Top-level welcome page summarising the compiled-content corpus.
 *   Displays the total entity count and a per-type breakdown.
 */
export function HomePage() {
  const tree = useNavigationTree();
  const totalEntities = contentRepository.count();

  return (
    <section className="flex max-w-3xl flex-col gap-4">
      <Typography variant="h1" as="h1" className="text-2xl font-bold">
        Welcome
      </Typography>
      <Typography variant="body">
        This MVP validates the compiled-content pipeline by browsing every authored entity from the
        local artifact bundle. Pick an item in the sidebar to read its content.
      </Typography>

      <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
        <li className="rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm">
          <Link to="/app/characters" className="font-medium text-primary hover:underline">
            Character roster (API)
          </Link>{" "}
          <span className="text-muted-foreground">— list & edit via HTTP</span>
        </li>
        <li className="rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm">
          <strong className="mr-1.5 text-lg font-semibold text-foreground">{totalEntities}</strong>
          entities total
        </li>
        {tree.map((category) => (
          <li
            key={category.type}
            className="rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm"
          >
            <strong className="mr-1.5 text-lg font-semibold text-foreground">
              {category.entries.length}
            </strong>
            {formatTypeLabel(category.type).toLowerCase()}
          </li>
        ))}
      </ul>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <Avatar>
          <AvatarImage src="/vite.svg" alt="Galipette" />
          <AvatarFallback>GP</AvatarFallback>
        </Avatar>
        <Button onClick={() => alert("Test ui Package")}>Test ui Package</Button>
      </div>
    </section>
  );
}
