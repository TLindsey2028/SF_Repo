({
	showModal : function(component,event,helper) {
        helper.showModal(component);
	},
	hideModal : function(component,event,helper) {
		helper.hideModal(component);
	},
	updateTitle : function(component,event) {
		var params = event.getParam('arguments');
		if (params) {
			component.set('v.title', params.title);
		}
	},
	updateMessage : function(component,event) {
		var params = event.getParam('arguments');
		if (params) {
			component.set('v.message', params.message);
		}
	},
    stopIndicator : function(component,event,helper) {
		helper.stopIndicatorSubmit(component);
	}
})