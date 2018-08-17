({
    init: function (component, event, helper) {
        component.set('v.columns', [
            {
                label: $A.get("$Label.et4ae5.trackingDataCleanupGridSendIdColumn"),
                fieldName: 'sendId',
                type: 'text',
                sortable: true,
            },
            {
                label: $A.get("$Label.et4ae5.trackingDataCleanupGridExpirationDateColumn"),
                fieldName: 'expirationDate',
                type: 'text',
                sortable: true,
            },
            {
                label: $A.get("$Label.et4ae5.trackingDataCleanupGridNameColumn"),
                fieldName: 'name',
                type: 'text',
                sortable: true
            },
            {
                label: $A.get("$Label.et4ae5.trackingDataCleanupGridIERColumn"),
                fieldName: 'individualEmailResults',
                type: 'number',
                sortable: false
            },
            {
                label: $A.get("$Label.et4ae5.trackingDataCleanupGridALDColumn"),
                fieldName: 'aggregateLinkDetails',
                type: 'number',
                sortable: false
            },
            {
                label: $A.get("$Label.et4ae5.trackingDataCleanupGridILDColumn"),
                fieldName: 'individualLinkDetails',
                type: 'number',
                sortable: false
            }
        ]);

        // Initialize error state
        component.set('v.isUnknownError', false);
        component.set('v.isMaxRecordsError', false);
        component.set('v.errorMessageText', '');
        component.set('v.emptyRecords', false);

        // Assign labels
        component.set('v.gridTitleLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridTitle"));
        component.set('v.gridSubtitleLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridSubtitle"));
        component.set('v.gridDeleteSelectedLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteSelectedButton"));
        component.set('v.gridDeleteAllLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteAllButton"));
        component.set('v.modalTitleLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridModalTitle"));
        component.set('v.modalResortMessageLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridModalResortMessage"));
        component.set('v.modalNavigationMessageLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridModalNavigationMessage"));
        component.set('v.modalCloseLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridModalClose"));
        component.set('v.modalCancelLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridModalCancel"));
        component.set('v.modalConfirmLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridModalContinue"));
        component.set('v.paginatePreviousLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridPreviousButton"));
        component.set('v.paginateNextLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridNextButton"));
        component.set('v.noRecordsLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridNoRecords"));
        component.set('v.deleteModalTitleLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalTitle"));
        component.set('v.deleteModalDirectionLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalDirection"));
        component.set('v.reviewErrorsLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalReviewErrors"));
        component.set('v.errorTrackingLevelLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalErrorLevelTracking"));
        component.set('v.errorEmailLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalErrorEmail"));
        component.set('v.errorEmailListSizeLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalErrorEmailListSize"));
        component.set('v.errorConfirmIntentLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalErrorConfirmIntent"));
        component.set('v.emailSendDefinitionLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalEmailSendDefinition"));
        component.set('v.ierLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalIER"));
        component.set('v.ildLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalILD"));
        component.set('v.aldLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalALD"));
        component.set('v.ierDeleteAllLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalIERDeleteAll"));
        component.set('v.ierDeleteNotOpenedNotClickedLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalIERDeleteNotOpenedNotClicked"));
        component.set('v.ierDeleteNotOpenedLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalIERDeleteNotOpened"));
        component.set('v.ierDeleteNotClickedLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalIERDeleteNotClicked"));
        component.set('v.confirmEmailLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalConfirmEmail"));
        component.set('v.confirmEmailAddButtonLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalConfirmEmailAddButton"));
        component.set('v.confirmEmailDescriptionLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalConfirmEmailDescription"));
        component.set('v.confirmIntentLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalConfirmIntent"));
        component.set('v.modalDeleteButtonLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalDeleteButton"));
        component.set('v.batchJobInProgressLabel', $A.get("$Label.et4ae5.trackingDataCleanupGridBatchJobInProgress"));
        component.set('v.ierCheckboxTooltip', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalIERtooltip"));
        component.set('v.aldCheckboxTooltip', $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteModalALDtooltip"));
        
        component.set('v.sortedBy', 'expirationDate');
        component.set('v.sortedDirection', 'asc');
        //Used to determine whether or not to enable the delete selected tracking data button
        //and to notify user of lost progress on page change or sort
        component.set('v.isRowSelected', false);
        component.set('v.selectedRows', []);
        component.find('pageSizeSelector').set('v.value', '25');
        
        var itemsPerPage = component.get('v.itemsPerPage');

        var getDataFunction = function () { helper.getData(component); };
        helper.isBatchRunnning(component, event, helper, getDataFunction);
    },
    rowsSelected: function (component, event, helper) {
        var selectedRows = event.getParam('selectedRows');
        helper.rowsSelected(component, selectedRows);
    },
    // Client-side controller called by the onsort event handler
    updateColumnSorting: function (component, event, helper) {
        var desiredSortDirection = event.getParam('sortDirection');
        var desiredSortField = event.getParam('fieldName');
        var requestSortFunction = function () { helper.requestSort(component, event, desiredSortDirection, desiredSortField); };
        helper.isBatchRunnning(component, event, helper, requestSortFunction);
    },
    // Called when the Next pagination button is pressed
	nextPage : function(component, event, helper) {
        var page = Number(component.get('v.currentPage'));
        var requestPageChangeFunction = function () { helper.requestPageChange(component, event, page + 1); };
        helper.isBatchRunnning(component, event, helper, requestPageChangeFunction);
	},
	// Called when the Previous button is pressed
	previousPage : function(component, event, helper) {
        var page = Number(component.get('v.currentPage'));
        var requestPageChangeFunction = function () { helper.requestPageChange(component, event, page - 1); };
        helper.isBatchRunnning(component, event, helper, requestPageChangeFunction);
    },
    firstPage : function(component, event, helper) {
        var desiredpage = 1;
        var requestPageChangeFunction = function () { helper.requestPageChange(component, event, desiredpage); };
        helper.isBatchRunnning(component, event, helper, requestPageChangeFunction);
    },
    lastPage : function(component, event, helper) {
        var desiredpage = component.get('v.maxPage');
        var requestPageChangeFunction = function () { helper.requestPageChange(component, event, desiredpage); };
        helper.isBatchRunnning(component, event, helper, requestPageChangeFunction);
    },
    changePage : function(component, event, helper) {
        var desiredpage = Number(event.getSource().get('v.page'));
        var requestPageChangeFunction = function () { helper.requestPageChange(component, event, desiredpage); };
        helper.isBatchRunnning(component, event, helper, requestPageChangeFunction);       
    },
    selectPageSize : function(component, event, helper) {
        var desiredPageSize = Number(event.getSource().get('v.value'));
        var requestPageSizeChangeFunction = function () { helper.requestPageSizeChange(component, event, desiredPageSize); };
        helper.isBatchRunnning(component, event, helper, requestPageSizeChangeFunction);
    },
    // Called when Cancel or Close are clicked on the modal
    cancelSelectionModal : function(component, event, helper){
        //Switch back to previous value since we can't intercept the component
        var isPageSizeChanging = component.get('v.isPageSizeChanging');
        if (isPageSizeChanging) {
            component.set('v.isPageSizeChanging', false);
            var itemsPerPage = component.get('v.itemsPerPage');
            component.find('pageSizeSelector').set('v.value', itemsPerPage);
        }
        
        component.set('v.isSorting', false);
        helper.showSelectionModal(component, event, helper, false);
    },
    //Gets sent from Aggregate Header after initialization
    handleRecordCountEvent : function(component, event, helper) {
        var recordCount = event.getParam('value');
        if ($A.util.isUndefined(recordCount) || $A.util.isEmpty(recordCount)) {
            console.error('recordCount missing from RecordCountEvent');
            helper.showError(component, $A.get("$Label.et4ae5.trackingDataCleanupGridUnknownError"));
            return;
        }
        
        //Update Paging display and maxPage size
        var itemsPerPage = component.get('v.itemsPerPage');
        var numPagesToShow = component.get('v.numPagesToShow');
        
        var maxPage = helper.calculateMaxPage(recordCount, itemsPerPage);
        var currentPages = [];
        for (var i = 0; i < numPagesToShow && i < maxPage; ++i) {
            //Add one since Buttons are one based
            currentPages.push(i+1);
        }
        
        component.set('v.maxPage', maxPage);
        component.set('v.currentPages', currentPages);
    },
    cancelDeleteSelectionModal : function(component, event, helper) {
        helper.showDeleteSelectionModal(component, event, helper, false);
    },
    checkSendDef : function(component, event, helper) {
        var chkIER = component.find("chkIER");
        var chkILD = component.find("chkILD");
        var chkALD = component.find("chkALD");

        if (component.find("chkSendDef").get("v.checked")) {
            chkIER.set("v.checked", true);
            chkIER.set("v.disabled", true);
            chkILD.set("v.checked", true);
            chkILD.set("v.disabled", true);
            chkALD.set("v.checked", true);
            chkALD.set("v.disabled", true);
            helper.setIERRadioOptions(component, event, helper, true, "radioDeleteAll"); //set disabled state of IER radio options
            helper.setNotificationDisplay(component, event, helper, true, "errorTrackingLevel", false);    
        }
        else {
            chkIER.set("v.disabled", false);
            chkALD.set("v.disabled", false);

            if (chkIER.get("v.checked") === true) {
                //enable IER radio button options if the IER checkbox is checked
                helper.setIERRadioOptions(component, event, helper, false); //set enabled state of IER radio options
            }
        }
    },
    checkIER : function(component, event, helper) {
        var chkIER = component.find("chkIER");
        var chkILD = component.find("chkILD");
        
        if (chkIER.get("v.checked")) {
            chkILD.set("v.checked", true);
            chkILD.set("v.disabled", true);
            helper.setIERRadioOptions(component, event, helper, false); //set enabled state of IER radio options
            helper.setNotificationDisplay(component, event, helper, true, "errorTrackingLevel", false);
        }
        else {
            chkILD.set("v.disabled", false);
            helper.setIERRadioOptions(component, event, helper, true); //set disabled state of IER radio options
        }
    },
    checkILD : function(component, event, helper) {
        var chkILD = component.find("chkILD");
        
        if (chkILD.get("v.checked")) {
            helper.setNotificationDisplay(component, event, helper, true, "errorTrackingLevel", false);
        }
    },
    checkALD : function(component, event, helper) {
        var chkALD = component.find("chkALD");
        
        if (chkALD.get("v.checked")) {
            helper.setNotificationDisplay(component, event, helper, true, "errorTrackingLevel", false);
        }
    },
    checkConfirm : function(component, event, helper) {
        var chkConfirm = component.find("chkConfirmDelete");
        
        if (chkConfirm.get("v.checked")) {
            helper.setNotificationDisplay(component, event, helper, true, "errorConfirm", false);
        }
    },
    // called when a radio button option is selected
    handleIEROptionSelect : function(component, event, helper) {
        var previousOptionId = component.get("v.ierRadioOptionIDSelected");
        var currentOptionId = event.getSource().getLocalId();

        if (currentOptionId != previousOptionId) {
            component.find(previousOptionId).set("v.checked", false);
            component.set("v.ierRadioOptionIDSelected", currentOptionId);
        }
    },
    // called when the add button is clicked to add another email to the email notification list
    addEmail : function (component, event, helper) {
        var newEmailControl = component.find("emailAddress");
        var newEmailValidity = newEmailControl.get("v.validity");
        var newEmailValue = newEmailControl.get("v.value"); 
        var currentEmails = helper.deepCopySimpleArray(component.get("v.emailAddresses"));
        var maxEmailAddresses = component.get("v.maxEmailAddresses");
        
        if (newEmailValue && newEmailValidity.valid && currentEmails.length < maxEmailAddresses) {
            currentEmails.push(newEmailValue);
            component.set("v.emailAddresses", currentEmails);
            newEmailControl.set("v.value", ""); //remove the newly added email address from the input box
        }
    },
    // called when the remove button is clicked on an email address pill
    removePill : function(component, event, helper){
        var clickedPillLabel = event.getSource().get("v.label");
        var currentEmails = helper.deepCopySimpleArray(component.get("v.emailAddresses"));
        var maxEmailAddresses = component.get("v.maxEmailAddresses");
        
        for(var i = 0; i < currentEmails.length; i++)
        {
            if (currentEmails[i] == clickedPillLabel) {
                currentEmails.splice(i, 1);
                component.set("v.emailAddresses", currentEmails);
                break;
            }
        }
        
        if (currentEmails.length <= maxEmailAddresses) {
            helper.setNotificationDisplay(component, event, helper, true, "errorEmailListSize", false);
        }
    },
    handleEmailBlur : function(component, event, helper) {
        var emailAddressInput = component.find(event.getSource().getLocalId())
        var emailValidity = emailAddressInput.get("v.validity");
        var emailValue = emailAddressInput.get("v.value"); 
        var currentEmails = helper.deepCopySimpleArray(component.get("v.emailAddresses"));
        var maxEmailAddresses = component.get("v.maxEmailAddresses");
        
        if (!emailValidity.valid) {
            helper.setNotificationDisplay(component, event, helper, true, "errorEmail", true);
        }
        else {
            helper.setNotificationDisplay(component, event, helper, true, "errorEmail", false);
        }
        
        var extraEmail = emailValue ? 1 : 0;
        if (currentEmails.length + extraEmail > maxEmailAddresses) {
            helper.setNotificationDisplay(component, event, helper, true, "errorEmailListSize", true);
        }
        else {
            helper.setNotificationDisplay(component, event, helper, true, "errorEmailListSize", false);
        }
    },
    handleSelectionModalConfirmation : function(component, event, helper) {
        var confirmSelectionModalFunction = function () { helper.confirmSelectionModal(component, event, helper); };
        helper.isBatchRunnning(component, event, helper, confirmSelectionModalFunction);
    },
    handleDeleteSelectionModalConfirmation : function(component, event, helper) {
        var confirmDeleteSelectionModalFunction = function () { helper.confirmDeleteSelectionModal(component, event, helper); };
        helper.isBatchRunnning(component, event, helper, confirmDeleteSelectionModalFunction);
    },
    handleDeleteRecords : function(component, event, helper) {
        var deleteRecordsFunction = function () { helper.deleteRecords(component, event, helper); };
        helper.isBatchRunnning(component, event, helper, deleteRecordsFunction);
    },
    // Called to toggle a tooltip
    toggleTooltip : function(component, event, helper) {
        var elementId = event.currentTarget.dataset.tooltipid;
        var tooltip = component.find(elementId);
        $A.util.toggleClass(tooltip, "slds-hide");
    }
})