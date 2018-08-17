({
	/*global toastr*/
	/*eslint no-undef: "off"*/
    theme : null,
    doInit : function (component) {
        if ($A.util.isEmpty(this.theme)) {
            var self = this;
            var themePromise = ActionUtils.executeAction(self,component,'c.getTheme',{});
            themePromise.then($A.getCallback(function(result){
                self.theme = result;
            }));
        }
    },
	showToastMessage : function(params) {
		if (!$A.util.isEmpty(this.theme) && this.theme.indexOf('Theme4') > -1) {
            var toastEvent = $A.get("e.force:showToast");
            if (!$A.util.isEmpty(toastEvent)) {
                toastEvent.setParams({
                    title: params.title,
                    message: params.message,
                    type: params.severity,
                    duration: 10000
                });
                toastEvent.fire();
            }
            else {
                this.theme = 'Theme3';
                this.showIzoToast(params);
            }
		}
		else {
			this.showIzoToast(params);
        }
	},
    showIzoToast : function (params) {
        var color = 'blue';
        switch(params.severity) {
            case 'error':
                color = 'red';
                break;
            case 'success':
                color = 'green';
                break;
            case 'warning':
                color = 'yellow';
                break;
            default:
                color = 'blue';
                break;
        }
        var timeout = false;
        if (params.autoHide) {
            timeout = 5000;
        }
        iziToast.show({
            class: '',
            title: params.title,
            titleColor: '',
            message: params.message,
            messageColor: '',
            backgroundColor: '',
            color: color, // blue, red, green, yellow
            icon: '',
            iconText: '',
            iconColor: '',
            image: '',
            imageWidth: 50,
            zindex: 9999999999999,
            layout: 1,
            balloon: false,
            close: true,
            rtl: false,
            position: params.position, // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
            target: '',
            targetFirst: true,
            timeout: timeout,
            drag: true,
            pauseOnHover: true,
            resetOnHover: false,
            progressBar: true,
            progressBarColor: '',
            animateInside: true,
            transitionIn: 'fadeInUp',
            transitionOut: 'fadeOut',
            transitionInMobile: 'fadeInUp',
            transitionOutMobile: 'fadeOutDown',
        });
    },
	showMessage : function(component, event) {
		var params = event.getParam('arguments');
		if (params) {
			this.showToastMessage(params);
		}
	},
	showMessages : function(component, event) {
		var params = event.getParam('arguments');
		if (params) {
			params.forEach(function(param){
				this.showToastMessage(param);
			});
		}
	}
})