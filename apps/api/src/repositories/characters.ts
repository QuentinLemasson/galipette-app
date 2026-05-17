import { prisma, Prisma } from "@galipette/database";
import type { CharacterCreate, CharacterPatch } from "@galipette/shared-schemas";

const withSheet = { sheet: true } as const;

export async function listCharactersWithSheet() {
  return prisma.character.findMany({
    include: withSheet,
    orderBy: { createdAt: "desc" },
  });
}

export async function findCharacterWithSheetById(id: string) {
  return prisma.character.findUnique({
    where: { id },
    include: withSheet,
  });
}

export async function createCharacterWithSheet(input: CharacterCreate) {
  return prisma.character.create({
    data: {
      name: input.name,
      player: input.player,
      sheet: input.sheet
        ? {
            create: {
              attributes: input.sheet.attributes,
              skillIds: input.sheet.skillIds,
            },
          }
        : undefined,
    },
    include: withSheet,
  });
}

export type PatchCharacterResult =
  | { kind: "empty_patch" }
  | { kind: "not_found" }
  | { kind: "ok"; row: Awaited<ReturnType<typeof createCharacterWithSheet>> };

export async function patchCharacterWithSheet(
  id: string,
  body: CharacterPatch,
): Promise<PatchCharacterResult> {
  const hasCharacter = body.name !== undefined || body.player !== undefined;
  const hasSheet =
    body.sheet !== undefined &&
    (body.sheet.attributes !== undefined || body.sheet.skillIds !== undefined);
  if (!hasCharacter && !hasSheet) {
    return { kind: "empty_patch" };
  }

  const existing = await prisma.character.findUnique({ where: { id } });
  if (!existing) {
    return { kind: "not_found" };
  }

  try {
    const row = await prisma.character.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.player !== undefined && { player: body.player }),
        ...(hasSheet &&
          body.sheet && {
            sheet: {
              upsert: {
                create: {
                  attributes: body.sheet.attributes ?? {},
                  skillIds: body.sheet.skillIds ?? [],
                },
                update: {
                  ...(body.sheet.attributes !== undefined && {
                    attributes: body.sheet.attributes,
                  }),
                  ...(body.sheet.skillIds !== undefined && {
                    skillIds: body.sheet.skillIds,
                  }),
                },
              },
            },
          }),
      },
      include: withSheet,
    });
    return { kind: "ok", row };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { kind: "not_found" };
    }
    throw e;
  }
}

export type DeleteCharacterResult = "deleted" | "not_found";

export async function deleteCharacterById(id: string): Promise<DeleteCharacterResult> {
  try {
    await prisma.character.delete({ where: { id } });
    return "deleted";
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return "not_found";
    }
    throw e;
  }
}
