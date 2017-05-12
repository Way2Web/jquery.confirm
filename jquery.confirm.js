/* !
 * jquery.confirm
 *
 * @version 2.7.0
 *
 * @author My C-Labs
 * @author Matthieu Napoli <matthieu@mnapoli.fr>
 * @author Russel Vela
 * @author Marcus Schwarz <msspamfang@gmx.de>
 *
 * @license MIT
 * @url https://myclabs.github.io/jquery.confirm/
 */
(function($) {
    /**
     * Confirm a link or a button
     *
     * @param {object} options
     *
     * @return {object}
     */
    $.fn.confirm = function(options) {
        if (typeof options === 'undefined') {
            // eslint-disable-next-line no-param-reassign
            options = {};
        }

        this.click(function(e) {
            var newOptions;

            e.preventDefault();

            newOptions = $.extend({
                button: $(this)
            }, options);

            $.confirm(newOptions, e);
        });

        return this;
    };

    /**
     * Show a confirmation dialog
     * @param {object} options
     * @param {object} e
     */
    $.confirm = function(options, e) {
        // Parse options defined with "data-" attributes
        var dataOptions = {};
        var dataOptionsMapping;
        var settings;
        var modalHeader = '';
        var cancelButtonHtml = '';
        var modalHTML;
        var modal;

        // Log error and exit when no options.
        if (typeof options == 'undefined') {
            // eslint-disable-next-line no-console
            console.error('No options given.');

            return;
        }

        // Do nothing when active confirm modal.
        if ($('.confirmation-modal').length > 0) {
            return;
        }

        if (options.button) {
            dataOptionsMapping = {
                'title': 'title',
                'text': 'text',
                'confirm-button': 'confirmButton',
                'submit-form': 'submitForm',
                'cancel-button': 'cancelButton',
                'confirm-button-class': 'confirmButtonClass',
                'cancel-button-class': 'cancelButtonClass',
                'dialog-class': 'dialogClass',
                'modal-options-backdrop':'modalOptionsBackdrop',
                'modal-options-keyboard':'modalOptionsKeyboard'
            };

            $.each(dataOptionsMapping, function(attributeName, optionName) {
                var value = options.button.data(attributeName);

                if (typeof value != 'undefined') {
                    dataOptions[optionName] = value;
                }
            });
        }

        // Default options
        settings = $.extend({}, $.confirm.options, {
            confirm: function() {
                var url;
                var form;

                if (dataOptions.submitForm
                    || (typeof dataOptions.submitForm == 'undefined' && options.submitForm)
                    || (
                        typeof dataOptions.submitForm == 'undefined'
                        && typeof options.submitForm == 'undefined'
                        && $.confirm.options.submitForm
                    )
                ) {
                    $(e.target).closest('form').submit();
                } else {
                    url = e && (
                            ('string' === typeof e && e)
                            || (e.currentTarget && e.currentTarget.attributes['href'].value)
                        );

                    if (url) {
                        if (options.post) {
                            form = $('<form method="post" class="hide" action="' + url + '"></form>');

                            $('body').append(form);
                            form.submit();
                        } else {
                            window.location = url;
                        }
                    }
                }
            },
            cancel: function() {
            },
            button: null
        }, options, dataOptions);

        if (settings.title !== '') {
            modalHeader =
                '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                    '<h4 class="modal-title">' + settings.title + '</h4>' +
                '</div>';
        }

        if (settings.cancelButton) {
            cancelButtonHtml =
                '<button class="cancel btn ' + settings.cancelButtonClass + '" type="button" data-dismiss="modal">' +
                    settings.cancelButton +
                '</button>';
        }
        modalHTML =
                '<div class="confirmation-modal modal fade" tabindex="-1" role="dialog">' +
                    '<div class="' + settings.dialogClass + '">' +
                        '<div class="modal-content">' +
                            modalHeader +
                            '<div class="modal-body">' + settings.text + '</div>' +
                            '<div class="modal-footer">' +
                                '<button class="confirm btn '
                                    + settings.confirmButtonClass
                                    + '" type="button" data-dismiss="modal">' +
                                    settings.confirmButton +
                                '</button>' +
                                cancelButtonHtml +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

        modal = $(modalHTML);

        // Apply modal options
        if (
            typeof settings.modalOptionsBackdrop != 'undefined'
            || typeof settings.modalOptionsKeyboard != 'undefined'
        ) {
            modal.modal({
                backdrop: settings.modalOptionsBackdrop,
                keyboard: settings.modalOptionsKeyboard
            });
        }

        modal.on('shown.bs.modal', function() {
            modal.find('.btn-primary:first').focus();
        });
        modal.on('hidden.bs.modal', function() {
            modal.remove();
        });
        modal.find('.confirm').click(function() {
            settings.confirm(settings.button);
        });
        modal.find('.cancel').click(function() {
            settings.cancel(settings.button);
        });

        // Show the modal
        $('body').append(modal);
        modal.modal('show');
    };

    /**
     * Globally definable rules
     */
    $.confirm.options = {
        text: 'Are you sure?',
        title: '',
        confirmButton: 'Yes',
        cancelButton: 'Cancel',
        post: false,
        submitForm: false,
        confirmButtonClass: 'btn-primary',
        cancelButtonClass: 'btn-default',
        dialogClass: 'modal-dialog',
        modalOptionsBackdrop: true,
        modalOptionsKeyboard: true
    };
})(jQuery);
