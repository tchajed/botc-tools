import axios from "axios";
import fs from "fs";

const TOWNSQUARE_DATA_URL =
  "https://raw.githubusercontent.com/nicholas-eden/townsquare/refs/heads/develop/src";

interface RoleData {
  team: string;
  edition?: unknown;
  firstNightReminder?: string;
  otherNightReminder?: string;
  [key: string]: unknown;
}

async function downloadFile(url: string, destFile: string) {
  if (fs.existsSync(destFile)) {
    console.log(`already have ${destFile.split("/").pop()}`);
    return;
  }
  const { data } = await axios.get(url, {
    responseType: "arraybuffer",
    responseEncoding: "binary",
  });
  await fs.promises.writeFile(destFile, data);
}

/** Download JSON files with character metadata and text. */
export async function downloadCharacterData(assetsPath: string) {
  // The Townsquare repo (nicholas-eden/townsquare, the source of this data)
  // merged characters.json and non_player_characters.json into roles.json.
  // Split them again to retain the file layout expected by the app.
  const rolesPath = `${assetsPath}/roles.json`;
  const nonPlayerRolesPath = `${assetsPath}/fabled.json`;
  const downloadRoles = async () => {
    if (fs.existsSync(rolesPath) && fs.existsSync(nonPlayerRolesPath)) {
      console.log("already have roles.json and fabled.json");
      return;
    }

    const { data } = await axios.get<RoleData[]>(
      `${TOWNSQUARE_DATA_URL}/roles.json`,
    );
    // The merged data omits empty night reminders. Normalize them because the
    // app uses an empty string to determine whether a role wakes at night.
    const roles = data.map((role) => ({
      ...role,
      firstNightReminder: role.firstNightReminder ?? "",
      otherNightReminder: role.otherNightReminder ?? "",
    }));
    const playerTeams = new Set([
      "townsfolk",
      "outsider",
      "minion",
      "demon",
      "traveller",
    ]);

    if (!fs.existsSync(rolesPath)) {
      await fs.promises.writeFile(
        rolesPath,
        `${JSON.stringify(
          roles.filter((role) => playerTeams.has(role.team)),
          null,
          2,
        )}\n`,
      );
    }
    if (!fs.existsSync(nonPlayerRolesPath)) {
      const nonPlayerRoles = roles
        .filter((role) => !playerTeams.has(role.team))
        .map((role) => {
          // aggregateRoles supplies "other" for these roles; match the old
          // non_player_characters.json schema, which had no edition field.
          const nonPlayerRole = { ...role };
          delete nonPlayerRole.edition;
          return nonPlayerRole;
        });
      await fs.promises.writeFile(
        nonPlayerRolesPath,
        `${JSON.stringify(nonPlayerRoles, null, 2)}\n`,
      );
    }
  };

  await Promise.all([
    downloadRoles(),
    downloadFile(
      `${TOWNSQUARE_DATA_URL}/nightsheet.json`,
      `${assetsPath}/nightsheet.json`,
    ),
    downloadFile(
      `${TOWNSQUARE_DATA_URL}/jinxes.json`,
      `${assetsPath}/jinx.json`,
    ),
  ]);
}
