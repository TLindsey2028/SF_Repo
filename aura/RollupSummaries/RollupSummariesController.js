({
	doInit : function(component, event, helper) {
        helper.buildLoadData(component);
	},
	showDashboard : function(component,event) {
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
		compEvents.setParams({ componentName : 'Framework:SparkAdminSidebar',settingId : 'admin_dashboard' });
		compEvents.fire();
	},
	createNewRollup : function (component,event,helper) {
        helper.buildLoadData(component);
		helper.resetFormData(component);
		component.set('v.modalHeader',$A.get("$Label.Framework.New")+' Rollup Summary');
		helper.openModal(component);
		component.find('newRollupBtn').stopIndicator();
	},
	showModal : function(component,event,helper) {
		component.set('v.modalHeader',$A.get("$Label.Framework.Edit")+' Rollup Summary');
		helper.loadExistingData(component,event.currentTarget.dataset.id);
		helper.openModal(component);
	},
	getParentDependentOptions : function (component,event,helper) {
		helper.getParentFields(component);
		helper.getChildObjects(component);
	},
	getChildDependentOptions : function (component,event,helper) {
		helper.getChildFields(component);
		helper.getChildRelationshipFields(component);
	},
	saveRollup : function(component,event,helper) {
		event.preventDefault();
		var action = component.get("c.upsertRollup");
		var rollup = helper.buildFormData(component);
		action.setParams({rollupJSON : JSON.stringify(rollup)});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				var messages = JSON.parse(response.getReturnValue());
				if (Object.keys(messages).length > 0) {
					helper.setErrorMessages(component,messages);
				}
				else {
					helper.closeModal(component);
					helper.buildLoadData(component);
					helper.resetFormData(component);
				}
			}
		});
		$A.enqueueAction(action);
	},
	deleteRollups : function (component,event,helper) {
		var action = component.get("c.deleteObj");
		action.setParams({rollupId : component.get('v.rollupToDelete')});
		action.setCallback(this, function(response) {

			if (response.getState() === 'SUCCESS') {
				component.find('deleteRollupMessage').hideModal();
				helper.buildLoadData(component);
				helper.resetFormData(component);
				component.set('v.rollupToDelete',null);
			}
		});
		$A.enqueueAction(action);
	},
	runRollups : function (component,event,helper) {
		event.preventDefault();
		var rollupId = event.currentTarget.dataset.id;
		var action = component.get("c.runRollup");
		action.setParams({rollupId : rollupId});
		action.setCallback(this, function(result) {
			if (result.getState() === 'ERROR') {
				result.getError().forEach(function(error){
					component.find('toastMessages').showMessage('',error.message,false,'error');
				});
			}
			else {
				component.find('queuedRollupMessage').showModal();
				helper.buildLoadData(component);
				helper.resetFormData(component);
			}
		});
		$A.enqueueAction(action);
	},
	closeModal : function(component,event,helper) {
		helper.closeModal(component);
	},
	showComponent : function(component, event, helper) {
        var compEvents = $A.get("e.Framework:ShowComponentEvent");
        compEvents.setParams({ componentName : event.currentTarget.dataset.name,settingId : event.currentTarget.dataset.id });
        compEvents.fire();
    },
	deleteRollupModal : function (component,event) {
    	component.set('v.rollupToDelete',event.currentTarget.dataset.id);
		component.find('deleteRollupMessage').showModal();
	}
})