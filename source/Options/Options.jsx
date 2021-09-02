import * as React from 'react';
import jsQR from "jsqr";
import './styles.scss';
//"content_security_policy": "script-src 'self'; object-src 'self'",
export default class Options extends React.Component {
	video
	photo
	codearea
	codeareaCtx
	canvas
	width
	height
	constructor(props) {
		super(props);
		this.video = React.createRef();
		this.codearea = React.createRef();
		this.canvas = React.createRef();
	}
	render() {
		return (
			<div>
				<h1>Options</h1>
			</div>
		);
	}
}