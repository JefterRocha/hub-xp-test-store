import { Types, Schema } from 'mongoose';

export const orderSchema = new Schema({
    date: { type: Date, default: Date.now },
    total: { type: Number, required: true },
    productIds: [{ type: 'ObjectId', ref: 'Product' }],
});
