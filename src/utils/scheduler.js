import cron from "node-cron";
import { scheduleClickExport } from "../controllers/impact/clicks.js";
import chalk from "chalk"

const task = () => {
    chalk.bgWhite.blackBright('running cron job for impact click export', new Date().toISOString());
    scheduleClickExport();
}

const impactDataTask = () => {
    chalk.bgWhite('Running CRON Job for getting actions data')
}

cron.schedule('*/5 * * * *', task) //cron job to run every 5 minutes
cron.schedule('*/30 * * * *', impactDataTask)
