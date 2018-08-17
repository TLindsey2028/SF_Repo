/* global _ */
/* global FontevaHelper */
({
  generateId : function (len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for( var i=0; i < len; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },

  doInit : function(component) {
    var self = this;
    if ($A.util.isEmpty(component.get('v.formUniqueIdentifier'))) {
      component.set('v.formUniqueIdentifier', this.generateId(8));
    }
    if (!$A.util.isEmpty(component.get('v.formLoadObj'))) {
        self.buildFormObj(component,_.cloneDeep(component.get('v.formLoadObj')));
    }
    else {
        var eventBase = component.get('v.eventBase');
        eventBase.getEventRegistrationForm(component, component.get('v.formId'), component.get('v.formResponseId'),
                JSON.stringify(component.get('v.eventObj')), component.get('v.subjectId'), function callback(data) {
            self.buildFormObj(component,data);
        });
    }
  },
  buildFormObj : function(component,formObjData) {
      var formObj = this.prepareValues(formObjData);
      component.set('v.formObj', formObj);
      this.renderForm(component, formObj);
  },
  prepareValues: function(data) {
    _.each(data.fieldGroups, function(group) {
      group.values = _.reduce(group.fields, function(o, f) {
        o[f.fieldId] = f.fieldType === 'boolean' ? (f.value == "true" ? true : false) : f.value;
        return o;
      }, {});
    })
    return data;
  },
  renderForm: function(component, formObj) {
    if (!formObj.hasFields) {
      $A.util.addClass(component.find('formBase'), 'hidden');
    }

    if (formObj.hasRequiredFields) {
      component.set('v.formComplete', false);
    }
    else {
      var compEvent = $A.get('e.LTE:FormSubmittedEvent');
      compEvent.setParams({formIdentifier : component.get('v.formUniqueIdentifier'),
          formComplete : component.get('v.formComplete')});
      compEvent.fire();
    }

    setTimeout($A.getCallback(function(){
        component.set('v.formRenderComplete',true);
    }),500);
  },

  validateForm : function(component) {
    var allValidated = true;
    if (_.some(component.get('v.formObj.fieldGroups'),{isMultiple : false})) {
        _.flatten([component.find('fields')]).forEach(function (element) {
            if (!$A.util.isEmpty(element.get('v.fields'))){
            if (!$A.util.isEmpty(element.get('v.isValidated')) && !element.get('v.value.isHidden')) {
                element.validate();
                if (!element.get('v.isValidated')) {
                    allValidated = false;
                }
            }
            }
        });
    }

    component.set('v.formComplete', allValidated);
    return allValidated;
  },

  validateAndSubmitForm : function(component) {
    var allValidated = this.validateForm(component);
    if (allValidated) {
      this.saveFormResponse(component);
    }
    return allValidated;
  },

  saveFormResponse : function (component) {
    var SAVE_STATUS_NONE = 0;
    var SAVE_STATUS_IN_PROGRESS = 1;
    var SAVE_STATUS_IN_PROGRESS_SAVE_REQUESTED = 2;

    var saveStatus = component.get('v.saveStatus');
    if (saveStatus !== SAVE_STATUS_NONE) {
      if (saveStatus === SAVE_STATUS_IN_PROGRESS) {
        component.set('v.saveStatus', SAVE_STATUS_IN_PROGRESS_SAVE_REQUESTED);
      }
      return;
    } else {
      component.set('v.saveStatus', SAVE_STATUS_IN_PROGRESS);
    }

    var self = this;

    var formResultsFiltered = _.cloneDeep(component.get('v.formObj'));
    var params = {
      formId : component.get('v.formId'),
      formResults : JSON.stringify(formResultsFiltered),
      subjectId : component.get('v.subjectId'),
      subjectLookupField : component.get('v.subjectLookupField'),
      contactId :  component.get('v.contactId'),
      formResponseId : component.get('v.formResponseId'),
      eventObj : JSON.stringify(component.get('v.eventObj'))
    };
    var eventBase = component.get('v.eventBase');
    eventBase.saveEventRegistrationForm(component, params, function callback(resultObj) {
      var saveStatus = component.get('v.saveStatus');
      component.set('v.saveStatus', SAVE_STATUS_NONE);

      var formObj = component.get('v.formObj');
      formObj.formResponseId = resultObj.formResponseId;
      component.set('v.formResponseId',resultObj.formResponseId);
      component.set('v.formObj',formObj);
      component.set('v.formComplete',resultObj.formComplete);

      if (saveStatus === SAVE_STATUS_IN_PROGRESS_SAVE_REQUESTED) {
        self.saveFormResponse(component);
      }
    });

  },

  updateValues: function(component, fieldGroup, fieldId) {
    var formObj = component.get('v.formObj');
    var group = _.find(formObj.fieldGroups, {fieldGroupId: fieldGroup});
    var field = _.find(group.fields, {fieldId: fieldId});

    if (!$A.util.isUndefinedOrNull(group.values[fieldId]) && _.isArray(group.values[fieldId])) {
        field.value = group.values[fieldId].toString();
    }
    else {
        field.value = group.values[fieldId];
    }
    component.set('v.formObj', formObj);
  }
})