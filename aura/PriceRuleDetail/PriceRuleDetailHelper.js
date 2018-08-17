({
    doInit : function(component) {
        if ($A.util.isUndefinedOrNull(component.get('v.priceRuleObj.price'))) {
            component.set('v.priceRuleObj.price',0.00);
        }
        var compEvent = $A.get('e.Framework:RefreshInputField');
        if (!$A.util.isEmpty(compEvent)) {
            compEvent.setParams({group: component.get('v.groupName'), data: component.get('v.priceRuleObj')});
            compEvent.fire();
        }

        if (component.get('v.priceRuleObj').enableSubscriptionPlans && !$A.util.isUndefinedOrNull(component.get('v.priceRuleObj').availableSubscriptionPlans) &&
            component.get('v.priceRuleObj').availableSubscriptionPlans.length > 0) {
            this.buildSubscriptionsLookup(component);
        }
        else {
            var prObj = component.get('v.priceRuleObj');
            prObj.enableSubscriptionPlans = false;
            component.set('v.priceRuleObj',prObj);
        }
        this.buildSourceCodesLookup(component);
        this.buildBadgeTypesLookup(component);
        this.buildPriceRuleVariableComponents(component);
    },
    createNewVariable : function(component) {
        var variables = component.get('v.priceRuleObj.priceRuleVariables');
        if ($A.util.isUndefinedOrNull(variables) || !$A.util.isArray(variables)) {
            variables = [];
        }
        variables.push({
            priceRuleId : component.get('v.priceRuleObj.id'),
            fieldType : 'string',
            objectName : '',
            field : '',
            operator : '',
            value : ''
        });
        component.set('v.priceRuleObj.priceRuleVariables',variables);
        var variableObj = {
            variableObj : {
                priceRuleId : component.get('v.priceRuleObj.id'),
                fieldType : 'string',
                objectName : '',
                field : '',
                operator : '',
                value : ''
            },
            contactFields : component.get('v.priceRuleObj').contactFields,
            accountFields : component.get('v.priceRuleObj').accountFields,
            groupName : component.get('v.priceRuleObj').id+'_group_'+(variables.length - 1)
        };
        this.createPRVComponent(component,variableObj,variables.length - 1);
    },
    removePriceRuleVariableRow : function(component,event) {
        var group = event.getParam("group");
        var priceRuleVariablesDiv = component.find("priceRuleVariables");
        var body = priceRuleVariablesDiv.get("v.body");

        var bodyLen = body.length;
        var index = -1;
        for(var i=0; i < bodyLen; i++) {
            if(group === body[i].get("v.groupName")) {
                index = i;
                break;
            }
        }

        if (index > -1) {
            var priceRuleVariables = component.get("v.priceRuleObj.priceRuleVariables");
            priceRuleVariables.splice(index, 1);
            component.set("v.priceRuleObj.priceRuleVariables", priceRuleVariables);

            body[index].destroy();
            body.splice(index, 1);
            priceRuleVariablesDiv.set("v.body", body);
        }
    },
    validatePriceRule : function (component) {
        component.set('v.validated',false);
        if (this.validateForm(component.get('v.priceRuleObj'),component)) {
            component.set('v.validated',true);
        }
    },
    buildSourceCodesLookup : function(component) {
        var otherAttributes = {
                          type : 'OrderApi__Source_Code__c',
                          otherMethods :{
                              maxItems : null
                          }
                      };
        component.find('requiredSourceCodes').setOtherAttributes(otherAttributes,true);
        var sourceCodes = component.get('v.priceRuleObj.requiredSourceCodes');
        component.find('requiredSourceCodes').updateValue([]);
        if (!$A.util.isEmpty(sourceCodes) && !$A.util.isArray(sourceCodes)) {
            sourceCodes = sourceCodes.split(',');
        }
        component.find('requiredSourceCodes').updateValue(sourceCodes);
    },
    buildBadgeTypesLookup : function(component) {
        var otherAttributes = {
            type : 'OrderApi__Badge_Type__c',
                filter : "OrderApi__Is_Active__c = true",
                otherMethods :{
                maxItems : null
            }
        };
        component.find('requiredBadgeTypes').setOtherAttributes(otherAttributes);
        var badges = component.get('v.priceRuleObj.requiredBadgeTypes');
        component.find('requiredBadgeTypes').updateValue([]);
        if (!$A.util.isEmpty(badges) && !$A.util.isArray(badges)) {
            badges = badges.split(',');
        }
        component.find('requiredBadgeTypes').updateValue(badges);
    },
    buildSubscriptionsLookup : function(component) {
        var priceRuleObj = component.get('v.priceRuleObj');
        $A.createComponent('markup://Framework:InputFields',
            {'aura:id' : 'requiredSubscriptionPlans',
                group : component.get('v.groupName'),
                fieldType : 'lookup',
                label : $A.get("$Label.OrderApi.Price_Rule_Subscription_Plans"),
                value : component.get('v.priceRuleObj'),
                otherAttributes : {
                    type : 'OrderApi__Subscription_Plan__c',
                    filter : 'Id in '+component.get('v.priceRuleObj').availableSubscriptionPlans,
                    otherMethods :{
                        maxItems : null
                    }
                }},
            function(cmp) {
                cmp.set('v.value',component.get('v.priceRuleObj'));
                var divComponent = component.find("requiredSubscriptionPlansLookup");
                var divBody = divComponent.get("v.body");
                divBody.push(cmp);
                divComponent.set("v.body",divBody);
                component.set('v.subscriptionGlobalId',cmp.getGlobalId());
            });
    },
    buildPriceRuleVariableComponents : function(component) {
        var self = this;
        if (!$A.util.isEmpty(component.get('v.priceRuleObj').priceRuleVariables)) {
            component.get('v.priceRuleObj').priceRuleVariables.forEach(function (element, index) {
                var variableObj = {
                    variableObj: element,
                    contactFields: component.get('v.priceRuleObj').contactFields,
                    accountFields: component.get('v.priceRuleObj').accountFields,
                    groupName: component.get('v.priceRuleObj').id + '_group_' + index
                };
                self.createPRVComponent(component, variableObj, index);
            });
        }
    },
    createPRVComponent : function (component,variableObj,index) {
        $A.createComponent(
            'markup://OrderApi:PriceRuleVariable',
             variableObj,function(cmp) {
                cmp.set('v.variableObj',component.get('v.priceRuleObj.priceRuleVariables')[index]);
                cmp.set('v.accountFields',_.cloneDeep(variableObj.accountFields));
                cmp.set('v.contactFields',_.cloneDeep(variableObj.contactFields));
                var divComponent = component.find('priceRuleVariables');
                var divBody = divComponent.get("v.body");
                divBody.push(cmp);
                divComponent.set('v.body',divBody);
            });
    },
    validateForm : function(inputObj,component) {
        component.find('name').validate();
        component.find('price').validate();
        if (component.find('name').get('v.validated') && component.find('price').get('v.validated')) {
            return true;
        }
        return false;
    }
})