/* global FontevaHelper */
/* global $ */
({
  executeAction: function(component, actionName, actionParameters, cacheKey, callback) {
    var cachedData;
    if (cacheKey) {
      cachedData = FontevaHelper.getCacheItem(cacheKey);
    }
    if (!$A.util.isUndefinedOrNull(cachedData)) {
      callback && callback(cachedData);
    }
    var action = component.get(actionName);
    action.setParams(actionParameters);
    action.setCallback(this, function (result) {
      if (result.getState() === 'ERROR') {
        result.getError().forEach(function (error) {
          FontevaHelper.showErrorMessage(error.message);
        });
        callback && callback(null, result.getError());
      }
      else {
        var data = result.getReturnValue();
        if (cacheKey) {
          FontevaHelper.cacheItem(cacheKey, data);
        }
        callback && callback(data);
      }
    });

    if (cacheKey) {
      action.setStorable();
    }
    $A.enqueueAction(action);
  },
  getVenues: function(component, callback) {
    var eventId = component.get('v.eventObj.id');
    var cacheKey = eventId + '_venues';

    var parameters = { eventId: eventId };
    this.executeAction(component, 'c.getVenues', parameters, cacheKey, callback);
  },
  getSalesOrderLines: function(component, salesOrderId, callback) {
    var eventId = component.get('v.eventObj.id');
    var parameters = { salesOrderId: salesOrderId, eventId: eventId , isTicket : true};
    this.executeAction(component, 'c.getSalesOrderLines', parameters, null, callback);
  },
  getChildSalesOrderLines: function(component, salesOrderId,callback) {
        var eventId = component.get('v.eventObj.id');
        var parameters = { salesOrderId: salesOrderId, eventId: eventId , isTicket : false};
        this.executeAction(component, 'c.getSalesOrderLines', parameters, null, callback);
  },
  getEventRegistrationForm: function(component, formId, formResponseId, eventObj, subjectId, callback) {
    var parameters = { formId: formId, formResponseId: formResponseId, eventObj: eventObj, subjectId: subjectId };
    this.executeAction(component, 'c.getEventRegistrationForm', parameters, null, callback);
  },
  saveEventRegistrationForm: function(component, parameters, callback) {
    this.executeAction(component, 'c.saveEventRegistrationForm', parameters, null, callback);
  },
  checkIfSimpleRegistration: function(component, salesOrderObj) {
    var self = this;
    if (component.get('v.eventObj.sessionsEnabled')) {
        return false;
    }
    return self.checkIfSimpleRegistrationOnly(component, salesOrderObj);
  },
  checkIfSimpleRegistrationWithEnabledSessionOnly : function(component, salesOrderObj) {
    var self = this;
    if (component.get('v.eventObj.sessionsEnabled')) {
        return self.checkIfSimpleRegistrationOnly(component, salesOrderObj);
    } else {
        return false;
    }
  },
  checkIfSimpleRegistrationOnly : function(component, salesOrderObj) {
        if (_.some(salesOrderObj.lines, {isGroupTicket : true})) {
            return false;
        }
        if (_.isArray(salesOrderObj.lines) && salesOrderObj.lines.length > 1) {
            return false;
        }
        if (_.isArray(salesOrderObj.lines) && salesOrderObj.lines.length > 0 && _.some(salesOrderObj.lines, {hasForm : true, isTicket : true})) {
            return false;
        }
        if (component.get('v.eventObj.isSeatingEvent') && salesOrderObj.hasTicketsWithSeating) {
            return false;
        }
        return false;
  }
})