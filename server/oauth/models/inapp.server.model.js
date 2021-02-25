'use strict';

let mongoose = require('./db.server.connect'),
	Schema = mongoose.Schema;

let PurchaseSchema = new Schema({
    userId:{
    type: Schema.Types.ObjectId,
    ref: 'User'
    },
    subscriptionType:{
        type: String,
        default:"android"
    },
    metaData:{
        orderId:{
            type:String
        },
        packageName:{
            type:String
        },
        productId:{
            type:String
        },
        purchaseTime:{
            type:Date
        },
        purchaseState:{
            type:Number    
        },
        purchaseToken:{
            type:String
        },
        autoRenewing:{
            type:Boolean},
        acknowledged:{
            type:Boolean}
    },
    androidReceiptDetails:{
            startTimeMillis: {
                type: Number
            },
            expiryTimeMillis: {
                type:Number
            },
            autoRenewing:{
                type:Boolean
            } ,
            priceCurrencyCode: 
            {
                type:String,
            },
            priceAmountMicros:
            {
                type: String
            } ,
            
            countryCode: {
                type:String
            },
            developerPayload: 
            {
                type:String
            },
            cancelReason:
            {
                type:Number

            } ,
            orderId:
            {
                type:String
            } ,
            purchaseType:
            {
                type:Number
            } ,
            acknowledgementState:
            {
                type:Number

            } ,
            kind: 
        {
            type:String

        }       

    },
    file:{
        type:String
    },
    iosReceiptDetails:{
        transactionId: {
            type:String
        },
        originalTransactionId: {
            type:String
        },
        bundleId: {
            type:String
        },
        productId: {
            type:String
        },
        purchaseDate: 
        {
            type:Number
        },
        expirationDate: {
            type:Number
        },
        quantity: {
            type:Number
        }
    }
});


module.exports = mongoose.model('purchase', PurchaseSchema );