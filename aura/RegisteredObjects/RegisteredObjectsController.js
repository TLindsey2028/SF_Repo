({
	doInit : function(component, event, helper) {
		helper.buildLoadData(component);
		helper.loadAllObjects(component);
		helper.buildBaseObj(component);
	},
	newModal : function(component, event, helper) {
	    helper.showModal(component);
        helper.loadExistingData(component, '');
	    component.set('v.modalHeader',$A.get("$Label.Framework.New")+' Registered Object');
    },
    editModal : function(component, event, helper) {
        helper.showModal(component);
        helper.buildBaseObj(component);
        component.set('v.modalHeader',$A.get("$Label.Framework.Edit")+' Registered Object');
        helper.loadExistingData(component,event.currentTarget.dataset.id);
    },
	closeModal : function(component, event) {
		var modal = component.find('modalAdminObject');
		var backdrop = component.find('modalBackdrop');
		$A.util.removeClass(modal,'slds-fade-in-open');
		$A.util.removeClass(backdrop,'slds-backdrop--open');
	},
	saveObject : function(component,event,helper) {
		if (helper.validateForm(component.get('v.registeredObj'),component)) {
			var action = component.get("c.upsertRegisteredObject");
			action.setParams({regObjectJSON : JSON.stringify(component.get('v.registeredObj'))});
			action.setCallback(this, function(response) {
				if (response.getState() === 'SUCCESS') {
					var resultObj = response.getReturnValue();
					if (Object.keys(resultObj).length > 0) {
						for (var property in resultObj) {
							if (resultObj.hasOwnProperty(property)) {
								component.find(property).setErrorMessages([{
									message: resultObj[property]
								}]);
							}
						}
					}
					else {
						var modal = component.find('modalAdminObject');
						var backdrop = component.find('modalBackdrop');
						$A.util.removeClass(modal, 'slds-fade-in-open');
						$A.util.removeClass(backdrop, 'slds-backdrop--open');
						helper.buildLoadData(component);
					}
				}
				component.find('saveObject').stopIndicator();
			});
			$A.enqueueAction(action);
		}
		else {
			component.find('saveObject').stopIndicator();
		}
	},
	deleteObject : function(component,event,helper) {
		var action = component.get("c.deleteObj");
		action.setParams({regObjId : component.get('v.objToDelete')});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				helper.buildLoadData(component);
				component.find('deleteObjectMessage').hideModal();
			}
		});
		$A.enqueueAction(action);
	},
	deleteObjectModal : function(component,event) {
	    component.set('v.objToDelete',event.currentTarget.dataset.id);
	    component.find('deleteObjectMessage').showModal();
    },
	showComponent : function(component, event, helper) {
        var compEvents = $A.get("e.Framework:ShowComponentEvent");
        compEvents.setParams({ componentName : event.currentTarget.dataset.name,settingId : event.currentTarget.dataset.id });
        compEvents.fire();
    }
})