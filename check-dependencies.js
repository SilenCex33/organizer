import { exec } from "child_process";

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${description}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${stderr}`);
        reject(error);
      } else {
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

async function checkDependencies() {
  try {
    // 1. Überprüfe auf veraltete Pakete
    await runCommand("npm outdated", "Checking for outdated packages");

    // 2. Führe einen Sicherheits-Check durch
    await runCommand("npm audit", "Checking for security vulnerabilities");

    // 3. Versuche automatisch sicherheitskritische Probleme zu beheben
    await runCommand("npm audit fix", "Fixing security vulnerabilities (if any)");

    console.log("\n✅ Dependencies check completed successfully.");
  } catch (err) {
    console.error("\n❌ Dependency check failed.");
  }
}

checkDependencies();
