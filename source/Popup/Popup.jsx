import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { openWebPage } from '../library/utils';

import './styles.scss';

export default class Popup extends React.Component {
	tab
	port
	constructor(props) {
		super(props)
		this.state = {
			enableScreenshot: false
		}
		this.screenshot = this.screenshot.bind(this);
	}
	render() {
		return (
			<div className="popup">
				<div className="popup-item" onClick={this.viewsource}>
					<img src="../assets/icons/github.png" />
					<span className="title">{browser.i18n.getMessage("viewsource")}</span>
				</div>
				<div className="popup-item" onClick={this.webcam}>
					<img src="../assets/icons/webcam.png" />
					<span className="title">{browser.i18n.getMessage("webcam")}</span>
				</div>
				<div className={this.state.enableScreenshot ? "popup-item" : "popup-item disable-popup-item"} onClick={this.screenshot}>
					<img src="../assets/icons/screenshot.png" />
					<span className="title">{browser.i18n.getMessage("screenshot_title")}</span>
					<span className="hotkey">Alt+Shift+D</span>
				</div>
			</div>
		);
	}
	componentWillMount() {
		var component = this;
		if (navigator.userAgent.includes('Chrome')) {
			browser.tabs.getSelected(function (tab) {
				component.tab = tab;
				if (tab.url.startsWith("http") || tab.url.startsWith("http")) {
					component.setState({
						enableScreenshot: true
					})
				}
			});
		} else {
			browser.tabs.query({ active: true,currentWindow:true }, function (tab) {
				component.tab = tab[0];
				if (tab[0].url.startsWith("http") || tab[0].url.startsWith("http")) {
					component.setState({
						enableScreenshot: true
					})
				}
			});
		}
	}
	webcam() {
		openWebPage(browser.runtime.getURL('camera.html'));
		window.close();
	}
	screenshot() {
		browser.extension.getBackgroundPage().senderMap[this.tab.id].postMessage({
			action: 'clip'
		});
		window.close();
	}
	viewsource(){
		browser.tabs.create({url:'https://github.com/ScanQRCode/ScanQRCode'})
		window.close();
	}
};