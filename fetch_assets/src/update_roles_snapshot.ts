#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";

/**
 * Script to compare roles.json with roles_snapshot.json and append missing roles
 * This ensures the snapshot stays up-to-date with new roles while maintaining stable indices
 */

interface Role {
  id: string;
  name: string;
}

const ROLES_JSON_PATH = path.join(__dirname, "../../assets/data/roles.json");
const ROLES_SNAPSHOT_PATH = path.join(
  __dirname,
  "../../src/js/roles_snapshot.json",
);

function updateRolesSnapshot(): void {
  const rolesData: Role[] = JSON.parse(
    fs.readFileSync(ROLES_JSON_PATH, "utf8"),
  );
  const currentRoleIds = rolesData.map((role: Role) => role.id);
  const snapshotRoleIds: string[] = JSON.parse(
    fs.readFileSync(ROLES_SNAPSHOT_PATH, "utf8"),
  );

  const missingRoles = currentRoleIds.filter(
    (roleId: string) => !snapshotRoleIds.includes(roleId),
  );
  if (missingRoles.length === 0) {
    console.log("No new roles found. Snapshot is up-to-date.");
    return;
  }

  const updatedRoleIds = [...snapshotRoleIds, ...missingRoles];
  const updatedContent = JSON.stringify(updatedRoleIds, null, 2);
  fs.writeFileSync(ROLES_SNAPSHOT_PATH, updatedContent);

  console.log(
    `Successfully updated roles_snapshot.json with ${missingRoles.length} new role(s)`,
  );
  console.log("\nNew roles added:");
  missingRoles.forEach((roleId: string, index: number) => {
    const role = rolesData.find((r: Role) => r.id === roleId);
    console.log(
      `  ${snapshotRoleIds.length + index}: ${roleId} (${role?.name || "Unknown"})`,
    );
  });
}

updateRolesSnapshot();
