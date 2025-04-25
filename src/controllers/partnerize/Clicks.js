// https://api.partnerize.com/reporting/report_publisher/publisher/1100l286361/click.json

import chalk from "chalk";
import PartnerizeClickEventModel from "../../models/partnerize/clicks.js";
import { asyncHandler } from "../../utils/errors/asyncHandler.js";


const partnerizePublisherId = process.env.PARTNERIZE_PUBLISHER_ID || '1100l286361'
const partnerizeAuthToken = process.env.PARTNERIZE_AUTH_TOKEN || 'cDN0ZXcxNDV5M3RhZzQxbjpOWnRCMTFrMg'


export const fetchPartnerizeClicks = async () => {

    try {

        //checking size of tracking links in our db to calculate offset
        // const offset = await PartnerizeClickEventModel.countDocuments({})
        const url = `https://api.partnerize.com/reporting/report_publisher/publisher/${partnerizePublisherId}/click.json`; //${offset > 0 ? `?offset=${offset}` : ""}
        console.log('partnerize tracking link url:  ', url)

        const headers = {
            'Accept': 'application/json',
            'Authorization': `Basic ${partnerizeAuthToken}`
        };

        const response = await fetch(url, { method: 'GET', headers });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // console.log(`================partnerize clicks==================`, data?.clicks)

        if (data?.clicks) {
            await builkWriteToDB(data?.clicks)
            console.log(chalk.bgCyan('Partnerize CLICKS added to DB'))
        }

        return true
    } catch (error) {
        console.error('Error:', error.message);
        return null
    }
}

const builkWriteToDB = async (data) => {

    if (Array.isArray(data) && data?.length <= 0) {
        console.log(chalk.bgRedBright('Data is not an ARRAY or is an EMPTY ARRAY.'))
    }
    const formattedData = data?.map((item) => {
        if (item?.click) {

            // Ensure set_time is stored as a Date
            if (item.click?.set_time && typeof item.click?.set_time === "string") {

                const splitDateTime = item.click?.set_time.split(" ")
                item.click.set_time = new Date(`${splitDateTime[0]}T${splitDateTime[1]}Z`) //Ensuring that UTC string '2025-04-25 05:56:31' stays in UTC format
            }

            return {
                updateOne: {
                    filter: item.click,
                    update: { $set: item.click },
                    upsert: true
                }
            }
        }
    });


    // console.log(chalk.bgYellowBright('formattedData', JSON.stringify(formattedData)))

    const DBResponse = await PartnerizeClickEventModel.bulkWrite(formattedData);
    console.log(DBResponse)
}


export const getPartnerizeClicks = asyncHandler(async (req, res) => {
    const { campaign_id } = req.query;
    const query = {}
    if (campaign_id) query.campaign_id = campaign_id
    const clicks = await PartnerizeClickEventModel.find(query).sort({ campaign_id: 1 });

    res.status(200).json({ success: true, message: "Clicks fetched successfully", clicks });
})


export const getClicksCountAsPerCampaignId = asyncHandler(async (req, res) => {
    const { campaign_id } = req?.params
    const totalClicks = await PartnerizeClickEventModel.countDocuments({ campaign_id: campaign_id })
    res.status(200).json({ totalClicks })
})