leantony.ajax = leantony.ajax || {};

(function ($) {

    leantony.ajax = {

        sortTable: function (rowClass) {
            var item = $(rowClass);

            if (item.length) {
                item.click(function () {
                    // Get the current column clicked
                    var thisColumn = $(this).text();
                    var order = $(this).data('order');
                    var column = $(this).data('column');

                    // Check if the column has changed
                    if (thisColumn == column) {
                        // column has not changed
                        if (order == "asc") {
                            order = "desc";
                        } else {
                            order = "asc";
                        }
                    } else {
                        // column has changed
                        column = thisColumn;
                        order = "desc";
                    }
                    $(this).data('order', order);
                    $(this).data('column', column);

                    // Get the current column clicked
                    var href = new URI($(this).attr('href')).addQuery("sort_dir", order);
                    $(this).attr('href', href.normalizeQuery());
                });
            }
        },

        /**
         * Search through the table and refresh it
         *
         */
        filterTable: function (element) {
            var el = $(element);
            var pjaxContainer = el.data('pjax-target');

            el.on('submit', function (e) {
                "use strict";
                e.preventDefault();
                $.pjax.submit(e, pjaxContainer, {
                    "push": true,
                    "data": el.serialize(),
                    "replace": false,
                    "timeout": 5000,
                    "scrollTo": 0,
                    maxCacheLength: 0
                })
            });
        },

        /**
         * Most of the time, this is similar
         *
         * @param data
         * @param renderOnPage
         */
        handleAjaxError: function (data, renderOnPage) {
            // console.log(data);
            var msg, title;
            switch (data.status) {
                case 422:
                    msg = leantony.utils.processMessageObject(data.responseJSON);
                    title = "<strong>Please fix the following errors with your input.</strong>";
                    break;
                case 500:
                    msg = leantony.utils.processMessageObject("Apologies :(. An error occurred on the server. We're working on it..");
                    title = "<strong>Whoops!</strong>";
                    break;
                default:
                    msg = data.responseJSON.message;
                    title = "<strong>Whoops!</strong>";
                    break;
            }
            // we may be required to display the errors on a location on the page
            if (renderOnPage) {
                $('#' + renderOnPage.element).html(leantony.utils.renderAlert('error', msg, title || null));
            } else {
                leantony.notify({
                    text: msg || "An error occurred",
                    type: "error"
                });
            }
        },

        /**
         * send an ajax request quickly via a link, etc
         *
         * @param element
         * @param event
         */
        doRemote: function (element, event) {
            var utils = leantony.utils;
            // click or submit
            event = event || 'click';
            var $this = this;

            // do not do anything if we have nothing to work with
            if (element.length < 1)return;

            // since our refs are data-remote or class with data-remote, we need to loop
            element.each(function (i, obj) {
                obj = $(obj);
                // console.log(obj);
                var confirmation = obj.data('confirm');
                // check if we need to refresh any pjax container
                var pjaxContainer = obj.data('pjax-target');
                // check if we need to force a page refresh. will override shouldPjax
                var refresh = obj.data('refresh-page');
                // a form
                var isForm = obj.is('form');
                // where to put a notification.
                var notificationLocation = obj.data('notification');
                // prevent or enable blocking of UI
                var blockUi = obj.data('block-ui') || true;
                // custom block UI msg
                var waitingMsg = obj.data('waiting-message');

                // console.log([event, isForm, obj.attr('action')]);
                obj.on(event, function (e) {
                    e.preventDefault();
                    // check for a confirmation message
                    if (confirmation) {
                        if (!confirm(confirmation)) {
                            return;
                        }
                    }
                    $.ajax({
                        method: isForm ? obj.attr('method') : (obj.data('method') || 'POST'),
                        url: isForm ? obj.attr('action') : obj.attr('href'),
                        data: isForm ? obj.serialize() : null,
                        beforeSend: function () {
                            if(blockUi){
                                leantony.utils.startBlockUI(waitingMsg || 'Please wait ...')
                            }
                        },
                        complete: function () {
                            if(blockUi){
                                leantony.utils.stopBlockUI();
                            }
                        },
                        success: function (data) {
                            // sometimes we don't need to display a notification
                            if (!data.suppressNotification) {
                                // now, if we need to, we need a place to drop the html. Otherwise, we use the toaster
                                if (notificationLocation) {
                                    $('#' + notificationLocation).html(leantony.utils.renderAlert('success', data.message));
                                } else {
                                    leantony.notify({text: data.message, type: "success"});
                                }
                            }
                            // refreshing the page
                            if (refresh) {

                                leantony.utils.loadLink(obj.attr('href'), 50);
                            }
                            // reload a pjax container
                            if (pjaxContainer) {

                                $.pjax.reload({container: pjaxContainer});
                            }
                            // we need to redirect
                            if (data.redirectTo !== undefined) {

                                leantony.utils.loadLink(data.redirectTo, 50);
                            }
                        },
                        error: function (data) {
                            // handle errors gracefully
                            $this.handleAjaxError(data, notificationLocation ? {'element': notificationLocation} : null);
                        }
                    });
                });
            });

        }
    }
})(jQuery);
