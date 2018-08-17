({
	doInit : function(component, event, helper) {
		helper.checkBoolean(component);
		helper.createFieldRouter(component,false);
	},
	handleFieldUpdateEvent : function(component,event,helper) {
		helper.handleFieldUpdateEvent(component,event);
	},
	updateValue : function(component,event,helper) {
		helper.updateValue(component,event);
	},
	handleFieldValidationEvent : function(component,event,helper) {
		helper.handleFieldValidationEvent(component,event);
	},
	handleUpdateSelectOptions : function(component,event) {
		var inputCom = $A.getComponent(component.get('v.globalId'));
	},
	validate : function(component,event,helper) {
		return helper.validateField(component,event);
	},
	setSelectOptions : function(component,event,helper) {
		helper.setSelectOptions(component,event);
	},
	setOtherAttributes : function(component,event,helper) {
		helper.setOtherAttributes(component,event);
	},
	clearValue : function(component,event,helper) {
		helper.clearValue(component,event);
	},
	reInitialize : function(component,event,helper) {
		helper.reInitialize(component,event);
	},
	clearErrorMessages : function(component,event,helper) {
		helper.clearErrorMessages(component);
	},
	setErrorMessages : function(component,event,helper) {
		helper.setErrorMessages(component,event);
	},
	changeFieldType : function(component,event,helper) {
		helper.changeFieldType(component,event);
	},
	handleRadioButtonValueChangedEvent : function(component,event,helper) {
		helper.handleRadioButtonValueChangedEvent(component,event);
  	},
	clearOptions : function(component, event, helper) {
		helper.clearOptions(component);
	},
    onKeyChange : function(component, event, helper) {
		helper.onKeyChange(component);
	},
    showHideRequired: function(component, event, helper) {
		helper.showHideRequired(component);
	}
})