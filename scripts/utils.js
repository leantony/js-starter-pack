var leantony = {};

(function ($) {
    leantony.utils = {

        /**
         * load this once the app starts up
         *
         * @param callbacks
         */
        bootstrap: function (callbacks) {
            // ajax setup. this will send laravel csrf token on every ajax request
            this.setupAjax();

            // select2 initialization
            leantony.s2({});
            // our modal plugin
            leantony.modal({});

            // data-remotes
            leantony.ajax.doRemote($('.data-remote'), 'click');
            leantony.ajax.doRemote($('form[data-remote]'), 'submit');

            // table links
            this.tableLinks({element: 'linkable'});

            if (callbacks) {
                callbacks();
            }
        },

        /**
         * Linkable table rows
         *
         * @param options
         */
        tableLinks: function (options) {
            options = options || {};
            var linkables = $('.' + options.element);
            var $this = this;
            linkables.each(function (i, obj) {
                var link = $(obj).data('url');
                $(obj).click(function (e) {
                    $this.loadLink(link, 50);
                });
            });
        },

        /**
         * Ajax setup
         */
        setupAjax: function () {
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            });
        },

        /**
         * Enable pjax
         *
         * @param container
         * @param target
         * @param afterPjax
         * @param options
         */
        setupPjax: function (container, target, afterPjax, options) {
            // global timeout
            $.pjax.defaults.timeout = 3000;
            options = options || {};
            $(container).pjax(target, options);

            // do sth when the pjax request is done. Like reload plugins
            $(document).on('pjax:complete', function () {
                afterPjax();
            });
        },

        /**
         * load a link, with timeout
         */
        loadLink: function (url, delay) {
            if (!url) {
                url = location.href;
            }
            if (!delay) {
                window.location = url;
            }
            else {
                setTimeout(function () {
                    window.location = url;
                }, delay);
            }
        },

        /**
         * Populates a select with JSON data
         */
        populateDropDownList: function (selector, data, selected) {
            var options = '';
            $.each(data, function (i, item) {
                if (item.id === null) {
                    item.id = "";
                }
                options += '<option value="' + i + '">' + item + '</option>';
            });
            $(selector).html(options);
            if (!_.isEmpty(selected)) {
                $(selector).val(selected);
            }

            $(selector).change();
        },

        /**
         * Laravel returns validation error messages as a json object
         * We process that to respective html here
         * @param message
         * @returns {string}
         */
        processMessageObject: function (message) {
            var errors = '';
            // check if the msg was an object
            if ($.type(message) === "object") {
                $.each(message, function (key, value) {
                    errors += '<li>' + value[0] + '</li>';
                });
            } else {
                errors += '<p>' + message + '</p>';
            }
            return errors;
        },

        /**
         * Render a bootstrap alert to the user. Requires the html to be inserted to the target element
         * @param type
         * @param message
         * @param title
         * @returns {string}
         */
        renderAlert: function (type, message, title) {
            var validTypes = ['success', 'error', 'notice'], html = '';
            if (!type || ($.inArray(type, validTypes) < 0)) {
                type = validTypes[0];
            }
            if (type === 'success') {
                html += '<div class="alert alert-success">';
            }
            else if (type === 'error') {
                html += '<div class="alert alert-danger">';
            } else {
                html += '<div class="alert alert-warning">';
            }
            html += '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
            // add a title
            if (type === 'error') {
                html += title || "<strong>Please fix the following errors:</strong>";
            } else {
                html += title || "<strong>Action completed.</strong>"
            }
            message = this.processMessageObject(message);
            return html + message + '</div>';
        },

        /**
         * Block UI. call this at the start of an ajax request
         * @param message
         */
        startBlockUI: function (message) {
            if (typeof message === 'undefined') {
                message = 'Please wait ...';
            }
            var content = '<span id="bui">' + message + '</span>';
            $.blockUI({
                message: content,
                css: {
                    border: 'none', padding: '15px',
                    backgroundColor: '#333C44',
                    '-webkit-border-radius': '3px',
                    '-moz-border-radius': '3px',
                    opacity: 1, color: '#fff'
                },
                overlayCSS: {
                    backgroundColor: '#000',
                    opacity: 0.4,
                    cursor: 'wait',
                    'z-index': 1030
                }
            });
        },

        /**
         * Unblock UI. call this at the end of an ajax request
         */
        stopBlockUI: function () {
            $.unblockUI();
        },

        /**
         * Clear form values
         *
         * @param form_id
         */
        clear_form: function (form_id) {
            $(':input', '#' + form_id)
                .not(':button, :submit, :reset')
                .val('').removeAttr('checked')
                .removeAttr('selected')
                .removeClass('my-form-error');
        }
    };
    return leantony;
})(jQuery);