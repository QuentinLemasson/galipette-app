/**
 * Route shell: remounts the sheet editor when `:characterId` changes.
 */

import { useParams } from "@tanstack/react-router";
import { CharacterSheetPage } from "./CharacterSheetPage";

export function CharacterSheetRoutePage() {
  const { characterId } = useParams({ strict: false }) as {
    characterId: string;
  };
  return <CharacterSheetPage key={characterId} characterId={characterId} />;
}
