import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new SQLDatabase("playcanvas_hub", {
  migrations: "./migrations",
});
