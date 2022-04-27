import React from 'react';
import PageBox from './components/PageBox.jsx';
require('./../app.scss');
export default (props) => {
	React.render(
		<PageBox {...props} />,
		document.getElementById('content')
	);
};
