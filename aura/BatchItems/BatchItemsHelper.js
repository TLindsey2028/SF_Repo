({
    getBatchItems : function(component) {
        component.set("v.refresh", false);
        component.set("v.popupGo", false);
        component.set("v.popped", false);
        var close = component.get("v.close");
        var cStep = component.get("v.closeStep");
        if (cStep <= 1) {
            var action = component.get("c.getBatchItems");
            action.setParams({
                "batchId": component.get("v.batchId"),
                "sortBy": component.get("v.currentSort"),
                "sortOrder": component.get("v.currentOrder"),
                "closing": component.get("v.close"),
                "batch":  component.get("v.batch")
            });
            action.setCallback(this, function(data) {
                component.set("v.batchItems", data.getReturnValue());
                if (close) {
                    var t = component.get("v.batchItems");
                    if (t.length == 0) {
                        cStep = 2;
                        component.set("v.closeStep", 2);
                        this.getCloseError(component);
                    }
                }
            });
            $A.enqueueAction(action);
        }
        else if (cStep == 2) {
            this.getCloseError(component);
        }
    },
    
    getCloseError : function(component) {
        var action2 = component.get("c.getCloseError");
        action2.setParams({
            "batch":  component.get("v.batch")
        });
        action2.setCallback(this, function(data) {
            component.set("v.closeError1", '');
            component.set("v.closeError2", '');
            component.set("v.closeError3", '');
            if (data.getReturnValue() == '')
                component.set("v.closeStep", 3);
            else {
                var split = data.getReturnValue().split('^');
                for (var i in split) {  
                    if (i == 0)
                        component.set("v.closeError1", split[i]);
                    else if (i == 1)
                        component.set("v.closeError2", split[i]);
                        else if (i == 2)
                            component.set("v.closeError3", split[i]);
                }
            }
        });
        $A.enqueueAction(action2);            
    },
    
    setDefaults: function(component) {
        var batch = component.get("v.batch");
        if (batch.AQB__DefaultEntryType__c == '' || batch.AQB__DefaultEntryType__c == null)
            component.set("v.newItem.AQB__Method__c", 'Check');
        else
            component.set("v.newItem.AQB__Method__c", batch.AQB__DefaultEntryType__c);
        component.set("v.newItem.AQB__CampaignAppeal__c", batch.AQB__DefaultCampaignAppeal__c);
        component.set("v.newItem.AQB__ChartOfAccounts__c", batch.AQB__DefaultChartofAccounts__c);
        component.set("v.newItem.AQB__Acknowledgement__c", batch.AQB__DefaultAcknowledgement__c);
        //component.set("v.newItem.AQB__Amount__c", batch.AQB__DefaultAmount__c);
        component.set("v.newItem.AQB__Currency__c", batch.AQB__DefaultCurrency__c);
        if (batch.AQB__DefaultCurrency__c != null)
            component.set("v.currency", batch.AQB__DefaultCurrency__r.Name);
        else
            component.set("v.currency", '');
        component.set("v.newItem.AQB__Description__c", batch.AQB__DefaultDescription__c);
        component.set("v.newItem.AQB__CheckNumber__c", '');
        component.set("v.newItem.AQB__Reference__c", '');
        component.set("v.newItem.AQB__Anonymous__c", false);
        component.set("v.newItem.AQB__Account__c", '');               
        component.set("v.newItem.AQB__Account__r", '');  
        component.set("v.voidAndCorrect", false);
        this.updateTender(component, false);
        //var elem = component.find("inputAccountLookup").getElement().focus();
    },
   
    updateTender: function(component, payment) {
        var c;
        if (component.get("v.voidAndCorrect") == true) {
            var t = component.get("v.voidTransaction");
            c = t.AQB__Method__c;
            component.set("v.newItem.AQB__Method__c", t.AQB__Method__c);
            component.set("v.newItem.AQB__CampaignAppeal__c", t.AQB__CampaignAppeal__c);
            component.set("v.newItem.AQB__ChartOfAccounts__c", t.AQB__ChartofAccounts__c);
            component.set("v.newItem.AQB__Acknowledgement__c", t.AQB__Acknowledgement__c);
            if (t.AQB__Method__c == 'Pledge' || t.AQB__Method__c == 'Grant')
                component.set("v.newItem.AQB__Amount__c", t.AQB__Balance__c);
            else
                component.set("v.newItem.AQB__Amount__c", t.AQB__Amount__c);
            component.set("v.newItem.AQB__Description__c", t.AQB__Description__c);
            component.set("v.newItem.AQB__CheckNumber__c", t.AQB__CheckNumber__c);
            component.set("v.newItem.AQB__Reference__c", t.AQB__Reference__c);
            component.set("v.newItem.AQB__CreditCard__c", t.AQB__Card__c);
            component.set("v.newItem.AQB__DailyHigh__c", t.AQB__DailyHigh__c);
            component.set("v.newItem.AQB__DailyLow__c", t.AQB__DailyLow__c);
            component.set("v.newItem.AQB__DateDue__c", t.AQB__DateDue__c);
            component.set("v.newItem.AQB__PledgeStartDate__c", t.AQB__DateDue__c);
            component.set("v.newItem.AQB__DateOfTransfer__c", t.AQB__DateofTransfer__c);
            component.set("v.newItem.AQB__ExpirationMonth__c", t.AQB__ExpirationMonth__c);
            component.set("v.newItem.AQB__ExpirationYear__c", t.AQB__ExpirationYear__c);
            component.set("v.newItem.AQB__Hours__c", t.AQB__Hours__c);
            component.set("v.newItem.AQB__Last4DigitsOnCard__c", t.AQB__Last4DigitsOnCard__c);
            component.set("v.newItem.AQB__NameOnCard__c", t.AQB__NameonCard__c);
            component.set("v.newItem.AQB__NumberOfShares__c", t.AQB__NumberofShares__c);
            component.set("v.newItem.AQB__PledgeType__c", t.AQB__PledgeStipulation__c);
            component.set("v.newItem.AQB__Transaction1PropertyCategory__c", t.AQB__PropertyCategory__c);
            component.set("v.newItem.AQB__Rate__c", t.AQB__Rate__c);
            component.set("v.newItem.AQB__ServiceType__c", t.AQB__Service_Type__c);
            component.set("v.newItem.AQB__TickerSymbol__c", t.AQB__TickerSymbol__c);
        }
        else if (payment)
            c = component.get("v.newItem.AQB__PaymentMethod__c");
        else {
            c = component.get("v.newItem.AQB__Method__c");
            if (c == 'Planned Gift' && component.get("v.currentLinkIndicator") == 'PlannedGift')
                c = component.get("v.newItem.AQB__PaymentMethod__c");
        }
        // get fieldSet
        /*var action = component.get("c.getFields");
        action.setParams({
            "method": "AQB__" + c
        });
        action.setCallback(this, function(data) {
            var field;
            var fieldSet = '';
            var fields = data.getReturnValue();
            alert(fields);
        });
        $A.enqueueAction(action);*/
        
        component.set("v.addSoftCredit", false);
        component.set("v.pledgeSchedule", 0);
        var sLabel = component.find('pScheduleLabel'); 
        var sField = component.find('pScheduleField'); 
        var nLabel = component.find('pWriteOffNotationLabel');
        var nField = component.find('pWriteOffNotationField');
        var mpLabel = component.find('mpMethodLabel'); 
        var mpField = component.find('mpMethodField'); 
        var pgLabel = component.find('pgMethodLabel'); 
        var pgField = component.find('pgMethodField'); 
        var omField = component.find('inputMethod2'); 
        $A.util.addClass(mpLabel, 'slds-hide'); 
        $A.util.addClass(mpField, 'slds-hide'); 
        $A.util.addClass(pgLabel, 'slds-hide'); 
        $A.util.addClass(pgField, 'slds-hide'); 
        $A.util.addClass(omField, 'slds-hide'); 
        document.getElementById("transform").style.display="none";
        document.getElementById("matchform").style.display="none";
        if (component.get("v.currentLinkIndicator") == 'AddTransaction') {
            var aLabel = component.find('aScheduleLabel'); 
            var aField = component.find('aScheduleField'); 
            $A.util.addClass(aLabel, 'slds-hide'); 
            $A.util.addClass(aField, 'slds-hide'); 
        	document.getElementById("addTransForm").style.display="block";   
        }
        else
        	document.getElementById("addTransForm").style.display="none";
        component.set("v.newItem.AQB__SendPledgeReminder__c", false);
        if (c == 'Cash' || c == 'Check' || c == 'ACH' || c == 'Wire' || c == 'PayPal' || c == 'Personal Property' 
            || c == 'Real Property' || c == 'Payroll Deduction' || c == 'Soft Credit - This Account' || c == 'Transfer') {
            $A.util.addClass(sLabel, 'slds-hide'); 
            $A.util.addClass(sField, 'slds-hide'); 
            $A.util.addClass(nLabel, 'slds-hide'); 
            $A.util.addClass(nField, 'slds-hide'); 
            document.getElementById("form1").style.display="block";
            document.getElementById("pledgeform").style.display="none";
            document.getElementById("ccform").style.display="none";
            document.getElementById("serviceform").style.display="none";
            document.getElementById("securitiesform").style.display="none";
            document.getElementById("pledgePaymentForm").style.display="none";
            document.getElementById("writeOffForm").style.display="none";
            document.getElementById("voidForm").style.display="none";
            var label = component.find('checkLabel'); 
            var field = component.find('checkField'); 
            if (c == 'Check') {
                $A.util.removeClass(label, 'slds-hide'); 
                $A.util.removeClass(field, 'slds-hide'); 
            }
            else {
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
            }
            label = component.find('referenceLabel'); 
            field = component.find('referenceField'); 
            if (c == 'ACH' || c == 'Wire' || c == 'PayPal' || c == 'Transfer') {
                $A.util.removeClass(label, 'slds-hide'); 
                $A.util.removeClass(field, 'slds-hide'); 
            }
            else {
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
            }      
            field = component.find('originsField'); 
            if (c == 'Transfer') {
                $A.util.removeClass(label, 'slds-hide'); 
                $A.util.removeClass(field, 'slds-hide'); 
            }
            else {
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
            }      
            label = component.find('pCategoryLabel'); 
            field = component.find('pCategoryField'); 
            if (c == 'Personal Property' || c == 'Real Property') {
                $A.util.removeClass(label, 'slds-hide'); 
                $A.util.removeClass(field, 'slds-hide'); 
            }
            else {
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
            }      
            if (component.get("v.addPayment") == true) {
                label = component.find('campaignLabel'); 
                field = component.find('campaignField'); 
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
                label = component.find('designationLabel'); 
                field = component.find('designationField'); 
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
                label = component.find('anonyLabel'); 
                field = component.find('anonyField'); 
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
            }
            if (component.get("v.batch.AQB__GiftDate__c") == true || component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                document.getElementById("tempFieldSet1").style.display="block";
                var label = component.find('gDateLabel'); 
                var field = component.find('gDateField'); 
                if (component.get("v.batch.AQB__GiftDate__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide'); 
                }
                label = component.find('bbDateLabel'); 
                field = component.find('bbDateField'); 
                if (component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide');     
                }
            }
        }
        else if (c == 'Pledge' || c == 'Grant') {
            component.set("v.pledgeSchedule", 1);
            var Label = document.getElementById("pScheduleLabel");
            if (c == 'Pledge')
                Label.innerHTML = 'Pledge Schedule Type';
            else
                Label.innerHTML = 'Grant Schedule Type';
            if (c == 'Pledge')
            	component.set("v.newItem.AQB__SendPledgeReminder__c", true);
            else {
                Label = document.getElementById("pAmountLabel");
                Label.innerHTML = 'Total Grant';  
            }
            var field = component.find('annonField'); 
            if (c == 'Pledge') {
                $A.util.removeClass(label, 'slds-hide'); 
                $A.util.removeClass(field, 'slds-hide'); 
            }
            else {
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
            }
            document.getElementById("form1").style.display="none";
            document.getElementById("pledgeform").style.display="none";
            document.getElementById("ccform").style.display="none";
            document.getElementById("securitiesform").style.display="none";
            document.getElementById("serviceform").style.display="none";
            document.getElementById("pledgePaymentForm").style.display="none";
            document.getElementById("writeOffForm").style.display="none";
            document.getElementById("voidForm").style.display="none";
            if (component.get("v.voidAndCorrect") == true) {
                document.getElementById("pledgeform").style.display="block";
                $A.util.addClass(sLabel, 'slds-hide'); 
                $A.util.addClass(sField, 'slds-hide'); 
                var sLabel = component.find('pPaymentLabel'); 
                var sField = component.find('pPaymentField'); 
                var dLabel = component.find('pEndDateLabel'); 
                var dField = component.find('pEndDateField'); 
                var iLabel = component.find('pIntervalLabel'); 
                var iField = component.find('pIntervalField'); 
                var fLabel = component.find('pFrequencyLabel'); 
                var fField = component.find('pFrequencyField'); 
                $A.util.addClass(iLabel, 'slds-hide'); 
                $A.util.addClass(iField, 'slds-hide'); 
                $A.util.addClass(fLabel, 'slds-hide'); 
                $A.util.addClass(fField, 'slds-hide'); 
                $A.util.addClass(sLabel, 'slds-hide'); 
                $A.util.addClass(sField, 'slds-hide'); 
                $A.util.addClass(dLabel, 'slds-hide'); 
                $A.util.addClass(dField, 'slds-hide'); 
                var Label = document.getElementById("pAmountLabel");
                if (c == 'Pledge')
                	Label.innerHTML = 'Total Pledge';
                else
                    Label.innerHTML = 'Total Grant';
                Label = document.getElementById("pDueLabel");
                Label.innerHTML = 'Due Date';
            }
            else if (component.get("v.currentLinkIndicator") == 'AddTransaction') {
                $A.util.addClass(sLabel, 'slds-hide'); 
                $A.util.addClass(sField, 'slds-hide'); 
                sLabel = component.find('aScheduleLabel'); 
        		sField = component.find('aScheduleField'); 
        		$A.util.removeClass(sLabel, 'slds-hide'); 
                $A.util.removeClass(sField, 'slds-hide'); 
            }
            else {
                $A.util.removeClass(sLabel, 'slds-hide'); 
                $A.util.removeClass(sField, 'slds-hide'); 
            }
            $A.util.addClass(nLabel, 'slds-hide'); 
            $A.util.addClass(nField, 'slds-hide'); 
            sLabel = component.find('pPaymentLabel'); 
            sField = component.find('pPaymentField'); 
            $A.util.addClass(sLabel, 'slds-hide'); 
            $A.util.addClass(sField, 'slds-hide'); 
            if (component.get("v.batch.AQB__GiftDate__c") == true || component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                document.getElementById("tempFieldSetP").style.display="block";
                var label = component.find('pgDateLabel'); 
                var field = component.find('pgDateField'); 
                if (component.get("v.batch.AQB__GiftDate__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide'); 
                }
                label = component.find('pbbDateLabel'); 
                field = component.find('pbbDateField'); 
                if (component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide');     
                }
            }
        }
        else if (c == 'Credit Card') {
            $A.util.addClass(sLabel, 'slds-hide'); 
            $A.util.addClass(sField, 'slds-hide'); 
            $A.util.addClass(nLabel, 'slds-hide'); 
            $A.util.addClass(nField, 'slds-hide'); 
            document.getElementById("form1").style.display="none";
            document.getElementById("pledgeform").style.display="none";
            document.getElementById("ccform").style.display="block";
            document.getElementById("securitiesform").style.display="none";
            document.getElementById("serviceform").style.display="none";
            document.getElementById("pledgePaymentForm").style.display="none";
            document.getElementById("writeOffForm").style.display="none";
            document.getElementById("voidForm").style.display="none";
            if (component.get("v.addPayment") == true) {
                label = component.find('cCampaignLabel'); 
                field = component.find('cCampaignField'); 
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
                label = component.find('cDesignationLabel'); 
                field = component.find('cDesignationField'); 
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
                label = component.find('cAnonyLabel'); 
                field = component.find('cAnonyField'); 
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
            }
            if (component.get("v.batch.AQB__GiftDate__c") == true || component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                document.getElementById("tempFieldSetCC").style.display="block";
                var label = component.find('cgDateLabel'); 
                var field = component.find('cgDateField'); 
                if (component.get("v.batch.AQB__GiftDate__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide'); 
                }
                label = component.find('cbbDateLabel'); 
                field = component.find('cbbDateField'); 
                if (component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide');     
                }
            }
        }
        else if (c == 'Securities') {
            $A.util.addClass(sLabel, 'slds-hide'); 
            $A.util.addClass(sField, 'slds-hide'); 
            $A.util.addClass(nLabel, 'slds-hide'); 
            $A.util.addClass(nField, 'slds-hide'); 
            document.getElementById("form1").style.display="none";
            document.getElementById("pledgeform").style.display="none";
            document.getElementById("ccform").style.display="none";
            document.getElementById("securitiesform").style.display="block";
            document.getElementById("serviceform").style.display="none";
            document.getElementById("pledgePaymentForm").style.display="none";
            document.getElementById("writeOffForm").style.display="none";
            document.getElementById("voidForm").style.display="none";
            if (component.get("v.addPayment") == true) {
                label = component.find('sCampaignLabel'); 
                field = component.find('sCampaignField'); 
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
                label = component.find('sDesignationLabel'); 
                field = component.find('sDesignationField'); 
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
                label = component.find('sAnonyLabel'); 
                field = component.find('sAnonyField'); 
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide'); 
            }
            if (component.get("v.batch.AQB__GiftDate__c") == true || component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                document.getElementById("tempFieldSetSec").style.display="block";
                var label = component.find('sgDateLabel'); 
                var field = component.find('sgDateField'); 
                if (component.get("v.batch.AQB__GiftDate__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide'); 
                }
                label = component.find('sbbDateLabel'); 
                field = component.find('sbbDateField'); 
                if (component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide');     
                }
            }
        }
        else if (c == 'Service') {
            $A.util.addClass(sLabel, 'slds-hide'); 
            $A.util.addClass(sField, 'slds-hide'); 
            $A.util.addClass(nLabel, 'slds-hide'); 
            $A.util.addClass(nField, 'slds-hide'); 
            document.getElementById("form1").style.display="none";
            document.getElementById("pledgeform").style.display="none";
            document.getElementById("ccform").style.display="none";
            document.getElementById("securitiesform").style.display="none";
            document.getElementById("serviceform").style.display="block";
            document.getElementById("pledgePaymentForm").style.display="none";
            document.getElementById("writeOffForm").style.display="none";
            document.getElementById("voidForm").style.display="none";
            if (component.get("v.batch.AQB__GiftDate__c") == true || component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                document.getElementById("tempFieldSetSer").style.display="block";
                var label = component.find('rgDateLabel'); 
                var field = component.find('rgDateField'); 
                if (component.get("v.batch.AQB__GiftDate__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide'); 
                }
                label = component.find('rbbDateLabel'); 
                field = component.find('rbbDateField'); 
                if (component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide');     
                }
            }
        }
        else if (c == 'Pledge Write Off') {
            $A.util.addClass(sLabel, 'slds-hide'); 
            $A.util.addClass(sField, 'slds-hide'); 
            $A.util.removeClass(nLabel, 'slds-hide'); 
            $A.util.removeClass(nField, 'slds-hide'); 
            document.getElementById("form1").style.display="none";
            document.getElementById("pledgeform").style.display="none";
            document.getElementById("ccform").style.display="none";
            document.getElementById("securitiesform").style.display="none";
            document.getElementById("serviceform").style.display="none";
            document.getElementById("pledgePaymentForm").style.display="none";
            document.getElementById("writeOffForm").style.display="none";
            document.getElementById("voidForm").style.display="none";
            if (component.get("v.newItem").AQB__Account__c == '') {
                this.showError(component, "You must enter an Account.");
                return;
            }        
        }
        else if (c == 'Void' || c == 'Matching Gift' || c == 'Matching Gift Payment' || c == 'Planned Gift' ||
                 c == 'Add Transaction to Existing Gift' || c == 'Soft Credit - Other Account' || 
                 c == 'Convert Gift to Pledge Payment') {
            $A.util.addClass(sLabel, 'slds-hide'); 
            $A.util.addClass(sField, 'slds-hide'); 
            $A.util.addClass(nLabel, 'slds-hide'); 
            $A.util.addClass(nField, 'slds-hide'); 
            document.getElementById("form1").style.display="none";
            document.getElementById("pledgeform").style.display="none";
            document.getElementById("ccform").style.display="none";
            document.getElementById("securitiesform").style.display="none";
            document.getElementById("serviceform").style.display="none";
            document.getElementById("pledgePaymentForm").style.display="none";
            document.getElementById("writeOffForm").style.display="none";
            document.getElementById("voidForm").style.display="none";
            if (component.get("v.newItem").AQB__Account__c == '') {
                this.showError(component, "You must enter an Account.");
                return;
            }
            if (c == 'Convert Gift to Pledge Payment') {
                var action = component.get("c.getGiftTransactions");
                action.setParams({
                    "accountId": component.get("v.newItem").AQB__Account__c
                });
                action.setCallback(this, function(data) {
                    component.set("v.currentLinkIndicator", 'Convert');
                    component.set("v.giftTransactions", data.getReturnValue());
                    var trans = component.get("v.giftTransactions");
                    if (trans.length == 0)
                        this.showError(component, "This Account does not have any gifts to Convert.");
                    else {
                        component.set("v.popped", true);
                        component.set("v.currentAccountName", trans[0].AQB__Account__r.Name);
                        this.showPopupHelper(component, 'giftTransactionDialog', 'slds-fade-in-');
                    }
                });
                $A.enqueueAction(action);
            }
            if (c == 'Void') {
                var action = component.get("c.getVoidGifts");
                action.setParams({
                    "accountId": component.get("v.newItem").AQB__Account__c
                });
                action.setCallback(this, function(data) {
                    component.set("v.currentLinkIndicator", 'Void');
                    component.set("v.gifts", data.getReturnValue());
                    if (component.get("v.gifts").length == 0)
                        this.showError(component, "This Account does not have any gifts to Void.");
                    else {
                        component.set("v.popped", true);          
                        this.showPopupHelper(component, 'giftSelectDialog', 'slds-fade-in-');
                    }
                });
                $A.enqueueAction(action);
            }
            else if (c == 'Matching Gift' || c == 'Add Transaction to Existing Gift' || 
                     c == 'Soft Credit - Other Account') {
                var action = component.get("c.getGiftsToDisplay");
                action.setParams({
                    "accountId": component.get("v.newItem").AQB__Account__c
                });
                action.setCallback(this, function(data) {
                    if (c == 'Matching Gift') 
                        component.set("v.currentLinkIndicator", 'MatchGift');
                    else if (c == 'Add Transaction to Existing Gift')
                        component.set("v.currentLinkIndicator", 'AddTransaction');
                    else 
                        component.set("v.currentLinkIndicator", 'Credit4Other');
                    component.set("v.gifts", data.getReturnValue());
                    if (component.get("v.gifts").length == 0) {
                        if (c == 'Matching Gift')
                            this.showError(component, "This Account does not have any gifts to Match.");
                        else if (c == 'Add Transaction to Existing Gift')
                            this.showError(component, "This Account does not have any gifts therefore you cannot add a transaction to an existing gift.");
                        else
                            this.showError(component, "This Account does not have any gifts therefore you cannot give a soft credit to another.");
                    }
                    else {
                        component.set("v.popped", true);   
                        this.showPopupHelper(component, 'giftSelectDialog', 'slds-fade-in-');
                    }
                });
                $A.enqueueAction(action);
                if (component.get("v.batch.AQB__GiftDate__c") == true || component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                    document.getElementById("tempFieldSetMG").style.display="block";
                    var label = component.find('mgDateLabel'); 
                    var field = component.find('mgDateField'); 
                    if (component.get("v.batch.AQB__GiftDate__c") == true) {
                        $A.util.removeClass(label, 'slds-hide'); 
                        $A.util.removeClass(field, 'slds-hide'); 
                    }
                    else {
                        $A.util.addClass(label, 'slds-hide'); 
                        $A.util.addClass(field, 'slds-hide'); 
                    }
                    label = component.find('mbbDateLabel'); 
                    field = component.find('mbbDateField'); 
                    if (component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                        $A.util.removeClass(label, 'slds-hide'); 
                        $A.util.removeClass(field, 'slds-hide'); 
                    }
                    else {
                        $A.util.addClass(label, 'slds-hide'); 
                        $A.util.addClass(field, 'slds-hide');     
                    }
                }
            }
            else if (c == 'Matching Gift Payment') {
                $A.util.removeClass(mpLabel, 'slds-hide'); 
                $A.util.removeClass(mpField, 'slds-hide'); 
            }
            else if (c == 'Planned Gift') {
                $A.util.removeClass(pgLabel, 'slds-hide'); 
                $A.util.removeClass(pgField, 'slds-hide'); 
            }
        }
    },
    
    goSaveNewTransaction: function(component, event) {
        component.set("v.saveOK", false);
        this.checkRequiredFields(component);
        var ok = component.get("v.saveOK");
        if (ok) {
            // Set conditonal flag
            var con = component.get("v.newItem.AQB__PledgeType__c");
            if (con == 'Conditional' || con == 'Statement of Intent')
                component.set("v.newItem.AQB__ConditionalPledge__c", true);
            // Get Values from Batch
            component.set("v.newItem.AQB__Batch__c", component.get("v.batchId"));
            //component.set("v.newItem.AQB__Date__c", component.get("v.batch.AQB__BatchDate__c"));
            component.set("v.newItem.AQB__Acknowledgement__c", component.get("v.batch.AQB__DefaultAcknowledgement__c"));
            if (component.get("v.saveStatus") != "saveWhenDone")
            	component.set("v.saveButton", event.getSource());
            if (component.get("v.newItem.AQB__Method__c") == 'Matching Gift') {
                component.set("v.newItem.AQB__ConditionalPledge__c", true);
                component.set("v.newItem.AQB__MatchingGift__c", true);      
                this.finishSaveNewTransaction(component);
            }
            else if (component.get("v.voidAndCorrect") == true) {
                this.saveVoidAndCorrect(component);
            }
            else {
                component.set("v.newItem.AQB__CampaignAppeal__c", component.get("v.batch.AQB__DefaultCampaignAppeal__c"));
                component.set("v.newItem.AQB__ChartOfAccounts__c", component.get("v.batch.AQB__DefaultChartofAccounts__c"));
                this.showOpenStuff(component);
            }
        }
        else {
            var pNum = component.get("v.pledgeSchedule");
            if (pNum > 1) {
                pNum -= 1;
                component.set("v.pledgeSchedule", pNum);
            }
        }
    },
    
    showOpenStuff: function(component) {
        if (component.get("v.newItem.AQB__Method__c") == 'Planned Gift' || component.get("v.currentLinkIndicator") == 'AddTransaction')
            this.finishSaveNewTransaction(component);
        else {
            component.set("v.popupGo", true);
            //component.set("v.currentAccountName", component.find("inputAccountLookup").get("v.value"));
            
            var action = component.get("c.getOpenOpportunities");
            action.setParams({
                "accountId": component.get("v.newItem.AQB__Account__c"),
                "opportunityId": null
            });
            action.setCallback(this, function(data) {
                component.set("v.openOpportunities", data.getReturnValue());
                component.set("v.openPledges.length", 0); 
                var m = component.get("v.newItem").AQB__Method__c;
                if (m != 'Pledge' && m != 'Cash' && m != 'Check' && m != 'Credit Card' && m != 'ACH' && m != 'Wire' && m != 'Soft Credit - This Account' &&
                    m != 'PayPal' && m != 'Payroll Deduction' && m != 'Personal Property' && m != 'Real Property' && m != 'Securities' && m != 'Transfer' && m != 'Grant') {
                    var action = component.get("c.getOpenPledges");
                    action.setParams({
                        "accountId": component.get("v.newItem.AQB__Account__c"),
                        "pledgeId": null
                    });
                    action.setCallback(this, function(data) {
                        component.set("v.openPledges", data.getReturnValue());
                        var o = component.get("v.openOpportunities");
                        var p = component.get("v.openPledges");
                        if (o.length || p.length)                
                            this.showPopupHelper(component, 'openStuffDialog', 'slds-fade-in-');
                        else
                            this.finishSaveNewTransaction(component);
                    });
                    $A.enqueueAction(action);
                }
                else {
                    var o = component.get("v.openOpportunities");
                    if (o.length)                
                        this.showPopupHelper(component, 'openStuffDialog', 'slds-fade-in-');
                    else
                        this.finishSaveNewTransaction(component);
                }
            });
            $A.enqueueAction(action);
        }
    },  
    
    showSoftCredits:function(component) {
        var item = component.get("v.newItem");
        if (item.AQB__Method__c == 'Planned Gift' || item.AQB__Method__c == 'Soft Credit - This Account' || 
            item.AQB__Method__c == 'Pledge Write Off' || item.AQB__Method__c == 'Void' || 
            item.AQB__Method__c == 'Matching Gift' || item.AQB__Method__c == 'Matching Gift Payment') {
            $A.get('e.force:refreshView').fire();
            //helper.getBatchItems(component);  
            //helper.setDefaults(component);
        }
        else {
            if (component.get("v.postAsPayment") == true) {
                var action = component.get("c.getCheckPledge4SoftCredit");
                action.setParams({
                    "pledgeID": component.get("v.newItem.AQB__LinkToPledge__c")
                });
                action.setCallback(this, function(data) {
                    var ret = data.getReturnValue();
                    if (ret == 'False') {
                        this.search4SoftCredits(component);         
                    }
                    else {
                        $A.get('e.force:refreshView').fire();
                        //helper.getBatchItems(component);  
                        //helper.setDefaults(component);
                    }
                });
                $A.enqueueAction(action);            
            }
            else {
                this.search4SoftCredits(component);
            }
        }
    },
    
    search4SoftCredits: function(component) {
        var action = component.get("c.getSoftCreditAccounts");
        action.setParams({
            "donorAccountID": component.get("v.newItem.AQB__Account__c")
        });
        action.setCallback(this, function(data) {
            component.set("v.softCreditAccounts", data.getReturnValue());
            var s = component.get("v.softCreditAccounts");
            if (s.length) {
                component.set("v.currentSoftCredit", 0);
                this.showSoftCreditOptions(component);          
            }
            else {
                $A.get('e.force:refreshView').fire();
                //helper.getBatchItems(component);  
                //helper.setDefaults(component);
            }
        });
        $A.enqueueAction(action);            
    },
    
    showSoftCreditOptions: function(component) {
        var acct;
        if (component.get("v.addSoftCredit") == true)
            acct = component.get("v.softCreditAccount.Id");
        else {
            var softCredits = component.get("v.softCreditAccounts");
            var index = component.get("v.currentSoftCredit");
            if (softCredits.length < index + 1) {
                $A.get('e.force:refreshView').fire();
                return;
                //helper.getBatchItems(component);  
                //helper.setDefaults(component);
            }
            else 
                acct = softCredits[index].AQB__Account__c;
        }
        if (component.get("v.addSoftCredit") == true && component.get("v.newItem.AQB__Method__c") == 'Pledge' || component.get("v.newItem.AQB__Method__c") == 'Grant') {
            component.set("v.scHeader", 'Manually Add Soft Credit');
            component.set("v.scAccount", component.get("v.softCreditAccount.Name"));
            component.set("v.accountOption", '');
            component.set("v.popped", true);
            this.showPopupHelper(component, 'softCreditDialog', 'slds-fade-in-');
        }
        else {
            var action = component.get("c.getOpenPledges");
            action.setParams({
                "accountId": acct,
                "pledgeId": null
            });
            action.setCallback(this, function(data) {
                component.set("v.openPledges", data.getReturnValue());
                if (component.get("v.addSoftCredit") ==  true) {
                    component.set("v.scAccount", component.get("v.softCreditAccount.Name"));
                	component.set("v.accountOption", '');
                    component.set("v.scHeader", 'Manually Add Soft Credit');
               		component.set("v.currentLinkIndicator", "verifySoftCredits2");
                }
                else {
                    component.set("v.scAccount", softCredits[index].AQB__Account__r.Name);
                    component.set("v.currentLinkIndicator", "verifySoftCredits");
                    component.set("v.scHeader", 'Soft Credit Options (' + (index + 1).toString() + ' of ' + softCredits.length.toString() + ')');
                }
                component.set("v.popped", true);
                this.showPopupHelper(component, 'softCreditDialog', 'slds-fade-in-');
            });
            $A.enqueueAction(action);    
        }
    },
    
    showCreditOptions4Other: function(component) {
        if (component.get("v.selectedGift.RecordType.Name") == 'Pledge' || component.get("v.selectedGift.RecordType.Name") == 'Grant') {
            if (component.get("v.selectedGift.RecordType.Name") == 'Pledge')
            	component.set("v.newItem.AQB__Method__c", 'Pledge');
            else
            	component.set("v.newItem.AQB__Method__c", 'Grant');
            component.set("v.scAccount", component.get("v.softCreditAccount.Name"));
            component.set("v.accountOption", '');
            component.set("v.scHeader", 'Add Soft Credit - Other Account');
            component.set("v.popped", true);
            this.showPopupHelper(component, 'softCreditDialog', 'slds-fade-in-');
        }
        else {
            var action = component.get("c.getOpenPledges");
            action.setParams({
                "accountId": component.get("v.softCreditAccount.Id"),
                "pledgeId": null
            });
            action.setCallback(this, function(data) {
                component.set("v.openPledges", data.getReturnValue());
                component.set("v.scAccount", component.get("v.softCreditAccount.Name"));
                component.set("v.accountOption", '');
                component.set("v.scHeader", 'Add Soft Credit - Other Account');
                component.set("v.popped", true);
                this.showPopupHelper(component, 'softCreditDialog', 'slds-fade-in-');
            });
            $A.enqueueAction(action);    
        }
    },
    
    checkRequiredFields: function(component) {
        // Required Fields
        var newtrans =  component.get("v.newItem");
        if (component.get("v.currentLinkIndicator") == 'AddTransaction') 
        	component.set("v.newItem.AQB__Method__c", component.get("v.newItem.AQB__PaymentMethod__c"));
                
        var method = newtrans.AQB__Method__c;
        if (method == 'Planned Gift' && newtrans.AQB__Instrument__c == '') {
            this.showError(component, "You must enter an Instrument.");
            return;
        }  
        if (method == 'Planned Gift' || component.get("v.addPayment") == true)
            method = newtrans.AQB__PaymentMethod__c;
        
        if (newtrans.AQB__Account__c == '') {
            this.showError(component, "You must enter an Account.");
            return;
        }  
        if (method == 'Matching Gift') {
            if (newtrans.AQB__CampaignAppeal__c == '') {
                this.showError(component, "You must enter the Campaign Appeal.");
                return;
            }        
        }
        else if (component.get("v.batch").AQB__DefaultCampaignAppeal__c == '') {
            this.showError(component, "You must enter the Campaign Appeal.");
            return;
        }        
        if (method == 'Matching Gift') {
            if (newtrans.AQB__ChartofAccounts__c == '') {
                this.showError(component, "You must enter the Designation.");
                return;
            }       
        }
        else if (component.get("v.batch").AQB__DefaultChartofAccounts__c == '') {
            this.showError(component, "You must enter the Designation.");
            return;
        }        
        if (component.get("v.batch").AQB__DefaultAcknowledgement__c == '') {
            this.showError(component, "You must enter an Acknowledgement Type.");
            return;
        }        
        if (method != 'Securities' && newtrans.AQB__Amount__c == null) {
            this.showError(component, "You must enter an Amount.");
            return;
        }        
        if ((method == 'Service' || method == 'Personal Property' || method == 'Real Property')
            && (newtrans.AQB__Description__c == '' || newtrans.AQB__Description__c == undefined)) {
            this.showError(component, "You must enter a Description.");
            return;
        }   
        if (method == 'Securities') {
            if (newtrans.AQB__TickerSymbol__c == '' || newtrans.AQB__TickerSymbol__c == undefined) {
                this.showError(component, "You must enter a Ticker Symbol.");
                return;
            }        
            if (newtrans.AQB__NumberOfShares__c == '' || newtrans.AQB__NumberOfShares__c == undefined) {
                this.showError(component, "You must enter the Number of Shares.");
                return;
            }        
            if (newtrans.AQB__DateOfTransfer__c == '' || newtrans.AQB__DateOfTransfer__c == undefined) {
                this.showError(component, "You must enter the Transfer Date.");
                return;
            }        
            else {
                var thedate = component.get("v.newItem.AQB__DateOfTransfer__c");
                var tdate = new Date(thedate);
                var fdate = (tdate.getMonth() + 1) + "/";  
                fdate += tdate.getDate() + "/";  
                fdate += tdate.getFullYear();  
                component.set("v.newItem.AQB__DateOfTransfer__c", fdate);	
            }
            if (newtrans.AQB__DailyLow__c == '' || newtrans.AQB__DailyLow__c == undefined) {
                this.showError(component, "You must enter the Daily Low.");
                return;
            }        
            if (newtrans.AQB__DailyHigh__c == '' || newtrans.AQB__DailyHigh__c == undefined) {
                this.showError(component, "You must enter the Daily High.");
                return;
            }        
            component.set("v.newItem.AQB__Amount__c", ((newtrans.AQB__DailyHigh__c + newtrans.AQB__DailyLow__c) / 2) * newtrans.AQB__NumberOfShares__c);
        }
        component.set("v.saveOK", true);
    },
    
    finishSaveNewTransaction: function(component) {
        var sButton = component.get("v.saveButton");
        sButton.set('v.label','Saving...');
        sButton.set("v.disabled", true);      
        component.set("v.popped", false);
        this.hidePopupHelper(component, 'openStuffDialog', 'slds-fade-in-');
        var getReturn = false;
        var pNum = component.get("v.pledgeSchedule");
        if (pNum == 2) {
            getReturn = true;
        }
        var action = component.get("c.getSaveBatchItem");
        action.setParams({
            "batchItem": component.get("v.newItem"),
            "returnData": getReturn
        });
        action.setCallback(this, function(data) {
            if (pNum == 2) {
                var ret = data.getReturnValue();
                var split = ret.split('^');
                if (split[0] == 'ERROR')
                    alert(split[1]);
                else {
                    component.set("v.itemId", split[0]);
                    component.set("v.currentAccountName", split[1]);
                    component.set("v.designation1", split[2]);
                    component.set("v.currentCampaign", split[3]);
                    component.set("v.currentAcknowledgement", split[4]);
                    component.set("v.itemTotal", split[5]);
                    if (component.get("v.addPayment") == true)
                        this.setupPayment(component);
                    else
                        this.setupAdditionalSchedule(component);
                }
            }
            else if (data.getReturnValue() != '') {
                var result = data.getReturnValue();
                var err = result.search(/error/i);
                if (err != -1)
                    alert(data.getReturnValue());
                else {  
                    component.set("v.itemId", data.getReturnValue());   
                    if (component.get("v.addSoftCredit") ==  true)
                        this.getAccountForCredit(component);
                    else
                        //this.showSoftCredits(component);
                        $A.get('e.force:refreshView').fire();
                }
            }
            else if (pNum > 1) {
                if (component.get("v.addPayment") == true)
                    this.setupPayment(component);
                else
                    this.setupAdditionalSchedule(component);
            }
            else {
                //this.showSoftCredits(component);
                $A.get('e.force:refreshView').fire();
                //helper.getBatchItems(component);  
                //helper.setDefaults(component);
            }
        });
        $A.enqueueAction(action);
    },
    
    saveVoidAndCorrect: function(component) {
        var sButton = component.get("v.saveButton");
        sButton.set('v.label','Saving...');
        sButton.set("v.disabled", true);  
        component.set("v.newItem.AQB__Batch__c", component.get("v.batchId"));
        component.set("v.newItem.AQB__Date__c", component.get("v.batch.AQB__BatchDate__c"));
        component.set("v.newItem.AQB__CampaignAppeal__c", component.get("v.batch.AQB__DefaultCampaignAppeal__c"));
        component.set("v.newItem.AQB__ChartOfAccounts__c", component.get("v.batch.AQB__DefaultChartofAccounts__c"));
        component.set("v.newItem.AQB__Acknowledgement__c", component.get("v.batch.AQB__DefaultAcknowledgement__c"));
        component.set("v.newItem.AQB__DateDue__c", component.get("v.newItem.AQB__PledgeStartDate__c"));
        var action = component.get("c.getSaveVoidAndCorrect");
        action.setParams({
            "voided": component.get("v.voidTransaction"),
            "correction": component.get("v.newItem")
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                $A.get('e.force:refreshView').fire();
                //helper.getBatchItems(component);  
                //helper.setDefaults(component);
            }
        });
        $A.enqueueAction(action);
    },
    
    setupPayment: function(component) {
        if (component.get("v.newItem.AQB__Method__c") == 'Pledge')
            component.set("v.extra.AQB__SendPledgeReminder__c", true);
        document.getElementById("topForm").style.display="none";
        document.getElementById("pledgeform").style.display="none";
        document.getElementById("scheduleform").style.display="none";
        document.getElementById("scheduleform2").style.display="none";
        document.getElementById("dataEntryForm").style.display="block";
        document.getElementById("paymentform").style.display="block";
    },
    
    setupAdditionalSchedule: function(component) {
        if (component.get("v.newItem.AQB__Method__c") == 'Pledge')
            component.set("v.extra.AQB__SendPledgeReminder__c", true);
        document.getElementById("dataEntryForm").style.display="none";
        document.getElementById("pledgeform").style.display="none";
        document.getElementById("scheduleform").style.display="block";
        document.getElementById("scheduleform2").style.display="none";
        var sLabel = component.find('pScheduleLabel'); 
        var sField = component.find('pScheduleField'); 
        var eLabel = component.find('eScheduleLabel');
        var eField = component.find('eScheduleField');
        $A.util.removeClass(eLabel, 'slds-hide'); 
        $A.util.removeClass(eField, 'slds-hide'); 
        $A.util.addClass(sLabel, 'slds-hide'); 
        $A.util.addClass(sField, 'slds-hide'); 
        sLabel = component.find('ePaymentLabel'); 
        sField = component.find('ePaymentField'); 
        $A.util.addClass(sLabel, 'slds-hide'); 
        $A.util.addClass(sField, 'slds-hide'); 
        var sLabel = document.getElementById("apScheduleLabel");
        if (component.get("v.newItem.AQB__Method__c") == 'Pledge')
            sLabel.innerHTML = 'Pledge Schedule Type';
        else
            sLabel.innerHTML = 'Grant Schedule Type'; 
    },
    
    finishSaveNewSchedule: function(component, addNew) {
        component.set("v.extra.AQB__BatchItem__c", component.get("v.itemId"));
        component.set("v.extra.AQB__Method__c", component.get("v.newItem.AQB__Method__c"));
        component.set("v.extra.AQB__Designation__c", component.get("v.batch.AQB__DefaultChartofAccounts__c"));
        component.set("v.extra.AQB__Acknowledgement__c", component.get("v.newItem.AQB__Acknowledgement__c"));
        component.set("v.extra.AQB__CampaignAppeal__c", component.get("v.newItem.AQB__CampaignAppeal__c"));
        component.set("v.extra.AQB__Currency__c", component.get("v.newItem.AQB__Currency__c"));
        component.set("v.extra.AQB__Date__c", component.get("v.newItem.AQB__Date__c"));
        //component.set("v.extra.AQB__CreditedYearOverrideDate__c", component.get("v.newItem.AQB__CreditedYearOverrideDate__c"));
        component.set("v.extra.AQB__Reference__c", component.get("v.newItem.AQB__Reference__c"));
        var con = component.get("v.extra.AQB__PledgeStipulation__c");
        if (con == 'Conditional' || con == 'Statement of Intent')
            component.set("v.extra.AQB__ConditionalPledge__c", true);
        var action = component.get("c.getSaveSchedule");
        action.setParams({
            "extra": component.get("v.extra")
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else if (addNew) {
                var amt = parseFloat(component.get("v.itemTotal")) + parseFloat(component.get("v.extra.AQB__Amount__c"));
                component.set("v.itemTotal", amt);
                component.set("v.extra.AQB__Amount__c", null);
                component.set("v.extra.AQB__NumberOfPayments__c", null);
                component.set("v.extra.AQB__Frequency__c", null);
                component.set("v.extra.AQB__PledgeInterval__c", null);
                component.set("v.extra.AQB__PledgeStartDate__c", null);
                component.set("v.extra.AQB__PledgeEndDate__c", null);
                component.set("v.extra.AQB__PledgeStipulation__c", null);
                component.set("v.extra.AQB__SendPledgeReminder__c", true);
                component.set("v.extra.AQB__Description__c", null);
                component.set("v.extra.AQB__PledgeScheduleType__c", null);
                component.set("v.pledgeSchedule", component.get("v.pledgeSchedule") + 1);
                document.getElementById("scheduleform2").style.display="none";
            }
            else if (component.get("v.addPayment") == true) {
                this.setupPayment(component);
            }
            else if (component.get("v.addSoftCredit") == true) {
                this.getAccountForCredit(component);
            }
            else
            	//this.showSoftCredits(component);
            	$A.get('e.force:refreshView').fire();
        });
        $A.enqueueAction(action);
    },
    
    /*voidTransactions: function(component, event) {
        var transIds = [];
        var getAllId = component.find("boxPackV");
        for (var i = 0; i < getAllId.length; i++) {
            if (getAllId[i].get("v.value") == true) {
                transIds.push(getAllId[i].get("v.text"));
            }
        }
        component.set("v.newItem.AQB__Batch__c", component.get("v.batchId"));
        component.set("v.newItem.AQB__Date__c", component.get("v.batch.AQB__BatchDate__c"));
        component.set("v.newItem.AQB__Amount__c", null);
        var action = component.get('c.getSaveVoids');
        action.setParams({
            "batchItem": component.get("v.newItem"),
            "transactionIds": transIds
        });
        action.setCallback(this, function(response) {
            $A.get('e.force:refreshView').fire();
            //helper.getBatchItems(component); 
        });
        $A.enqueueAction(action);
    },*/
    
    getAccountForCredit : function(component) {
        var label = component.find('scDateLabel'); 
        var field = component.find('scDateField'); 
        if (component.get("v.batch.AQB__GiftDate__c") == true) {
            $A.util.removeClass(label, 'slds-hide'); 
            $A.util.removeClass(field, 'slds-hide'); 
        }
        else {
            $A.util.addClass(label, 'slds-hide'); 
            $A.util.addClass(field, 'slds-hide'); 
        }
        label = component.find('sccDateLabel'); 
        field = component.find('sccDateField'); 
        if (component.get("v.batch.AQB__GiftCreditYear__c") == true) {
            $A.util.removeClass(label, 'slds-hide'); 
            $A.util.removeClass(field, 'slds-hide'); 
        }
        else {
            $A.util.addClass(label, 'slds-hide'); 
            $A.util.addClass(field, 'slds-hide');     
        }
            
        component.set("v.popped", true);
        this.showPopupHelper(component, 'scAccountDialog', 'slds-fade-in-');
    },
    
    getOpenPledges : function(component, accountId) {
        var action = component.get("c.getOpenPledges");
        action.setParams({
            "accountId": accountId,
            "pledgeId": null
        });
        action.setCallback(this, function(data) {
            component.set("v.showLink", false);
            component.set("v.openPledges", data.getReturnValue());
            component.set("v.popped", true);
            if (component.get("v.openPledges").length == 0 && component.get("v.currentLinkIndicator") == 'WriteOff')
                this.showError(component, "This Account does not have any open pledges.");
            else
                this.showPopupHelper(component, 'openPledgesDialog', 'slds-fade-in-');
        });
        $A.enqueueAction(action);
    },
    
    getTransactions : function(component) {
        var action = component.get("c.getTransactions");
        action.setParams({
            "batchItemId": component.get("v.currentItemId")
        });
        action.setCallback(this, function(data) {
            var t = data.getReturnValue();
            component.set("v.transactions", t);
            component.set("v.numberOfTransactions", t.length);
            component.set("v.popped", true);
            this.showPopupHelper(component, 'transactionsDialog', 'slds-fade-in-');
        });
        $A.enqueueAction(action);
    },
    
    getMatches : function(component) {
        var action = component.get("c.getMatchPotentials");
        action.setParams({
            "batchItemId": component.get("v.currentItemId")
        });
        action.setCallback(this, function(data) {
            component.set("v.matchPotentials", data.getReturnValue());
            component.set("v.popped", true);
            this.showPopupHelper(component, 'matchPotentialsDialog', 'slds-fade-in-');
        });
        $A.enqueueAction(action);
    },
    
    getQuids : function(component) {
        var action = component.get("c.getQuids");
        action.setParams({
            "batchItemId":  component.get("v.currentItemId")
        });
        action.setCallback(this, function(data) {
            component.set("v.quids", data.getReturnValue());
            this.showPopupHelper(component, 'quidsDialog', 'slds-fade-in-');
        });
        $A.enqueueAction(action);
    },
    
    getTributes : function(component) {
        var action = component.get("c.getTributes");
        action.setParams({
            "batchItemId": component.get("v.currentItemId")
        });
        action.setCallback(this, function(data) {
            component.set("v.tributes", data.getReturnValue());
            this.showPopupHelper(component, 'tributesDialog', 'slds-fade-in-');
        });
        $A.enqueueAction(action);    
    },
    
    getRecognitions : function(component) {
        var action = component.get("c.getRecognitions");
        action.setParams({
            "batchItemId": component.get("v.currentItemId")
        });
        action.setCallback(this, function(data) {
            component.set("v.recognitions", data.getReturnValue());
            component.set("v.popped", true);
            this.showPopupHelper(component, 'recognitionsDialog', 'slds-fade-in-');
        });
        $A.enqueueAction(action);    
    },
    
    showError: function(component, errMsg) {
        component.set("v.popped", true);
        component.set("v.errorMessage", errMsg);
        this.showPopupHelper(component, 'errorDialog', 'slds-fade-in-');
    },
    
    showPopupHelper : function(component, componentId, className) { 
        var modal = component.find(componentId); 
        $A.util.removeClass(modal, className + 'hide'); 
        $A.util.addClass(modal, className + 'open'); 
    },
    
    hidePopupHelper : function(component, componentId, className) { 
        var modal = component.find(componentId); 
        $A.util.addClass(modal, className + 'hide'); 
        $A.util.removeClass(modal, className + 'open'); 
    }
})