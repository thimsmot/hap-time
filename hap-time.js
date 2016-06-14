/**
 * HAPTime - Happy Alien Productions Time Plug-in.
 *
 * This jQuery plug in provides time validation functionality along with some
 * CSS styling for a small, 12-hour clock (i.e. non-military time) UI widget.
 * The following markup (including classes) is required for each instance of
 * the widget:
 *
 * <div id='hap-time-1' class='hap-time'>
 *     <input class='hap-time-hour' maxlength='2'>
 *     <span class='hap-time-separator'>:</span>
 *     <input class='hap-time-minute' maxlength='2'>
 *     <div class='hap-time-meridiem'><p class='active'>AM</p><p>PM</p></div>
 * </div>
 *
 * @author      Thomas Smith <tom@happyalienproductions.com>
 * @version     1.0
 * @requires    jQuery v1.11.1, hap-time.css
 * @param $     jQuery object.
 */
(function($) {
    $.fn.haptime = function(option, argument) {
        var retVal = this;

        this.each(function() {
            if (!option) {
                // 'option' not set is initialization. The following attaches
                // the event handlers & adjusts a couple other css things.
                clearReadOnly($(this));
            } else {
                // 'option' set, so we must me calling functions. Type of
                // 'argument' will vary according to what 'option' is.
                switch (option) {
                    case "getIsoTime":
                        retVal = getIsoTime($(this));
                        break;
                    case "setTime":
                        if (argument) {
                            retVal = setTime($(this), argument);
                        }
                        break;
                    case "setReadOnly":
                        setReadOnly($(this), argument);
                        break;
                    default:
                        break;
                }
            }
        });

        return retVal;
    };

    /**
     * Change the state of the hap-time object from editable to read-only and
     * vice versa. The 'readonly' property is added to the relevant elements,
     * the cursor is changed to indicate 'not clickable' and the event handlers
     * are unbound.
     *
     * @author Thomas Smith <tom@happyalienprouctions.com>
     * @version 1.0
     * @param {object} $haptime A div.hap-time jQuery object.
     * @param {boolean} readOnly True to set the object state to read-only, false to make editable.
     * @returns {null}
     */
    function setReadOnly($haptime, readOnly) {
        if (readOnly) {
            // Remove the event handlers.
            $haptime.children('.hap-time-meridiem').children('p').off('click');
            $haptime.children('.hap-time-hour').off('keydown');
            $haptime.children('.hap-time-minute').off('keydown');

            // Add the readonly attribute to the inputs.
            $haptime.children('.hap-time-hour').prop('readonly', true);
            $haptime.children('.hap-time-minute').prop('readonly', true);

            // Set the am/pm cursor to a pointer, for 'non-clickability'.
            $haptime.children('.hap-time-meridiem').children('p').css('cursor', 'default');
        } else {
            clearReadOnly($haptime);
        }
    }

    /**
     * Reses the control to an editable state. The 'readonly' property is removed,
     * event handlers reattached, and cursor restored.
     *
     * @author Thomas Smith <tom@happyalienproductions.com>
     * @version 1.0
     * @param {object} $haptime A div.hap-time jQuery object.
     * @returns {null}
     */
    function clearReadOnly($haptime) {
        // Remove readonly attribute from the inputs.
        $haptime.children('.hap-time-hour').prop('readonly', false);
        $haptime.children('.hap-time-minute').prop('readonly', false);

        // Bind events to their handlers.
        $haptime.children('.hap-time-hour').keydown(onHourKeyDown);
        $haptime.children('.hap-time-minute').keydown(onMinuteKeyDown);
        $haptime.children('.hap-time-meridiem').children('p').click(onClickMeridiem);

        // Set the am/pm cursor to a pointer, for 'clickability'.
        $haptime.children('.hap-time-meridiem').children('p').css('cursor', 'pointer');
    }

    /**
     * Returns and ISO formatted time string representing the time currently being
     * stored by the object.
     *
     * @author Thomas Smith <tom@happyalienproductions.com>
     * @version 1.0
     * @param {object} $haptime A div.hap-time jQuery object.
     * @returns {String} A string representing the currently set time.
     */
    function getIsoTime($haptime) {
        var hh = parseInt($haptime.children('.hap-time-hour').val());
        var mm = parseInt($haptime.children('.hap-time-minute').val());
        var pm = $haptime.children('.hap-time-meridiem').children('p:last-child').hasClass('active');

        if (isNaN(hh)) {
            $haptime.children('.hap-time-hour').val(leadingZero(0));
            hh = 0;
        }

        if (isNaN(mm)) {
            $haptime.children('.hap-time-minute').val(leadingZero(0));
            mm = 0;
        }

        if (hh === 12 && !pm) {
            hh = 0;
        } else if (hh < 12 && pm) {
            hh = hh + 12;
        }

        var retVal = leadingZero(hh) + ":" + leadingZero(mm) + ":00";
        return retVal;
    }

    /**
     * A wrapper/helper function to set the time to be displayed by the control.
     * Accepts either and initialized JavaScript Date object or, an ISO time string.
     *
     * @author Thomas Smith <tom@happyalienproductions.com>
     * @version 1.0
     * @param {object} $haptime A div.hap-time jQuery object.
     * @param {type} time A JavaScript Date or ISO time string.
     * @returns {null}
     */
    function setTime($haptime, time) {
        if (typeof time === 'object') {
            setTimeFromDateObject($haptime, time);
        } else if (typeof time === 'string') {
            setTimeFromIso($haptime, time);
        }
    }

    /**
     * Worker function that sets the controls values from an initialized
     * JavaScript Date object.
     *
     * @author Thomas Smith <tom@happyalienproductions.com>
     * @version 1.0
     * @param {object} $haptime A div.hap-time jQuery object.
     * @param {Date} dateObject An initialized JavaScript Date object.
     * @returns {null}
     */
    function setTimeFromDateObject($haptime, dateObject) {
        var timeString = dateObject.toLocaleTimeString();
        var timeElements = timeString.substring(0, 8).split(":");
        var meridiem = timeString.substring(timeString.length - 2, timeString.length);

        $haptime.children('.hap-time-hour').val(leadingZero(parseInt(timeElements[0])));
        $haptime.children('.hap-time-minute').val(leadingZero(parseInt(timeElements[1])));

        if (meridiem === 'AM') {
            $haptime.children('.hap-time-meridiem').children('p:first-child').click();
        } else {
            $haptime.children('.hap-time-meridiem').children('p:last-child').click();
        }
    };

    /**
     * Worker function that sets the controls values from an ISO time string.
     *
     * @author Thomas Smith <tom@happyalienproductions.com>
     * @version 1.0
     * @param {object} $haptime A div.hap-time jQuery object.
     * @param {String} timeString An ISO time string.
     * @returns {null}
     */
    function setTimeFromIso($haptime, timeString) {
        // HH:MM:SS in military (24-hour) time, e.g. 22:35 = 10:35 PM.
        var timeElements = timeString.split(":");
        var hh = parseInt(timeElements[0]);
        var mm = parseInt(timeElements[1]);
        var pm = hh >= 12;

        if (pm) {
            $haptime.children('.hap-time-meridiem').children('p:last-child').click();
        }else {
            $haptime.children('.hap-time-meridiem').children('p:first-child').click();
        }

        if (hh < 1) {
            hh = 12;
        } else if (hh > 12) {
            hh = hh - 12;
        }

        $haptime.children('.hap-time-hour').val(leadingZero(hh));
        $haptime.children('.hap-time-minute').val(leadingZero(mm));
    }

    /**
     * Click event handler to toggle choice of 'AM' or 'PM'.
     *
     * @author Thomas Smith <tom@happyalienproductions.com>
     * @version 1.0
     * @param {Event} event
     * @returns {Boolean}
     */
    function onClickMeridiem(event) {
        var retVal = true;

        if ($(this).hasClass('active')) {
            retVal = false;
        } else {
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
        }

        return retVal;
    }

    /**
     * Key stroke event handler to control and filter input for the 'hour'
     * portion of the control. The standard arrow keys, as well as the
     * keypad '+' and '-' keys are handled. All others are passed on.
     *
     * The goal is to provide circular incrementing and decrementing so that
     * only values that makes sense as an hour of the day will be allowed.
     * E.g. 1 - 12 for a normal 12 hour clock.
     *
     * @author Thomas Smith <tom@happyalienproductions.com>
     * @version 1.0
     * @param {Event} event
     * @returns {Boolean}
     */
    function onHourKeyDown(event) {
        var retVal = true;
        var hour = parseInt($(this).val());

        if (isNaN(hour)) {
            hour = 0;
        }

        switch (event.which) {
            case 38:    /* up arrow */
            case 107:   /* numpad + */
                if (hour >= 12 ) {
                    hour = 1;
                } else {
                    hour = hour + 1;
                }
                $(this).val(leadingZero(hour));
                event.preventDefault();
                break;
            case 40:    /* down arrow */
            case 109:   /* numpad - */
                if (hour <= 1) {
                    hour = 12;
                } else {
                    hour = hour - 1;
                }
                $(this).val(leadingZero(hour));
                event.preventDefault();
                break;
            case 186:   /* semi-colon */
                $(event.target).siblings('.hap-time-minute').focus();
                event.preventDefault();
                break
            default:
                onKeyDown(event);
                break;
        }

        return retVal;
    }

    /**
     * Key stroke event handler to control and filter input for the 'minute'
     * portion of the control. The standard arrow keys, as well as the
     * keypad '+' and '-' keys are handled. All others are passed on.
     *
     * The goal is to provide circular incrementing and decrementing so that
     * only values that make sense as a minute of an hour will be allowed.
     * E.g. 0 - 59.
     *
     * @author Thomas Smith <tom@happyalienproductions.com>
     * @version 1.0
     * @param {Event} event
     * @returns {Boolean}
     */
    function onMinuteKeyDown(event) {
        var retVal = true;
        var minute = parseInt($(this).val());

        if (isNaN(minute)) {
            minute = 0;
        }

        switch (event.which) {
            case 38:    /* up arrow */
            case 107:   /* numpad + */
                if (minute >= 59) {
                    minute = 0;
                } else {
                    minute = minute + 1;
                }
                $(this).val(leadingZero(minute));
                event.preventDefault();
                break;
            case 40:    /* down arrow */
            case 109:   /* numpad - */
                if (minute <= 0) {
                    minute = 59;
                } else {
                    minute = minute - 1;
                }
                $(this).val(leadingZero(minute));
                event.preventDefault();
                break;
            default:
                onKeyDown(event);
                break;
        }

        return retVal;
    }

    /**
     * An event handler to process and/or filter all keyboard input other than
     * incrementation and decrementation. The 'a' and 'p' keys are handled to
     * allow for selection of 'AM' or 'PM' and a few others are allowed to
     * facilitate entry and editing. Everything else is ignored.
     *
     * @author Thomas Smith <tom@happyalienproductions.com>
     * @version 1.0
     * @param {Event} event A keystroke event.
     * @returns {Boolean}
     */
    function onKeyDown(event) {
        var retVal = true;

        // Provide handling for specific keys.
        switch (event.which) {
            case 65: /* 'a'; */
                $(event.target).siblings('.hap-time-meridiem').find('p:first-child').click();
                event.preventDefault();
                break;
            case 80: /* 'p' */
                $(event.target).siblings('.hap-time-meridiem').find('p:last-child').click();
                event.preventDefault();
                break;
            default:
                // Always allow numeric digits 0 - 9 on both the regular 'typewriter'
                // keys, as well as the numeric keypad, along with some control/whitespace
                // characters.
                if (inRange(event.which, 48, 57) ||
                    inRange(event.which, 96, 105) ||
                    -1 < $.inArray(event.which, [
                        8,      /* backspace */
                        9,      /* tab */
                        13,     /* enter */
                        37,     /* left arrow */
                        39,     /* right arrow */
                        46      /* delete */
                    ])) {
                    break;
                } else {
                    event.preventDefault();
                }
                break;
        }

        return retVal;
    }

    /**
     * Utility function to prepend a leading zero on a number it is less than 10.
     *
     * @author Thomas Smith <tom@happyalienproductions.com>
     * @version 1.0
     * @param {Integer} theNumber A number to test
     * @returns {String} Returns 'theNumber' with a zero prepended if less than 10.
     */
    function leadingZero(theNumber) {
        return theNumber <= 9 ? "0" + theNumber.toString() : theNumber.toString();
    }

    /**
     *
     * @param {Number} value The value to be tested again a minimum and maximum value.
     * @param {Number} min The value to be used as the minimum value in a range comparison.
     * @param {Number} max Tbe value to be used as the maximum value in a range comparison.
     * @returns {Boolean} True if 'value' is between 'min' and 'max' (inclusive).
     */
    function inRange(value, min, max) {
        return (value <= max) && (value >= min);
    }

})(jQuery);
