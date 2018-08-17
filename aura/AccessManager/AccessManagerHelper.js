({
	loadData : function(component) {
		this.getProfiles(component);
		this.getPackages(component);
	},
	getProfiles : function(component) {
		var action = component.get("c.getProfiles");
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.set('v.profileOptions',JSON.parse(response.getReturnValue()));
			}
		});
		$A.enqueueAction(action);
	},
	getPackages : function(component) {
		var action = component.get("c.getPackages");
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.set('v.packageOptions',JSON.parse(response.getReturnValue()));
			}
		});
		$A.enqueueAction(action);
	}
})