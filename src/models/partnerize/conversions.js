import mongoose from "mongoose";

const ConversionSchema = new mongoose.Schema(
    {
        conversion_time: { type: Date, required: true },
    },
    { strict: false, timestamps: true }
);


// Ensure conversion_time is converted to a Date before saving or updating
ConversionSchema.pre("save", function (next) {
    if (this.conversion_time && !(this.conversion_time instanceof Date)) {
        this.conversion_time = new Date(this.conversion_time);
    }
    next();
});

ConversionSchema.pre("updateOne", function (next) {
    if (this._update.$set?.conversion_time && !(this._update.$set.conversion_time instanceof Date)) {
        this._update.$set.conversion_time = new Date(this._update.$set.conversion_time);
    }
    next();
});

ConversionSchema.pre("insertMany", function (next, docs) {
    docs.forEach((doc) => {
        if (doc.conversion_time && !(doc.conversion_time instanceof Date)) {
            doc.conversion_time = new Date(doc.conversion_time);
        }
    });
    next();
});


const ConversionModel = mongoose.model("PartnerizeConversions", ConversionSchema, "PartnerizeConversions");

export default ConversionModel;


// {
//     "conversion_data": {
//         "conversion_id": "111111l314",
//         "campaign_id": "1011l5709",
//         "publisher_id": "1100l286361",
//         "conversion_time": "2025-04-01 17:18:33",
//         "creative_type": 0,
//         "creative_id": 0,
//         "specific_creative_id": 0,
//         "currency": "USD",
//         "publisher_reference": "",
//         "advertiser_reference": "adrefd",
//         "conversion_reference": "AUTO-5ebc127cb2ddf3.85382959",
//         "customer_type": null,
//         "referer_ip": "265c:5b77:7721:e466:9e91:cf97:9b7a:b1f1",
//         "source_referer": "",
//         "last_modified": "2025-04-01 18:31:42",
//         "conversion_type": 1,
//         "country": "ES",
//         "customer_reference": "custrefa",
//         "ref_device_id": 2,
//         "ref_partnership_model_id": 2,
//         "ref_traffic_source_id": 3,
//         "ref_conversion_metric_id": 2,
//         "ref_user_context_id": 2,
//         "campaign_title": "rubycampaignsuvwlynm",
//         "publisher_name": "syjmmcll",
//         "click": {
//                 "campaign_id": "1011l5709",
//                 "publisher_id": "1100l286361",
//                 "type": "standard",
//                 "status": "fresh",
//                 "set_time": "2025-04-01 11:34:51",
//                 "set_ip": "22c6:8631:d1d:cf53:4c48:9817:8d43:3fd",
//                 "last_used": "2025-04-01 11:34:51",
//                 "last_ip": "22c6:8631:d1d:cf53:4c48:9817:8d43:3fd",
//                 "publisher_reference": "",
//                 "referer": "",
//                 "creative_id": 0,
//                 "creative_type": 0,
//                 "specific_creative_id": 0,
//                 "ref_device_id": 1,
//                 "ref_traffic_source_id": 3,
//                 "ref_partnership_model_id": 2,
//                 "ref_user_context_id": 1,
//                 "ref_origin_id": 1,
//                 "clickref": "1011lArirIhd"
//         },
//         "ref_conversion_metric": "Standard",
//         "ref_device": "Desktop",
//         "ref_partnership_model": "CPA",
//         "ref_traffic_source": "Affiliate",
//         "ref_user_context": "Web",
//         "conversion_value": {
//             "conversion_status": "pending",
//             "value": 955,
//             "publisher_commission": 95.5
//         },
//         "meta_data": {
//             "gclid": "adword_google_meta_data"
//         },
//         "conversion_items": [
//             {
//                 "conversion_item_id": "111111l314",
//                 "sku": 123,
//                 "category": "Producte",
//                 "item_value": 955,
//                 "item_publisher_commission": 95.5,
//                 "item_status": "pending",
//                 "last_update": "2025-04-01 17:17:04",
//                 "publisher_self_bill_id": null,
//                 "approved_at": null,
//                 "item_status_id": 1,
//                 "reject_reason": null,
//                 "voucher_codes": [],
//                 "meta_data": {
//                     "gclid": "adword_google_meta_data"
//                 },
//                 "payable": false
//             }
//         ],
//         "was_disputed": false,
//         "conversion_lag": 0,
//         "clickref": "1011lArirIhd"
//     }
// }