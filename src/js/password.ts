const PASSWORD_HASH =
  "88e0b211e647f2a9f1d63720c3f1a7cef35a2940d28b5290fe12141ce446dbeb";

export async function isCorrectPassword(password: string): Promise<boolean> {
  // quick check if there's no password attempt
  if (password == "") {
    return false;
  }
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password),
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex == PASSWORD_HASH;
}
