import chalk from "chalk";
import { generate } from "../mpc";

async function main() {
  const silentSigner = await generate();
}

main()
  .then(() => console.log(chalk.yellow("Keygen process is completed")))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
