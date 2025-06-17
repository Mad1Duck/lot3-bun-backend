module.exports = {
  apps: [
    {
      name: "lot3-backend",
      script: "bun",
      args: "run dev",
      interpreter: "",        // let PM2 run it directly
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1512M",
      env: {
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
        NODE_ENV: "development",
        PORT: 8081,
      },
      env_production: {
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
        NODE_ENV: "production",
        PORT: 8082,
      },
    },
  ],
};
