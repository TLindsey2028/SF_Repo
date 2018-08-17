/* global $ */
/* global _ */
/* global Sortable */
({
    "CONSTANTS" : {
        filterTemplate : {filterField: '', filterOperator: '', filterValue: ''}
    },
    closeModal : function(component) {
        var statusesModal = component.find('statusesModal');
        var deleteModal = component.find('deleteModal');
        var modalBackdrop = component.find('modalBackdrop');

        $A.util.removeClass(statusesModal, 'slds-fade-in-open');
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');

        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'remove',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    openModal : function(component) {
        var statusesModal = component.find('statusesModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(statusesModal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');

        var modalBody = document.getElementById("statusesBody");
        modalBody.scrollTop = 0;

        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    openFilterCriteriaModal : function(component) {
        var statusObj = component.get('v.statusObj');
        var action = component.get("c.getFieldApiNames");
        action.setParams({
            SObjectTypeName : 'EventApi__Event__c'
        });
        action.setCallback(this,function(response){
            if (response.getState() === 'SUCCESS') {
                var wrapper = document.querySelector("[data-name='mainBuilderDiv']");
                var responseObj = response.getReturnValue();
                var fields = responseObj.fields;
                var fieldsMeta = component.get("v.fieldApiNames");
                for (var i = 0; i < fields.length; i++) {
                    var elem = fields[i];
                    if (elem.fieldType.toLowerCase() !== "textarea") {
                        fieldsMeta.push(elem);
                    }
                }
                component.set("v.fieldApiNames", fieldsMeta);
                component.set("v.fieldTypeMap", responseObj.fieldTypes);
                var existingCriteria = $A.util.isEmpty(statusObj.filterTransitionCriteria) ? [_.cloneDeep(this.CONSTANTS.filterTemplate)] : JSON.parse(statusObj.filterTransitionCriteria);
                if (typeof existingCriteria.criteriaClause !== "undefined" && existingCriteria.criteriaClause !== null && !$A.util.isEmpty(existingCriteria.whereClause)) {
                    existingCriteria = existingCriteria.criteriaClause;
                } else {
                    existingCriteria = _.cloneDeep(this.CONSTANTS.filterTemplate);
                }
                var displayClause = existingCriteria.displayClause;
                if (typeof displayClause !== "undefined" && displayClause !== null) {
                    component.set("v.selFilterCriteria", displayClause);
                }
                this.drawFilterCriteria(component, existingCriteria);
                $A.util.addClass(wrapper, 'active');
                $A.util.addClass(component.find('filterCriteriaModal'), 'slds-fade-in-open');
                $A.util.addClass(component.find('modalBackdrop'), 'slds-backdrop--open');
            } else {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
        });
        $A.enqueueAction(action);
    },
    drawFilterCriteria : function(component, criteria) {
        component.set('v.filterObj', criteria);
        var filterObj = component.get("v.filterObj");
        var statusObj = component.get("v.statusObj");
        var fieldTypeMap = component.get('v.fieldTypeMap');
        $A.createComponent(
            "markup://EventApi:EventStatusFilterCriteria",
            {
                "filterCriteria" : filterObj,
                "aura:id" : "eventStatusFilterCriteria",
                "statusObj" : statusObj,
                "valueToFieldTypes" : component.get('v.fieldTypeMap'),
                "fieldApiNames" : component.get('v.fieldApiNames')
            },
            function(cmp) {
                component.find("filterPlaceholder").set('v.body',[cmp]);
                cmp.set("v.filterCriteria", filterObj);
                cmp.set("v.valueToFieldTypes", fieldTypeMap);
                component.set("v.statusObj", cmp.get('v.statusObj'));
            }
        );
    },
    closeFilterCriteriaModal : function(component) {
        var wrapper = document.querySelector("[data-name='mainBuilderDiv']");
        $A.util.removeClass(component.find('filterCriteriaModal'), 'slds-fade-in-open');
        $A.util.removeClass(component.find('modalBackdrop'), 'slds-backdrop--open');
        $A.util.removeClass(wrapper, 'active');
        this.openModal(component);
    },
    saveFilterSelection : function(component) {
        var statusObj = component.get('v.statusObj');
        var filterObj = component.get('v.filterObj');
        var fieldTypes = component.get('v.fieldTypeMap');
        var criteria = {};
        var criteriaClause = [];
        var whereClause = [];
        var displayClause = [];
        var filterLen = filterObj.length;

        for (var i = 0; i < filterLen; i++) {
            var filter = filterObj[i];

            if (!$A.util.isEmpty(filter.filterField) && !$A.util.isEmpty(filter.filterOperator)) {
                criteriaClause.push(filter);

                var value = filter.filterValue;
                var prefix = '';
                var suffix= '';
                var operator = filter.filterOperator;
                if ($A.util.isEmpty(value)) {
                    value = '';
                }
                displayClause.push(this.createDisplayQuery(filter.filterField, filter.filterOperator, filter.filterValue, fieldTypes));
                if (fieldTypes[filter.filterField].fieldType.toLowerCase() === "address") {
                    var fieldApiPrefix = filter.filterField.replace("Address", "");
                    var subField = "";
                    var subValue = "";
                    for (var key in value) {
                        if (key === "street_number") {
                            continue;
                        }
                        subValue = "";
                        switch (key) {
                            case "street_name" :
                                subField = fieldApiPrefix + "Street";
                                if (typeof value.street_number !== "undefined" && value.street_number !== null) {
                                    subValue = value.street_number + " ";
                                }
                                break;
                            case "city" :
                                subField = fieldApiPrefix + "City";
                                break;
                            case "province" :
                                subField = fieldApiPrefix + "State";
                                break;
                            case "country" :
                                subField = fieldApiPrefix + "Country";
                                break;
                            case "postal_code" :
                                subField = fieldApiPrefix + "PostalCode";
                                break;
                            default :
                                subField = fieldApiPrefix + "Country";

                        }
                        subValue += value[key];
                        whereClause.push(this.createFilterQuery(subField, filter.filterOperator, subValue, '', '', fieldTypes));
                    }
                }
                else {
                    whereClause.push(this.createFilterQuery(filter.filterField, filter.filterOperator, filter.filterValue, '', '', fieldTypes));
                }
            }
        }
        if ($A.util.isEmpty(criteriaClause)) {
            criteriaClause.push({});
        } else {
            var filterCondition = statusObj.filterCondition;
            var displayClauseComp = statusObj.filterCondition;
            if ($A.util.isEmpty(filterCondition)) {
                filterCondition = whereClause.join(' AND ');
                displayClauseComp = displayClause.join(' AND <br/>');
            } else {
                for (var j=0; j < whereClause.length; j++) {
                    filterCondition = filterCondition.replace(new RegExp((j+1), "g"), '{'+(j+1)+'}');
                }
                for (var k=0; k < whereClause.length; k++) {
                    filterCondition = filterCondition.replace(new RegExp('\\s*{'+(k+1)+'\\s*}', "g"), whereClause[k]);
                }
                for (var j=0; j < displayClause.length; j++) {
                    displayClauseComp = displayClauseComp.replace(new RegExp((j+1), "g"), '{'+(j+1 )+'}');
                }
                for (var k=0; k < displayClause.length; k++) {
                    displayClauseComp = displayClauseComp.replace(new RegExp('\\s*{'+(k+1)+'\\s*}', "g"), '<br/> '+displayClause[k]+' ');
                }
            }
            criteria.whereClause = filterCondition;
            criteria.displayClause = displayClauseComp;
        }
        criteria.criteriaClause = criteriaClause;
        criteria.isAdvanced = component.get('v.statusObj.isAdvanced');
        criteria.filterCondition = component.get('v.statusObj.filterCondition');
        component.set('v.statusObj.filterTransitionCriteria', JSON.stringify(criteria));
        component.set('v.selFilterCriteria', criteria.whereClause);
        this.closeFilterCriteriaModal(component);
    },
    createDisplayQuery : function(field, operator, value, fieldTypes) {
        var stringTypes = ["reference", "phone", "textarea", "email", "id", "address", "url", "picklist", "string"];

        if (fieldTypes[field].fieldType.toLowerCase() === "address") {
            var subValue = [];
            for (var key in value) {
                subValue.push(value[key]);
            }
            value = subValue.join(', ');
        } else if (fieldTypes[field].fieldType.toLowerCase() === "boolean" && $A.util.isEmpty(value)) {
            value = "TRUE";
        }

        switch (operator) {
            case "="  :
                operator = "Equals";
                break;
            case "!=" :
                operator = "Not equals";
                if(stringTypes.indexOf(fieldTypes[field].fieldType.toLowerCase()) > -1) {
                    value = "'" + value + "'";
                }
                break;
            case "<" :
                operator = "Less than";
                break;
            case "<=" :
                operator = "Less than or equal";
                break;
            case ">" :
                operator = "Greater than";
                break;
            case ">=" :
                operator = "Greater than or equal";
                break;
            case "LIKE" :
                operator = "Contains"
                value = "'" + value + "'";
                break;
            case "NOT LIKE" :
                value = "'" + value + "'";
                operator = "Does not contain";
                break;
            case "LIKE%" :
                value = "'" + value + "'";
                operator = "Starts with";
                break;
            case "%LIKE" :
                value = "'" + value + "'";
                operator = "Ends with";
                break;
            case "IN"     :
                operator = "Includes";
                value = "'" + value.trim().split(new RegExp("\\s*[;,]\\s*")).join("','") + "'";
                break;
            case "NOT IN" :
                operator = "Excludes";
                value = "'" + value.trim().split(new RegExp("\\s*[;,]\\s*")).join("','") + "'";
                break;
            default :
                operator = "Equals";
        }

        if (value === '' || value === "'null'") {
            value = "''";
        }
        return _.unescape(_.template('<%- u[0] %> <em><%- u[1] %></em> <strong><%- u[2] %></strong>')({'u' : [fieldTypes[field].label, operator, value]}));
    },
    createFilterQuery : function(field, operator, value, queryPrefix, querySuffix, fieldTypes) {
        var stringTypes = ["reference", "phone", "textarea", "email", "id", "address", "url", "picklist", "string"];
        switch (operator) {
            case "="  :
            case "!=" :
                if(stringTypes.indexOf(fieldTypes[field].fieldType.toLowerCase()) > -1) {
                    value = "'" + value + "'";
                }
                if (fieldTypes[field].fieldType.toLowerCase() === "boolean" && $A.util.isEmpty(value)) {
                    value = "TRUE";
                }
                if (fieldTypes[field].fieldType.toLowerCase() === "multipicklist") {
                    value = "('" + value.trim().split(new RegExp("\\s*[;,]\\s*")).join("','") + "')";
                    operator = (operator === "=") ? "INCLUDES" : "EXCLUDES";
                }
                break;

            case "LIKE" :
                value = "\'%" + value + "%\'";
                break;

            case "NOT LIKE" :
                value = "\'%" + value + "%\'";
                operator = "LIKE";
                queryPrefix = "(NOT ";
                querySuffix = ")";
                break;

            case "LIKE%" :
                value = "'" + value + "%'";
                operator = "LIKE";
                break;

            case "%LIKE" :
                value = "'%" + value + "'";
                operator = "LIKE";
                break;

            case "IN"     :
            case "NOT IN" :
                value = "('" + value.trim().split(new RegExp("\\s*[;,]\\s*")).join("','") + "')";
                if (fieldTypes[field].fieldType.toLowerCase() === "multipicklist") {
                    operator = (operator === "IN") ? "INCLUDES" : "EXCLUDES";
                }
                break;
            default :
                break;
        }

        if (value === '' || value === "'null'") {
            value = 'null';
        }
        return _.unescape(_.template('<%- u[0] %> <%- u[1] %> <%- u[2] %> <%- u[3] %> <%- u[4] %>')({'u' : [queryPrefix, field, operator, value, querySuffix]}));
    },
    saveEventStatusObj : function(component) {
        var self = this;
        component.find('name').validate();
        if (component.find('name').get('v.validated')) {
            var statusObj = component.get('v.statusObj');
            if (!$A.util.isEmpty(component.get('v.selFilterCriteria'))) {
                statusObj.statusTransitionCriteria = component.get('v.selFilterCriteria');
            }
            if (statusObj.isAdvanced) {
                statusObj.filterTransitionCriteria = '';
            }
            component.set('v.statusObj', statusObj);
            var action = component.get('c.saveEventStatus');
            if ($A.util.isEmpty(component.get('v.eventObj.availableStatuses')) || (!$A.util.isEmpty(component.get('v.eventObj.availableStatuses'))  &&
                component.get('v.eventObj.availableStatuses').length === 0) || (!$A.util.isEmpty(component.get('v.eventObj.availableStatuses'))  &&
                component.get('v.eventObj.availableStatuses').length === 1 && $A.util.isEmpty(component.get('v.eventObj.availableStatuses')[0]))) {
                component.set('v.statusObj.isCurrentStatus',true);
            }
            action.setParams({eventStatusJSON : JSON.stringify(component.get('v.statusObj')),eventId : component.get('v.eventObj.eventId')});
            action.setCallback(this,function(result){
                if (result.getState() === 'SUCCESS') {
                    var responseObj = JSON.parse(result.getReturnValue());
                    if (!$A.util.isEmpty(responseObj.error)) {
                        component.find('toastMessages').showMessage('ERROR', responseObj.error, false, 'error');
                        component.find('saveStatus').stopIndicator();
                    }
                    else {
                        var eventObj = component.get('v.eventObj');
                        eventObj.availableStatuses = responseObj;
                        component.set('v.eventObj', eventObj);
                        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
                        compEvent.setParams({
                            operation: 'remove',
                            classes: 'slds-sidebar--modal-open',
                            idTarget: ['side-nav-div', 'topNavDiv']
                        });
                        compEvent.fire();
                        var statusEvent = $A.get('e.EventApi:StatusModifiedEvent');
                        statusEvent.setParams({statuses : _.cloneDeep(responseObj)});
                        statusEvent.fire();
                        setTimeout($A.getCallback(function(){
                            self.sortableOrder(component);
                            self.closeModal(component);
                            component.find('saveStatus').stopIndicator();
                        }),500);
                    }
                }
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('saveStatus').stopIndicator();
        }
    },
    sortableOrder : function(component) {
        var self = this;
        if (!$A.util.isEmpty(document.getElementById('status-container'))) {
            Sortable.create(document.getElementById('status-container'), {
                ghostClass: "item--ghost",
                animation: 200,
                draggable: '.status-type',
                onEnd: $A.getCallback(function () {
                    var existingSteps = [];
                    var displayOrderArray = [];
                    $('#status-container').children().each(function (index) {
                        var stepRowId = $(this).data('id');
                        if (stepRowId !== null && $.inArray(stepRowId, existingSteps) === -1) {
                            displayOrderArray.push({'id': stepRowId, 'index': index});
                            existingSteps.push(stepRowId);
                        }
                    });
                    self.updateDisplayOrder(component, displayOrderArray);
                })
            });
        }
    },
    updateDisplayOrder : function(component, displayOrderArray) {
        var action = component.get('c.updateEventStatusDisplayOrder');
        action.setParams({
            'displayOrderObjJSON' : JSON.stringify(displayOrderArray)
        });
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
        });
        $A.enqueueAction(action);
    },
    deleteStatusObj : function(component,statusId) {
        var self = this;
        var action = component.get('c.deleteStatusObj');
        action.setParams({statusId : statusId,eventId : component.get('v.eventObj.eventId')});
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
            else {
                var responseObj = JSON.parse(response.getReturnValue());
                var eventObj = component.get('v.eventObj');
                eventObj.availableStatuses = responseObj;
                component.set('v.eventObj', eventObj);
                setTimeout($A.getCallback(function(){
                    self.sortableOrder(component);
                }),500);
            }
        });
        $A.enqueueAction(action);
    }
})