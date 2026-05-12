/**
 * Landing page rendered for the `/` route.
 */

import { contentRepository } from "@galipette/compiled-content";
import { Link } from "@tanstack/react-router";
import { formatTypeLabel } from "../../common/utils/format-type-label";
import { useNavigationTree } from "../../features/wiki/hooks/useNavigationTree";

/**
 * @description Top-level welcome page summarising the compiled-content corpus.
 *   Displays the total entity count and a per-type breakdown.
 * @returns Hero/welcome section.
 */
export function HomePage() {
  const tree = useNavigationTree();
  const totalEntities = contentRepository.count();

  return (
    <section className="home-page">
      <h1>Welcome</h1>
      <p>
        This MVP validates the compiled-content pipeline by browsing every
        authored entity from the local artifact bundle. Pick an item in the
        sidebar to read its content.
      </p>

      <ul className="home-page__stats">
        <li>
          <Link to="/characters" className="character-page__link">
            Character roster (API)
          </Link>{" "}
          — list & edit via HTTP
        </li>
        <li>
          <strong>{totalEntities}</strong> entities total
        </li>
        {tree.map((category) => (
          <li key={category.type}>
            <strong>{category.entries.length}</strong>{" "}
            {formatTypeLabel(category.type).toLowerCase()}
          </li>
        ))}
      </ul>
    </section>
  );
}
