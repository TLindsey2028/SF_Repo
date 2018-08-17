({
	getSessionAndServerUrl : function(component) {
		if (window.location.href.indexOf('Fonteva_Framework') > -1) {
			$(location).attr('href', 'https://spark-toolkit.herokuapp.com');
			return;
		}
		var action = component.get("c.getSessionAndServerUrlObj");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 var returnObj = JSON.parse(response.getReturnValue());
				 returnObj.serverUrl = 'https://'+window.location.hostname;
                 if ((window.location.ancestorOrigins && window.location.ancestorOrigins[0] && window.location.ancestorOrigins[0].indexOf('lightning.force') > -1)
                     || window.location.href.indexOf(".lightning.force.com") > 0) {
                     returnObj.retUrl = (window.location.ancestorOrigins ? window.location.ancestorOrigins[0] : window.location.href) + '/one/one.app#/n/Framework__Framework';
                 }
                 $(location).attr('href', 'https://spark-toolkit.herokuapp.com/session?'+$.param(returnObj));
			 }
		 });

		 $A.enqueueAction(action);
	},
	getReleaseVersion : function(component) {
		var action = component.get('c.getSparkVersionName');
		action.setCallback(this,function(response){
			if (response.getState() === 'SUCCESS') {
				component.set('v.releaseVersionStr',response.getReturnValue());
				$A.util.removeClass(component.find('releaseVersion'),'slds-hide');
			}
		});
		$A.enqueueAction(action);
	}
})