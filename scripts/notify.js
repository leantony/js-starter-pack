leantony.notify = leantony.notify || {};

(function ($) {
    "use strict";

    var notification = function (opts) {
        var defaults = {
            title: function () {
                if (opts.type === undefined) {
                    return "No title";
                }
                // add a title dynamically and automatically
                switch (opts.type) {
                    case "success":
                        return "Action successful.";
                    case "warning":
                        return "Warning!";
                    case "error":
                        return "An error occurred.";
                    case "info":
                        return "Information.";
                    default:
                        return "Information."
                }
            }
        };

        this.opts = $.extend({}, defaults, opts || {});
    };

    notification.prototype.send = function () {
        var $this = this;
        var opts = $this.opts;
        var settings = $this.opts.settings || {"closeButton": true};
        switch (opts.type) {
            case "success":
                toastr.success(opts.text, opts.title, settings);
                break;
            case "warning":
                toastr.warning(opts.text, opts.title, settings);
                break;
            case "error":
                toastr.error(opts.text, opts.title, settings);
                break;
            case "info":
                toastr.info(opts.text, opts.title, settings);
                break;
            default:
                toastr.success(opts.text, opts.title, settings);
                break;
        }
    };

    leantony.notify = function (options) {
        var obj = new notification(options);
        obj.send();
    };

})(jQuery);