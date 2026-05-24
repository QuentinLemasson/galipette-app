/**
 * Fallback view rendered when a route resolves to no entity.
 */

import { Button } from "@galipette/ui/components/button";
import { Typography } from "@galipette/ui/components/typography";
import { Link } from "@tanstack/react-router";

type NotFoundProps = {
  message?: string;
  debug?: () => void;
};

/**
 * @description Renders a "not found" message with a link back to the home page.
 */
export function NotFound({ message, debug }: NotFoundProps) {
  return (
    <section className="flex max-w-lg flex-col gap-3">
      <Typography variant="h1" as="h1">
        Not found
      </Typography>
      <Typography variant="body">
        {message ?? "This route did not match any compiled entity."}
      </Typography>
      <Link to="/app/home" className="text-sm font-medium text-primary hover:underline">
        Back to home
      </Link>
      {debug ? (
        <Button id="not-found-debug-button" onClick={debug}>
          Debug
        </Button>
      ) : null}
    </section>
  );
}
