import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';
import {  t,getUrlParam,search } from '../library/utils';
import './styles.scss';
//"content_security_policy": "script-src 'self'; object-src 'self'",
export default class Screenshot extends React.Component {
	width
	heigt
	constructor(props) {
		super(props);
		this.openResult = this.openResult.bind(this);
		this.copyResult = this.copyResult.bind(this);
        this.state = {
			codetext: '',
			resultIsUrl: true
		};
		this.copyText = React.createRef();
	}
	render() {
		return (
			<div>
				<div className="wrap">
						<div className="panel" style={{ width: `${this.width}px`, height: `${this.height}px`, display: 'flex' }}  >
							<span className="result-title">{t('scanResult')}</span>
							<span className="result-data" onClick={this.openResult}>{this.state.codetext}</span>
							<div className="action">
								<button onClick={this.copyResult}>{t('copy')}</button>
								{this.state.resultIsUrl ?
									<button onClick={this.openResult}>{t('openUrl')}</button> :
									<button onClick={this.openResult}>{t('searchText')}</button>
								}
							</div>
						</div>
						<input type="text" ref={this.copyText} style={{position: 'absolute',left: '-9999px'}} />
				</div>
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
	componentWillMount() {
		var key = getUrlParam('key');
		if(!key){
			window.open("","_self").close();
		}
		this.width = window.innerWidth;
		this.height = window.innerHeight - 3;
		document.title =  browser.i18n.getMessage("screenshot_title");
		browser.storage.local.get(key).then((data) => {
			if(!data[key]){
				window.open("","_self").close();
			}
			var resultIsUrl = true;
			try {
				new URL(data[key]);
			} catch (error) {
				resultIsUrl = false;
			}
			this.setState({
				codetext:data[key],
				resultIsUrl
			});
		});
		

	}
}