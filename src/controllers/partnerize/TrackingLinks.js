import chalk from "chalk"
import PartnerizeTrackingLink from "../../models/partnerize/trackingLinks.js"
import { asyncHandler } from "../../utils/errors/asyncHandler.js"
import axios from 'axios'

const partnerizePublisherId = process.env.PARTNERIZE_PUBLISHER_ID || '1100l286361'
const partnerizeAuthToken = process.env.PARTNERIZE_AUTH_TOKEN || 'cDN0ZXcxNDV5M3RhZzQxbjpOWnRCMTFrMg'

export const fetchTrackingLinks = async () => {
    try {
        // Checking size of tracking links in DB to calculate offset
        const offset = await PartnerizeTrackingLink.countDocuments({});

        const url = `https://api.partnerize.com/v2/publishers/${partnerizePublisherId}/links${offset > 0 ? `?offset=${offset}` : ""}`;

        console.log('partnerize tracking link url:', url);

        const headers = {
            'Accept': 'application/json',
            'Authorization': `Basic ${partnerizeAuthToken}`,
            'User-Agent': 'Axios/Node.js'  // Optional, can help with API compatibility
        };

        const response = await axios.get(url, { headers });

        const data = response.data;

        if (data?.links) {
            await builkWriteToDB(data.links);
            console.log(chalk.bgCyan('Partnerize Links added to DB'));
        }

        return true;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code out of the 2xx range
            console.error('Partnerize API Error:', error.response.status, error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from Partnerize:', error.request);
        } else {
            // Something else happened in setting up the request
            console.error('Error:', error.message);
        }
        return null;
    }
};



const builkWriteToDB = async (data) => {

    if(Array.isArray(data) && data?.length <= 0) {
        console.log(chalk.bgRedBright('Data is not an ARRAY or is an EMPTY ARRAY.'))
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

        console.log(response)
        if (!response.ok) {
            const errorStatus = response.status;
            const errorBodyText = await response.text(); // Read the error body
            console.error(chalk.red(`--- Partnerize API Error (Status: ${errorStatus}) ---`)); // <<< THIS LOG
            console.error(chalk.red('Raw Error Body:'), errorBodyText); // <<< AND THIS LOG
            console.error(chalk.red('---------------------------------------------------'));

            // ... rest of the error handling
            throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorJson.message || errorBodyText}`);
        }

        const data = await response.json();

        console.log(`================data create TrackLink==================`, data?.link)

        if(data?.link){
            const result = await PartnerizeTrackingLink.create(data?.link)
            console.log(chalk.bgCyan('Partnerize Link added to DB'))
            return result
        } else {
            return {status: false, message: "There was an issue creating the tracking link, try again later."}
        }

    } catch (error) {
        console.error(chalk.bgRedBright.whiteBright('Error:', error))
        return {statue: false, message: "Error creating Tracking Link, please try again later."}
    }


}


export const addTrackingLinkToDB = asyncHandler(async (req, res, next) => {
    let { campaign_id, destination_url, active } = req.body; // Use let to modify destination_url

    if (!campaign_id || !destination_url || typeof active === 'undefined') {
        return res.status(400).json({ success: false, message: "campaign_id, destination_url & active are required" });
    }

    // --- URL Validation/Modification ---
    if (!destination_url.startsWith('http://') && !destination_url.startsWith('https://')) {
        destination_url = 'https://' + destination_url; // Prepend https by default
        console.log(chalk.yellow(`destination_url modified to: ${destination_url}`));
    }
    // --- End URL Validation/Modification ---


    const trackingLinkExists = await PartnerizeTrackingLink.findOne({ destination_url });
    if (trackingLinkExists) {
        return res.status(400).json({ success: false, message: "Tracking link already exists with this destination URL" });
    }

    // Construct the payload with the potentially modified destination_url
    const payloadForPartnerize = {
        campaign_id,
        destination_url, // Use the (potentially modified) destination_url
        active
        // Add any other fields the Partnerize API expects for link creation
    };

    const creationResult = await createTrackingLink(payloadForPartnerize);

    if (creationResult && creationResult._id) {
        res.status(201).json({ success: true, message: "Tracking link created and added successfully", data: creationResult });
    } else if (creationResult && creationResult.status === false) {
        res.status(creationResult.statusCode || 500).json({ success: false, message: creationResult.message || "Error creating tracking link via Partnerize.", errorBody: creationResult.errorBody });
    } else {
        res.status(500).json({ success: false, message: "An unexpected error occurred while creating the tracking link." });
    }
});



export const getTrackingLinkByCampaignId = asyncHandler(async (req, res, next) => {
    const { campaign_id } = req.params;

    if (!campaign_id) {
        return res.status(400).json({ success: false, message: "CampaignId is required" });
    }

    const trackingLinks = await PartnerizeTrackingLink.find({ campaign_id: campaign_id });

    if (!trackingLinks) {
        return res.status(404).json({ success: false, message: "Tracking link not found for this Campaign" });
    }

    res.status(200).json({ success: true, trackingLinks });
});


export const getTrackingLinks = asyncHandler(async (req, res) => {
    const result = await PartnerizeTrackingLink.find({})

    res.status(200).json({data: result})
})


export const deleteTrackingLink = asyncHandler(async (req, res) => {
    const {id} = req?.params
    if(!id) return res.status(500).json({status: false, message: "ID not provided"})

    const result = await PartnerizeTrackingLink.findByIdAndDelete(id)
    return res.status(200).json({message: "Link deleted successfully", result})
})