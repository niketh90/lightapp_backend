'use strict';

var express = require('express');
var router = express.Router();

var users = require('../controllers/users/users.authentication.server.controller'),
	userscrud = require('../controllers/users/users.crud.server.controller'),
	auth = require('../controllers/users/users.authorization.server.controller'),
	session = require('../controllers/users/session.detail.server.controller'),
	userPassword = require('../controllers/users/users.password.server.controller'),
	author = require('../controllers/users/author.details.server.controller'),
	rating = require('../controllers/users/rating.detail.server.controller'),
	category = require('../controllers/users/category.detail.sever.controller'),
	// tokenHandler = require('../controllers/tokenhandling.controllers'),
	privacy = require('../controllers/users/static'),
	verification = require('../controllers/users/receipt.server.controller')


router.route('/signup')
	.post(users.signup);

router.route("/login")
	.post(users.signin);

router.route("/loginadmin")
	.post(users.signInAdmin);


router.route("/adminemail")
	.patch(auth.hasAuthentcation(), users.changeEmailAdmin);

router
	.post('/auth/google', users.googleSignIn);

// Facebook Signin
router
	.post('/auth/facebook', users.facebookSignin);

router.route('/auth/apple')
	.post(users.appleSignIn);

router.route('/setpassword')
	.post(auth.hasAuthentcation(), userscrud.setPassword)

router.route('/updateprofile')
	.patch(auth.hasAuthentcation(), userscrud.updateProfile)

// router.route('/changeemail')
// 	.post(auth.hasAuthentcation(), userscrud.changeEmailAddress)


router.route('/admin')
	.get(auth.hasAuthentcation(), userscrud.getAdmin)

router.route('/createsession')
	.post(auth.hasAuthentcation(), session.addNewSession)

router.route('/getallsessions')
	.post(auth.hasAuthentcation(), session.getAllSessions)

router.route('/getallsessionsadmin')
	.get(auth.hasAuthentcation(), session.getSessionsAdmin)
router.route('/getsession/web/:id')
	.get(auth.hasAuthentcation(), session.getOneSessionForWeb)

router.route('/getsessions')
	.post(auth.hasAuthentcation(), session.getSessions)


router.route('/users')
	.get(auth.hasAuthentcation(), userscrud.getUsersList)

router.route('/updateprofilepic')
	.post(auth.hasAuthentcation(), users.updateProfilePicture);


router.route('/signout')
	.post(auth.hasAuthentcation(), users.signout);
router.route('/signoutadmin')
	.delete(auth.hasAuthentcation(), users.signoutAdmin);

router.route('/forgot-password')
	.post(userPassword.forgot);

router.route('/auth/verify/:token')
	.get(users.validateVerifyToken);



router.route('/auth/reset/:token')
	.get(userPassword.validateResetToken);

router.route('/auth/reset-password/:token')
	.post(userPassword.reset);

router.route('/password/reset/:token')
	.patch(userPassword.reset);

router.route('/success')
	.get(userPassword.success);

router.route('/verificationsuccess')
	.get(users.success)

router.route('/password-error')
	.get(userPassword.error);


router.route('/deleteuser/:id')
	.delete(auth.hasAuthentcation(), userscrud.deleteUser)


router.route('/change-password')
	.patch(auth.hasAuthentcation(), users.changePassword);

router.route('/addauthor')
	.post(auth.hasAuthentcation(), author.addAuthor)

router.route('/authors')
	.get(auth.hasAuthentcation(), author.getAllAuthors)

router.route('/deleteauthor/:id')
	.patch(auth.hasAuthentcation(), author.deleteAuthor)


router.route('/editauthor/:id')
	.patch(auth.hasAuthentcation(), author.editAuthor)

router.route('/getauthor/:id')
	.get(auth.hasAuthentcation(), author.getAuthor)

router.route('/getsession/:id')
	.get(auth.hasAuthentcation(), session.getOneSession)

router.route('/getsession/web/:id')
	.get(auth.hasAuthentcation(), session.getOneSessionForWeb)

router.route('/deletesession/:id')
	.delete(auth.hasAuthentcation(), session.deleteSession)


router.route('/editsession/:id')
	.patch(auth.hasAuthentcation(), session.editSession)

router.route('/ratesession')
	.post(auth.hasAuthentcation(), rating.rateSession);

router.route('/updatestats')
	.post(auth.hasAuthentcation(), userscrud.updateStats);

router.route('/addcategory')
	.post(auth.hasAuthentcation(), category.addNewCategory)

router.route('/categories')
	.get(auth.hasAuthentcation(), category.getAllCategories)

router.route('/deletecategory/:id')
	.patch(auth.hasAuthentcation(), category.deleteCategory)

router.route('/editcategory/:id')
	.patch(auth.hasAuthentcation(), category.editCategory)

router.route('/getcategory/:id')
	.get(auth.hasAuthentcation(), category.getCategory)

router.route('/socialsetpassword')
	.post(auth.hasAuthentcation(), userscrud.setPassword);

router.route('/upload')
	.post(auth.hasAuthentcation(), session.uploadVideo)

router.route('/uploadthumbnail')
	.post(auth.hasAuthentcation(), session.uploadThumbNail)

router.route('/privacy')
	.get(privacy.getPrivacyPolicy);

router.route('/uploadthumbnail')
	.post(auth.hasAuthentcation(), session.uploadThumbNail)

router.route('/terms')
	.get(privacy.getTermsAndConditions);

router.route('/getsessionstats/:sessionId')
	.get(auth.hasAuthentcation(), session.getSessionStats);


router.route('/sessionwise/:sessionId')
	.post(auth.hasAuthentcation(), session.sessionWiseStats);

router.route('/authorwise/:authorId')
	.post(auth.hasAuthentcation(), session.authorWiseStats);


router.route('/androidverify')
	.post(auth.hasAuthentcation(), verification.verifyAndroidReceipt);


router.route('/savereceipt')
	.post(auth.hasAuthentcation(), verification.saveReceipt);

router.route('/iosverify')
	.post(auth.hasAuthentcation(), verification.verifyReceiptIOS);

router.route('/subscriptions')
	.get(auth.hasAuthentcation(), verification.getAllSubscriptions);



module.exports = router;
