leantony.s2 = leantony.s2 || {};

(function ($) {
    var S2 = function (opts) {
        var defaults = {
            dropdown_class: 'enhanced-dropdown',
            data_values: 'values'
        };
        this.opts = $.extend({}, defaults, opts || {});
    };

    S2.prototype.getElementClass = function (e) {
        return $('.' + e);
    };

    S2.prototype.getElement = function ($this) {
        return this.getElementClass($this.opts.dropdown_class);
    };

    /**
     * Pre mark select2 with values
     *
     * @param value
     * @param $this
     */
    var prepopulate = function (value, $this) {
        var preselected = $(value).data($this.opts.data_values);
        if (preselected) {
            // convert the json to a key value array
            var values = $.map(preselected, function (el, k) {
                return [el, k]
            });
            $(value).val(values).trigger("change");
        }
    };

    /**
     * Refresh a target select 2 element when an item is selected
     *
     * @param $value
     * @param $this
     */
    var refreshTarget = function ($value, $this) {

        $value.on("select2:select", function (e) {
            var selectedElement = $(e.currentTarget);
            var selectedValue = selectedElement.val();
            var triggerLink = selectedElement.data('trigger-href') || null;
            var targetSelect = selectedElement.data('trigger-target') || null;
            var targetKey = selectedElement.data('trigger-search-key') || 'id';
            var targetValue = selectedElement.data('trigger-search-value') || 'name';

            if (selectedValue && triggerLink && targetSelect) {
                $.ajax({
                    url: triggerLink,
                    type: 'GET',
                    data: {
                        'query': selectedValue
                    },
                    dataType: 'json',
                    cache: true,
                    success: function (response) {
                        // clear previous
                        $(targetSelect).empty().trigger('change');

                        var data = function () {
                            return $.map(response.data, function (item) {
                                return {
                                    text: item[targetValue],
                                    id: item[targetKey]
                                }
                            });
                        };

                        $(targetSelect).select2($.extend($this.opts.select2, {
                            data: data()
                        })).trigger('change');
                    },
                    error: function (data) {
                        leantony.ajax.handleAjaxError(data, null)
                    }
                });

                $(targetSelect).unbind('change');
            }
        });
    };

    /**
     * Send an AJAX request
     *
     * @param $value
     * @param $this
     */
    var sendAjax = function ($value, $this) {
        // query data key
        var $keyAttribute = $value.data('key') || 'id';
        // query data value
        var $valueAttribute = $value.data('value') || 'name';
        // cache the requests
        var cacheResult = $value.data('use-cache') || true;
        // support tagging
        var tags = $value.data('tags');
        // the url the request will be sent to
        var url = $value.data('url');

        $value.select2({
            minimumInputLength: 2,
            tags: !!tags,
            ajax: {
                url: url,
                dataType: 'json',
                type: "GET",
                quietMillis: 100,
                cache: true,

                data: function (params) {
                    return params;
                },
                processResults: function (data) {
                    return {
                        results: $.map(data, function (item) {
                            return {
                                text: item[$valueAttribute],
                                id: item[$keyAttribute]
                            }
                        })
                    };
                }
            }
        });

        // refresh any other select 2 target
        refreshTarget($value, $this);
    };

    /**
     * Enhance select 2
     */
    S2.prototype.enhance = function () {
        var $this = this;
        var elem = this.getElement($this);
        if (elem.is('select')) {
            // ajax capabilities
            if (elem.data('ajax')) {

                // support more than 1
                elem.each(function (key, value) {
                    var $value = $(value);

                    sendAjax($value, $this);
                });
            } else {
                // default init
                elem.select2($this.opts.select2 || {});

                // support more than 1
                elem.each(function (key, value) {

                    // premark any elements
                    prepopulate(value, $this);

                    var triggerLink = $(value).data('trigger-href') || null;
                    if(triggerLink){
                        // refresh any other select 2 target
                        refreshTarget(value, $this);
                    }
                });
            }
        }
    };

    leantony.s2 = function (options) {
        var obj = new S2(options);
        obj.enhance();
    };
})(jQuery);