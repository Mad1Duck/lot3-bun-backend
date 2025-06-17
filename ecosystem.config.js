module.exports = {
  apps: [
    {
      name: "lot3-backend",
      script: "bun",
      args: ["run", "src/index.ts"],
      interpreter: "",
      instances: 1,
      autorestart: false,
      watch: false,  // matikan watch dari PM2 biar gak bentrok sama --hot bun
      max_memory_restart: "0", // matikan limit dulu
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
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
    },
  ],
};
