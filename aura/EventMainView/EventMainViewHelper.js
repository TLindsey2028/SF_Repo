({
    divId : 'conference-event-wrapper',
    showNewPanel : function(component,panelToShow,pageName,hash) {
        var footer = document.querySelector('.slds-col--padded.comm-content-footer.comm-layout-column')
        var body = document.querySelector('body');
        var nav = document.getElementById('navbar');

        $A.util.removeClass(footer,'sidenav-active');
        $A.util.removeClass(body, 'sidenav-active');

        $A.util.removeClass(component.find('page-details'),'hidden');
        if (!$A.util.isEmpty(component.get('v.attendeeObj'))) {
            $A.util.removeClass(component.find('registration-panel'), 'active');
            $A.util.addClass(component.find('registration-details'), 'hidden');
        }
        var linkPanelToShowObj = null;
        var linkPanels = component.find('linkPanel');
        if (!$A.util.isEmpty(linkPanels) && !_.isArray(linkPanels)) {
            linkPanelToShowObj = linkPanels;
        } else if (!$A.util.isEmpty(linkPanels) && _.isArray(linkPanels)) {
            linkPanels.forEach(function(element){
                $A.util.removeClass(element,'active');
                if (element.getElement() && element.getElement().dataset && element.getElement().dataset.type === panelToShow) {
                    linkPanelToShowObj = element;
                }
            });
        }

        if (!component.get('v.isPreview')) {
            var hashEvent = $A.get('e.LTE:HashChangingEvent');
            hashEvent.setParams({hash: hash || pageName});
            hashEvent.fire();
        }
        // window.location.hash = pageName;
        var viewPanelToShowObj = null;
        var viewPanels = component.find('viewPanel');
        if (!$A.util.isEmpty(viewPanels) && !_.isArray(viewPanels)) {
            viewPanelToShowObj = viewPanels;
        } else if (!$A.util.isEmpty(linkPanels) && _.isArray(viewPanels)) {
            viewPanels.forEach(function(element){
                $A.util.addClass(element,'hidden');
                if (element.getElement() && element.getElement().dataset && element.getElement().dataset.type === panelToShow) {
                    viewPanelToShowObj = element;
                }
            });
        }

        if (!$A.util.isEmpty(linkPanelToShowObj)) {
            $A.util.addClass(linkPanelToShowObj, 'active');
        }
        if (!$A.util.isEmpty(viewPanelToShowObj)) {
            $A.util.removeClass(viewPanelToShowObj,'hidden');
            if (!$A.util.isEmpty(pageName)) {
                document.title = pageName+' - '+component.get('v.eventObj.name');
            }
        }
        $A.util.removeClass(nav, 'active');
    },
    loadBasedOnHash : function (component) {
        var self = this;
         var hash = window.location.hash;
        var loadPanel = function (element) {
            if (element.name.toLowerCase() === decodeURIComponent(hash.toLowerCase())) {
                var interval = setInterval($A.getCallback(function () {
                    var viewPanels = component.find('viewPanel');
                    // if (!$A.util.isUndefinedOrNull(viewPanels)) {
                    if (viewPanels && viewPanels[0] && viewPanels[0].getElement()) {
                        self.showNewPanel(component, element.name, element.title, element.hash);
                        clearInterval(interval);
                    }
                }), 100);
            }
        };

        if (!$A.util.isEmpty(hash)) {
            hash = hash.replace('#','');
            component.get('v.eventObj.eventPages').forEach(loadPanel);
            if (component.get('v.usr.isAuthenticated')) {
                loadPanel({name: 'manage', title: $A.get('$Label.LTE.Manage_Registration_Tab_Name'), hash: 'manage'});
            }
            loadPanel({name:'login', title: $A.get('$Label.LTE.Login_Component_Header'), hash:'login'});
        }
    },
    menuItems : function (component) {
        if (component.$destroyed$) return;
        var items = component.get('v.menuNumber');
        var wrapper = document.getElementById('navWrapper');
        var pageList = component.get('v.eventObj.eventPages');
        var self = this;
        if (!wrapper || !pageList || (wrapper && wrapper.offsetWidth === 0 && wrapper.scrollWidth === 0)) {
            setTimeout($A.getCallback(function() {
                self.menuItems(component);
            }), 100);
            return;
        }
        var numItems = pageList.length;

        var recurse = false;
        if (wrapper.offsetWidth < wrapper.scrollWidth) {
            var decrement = 1;
            if (items === numItems) {
                decrement = 2; //we're adding "More" so we remove 2 to create any space
            }
            component.set('v.menuNumber', items - decrement);
            component.set('v.expandAtScrollWidth', wrapper.scrollWidth);
            recurse = true;
        } else if (wrapper.offsetWidth > component.get('v.expandAtScrollWidth')) {
            items = Math.min(items + 1, numItems);
            component.set('v.menuNumber', items);
            component.set('v.expandAtScrollWidth', wrapper.scrollWidth - (numItems-items)/numItems * wrapper.scrollWidth);
            recurse = true;
        }

        if (recurse) {
            setTimeout($A.getCallback(function () { //allow aura to re-draw, then we'll recalculate our widths
                self.menuItems(component);
            }), 100);
        }
    },
    buildLoginCmp: function(component) {
        var loginDiv = component.find('loginDiv');
        if (loginDiv == null) {
            return;
        }
        $A.createComponent('LTE:Login', {
            storeObj: component.get('v.storeObj'),
            siteObj: component.get('v.siteObj'),
            showOverview: true,
            eventId: component.get('v.eventObj.id'),
            identifier: 'ConfMainView'
        }, function (newCmp, status, errorMessage) {
            loginDiv.set('v.body', newCmp);
        });
    },
    buildManageCmp: function(component) {
        var manageDiv = component.find('manageDiv');
        if (manageDiv == null) {
            return;
        }

        $A.createComponent('LTE:ManageMyRegistration', {
            usr : component.get('v.usr'),
            attendeeObj : component.get('v.attendeeObj'),
            eventObj : component.get('v.eventObj'),
            siteObj : component.get('v.siteObj'),
            storeObj : component.get('v.storeObj'),
            identifier: 'ConfMainView'
        }, function(newCmp, status, errorMessage) {
            manageDiv.set('v.body', newCmp);
        });
    },
    showMyRegistration: function (component) {
        if (window.location.hash === '#manage') {
            window.location.reload();
        }
        else {
            // document.title = $A.get('$Label.LTE.Manage_Registration_Tab_Name')+' - '+component.get('v.eventObj.name');
            this.showNewPanel(component, 'manage', $A.get('$Label.LTE.Manage_Registration_Tab_Name'), 'manage');

            var linkPanels = component.find('linkPanel');
            if ($A.util.isEmpty(linkPanels)) {
                linkPanels = [];
            } else if (!$A.util.isEmpty(linkPanels) && !_.isArray(linkPanels)) {
                linkPanels = [];
                linkPanels.push(component.find('linkPanel'));
            }
            linkPanels.forEach(function (element) {
                $A.util.removeClass(element, 'active');
            });
        }
    },
    showLogin: function(component,hashValue) {
        this.showNewPanel(component, 'login', $A.get('$Label.LTE.Login_Component_Header'), hashValue);
        var attendeeObj = component.get('v.attendeeObj');

        if (component.get('v.eventObj.isInvitationOnly') && (!attendeeObj || !(attendeeObj.invitationSent || attendeeObj.invitationAccepted || attendeeObj.invitationDeclined))) {
            //todo
        }
        else {
            var toggleEvent = $A.get('e.LTE:EventRegisterButtonToggleEvent');
            toggleEvent.fire();
        }
    },
    registerEvent: function (component) {
        var usr = component.get('v.usr');
        var checkoutAsGuest = FontevaHelper.getCacheItem('checkoutAsGuest');
        if ((!$A.util.isEmpty(usr) && usr.isAuthenticated) || (!$A.util.isEmpty(checkoutAsGuest) && checkoutAsGuest)) {
            var compEvent = $A.get('e.Framework:ShowComponentEvent');
            compEvent.setParams({
                componentName: 'LTE:EventRegistrationWrapper',
                componentParams: {
                    attendeeObj: component.get('v.attendeeObj'),
                    usr: component.get('v.usr'),
                    eventObj: component.get('v.eventObj'),
                    siteObj: component.get('v.siteObj'),
                    storeObj: component.get('v.storeObj'),
                    salesOrderObj: null,
                    identifier: 'EventWrapper'
                }
            });
            compEvent.fire();
        } else {
            window.localStorage.setItem(this.REGISTER_INITIATED, 'yes');
            component.find('registerButton').stopIndicator();
            this.showLogin(component, 'loginredirectTT');
        }
    },
    handleHashChangedEvent: function(component) {
        var decodedHash = decodeURIComponent(window.location.hash).slice(1); //strip leading #
        var viewAgenda = false;
        if (decodedHash === 'manage') {
//<LTE:MyAttendees eventObj="{!v.eventObj}" siteObj="{!v.siteObj}" storeObj="{!v.storeObj}" usr="{!v.usr}" attendeeObj="{!v.attendeeObj}" hasForms="{!v.hasForms}"/>
            var compEvent = $A.get('e.Framework:ShowComponentEvent');
            compEvent.setParams({
                componentName: 'LTE:' + 'MyAttendees',
                componentParams: {
                    usr: component.get('v.usr'),
                    eventObj: component.get('v.eventObj'),
                    siteObj: component.get('v.siteObj'),
                    storeObj: component.get('v.storeObj'),
                    attendeeObj: component.get('v.attendeeObj'),
                    identifier: 'MyRegistration'
                }
            });
            compEvent.fire();
        }
        if (decodedHash === 'viewAgenda') {
            decodedHash = 'manage'; //viewAgenda is a child of the manageMyAttendees cmp
        }
        this.showNewPanel(component, decodedHash, decodedHash);
    }
})