import * as React from 'react';
import jsQR from "jsqr";
import { browser } from 'webextension-polyfill-ts';
import { search, t } from '../library/utils';
import './styles.scss';
export default class Options extends React.Component {
	video
	photo
	codearea
	codeareaCtx
	canvas
	width
	heigt
	constructor(props) {
		super(props);
		this.video = React.createRef();
		this.codearea = React.createRef();
		this.canvas = React.createRef();
		this.copyText = React.createRef();
		this.state = {
			codetext: '',
			resultdisplay: false,
			resultIsUrl: true
		};
		this.reScan = this.reScan.bind(this);
		this.openResult = this.openResult.bind(this);
		this.copyResult = this.copyResult.bind(this);
	}
	render() {
		return (
			<div>
				<div className="wrap">
					<video width={`${this.width}px`} height={`${this.height}px`} ref={this.video} ></video>
					<canvas width={`${this.width}px`} height={`${this.height}px`} className="codearea" ref={this.codearea}></canvas>
					{(this.state.resultdisplay) &&
						<div className="panel" style={{ width: `${this.width}px`, height: `${this.height}px`, display: `${this.state.resultdisplay}` }}  >
							<span className="result-title">{t('scanResult')}</span>
							<span className="result-data" onClick={this.openResult}>{this.state.codetext}</span>
							<div className="action">
								<button onClick={this.reScan}>{t('retry')}</button>
								<button onClick={this.copyResult}>{t('copy')}</button>
								{this.state.resultIsUrl ?
									<button onClick={this.openResult}>{t('openUrl')}</button> :
									<button onClick={this.openResult}>{t('searchText')}</button>
								}
							</div>
						</div>
					}
				</div>
				<canvas width={`${this.width}px`} height={`${this.height}px`} ref={this.canvas}></canvas>
				<input type="text" ref={this.copyText} style={{position: 'absolute',left: '-9999px'}} />
			</div>
		);
	}
	copyResult(){
		this.copyText.current.value = this.state.codetext;
		this.copyText.current.select();
		document.execCommand('copy'); 
		this.copyText.current.blur();
		this.copyText.current.value = '';
		alert(browser.i18n.getMessage("copysuccessful"))
		window.open("","_self").close();
	}
	openResult() {
		if(this.state.resultIsUrl){
			browser.tabs.create({url:this.state.codetext})
		}else{
			search(this.state.codetext)
		}
		window.open("","_self").close();
	}
	reScan(){
		this.setState({
			codetext: '',
			resultdisplay: false,
			resultIsUrl:false
		});
		this.cameraScan();
	}
	doSearch() {
		// console.log(browser.search, browser.search.search, browser.search.query);
		// browser.search.query('2222');
		// browser.search.search
		// search();
		console.log(browser.storage.local);

	}
	componentWillMount() {
		this.width = window.innerWidth;
		this.height = window.innerHeight - 3;
		document.title =  browser.i18n.getMessage("webcam");
	}
	cameraScan(){
		var component = this;
		function isMobile() {
			if (/android/i.test(navigator.userAgent)) {
				return true;
			}
			if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
				return true;
			}
			return false;
		}

		if (navigator.mediaDevices === undefined) {
			navigator.mediaDevices = {};
		}

		if (navigator.mediaDevices.getUserMedia === undefined) {
			navigator.mediaDevices.getUserMedia = function (constraints) {

				var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

				if (!getUserMedia) {
					return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
				}

				return new Promise(function (resolve, reject) {
					getUserMedia.call(navigator, constraints, resolve, reject);
				});
			}
		}
		var facemode;
		if (isMobile()) {
			facemode = { exact: "environment" };
		} else {
			facemode = 'user';
		}

		navigator.mediaDevices.getUserMedia({
			audio: false,
			video: { width: 725, height: 700, facingMode: facemode }
		})
			.then(function (stream) {
				var video = component.video.current;
				var codearea = component.codearea.current;
				var canvas = component.canvas.current;
				var codeareaCtx = codearea.getContext("2d");
				var canvasCtx = canvas.getContext("2d");
				if ("srcObject" in video) {
					video.srcObject = stream;
				} else {
					video.src = window.URL.createObjectURL(stream);
				}
				video.onloadedmetadata = function () {
					video.play();
					codeareaCtx.clearRect(0, 0, 725, 700);
				};
				var clock = setInterval(function () {
					canvasCtx.drawImage(video, 0, 0);
					const code = jsQR(canvasCtx.getImageData(0, 0, 725, 700).data, 725, 700);
					if (code !== null && code.data && code.data.length > 0) {
						clearInterval(clock);
						var resultIsUrl = true;
						try {
							new URL(code.data);
						} catch (error) {
							resultIsUrl = false;
						}
						component.setState({
							codetext: code.data,
							resultdisplay: true,
							resultIsUrl
						});
						video.pause();
						stream.getTracks().forEach(function (track) {
							track.stop();
						});
						canvasCtx.clearRect(0, 0, 725, 700);
						codeareaCtx.clearRect(0, 0, 725, 700);
						codeareaCtx.drawImage(video, 0, 0);
						codeareaCtx.beginPath();
						codeareaCtx.strokeStyle = 'red';
						codeareaCtx.fillStyle = 'red';
						codeareaCtx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
						codeareaCtx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y)
						codeareaCtx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y)
						codeareaCtx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y)
						codeareaCtx.closePath();
						codeareaCtx.stroke();
						codeareaCtx.beginPath();
						codeareaCtx.arc(code.location.bottomLeftFinderPattern.x, code.location.bottomLeftFinderPattern.y, 5, 0, 2 * Math.PI);
						codeareaCtx.fill();
						codeareaCtx.stroke();
						codeareaCtx.beginPath();
						codeareaCtx.arc(code.location.topLeftFinderPattern.x, code.location.topLeftFinderPattern.y, 5, 0, 2 * Math.PI);
						codeareaCtx.fill();
						codeareaCtx.stroke();
						codeareaCtx.beginPath();
						codeareaCtx.arc(code.location.topRightFinderPattern.x, code.location.topRightFinderPattern.y, 5, 0, 2 * Math.PI);
						codeareaCtx.fill();
						codeareaCtx.stroke();
					}
				}, 200);
			})
			.catch(function (err) {
			});
	}
	componentDidMount() {
		this.cameraScan();
	}
}