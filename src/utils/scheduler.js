import cron from "node-cron";
import { scheduleClickExport } from "../controllers/impact/clicks.js";

const task = () => {
    console.log('running cron job for impact click export', new Date().toISOString());
    scheduleClickExport();
}

cron.schedule('*/5 * * * *', task) //cron job to run every 5 minutes
