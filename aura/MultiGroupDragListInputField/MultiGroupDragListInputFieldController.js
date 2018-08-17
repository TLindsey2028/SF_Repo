/* global _ */
({
  init : function(component, event, helper) {
    helper.loadExistingValue(component);
  },
  setErrorMessages : function(component,event) {
    var params = event.getParam('arguments');
    if (params) {
      if (!$A.util.isUndefinedOrNull(params.errorMessages) && params.errorMessages.length > 0) {
        var inputCom = component.find('errorInput');
        inputCom.hideMessages();
        inputCom.showMessages(params.errorMessages);
      }
    }
  },
    handleInputFieldClearErrorMessagesEvent : function(component,event) {
        if (event.getParam('fieldId') === component.getGlobalId()) {
            var inputCom = component.find('errorInput');
            inputCom.hideMessages();
        }
    },
  loadExistingValue : function(component, event, helper) {
    helper.loadExistingValue(component);
  },
  reInitialize : function(component, event, helper) {
    helper.loadExistingValue(component);
  },
  validate: function(component, event, helper) {
    helper.validate(component);
  },
  filterFields : function(component,event,helper) {
    helper.filterFields(component);
  },
  removeValue : function(component,event,helper) {
    component.find('filterFieldsInput').set('v.value',null);
    helper.filterFields(component);
  }
})