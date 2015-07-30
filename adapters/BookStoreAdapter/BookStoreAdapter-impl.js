/**
* Copyright 2015 IBM Corp.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
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