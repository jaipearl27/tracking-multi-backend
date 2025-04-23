import chalk from "chalk"
import PartnerizeTrackingLink from "../../models/partnerize/trackingLinks.js"
import { asyncHandler } from "../../utils/errors/asyncHandler.js"


const partnerizePublisherId = process.env.PARTNERIZE_PUBLISHER_ID || '1100l286361'
const partnerizeAuthToken = process.env.PARTNERIZE_AUTH_TOKEN || 'cDN0ZXcxNDV5M3RhZzQxbjpOWnRCMTFrMg'

export const fetchTrackingLinks = async () => {

    try {

        //checking size of tracking links in our db to calculate offset

        const offset = await PartnerizeTrackingLink.countDocuments({})


        const url = `https://api.partnerize.com/v2/publishers/${partnerizePublisherId}/links${offset > 0 ? `?offset=${offset}` : ""}`;

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

        console.log(`================data==================`, data?.links)

        if(data?.links){
            await builkWriteToDB(data?.links)
            console.log(chalk.bgCyan('Partnerize Links added to DB'))
        }

        return true
    } catch (error) {
        console.error('Error:', error.message);
        return null
    }


}



const builkWriteToDB = async (data) => {

    if(Array.isArray(data) && data?.length <= 0) {
        console.log(chalk.bgRedBright('Data is not an ARRAY or is an EMPTY ARRAT.'))
    }


      const formattedData = data?.map(item => {
    
                    return {
                        updateOne: {
                            filter: item,
                            update: { $set: item },
                            upsert: true
                        }
                    }
                });
    
                const DBResponse = await PartnerizeTrackingLink.bulkWrite(formattedData);
                console.log(DBResponse)
}




export const createTrackingLink = async (payload) => {

    try {

        const url = `https://api.partnerize.com/v2/publishers/${partnerizePublisherId}/links`;

        const headers = {
            'Accept': 'application/json',
            'Authorization': `Basic ${partnerizeAuthToken}`
        };

        const body = JSON.stringify(payload)

        const response = await fetch(url, { method: 'POST', headers, body });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // console.log(`================data==================`, data?.link)

        if(data?.link){
            const result = await PartnerizeTrackingLink.create(data?.link)
            console.log(chalk.bgCyan('Partnerize Link added to DB'))
            return result
        } else {
            return {status: false, message: "There was an issue creating the tracking link, try again later."}
        }

    } catch (error) {
        console.error(chalk.bgRedBright.whiteBright('Error:', error.message))
        return null
    }


}




export const addTrackingLinkToDB = asyncHandler(async (req, res, next) => {
    const { campaign_id, destination_url, active } = req.body;

    if (!campaign_id || !destination_url || !active) {
        return res.status(400).json({ success: false, message: "campaign_id , destination_url & active are required" });
    }

    const trackingLinkExists = await PartnerizeTrackingLink.findOne({ destination_url });

    if (trackingLinkExists) {
        return res.status(400).json({ success: false, message: "Tracking link already exists" });
    }

    const tracking = await createTrackingLink(req?.body)

    res.status(201).json({ success: true, message: "Tracking link added successfully", tracking });
});

export const getTrackingLinkByProgramId = asyncHandler(async (req, res, next) => {
    const { ProgramId } = req.params;

    if (!ProgramId) {
        return res.status(400).json({ success: false, message: "ProgramId is required" });
    }

    const trackingLinks = await TrackingLinks.find({ ProgramId: ProgramId });

    if (!trackingLinks) {
        return res.status(404).json({ success: false, message: "Tracking link not found for this program" });
    }

    res.status(200).json({ success: true, trackingLinks });
});


export const getTrackingLinks = asyncHandler(async (req, res) => {
    const result = await PartnerizeTrackingLink.find({})

    res.status(200).json({data: result})
})