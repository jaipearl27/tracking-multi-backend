
import dotenv from "dotenv"

dotenv.config()

import { asyncHandler } from "../../utils/errors/asyncHandler.js";

import ClickEventModel from "../../models/impact/clicks.js";

let scheduledExport = undefined

const impactAuth = Buffer.from(`${process.env.IMPACT_ACCOUNT_SID}:${process.env.IMPACT_AUTH_TOKEN}`).toString('base64');

async function checkStatus(path) {
    try {
    
        const url = `https://api.impact.com${path}`;
    
        const headers = {
            'Accept': 'application/json',
            'Authorization': `Basic ${impactAuth}`
        };
    
        const response = await fetch(url, { method: 'GET', headers });
        const data = await response.json();
    
        return data;
    } catch (error) {
        console.error(error)
        return
    }
}

async function scheduleExport(programId = undefined, date = undefined) {
    const url = `https://api.impact.com/Mediapartners/${process.env.IMPACT_ACCOUNT_SID}/ClickExport?ResultFormat=JSON${programId ? `&ProgramId=${programId}` : ""}${date ? `&Date=${date}` : ""}`;

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

    return data;
}

async function replayClickExport(path) {
    const url = `https://api.impact.com${path}`;

    const headers = {
        'Accept': 'application/json',
        'Authorization': `Basic ${impactAuth}`
    };

    const response = await fetch(url, { method: 'PUT', headers });
    const data = await response.json();
    console.log('scheduledExport replayed', data)
    return data;
}



export const scheduleClickExport = async (programId = undefined, date = undefined) => {
    if (!scheduledExport) {
        console.log('Export job scheduled');
        const clickExportSchedule = await scheduleExport(programId, date);
        console.log('clickExportSchedule', clickExportSchedule)
        scheduledExport = clickExportSchedule;
        if (clickExportSchedule) {
            await replayClickExport(clickExportSchedule?.ReplayUri)
            return { success: true, message: "Clicks Export job scheduled", clickExportSchedule };
        } else {
            return {success: false, message: "Error during scheduling export."}
        }
    } else {
        console.log('scheduledExport download requested', scheduledExport)
        const checkStatusResponse = await checkStatus(scheduledExport.QueuedUri);

        if (checkStatusResponse?.Status === "COMPLETED" && checkStatusResponse?.ResultUri) {

            scheduledExport = undefined

            const data = await downloadClickExport(checkStatusResponse?.ResultUri);

            if(!data?.Clicks) console.log("Clicks data not found will try later, here the data we got:", data)

            const clickEvents = data?.Clicks.map(click => {

                // Ensure EventDate is stored as a Date
                if (click.EventDate && typeof click.EventDate === "string") {
                    click.EventDate = new Date(click.EventDate);
                }

                return {
                    updateOne: {
                        filter: click,
                        update: { $set: click },
                        upsert: true
                    }
                }
            });

            const DBResponse = await ClickEventModel.bulkWrite(clickEvents);
            console.log('DBResponse', data, DBResponse)
            return { success: true, message: "Clicks Export job completed", data, DBResponse };
        } else {
            return { success: false, message: "This Click Export job already still being processed..." };
        }
    }
};


async function processClickExport(date, programId = undefined,) {
    console.log(`Scheduling export for ${date}...`);
    let scheduledExport = await scheduleExport(programId, date);

    if (!scheduledExport || !scheduledExport.ReplayUri) {
        console.log(`Failed to schedule export for ${date}`);
        return;
    }

    await replayClickExport(scheduledExport.ReplayUri);

    // Wait and check status periodically
    let checkStatusResponse;
    while (true) {
        console.log(`Checking status for ${date}...`);
        checkStatusResponse = await checkStatus(scheduledExport.QueuedUri);

        if (checkStatusResponse?.Status === "COMPLETED" && checkStatusResponse?.ResultUri) {
            console.log(`Export for ${date} completed. Downloading...`);
            break;
        }

        console.log(`Export for ${date} still processing...`);
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
    }

    const data = await downloadClickExport(checkStatusResponse.ResultUri);

    if (data?.Clicks?.length) {
        const clickEvents = data.Clicks.map((click) => ({
            updateOne: { filter: click, update: { $set: click }, upsert: true },
        }));

        const DBResponse = await ClickEventModel.bulkWrite(clickEvents);
        console.log(`Export for ${date} saved to DB:`, DBResponse);
    } else {
        console.log(`No click data found for ${date}`);
    }
}

export async function scheduleClickExportsForDateRange(startDate, endDate, programId = undefined,) {

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
        let formattedDate = date.toISOString().split("T")[0];
        console.log('in')
        await processClickExport(formattedDate, programId); // Process each day's export sequentially
    }

    return "Process completed."
}





export const scheduleExportAPI = asyncHandler(async (req, res) => {
    const { programId, startDate, endDate } = req?.query
    const result = await scheduleClickExportsForDateRange(startDate, endDate, programId)
    return res.status(200).send(result)

})



export const getClicks = asyncHandler(async (req, res) => {
    const { ProgramId } = req.query;
    const query = {}
    if (ProgramId) query.ProgramId = ProgramId
    const clicks = await ClickEventModel.find(query).sort({ ProgramId: 1 });

    res.status(200).json({ success: true, message: "Clicks fetched successfully", clicks });
})


export const getClicksCountAsPerProgramId = asyncHandler(async (req, res) => {
    const { ProgramId } = req?.params
    const totalClicks = await ClickEventModel.countDocuments({ ProgramId: ProgramId })
    res.status(200).json({ totalClicks })
})


