'use strict';

/**
 * Module dependencies.
 */
let mongoose = require('./db.server.connect'),
    Schema = mongoose.Schema,
    _ = require('underscore'),
    crypto = require('crypto'),
    appConstants=require('../../constansts'),
	config = require('../../config.server');

/**
 * A Validation function for local strategy password
 */
let validateLocalStrategyPassword = function (password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
let UserSchema = new Schema({
	email: {
		type: String,
		trim: true,
        default: '',
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        // match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        // unique: true
	},
	firstName: {
		type: String,
	},
	lastName: {
		type: String,
	},
	isVerified: {
		type: Boolean,
		default:false,
    },
    profileImage:{
        type:String,
        max :255,
        default: ""
    },
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	verifyEmailToken:{
		type: String
	},
	verifyEmailExpires:{
		type: Date
	},
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
    },
    provider:{
        type: String,
    },
    
	facebookProvider: {
        type: {
            id: String,
            token: String,
            displayName: String,
            gender: String,
        },
        select: false
    },
    googleProvider: {
        type: {
            id: String,
            // token: String,
            name: String,
            email_verified: String,
            picture: String,
            locale: String
        },
        select: false
    },
    iosProvider:{
        type: {
            id: String,
        },
        select: false

    },
	deviceDetails: {
        deviceType: {
            type: Number, enum: [
                appConstants.DEVICE_TYPES.IOS,
               appConstants.DEVICE_TYPES.ANDROID,
            ],
            default:appConstants.DEVICE_TYPES.ANDROID
        },
        deviceToken: { type: String, trim: true ,default:""}
	},
	salt: {
		type: String
	},
	roles: {
		type: [{
			type: Number,
			enum: [config.roles.admin, config.roles.user]
		}],
		required: "User must assigned a role"
	},
	userData: {
		model: { type: String },
		data: { type: Schema.ObjectId, refPath: 'userData.model' }
	},
	isDeleted: {
		type: Boolean,
		default: false
    },
    healingTime:{
        type:Number,
        default: 0
    },
    healingDays:{
        type: Number,
        default: 0
    },
    currentStreak:{
        type: Number,
        default: 0
    },
    lastPlayed:{
        type: Date,
        default:0
    },
    dailyReminder:{
        type: String,
        default:""
    },
    isPasswordSet:{
        type: Boolean,
        default:false
    }
  
    // currentStreak:[
    // ]
});
/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
	if (this.password && this.password.length > 3) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}
	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
	return this.password === this.hashPassword(password);
};

//Google User
UserSchema.statics.upsertGoogleUser = function (accessToken, profile, deviceTokens, cb) {
    var that = this;
    return this.findOne({
        'googleProvider.id': profile.sub
    }, function (err, user) {
        // no user was found, lets create a new one
        if (!user) {
            var newUser = new that({
                roles:[2],
                firstName: "",
                lastName: "",
                isPasswordSet:false,
                isVerified:true,
                email: profile.email,
                // name: profile.name,
                googleProvider: {
                    id: profile.sub,
                    // token: accessToken,
                    name: profile.name,
                    email_verified: profile.email_verified,
                    picture: profile.picture,
                    locale: profile.locale
                },
                provider: 'google',
                deviceTokens,
            });
            newUser.save(function (error, savedUser) {
                if (error) {
                    console.log(error);
                } 
                return cb(error, savedUser);
            });
        } else {
            let deiveTokens = user.deviceTokens || [];

            // Push the token if not exists
            if (_.findWhere(deiveTokens, deviceTokens) == null) {
                deiveTokens.push(deviceTokens);
            }

            that.findOneAndUpdate({ _id: user._id }, { $set: { deviceTokens: deiveTokens } }, function (err, user) {
                return cb(err, user);
            })
        }
    });
};

//Facebook User

UserSchema.statics.upsertFbUser = function (accessToken, profile, deviceTokens, cb) {
    var that = this;
    return this.findOne({
        'facebookProvider.id': profile.id
    }, function (err, user) {
        // console.log("Profile here". user)
        if (!user) {
            var newUser = new that({
                roles:[2],
                firstName: "",
                lastName: "",
                isVerified:true,
                isPasswordSet:false,
                // email:"" ,
                email: profile.email,
                name: profile.name,
                facebookProvider: {
                    id: profile.id,
                    token: accessToken,
                    name: profile.name,
                },
                provider: 'facebook',
                deviceTokens,               
            });
            newUser.save(function (errorsave, savedUser) {
                
                if (errorsave) {
                    console.log(errorsave);
                }
                // console.log("SavedUser", savedUser)

                return cb(errorsave, savedUser);
            });
        } else {
          
            let deiveTokens = profile.id.deviceTokens || [];

            if (_.findWhere(deiveTokens, deviceTokens) == null) {
                deiveTokens.push(deviceTokens);
            }

            that.findOneAndUpdate({ _id: user.id }, { $set: { deviceTokens: deiveTokens } },{new: true},(err, res)=> {
          
                return cb(err, res );
            })
        }
    });
};


// IOS Login


module.exports = mongoose.model('User', UserSchema);