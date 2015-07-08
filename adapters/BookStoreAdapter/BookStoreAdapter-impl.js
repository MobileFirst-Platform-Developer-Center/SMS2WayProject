/*
 *
    COPYRIGHT LICENSE: This information contains sample code provided in source code form. You may copy, modify, and distribute
    these sample programs in any form without payment to IBM® for the purposes of developing, using, marketing or distributing
    application programs conforming to the application programming interface for the operating platform for which the sample code is written.
    Notwithstanding anything to the contrary, IBM PROVIDES THE SAMPLE SOURCE CODE ON AN "AS IS" BASIS AND IBM DISCLAIMS ALL WARRANTIES,
    EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, ANY IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, SATISFACTORY QUALITY,
    FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND ANY WARRANTY OR CONDITION OF NON-INFRINGEMENT. IBM SHALL NOT BE LIABLE FOR ANY DIRECT,
    INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR OPERATION OF THE SAMPLE SOURCE CODE.
    IBM HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS OR MODIFICATIONS TO THE SAMPLE SOURCE CODE.

 */


var eventSource = "BookEventSource";
var adapter = "BookStoreAdapter";
var eventSourceId = adapter + "." + eventSource;

WL.Server.createEventSource({
	name: eventSource
});


/* The filter {keyword:value} used in WL.Server.createSMSEventHandler depends on the gateway.
 * Here it assumes that the gateway will send 3 parameters
 * from: fromNumber, mandatory and can be configured in SMSConfig.xml
 * text: text, mandatory and can be configured in SMSConfig.xml
 * keyword: first word of the text, optional and depends on gateway
 * 
 * example: Gateway will make below request when it gets the SMS "sub"
 * http://<host>:<port>/SMS2WayProject/receiveSMS?from=9876543210&text=sub&keyword=sub
 * 
 * */
WL.Server.setEventHandlers([
                            WL.Server.createSMSEventHandler(
                            		{keyword: WL.Server.configuration['sms.keyword.subscribe']}, 
                            		subscribeSMS, 
                            		WL.Server.configuration['sms.gateway.id']
                            		),
                            WL.Server.createSMSEventHandler(
                            		{keyword: WL.Server.configuration['sms.keyword.unsubscribe']},
                            		unsubscribeSMS, WL.Server.configuration['sms.gateway.id']
                            		)
                            ]);

function subscribeSMS(param) {

	WL.Logger.info("subscribeSMS>> " + JSON.stringify(param));
	
	var subscription = WL.Server.getSMSSubscription(eventSourceId, param.from);
	if(subscription == null) {
		WL.Server.subscribeSMS(eventSourceId, param.from, WL.Server.configuration['sms.gateway.id']);
	}
}

function unsubscribeSMS(param) {
	WL.Logger.info("unsubscribeSMS>> " + JSON.stringify(param));
	WL.Server.unsubscribeSMS(eventSourceId, param.from);
}

function sendSMS(phoneNumber, smsText) {

	var subscription = WL.Server.getSMSSubscription(eventSourceId, phoneNumber);

	if (subscription == null) {
		return { result: "No subscription found for user :: " + phoneNumber };
	}

	var notification = WL.Server.createDefaultNotification(smsText, 1, {});
	WL.Server.notifyDeviceSubscription(subscription, notification);

	return { result: "Notification sent to user :: " + phoneNumber };
}