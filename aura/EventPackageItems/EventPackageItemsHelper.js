({
    doInit: function(cmp) {
        var itemWithPackagesIds = _.map(cmp.get('v.salesOrderObj.itemsWithPackages'), function(i) {return i.Id});
        var options = _.chain(cmp.get('v.salesOrderObj.assignments'))
            .map(function (a) {return _.map(a.lines, function(line){return {
                label: a.contactName, value: line.id, group: line.displayName, solId: line.id, itemId: line.itemId
            }})})
            .flatten()
            .value();

        // if ($A.util.isEmpty(options)) {
            options = options.concat(_.chain(cmp.get('v.salesOrderObj.assignments'))
                .map(function (a) {return a.lines;})
                .flatten()
                .map(function (a) {return _.map(a.childLines, function(line){return {
                    label: a.contactName, value: a.id, group: a.displayName, solId: line.id, scheduleItemId:line.scheduleItemId, itemId: line.itemId
                }})})
                .filter(function(line){return $A.util.isEmpty(line.scheduleItemId) })
                .flatten()
                .value());
            options = _.filter(options, function(o){return _.indexOf(itemWithPackagesIds, o.itemId) !== -1;});
       // }

        var groups = _.chain(cmp.get('v.salesOrderObj.assignments'))
            .map(function(a) {return a.lines})
            .flatten()
            .map(function(line) {return {label: line.displayName, value: line.displayName};})
            .value();
        groups = _.uniqBy(groups, function (g) {return g.value;});

        $A.createComponent('Framework:' + 'InputFields',
            {
                fieldType: 'advancedselectfield',
                'aura:id': 'attendeePicklist',
                isRequired: false,
                fireChangeEvent: true,
                labelStyleClasses: 'bold-label',
                selectOptions: options,
                value: cmp.get('v.attendee'),
                label: 'Attendees', //$A.get('$Label.LTE.Payment_Gateway_Label'),
                otherAttributes: {
                    selectOptions: options,
                    otherMethods: {
                        allowCreate: false,
                        create: false,
                        options: options,
                        optgroupField: 'group',
                        optgroups: groups,
                        onBlur: $A.getCallback(function() {
                            cmp.find('attendeePicklist').updateValue(cmp.get('v.lastNonBlankSOL'));
                        })
                    },
                    displayOptions: {
                        optgroup_header: function (data, escape) {
                            return '<div class="optgroup-header">' + escape(data.label) + '</div>';
                        }
                    }
                }
            }, function (newCmp) {
                newCmp.updateValue(options[0].value, false);
                var divComponent = cmp.find('attendeePicklistDiv');
                divComponent.set("v.body", [newCmp]);
            });
        if (options.length > 1 ) {
            $A.util.removeClass(cmp.find('attendeePicklistDiv'),'slds-hide');
        }
        this.filterItems(cmp, options[0].value, true);
        this.getSubPlans(cmp);
        this.setRequiredItemClassNames(cmp);
    },
    setRequiredItemClassNames : function(cmp) {
        var self = this;
        var salesOrderObj = cmp.get('v.salesOrderObj');
        var requiredItemClassErrorNames = [];
        if (!$A.util.isEmpty(salesOrderObj.lines)) {
            // Parent Lines
            _.forEach(salesOrderObj.lines, function (lineElement) {
                //Setting the itemMap for salesOrderObj
                self.filterItems(cmp, lineElement.id, false);
                if (!$A.util.isEmpty(salesOrderObj.itemsWithPackages)) {
                    // all child SOL Item Ids
                    var childSOLItemIds = _.map(lineElement.childLines, function(i) {return i.itemId});
                    var itemWithPackages = _.find(salesOrderObj.itemsWithPackages, {Id : lineElement.itemId});

                    if (!$A.util.isEmpty(itemWithPackages) && !$A.util.isEmpty(itemWithPackages.classIdItemMap)) {
                        // Item Class Package Items
                        _.forEach(itemWithPackages.classIdItemMap, function (itemClassPackageItem) {
                            if (!$A.util.isEmpty(itemClassPackageItem.pic) && itemClassPackageItem.pic.mustPurchase) {
                                var packageItemClassMessage = true;
                                if (childSOLItemIds.length > 0) {
                                    _.forEach(itemClassPackageItem.items, function (ItemClassPI_Item) {
                                        if (!$A.util.isEmpty(childSOLItemIds) && _.includes(childSOLItemIds, ItemClassPI_Item.packagedItemId)) {
                                            packageItemClassMessage = false;
                                            return false;
                                        }
                                    });
                                }
                                if (packageItemClassMessage) {
                                    var contactName;
                                    var assignmentName = _.find(salesOrderObj.assignments, {contactId : lineElement.contactId});
                                    if (!$A.util.isEmpty(assignmentName)) {
                                        contactName = assignmentName.contactName;
                                    }
                                    var existingPIClass = _.find(requiredItemClassErrorNames, {piId : itemClassPackageItem.pic.itemClassId});
                                    if (!$A.util.isEmpty(existingPIClass)) {
                                        existingPIClass['Contacts'].push({'attendeeName' : contactName});
                                    } else {
                                        requiredItemClassErrorNames.push({
                                            'piId' : itemClassPackageItem.pic.itemClassId,
                                            'Label' : itemClassPackageItem.pic.displayLabel,
                                            'Contacts' : [{'attendeeName' : contactName}]
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
        cmp.set('v.requiredItemClassErrorNames', requiredItemClassErrorNames);
    },
    getSubPlans: function(cmp) {
        var action = cmp.get('c.getPackageItemSubPlans');
        var subItems = _.chain(cmp.get('v.salesOrderObj.itemsWithPackages'))
            .map(function (i) {return i.packagedItems})
            .flatten()
            .filter(function (i) {return i.isSubscription})
            .map(function (i) {return i.packagedItemId})
            .value();
        action.setParams({
            itemIds: subItems
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                cmp.set('v.subPlans', result.getReturnValue());
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    addToCart: function(cmp, packageId, itemId, parentSOL) {
        var self = this;
        var pi = _.chain(cmp.get('v.salesOrderObj.itemsWithPackages'))
            .map(function(i) {return i.packagedItems})
            .flatten()
            .find(function(i){return i.id === packageId})
            .value();
        var item;
        if (itemId) {
            pi = _.chain(cmp.get('v.salesOrderObj.itemsWithPackages'))
                .map(function (i) {return i.packagedItemClasses})
                .flatten()
                .find(function (i) {return i.id === packageId})
                .value();

            item = _.find(cmp.get('v.salesOrderObj.itemsInPackagedClasses'), function(i) {return i.packagedItemId === itemId});
            pi.type = item.isSubscription ? 'sub' : item.isContribution ? 'donation' : 'merch';
            pi.packagedItemId = itemId;
            pi.imageUrl = item.imageUrl;
            pi.price = item.price;
            pi.className = item.className;
            pi.displayLabel = item.itemName;
            pi.itemName = item.itemName;
            pi.description = item.description;
            pi.formId = item.formId;
        }
        else {
            pi.type = pi.isSubscription ? 'sub' : pi.isContribution ? 'donation' : 'merch';
        }
        var subPlans = _.filter(cmp.get('v.subPlans'), function(s) { return s.itemId === pi.packagedItemId});
        cmp.find('itemModal').open(pi, subPlans, cmp.get('v.existingSOL'), parentSOL);
    },
    purchase: function(cmp) {
        var self = this;
        //do purchase
        var packageItem = cmp.find('itemModal').get('v.packageItem');
        var params = cmp.find('itemModal').get('v.params');
        if (packageItem.type === 'merch' && (!params.quantity || params.quantity === 0)) return;
        if (!$A.util.isUndefinedOrNull(cmp.find('itemModal').find('piForm'))) {
            var piFormObj = cmp.find('itemModal').find('piForm');
            if (_.isArray(cmp.find('itemModal').find('piForm'))) {
                piFormObj = cmp.find('itemModal').find('piForm')[0];
            }
            if (!piFormObj.validateOnly()) {
                cmp.find('itemModal').find('purchaseButton').stopIndicator();
                return;
            }
        }
        if (!$A.util.isUndefinedOrNull(params.quantity)) {
            params.quantity = params.quantity.toString();
        }
        var action = cmp.get('c.purchasePackageItem');
        var attendeeCmp = cmp.find('attendeePicklist');
        action.setParams({
            soId: cmp.get('v.salesOrderObj.id'),
            parentSolId: attendeeCmp && attendeeCmp.get('v.value') ? attendeeCmp.get('v.value').attendeePicklist : params.parentSOL,
            existingLineId: cmp.get('v.existingSOL.id'),
            quantity: params.quantity,
            subPlanId: params.subPlanId,
            autoRenew: params.autoRenew || false,
            donationAmount: params.donationAmount,
            packageItemId: packageItem.packagedItemId,
            packageId: packageItem.id
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var solIds = result.getReturnValue();
                if (!$A.util.isEmpty(solIds) && !$A.util.isUndefinedOrNull(cmp.find('itemModal').find('piForm'))) {
                    var piFormObj = cmp.find('itemModal').find('piForm');
                    if (_.isArray(cmp.find('itemModal').find('piForm'))) {
                        piFormObj = cmp.find('itemModal').find('piForm')[0];
                    }
                    piFormObj.set('v.subjectId',solIds);
                    piFormObj.set('v.contactId',cmp.get('v.currentContact'));
                    piFormObj.submitForm();
                }
                cmp.find('itemModal').close();
                //fire summary update event
                var event = $A.get('e.LTE:EventSummaryUpdateEvent');
                event.fire();

                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    message: $A.get("$Label.LTE.Event_Package_Item_Success").replace('{0}', packageItem.itemName),
                    type: 'success'
                });
                toastEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    filterItems: function(cmp, solId, onInit) {
        var packageItemArr = [];
        if (!$A.util.isEmpty(cmp.get('v.salesOrderObj.assignments'))) {
            cmp.get('v.salesOrderObj.assignments').forEach(function(assignmentElement){
                assignmentElement.lines.forEach(function(element){
                   if (element.id === solId) {
                       cmp.set('v.currentContact',element.contactId);
                       packageItemArr.push(element.itemId);
                       if (!$A.util.isEmpty(element.childLines)) {
                           element.childLines.forEach(function(childElement){
                              packageItemArr.push(childElement.itemId);
                           });
                       }
                   }
                });
            });
        }
        var filteredAndMappedItems = [];
        packageItemArr.forEach(function(element){
            filteredAndMappedItems.push(_.chain(cmp.get('v.salesOrderObj.itemsWithPackages'))
                .filter(function (item) {return item.Id === element})
                .map(function (item) {item.classIdItemMap = _.chain(item.packagedItemClasses)
                    .map(function (pic) {
                        return {
                            'pic': pic,
                            items: _.filter(cmp.get('v.salesOrderObj.itemsInPackagedClasses'), {classId : pic.itemClassId})
                        }
                    }).value();

                    return item;})
                .value());
        });

        if (onInit) {
            var filteredItems = [];
            if (!$A.util.isEmpty(filteredAndMappedItems)) {
                filteredAndMappedItems.forEach(function(element){
                    if (!$A.util.isEmpty(element)) {
                        filteredItems.push(element[0]);
                    }
                });
            }
            cmp.set('v.filteredItems', filteredItems);
            this.loadSlider(cmp);
        }
    },
    toolbarEvent: function() {
        var toolBarEvent = $A.get('e.LTE:RegistrationToolbarUpdateEvent');
        if (compName === 'LTE:EventAgenda') {
            toolBarEvent.setParams({
                total: salesOrderObj.total,
                title: $A.get('$Label.LTE.Event_Agenda')
            });
        }
        else {
            toolBarEvent.setParams({
                total: salesOrderObj.total,
                title: $A.get('$Label.LTE.Registration_Summary')
            });
        }
        toolBarEvent.fire();
    },
    next: function(cmp) {
        var compEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
        compEvent.setParams({salesOrderObj : cmp.get('v.salesOrderObj'), action  : 'next'});
        compEvent.fire();
    },
    prev: function(cmp) {
        var compEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
        compEvent.setParams({ action  : 'previous'});
        compEvent.fire();
    },
    openItemModal: function (cmp) {
        var modalEvent = $A.get("e.LTE:ModalContentEvent");
        modalEvent.fire();
    },
    loadSlider: function (cmp) {
        setTimeout($A.getCallback(function () {
            var sliders = document.querySelectorAll('.fonteva-slider');
            var item = document.querySelectorAll('.item-name');
            var count = 40;

            _.each(sliders, function (value) {
                var slider = tns({
                    container: value,
                    gutter: 8,
                    fixedWidth: 160,
                    lazyLoad: true,
                    mouseDrag : true,
                    loop: false,
                    controlsText: ['<i class="fa fa-angle-left fa-2x"></i>', '<i class="fa fa-angle-right fa-2x"></i>'],
                });
            });
            for (var i = 0; i < item.length; i++) {
                if (item[i].innerHTML.length > count) {
                    var newStr = item[i].innerHTML.substring(0, count);
                    item[i].innerHTML = newStr + '...';
                }
            }
        }), 200); //fudge time for the DOM to load
    }
})