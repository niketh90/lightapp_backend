
const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const privacyPolicySchema = new Schema({
    privacyPolicyHtml: {
        type: String
    },
    version: {
        type: Number,
        default: 1
    },
    webUrl:{
        type: String
        }
    
},{ timestamps: true });

let privacyPolicyModel = Mongoose.model('privacyPolicy', privacyPolicySchema);

privacyPolicyModel
    .update({

    }, {

        $set: {
            privacyPolicyHtml: `<!doctype html>
            <html lang="en">
            
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
              <title>Light Privacy and Policy</title>
              <style> 
              #color{
                color:white;
              }
              
              .Center { 
                  width:200px; 
                  height:200px; 
                  position: fixed; 
                  bottom: 70%; 
                  left: 50%; 
                  margin-left: -100px;
                
              } 
              .my_text
              {
                  font-family:    Museo sans, rounded;
                  font-size:      15px;
            
              }
              body {
               
                    height: 200px;      
                    background-image: linear-gradient(-90deg, #4A96D4,#6EDACC); /* Standard syntax (must be last) */
                               
              }
             
          </style> 
            
            </head>
            
            <body>
          
              <div id = "color" class = "my_text" >
                <div id= "color">
                <b>Privacy Policy</b><br>
                Effective Date: 05/01/2020<br>
                Applicable To The Following Mobile Application:<br>
                    <b>Light</b>
                </div>
                <h4>Article 1 - DEFINITIONS</h4>
                <p>
                a) APPLICABLE MOBILE APPLICATION: This Privacy Policy will refer to and be applicable to the Mobile App listed above, which shall hereinafter be referred to as "Mobile App." <br><br>
                b) EFFECTIVE DATE: "Effective Date" means the date this Privacy Policy comes into force and effect. <br><br>
                c) PARTIES: The parties to this privacy policy are the following data controller: Light Inc. ("Data Controller") and you, as the user of this Mobile App. Hereinafter, the parties will individually be referred to as "Party" and collectively as "Parties." <br><br>
                d) DATA CONTROLLER: Data Controller is the publisher, owner, and operator of the Mobile App and is the Party responsible for the collection of information described herein. Data Controller shall be referred to either by Data Controller's name or "Data Controller," as listed above. If Data Controller or Data Controller's property shall be referred to through first-person pronouns, it shall be through the use of the following: us, we, our, ours, etc. <br><br>
                e) YOU: Should you agree to this Privacy Policy and continue your use of the Mobile App, you will be referred to herein as either you, the user, or if any second-person pronouns are required and applicable, such pronouns as 'your", "yours", etc. <br><br>
                f) GOODS: "Goods" means any goods that we make available for sale on the Mobile App.<br><br>
                g) SERVICES: "Services" means any services that we make available for sale on the Mobile App.<br><br>
                h) PERSONAL DATA: "Personal DATA" means personal data and information that we obtain from you in connection with your use of the Mobile App that is capable of identifying you in any manner.<br><br>
                </p>

                <h4>Article 2 - GENERAL INFORMATION:</h4>
                <p>
                This privacy policy (hereinafter "Privacy Policy") describes how we collect and use the Personal Data that we receive about you, as well as your rights in relation to that Personal Data, when you visit our Mobile App or purchase our Goods or use our Services.<br><br>
This Privacy Policy does not cover any information that we may receive about you through sources other than the use of our Mobile App. The Mobile App may link out to other websites or mobile applications, but this Privacy Policy does not and will not apply to any of those linked websites or applications.<br><br>
We are committed to the protection of your privacy while you use our Mobile App.<br><br>
By continuing to use our Mobile App, you acknowledge that you have had the chance to review and consider this Privacy Policy, and you acknowledge that you agree to it. This means that you also consent to the use of your information and the method of disclosure as described in this Privacy Policy. If you do not understand the Privacy Policy or do not agree to it, then you agree to immediately cease your use of our Mobile App.                <br><br>
                </p>
                <h4>Article 3 - Contact:</h4>
                <p>
                The Party responsible for the processing of your personal data is as follows: Light Inc, registered in Ontario, Canada. The Data Controller and operator of the Mobile App are one and the same.
                </p>

                <h4>Article 4 - LOCATION:</h4>
                <p>
                The location where the data processing activities take place is in Ontario, Canada
                </p>
                <h4>Article 5 - MODIFICATIONS AND REVISIONS::</h4>
                <p>
                We reserve the right to modify, revise, or otherwise amend this Privacy Policy at any time and in any manner. If we do so, however, we will notify you timely. We also encourage you to periodically check this page for any such modification, revision or amendment.
                </p>
                <h4>Article 6 - THE PERSONAL DATA WE RECEIVE FROM YOU:</h4>
                <p>
                Depending on how you use our Mobile App, you will be subject to different types of Personal Data collected and different manners of collection:<br><br>
<b>a) Registered users:</b> You, as a user of the Mobile App, may be asked to register in order to use the Mobile App or to purchase the Goods and/or Services available for sale.<br><br>
During the process of your registration, we will collect the following Personal Data from you through your voluntary disclosure:<br><br>
First and last name and email address<br><br>
Personal Data may be asked for in relation to:<br><br>
I) Interaction with our representatives in any way<br><br>
II) making purchases<br><br>
III) receiving notifications about marketing<br><br>
IV) receiving general emails from us<br><br>
V) commenting on our content or other user-generated content on our Mobile App, such as meditation ratings, providing Mobile app feedback or other similar features<br><br>
VI) Or the following other forms of participation:<br><br>
Rating a meditation
Saving a meditation as a favorite
Inviting others to try the Mobile app<br><br>
By undergoing the registration process, you consent to us collecting your Personal Data, including the Personal Data described in this clause, as well as storing, using or disclosing your Personal Data in accordance with this Privacy Policy.<br><br>
<b> b) Unregistered users:</b> If you are a passive user of the Mobile App and do not register for any purchases or other service, you may still be subject to certain passive data collection ("Passive Data Collection"). Such Passive Data Collection may include through cookies, as described below, IP address information, location information, and certain browser data, such as history and/or session information.<br><br>
<b>c) All users:</b> The Passive Data Collection that applies to Unregistered users shall also apply to all other users and/or visitors of our Mobile App.<br><br>
<b>d) Sales & Billing Information:</b> Light Inc. does not collect or process credit or debit card (“Payment Card”) data. Apple and Google collect Payment Card data with respect to in-app purchases made through the Apps.<br><br>
<b>e) Email Marketing: </b>You may be asked to provide certain Personal Data, such as your name and email address, for the purpose of receiving email marketing communications. This information will only be obtained through your voluntary disclosure and you will be asked to affirmatively opt-in to email marketing communications.<br><br>
<b>f) User Experience: </b>From time to time we may request information from you to assist us in improving our Mobile App, and the Goods and Services we sell, such as demographic information or your particular preferences.<br><br>
<b>g) Content Interaction: </b>Our Mobile App may allow you to comment on the content that we provide or the content that other users provide. If so, we may collect some Personal Data from you at that time, such as, but not limited to, username or email address.<br><br>
<b>h) Combined or Aggregated Information: </b>We may combine or aggregate some of your Personal Data in order to better serve you and to better enhance and update our Mobile App for your and other consumers' use.<br><br>
We may also share such aggregated information with others, but only if that aggregated information does not contain any Personal Data.
                </p>
                <h4>Article 7 - THE PERSONAL DATA WE RECEIVE AUTOMATICALLY:</h4>
                <p>
                Cookies: We may collect information from you through automatic tracking systems (such as information about your browsing preferences) as well as through information that you volunteer to us (such as information that you provide during a registration process or at other times while using the Mobile App, as described above). <br><br>
For example, we use cookies to make your browsing experience easier and more intuitive: cookies are small strings of text used to store some information that may concern the user, his or her preferences or the device they are using to access the internet (such as a computer, tablet, or mobile phone). Cookies are mainly used to adapt the operation of the site to your expectations, offering a more personalized browsing experience and memorizing the choices you made previously.<br><br>
A cookie consists of a reduced set of data transferred to your browser from a web server and it can only be read by the server that made the transfer. This is not executable code and does not transmit viruses.<br><br>
Cookies do not record or store any Personal Data. If you want, you can prevent the use of cookies, but then you may not be able to use our Mobile App as we intend. To proceed without changing the options related to cookies, simply continue to use our Mobile App.<br><br>
Technical cookies: Technical cookies, which can also sometimes be called HTML cookies, are used for navigation and to facilitate your access to and use of the site. They are necessary for the transmission of communications on the network or to supply services requested by you. The use of technical cookies allows the safe and efficient use of the site.<br><br>
You can manage or request the general deactivation or cancelation of cookies through your browser. If you do this though, please be advised this action might slow down or prevent access to some parts of the site.<br><br>
Cookies may also be retransmitted by an analytics or statistics provider to collect aggregated information on the number of users and how they visit the Mobile App. These are also considered technical cookies when they operate as described.<br><br>
Temporary session cookies are deleted automatically at the end of the browsing session - these are mostly used to identify you and ensure that you don't have to log in each time - whereas permanent cookies remain active longer than just one particular session.<br><br>
Third-party cookies: We may also utilize third-party cookies, which are cookies sent by a third-party to your computer. Permanent cookies are often third-party cookies. The majority of third-party cookies consist of tracking cookies used to identify online behavior, understand interests and then customize advertising for users.<br><br>
Third-party analytical cookies may also be installed. They are sent from the domains of the aforementioned third parties external to the site. Third-party analytical cookies are used to detect information on user behavior on our Mobile App. This place anonymously, in order to monitor the performance and improve the usability of the site. Third-party profiling cookies are used to create profiles relating to users, in order to propose advertising in line with the choices expressed by the users themselves.<br><br>
Profiling cookies: We may also use profiling cookies, which are those that create profiles related to the user and are used in order to send advertising to the user's browser.<br><br>
When these types of cookies are used, we will receive your explicit consent.<br><br>
Support in configuring your browser: You can manage cookies through the settings of your browser on your device. However, deleting cookies from your browser may remove the preferences you have set for this Mobile App.<br><br>
Log Data: Like all websites and mobile applications, this Mobile App also makes use of log files that store automatic information collected during user visits. The different types of log data could be as follows:<br><br>
- internet protocol (IP) address;
- type of browser and device parameters used to connect to the Mobile App;
- name of the Internet Service Provider (ISP);
- date and time of visit;
- web page of origin of the user (referral) and exit;
- possibly the number of clicks.<br><br>
The aforementioned information is processed in an automated form and collected in an exclusively aggregated manner in order to verify the correct functioning of the site, and for security reasons. This information will be processed according to the legitimate interests of the Data Controller.<br><br>
For security purposes (spam filters, firewalls, virus detection), the automatically recorded data may also possibly include Personal Data such as IP address, which could be used, in accordance with applicable laws, in order to block attempts at damage to the Mobile App or damage to other users, or in the case of harmful activities or crime. Such data are never used for the identification or profiling of the user, but only for the protection of the Mobile App and our users. Such information will be treated according to the legitimate interests of the Data Controller.<br><br>
                </p>
                <h4>Article 8 - THIRD PARTIES::</h4>
                <p>
                We may utilize third-party service providers ("Third-Party Service Providers"), from time to time or all the time, to help us with our Mobile App, and to help serve you.<br><br>
We may use Third-Party Service Providers to assist with information  (such as cloud storage).<br><br>
We may provide some of your Personal Data to Third-Party Service Providers in order to help us track usage data, such as referral websites, dates and times of page requests, etc. We use this information to understand patterns of usage of, and to improve, the Mobile App.<br><br>
We may use Third-Party Service Providers to host the Mobile App. In this instance, the Third-Party Service Provider will have access to your Personal Data.<br><br>
We may use Third-Party Service Providers to fulfill orders in relation to the Mobile App.<br><br>
We may allow third parties to advertise on the Mobile App. These third parties may use cookies in connection with their advertisements (see the "Cookies" clause in this Privacy Policy).<br><br>
We only share your Personal Data with a Third-Party Service Provider if that provider agrees to our privacy standards as set out in this Privacy Policy.<br><br>
Your Personal Data will not be sold or otherwise transferred to other third parties without your approval.<br><br>
Notwithstanding the other provisions of this Privacy Policy, we may provide your Personal Data to a third party or to third parties in order to protect the rights, property or safety, of us, our customers or third parties, or as otherwise required by law.<br><br>
We will not knowingly share your Personal Data with any third parties other than in accordance with this Privacy Policy.<br><br>
If your Personal Data might be provided to a third party in a manner that is other than as explained in this Privacy Policy, you will be notified. You will also have the opportunity to request that we not share that information.<br><br>
In general, you may request that we do not share your Personal Data with third parties. Please contact us via email, if so. Please be advised that you may lose access to certain services that we rely on third-party providers for.
                </p>
                <h4>Article 9 - HOW PERSONAL DATA IS STORED:</h4>
                <p>
                We use secure physical and digital systems to store your Personal Data when appropriate. We ensure that your Personal Data is protected against unauthorized access, disclosure, or destruction.<br><br>
Please note, however, that no system involving the transmission of information via the internet, or the electronic storage of data, is completely secure. However, we take the protection and storage of your Personal Data very seriously. We take all reasonable steps to protect your Personal Data.<br><br>
Personal Data is stored throughout your relationship with us. We delete your Personal Data upon request for cancelation of your account or other general request for the deletion of data.<br><br>
In the event of a breach of your Personal Data, you will be notified in a reasonable time frame, but in no event later than two weeks, and we will follow all applicable laws regarding such breach.<br><br>
                </p>
                <h4>Article 10 - PURPOSES OF PROCESSING OF PERSONAL DATA::</h4>
                <p>
                We primarily use your Personal Data to help us provide a better experience for you on our Mobile App and to provide you the services and/or information you may have requested, such as use of our Mobile App.<br><br>
Information that does not identify you personally, but that may assist in providing us broad overviews of our customer base, will be used for market research or marketing efforts. Such information may include, but is not limited to, interests based on your cookies.<br><br>
Personal Data that may be considering identifying may be used for the following:<br><br>
a) Improving your personal user experience<br><br>
b) Communicating with you about your user account with us<br><br>
c) Marketing and advertising to you, including via email<br><br>
d) Fulfilling your purchases<br><br>
e) Providing customer service to you<br><br>
f) Advising you about updates to the Mobile App or related Items
                </p>
                <h4>Article 11 - DISCLOSURE OF PERSONAL DATA:</h4>
                <p>
                Although our policy is to maintain the privacy of your Personal Data as described herein, we may disclose your Personal Data if we believe that it is reasonable to do so in certain cases, in our sole and exclusive discretion. Such cases may include, but are not limited to:<br><br>
                a) To satisfy any local, state, or Federal laws or regulations<br><br>
                b) To respond to requests, such discovery, criminal, civil, or administrative process, subpoenas, court orders, or writs from law enforcement or other governmental or legal bodies<br><br>
                c) To bring legal action against a user who has violated the law or violated the terms of use of our Mobile App<br><br>
                d) As may be necessary for the operation of our Mobile App<br><br>
                e) To generally cooperate with any lawful investigation about our users<br><br>
                f) If we suspect any fraudulent activity on our Mobile App or if we have noticed any activity which may violate our terms or other applicable 
                </p>
                <h4>Article 12 - OPTING OUT OF TRANSMITTALS FROM US::</h4>
                <p>
                From time to time, we may send you informational or marketing communications related to our Mobile App such as announcements or other information. If you wish to opt-out of such communications, you may contact the following email: info@lightforcancer.com. You may also click the opt-out link which will be provided at the bottom of any and all such communications.<br><br>
Please be advised that even though you may opt-out of such communications, you may still receive information from us that is specifically about your use of our Mobile App or about your account with us.<br><br>
By providing any Personal Data to us, or by using our Mobile App in any manner, you have created a commercial relationship with us. As such, you agree that any email sent from us or third-party affiliates, even unsolicited email, shall specifically not be considered SPAM, as that term is legally defined.<br><br>
                </p>
                <h4>Article 13 - MODIFYING AND ACCESSING YOU INFORMATION:</h4>
                <p>
                If you wish to modify any information we may have about you, or you wish to simply access any information we have about you, you may do so from your account settings page.
                </p>
                <h4>Article 14 - ACCEPTANCE OF RISK:</h4>
                <p>
                By continuing to our Mobile App in any manner, use the Product, you manifest your continuing asset to this Privacy Policy. You further acknowledge, agree and accept that no transmission of information or data via the internet is not always completely secure, no matter what steps are taken. You acknowledge, agree and accept that we do not guarantee or warrant the security of any information that you provide to us, and that you transmit such information at your own risk.
                </p>
                <h4>Article 15 - YOUR RIGHTS:</h4>
                <p>
                You have many rights in relation to your Personal Data. Specifically, your rights are as follows:<br><br>
                    - the right to be informed about the processing of your Personal Data<br><br>
                    - the right to have access to your Personal Data<br><br>
                    - the right to update and/or correct your Personal Data<br><br>
                    - the right to portability of your Personal Data<br><br>
                    - the right to oppose or limit the processing of your Personal Data<br><br>
                    - the right to request that we stop processing and delete your Personal Data<br><br>
                    - the right to block any Personal Data processing in violation of any applicable law<br><br>
                    - the right to launch a complaint with the Federal Trade Commission (FTC) in the United States or applicable data protection authority in another jurisdiction<br><br>
Such rights can all be exercised by contacting us at the relevant contact information listed in this Privacy Policy.
                </p>
                <h4>Article 16 - USE OF LIGHT BY MINORS:</h4>
                <p>
                You must be 18 years of age, or the age of majority in your province, territory or country, to sign up as a registered user of the Light Mobile app. Individuals under the age of 18, or the applicable age of majority, may utilize the Mobile app only with the involvement and consent of a parent or legal guardian, under such person's account.
                </p>
                <h4>Article 17 - CONTACT INFORMATION:</h4>
                <p>
                If you have any questions about this Privacy Policy or the way we collect information from you, or if you would like to launch a complaint about anything related to this Privacy Policy, you may contact us at the following email address: info@lightforcancer.com.                </p>
              </div>
            </body>
            
            </html>`
        , webUrl:"http://ec2-3-21-237-151.us-east-2.compute.amazonaws.com:3000/privacy"},
        // $inc: {
        //     version: 1
        // }
    }, {
        upsert: true
    })
    .then((result) => {
        // console.log('result', result);
    })
    .catch((err) => {
        // console.log('err', err)
    })
module.exports = privacyPolicyModel