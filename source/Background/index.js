import 'emoji-log';
import { browser } from 'webextension-polyfill-ts';
import { openWebPage } from '../library/utils';
import jsQR from "jsqr";

browser.runtime.onInstalled.addListener(() => {
	console.emoji('🦄', 'extension installed');
	browser.contextMenus.create({
		id: "scan",
		title: browser.i18n.getMessage("appName"),
		contexts: ["all"]
	});

	browser.contextMenus.create({
		id: "webcam",
		parentId: 'scan',
		title: browser.i18n.getMessage("webcam"),
		contexts: ["all"]
	});

	browser.contextMenus.create({
		id: "screenshot",
		parentId: 'scan',
		title: browser.i18n.getMessage("screenshot"),
		contexts: ["all"],
		documentUrlPatterns: ['https://*/*', 'http://*/*']
	});
});
window.senderMap = {};

browser.contextMenus.onClicked.addListener(async function (menu, tab) {
	switch (menu.menuItemId) {
		case 'webcam':
			openWebPage(browser.runtime.getURL('camera.html'));
			break;
		case 'screenshot':
			senderMap[tab.id].postMessage({
				action: 'clip',
			});
			break;
	}
});

// browser.commands.onCommand.addListener(async function (command, tab) {
// 	if (command === 'screenshot') {
// 		if (senderMap[tab.id]) {
// 			senderMap[tab.id].postMessage({
// 				action: 'clip',
// 			});
// 		} else {
// 		}
// 	}
// });

browser.runtime.onConnect.addListener(function (port) {
	port.onMessage.addListener(async function (message, port2) {
		switch (message.action) {
			case 'screenshot':
				try {
					var imageData = await browser.tabs.captureVisibleTab(port2.sender.tab.windowId);
					var image = document.createElement('img');
					image.src = imageData;
					image.width = message.windowWidth;
					image.height = message.windowHeight;
					document.body.appendChild(image);
					image.onload = function () {
						var canvas = document.createElement('canvas');
						canvas.width = message.rect.width;
						canvas.height = message.rect.height;
						var cvsCtx = canvas.getContext('2d');
						cvsCtx.drawImage(image, message.rect.x, message.rect.y, message.rect.width, message.rect.height, 0, 0, message.rect.width, message.rect.height);
						document.body.appendChild(canvas);
						var image2 = document.createElement('img');
						image2.src = canvas.toDataURL();
						document.body.appendChild(image2);
						var code = jsQR(cvsCtx.getImageData(0, 0, message.rect.width, message.rect.height).data, message.rect.width, message.rect.height);
						if (code && code.data) {
							var key = Date.now();
							var data = {};
							data[key] = code.data;
							browser.storage.local.set(data).then(function (){
								openWebPage(browser.runtime.getURL(`screenshot.html?key=${key}`));
							});
						} else {
							port2.postMessage({
								action: 'error',
								errorInfo: browser.i18n.getMessage("parseerror"),
							});
						}
					};
				} catch (error) {
					port2.postMessage({
						action: 'error',
						errorInfo: browser.i18n.getMessage("parseerror"),
					});
				}
				break;
		}
	});
	if(port.sender.tab){
		senderMap[port.sender.tab.id] = port;
	}
});