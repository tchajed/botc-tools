import rolesList from "./roles_snapshot.json";

const characterIdToIndex = new Map<string, number>();
rolesList.forEach((characterId: string, index: number) => {
  characterIdToIndex.set(characterId, index);
});

const indexToCharacterId = new Map<number, string>();
rolesList.forEach((characterId: string, index: number) => {
  indexToCharacterId.set(index, characterId);
});

/**
 * Compresses a script JSON by replacing character IDs with indices where possible. Characters not in roles_snapshot.json are kept as-is.
 */
export function compressScriptJson(json: string): string {
  try {
    const parsed = JSON.parse(json);
    const compressed = [];
    for (const item of parsed) {
      if (
        typeof item === "object" &&
        typeof item.id === "string" &&
        item.id !== "_meta"
      ) {
        const index = characterIdToIndex.get(item.id);
        if (index !== undefined) {
          compressed.push(index);
          continue;
        }
      }
      compressed.push(item);
    }
    return JSON.stringify(compressed);
  } catch (error) {
    console.warn("Failed to compress JSON, using original:", error);
    return json;
  }
}

/**
 * Decompresses a script JSON by replacing indices with character IDs
 * where possible. Handles both compressed and uncompressed formats.
 */
export function decompressScriptJson(json: string): string {
  try {
    const parsed = JSON.parse(json);
    const decompressed = [];
    for (const item of parsed) {
      if (typeof item === "number") {
        const characterId = indexToCharacterId.get(item);
        if (characterId !== undefined) {
          decompressed.push({ id: characterId });
          continue;
        }
      }
      decompressed.push(item);
    }
    return JSON.stringify(decompressed);
  } catch (error) {
    console.warn("Failed to decompress JSON, using original:", error);
    return json;
  }
}
