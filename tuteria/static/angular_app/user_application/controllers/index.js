import {EditCtrlDetail} from './EditCtrl';
import {MediaCtrlDetail} from './EditMediaCtrl';
import {VerificationCtrlDetail} from './EditVerificationCtrl';
import {TutorEditDetail} from './TutorEditCtrl';

export {EditCtrlDetail,MediaCtrlDetail,VerificationCtrlDetail,TutorEditDetail}
export default (ngModule) =>{	
	require('./EditCtrl').default(ngModule);
	require('./EditMediaCtrl').default(ngModule);
	require('./EditVerificationCtrl').default(ngModule);
	require('./TutorEditCtrl').default(ngModule);
	// require('./userProfileSidebar')(ngModule);
}
