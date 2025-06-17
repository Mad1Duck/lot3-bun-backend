module.exports = {
  apps: [
    {
      name: "lot3-backend",
      script: "bun",
      args: ["run", "--hot", "src/index.ts"],

      instances: 1,
      autorestart: true,

      // Nonaktifkan watch karena bun sudah handle hot reload
      watch: false,

      // Nonaktifkan max memory restart dulu, bisa diaktifkan kalau mau nanti
      max_memory_restart: "0",

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
      // Tambahan supaya PM2 lebih stabil:
      max_restarts: 10,       // Batasi restart beruntun
      restart_delay: 3000,    // Delay 3 detik antar restart
    },
  ],
};
