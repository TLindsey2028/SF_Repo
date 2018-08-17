/* global FontevaHelper */
({
    findAccounts : function (component) {
        var action = component.get('c.findAccounts');
        action.setParams({
            accountName : component.get('v.value.account'),
            queryFilter : component.get('v.queryFilter'),
            searchFields : component.get('v.storeObj.accountSearchResultFields')
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var accountResults = result.getReturnValue();
                if (!$A.util.isEmpty(accountResults) && accountResults.length > 0) {
                    if (accountResults.length === 1) {
                        component.set('v.value.accountId', accountResults[0].Id);
                    } else {
                        component.set('v.value.accountId', '');
                        component.set('v.accountResults', accountResults);
                        var options = [];
                        accountResults.forEach(function(element) {
                            options.push({
                                value : element.Id,
                                label : element
                            });
                        });
                        $A.createComponent(
                            'markup://Framework:InputFields',
                            {
                                fieldType : 'advancedselectfield',
                                'aura:id' : 'accountId',
                                value : component.get('v.value'),
                                otherAttributes : {
                                    allowCreate : false,
                                    displayOptions : {
                                        item : function(item,escape) {
                                            return '<div class="slds-grid">' +
                                                   '<div class="slds-grid slds-wrap slds-size--1-of-1">' +
                                                   '<div class="slds-col slds-size--1-of-1">' +
                                                   '<strong>' + escape(item.label.Name) + '</strong>' +
                                                   '</div>';
                                        },
                                        option: function (item, escape) {
                                            var lowerText = '';
                                            var fields = component.get('v.storeObj.accountSearchResultFields');
                                            if (!$A.util.isEmpty(fields)) {
                                                var fieldList = fields.split(',');
                                                fieldList.forEach(function(element) {
                                                    if (item.label.hasOwnProperty(element.trim())
                                                        && !$A.util.isEmpty(item.label[element.trim()])
                                                        && element.trim().toLowerCase() !== 'name') {
                                                        if (lowerText === '') {
                                                            lowerText = item.label[element.trim()];
                                                        } else {
                                                            lowerText += '&nbsp;&nbsp;' + '&bull;' + '&nbsp;&nbsp;' + escape(item.label[element.trim()].trim());
                                                        }
                                                    }
                                                });
                                            }
                                            return '<div class="slds-grid">' +
                                                   '<div class="slds-p-right--x-small slds-p-top--xxx-small">' +
                                                   '<img src="' + $A.get('$Resource.Framework__SLDS_Icons') +
                                                   '/icons/utility/user_60.png" width="12"/>' +
                                                   '</div>'+
                                                   '<div class="slds-grid slds-wrap slds-size--1-of-1">' +
                                                   '<div class="slds-col slds-size--1-of-1">' +
                                                   '<strong>' + escape(item.label.Name) + '</strong>' +
                                                   '</div>'+
                                                   '<div class="slds-col slds-size--1-of-1 slds-text-body--small">' +
                                                   lowerText +
                                                   '</div>' +
                                                   '</div>' +
                                                   '</div>';
                                        }
                                    }
                                }
                            }, function(cmp) {
                                cmp.set('v.value',component.get('v.value'));
                                component.find('bodycomp').set('v.body', cmp);
                                cmp.setSelectOptions(options);
                                setTimeout($A.getCallback(function(){
                                    cmp.setErrorMessages([{message: $A.get('$Label.LTE.Multiple_Accounts_Found')}]);
                                }),400);
                            }
                        );
                    }
                } else {
                    component.find('account').setErrorMessages([{message: $A.get('$Label.LTE.No_Accounts_Found')}]);
                }
            }
        });
        $A.enqueueAction(action);
    }
})