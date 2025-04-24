import cron from "node-cron";
import { scheduleClickExport } from "../controllers/impact/clicks.js";
import chalk from "chalk"
import { fetchTrackingLinks } from "../controllers/partnerize/TrackingLinks.js";
import { fetchPartnerizeClicks } from "../controllers/partnerize/Clicks.js";

const impactClicksTask = () => {
    console.log(chalk.bgWhite.blackBright('running cron job for impact click export', new Date().toISOString()))
    scheduleClickExport();
}

const impactDataTask = () => {
    console.log(chalk.bgWhite('Running CRON Job for getting actions data'))
}


// partnerize:

const partnerizeLinksTask = () => {
    console.log(chalk.bgWhite.blackBright('running cron job for PARTNERIZE Links', new Date().toISOString()))
    fetchTrackingLinks()
}

const partnerizeClicksTask = () => {
    console.log(chalk.bgWhite.blackBright('running cron job for PARTNERIZE CLICKS', new Date().toISOString()))
    fetchPartnerizeClicks()
}

cron.schedule('*/1 * * * *', partnerizeLinksTask) //cron job to run every minute
cron.schedule('*/1 * * * *', partnerizeClicksTask) //cron job to run every minute
cron.schedule('*/5 * * * *', impactClicksTask) //cron job to run every 5 minutes
cron.schedule('*/30 * * * *', impactDataTask) //cron job to run every 30 minutes
