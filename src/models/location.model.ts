import { LocationTypeEnum,ILocation } from '../common';

import mongoose, { Model } from 'mongoose';

type locationModel = Model<ILocation>;

const locationSchema = new mongoose.Schema<ILocation>(
    {
        country: {
            type: String,
        },
        city: {
            type: String,
        },
        postalCode: {
            type: String,
        },
        ipv4: {
            type: String,
        },
        ipv6: {
            type: String,
        },
        geo: {
            lat: {
                type: String,
            },
            lng: {
                type: String,
            },
        },
        region: {
            type: String,
        },
        continent: {
            type: String,
        },
        timezone: {
            type: String,
        },
        os: {
            type: String,
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
        donation: {
            type: mongoose.Schema.ObjectId,
            ref: 'Donation',
        },
        type: {
            type: String,
            enum: Object.values(LocationTypeEnum),
            default: LocationTypeEnum.SIGNIN,
        },
    },
    { timestamps: true }
);

export const locationModel = (mongoose.models.Location as locationModel) || mongoose.model('Location', locationSchema);
