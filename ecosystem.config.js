module.exports = {
  apps: [
    {
      name: "lot3-backend",
      script: "bun",
      args: ["run", "src/index.ts"],
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 5,
      restart_delay: 5000,
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
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
