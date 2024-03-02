import bcrypt from "bcryptjs";

const PASSWORD_HASH =
  "$2a$10$1ES0fLT64vbFtjc98cN4zuXtyB5souy66c1wgUWeRYyGBuV/m7O.m";

export async function isCorrectPassword(password: string): Promise<boolean> {
  // quick check if there's no password attempt
  if (password == "") {
    return false;
  }
  return await bcrypt.compare(password, PASSWORD_HASH);
}
