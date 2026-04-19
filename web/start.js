const { execSync } = require("child_process");
const port = process.env.PORT || "3000";
console.log(`Starting Next.js on port ${port}`);
execSync(`npx next start -p ${port}`, { stdio: "inherit" });
