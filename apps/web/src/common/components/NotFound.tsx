/**
 * Fallback view rendered when a route resolves to no entity.
 */

import { Button } from "@galipette/ui/components/button";
import { Link } from "@tanstack/react-router";

type NotFoundProps = {
  message?: string;
  debug?: () => void;
};

/**
 * @description Renders a "not found" message with a link back to the home page.
 * @param props - Component props.
 * @param props.message - Optional custom message. Falls back to a generic copy.
 * @returns Section element informing the user nothing could be displayed.
 */
export function NotFound({ message, debug }: NotFoundProps) {
  return (
    <section className="not-found">
      <h1>Not found</h1>
      <p>{message ?? "This route did not match any compiled entity."}</p>
      <Link to="/app/home">Back to home</Link>
      {debug && (
        <Button id="not-found-debug-button" onClick={debug}>
          Debug
        </Button>
      )}
    </section>
  );
}
