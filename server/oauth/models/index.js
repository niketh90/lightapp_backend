var users = require('./users.server.model'),
    adminProfile =  require('./admin.profiles.server.model'),
    sessions = require('./session.server.model'),
    authors = require('./author.profile.server.models'),
    ratings = require('./session.rating.server.model'),
    sessionstats = require('./user.stats.server.model'),
    video = require('./video.server.model'),
    category = require('./category.server.model'),
    privacy = require('./privacy.server.model'),
    condition = require('./terms.server.model'),
    purchase = require('./inapp.server.model'),

    models = {
        users,
        adminProfile,
        sessions,
        authors,
        ratings,
        sessionstats,
        video,
        category,
        privacy,
        condition,
        purchase
    }
module.exports = models;