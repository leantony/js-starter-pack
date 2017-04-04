leantony.modal = leantony.modal || {};

(function ($) {
    'use strict';
    var modal = function (options) {
        var defaultOptions = {
            // id of modal form template on page
            modal_id: 'bootstrap_modal',
            // id of notification element where messages will be displayed on the modal. E.g validation errors
            notification_id: 'modal-notification',
            // the id of the form that contains the data that will be sent to the server
            form_id: 'modal_form',
            // the class of the element that will trigger the modal. typically a link
            modalTriggerSelector: '.show_modal_form',
            // when the modal is shown
            onShown: function (e, modal) {
                if(modal.options.onShown){
                    modal.options.onShown(e);
                }
            },
            onHidden: function (e, modal) {
                $(this).removeData('bs.modal');
            },
            onShow: function (e, modal) {
                var element = $('#' + modal.options.modal_id);
                if(modal.options.onShow){
                    var spinner = modal.options.onShow(e, element);
                    if(spinner){
                        element.find('.modal-content').html(spinner);
                    }
                }
            },
            onLoaded: function (e, modal) {
                if(modal.options.onLoaded){
                    modal.options.onLoaded(e);
                }
            }
        };
        this.options = $.extend({}, defaultOptions, options || {});
    };

    /**
     * show the modal
     */
    modal.prototype.show = function () {
        var $this = this;
        var modal_id = $this.options.modal_id;
        var clickHandler = function (e) {
            var modal_size = $(e).data('modal-size');
            var modal = $('#' + modal_id);
            if (!_.isEmpty(modal_size)) {
                modal.find('.modal-dialog').addClass(modal_size);
            }
            var url = $(e).attr('href') || $(e).data('url');
            modal
                .on('shown.bs.modal', function () {
                    $this.options.onShown.call(this, e, $this);
                })
                .on('hidden.bs.modal', function () {
                    $this.options.onHidden.call(this, e, $this);
                })
                .on('show.bs.modal', function () {
                    $this.options.onShow.call(this, e, $this);
                })
                .on('loaded.bs.modal', function () {
                    $this.options.onLoaded.call(this, e, $this);
                })
                .modal({
                    remote: url,
                    backdrop: 'static',
                    refresh: true
                });
        };

        $(document.body).off('click.leantony.modal').on('click.leantony.modal', $this.options.modalTriggerSelector, function (e) {
            e.preventDefault();
            clickHandler(this);
        });
    };

    /**
     * submit the modal form
     */
    modal.prototype.submitForm = function () {
        var $this = this;

        var submit_form = function (e) {
            var form = $('#' + $this.options.form_id);
            var data = form.serialize();
            var action = form.attr('action');
            var method = form.attr('method') || 'POST';
            // render notification on modal, instead of toast
            var renderMessageOnPage = form.data('notification') == 'inline';
            // check if we need to refresh any pjax container
            var pjaxTarget = form.data('pjax-target');
            var originalButtonHtml = $(e).html();
            $.ajax({
                type: method,
                url: action,
                data: data,
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        var message = response.message;
                        // sometimes we don't need to display a notification
                        if (!response.suppressNotification) {
                            // display on page, if needed
                            if (renderMessageOnPage) {
                                $('#' + $this.options.notification_id).html(leantony.utils.renderAlert('success', message));
                            } else {
                                leantony.notify({text: message || "Success.", type: "success"});
                            }
                        }
                        // check if we need to reload any target element via pjax
                        if (response.redirectTo) {
                            leantony.utils.loadLink(response.redirectTo, response.redirectTimout || 200);
                        }
                        // hide the modal after 1000 ms
                        setTimeout(function () {
                            $('#' + $this.options.modal_id).modal('hide');
                            if (pjaxTarget) {
                                // reload a pjax container
                                $.pjax.reload({container: pjaxTarget})
                            }
                        }, 1000);
                    }
                    else {
                        if (!response.suppressNotification) {
                            // render on page if needed
                            if (renderMessageOnPage) {
                                $('#' + $this.options.notification_id).html(leantony.utils.renderAlert('warning', response.message));
                            } else {
                                leantony.notify({text: response.message || "Warning.", type: "warning"});
                            }
                        }
                        setTimeout(function () {
                            $('#' + $this.options.modal_id).modal('hide');
                        }, 1000);
                    }
                },
                beforeSend: function () {
                    // display a neat loader on the submit button
                    $(e).attr('disabled', 'disabled').html('<span style="color: #ffffff;"><i class="fa fa-spinner"></i></span>');
                },
                complete: function () {
                    $(e).html(originalButtonHtml).removeAttr('disabled');
                },
                error: function (data) {
                    // handle errors gracefully
                    leantony.ajax.handleAjaxError(data, renderMessageOnPage ? {'element': $this.options.notification_id} : null);
                    $(e).html(originalButtonHtml).removeAttr('disabled');
                }
            });
        };

        $('#' + $this.options.modal_id).off("click.leantony.modal").on("click.leantony.modal", '#' + $this.options.form_id + ' button[type="submit"]', function (e) {
            e.preventDefault();
            submit_form(this);
        });
    };

    leantony.modal = function (options) {
        var obj = new modal(options);
        obj.show();
        obj.submitForm();
    };
}(jQuery));