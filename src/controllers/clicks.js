
import dotenv from "dotenv"

dotenv.config()

import { asyncHandler } from "../utils/errors/asyncHandler.js";
import ClickEventModel from "../models/clicks.js";

let scheduledExport = undefined

const impactAuth = Buffer.from(`${process.env.IMPACT_ACCOUNT_SID}:${process.env.IMPACT_AUTH_TOKEN}`).toString('base64');

async function checkStatus(path) {
    const url = `https://api.impact.com${path}`;

    const headers = {
        'Accept': 'application/json',
        'Authorization': `Basic ${impactAuth}`
    };

    const response = await fetch(url, { method: 'GET', headers });
    const data = await response.json();

    return data;
}

async function scheduleExport(programId = undefined) {
    const url = `https://api.impact.com/Mediapartners/${process.env.IMPACT_ACCOUNT_SID}/ClickExport?ResultFormat=JSON${programId ? `&ProgramId=${programId}` : ""}`;

    const headers = {
        'Accept': 'application/json',
        'Authorization': `Basic ${impactAuth}`
    };

    try {
        const response = await fetch(url, { method: 'GET', headers });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return data
    } catch (error) {
        console.error('Error:', error.message);
        return null
    }
}

async function downloadClickExport(path) {
    const url = `https://api.impact.com${path}`;

    const headers = {
        'Accept': 'application/json',
        'Authorization': `Basic ${impactAuth}`
    };

    const response = await fetch(url, { method: 'GET', headers });
    const data = await response.json();

    // console.log('download', data)
    return data;
}

export const scheduleClickExport = asyncHandler(async (req, res, next) => {
    const { programId } = req.body;

    if (!scheduledExport) {
        console.log('scheduledExport 1', scheduledExport)

        const clickExportSchedule = await scheduleExport(programId);
        scheduledExport = clickExportSchedule;
        res.status(201).json({ success: true, message: "Clicks Export job scheduled", clickExportSchedule });

    } else {
        console.log('scheduledExport 2', scheduledExport)
        const checkStatusResponse = await checkStatus(scheduledExport.QueuedUri);

        if (checkStatusResponse?.Status === "COMPLETED" && checkStatusResponse?.ResultUri) {
            scheduledExport = undefined
            const data = await downloadClickExport(checkStatusResponse?.ResultUri);

            const clickEvents = data?.Clicks.map(click => {
                return {
                    updateOne: {
                        filter: click,
                        update: { $set: click },
                        upsert: true
                    }
                }
            })

            const DBResponse = await ClickEventModel.bulkWrite(clickEvents);

            console.log('DBResponse', DBResponse)
            res.status(201).json({ success: true, message: "Clicks Export job completed", data, DBResponse });
        } else {
            res.status(400).json({ success: false, message: "This Click Export job already still being processed..." });
        }
    }
});
