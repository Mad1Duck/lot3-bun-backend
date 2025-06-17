module.exports = {
  apps: [
    {
      name: "lot3-backend",
      script: "src/index.ts",
      interpreter: "bun",         // ← use Bun, not ts-node
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1512M",
      env: {
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add "~/.bun/bin/bun" to PATH
        NODE_ENV: "development",
        PORT: 8081,
      },
      env_production: {
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add "~/.bun/bin/bun" to PATH
        NODE_ENV: "production",
        PORT: 8082,
      },
    },
  ],
};
