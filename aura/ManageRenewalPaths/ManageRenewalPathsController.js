({
    doInit : function(component,event,helper) {
        component.set('v.renewalPathObj',{
            term : false,
            completedTerms : null,
            id : null,
            itemClasses : null,
            defaultItem : null,
            selectItems : [],
            accountOrContact : false,
            renewalVariables : []});
        helper.getExistingRenewalPaths(component);
        helper.getMainItemName(component);
    },
    handleFieldUpdateEvent : function(component,event,helper) {
        if (event.getParam('fieldId') === 'itemClasses') {
            helper.getItems(component);
        }
        else if (event.getParam('fieldId') === 'selectItems') {
            var defaultItemsList = component.get("v.renewalPathObj").selectItems;
            if (!$A.util.isUndefinedOrNull(defaultItemsList) && defaultItemsList.length > 0) {
                component.find('defaultItem').setSelectOptions(defaultItemsList, defaultItemsList[0].value);
            }
            else {
                component.find('defaultItem').setSelectOptions([],null);
            }
        }
        else if(event.getParam('fieldId') === 'term') {
                component.find('completedTerms').updateValue(null,false);
        }
    },
    save : function(component,event,helper) {
        helper.saveRenewalPath(component);
    },
    cancel : function(component) {
        var navEvt = $A.get("e.force:navigateToSObject");
        if (!$A.util.isEmpty(navEvt)) {
            navEvt.setParams({
                "recordId": component.get('v.itemId')
            });
            navEvt.fire();
        }
        else {
            UrlUtil.navToUrl('/' + component.get('v.retUrl'));
        }
    },
    createNewVariable : function(component,event,helper) {
        var variables = component.get('v.renewalPathObj.renewalVariables');
        variables.push({
            renewalPathId : component.get('v.renewalPathObj.id'),
            fieldType : 'string',
            objectName : null,
            field : null,
            operator : null,
            value : null
        });
        component.set('v.renewalPathObj.renewalVariables',variables);
        var variableObj = {
            variableObj : {
                renewalPathId :  component.get('v.renewalPathObj.id'),
                fieldType : 'string',
                objectName : null,
                field : null,
                operator : null,
                value : null
            },
            contactFields : component.get('v.contactFields'),
            accountFields : component.get('v.accountFields'),
            groupName : component.get('v.renewalPathObj').id+'_group_'+(variables.length - 1)
        };

        helper.createRenewalVariableComp(component,variableObj,variables.length - 1);
    },
    deletePriceRuleVariableRow : function(component, event) {
        var group = event.getParam("group");
        var renewalPathVariables = component.find("renewalVariables");
        var body = renewalPathVariables.get("v.body");

        var bodyLen = body.length;
        var index = -1;
        for(var i=0; i < bodyLen; i++) {
            if(group === body[i].get("v.groupName")) {
                index = i;
                break;
            }
        }

        if (index > -1) {
            var renewalPathObj = component.get("v.renewalPathObj");
            renewalPathObj.renewalVariables.splice(index, 1);
            component.set("v.renewalPathObj", renewalPathObj);

            body[index].destroy();
            body.splice(index, 1);
            renewalPathVariables.set("v.body", body);
        }

        if (body.length == 0) {
            $A.util.addClass(component.find('variableHeadings'),'slds-hide');
        }
    }
})