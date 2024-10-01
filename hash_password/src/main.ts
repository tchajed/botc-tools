import bcrypt from "bcryptjs";
import { Command } from "commander";

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}

async function main() {
  const program = new Command();
  program
    .version("0.1.0")
    .description("Hash password")
    .argument("<password>", "Password to hash")
    .action(async (password: string, _options) => {
      const hash = await hashPassword(password);
      console.log(hash);
      if (!(await bcrypt.compare(password, hash))) {
        console.error("password is not considered correct?!");
      }
    });
  program.parseAsync();
}

main();
