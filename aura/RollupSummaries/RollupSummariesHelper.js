({
	buildLoadData : function(component) {
		this.getParentObjects(component);
		this.getRollups(component);
		this.getOperationOptions(component);
	},
	getParentObjects : function(component) {
		var action = component.get("c.getRegisteredObjs");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 component.set('v.allObjects',response.getReturnValue());
			 }
		 });
		 $A.enqueueAction(action);
	},
	getRollups : function(component) {
		var action = component.get("c.getRollups");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 $('.row-loading-span').addClass('hide-loading-span');
				  component.set('v.rollups',JSON.parse(response.getReturnValue()));
				 setTimeout($A.getCallback(function(){
					 component.set('v.loading',false);
				 }),250);
			 }
		 });
		 $A.enqueueAction(action);
	},
	buildFormData : function(component) {
		var rollupSummary = {};
		rollupSummary.configId = component.get("v.rollupToEditId");
		rollupSummary.parentSObject = this.getFormValues(component.find("parentSObject"));
		rollupSummary.parentField = this.getFormValues(component.find("parentField"));
		rollupSummary.childSObject = this.getFormValues(component.find("childSObject"));
		rollupSummary.childField = this.getFormValues(component.find("childField"));
		rollupSummary.relationshipField = this.getFormValues(component.find("relationshipField"));
		rollupSummary.operation = this.getFormValues(component.find("operation"));
		rollupSummary.filter = this.getFormValues(component.find("filter"));
		rollupSummary.isEnabled = this.getFormValues(component.find("isEnabled"));
		rollupSummary.enableBatching = this.getFormValues(component.find("enableBatching"));
		rollupSummary.parentBatchScope = this.getFormValues(component.find("parentBatchScope"));
		rollupSummary.childBatchScope = this.getFormValues(component.find("childBatchScope"));
		rollupSummary.enableTrigger = this.getFormValues(component.find('enableTrigger'));
		return rollupSummary;
	},
	resetFormData : function(component) {
	  component.set("v.rollupToEditId", null);
		var comp = component.find("parentSObject");
		comp.set('v.value',null);
		comp = component.find("parentField");
		comp.set('v.value',null);
		comp = component.find("childSObject");
		comp.set('v.value',null);
		comp = component.find("childField");
		comp.set('v.value',null);
		comp = component.find("relationshipField");
		comp.set('v.value',null);
		comp = component.find("operation");
		comp.set('v.value','Sum');
		comp = component.find("filter");
		comp.set('v.value',null);
		comp = component.find("isEnabled");
		comp.set('v.value',false);
		comp = component.find("enableBatching");
		comp.set('v.value',false);
        comp = component.find("enableTrigger");
        comp.set('v.value',false);
		comp = component.find("parentBatchScope");
		comp.set('v.value',0);
		comp = component.find("childBatchScope");
		comp.set('v.value',0);
	},
	loadExistingData : function(component,rollupToEditId) {
		var rollups = component.get('v.rollups');
		var rollupToEdit = null;
		rollups.forEach(function(rollup,index){
			if (rollup.configId === rollupToEditId) {
				rollupToEdit = rollup;
			}
		});
		if (!$A.util.isUndefinedOrNull(rollupToEdit)) {
      component.set('v.rollupToEditId',rollupToEdit.configId);
			var comp = component.find("parentSObject");
			comp.set('v.value',rollupToEdit.parentSObject);
			this.getParentFields(component,rollupToEdit.parentField);
			this.getChildObjects(component,rollupToEdit.childSObject);
			this.getChildFields(component,rollupToEdit.childField,rollupToEdit.childSObject);
			this.getChildRelationshipFields(component,rollupToEdit.relationshipField,rollupToEdit.parentSObject,rollupToEdit.childSObject);
			comp = component.find("operation");
			comp.set('v.value',rollupToEdit.operation);
			comp = component.find("filter");
			comp.set('v.value',rollupToEdit.filter);
			comp = component.find("isEnabled");
			comp.set('v.value',rollupToEdit.isEnabled);
            comp = component.find("enableTrigger");
            comp.set('v.value',rollupToEdit.enableTrigger);
			comp = component.find("enableBatching");
			comp.set('v.value',rollupToEdit.enableBatching);
			comp = component.find("parentBatchScope");
			comp.set('v.value',rollupToEdit.parentBatchScope);
			comp = component.find("childBatchScope");
			comp.set('v.value',rollupToEdit.childBatchScope);
		}
	},
	getFormValues : function(component) {
		return component.get('v.value');
	},
	getParentFields : function(component,existingValue) {
		var action = component.get("c.getParentFieldOptions");
		action.setParams({parentSObject : this.getFormValues(component.find('parentSObject'))});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.set('v.parentFields',JSON.parse(response.getReturnValue()));
				if (!$A.util.isUndefinedOrNull(existingValue)) {
					var comp = component.find("parentField");
					comp.set('v.value',existingValue);
				}
			}
		});
		$A.enqueueAction(action);
	},
	getChildObjects : function(component,existingValue) {
		var action = component.get("c.getChildObjects");
		action.setParams({parentSObject : this.getFormValues(component.find('parentSObject'))});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.set('v.childObjects',JSON.parse(response.getReturnValue()));
				if (!$A.util.isUndefinedOrNull(existingValue)) {
					var comp = component.find("childSObject");
					comp.set('v.value',existingValue);
				}
			}
		});
		$A.enqueueAction(action);
	},
	getChildFields : function(component,existingValue,childSObject) {
		var action = component.get("c.getChildFieldOptions");
		if ($A.util.isUndefinedOrNull(childSObject)) {
			childSObject = this.getFormValues(component.find('childSObject'));
		}
		action.setParams({childSObject : childSObject});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.set('v.childFields',JSON.parse(response.getReturnValue()));
				if (!$A.util.isUndefinedOrNull(existingValue)) {
					var comp = component.find("childField");
					comp.set('v.value',existingValue);
				}
			}
		});
		$A.enqueueAction(action);
	},
	getChildRelationshipFields : function(component,existingValue,parentSObject,childSObject) {
		var action = component.get("c.getChildRelationshipFieldOptions");
		if ($A.util.isUndefinedOrNull(parentSObject)) {
			parentSObject = this.getFormValues(component.find('parentSObject'));
		}
		if ($A.util.isUndefinedOrNull(childSObject)) {
			childSObject = this.getFormValues(component.find('childSObject'));
		}
		action.setParams({parentSObject : parentSObject,childSObject : childSObject});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.set('v.childRelationshipFields',JSON.parse(response.getReturnValue()));
				if (!$A.util.isUndefinedOrNull(existingValue)) {
					var comp = component.find("relationshipField");
					comp.set('v.value',existingValue);
				}
			}
		});
		$A.enqueueAction(action);
	},
	getOperationOptions : function(component) {
		var action = component.get("c.getOperations");
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.set('v.operations',JSON.parse(response.getReturnValue()));
			}
		});
		$A.enqueueAction(action);
	},
	setErrorMessages : function(component,errorMap) {
		for (var key in errorMap) {
			var comp = component.find(key);
			comp.set("v.errors", [{message: errorMap[key]}]);
		}
	},
	openModal : function(component) {
		this.clearErrorMessages(component);
		$A.util.addClass(component.find('modalBackdrop'), 'slds-backdrop--open');
		$A.util.addClass(component.find('modalRollupSummaryField'), 'slds-fade-in-open');
	},
	closeModal : function(component) {
		$A.util.removeClass(component.find('modalBackdrop'), 'slds-backdrop--open');
		$A.util.removeClass(component.find('modalRollupSummaryField'), 'slds-fade-in-open');
		this.clearErrorMessages(component);
	},
	clearErrorMessages : function(component) {
		component.find("parentSObject").set('v.errors',null);
		component.find("parentField").set('v.errors',null);
		component.find("childSObject").set('v.errors',null);
		component.find("childField").set('v.errors',null);
		component.find("relationshipField").set('v.errors',null);
		component.find("operation").set('v.errors',null);
		component.find("filter").set('v.errors',null);
		component.find("isEnabled").set('v.errors',null);
		component.find("enableBatching").set('v.errors',null);
		component.find("parentBatchScope").set('v.errors',null);
		component.find("childBatchScope").set('v.errors',null);
        component.find("enableTrigger").set('v.errors',null);
	}
})