leantony.ty = leantony.ty || {};

(function ($) {
    "use strict";

    var TypeAhead = function (options) {
        var defaultOptions = {
            selector: '.typeahead'
        };
        this.options = $.extend({}, defaultOptions, options || {});
    };

    TypeAhead.prototype.init = function () {
        var $this = this
            , e = $($this.options.selector)
            , data = e.data();

        if (!e.length || _.isEmpty(data.href)) {
            return false;
        }

        var url = data.href;
        var key = e.data('key') || 'id';
        var value = e.data('value') || 'name';
        var engine = new Bloodhound({
            datumTokenizer: function (d) {
                return Bloodhound.tokenizers.whitespace(d.value);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: url,
                prepare: function (query, settings) {
                    settings.url += '?term=' + query;
                    return settings;
                },
                filter: function (data) {
                    return $.map(data, function (obj) {
                        console.log(obj);
                        return {
                            id: obj[key],
                            value: obj[value]
                        };
                    });
                }
            }
        });
        engine.initialize();

        e.typeahead(null, {
            source: engine.ttAdapter(),
            minLength: 2,
            displayKey: 'value',
            templates: {
                empty: [
                    '<div class="empty-message">',
                    'unable to find any users',
                    '</div>'
                ].join('\n'),
                suggestion: function (data) {
                    return '<div><strong>' + data.value + '</strong></div>';
                }
            }
        });
    };

    leantony.ty = function (options) {
        var obj = new TypeAhead(options);
        obj.init();
    };
}(jQuery));