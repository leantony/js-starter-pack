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

    S2.prototype.enhance = function () {
        var $this = this;
        var elem = this.getElementClass($this.opts.dropdown_class);
        if (elem.is('select')) {
            // ajax capabilities
            if (elem.data('ajax')) {
                var $keyAttribute = elem.data('key') || 'id';
                var $valueAttribute = elem.data('value') || 'name';
                var tags = elem.data('tags');
                var url = elem.data('url');
                elem.select2({
                    minimumInputLength: 2,
                    tags: !!tags,
                    ajax: {
                        url: url,
                        dataType: 'json',
                        type: "GET",
                        quietMillis: 50,
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
            } else {
                // default init
                elem.select2($this.opts.select2 || {});
            }
            // handle more than one select2 in the form too
            elem.each(function (key, value) {
                // check if we need to pre-populate the select2
                var preselected = $(value).data($this.opts.data_values);
                if (preselected) {
                    // convert the json to a key value array
                    var values = $.map(preselected, function (el, k) {
                        return [el, k]
                    });
                    $(value).val(values).trigger("change");
                }

            })
        }
    };

    leantony.s2 = function (options) {
        var obj = new S2(options);
        obj.enhance()
    };
})(jQuery);