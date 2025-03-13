import cron from "node-cron";
import { scheduleClickExport } from "../controllers/clicks.js";

const task = () => {
    console.log('running cron job', new Date().toISOString());
    scheduleClickExport();
}

cron.schedule('* * * * *', task)
