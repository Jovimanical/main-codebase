/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(7);
	module.exports = __webpack_require__(8);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/* global $ */
	// require('bootstrap');
	'use strict';
	
	var Utils = __webpack_require__(3);
	var Urls = __webpack_require__(5);
	__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"int_tel_input\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var mdetect = __webpack_require__(6);
	var MobileEsp = mdetect.MobileEsp;
	
	//Login form Initialization
	function LoginInitialize() {
	    // alert(MobileEsp.DetectTierIphone())
	    // alert(MobileEsp.DetectTierRichCss())
	    // alert(MobileEsp.DetectOperaMobila())
	    var beforeSubmit = function beforeSubmit(data) {
	        console.log(Utils.getCookie('csrftoken'));
	        $('#login_form').find('input[name="csrfmiddlewaretoken"]').val(Utils.getCookie('csrftoken'));
	    };
	    var success = function success(data) {
	        console.log(data);
	        window.location.reload();
	    };
	    Utils.FormInitialize($('#login_form'), beforeSubmit, success, null, '#loginSubmitButton');
	}
	
	function ResetInitialize(regular) {
	    var form = $('#reset_password_form');
	    Utils.parsleyfyForm(form);
	    var before = function before(d) {
	        form.find('input[name="csrfmiddlewaretoken"]').val(Utils.getCookie('csrftoken'));
	    };
	    var success = function success(data, xhr) {
	        form.find('.invalid-form-error-message').html('Email Sent!').addClass("filled");
	        console.log(xhr);
	    };
	    if (regular) {
	        Utils.FormInitialize(form, before, success, 'text', '#resetButton');
	    }
	}
	function intelInput() {
	    $("#id_phone_number").intlTelInput({
	        defaultCountry: "ng",
	        onlyCountries: ["ng"],
	        utilsScript: "/static/js/utils.js" // just for formatting/placeholders etc
	    });
	}
	
	function phone_value(phone) {
	    var country = phone.intlTelInput("getSelectedCountryData").dialCode,
	        isValid = phone.intlTelInput("isValidNumber");
	    if (isValid === false) {
	        return "+" + country + phone.val();
	    }
	    return phone.val();
	}
	
	function SignUp(no_phone, signupCallback) {
	    var signup_form = $('#signup_form'),
	        country = $('#id_country'),
	        all_signup = $('.signup_form');
	
	    var phone_data, password_data;
	
	    //if (no_phone) {
	    intelInput();
	    //}
	
	    var isOperaMini = !!window['operamini'];
	    if (!isOperaMini) {
	        Utils.parsleyfyForm(signup_form);
	        if (all_signup.length > 0) {
	            Utils.parsleyfyForm(all_signup);
	        }
	    }
	    console.log(no_phone);
	    if (no_phone) {
	
	        if (country.find(':selected').val() == 'NG') {
	            displayMailingList();
	        } else {
	            displayMailingList(true);
	        }
	    }
	    var beforSubmit = function beforSubmit(form) {
	        var url = form.attr('action');
	        form.find('input[name="csrfmiddlewaretoken"]').val(Utils.getCookie('csrftoken'));
	        console.log(url);
	        if (no_phone) {
	            if (url === Urls['account_signup']()) {
	                var phone = $("#id_phone_number");
	                phone.val(phone_value(phone));
	                //    country = phone.intlTelInput("getSelectedCountryData").dialCode,
	                //    isValid = phone.intlTelInput("isValidNumber");
	                //if (isValid === false) {
	                //    phone.val("+" + country + phone.val());
	                //    console.log(phone.val());
	                //}
	            } else {
	                    console.log(url);
	                }
	        }
	    };
	
	    var successCallback = function successCallback(data) {
	        var form_url = this.url;
	        if (form_url === Urls['users:mailing_signup']()) {
	            console.log(form_url);
	            console.debug(data);
	            window.location.href = data.location;
	        } else {
	            console.log(data);
	            if (signupCallback) {
	                signupCallback(data);
	            }
	        }
	    };
	
	    var errorCallback = function errorCallback(xhr, err) {
	        // alert('Error');
	        var error = xhr.responseJSON.form_errors;
	        console.log(error);
	        var errorNode = $('.signupErrorMessage');
	        errorNode.empty();
	        for (var key in error) {
	            errorNode.append('<p class="text-danger">' + error[key][0] + '</p>');
	        }
	    };
	    if (!isOperaMini) {
	        //debugger;
	        Utils.formSubmission(signup_form, beforSubmit, successCallback, errorCallback, null, '#submit_btn');
	        if (all_signup.length > 0) {
	            Utils.formSubmission(all_signup, beforSubmit, successCallback, errorCallback, null);
	        }
	    } else {
	        // signup_form.submit()
	        // Utils.formSubmission(signup_form, beforSubmit, successCallback, errorCallback,null);  
	    }
	
	    function displayMailingList(status) {
	        var form = $('#signup_form'),
	            phone = $("#phone_no"),
	            password = $("#pass_group"),
	            phone_container = $('#phone_container'),
	            password_container = $('#password_container'),
	            submitBtn = $("#submit_btn");
	        if (status) {
	            form.attr('action', Urls['users:mailing_signup']());
	            if (phone.length > 0) {
	                phone_data = phone.remove();
	            }
	            if (password.length > 0) {
	                password_data = password.remove();
	            }
	            $("#signup_header_text").removeClass('hidden').addClass('hidden');
	            $("#maillist_header_text").removeClass('hidden');
	            submitBtn.text("Subscribe");
	            $('.last.agree-to').addClass('hidden');
	        } else {
	            form.attr('action', Urls['account_signup']());
	            if (phone_data) {
	                phone_container.append(phone_data);
	                intelInput();
	                phone_data = null;
	            }
	            if (password_data) {
	                password_container.append(password_data);
	                password_data = null;
	            }
	            $("#maillist_header_text").removeClass('hidden').addClass('hidden');
	            $("#signup_header_text").removeClass('hidden');
	            submitBtn.text("Join Now");
	            $('.last.agree-to').removeClass('hidden');
	        }
	    }
	
	    // if (no_phone) {
	    country.change(function () {
	        var selected = $(this).find("option:selected");
	        if (selected.val() === 'NG') {
	            displayMailingList();
	        } else {
	            displayMailingList(true);
	        }
	        console.debug();
	    });
	
	    // }
	}
	
	function AuthModal() {
	    $('#authModal').on('show.bs.modal', function (event) {
	        var link_id = $(event.relatedTarget)[0].id;
	        console.log(link_id);
	        var modal = $(this);
	        var login_form = modal.find('#login_modal'),
	            signup_form = modal.find('#signup_modal'),
	            reset_form = modal.find('#reset_modal'),
	            modal_title = modal.find('h2.modal-title'),
	            modal_subtitle = modal.find('p.modal-subheader'),
	            login_footer = modal.find('.login_footer'),
	            signup_footer = modal.find('.signup_footer'),
	            reset_footer = modal.find('.reset_footer'),
	            forgot_password = modal.find('.password_link');
	
	        function displayLoginForm() {
	            login_form.removeClass('hidden');
	            login_footer.removeClass('hidden');
	            signup_form.addClass('hidden');
	            signup_footer.addClass('hidden');
	            reset_form.addClass('hidden');
	            reset_footer.addClass('hidden');
	            modal_title.text('Log in to Tuteria');
	            $('.invalid-form-error-message').empty();
	            modal_subtitle.text('Enter your email and password to access your account');
	        }
	
	        function displaySignupForm() {
	            signup_form.removeClass('hidden');
	            signup_footer.removeClass('hidden');
	            login_form.addClass('hidden');
	            login_footer.addClass('hidden');
	            reset_form.addClass('hidden');
	            reset_footer.addClass('hidden');
	            modal_title.text('WELCOME HOME');
	            $('.invalid-form-error-message').empty();
	            modal_subtitle.html('<a href="' + Urls['account_signup']() + '">Join</a> Tuteria to connect with quality tutors and clients');
	        }
	
	        function displayResetForm() {
	            signup_form.addClass('hidden');
	            signup_footer.addClass('hidden');
	            login_form.addClass('hidden');
	            login_footer.addClass('hidden');
	            reset_form.removeClass('hidden');
	            reset_footer.removeClass('hidden');
	            modal_title.text('Reset Password');
	            $('.invalid-form-error-message').empty();
	            modal_subtitle.text('Enter your email address to reset your password');
	        }
	
	        if (link_id === 'login_nav') {
	            displayLoginForm();
	        }
	        if (link_id === 'signup_nav') {
	            displaySignupForm();
	        }
	        login_footer.find('a').on('click', function () {
	            displaySignupForm();
	        });
	        signup_footer.find('a').on('click', function () {
	            displayLoginForm();
	        });
	        reset_footer.find('a').on('click', function () {
	            displayLoginForm();
	        });
	        forgot_password.on('click', function (e) {
	            e.preventDefault();
	            displayResetForm();
	        });
	    });
	};
	
	function AutocompleteSearch() {
	    //var BH = Utils.getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	    var BH = Utils.getBloodhoundInstance('name', Urls['ajax_skills_all']());
	    BH.initialize();
	    Utils.ApplyTypeaheadToInput($('#nav-skill-input'), 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(" in ")[0].trim();
	        $(this).typeahead('val', skill);
	        if (datum.slug) {
	            window.location.href = Urls["skill_only_view"](datum.slug);
	        } else {
	
	            $("form[name='search-form']").submit();
	        }
	    });
	    var search_form = $('form[name="search-form"]');
	
	    search_form.parsley();
	}
	function MobileAutocompleteSearch() {
	    //var BH = Utils.getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	    var BH = Utils.getBloodhoundInstance('name', Urls['ajax_skills_all']());
	    BH.initialize();
	    Utils.ApplyTypeaheadToInput($('#mobile_skill_input'), 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(" in ")[0].trim();
	        $(this).typeahead('val', skill);
	        if (datum.slug) {
	            window.location.href = Urls["skill_only_view"](datum.slug);
	        } else {
	
	            $('#mobile-nav-search-form').submit();
	        }
	    });
	    Utils.ApplyTypeaheadToInput($('#mobile_search_form22'), 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(" in ")[0].trim();
	        $(this).typeahead('val', skill);
	        if (datum.slug) {
	            window.location.href = Urls["skill_only_view"](datum.slug);
	        } else {
	
	            $(this).closest('form').submit();
	        }
	    });
	    $('#mobile-nav-search-form').parsley();
	}
	function InternalNavMobile() {
	    $('.subnav.hide-print .subnav-item').on('click', function (e) {
	        $('.subnav.hide-print .subnav-list').toggleClass('is-open');
	    });
	}
	
	function AuthFunction(phone, sign_incallback, login_callback, reset_callback) {
	    $('#nav-skill-input').blur();
	    $('.navdropdown.dropdown').hover(function () {
	        $('.dropdown-toggle', this).trigger('click');
	    });
	    var isBBLow = MobileEsp.DetectBlackBerryHigh();
	    var isBBHigh = MobileEsp.DetectBlackBerryLow();
	    var isOperaMini = !!window['operamini'];
	
	    if (!isOperaMini) {
	        $('#mobile-navigation').find('#login_nav').attr('href', '#').attr('data-toggle', 'modal').attr('data-target', '#authModal');
	        $('#mobile_login_nav').attr('href', '#').attr('data-toggle', 'modal').attr('data-target', '#authModal');
	
	        $('#login_nav').attr('href', '#').attr('data-toggle', 'modal').attr('data-target', '#authModal');
	        // $('#signup_nav').attr('href', '#')
	        //         .attr('data-toggle', 'modal')
	        //         .attr('data-target', '#authModal');
	        $.each($('.signup_nav'), function (key, val) {
	            $(val).attr('href', '#').attr('data-toggle', 'modal').attr('data-target', '#authModal');
	        });
	        $.each($('.login_nav2'), function (key, val) {
	            $(val).attr('href', '#').attr('data-toggle', 'modal').attr('data-target', '#authModal');
	        });
	    }
	
	    $('.top-search input').blur();
	
	    AutocompleteSearch();
	    MobileAutocompleteSearch();
	    AuthModal();
	    InternalNavMobile();
	    SignUp(phone, sign_incallback);
	    LoginInitialize();
	    ResetInitialize(true);
	    ShareButtonCounter();
	}
	function ShareButtonCounter() {
	    function openWindow(e) {
	        e.preventDefault();
	        window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
	        return false;
	    }
	
	    $('.toggle_invite_section').click(function (e) {
	        $('#prelaunch_section').addClass('hidden');
	    });
	    $('.invite_friends_btn').click(function (e) {
	        $('#prelaunch_section').addClass('hidden');
	        $('#invite_counter_section').removeClass('collapse').removeClass('fade');
	        window.location.hash = "#launch_sec";
	    });
	
	    $(".share-popup").click(function (e) {
	        e.preventDefault();
	        console.log("I was clicked");
	        var window_size = "";
	        var url = this.href;
	        var domain = url.split("/")[2];
	        console.log(domain);
	        switch (domain) {
	            case "www.facebook.com":
	                $.get(Urls['button_clicks']() + '?button_type=facebook', function () {});
	                window_size = "width=585,height=368";
	                break;
	            case "twitter.com":
	                $.get(Urls['button_clicks']() + '?button_type=twitter', function () {});
	                window_size = "width=585,height=261";
	                break;
	            case "plus.google.com":
	                $.get(Urls['button_clicks']() + '?button_type=google', function () {});
	                window_size = "width=517,height=511";
	                break;
	            default:
	                window_size = "width=585,height=511";
	        }
	        window.open(url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,' + window_size);
	        return false;
	    });
	}
	
	exports.AuthModal = AuthModal;
	exports.LoginInitialize = LoginInitialize;
	exports.SignUp = SignUp;
	exports.ResetInitialize = ResetInitialize;
	exports.phone_value = phone_value;
	exports.intelInput = intelInput;
	exports.Authenticate = AuthFunction;
	exports.ShareButtonCounter = ShareButtonCounter;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {//require('typeahead.js');
	'use strict';
	
	var Bloodhound = __webpack_require__(4);
	var Urls = __webpack_require__(5);
	function getBloodhoundInstance(name, prefetch, remote) {
	    var data = {
	        datumTokenizer: Bloodhound.tokenizers.obj.whitespace(name),
	        queryTokenizer: Bloodhound.tokenizers.whitespace,
	        limit: 10,
	        prefetch: prefetch
	    };
	    if (remote) {
	        data['remote'] = remote;
	    }
	    return new Bloodhound(data);
	}
	
	function getBloodhoundInstanceT(key, callback) {
	    return new Bloodhound({
	        datumTokenizer: function datumTokenizer(d) {
	            return Bloodhound.tokenizers.whitespace(d.name);
	        },
	        queryTokenizer: Bloodhound.tokenizers.whitespace,
	        prefetch: callback()
	    });
	}
	function getBloodhoundInstanceT2(key, callback) {
	    return new Bloodhound({
	        datumTokenizer: Bloodhound.tokenizers.obj.whitespace(key),
	        queryTokenizer: Bloodhound.tokenizers.whitespace,
	        local: callback()
	    });
	}
	function keyupCallback(node, no_of_chars, counter) {
	    var thisChars = node.value.replace(/{.*}/g, '').length; //get chars count in textarea
	    var per = thisChars * 100;
	    var value = per / no_of_chars; // total percent complete
	    if (thisChars > no_of_chars) //if we have more chars than it should be
	        {
	            var CharsToDel = thisChars - no_of_chars; // total extra chars to delete
	            node.value = node.value.substring(0, node.value.length - CharsToDel); //remove excess chars from textarea
	        } else {
	            counter.text(no_of_chars - thisChars); //count remaining chars
	            $('#percent').text(value + '%');
	        }
	}
	
	function FormInitialize(form, beforeSubmit, success, dataType, button_id) {
	    parsleyfyForm(form);
	
	    var error = function error(_error, xhr) {
	        if (_error.status === 400) {
	            var resp = JSON.parse(_error.responseText).form_errors;
	            console.debug(_error);
	            $('.invalid-form-error-message').html(resp.__all__[0]).addClass("filled");
	        }
	    };
	    formSubmission(form, beforeSubmit, success, error, dataType, button_id);
	}
	function AfterParsleyInitialize() {
	    window.ParsleyValidator.addValidator('valid_phone', function (value, requirement) {
	        alert('myvalidator');
	        return false;
	    }, 32).addMessage('en', 'myvalidator', 'my validator failed');
	}
	function ParsleyConfig() {
	    window.ParsleyExtend = {
	        asyncValidators: {
	            validate_email: {
	                fn: function fn(xhr) {
	                    console.log(this.$element); // jQuery Object[ input[name="q"] ]
	                    return 404 === xhr.status;
	                },
	                url: Urls['users:validate_email']()
	            },
	            validate_duplicate_number: {
	                fn: function fn(xhr) {
	                    console.log(this.$element); // jQuery Object[ input[name="q"] ]
	                    return 404 === xhr.status;
	                },
	                url: Urls['users:check_duplicate_number']()
	            },
	            validate_changed_number: {
	                fn: function fn(xhr) {
	                    console.log(this.$element);
	                    return 404 === xhr.status;
	                },
	                url: Urls['users:user_phone_verifcation_process']()
	            }
	
	        }
	    };
	    window.ParsleyConfig = {
	        validators: {
	            valid_phone: {
	                fn: function fn(value) {
	                    console.log(value);
	                    var x = value.match(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/g);
	                    return x !== null;
	                },
	                priority: 32
	            },
	            no_link: {
	                fn: function fn(value) {
	                    var regexp = new RegExp('(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,4}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)', 'i');
	                    var x = value.match(regexp);
	                    return x === null;
	                },
	                priority: 90
	            },
	            no_email: {
	                fn: function fn(value) {
	                    var regexp = new RegExp('([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})', 'i');
	                    var x = value.match(regexp);
	                    return x === null;
	                },
	                priority: 91
	            },
	            validate_time: {
	                fn: function fn(value) {
	                    var end_time = moment(value, "hh:mm: A");
	                    console.log(end_time.isValid());
	                    return end_time.isValid();
	                },
	                priority: 96
	            },
	            same_phone_number: {
	                fn: function fn(value) {
	                    console.log(value);
	                    var x = $('#id_number').val();
	                    console.debug(x.replace(/\s/g, ''));
	
	                    return x.replace(/\s/g, '') === value || x === value;
	                },
	                priority: 33
	            },
	            schedule_time: {
	                fn: function fn(value, requirement) {
	                    var end_time = moment(value, "hh:mm: A");
	                    var start_time = moment($(requirement).val(), "hh:mm: A");
	
	                    return end_time.hours() > start_time.hours();
	
	                    // var startvar v = moment("12:30 AM","hh:mm: A")
	                }
	            },
	            validate_word_count: {
	                fn: function fn(value, req) {
	                    var new_val = value.replace(/\s+/g, ' ');
	                    return new_val.length >= parseInt(req);
	                },
	                priority: 101
	            }
	        },
	        i18n: {
	            en: {
	                valid_phone: 'Phone number is invalid. should be of the form +234 703 520 9576',
	                same_phone_number: 'Phone number is not the same',
	                schedule_time: 'End time must be greater than start time with at least an hour',
	                no_link: 'Links are not allowed.',
	                validate_time: "Pls input a time in this format 6:00 AM",
	                no_email: 'Email addresses are not allowed in this field',
	                validate_word_count: 'Please input at least 300 words. No unnecessary spaces please.'
	            }
	        }
	    };
	}
	
	var parsleyConfig = {
	    successClass: "has-success",
	    errorClass: "has-error",
	    classHandler: function classHandler(el) {
	        return el.$element.closest(".form-group");
	    },
	    errorsContainer: function errorsContainer(el) {
	        return el.$element.closest(".form-group");
	    },
	    errorsWrapper: "<span class='help-block'></span>",
	    errorTemplate: "<span></span>"
	};
	
	function parsleyfyForm(form, ooo) {
	    var options = {
	        errorTemplate: '<li class="input-hint"></li>'
	    };
	    // if (ooo) {
	    form.parsley(parsleyConfig);
	    // } else {
	    // form.parsley(options);
	    // }
	}
	
	function formSubmission(form, beforeSubmitCallback, successCallback, errorCallback, dataType, button_id) {
	    if (dataType) {
	        var dt = dataType;
	    } else {
	        dt = "json";
	    }
	    var err = errorCallback || function (re, xhr, btn) {
	        console.log(re);
	    };
	
	    form.on('submit', function (e) {
	        e.preventDefault();
	        var form = $(this);
	
	        console.log(form);
	        form.parsley().validate();
	        if (form.parsley().isValid()) {
	            beforeSubmitCallback(form);
	            if (button_id) {
	                var $btn = $(button_id).button('loading');
	            }
	            console.log(form.serialize());
	            $.ajax({
	                url: form.attr('action'),
	                type: form.attr('method'),
	                dataType: dt,
	                data: form.serialize(),
	                success: successCallback,
	                error: function error(er, xhr) {
	                    if (button_id) {
	                        $btn.button('reset');
	                    }
	                    err(er, xhr);
	                }
	            });
	        }
	    });
	}
	
	function TypeAheadConfig(name, key, source) {
	    return {
	        name: name,
	        displayKey: key,
	        source: source.ttAdapter()
	    };
	}
	
	function ApplyTypeaheadToInput(input, name, key, bhInstance, callback) {
	
	    var generic_options = {
	        hint: true,
	        highlight: true,
	        minLength: 2
	    };
	    input.typeahead(generic_options, TypeAheadConfig(name, key, bhInstance)).on('typeahead:selected', callback);
	}
	
	function SkillAutoComplete(input, cb) {
	    var callback = cb || function () {};
	    //var BH = getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	    var BH = getBloodhoundInstance('name', Urls['ajax_skills_all']());
	
	    BH.initialize();
	
	    ApplyTypeaheadToInput(input, 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(" in ")[0].trim();
	        $(this).typeahead('val', skill);
	        callback();
	    });
	}
	function GenericSkillSearchAutocomplete(input, form) {
	    //var BH = getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	    var BH = getBloodhoundInstance('name', Urls['ajax_skills_all']());
	
	    BH.initialize();
	    ApplyTypeaheadToInput(input, 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(" in ")[0].trim();
	        $(this).typeahead('val', skill);
	        if (datum.slug) {
	            window.location.href = Urls["skill_only_view"](datum.slug);
	        } else {
	
	            form.submit();
	        }
	    });
	    console.log(form);
	    if (form.length > 0) {
	
	        form.parsley();
	    }
	}
	
	function GoogleAutoComplete(input, callback, domInsertedCallback) {
	    var autocomplete;
	    var initialize = function initialize() {
	        var options = {
	            //types: ['address'],
	            types: [],
	            componentRestrictions: {
	                country: 'ng'
	            }
	        };
	        console.log(options);
	        var autocomplete = new google.maps.places.Autocomplete(input[0], options);
	        console.log(autocomplete);
	        var responseCallback = function responseCallback() {
	            callback(autocomplete);
	        };
	        google.maps.event.addListener(autocomplete, 'place_changed', responseCallback);
	    };
	    google.maps.event.addDomListener(window, 'load', initialize);
	    // document.addEventListener('DOMNodeInserted', domInsertedCallback);
	};
	
	function getCookie(name) {
	    var cookieValue = null;
	    if (document.cookie && document.cookie != '') {
	        var cookies = document.cookie.split(';');
	        for (var i = 0; i < cookies.length; i++) {
	            var cookie = $.trim(cookies[i]);
	            // Does this cookie string begin with the name we want?
	            if (cookie.substring(0, name.length + 1) == name + '=') {
	                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
	                break;
	            }
	        }
	    }
	    if (name == 'csrftoken') {
	        if (cookieValue == null) {
	            return $('input[name="csrfmiddlewaretoken"]').val();
	        }
	    }
	    return cookieValue;
	}
	
	function csrfSafeMethod(method) {
	    // these HTTP methods do not require CSRF protection
	    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method)
	    );
	}
	function appendCSRFTOKEN() {
	    $.ajaxSetup({
	        beforeSend: function beforeSend(xhr, settings) {
	            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
	                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
	            }
	        }
	    });
	}
	function hideAddMore(fset, parentNode, count) {
	    var c = count || 2;
	    if (fset.length >= c) {
	        parentNode.addClass('hide');
	    }
	    fset.find('.delete-row').addClass('hide');
	}
	
	function GetLongitudeAndLatitudeAndSubmit(filterform, location_field, longitude_field, latitude_field, state_field, callback) {
	    var cb = callback || function () {};
	
	    filterform.on("submit", function (e) {
	        e.preventDefault();
	        var that = this;
	        var s = "";
	        if (state_field) {
	            s = state_field.val() ? state_field.val() : "";
	        }
	        var full_address = location_field.val() + " " + s;
	        console.log(full_address);
	        var geocoder = cb();
	
	        if (geocoder) {
	            geocoder.geocode({ 'address': full_address }, function (results, status) {
	                if (status == window.google.maps.GeocoderStatus.OK) {
	                    console.log(results);
	                    if (results.length > 0) {
	                        var address = full_address;
	                        var latitude = results[0].geometry.location.lat();
	                        var longitude = results[0].geometry.location.lng();
	                        location_field.val(address);
	                        latitude_field.val(latitude.toFixed(5));
	                        longitude_field.val(longitude.toFixed(5));
	                    }
	                    $(that).unbind("submit").submit();
	                } else {
	                    var field = location_field.val();
	                    if (field === "") {
	                        longitude_field.val("");
	                        latitude_field.val("");
	                    }
	                    $(that).unbind("submit").submit();
	                }
	            });
	        } else {
	            $(that).unbind("submit").submit();
	        }
	    });
	}
	exports.FormInitialize = FormInitialize;
	exports.parsleyfyForm = parsleyfyForm;
	exports.formSubmission = formSubmission;
	exports.HideFormsetControl = hideAddMore;
	exports.getBloodhoundInstance = getBloodhoundInstance;
	exports.getBloodhoundInstanceT = getBloodhoundInstanceT;
	exports.getBloodhoundInstanceT2 = getBloodhoundInstanceT2;
	exports.filterOptionByText = function (node, text) {
	    return node.find('option').filter(function () {
	        return $(this).html() == text;
	    });
	};
	exports.ApplyTypeaheadToInput = ApplyTypeaheadToInput;
	exports.SkillAutoComplete = SkillAutoComplete;
	exports.GoogleAutoComplete = GoogleAutoComplete;
	exports.GenericSkillSearchAutocomplete = GenericSkillSearchAutocomplete;
	exports.parsleyConfig = parsleyConfig;
	exports.keyupCallback = keyupCallback;
	exports.ParsleyConfig = ParsleyConfig;
	exports.getCookie = getCookie;
	exports.csrfSafeMethod = csrfSafeMethod;
	exports.appendCSRFTOKEN = appendCSRFTOKEN;
	exports.GetLongitudeAndLatitudeAndSubmit = GetLongitudeAndLatitudeAndSubmit;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = Bloodhound;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = Urls;

/***/ },
/* 6 */
/***/ function(module, exports) {

	/* *******************************************
	// Copyright 2010-2015, Anthony Hand
	//
	// BETA NOTICE
	// Previous versions of the JavaScript code for MobileESP were 'regular' 
	// JavaScript. The strength of it was that it was really easy to code and use.
	// Unfortunately, regular JavaScript means that all variables and functions
	// are in the global namespace. There can be collisions with other code libraries
	// which may have similar variable or function names. Collisions cause bugs as each
	// library changes a variable's definition or functionality unexpectedly.
	// As a result, we thought it wise to switch to an "object oriented" style of code.
	// This 'literal notation' technique keeps all MobileESP variables and functions fully self-contained.
	// It avoids potential for collisions with other JavaScript libraries.
	// This technique allows the developer continued access to any desired function or property.
	//
	// Please send feedback to project founder Anthony Hand: anthony.hand@gmail.com
	//
	//
	// File version 2015.05.13 (May 13, 2015)
	// Updates:
	//	- Moved MobileESP to GitHub. https://github.com/ahand/mobileesp
	//	- Opera Mobile/Mini browser has the same UA string on multiple platforms and doesn't differentiate phone vs. tablet. 
	//		- Removed DetectOperaAndroidPhone(). This method is no longer reliable. 
	//		- Removed DetectOperaAndroidTablet(). This method is no longer reliable. 
	//	- Added support for Windows Phone 10: variable and DetectWindowsPhone10()
	//	- Updated DetectWindowsPhone() to include WP10. 
	//	- Added support for Firefox OS.  
	//		- A variable plus DetectFirefoxOS(), DetectFirefoxOSPhone(), DetectFirefoxOSTablet()
	//		- NOTE: Firefox doesn't add UA tokens to definitively identify Firefox OS vs. their browsers on other mobile platforms.
	//	- Added support for Sailfish OS. Not enough info to add a tablet detection method at this time. 
	//		- A variable plus DetectSailfish(), DetectSailfishPhone()
	//	- Added support for Ubuntu Mobile OS. 
	//		- DetectUbuntu(), DetectUbuntuPhone(), DetectUbuntuTablet()
	//	- Added support for 2 smart TV OSes. They lack browsers but do have WebViews for use by HTML apps. 
	//		- One variable for Samsung Tizen TVs, plus DetectTizenTV()
	//		- One variable for LG WebOS TVs, plus DetectWebOSTV()
	//	- Updated DetectTizen(). Now tests for ???mobile??? to disambiguate from Samsung Smart TVs
	//	- Removed variables for obsolete devices: deviceHtcFlyer, deviceXoom.
	//	- Updated DetectAndroid(). No longer has a special test case for the HTC Flyer tablet. 
	//	- Updated DetectAndroidPhone(). 
	//		- Updated internal detection code for Android. 
	//		- No longer has a special test case for the HTC Flyer tablet. 
	//		- Checks against DetectOperaMobile() on Android and reports here if relevant. 
	//	- Updated DetectAndroidTablet(). 
	//		- No longer has a special test case for the HTC Flyer tablet. 
	//		- Checks against DetectOperaMobile() on Android to exclude it from here.
	//	- DetectMeego(): Changed definition for this method. Now detects any Meego OS device, not just phones. 
	//	- DetectMeegoPhone(): NEW. For Meego phones. Ought to detect Opera browsers on Meego, as well.  
	//	- DetectTierIphone(): Added support for phones running Sailfish, Ubuntu and Firefox Mobile. 
	//	- DetectTierTablet(): Added support for tablets running Ubuntu and Firefox Mobile. 
	//	- DetectSmartphone(): Added support for Meego phones. 
	//	- Reorganized DetectMobileQuick(). Moved the following to DetectMobileLong():
	//		- DetectDangerHiptop(), DetectMaemoTablet(), DetectSonyMylo(), DetectArchos()
	//       
	//
	//
	// LICENSE INFORMATION
	// Licensed under the Apache License, Version 2.0 (the "License"); 
	// you may not use this file except in compliance with the License. 
	// You may obtain a copy of the License at 
	//        http://www.apache.org/licenses/LICENSE-2.0 
	// Unless required by applicable law or agreed to in writing, 
	// software distributed under the License is distributed on an 
	// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
	// either express or implied. See the License for the specific 
	// language governing permissions and limitations under the License. 
	//
	//
	// ABOUT THIS PROJECT
	//   Project Owner: Anthony Hand
	//   Email: anthony.hand@gmail.com
	//   Web Site: http://www.mobileesp.com
	//   Source Files: https://github.com/ahand/mobileesp
	//   
	//   Versions of this code are available for:
	//      PHP, JavaScript, Java, ASP.NET (C#), Ruby and others
	//
	//
	// WARNING: 
	//   These JavaScript-based device detection features may ONLY work 
	//   for the newest generation of smartphones, such as the iPhone, 
	//   Android and Palm WebOS devices.
	//   These device detection features may NOT work for older smartphones 
	//   which had poor support for JavaScript, including 
	//   older BlackBerry, PalmOS, and Windows Mobile devices. 
	//   Additionally, because JavaScript support is extremely poor among 
	//   'feature phones', these features may not work at all on such devices.
	//   For better results, consider using a server-based version of this code, 
	//   such as Java, APS.NET, PHP, or Ruby.
	//
	// *******************************************
	*/
	
	'use strict';
	
	var MobileEsp = {
	
		//GLOBALLY USEFUL VARIABLES
		//Note: These values are set automatically during the Init function.
		//Stores whether we're currently initializing the most popular functions.
		initCompleted: false,
		isWebkit: false, //Stores the result of DetectWebkit()
		isMobilePhone: false, //Stores the result of DetectMobileQuick()
		isIphone: false, //Stores the result of DetectIphone()
		isAndroid: false, //Stores the result of DetectAndroid()
		isAndroidPhone: false, //Stores the result of DetectAndroidPhone()
		isTierTablet: false, //Stores the result of DetectTierTablet()
		isTierIphone: false, //Stores the result of DetectTierIphone()
		isTierRichCss: false, //Stores the result of DetectTierRichCss()
		isTierGenericMobile: false, //Stores the result of DetectTierOtherPhones()
	
		//INTERNALLY USED DETECTION STRING VARIABLES
		engineWebKit: 'webkit',
		deviceIphone: 'iphone',
		deviceIpod: 'ipod',
		deviceIpad: 'ipad',
		deviceMacPpc: 'macintosh', //Used for disambiguation
	
		deviceAndroid: 'android',
		deviceGoogleTV: 'googletv',
	
		deviceWinPhone7: 'windows phone os 7',
		deviceWinPhone8: 'windows phone 8',
		deviceWinPhone10: 'windows phone 10',
		deviceWinMob: 'windows ce',
		deviceWindows: 'windows',
		deviceIeMob: 'iemobile',
		devicePpc: 'ppc', //Stands for PocketPC
		enginePie: 'wm5 pie', //An old Windows Mobile
	
		deviceBB: 'blackberry',
		deviceBB10: 'bb10', //For the new BB 10 OS
		vndRIM: 'vnd.rim', //Detectable when BB devices emulate IE or Firefox
		deviceBBStorm: 'blackberry95', //Storm 1 and 2
		deviceBBBold: 'blackberry97', //Bold 97x0 (non-touch)
		deviceBBBoldTouch: 'blackberry 99', //Bold 99x0 (touchscreen)
		deviceBBTour: 'blackberry96', //Tour
		deviceBBCurve: 'blackberry89', //Curve 2
		deviceBBCurveTouch: 'blackberry 938', //Curve Touch 9380
		deviceBBTorch: 'blackberry 98', //Torch
		deviceBBPlaybook: 'playbook', //PlayBook tablet
	
		deviceSymbian: 'symbian',
		deviceSymbos: 'symbos', //Opera 10 on Symbian
		deviceS60: 'series60',
		deviceS70: 'series70',
		deviceS80: 'series80',
		deviceS90: 'series90',
	
		devicePalm: 'palm',
		deviceWebOS: 'webos', //For Palm devices
		deviceWebOStv: 'web0s', //For LG TVs
		deviceWebOShp: 'hpwos', //For HP's line of WebOS devices
	
		deviceNuvifone: 'nuvifone', //Garmin Nuvifone
		deviceBada: 'bada', //Samsung's Bada OS
		deviceTizen: 'tizen', //Tizen OS
		deviceMeego: 'meego', //Meego OS
		deviceSailfish: 'sailfish', //Sailfish OS
		deviceUbuntu: 'ubuntu', //Ubuntu Mobile OS
	
		deviceKindle: 'kindle', //Amazon eInk Kindle
		engineSilk: 'silk-accelerated', //Amazon's accelerated Silk browser for Kindle Fire
	
		engineBlazer: 'blazer', //Old Palm browser
		engineXiino: 'xiino',
	
		//Initialize variables for mobile-specific content.
		vndwap: 'vnd.wap',
		wml: 'wml',
	
		//Initialize variables for random devices and mobile browsers.
		//Some of these may not support JavaScript
		deviceTablet: 'tablet',
		deviceBrew: 'brew',
		deviceDanger: 'danger',
		deviceHiptop: 'hiptop',
		devicePlaystation: 'playstation',
		devicePlaystationVita: 'vita',
		deviceNintendoDs: 'nitro',
		deviceNintendo: 'nintendo',
		deviceWii: 'wii',
		deviceXbox: 'xbox',
		deviceArchos: 'archos',
	
		engineFirefox: 'firefox', //For Firefox OS
		engineOpera: 'opera', //Popular browser
		engineNetfront: 'netfront', //Common embedded OS browser
		engineUpBrowser: 'up.browser', //common on some phones
		deviceMidp: 'midp', //a mobile Java technology
		uplink: 'up.link',
		engineTelecaQ: 'teleca q', //a modern feature phone browser
		engineObigo: 'obigo', //W 10 is a modern feature phone browser
	
		devicePda: 'pda',
		mini: 'mini', //Some mobile browsers put 'mini' in their names
		mobile: 'mobile', //Some mobile browsers put 'mobile' in their user agent strings
		mobi: 'mobi', //Some mobile browsers put 'mobi' in their user agent strings
	
		//Smart TV strings
		smartTV1: 'smart-tv', //Samsung Tizen smart TVs
		smartTV2: 'smarttv', //LG WebOS smart TVs
	
		//Use Maemo, Tablet, and Linux to test for Nokia's Internet Tablets.
		maemo: 'maemo',
		linux: 'linux',
		mylocom2: 'sony/com', // for Sony Mylo 1 and 2
	
		//In some UserAgents, the only clue is the manufacturer
		manuSonyEricsson: 'sonyericsson',
		manuericsson: 'ericsson',
		manuSamsung1: 'sec-sgh',
		manuSony: 'sony',
		manuHtc: 'htc', //Popular Android and WinMo manufacturer
	
		//In some UserAgents, the only clue is the operator
		svcDocomo: 'docomo',
		svcKddi: 'kddi',
		svcVodafone: 'vodafone',
	
		//Disambiguation strings.
		disUpdate: 'update', //pda vs. update
	
		//Holds the User Agent string value.
		uagent: '',
	
		//Initializes key MobileEsp variables
		InitDeviceScan: function InitDeviceScan() {
			this.initCompleted = false;
	
			if (navigator && navigator.userAgent) this.uagent = navigator.userAgent.toLowerCase();
	
			//Save these properties to speed processing
			this.isWebkit = this.DetectWebkit();
			this.isIphone = this.DetectIphone();
			this.isAndroid = this.DetectAndroid();
			this.isAndroidPhone = this.DetectAndroidPhone();
	
			//Generally, these tiers are the most useful for web development
			this.isMobilePhone = this.DetectMobileQuick();
			this.isTierIphone = this.DetectTierIphone();
			this.isTierTablet = this.DetectTierTablet();
	
			//Optional: Comment these out if you NEVER use them
			this.isTierRichCss = this.DetectTierRichCss();
			this.isTierGenericMobile = this.DetectTierOtherPhones();
	
			this.initCompleted = true;
		},
	
		//APPLE IOS
	
		//**************************
		// Detects if the current device is an iPhone.
		DetectIphone: function DetectIphone() {
			if (this.initCompleted || this.isIphone) return this.isIphone;
	
			if (this.uagent.search(this.deviceIphone) > -1) {
				//The iPad and iPod Touch say they're an iPhone! So let's disambiguate.
				if (this.DetectIpad() || this.DetectIpod()) return false;
				//Yay! It's an iPhone!
				else return true;
			} else return false;
		},
	
		//**************************
		// Detects if the current device is an iPod Touch.
		DetectIpod: function DetectIpod() {
			if (this.uagent.search(this.deviceIpod) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is an iPhone or iPod Touch.
		DetectIphoneOrIpod: function DetectIphoneOrIpod() {
			//We repeat the searches here because some iPods
			//  may report themselves as an iPhone, which is ok.
			if (this.DetectIphone() || this.DetectIpod()) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is an iPad tablet.
		DetectIpad: function DetectIpad() {
			if (this.uagent.search(this.deviceIpad) > -1 && this.DetectWebkit()) return true;else return false;
		},
	
		//**************************
		// Detects *any* iOS device: iPhone, iPod Touch, iPad.
		DetectIos: function DetectIos() {
			if (this.DetectIphoneOrIpod() || this.DetectIpad()) return true;else return false;
		},
	
		//ANDROID
	
		//**************************
		// Detects *any* Android OS-based device: phone, tablet, and multi-media player.
		// Also detects Google TV.
		DetectAndroid: function DetectAndroid() {
			if (this.initCompleted || this.isAndroid) return this.isAndroid;
	
			if (this.uagent.search(this.deviceAndroid) > -1 || this.DetectGoogleTV()) return true;
	
			return false;
		},
	
		//**************************
		// Detects if the current device is a (small-ish) Android OS-based device
		// used for calling and/or multi-media (like a Samsung Galaxy Player).
		// Google says these devices will have 'Android' AND 'mobile' in user agent.
		// Ignores tablets (Honeycomb and later).
		DetectAndroidPhone: function DetectAndroidPhone() {
			if (this.initCompleted || this.isAndroidPhone) return this.isAndroidPhone;
	
			//First, let's make sure we're on an Android device.
			if (!this.DetectAndroid()) return false;
	
			//If it's Android and has 'mobile' in it, Google says it's a phone.
			if (this.uagent.search(this.mobile) > -1) return true;
	
			//Special check for Android phones with Opera Mobile. They should report here.
			if (this.DetectOperaMobile()) return true;
	
			return false;
		},
	
		//**************************
		// Detects if the current device is a (self-reported) Android tablet.
		// Google says these devices will have 'Android' and NOT 'mobile' in their user agent.
		DetectAndroidTablet: function DetectAndroidTablet() {
			//First, let's make sure we're on an Android device.
			if (!this.DetectAndroid()) return false;
	
			//Special check for Opera Android Phones. They should NOT report here.
			if (this.DetectOperaMobile()) return false;
	
			//Otherwise, if it's Android and does NOT have 'mobile' in it, Google says it's a tablet.
			if (this.uagent.search(this.mobile) > -1) return false;else return true;
		},
	
		//**************************
		// Detects if the current device is an Android OS-based device and
		//   the browser is based on WebKit.
		DetectAndroidWebKit: function DetectAndroidWebKit() {
			if (this.DetectAndroid() && this.DetectWebkit()) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is a GoogleTV.
		DetectGoogleTV: function DetectGoogleTV() {
			if (this.uagent.search(this.deviceGoogleTV) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is based on WebKit.
		DetectWebkit: function DetectWebkit() {
			if (this.initCompleted || this.isWebkit) return this.isWebkit;
	
			if (this.uagent.search(this.engineWebKit) > -1) return true;else return false;
		},
	
		//WINDOWS MOBILE AND PHONE
	
		// Detects if the current browser is a
		// Windows Phone 7, 8, or 10 device.
		DetectWindowsPhone: function DetectWindowsPhone() {
			if (this.DetectWindowsPhone7() || this.DetectWindowsPhone8() || this.DetectWindowsPhone10()) return true;else return false;
		},
	
		//**************************
		// Detects a Windows Phone 7 device (in mobile browsing mode).
		DetectWindowsPhone7: function DetectWindowsPhone7() {
			if (this.uagent.search(this.deviceWinPhone7) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a Windows Phone 8 device (in mobile browsing mode).
		DetectWindowsPhone8: function DetectWindowsPhone8() {
			if (this.uagent.search(this.deviceWinPhone8) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a Windows Phone 10 device (in mobile browsing mode).
		DetectWindowsPhone10: function DetectWindowsPhone10() {
			if (this.uagent.search(this.deviceWinPhone10) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a Windows Mobile device.
		// Excludes Windows Phone 7 and later devices.
		// Focuses on Windows Mobile 6.xx and earlier.
		DetectWindowsMobile: function DetectWindowsMobile() {
			if (this.DetectWindowsPhone()) return false;
	
			//Most devices use 'Windows CE', but some report 'iemobile'
			//  and some older ones report as 'PIE' for Pocket IE.
			if (this.uagent.search(this.deviceWinMob) > -1 || this.uagent.search(this.deviceIeMob) > -1 || this.uagent.search(this.enginePie) > -1) return true;
			//Test for Windows Mobile PPC but not old Macintosh PowerPC.
			if (this.uagent.search(this.devicePpc) > -1 && !(this.uagent.search(this.deviceMacPpc) > -1)) return true;
			//Test for Windwos Mobile-based HTC devices.
			if (this.uagent.search(this.manuHtc) > -1 && this.uagent.search(this.deviceWindows) > -1) return true;else return false;
		},
	
		//BLACKBERRY
	
		//**************************
		// Detects if the current browser is a BlackBerry of some sort.
		// Includes BB10 OS, but excludes the PlayBook.
		DetectBlackBerry: function DetectBlackBerry() {
			if (this.uagent.search(this.deviceBB) > -1 || this.uagent.search(this.vndRIM) > -1) return true;
			if (this.DetectBlackBerry10Phone()) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a BlackBerry 10 OS phone.
		// Excludes tablets.
		DetectBlackBerry10Phone: function DetectBlackBerry10Phone() {
			if (this.uagent.search(this.deviceBB10) > -1 && this.uagent.search(this.mobile) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is on a BlackBerry tablet device.
		//    Example: PlayBook
		DetectBlackBerryTablet: function DetectBlackBerryTablet() {
			if (this.uagent.search(this.deviceBBPlaybook) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a BlackBerry device AND uses a
		//    WebKit-based browser. These are signatures for the new BlackBerry OS 6.
		//    Examples: Torch. Includes the Playbook.
		DetectBlackBerryWebKit: function DetectBlackBerryWebKit() {
			if (this.DetectBlackBerry() && this.uagent.search(this.engineWebKit) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a BlackBerry Touch
		//    device, such as the Storm, Torch, and Bold Touch. Excludes the Playbook.
		DetectBlackBerryTouch: function DetectBlackBerryTouch() {
			if (this.DetectBlackBerry() && (this.uagent.search(this.deviceBBStorm) > -1 || this.uagent.search(this.deviceBBTorch) > -1 || this.uagent.search(this.deviceBBBoldTouch) > -1 || this.uagent.search(this.deviceBBCurveTouch) > -1)) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a BlackBerry OS 5 device AND
		//    has a more capable recent browser. Excludes the Playbook.
		//    Examples, Storm, Bold, Tour, Curve2
		//    Excludes the new BlackBerry OS 6 and 7 browser!!
		DetectBlackBerryHigh: function DetectBlackBerryHigh() {
			//Disambiguate for BlackBerry OS 6 or 7 (WebKit) browser
			if (this.DetectBlackBerryWebKit()) return false;
			if (this.DetectBlackBerry() && (this.DetectBlackBerryTouch() || this.uagent.search(this.deviceBBBold) > -1 || this.uagent.search(this.deviceBBTour) > -1 || this.uagent.search(this.deviceBBCurve) > -1)) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a BlackBerry device AND
		//    has an older, less capable browser.
		//    Examples: Pearl, 8800, Curve1.
		DetectBlackBerryLow: function DetectBlackBerryLow() {
			if (this.DetectBlackBerry()) {
				//Assume that if it's not in the High tier or has WebKit, then it's Low.
				if (this.DetectBlackBerryHigh() || this.DetectBlackBerryWebKit()) return false;else return true;
			} else return false;
		},
	
		//SYMBIAN
	
		//**************************
		// Detects if the current browser is the Nokia S60 Open Source Browser.
		DetectS60OssBrowser: function DetectS60OssBrowser() {
			if (this.DetectWebkit()) {
				if (this.uagent.search(this.deviceS60) > -1 || this.uagent.search(this.deviceSymbian) > -1) return true;else return false;
			} else return false;
		},
	
		//**************************
		// Detects if the current device is any Symbian OS-based device,
		//   including older S60, Series 70, Series 80, Series 90, and UIQ,
		//   or other browsers running on these devices.
		DetectSymbianOS: function DetectSymbianOS() {
			if (this.uagent.search(this.deviceSymbian) > -1 || this.uagent.search(this.deviceS60) > -1 || this.uagent.search(this.deviceSymbos) > -1 && this.DetectOperaMobile || //Opera 10
			this.uagent.search(this.deviceS70) > -1 || this.uagent.search(this.deviceS80) > -1 || this.uagent.search(this.deviceS90) > -1) return true;else return false;
		},
	
		//WEBOS AND PALM
	
		//**************************
		// Detects if the current browser is on a PalmOS device.
		DetectPalmOS: function DetectPalmOS() {
			//Make sure it's not WebOS first
			if (this.DetectPalmWebOS()) return false;
	
			//Most devices nowadays report as 'Palm',
			//  but some older ones reported as Blazer or Xiino.
			if (this.uagent.search(this.devicePalm) > -1 || this.uagent.search(this.engineBlazer) > -1 || this.uagent.search(this.engineXiino) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is on a Palm device
		//   running the new WebOS.
		DetectPalmWebOS: function DetectPalmWebOS() {
			if (this.uagent.search(this.deviceWebOS) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is on an HP tablet running WebOS.
		DetectWebOSTablet: function DetectWebOSTablet() {
			if (this.uagent.search(this.deviceWebOShp) > -1 && this.uagent.search(this.deviceTablet) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is on a WebOS smart TV.
		DetectWebOSTV: function DetectWebOSTV() {
			if (this.uagent.search(this.deviceWebOStv) > -1 && this.uagent.search(this.smartTV2) > -1) return true;else return false;
		},
	
		//OPERA
	
		//**************************
		// Detects if the current browser is Opera Mobile or Mini.
		// Note: Older embedded Opera on mobile devices didn't follow these naming conventions.
		//   Like Archos media players, they will probably show up in DetectMobileQuick or -Long instead.
		DetectOperaMobile: function DetectOperaMobile() {
			if (this.uagent.search(this.engineOpera) > -1 && (this.uagent.search(this.mini) > -1 || this.uagent.search(this.mobi) > -1)) return true;else return false;
		},
	
		//MISCELLANEOUS DEVICES
	
		//**************************
		// Detects if the current device is an Amazon Kindle (eInk devices only).
		// Note: For the Kindle Fire, use the normal Android methods.
		DetectKindle: function DetectKindle() {
			if (this.uagent.search(this.deviceKindle) > -1 && !this.DetectAndroid()) return true;else return false;
		},
	
		//**************************
		// Detects if the current Amazon device has turned on the Silk accelerated browsing feature.
		// Note: Typically used by the the Kindle Fire.
		DetectAmazonSilk: function DetectAmazonSilk() {
			if (this.uagent.search(this.engineSilk) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a
		//   Garmin Nuvifone.
		DetectGarminNuvifone: function DetectGarminNuvifone() {
			if (this.uagent.search(this.deviceNuvifone) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a device running the Bada OS from Samsung.
		DetectBada: function DetectBada() {
			if (this.uagent.search(this.deviceBada) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a device running the Tizen smartphone OS.
		DetectTizen: function DetectTizen() {
			if (this.uagent.search(this.deviceTizen) > -1 && this.uagent.search(this.mobile) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is on a Tizen smart TV.
		DetectTizenTV: function DetectTizenTV() {
			if (this.uagent.search(this.deviceTizen) > -1 && this.uagent.search(this.smartTV1) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a device running the Meego OS.
		DetectMeego: function DetectMeego() {
			if (this.uagent.search(this.deviceMeego) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a phone running the Meego OS.
		DetectMeegoPhone: function DetectMeegoPhone() {
			if (this.uagent.search(this.deviceMeego) > -1 && this.uagent.search(this.mobi) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a mobile device (probably) running the Firefox OS.
		DetectFirefoxOS: function DetectFirefoxOS() {
			if (this.DetectFirefoxOSPhone() || this.DetectFirefoxOSTablet()) return true;else return false;
		},
	
		//**************************
		// Detects a phone (probably) running the Firefox OS.
		DetectFirefoxOSPhone: function DetectFirefoxOSPhone() {
			//First, let's make sure we're NOT on another major mobile OS.
			if (this.DetectIos() || this.DetectAndroid() || this.DetectSailfish()) return false;
	
			if (this.uagent.search(this.engineFirefox) > -1 && this.uagent.search(this.mobile) > -1) return true;
	
			return false;
		},
	
		//**************************
		// Detects a tablet (probably) running the Firefox OS.
		DetectFirefoxOSTablet: function DetectFirefoxOSTablet() {
			//First, let's make sure we're NOT on another major mobile OS.
			if (this.DetectIos() || this.DetectAndroid() || this.DetectSailfish()) return false;
	
			if (this.uagent.search(this.engineFirefox) > -1 && this.uagent.search(this.deviceTablet) > -1) return true;
	
			return false;
		},
	
		//**************************
		// Detects a device running the Sailfish OS.
		DetectSailfish: function DetectSailfish() {
			if (this.uagent.search(this.deviceSailfish) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a phone running the Sailfish OS.
		DetectSailfishPhone: function DetectSailfishPhone() {
			if (this.DetectSailfish() && this.uagent.search(this.mobile) > -1) return true;
	
			return false;
		},
	
		//**************************
		// Detects a mobile device running the Ubuntu Mobile OS.
		DetectUbuntu: function DetectUbuntu() {
			if (this.DetectUbuntuPhone() || this.DetectUbuntuTablet()) return true;else return false;
		},
	
		//**************************
		// Detects a phone running the Ubuntu Mobile OS.
		DetectUbuntuPhone: function DetectUbuntuPhone() {
			if (this.uagent.search(this.deviceUbuntu) > -1 && this.uagent.search(this.mobile) > -1) return true;
	
			return false;
		},
	
		//**************************
		// Detects a tablet running the Ubuntu Mobile OS.
		DetectUbuntuTablet: function DetectUbuntuTablet() {
			if (this.uagent.search(this.deviceUbuntu) > -1 && this.uagent.search(this.deviceTablet) > -1) return true;
	
			return false;
		},
	
		//**************************
		// Detects the Danger Hiptop device.
		DetectDangerHiptop: function DetectDangerHiptop() {
			if (this.uagent.search(this.deviceDanger) > -1 || this.uagent.search(this.deviceHiptop) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a Sony Mylo device.
		DetectSonyMylo: function DetectSonyMylo() {
			if (this.uagent.search(this.manuSony) > -1 && (this.uagent.search(this.qtembedded) > -1 || this.uagent.search(this.mylocom2) > -1)) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is on one of
		// the Maemo-based Nokia Internet Tablets.
		DetectMaemoTablet: function DetectMaemoTablet() {
			if (this.uagent.search(this.maemo) > -1) return true;
			//For Nokia N810, must be Linux + Tablet, or else it could be something else.
			if (this.uagent.search(this.linux) > -1 && this.uagent.search(this.deviceTablet) > -1 && this.DetectWebOSTablet() && !this.DetectAndroid()) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is an Archos media player/Internet tablet.
		DetectArchos: function DetectArchos() {
			if (this.uagent.search(this.deviceArchos) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is an Internet-capable game console.
		// Includes many handheld consoles.
		DetectGameConsole: function DetectGameConsole() {
			if (this.DetectSonyPlaystation() || this.DetectNintendo() || this.DetectXbox()) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is a Sony Playstation.
		DetectSonyPlaystation: function DetectSonyPlaystation() {
			if (this.uagent.search(this.devicePlaystation) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is a handheld gaming device with
		// a touchscreen and modern iPhone-class browser. Includes the Playstation Vita.
		DetectGamingHandheld: function DetectGamingHandheld() {
			if (this.uagent.search(this.devicePlaystation) > -1 && this.uagent.search(this.devicePlaystationVita) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is a Nintendo game device.
		DetectNintendo: function DetectNintendo() {
			if (this.uagent.search(this.deviceNintendo) > -1 || this.uagent.search(this.deviceWii) > -1 || this.uagent.search(this.deviceNintendoDs) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is a Microsoft Xbox.
		DetectXbox: function DetectXbox() {
			if (this.uagent.search(this.deviceXbox) > -1) return true;else return false;
		},
	
		//**************************
		// Detects whether the device is a Brew-powered device.
		//   Note: Limited to older Brew-powered feature phones.
		//   Ignores newer Brew versions like MP. Refer to DetectMobileQuick().
		DetectBrewDevice: function DetectBrewDevice() {
			if (this.uagent.search(this.deviceBrew) > -1) return true;else return false;
		},
	
		// DEVICE CLASSES
	
		//**************************
		// Check to see whether the device is *any* 'smartphone'.
		//   Note: It's better to use DetectTierIphone() for modern touchscreen devices.
		DetectSmartphone: function DetectSmartphone() {
			//Exclude duplicates from TierIphone
			if (this.DetectTierIphone() || this.DetectS60OssBrowser() || this.DetectSymbianOS() || this.DetectWindowsMobile() || this.DetectBlackBerry() || this.DetectMeegoPhone() || this.DetectPalmOS()) return true;
	
			//Otherwise, return false.
			return false;
		},
	
		//**************************
		// Detects if the current device is a mobile device.
		//  This method catches most of the popular modern devices.
		//  Excludes Apple iPads and other modern tablets.
		DetectMobileQuick: function DetectMobileQuick() {
			if (this.initCompleted || this.isMobilePhone) return this.isMobilePhone;
	
			//Let's exclude tablets.
			if (this.DetectTierTablet()) return false;
	
			//Most mobile browsing is done on smartphones
			if (this.DetectSmartphone()) return true;
	
			//Catch-all for many mobile devices
			if (this.uagent.search(this.mobile) > -1) return true;
	
			if (this.DetectOperaMobile()) return true;
	
			//We also look for Kindle devices
			if (this.DetectKindle() || this.DetectAmazonSilk()) return true;
	
			if (this.uagent.search(this.deviceMidp) > -1 || this.DetectBrewDevice()) return true;
	
			if (this.uagent.search(this.engineObigo) > -1 || this.uagent.search(this.engineNetfront) > -1 || this.uagent.search(this.engineUpBrowser) > -1) return true;
	
			return false;
		},
	
		//**************************
		// Detects in a more comprehensive way if the current device is a mobile device.
		DetectMobileLong: function DetectMobileLong() {
			if (this.DetectMobileQuick()) return true;
			if (this.DetectGameConsole()) return true;
	
			if (this.DetectDangerHiptop() || this.DetectMaemoTablet() || this.DetectSonyMylo() || this.DetectArchos()) return true;
	
			if (this.uagent.search(this.devicePda) > -1 && !(this.uagent.search(this.disUpdate) > -1)) return true;
	
			//Detect for certain very old devices with stupid useragent strings.
			if (this.uagent.search(this.manuSamsung1) > -1 || this.uagent.search(this.manuSonyEricsson) > -1 || this.uagent.search(this.manuericsson) > -1 || this.uagent.search(this.svcDocomo) > -1 || this.uagent.search(this.svcKddi) > -1 || this.uagent.search(this.svcVodafone) > -1) return true;
	
			return false;
		},
	
		//*****************************
		// For Mobile Web Site Design
		//*****************************
	
		//**************************
		// The quick way to detect for a tier of devices.
		//   This method detects for the new generation of
		//   HTML 5 capable, larger screen tablets.
		//   Includes iPad, Android (e.g., Xoom), BB Playbook, WebOS, etc.
		DetectTierTablet: function DetectTierTablet() {
			if (this.initCompleted || this.isTierTablet) return this.isTierTablet;
	
			if (this.DetectIpad() || this.DetectAndroidTablet() || this.DetectBlackBerryTablet() || this.DetectFirefoxOSTablet() || this.DetectUbuntuTablet() || this.DetectWebOSTablet()) return true;else return false;
		},
	
		//**************************
		// The quick way to detect for a tier of devices.
		//   This method detects for devices which can
		//   display iPhone-optimized web content.
		//   Includes iPhone, iPod Touch, Android, Windows Phone 7 and 8, BB10, WebOS, Playstation Vita, etc.
		DetectTierIphone: function DetectTierIphone() {
			if (this.initCompleted || this.isTierIphone) return this.isTierIphone;
	
			if (this.DetectIphoneOrIpod() || this.DetectAndroidPhone() || this.DetectWindowsPhone() || this.DetectBlackBerry10Phone() || this.DetectPalmWebOS() || this.DetectBada() || this.DetectTizen() || this.DetectFirefoxOSPhone() || this.DetectSailfishPhone() || this.DetectUbuntuPhone() || this.DetectGamingHandheld()) return true;
	
			//Note: BB10 phone is in the previous paragraph
			if (this.DetectBlackBerryWebKit() && this.DetectBlackBerryTouch()) return true;else return false;
		},
	
		//**************************
		// The quick way to detect for a tier of devices.
		//   This method detects for devices which are likely to be
		//   capable of viewing CSS content optimized for the iPhone,
		//   but may not necessarily support JavaScript.
		//   Excludes all iPhone Tier devices.
		DetectTierRichCss: function DetectTierRichCss() {
			if (this.initCompleted || this.isTierRichCss) return this.isTierRichCss;
	
			//Exclude iPhone and Tablet Tiers and e-Ink Kindle devices
			if (this.DetectTierIphone() || this.DetectKindle() || this.DetectTierTablet()) return false;
	
			//Exclude if not mobile
			if (!this.DetectMobileQuick()) return false;
	
			//If it's a mobile webkit browser on any other device, it's probably OK.
			if (this.DetectWebkit()) return true;
	
			//The following devices are also explicitly ok.
			if (this.DetectS60OssBrowser() || this.DetectBlackBerryHigh() || this.DetectWindowsMobile() || this.uagent.search(this.engineTelecaQ) > -1) return true;else return false;
		},
	
		//**************************
		// The quick way to detect for a tier of devices.
		//   This method detects for all other types of phones,
		//   but excludes the iPhone and RichCSS Tier devices.
		// NOTE: This method probably won't work due to poor
		//  support for JavaScript among other devices.
		DetectTierOtherPhones: function DetectTierOtherPhones() {
			if (this.initCompleted || this.isTierGenericMobile) return this.isTierGenericMobile;
	
			//Exclude iPhone, Rich CSS and Tablet Tiers
			if (this.DetectTierIphone() || this.DetectTierRichCss() || this.DetectTierTablet()) return false;
	
			//Otherwise, if it's mobile, it's OK
			if (this.DetectMobileLong()) return true;else return false;
		}
	
	};
	
	//Initialize the MobileEsp object
	MobileEsp.InitDeviceScan();
	
	exports.MobileEsp = MobileEsp;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"bootstrap-sidebar\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	
	$(function () {
		$('#mobile_navigation .search').click(function () {
			$('#mobile_skill_input').focus();
		});
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	var Auth = __webpack_require__(1);
	var Utils = __webpack_require__(3);
	Utils.ParsleyConfig();
	__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"parsley.remote\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"parsley\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	__webpack_require__(9);
	var moment = __webpack_require__(10);
	
	function step1() {
	    $('input[name="payment_method"]').on('change', function () {
	        if ($(this).attr('id') === 'payment_method1') {
	            $('.payment_method1').removeClass('hide');
	            $('.payment_method2').addClass('hide');
	            $('.payment_method3').addClass('hide');
	            $('.payment_method4').addClass('hide');
	        }
	        if ($(this).attr('id') === 'payment_method2') {
	            $('.payment_method1').addClass('hide');
	            $('.payment_method2').removeClass('hide');
	            $('.payment_method3').addClass('hide');
	            $('.payment_method4').addClass('hide');
	        }
	        if ($(this).attr('id') === 'payment_method3') {
	            $('.payment_method1').addClass('hide');
	            $('.payment_method2').addClass('hide');
	            $('.payment_method3').removeClass('hide');
	            $('.payment_method4').addClass('hide');
	        }
	        if ($(this).attr('id') === 'payment_method4') {
	            $('.payment_method1').addClass('hide');
	            $('.payment_method2').addClass('hide');
	            $('.payment_method3').addClass('hide');
	            $('.payment_method4').removeClass('hide');
	        }
	    });
	
	    $('.book_signin').on('click', function () {
	        $('#sig_form').addClass('hide');
	        $('.sig_form').addClass('hide');
	        $('#reg_form').removeClass('hide');
	        $('.reg_form').removeClass('hide');
	    });
	    $('.book_register').on('click', function () {
	        $('#sig_form').removeClass('hide');
	        $('.sig_form').removeClass('hide');
	        $('#reg_form').addClass('hide');
	        $('.reg_form').addClass('hide');
	    });
	    Auth.Authenticate(false, function (data) {
	        console.debug(data);
	        window.location.reload();
	    });
	
	    //Auth.SignUp(false,function () {
	    //    window.location.reload();
	    //});
	    //Auth.LoginInitialize();
	    //Auth.ResetInitialize(true);
	}
	function step2() {
	    var classDate = moment(window.ttcountdownTimer, "YYYY-MM-DD hh:mmA");
	    var today = moment();
	    var duration = classDate.diff(today, 'seconds');
	    var timer = 0;
	    if (duration > 0) {
	        timer = duration;
	    }
	    var clock = $('.clock').FlipClock(timer, {
	        clockFace: 'DailyCounter',
	        countdown: true
	    });
	    clock.start();
	    $('input[name="payment_method"]').on('change', function () {
	        if ($(this).attr('id') === 'payment_method1') {
	            $('.payment_method1').removeClass('hide');
	            $('.payment_method2').addClass('hide');
	            $('.payment_method3').addClass('hide');
	            $('.payment_method4').addClass('hide');
	        }
	        if ($(this).attr('id') === 'payment_method2') {
	            $('.payment_method1').addClass('hide');
	            $('.payment_method2').removeClass('hide');
	            $('.payment_method3').addClass('hide');
	            $('.payment_method4').addClass('hide');
	        }
	        if ($(this).attr('id') === 'payment_method3') {
	            $('.payment_method1').addClass('hide');
	            $('.payment_method2').addClass('hide');
	            $('.payment_method3').removeClass('hide');
	            $('.payment_method4').addClass('hide');
	        }
	        if ($(this).attr('id') === 'payment_method4') {
	            $('.payment_method1').addClass('hide');
	            $('.payment_method2').addClass('hide');
	            $('.payment_method3').addClass('hide');
	            $('.payment_method4').removeClass('hide');
	        }
	    });
	}
	function step3() {
	    console.log("hello");
	    Utils.parsleyfyForm($('#message_tutor_form'));
	    var textarea = $('textarea[name="message_to_tutor"]');
	    textarea.val('');
	    $(textarea).keyup(function () {
	        // Utils.keyupCallback(this, 1200, $('#textCounter'));
	    });
	}
	$(function () {
	    $('[data-toggle="popover"]').popover();
	    if (window.StepCount === 1) {
	        step1();
	    }
	    if (window.StepCount === 2) {
	        step2();
	    }
	    if (window.StepCount === 3) {
	        step3();
	    }
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/*
		Base.js, version 1.1a
		Copyright 2006-2010, Dean Edwards
		License: http://www.opensource.org/licenses/mit-license.php
	*/
	
	var Base = function() {
		// dummy
	};
	
	Base.extend = function(_instance, _static) { // subclass
		
		"use strict";
		
		var extend = Base.prototype.extend;
		
		// build the prototype
		Base._prototyping = true;
		
		var proto = new this();
		
		extend.call(proto, _instance);
		
		proto.base = function() {
		// call this method from any other method to invoke that method's ancestor
		};
	
		delete Base._prototyping;
		
		// create the wrapper for the constructor function
		//var constructor = proto.constructor.valueOf(); //-dean
		var constructor = proto.constructor;
		var klass = proto.constructor = function() {
			if (!Base._prototyping) {
				if (this._constructing || this.constructor == klass) { // instantiation
					this._constructing = true;
					constructor.apply(this, arguments);
					delete this._constructing;
				} else if (arguments[0] !== null) { // casting
					return (arguments[0].extend || extend).call(arguments[0], proto);
				}
			}
		};
		
		// build the class interface
		klass.ancestor = this;
		klass.extend = this.extend;
		klass.forEach = this.forEach;
		klass.implement = this.implement;
		klass.prototype = proto;
		klass.toString = this.toString;
		klass.valueOf = function(type) {
			//return (type == "object") ? klass : constructor; //-dean
			return (type == "object") ? klass : constructor.valueOf();
		};
		extend.call(klass, _static);
		// class initialisation
		if (typeof klass.init == "function") klass.init();
		return klass;
	};
	
	Base.prototype = {	
		extend: function(source, value) {
			if (arguments.length > 1) { // extending with a name/value pair
				var ancestor = this[source];
				if (ancestor && (typeof value == "function") && // overriding a method?
					// the valueOf() comparison is to avoid circular references
					(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
					/\bbase\b/.test(value)) {
					// get the underlying method
					var method = value.valueOf();
					// override
					value = function() {
						var previous = this.base || Base.prototype.base;
						this.base = ancestor;
						var returnValue = method.apply(this, arguments);
						this.base = previous;
						return returnValue;
					};
					// point to the underlying method
					value.valueOf = function(type) {
						return (type == "object") ? value : method;
					};
					value.toString = Base.toString;
				}
				this[source] = value;
			} else if (source) { // extending with an object literal
				var extend = Base.prototype.extend;
				// if this object has a customised extend method then use it
				if (!Base._prototyping && typeof this != "function") {
					extend = this.extend || extend;
				}
				var proto = {toSource: null};
				// do the "toString" and other methods manually
				var hidden = ["constructor", "toString", "valueOf"];
				// if we are prototyping then include the constructor
				var i = Base._prototyping ? 0 : 1;
				while (key = hidden[i++]) {
					if (source[key] != proto[key]) {
						extend.call(this, key, source[key]);
	
					}
				}
				// copy each of the source object's properties to this object
				for (var key in source) {
					if (!proto[key]) extend.call(this, key, source[key]);
				}
			}
			return this;
		}
	};
	
	// initialise
	Base = Base.extend({
		constructor: function() {
			this.extend(arguments[0]);
		}
	}, {
		ancestor: Object,
		version: "1.1",
		
		forEach: function(object, block, context) {
			for (var key in object) {
				if (this.prototype[key] === undefined) {
					block.call(context, object[key], key, object);
				}
			}
		},
			
		implement: function() {
			for (var i = 0; i < arguments.length; i++) {
				if (typeof arguments[i] == "function") {
					// if it's a function, call it
					arguments[i](this.prototype);
				} else {
					// add the interface using the extend method
					this.prototype.extend(arguments[i]);
				}
			}
			return this;
		},
		
		toString: function() {
			return String(this.valueOf());
		}
	});
	/*jshint smarttabs:true */
	
	var FlipClock;
		
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
		
		/**
		 * FlipFlock Helper
		 *
		 * @param  object  A jQuery object or CSS select
		 * @param  int     An integer used to start the clock (no. seconds)
		 * @param  object  An object of properties to override the default	
		 */
		 
		FlipClock = function(obj, digit, options) {
			if(digit instanceof Object && digit instanceof Date === false) {
				options = digit;
				digit = 0;
			}
	
			return new FlipClock.Factory(obj, digit, options);
		};
	
		/**
		 * The global FlipClock.Lang object
		 */
	
		FlipClock.Lang = {};
		
		/**
		 * The Base FlipClock class is used to extend all other FlipFlock
		 * classes. It handles the callbacks and the basic setters/getters
		 *	
		 * @param 	object  An object of the default properties
		 * @param 	object  An object of properties to override the default	
		 */
	
		FlipClock.Base = Base.extend({
			
			/**
			 * Build Date
			 */
			 
			buildDate: '2014-12-12',
			
			/**
			 * Version
			 */
			 
			version: '0.7.7',
			
			/**
			 * Sets the default options
			 *
			 * @param	object 	The default options
			 * @param	object 	The override options
			 */
			 
			constructor: function(_default, options) {
				if(typeof _default !== "object") {
					_default = {};
				}
				if(typeof options !== "object") {
					options = {};
				}
				this.setOptions($.extend(true, {}, _default, options));
			},
			
			/**
			 * Delegates the callback to the defined method
			 *
			 * @param	object 	The default options
			 * @param	object 	The override options
			 */
			 
			callback: function(method) {
			 	if(typeof method === "function") {
					var args = [];
									
					for(var x = 1; x <= arguments.length; x++) {
						if(arguments[x]) {
							args.push(arguments[x]);
						}
					}
					
					method.apply(this, args);
				}
			},
			 
			/**
			 * Log a string into the console if it exists
			 *
			 * @param 	string 	The name of the option
			 * @return	mixed
			 */		
			 
			log: function(str) {
				if(window.console && console.log) {
					console.log(str);
				}
			},
			 
			/**
			 * Get an single option value. Returns false if option does not exist
			 *
			 * @param 	string 	The name of the option
			 * @return	mixed
			 */		
			 
			getOption: function(index) {
				if(this[index]) {
					return this[index];
				}
				return false;
			},
			
			/**
			 * Get all options
			 *
			 * @return	bool
			 */		
			 
			getOptions: function() {
				return this;
			},
			
			/**
			 * Set a single option value
			 *
			 * @param 	string 	The name of the option
			 * @param 	mixed 	The value of the option
			 */		
			 
			setOption: function(index, value) {
				this[index] = value;
			},
			
			/**
			 * Set a multiple options by passing a JSON object
			 *
			 * @param 	object 	The object with the options
			 * @param 	mixed 	The value of the option
			 */		
			
			setOptions: function(options) {
				for(var key in options) {
		  			if(typeof options[key] !== "undefined") {
			  			this.setOption(key, options[key]);
			  		}
			  	}
			}
			
		});
		
	}(jQuery));
	
	/*jshint smarttabs:true */
	
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
		
		/**
		 * The FlipClock Face class is the base class in which to extend
		 * all other FlockClock.Face classes.
		 *
		 * @param 	object  The parent FlipClock.Factory object
		 * @param 	object  An object of properties to override the default	
		 */
		 
		FlipClock.Face = FlipClock.Base.extend({
			
			/**
			 * Sets whether or not the clock should start upon instantiation
			 */
			 
			autoStart: true,
	
			/**
			 * An array of jQuery objects used for the dividers (the colons)
			 */
			 
			dividers: [],
	
			/**
			 * An array of FlipClock.List objects
			 */		
			 
			factory: false,
			
			/**
			 * An array of FlipClock.List objects
			 */		
			 
			lists: [],
	
			/**
			 * Constructor
			 *
			 * @param 	object  The parent FlipClock.Factory object
			 * @param 	object  An object of properties to override the default	
			 */
			 
			constructor: function(factory, options) {
				this.dividers = [];
				this.lists = [];
				this.base(options);
				this.factory = factory;
			},
			
			/**
			 * Build the clock face
			 */
			 
			build: function() {
				if(this.autoStart) {
					this.start();
				}
			},
			
			/**
			 * Creates a jQuery object used for the digit divider
			 *
			 * @param	mixed 	The divider label text
			 * @param	mixed	Set true to exclude the dots in the divider. 
			 *					If not set, is false.
			 */
			 
			createDivider: function(label, css, excludeDots) {
				if(typeof css == "boolean" || !css) {
					excludeDots = css;
					css = label;
				}
	
				var dots = [
					'<span class="'+this.factory.classes.dot+' top"></span>',
					'<span class="'+this.factory.classes.dot+' bottom"></span>'
				].join('');
	
				if(excludeDots) {
					dots = '';	
				}
	
				label = this.factory.localize(label);
	
				var html = [
					'<span class="'+this.factory.classes.divider+' '+(css ? css : '').toLowerCase()+'">',
						'<span class="'+this.factory.classes.label+'">'+(label ? label : '')+'</span>',
						dots,
					'</span>'
				];	
				
				var $html = $(html.join(''));
	
				this.dividers.push($html);
	
				return $html;
			},
			
			/**
			 * Creates a FlipClock.List object and appends it to the DOM
			 *
			 * @param	mixed 	The digit to select in the list
			 * @param	object  An object to override the default properties
			 */
			 
			createList: function(digit, options) {
				if(typeof digit === "object") {
					options = digit;
					digit = 0;
				}
	
				var obj = new FlipClock.List(this.factory, digit, options);
			
				this.lists.push(obj);
	
				return obj;
			},
			
			/**
			 * Triggers when the clock is reset
			 */
	
			reset: function() {
				this.factory.time = new FlipClock.Time(
					this.factory, 
					this.factory.original ? Math.round(this.factory.original) : 0,
					{
						minimumDigits: this.factory.minimumDigits
					}
				);
	
				this.flip(this.factory.original, false);
			},
	
			/**
			 * Append a newly created list to the clock
			 */
	
			appendDigitToClock: function(obj) {
				obj.$el.append(false);
			},
	
			/**
			 * Add a digit to the clock face
			 */
			 
			addDigit: function(digit) {
				var obj = this.createList(digit, {
					classes: {
						active: this.factory.classes.active,
						before: this.factory.classes.before,
						flip: this.factory.classes.flip
					}
				});
	
				this.appendDigitToClock(obj);
			},
			
			/**
			 * Triggers when the clock is started
			 */
			 
			start: function() {},
			
			/**
			 * Triggers when the time on the clock stops
			 */
			 
			stop: function() {},
			
			/**
			 * Auto increments/decrements the value of the clock face
			 */
			 
			autoIncrement: function() {
				if(!this.factory.countdown) {
					this.increment();
				}
				else {
					this.decrement();
				}
			},
	
			/**
			 * Increments the value of the clock face
			 */
			 
			increment: function() {
				this.factory.time.addSecond();
			},
	
			/**
			 * Decrements the value of the clock face
			 */
	
			decrement: function() {
				if(this.factory.time.getTimeSeconds() == 0) {
		        	this.factory.stop()
				}
				else {
					this.factory.time.subSecond();
				}
			},
				
			/**
			 * Triggers when the numbers on the clock flip
			 */
			 
			flip: function(time, doNotAddPlayClass) {
				var t = this;
	
				$.each(time, function(i, digit) {
					var list = t.lists[i];
	
					if(list) {
						if(!doNotAddPlayClass && digit != list.digit) {
							list.play();	
						}
	
						list.select(digit);
					}	
					else {
						t.addDigit(digit);
					}
				});
			}
						
		});
		
	}(jQuery));
	
	/*jshint smarttabs:true */
	
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
		
		/**
		 * The FlipClock Factory class is used to build the clock and manage
		 * all the public methods.
		 *
		 * @param 	object  A jQuery object or CSS selector used to fetch
		 				    the wrapping DOM nodes
		 * @param 	mixed   This is the digit used to set the clock. If an 
		 				    object is passed, 0 will be used.	
		 * @param 	object  An object of properties to override the default	
		 */
		 	
		FlipClock.Factory = FlipClock.Base.extend({
			
			/**
			 * The clock's animation rate.
			 * 
			 * Note, currently this property doesn't do anything.
			 * This property is here to be used in the future to
			 * programmaticaly set the clock's animation speed
			 */		
	
			animationRate: 1000,
	
			/**
			 * Auto start the clock on page load (True|False)
			 */	
			 
			autoStart: true,
			
			/**
			 * The callback methods
			 */		
			 
			callbacks: {
				destroy: false,
				create: false,
				init: false,
				interval: false,
				start: false,
				stop: false,
				reset: false
			},
			
			/**
			 * The CSS classes
			 */		
			 
			classes: {
				active: 'flip-clock-active',
				before: 'flip-clock-before',
				divider: 'flip-clock-divider',
				dot: 'flip-clock-dot',
				label: 'flip-clock-label',
				flip: 'flip',
				play: 'play',
				wrapper: 'flip-clock-wrapper'
			},
			
			/**
			 * The name of the clock face class in use
			 */	
			 
			clockFace: 'HourlyCounter',
			 
			/**
			 * The name of the clock face class in use
			 */	
			 
			countdown: false,
			 
			/**
			 * The name of the default clock face class to use if the defined
			 * clockFace variable is not a valid FlipClock.Face object
			 */	
			 
			defaultClockFace: 'HourlyCounter',
			 
			/**
			 * The default language
			 */	
			 
			defaultLanguage: 'english',
			 
			/**
			 * The jQuery object
			 */		
			 
			$el: false,
	
			/**
			 * The FlipClock.Face object
			 */	
			 
			face: true,
			 
			/**
			 * The language object after it has been loaded
			 */	
			 
			lang: false,
			 
			/**
			 * The language being used to display labels (string)
			 */	
			 
			language: 'english',
			 
			/**
			 * The minimum digits the clock must have
			 */		
	
			minimumDigits: 0,
	
			/**
			 * The original starting value of the clock. Used for the reset method.
			 */		
			 
			original: false,
			
			/**
			 * Is the clock running? (True|False)
			 */		
			 
			running: false,
			
			/**
			 * The FlipClock.Time object
			 */		
			 
			time: false,
			
			/**
			 * The FlipClock.Timer object
			 */		
			 
			timer: false,
			
			/**
			 * The jQuery object (depcrecated)
			 */		
			 
			$wrapper: false,
			
			/**
			 * Constructor
			 *
			 * @param   object  The wrapping jQuery object
			 * @param	object  Number of seconds used to start the clock
			 * @param	object 	An object override options
			 */
			 
			constructor: function(obj, digit, options) {
	
				if(!options) {
					options = {};
				}
	
				this.lists = [];
				this.running = false;
				this.base(options);	
	
				this.$el = $(obj).addClass(this.classes.wrapper);
	
				// Depcrated support of the $wrapper property.
				this.$wrapper = this.$el;
	
				this.original = (digit instanceof Date) ? digit : (digit ? Math.round(digit) : 0);
	
				this.time = new FlipClock.Time(this, this.original, {
					minimumDigits: this.minimumDigits,
					animationRate: this.animationRate 
				});
	
				this.timer = new FlipClock.Timer(this, options);
	
				this.loadLanguage(this.language);
				
				this.loadClockFace(this.clockFace, options);
	
				if(this.autoStart) {
					this.start();
				}
	
			},
			
			/**
			 * Load the FlipClock.Face object
			 *
			 * @param	object  The name of the FlickClock.Face class
			 * @param	object 	An object override options
			 */
			 
			loadClockFace: function(name, options) {	
				var face, suffix = 'Face', hasStopped = false;
				
				name = name.ucfirst()+suffix;
	
				if(this.face.stop) {
					this.stop();
					hasStopped = true;
				}
	
				this.$el.html('');
	
				this.time.minimumDigits = this.minimumDigits;
				
				if(FlipClock[name]) {
					face = new FlipClock[name](this, options);
				}
				else {
					face = new FlipClock[this.defaultClockFace+suffix](this, options);
				}
				
				face.build();
	
				this.face = face
	
				if(hasStopped) {
					this.start();
				}
				
				return this.face;
			},
					
			/**
			 * Load the FlipClock.Lang object
			 *
			 * @param	object  The name of the language to load
			 */
			 
			loadLanguage: function(name) {	
				var lang;
				
				if(FlipClock.Lang[name.ucfirst()]) {
					lang = FlipClock.Lang[name.ucfirst()];
				}
				else if(FlipClock.Lang[name]) {
					lang = FlipClock.Lang[name];
				}
				else {
					lang = FlipClock.Lang[this.defaultLanguage];
				}
				
				return this.lang = lang;
			},
						
			/**
			 * Localize strings into various languages
			 *
			 * @param	string  The index of the localized string
			 * @param	object  Optionally pass a lang object
			 */
	
			localize: function(index, obj) {
				var lang = this.lang;
	
				if(!index) {
					return null;
				}
	
				var lindex = index.toLowerCase();
	
				if(typeof obj == "object") {
					lang = obj;
				}
	
				if(lang && lang[lindex]) {
					return lang[lindex];
				}
	
				return index;
			},
			 
	
			/**
			 * Starts the clock
			 */
			 
			start: function(callback) {
				var t = this;
	
				if(!t.running && (!t.countdown || t.countdown && t.time.time > 0)) {
					t.face.start(t.time);
					t.timer.start(function() {
						t.flip();
						
						if(typeof callback === "function") {
							callback();
						}	
					});
				}
				else {
					t.log('Trying to start timer when countdown already at 0');
				}
			},
			
			/**
			 * Stops the clock
			 */
			 
			stop: function(callback) {
				this.face.stop();
				this.timer.stop(callback);
				
				for(var x in this.lists) {
					if (this.lists.hasOwnProperty(x)) {
						this.lists[x].stop();
					}
				}	
			},
			
			/**
			 * Reset the clock
			 */
			 
			reset: function(callback) {
				this.timer.reset(callback);
				this.face.reset();
			},
			
			/**
			 * Sets the clock time
			 */
			 
			setTime: function(time) {
				this.time.time = time;
				this.flip(true);		
			},
			
			/**
			 * Get the clock time
			 *
			 * @return  object  Returns a FlipClock.Time object
			 */
			 
			getTime: function(time) {
				return this.time;		
			},
			
			/**
			 * Changes the increment of time to up or down (add/sub)
			 */
			 
			setCountdown: function(value) {
				var running = this.running;
				
				this.countdown = value ? true : false;
					
				if(running) {
					this.stop();
					this.start();
				}
			},
			
			/**
			 * Flip the digits on the clock
			 *
			 * @param  array  An array of digits	 
			 */
			flip: function(doNotAddPlayClass) {	
				this.face.flip(false, doNotAddPlayClass);
			}
			
		});
			
	}(jQuery));
	
	/*jshint smarttabs:true */
	
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
		
		/**
		 * The FlipClock List class is used to build the list used to create 
		 * the card flip effect. This object fascilates selecting the correct
		 * node by passing a specific digit.
		 *
		 * @param 	object  A FlipClock.Factory object
		 * @param 	mixed   This is the digit used to set the clock. If an 
		 *				    object is passed, 0 will be used.	
		 * @param 	object  An object of properties to override the default	
		 */
		 	
		FlipClock.List = FlipClock.Base.extend({
			
			/**
			 * The digit (0-9)
			 */		
			 
			digit: 0,
			
			/**
			 * The CSS classes
			 */		
			 
			classes: {
				active: 'flip-clock-active',
				before: 'flip-clock-before',
				flip: 'flip'	
			},
					
			/**
			 * The parent FlipClock.Factory object
			 */		
			 
			factory: false,
			
			/**
			 * The jQuery object
			 */		
			 
			$el: false,
	
			/**
			 * The jQuery object (deprecated)
			 */		
			 
			$obj: false,
			
			/**
			 * The items in the list
			 */		
			 
			items: [],
			
			/**
			 * The last digit
			 */		
			 
			lastDigit: 0,
				
			/**
			 * Constructor
			 *
			 * @param  object  A FlipClock.Factory object
			 * @param  int     An integer use to select the correct digit
			 * @param  object  An object to override the default properties	 
			 */
			 
			constructor: function(factory, digit, options) {
				this.factory = factory;
				this.digit = digit;
				this.lastDigit = digit;
				this.$el = this.createList();
				
				// Depcrated support of the $obj property.
				this.$obj = this.$el;
	
				if(digit > 0) {
					this.select(digit);
				}
	
				this.factory.$el.append(this.$el);
			},
			
			/**
			 * Select the digit in the list
			 *
			 * @param  int  A digit 0-9	 
			 */
			 
			select: function(digit) {
				if(typeof digit === "undefined") {
					digit = this.digit;
				}
				else {
					this.digit = digit;
				}
	
				if(this.digit != this.lastDigit) {
					var $delete = this.$el.find('.'+this.classes.before).removeClass(this.classes.before);
	
					this.$el.find('.'+this.classes.active).removeClass(this.classes.active)
														  .addClass(this.classes.before);
	
					this.appendListItem(this.classes.active, this.digit);
	
					$delete.remove();
	
					this.lastDigit = this.digit;
				}	
			},
			
			/**
			 * Adds the play class to the DOM object
			 */
			 		
			play: function() {
				this.$el.addClass(this.factory.classes.play);
			},
			
			/**
			 * Removes the play class to the DOM object 
			 */
			 
			stop: function() {
				var t = this;
	
				setTimeout(function() {
					t.$el.removeClass(t.factory.classes.play);
				}, this.factory.timer.interval);
			},
			
			/**
			 * Creates the list item HTML and returns as a string 
			 */
			 
			createListItem: function(css, value) {
				return [
					'<li class="'+(css ? css : '')+'">',
						'<a href="#">',
							'<div class="up">',
								'<div class="shadow"></div>',
								'<div class="inn">'+(value ? value : '')+'</div>',
							'</div>',
							'<div class="down">',
								'<div class="shadow"></div>',
								'<div class="inn">'+(value ? value : '')+'</div>',
							'</div>',
						'</a>',
					'</li>'
				].join('');
			},
	
			/**
			 * Append the list item to the parent DOM node 
			 */
	
			appendListItem: function(css, value) {
				var html = this.createListItem(css, value);
	
				this.$el.append(html);
			},
	
			/**
			 * Create the list of digits and appends it to the DOM object 
			 */
			 
			createList: function() {
	
				var lastDigit = this.getPrevDigit() ? this.getPrevDigit() : this.digit;
	
				var html = $([
					'<ul class="'+this.classes.flip+' '+(this.factory.running ? this.factory.classes.play : '')+'">',
						this.createListItem(this.classes.before, lastDigit),
						this.createListItem(this.classes.active, this.digit),
					'</ul>'
				].join(''));
						
				return html;
			},
	
			getNextDigit: function() {
				return this.digit == 9 ? 0 : this.digit + 1;
			},
	
			getPrevDigit: function() {
				return this.digit == 0 ? 9 : this.digit - 1;
			}
	
		});
		
		
	}(jQuery));
	
	/*jshint smarttabs:true */
	
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
		
		/**
		 * Capitalize the first letter in a string
		 *
		 * @return string
		 */
		 
		String.prototype.ucfirst = function() {
			return this.substr(0, 1).toUpperCase() + this.substr(1);
		};
		
		/**
		 * jQuery helper method
		 *
		 * @param  int     An integer used to start the clock (no. seconds)
		 * @param  object  An object of properties to override the default	
		 */
		 
		$.fn.FlipClock = function(digit, options) {	
			return new FlipClock($(this), digit, options);
		};
		
		/**
		 * jQuery helper method
		 *
		 * @param  int     An integer used to start the clock (no. seconds)
		 * @param  object  An object of properties to override the default	
		 */
		 
		$.fn.flipClock = function(digit, options) {
			return $.fn.FlipClock(digit, options);
		};
		
	}(jQuery));
	
	/*jshint smarttabs:true */
	
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
				
		/**
		 * The FlipClock Time class is used to manage all the time 
		 * calculations.
		 *
		 * @param 	object  A FlipClock.Factory object
		 * @param 	mixed   This is the digit used to set the clock. If an 
		 *				    object is passed, 0 will be used.	
		 * @param 	object  An object of properties to override the default	
		 */
		 	
		FlipClock.Time = FlipClock.Base.extend({
			
			/**
			 * The time (in seconds) or a date object
			 */		
			 
			time: 0,
			
			/**
			 * The parent FlipClock.Factory object
			 */		
			 
			factory: false,
			
			/**
			 * The minimum number of digits the clock face must have
			 */		
			 
			minimumDigits: 0,
	
			/**
			 * Constructor
			 *
			 * @param  object  A FlipClock.Factory object
			 * @param  int     An integer use to select the correct digit
			 * @param  object  An object to override the default properties	 
			 */
			 
			constructor: function(factory, time, options) {
				if(typeof options != "object") {
					options = {};
				}
	
				if(!options.minimumDigits) {
					options.minimumDigits = factory.minimumDigits;
				}
	
				this.base(options);
				this.factory = factory;
	
				if(time) {
					this.time = time;
				}
			},
	
			/**
			 * Convert a string or integer to an array of digits
			 *
			 * @param   mixed  String or Integer of digits	 
			 * @return  array  An array of digits 
			 */
			 
			convertDigitsToArray: function(str) {
				var data = [];
				
				str = str.toString();
				
				for(var x = 0;x < str.length; x++) {
					if(str[x].match(/^\d*$/g)) {
						data.push(str[x]);	
					}
				}
				
				return data;
			},
			
			/**
			 * Get a specific digit from the time integer
			 *
			 * @param   int    The specific digit to select from the time	 
			 * @return  mixed  Returns FALSE if no digit is found, otherwise
			 *				   the method returns the defined digit	 
			 */
			 
			digit: function(i) {
				var timeStr = this.toString();
				var length  = timeStr.length;
				
				if(timeStr[length - i])	 {
					return timeStr[length - i];
				}
				
				return false;
			},
	
			/**
			 * Formats any array of digits into a valid array of digits
			 *
			 * @param   mixed  An array of digits	 
			 * @return  array  An array of digits 
			 */
			 
			digitize: function(obj) {
				var data = [];
	
				$.each(obj, function(i, value) {
					value = value.toString();
					
					if(value.length == 1) {
						value = '0'+value;
					}
					
					for(var x = 0; x < value.length; x++) {
						data.push(value.charAt(x));
					}				
				});
	
				if(data.length > this.minimumDigits) {
					this.minimumDigits = data.length;
				}
				
				if(this.minimumDigits > data.length) {
					for(var x = data.length; x < this.minimumDigits; x++) {
						data.unshift('0');
					}
				}
	
				return data;
			},
			
			/**
			 * Gets a new Date object for the current time
			 *
			 * @return  array  Returns a Date object
			 */
	
			getDateObject: function() {
				if(this.time instanceof Date) {
					return this.time;
				}
	
				return new Date((new Date()).getTime() + this.getTimeSeconds() * 1000);
			},
			
			/**
			 * Gets a digitized daily counter
			 *
			 * @return  object  Returns a digitized object
			 */
	
			getDayCounter: function(includeSeconds) {
				var digits = [
					this.getDays(),
					this.getHours(true),
					this.getMinutes(true)
				];
	
				if(includeSeconds) {
					digits.push(this.getSeconds(true));
				}
	
				return this.digitize(digits);
			},
	
			/**
			 * Gets number of days
			 *
			 * @param   bool  Should perform a modulus? If not sent, then no.
			 * @return  int   Retuns a floored integer
			 */
			 
			getDays: function(mod) {
				var days = this.getTimeSeconds() / 60 / 60 / 24;
				
				if(mod) {
					days = days % 7;
				}
				
				return Math.floor(days);
			},
			
			/**
			 * Gets an hourly breakdown
			 *
			 * @return  object  Returns a digitized object
			 */
			 
			getHourCounter: function() {
				var obj = this.digitize([
					this.getHours(),
					this.getMinutes(true),
					this.getSeconds(true)
				]);
				
				return obj;
			},
			
			/**
			 * Gets an hourly breakdown
			 *
			 * @return  object  Returns a digitized object
			 */
			 
			getHourly: function() {
				return this.getHourCounter();
			},
			
			/**
			 * Gets number of hours
			 *
			 * @param   bool  Should perform a modulus? If not sent, then no.
			 * @return  int   Retuns a floored integer
			 */
			 
			getHours: function(mod) {
				var hours = this.getTimeSeconds() / 60 / 60;
				
				if(mod) {
					hours = hours % 24;	
				}
				
				return Math.floor(hours);
			},
			
			/**
			 * Gets the twenty-four hour time
			 *
			 * @return  object  returns a digitized object
			 */
			 
			getMilitaryTime: function(date, showSeconds) {
				if(typeof showSeconds === "undefined") {
					showSeconds = true;
				}
	
				if(!date) {
					date = this.getDateObject();
				}
	
				var data  = [
					date.getHours(),
					date.getMinutes()			
				];
	
				if(showSeconds === true) {
					data.push(date.getSeconds());
				}
	
				return this.digitize(data);
			},
					
			/**
			 * Gets number of minutes
			 *
			 * @param   bool  Should perform a modulus? If not sent, then no.
			 * @return  int   Retuns a floored integer
			 */
			 
			getMinutes: function(mod) {
				var minutes = this.getTimeSeconds() / 60;
				
				if(mod) {
					minutes = minutes % 60;
				}
				
				return Math.floor(minutes);
			},
			
			/**
			 * Gets a minute breakdown
			 */
			 
			getMinuteCounter: function() {
				var obj = this.digitize([
					this.getMinutes(),
					this.getSeconds(true)
				]);
	
				return obj;
			},
			
			/**
			 * Gets time count in seconds regardless of if targetting date or not.
			 *
			 * @return  int   Returns a floored integer
			 */
			 
			getTimeSeconds: function(date) {
				if(!date) {
					date = new Date();
				}
	
				if (this.time instanceof Date) {
					if (this.factory.countdown) {
						return Math.max(this.time.getTime()/1000 - date.getTime()/1000,0);
					} else {
						return date.getTime()/1000 - this.time.getTime()/1000 ;
					}
				} else {
					return this.time;
				}
			},
			
			/**
			 * Gets the current twelve hour time
			 *
			 * @return  object  Returns a digitized object
			 */
			 
			getTime: function(date, showSeconds) {
				if(typeof showSeconds === "undefined") {
					showSeconds = true;
				}
	
				if(!date) {
					date = this.getDateObject();
				}
	
				console.log(date);
	
				
				var hours = date.getHours();
				var merid = hours > 12 ? 'PM' : 'AM';
				var data   = [
					hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours),
					date.getMinutes()			
				];
	
				if(showSeconds === true) {
					data.push(date.getSeconds());
				}
	
				return this.digitize(data);
			},
			
			/**
			 * Gets number of seconds
			 *
			 * @param   bool  Should perform a modulus? If not sent, then no.
			 * @return  int   Retuns a ceiled integer
			 */
			 
			getSeconds: function(mod) {
				var seconds = this.getTimeSeconds();
				
				if(mod) {
					if(seconds == 60) {
						seconds = 0;
					}
					else {
						seconds = seconds % 60;
					}
				}
				
				return Math.ceil(seconds);
			},
	
			/**
			 * Gets number of weeks
			 *
			 * @param   bool  Should perform a modulus? If not sent, then no.
			 * @return  int   Retuns a floored integer
			 */
			 
			getWeeks: function(mod) {
				var weeks = this.getTimeSeconds() / 60 / 60 / 24 / 7;
				
				if(mod) {
					weeks = weeks % 52;
				}
				
				return Math.floor(weeks);
			},
			
			/**
			 * Removes a specific number of leading zeros from the array.
			 * This method prevents you from removing too many digits, even
			 * if you try.
			 *
			 * @param   int    Total number of digits to remove 
			 * @return  array  An array of digits 
			 */
			 
			removeLeadingZeros: function(totalDigits, digits) {
				var total    = 0;
				var newArray = [];
				
				$.each(digits, function(i, digit) {
					if(i < totalDigits) {
						total += parseInt(digits[i], 10);
					}
					else {
						newArray.push(digits[i]);
					}
				});
				
				if(total === 0) {
					return newArray;
				}
				
				return digits;
			},
	
			/**
			 * Adds X second to the current time
			 */
	
			addSeconds: function(x) {
				if(this.time instanceof Date) {
					this.time.setSeconds(this.time.getSeconds() + x);
				}
				else {
					this.time += x;
				}
			},
	
			/**
			 * Adds 1 second to the current time
			 */
	
			addSecond: function() {
				this.addSeconds(1);
			},
	
			/**
			 * Substracts X seconds from the current time
			 */
	
			subSeconds: function(x) {
				if(this.time instanceof Date) {
					this.time.setSeconds(this.time.getSeconds() - x);
				}
				else {
					this.time -= x;
				}
			},
	
			/**
			 * Substracts 1 second from the current time
			 */
	
			subSecond: function() {
				this.subSeconds(1);
			},
			
			/**
			 * Converts the object to a human readable string
			 */
			 
			toString: function() {
				return this.getTimeSeconds().toString();
			}
			
			/*
			getYears: function() {
				return Math.floor(this.time / 60 / 60 / 24 / 7 / 52);
			},
			
			getDecades: function() {
				return Math.floor(this.getWeeks() / 10);
			}*/
		});
		
	}(jQuery));
	
	/*jshint smarttabs:true */
	
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
		
		/**
		 * The FlipClock.Timer object managers the JS timers
		 *
		 * @param	object  The parent FlipClock.Factory object
		 * @param	object  Override the default options
		 */
		
		FlipClock.Timer = FlipClock.Base.extend({
			
			/**
			 * Callbacks
			 */		
			 
			callbacks: {
				destroy: false,
				create: false,
				init: false,
				interval: false,
				start: false,
				stop: false,
				reset: false
			},
			
			/**
			 * FlipClock timer count (how many intervals have passed)
			 */		
			 
			count: 0,
			
			/**
			 * The parent FlipClock.Factory object
			 */		
			 
			factory: false,
			
			/**
			 * Timer interval (1 second by default)
			 */		
			 
			interval: 1000,
	
			/**
			 * The rate of the animation in milliseconds (not currently in use)
			 */		
			 
			animationRate: 1000,
					
			/**
			 * Constructor
			 *
			 * @return	void
			 */		
			 
			constructor: function(factory, options) {
				this.base(options);
				this.factory = factory;
				this.callback(this.callbacks.init);	
				this.callback(this.callbacks.create);
			},
			
			/**
			 * This method gets the elapsed the time as an interger
			 *
			 * @return	void
			 */		
			 
			getElapsed: function() {
				return this.count * this.interval;
			},
			
			/**
			 * This method gets the elapsed the time as a Date object
			 *
			 * @return	void
			 */		
			 
			getElapsedTime: function() {
				return new Date(this.time + this.getElapsed());
			},
			
			/**
			 * This method is resets the timer
			 *
			 * @param 	callback  This method resets the timer back to 0
			 * @return	void
			 */		
			 
			reset: function(callback) {
				clearInterval(this.timer);
				this.count = 0;
				this._setInterval(callback);			
				this.callback(this.callbacks.reset);
			},
			
			/**
			 * This method is starts the timer
			 *
			 * @param 	callback  A function that is called once the timer is destroyed
			 * @return	void
			 */		
			 
			start: function(callback) {		
				this.factory.running = true;
				this._createTimer(callback);
				this.callback(this.callbacks.start);
			},
			
			/**
			 * This method is stops the timer
			 *
			 * @param 	callback  A function that is called once the timer is destroyed
			 * @return	void
			 */		
			 
			stop: function(callback) {
				this.factory.running = false;
				this._clearInterval(callback);
				this.callback(this.callbacks.stop);
				this.callback(callback);
			},
			
			/**
			 * Clear the timer interval
			 *
			 * @return	void
			 */		
			 
			_clearInterval: function() {
				clearInterval(this.timer);
			},
			
			/**
			 * Create the timer object
			 *
			 * @param 	callback  A function that is called once the timer is created
			 * @return	void
			 */		
			 
			_createTimer: function(callback) {
				this._setInterval(callback);		
			},
			
			/**
			 * Destroy the timer object
			 *
			 * @param 	callback  A function that is called once the timer is destroyed
			 * @return	void
			 */		
			 	
			_destroyTimer: function(callback) {
				this._clearInterval();			
				this.timer = false;
				this.callback(callback);
				this.callback(this.callbacks.destroy);
			},
			
			/**
			 * This method is called each time the timer interval is ran
			 *
			 * @param 	callback  A function that is called once the timer is destroyed
			 * @return	void
			 */		
			 
			_interval: function(callback) {
				this.callback(this.callbacks.interval);
				this.callback(callback);
				this.count++;
			},
			
			/**
			 * This sets the timer interval
			 *
			 * @param 	callback  A function that is called once the timer is destroyed
			 * @return	void
			 */		
			 
			_setInterval: function(callback) {
				var t = this;
		
				t._interval(callback);
	
				t.timer = setInterval(function() {		
					t._interval(callback);
				}, this.interval);
			}
				
		});
		
	}(jQuery));
	
	(function($) {
		
		/**
		 * Twenty-Four Hour Clock Face
		 *
		 * This class will generate a twenty-four our clock for FlipClock.js
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		FlipClock.TwentyFourHourClockFace = FlipClock.Face.extend({
	
			/**
			 * Constructor
			 *
			 * @param  object  The parent FlipClock.Factory object
			 * @param  object  An object of properties to override the default	
			 */
			 
			constructor: function(factory, options) {
				this.base(factory, options);
			},
	
			/**
			 * Build the clock face
			 *
			 * @param  object  Pass the time that should be used to display on the clock.	
			 */
			 
			build: function(time) {
				var t        = this;
				var children = this.factory.$el.find('ul');
	
				if(!this.factory.time.time) {
					this.factory.original = new Date();
	
					this.factory.time = new FlipClock.Time(this.factory, this.factory.original);
				}
	
				var time = time ? time : this.factory.time.getMilitaryTime(false, this.showSeconds);
	
				if(time.length > children.length) {
					$.each(time, function(i, digit) {
						t.createList(digit);
					});
				}
				
				this.createDivider();
				this.createDivider();
	
				$(this.dividers[0]).insertBefore(this.lists[this.lists.length - 2].$el);
				$(this.dividers[1]).insertBefore(this.lists[this.lists.length - 4].$el);
				
				this.base();
			},
			
			/**
			 * Flip the clock face
			 */
			 
			flip: function(time, doNotAddPlayClass) {
				this.autoIncrement();
				
				time = time ? time : this.factory.time.getMilitaryTime(false, this.showSeconds);
				
				this.base(time, doNotAddPlayClass);	
			}
					
		});
		
	}(jQuery));
	(function($) {
			
		/**
		 * Counter Clock Face
		 *
		 * This class will generate a generice flip counter. The timer has been
		 * disabled. clock.increment() and clock.decrement() have been added.
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		FlipClock.CounterFace = FlipClock.Face.extend({
			
			/**
			 * Tells the counter clock face if it should auto-increment
			 */
	
			shouldAutoIncrement: false,
	
			/**
			 * Constructor
			 *
			 * @param  object  The parent FlipClock.Factory object
			 * @param  object  An object of properties to override the default	
			 */
			 
			constructor: function(factory, options) {
	
				if(typeof options != "object") {
					options = {};
				}
	
				factory.autoStart = options.autoStart ? true : false;
	
				if(options.autoStart) {
					this.shouldAutoIncrement = true;
				}
	
				factory.increment = function() {
					factory.countdown = false;
					factory.setTime(factory.getTime().getTimeSeconds() + 1);
				};
	
				factory.decrement = function() {
					factory.countdown = true;
					var time = factory.getTime().getTimeSeconds();
					if(time > 0) {
						factory.setTime(time - 1);
					}
				};
	
				factory.setValue = function(digits) {
					factory.setTime(digits);
				};
	
				factory.setCounter = function(digits) {
					factory.setTime(digits);
				};
	
				this.base(factory, options);
			},
	
			/**
			 * Build the clock face	
			 */
			 
			build: function() {
				var t        = this;
				var children = this.factory.$el.find('ul');
				var time 	 = this.factory.getTime().digitize([this.factory.getTime().time]);
	
				if(time.length > children.length) {
					$.each(time, function(i, digit) {
						var list = t.createList(digit);
	
						list.select(digit);
					});
				
				}
	
				$.each(this.lists, function(i, list) {
					list.play();
				});
	
				this.base();
			},
			
			/**
			 * Flip the clock face
			 */
			 
			flip: function(time, doNotAddPlayClass) {			
				if(this.shouldAutoIncrement) {
					this.autoIncrement();
				}
	
				if(!time) {		
					time = this.factory.getTime().digitize([this.factory.getTime().time]);
				}
	
				this.base(time, doNotAddPlayClass);
			},
	
			/**
			 * Reset the clock face
			 */
	
			reset: function() {
				this.factory.time = new FlipClock.Time(
					this.factory, 
					this.factory.original ? Math.round(this.factory.original) : 0
				);
	
				this.flip();
			}
		});
		
	}(jQuery));
	(function($) {
	
		/**
		 * Daily Counter Clock Face
		 *
		 * This class will generate a daily counter for FlipClock.js. A
		 * daily counter will track days, hours, minutes, and seconds. If
		 * the number of available digits is exceeded in the count, a new
		 * digit will be created.
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default
		 */
	
		FlipClock.DailyCounterFace = FlipClock.Face.extend({
	
			showSeconds: true,
	
			/**
			 * Constructor
			 *
			 * @param  object  The parent FlipClock.Factory object
			 * @param  object  An object of properties to override the default
			 */
	
			constructor: function(factory, options) {
				this.base(factory, options);
			},
	
			/**
			 * Build the clock face
			 */
	
			build: function(time) {
				var t = this;
				var children = this.factory.$el.find('ul');
				var offset = 0;
	
				time = time ? time : this.factory.time.getDayCounter(this.showSeconds);
	
				if(time.length > children.length) {
					$.each(time, function(i, digit) {
						t.createList(digit);
					});
				}
	
				if(this.showSeconds) {
					$(this.createDivider('Seconds')).insertBefore(this.lists[this.lists.length - 2].$el);
				}
				else
				{
					offset = 2;
				}
	
				$(this.createDivider('Minutes')).insertBefore(this.lists[this.lists.length - 4 + offset].$el);
				$(this.createDivider('Hours')).insertBefore(this.lists[this.lists.length - 6 + offset].$el);
				$(this.createDivider('Days', true)).insertBefore(this.lists[0].$el);
	
				this.base();
			},
	
			/**
			 * Flip the clock face
			 */
	
			flip: function(time, doNotAddPlayClass) {
				if(!time) {
					time = this.factory.time.getDayCounter(this.showSeconds);
				}
	
				this.autoIncrement();
	
				this.base(time, doNotAddPlayClass);
			}
	
		});
	
	}(jQuery));
	(function($) {
				
		/**
		 * Hourly Counter Clock Face
		 *
		 * This class will generate an hourly counter for FlipClock.js. An
		 * hour counter will track hours, minutes, and seconds. If number of
		 * available digits is exceeded in the count, a new digit will be 
		 * created.
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		FlipClock.HourlyCounterFace = FlipClock.Face.extend({
				
			// clearExcessDigits: true,
	
			/**
			 * Constructor
			 *
			 * @param  object  The parent FlipClock.Factory object
			 * @param  object  An object of properties to override the default	
			 */
			 
			constructor: function(factory, options) {
				this.base(factory, options);
			},
			
			/**
			 * Build the clock face
			 */
			
			build: function(excludeHours, time) {
				var t = this;
				var children = this.factory.$el.find('ul');
				
				time = time ? time : this.factory.time.getHourCounter();
				
				if(time.length > children.length) {
					$.each(time, function(i, digit) {
						t.createList(digit);
					});
				}
				
				$(this.createDivider('Seconds')).insertBefore(this.lists[this.lists.length - 2].$el);
				$(this.createDivider('Minutes')).insertBefore(this.lists[this.lists.length - 4].$el);
				
				if(!excludeHours) {
					$(this.createDivider('Hours', true)).insertBefore(this.lists[0].$el);
				}
				
				this.base();
			},
			
			/**
			 * Flip the clock face
			 */
			 
			flip: function(time, doNotAddPlayClass) {
				if(!time) {
					time = this.factory.time.getHourCounter();
				}	
	
				this.autoIncrement();
			
				this.base(time, doNotAddPlayClass);
			},
	
			/**
			 * Append a newly created list to the clock
			 */
	
			appendDigitToClock: function(obj) {
				this.base(obj);
	
				this.dividers[0].insertAfter(this.dividers[0].next());
			}
			
		});
		
	}(jQuery));
	(function($) {
			
		/**
		 * Minute Counter Clock Face
		 *
		 * This class will generate a minute counter for FlipClock.js. A
		 * minute counter will track minutes and seconds. If an hour is 
		 * reached, the counter will reset back to 0. (4 digits max)
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		FlipClock.MinuteCounterFace = FlipClock.HourlyCounterFace.extend({
	
			clearExcessDigits: false,
	
			/**
			 * Constructor
			 *
			 * @param  object  The parent FlipClock.Factory object
			 * @param  object  An object of properties to override the default	
			 */
			 
			constructor: function(factory, options) {
				this.base(factory, options);
			},
			
			/**
			 * Build the clock face	
			 */
			 
			build: function() {
				this.base(true, this.factory.time.getMinuteCounter());
			},
			
			/**
			 * Flip the clock face
			 */
			 
			flip: function(time, doNotAddPlayClass) {
				if(!time) {
					time = this.factory.time.getMinuteCounter();
				}
	
				this.base(time, doNotAddPlayClass);
			}
	
		});
		
	}(jQuery));
	(function($) {
			
		/**
		 * Twelve Hour Clock Face
		 *
		 * This class will generate a twelve hour clock for FlipClock.js
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		FlipClock.TwelveHourClockFace = FlipClock.TwentyFourHourClockFace.extend({
			
			/**
			 * The meridium jQuery DOM object
			 */
			 
			meridium: false,
			
			/**
			 * The meridium text as string for easy access
			 */
			 
			meridiumText: 'AM',
						
			/**
			 * Build the clock face
			 *
			 * @param  object  Pass the time that should be used to display on the clock.	
			 */
			 
			build: function() {
				var t = this;
	
				var time = this.factory.time.getTime(false, this.showSeconds);
	
				this.base(time);			
				this.meridiumText = this.getMeridium();			
				this.meridium = $([
					'<ul class="flip-clock-meridium">',
						'<li>',
							'<a href="#">'+this.meridiumText+'</a>',
						'</li>',
					'</ul>'
				].join(''));
							
				this.meridium.insertAfter(this.lists[this.lists.length-1].$el);
			},
			
			/**
			 * Flip the clock face
			 */
			 
			flip: function(time, doNotAddPlayClass) {			
				if(this.meridiumText != this.getMeridium()) {
					this.meridiumText = this.getMeridium();
					this.meridium.find('a').html(this.meridiumText);	
				}
				this.base(this.factory.time.getTime(false, this.showSeconds), doNotAddPlayClass);	
			},
			
			/**
			 * Get the current meridium
			 *
			 * @return  string  Returns the meridium (AM|PM)
			 */
			 
			getMeridium: function() {
				return new Date().getHours() >= 12 ? 'PM' : 'AM';
			},
			
			/**
			 * Is it currently in the post-medirium?
			 *
			 * @return  bool  Returns true or false
			 */
			 
			isPM: function() {
				return this.getMeridium() == 'PM' ? true : false;
			},
	
			/**
			 * Is it currently before the post-medirium?
			 *
			 * @return  bool  Returns true or false
			 */
			 
			isAM: function() {
				return this.getMeridium() == 'AM' ? true : false;
			}
					
		});
		
	}(jQuery));
	(function($) {
	
	    /**
	     * FlipClock Arabic Language Pack
	     *
	     * This class will be used to translate tokens into the Arabic language.
	     *
	     */
	
	    FlipClock.Lang.Arabic = {
	
	      'years'   : '??????????',
	      'months'  : '????????',
	      'days'    : '????????',
	      'hours'   : '??????????',
	      'minutes' : '??????????',
	      'seconds' : '??????????'
	
	    };
	
	    /* Create various aliases for convenience */
	
	    FlipClock.Lang['ar']      = FlipClock.Lang.Arabic;
	    FlipClock.Lang['ar-ar']   = FlipClock.Lang.Arabic;
	    FlipClock.Lang['arabic']  = FlipClock.Lang.Arabic;
	
	}(jQuery));
	(function($) {
			
		/**
		 * FlipClock Danish Language Pack
		 *
		 * This class will used to translate tokens into the Danish language.
		 *	
		 */
		 
		FlipClock.Lang.Danish = {
			
			'years'   : '??r',
			'months'  : 'M??neder',
			'days'    : 'Dage',
			'hours'   : 'Timer',
			'minutes' : 'Minutter',
			'seconds' : 'Sekunder'	
	
		};
		
		/* Create various aliases for convenience */
	
		FlipClock.Lang['da']     = FlipClock.Lang.Danish;
		FlipClock.Lang['da-dk']  = FlipClock.Lang.Danish;
		FlipClock.Lang['danish'] = FlipClock.Lang.Danish;
	
	}(jQuery));
	(function($) {
			
		/**
		 * FlipClock German Language Pack
		 *
		 * This class will used to translate tokens into the German language.
		 *	
		 */
		 
		FlipClock.Lang.German = {
			
			'years'   : 'Jahre',
			'months'  : 'Monate',
			'days'    : 'Tage',
			'hours'   : 'Stunden',
			'minutes' : 'Minuten',
			'seconds' : 'Sekunden'	
	 
		};
		
		/* Create various aliases for convenience */
	 
		FlipClock.Lang['de']     = FlipClock.Lang.German;
		FlipClock.Lang['de-de']  = FlipClock.Lang.German;
		FlipClock.Lang['german'] = FlipClock.Lang.German;
	 
	}(jQuery));
	(function($) {
			
		/**
		 * FlipClock English Language Pack
		 *
		 * This class will used to translate tokens into the English language.
		 *	
		 */
		 
		FlipClock.Lang.English = {
			
			'years'   : 'Years',
			'months'  : 'Months',
			'days'    : 'Days',
			'hours'   : 'Hours',
			'minutes' : 'Minutes',
			'seconds' : 'Seconds'	
	
		};
		
		/* Create various aliases for convenience */
	
		FlipClock.Lang['en']      = FlipClock.Lang.English;
		FlipClock.Lang['en-us']   = FlipClock.Lang.English;
		FlipClock.Lang['english'] = FlipClock.Lang.English;
	
	}(jQuery));
	(function($) {
			
		/**
		 * FlipClock Spanish Language Pack
		 *
		 * This class will used to translate tokens into the Spanish language.
		 *	
		 */
		 
		FlipClock.Lang.Spanish = {
			
			'years'   : 'A&#241;os',
			'months'  : 'Meses',
			'days'    : 'D&#205;as',
			'hours'   : 'Horas',
			'minutes' : 'Minutos',
			'seconds' : 'Segundo'	
	
		};
		
		/* Create various aliases for convenience */
	
		FlipClock.Lang['es']      = FlipClock.Lang.Spanish;
		FlipClock.Lang['es-es']   = FlipClock.Lang.Spanish;
		FlipClock.Lang['spanish'] = FlipClock.Lang.Spanish;
	
	}(jQuery));
	(function($) {
			
		/**
		 * FlipClock Finnish Language Pack
		 *
		 * This class will used to translate tokens into the Finnish language.
		 *	
		 */
		 
		FlipClock.Lang.Finnish = {
			
			'years'   : 'Vuotta',
			'months'  : 'Kuukautta',
			'days'    : 'P??iv????',
			'hours'   : 'Tuntia',
			'minutes' : 'Minuuttia',
			'seconds' : 'Sekuntia'	
	
		};
		
		/* Create various aliases for convenience */
	
		FlipClock.Lang['fi']      = FlipClock.Lang.Finnish;
		FlipClock.Lang['fi-fi']   = FlipClock.Lang.Finnish;
		FlipClock.Lang['finnish'] = FlipClock.Lang.Finnish;
	
	}(jQuery));
	
	(function($) {
	
	  /**
	   * FlipClock Canadian French Language Pack
	   *
	   * This class will used to translate tokens into the Canadian French language.
	   *
	   */
	
	  FlipClock.Lang.French = {
	
	    'years'   : 'Ans',
	    'months'  : 'Mois',
	    'days'    : 'Jours',
	    'hours'   : 'Heures',
	    'minutes' : 'Minutes',
	    'seconds' : 'Secondes'
	
	  };
	
	  /* Create various aliases for convenience */
	
	  FlipClock.Lang['fr']      = FlipClock.Lang.French;
	  FlipClock.Lang['fr-ca']   = FlipClock.Lang.French;
	  FlipClock.Lang['french']  = FlipClock.Lang.French;
	
	}(jQuery));
	
	(function($) {
			
		/**
		 * FlipClock Italian Language Pack
		 *
		 * This class will used to translate tokens into the Italian language.
		 *	
		 */
		 
		FlipClock.Lang.Italian = {
			
			'years'   : 'Anni',
			'months'  : 'Mesi',
			'days'    : 'Giorni',
			'hours'   : 'Ore',
			'minutes' : 'Minuti',
			'seconds' : 'Secondi'	
	
		};
		
		/* Create various aliases for convenience */
	
		FlipClock.Lang['it']      = FlipClock.Lang.Italian;
		FlipClock.Lang['it-it']   = FlipClock.Lang.Italian;
		FlipClock.Lang['italian'] = FlipClock.Lang.Italian;
		
	}(jQuery));
	
	(function($) {
	
	  /**
	   * FlipClock Latvian Language Pack
	   *
	   * This class will used to translate tokens into the Latvian language.
	   *
	   */
	
	  FlipClock.Lang.Latvian = {
	
	    'years'   : 'Gadi',
	    'months'  : 'M??ne??i',
	    'days'    : 'Dienas',
	    'hours'   : 'Stundas',
	    'minutes' : 'Min??tes',
	    'seconds' : 'Sekundes'
	
	  };
	
	  /* Create various aliases for convenience */
	
	  FlipClock.Lang['lv']      = FlipClock.Lang.Latvian;
	  FlipClock.Lang['lv-lv']   = FlipClock.Lang.Latvian;
	  FlipClock.Lang['latvian'] = FlipClock.Lang.Latvian;
	
	}(jQuery));
	(function($) {
	
	    /**
	     * FlipClock Dutch Language Pack
	     *
	     * This class will used to translate tokens into the Dutch language.
	     */
	
	    FlipClock.Lang.Dutch = {
	
	        'years'   : 'Jaren',
	        'months'  : 'Maanden',
	        'days'    : 'Dagen',
	        'hours'   : 'Uren',
	        'minutes' : 'Minuten',
	        'seconds' : 'Seconden'
	
	    };
	
	    /* Create various aliases for convenience */
	
	    FlipClock.Lang['nl']      = FlipClock.Lang.Dutch;
	    FlipClock.Lang['nl-be']   = FlipClock.Lang.Dutch;
	    FlipClock.Lang['dutch']   = FlipClock.Lang.Dutch;
	
	}(jQuery));
	
	(function($) {
	
		/**
		 * FlipClock Norwegian-Bokm??l Language Pack
		 *
		 * This class will used to translate tokens into the Norwegian language.
		 *	
		 */
	
		FlipClock.Lang.Norwegian = {
	
			'years'   : '??r',
			'months'  : 'M??neder',
			'days'    : 'Dager',
			'hours'   : 'Timer',
			'minutes' : 'Minutter',
			'seconds' : 'Sekunder'	
	
		};
	
		/* Create various aliases for convenience */
	
		FlipClock.Lang['no']      = FlipClock.Lang.Norwegian;
		FlipClock.Lang['nb']      = FlipClock.Lang.Norwegian;
		FlipClock.Lang['no-nb']   = FlipClock.Lang.Norwegian;
		FlipClock.Lang['norwegian'] = FlipClock.Lang.Norwegian;
	
	}(jQuery));
	
	(function($) {
	
		/**
		 * FlipClock Portuguese Language Pack
		 *
		 * This class will used to translate tokens into the Portuguese language.
		 *
		 */
	
		FlipClock.Lang.Portuguese = {
	
			'years'   : 'Anos',
			'months'  : 'Meses',
			'days'    : 'Dias',
			'hours'   : 'Horas',
			'minutes' : 'Minutos',
			'seconds' : 'Segundos'
	
		};
	
		/* Create various aliases for convenience */
	
		FlipClock.Lang['pt']         = FlipClock.Lang.Portuguese;
		FlipClock.Lang['pt-br']      = FlipClock.Lang.Portuguese;
		FlipClock.Lang['portuguese'] = FlipClock.Lang.Portuguese;
	
	}(jQuery));
	(function($) {
	
	  /**
	   * FlipClock Russian Language Pack
	   *
	   * This class will used to translate tokens into the Russian language.
	   *
	   */
	
	  FlipClock.Lang.Russian = {
	
	    'years'   : '??????',
	    'months'  : '??????????????',
	    'days'    : '????????',
	    'hours'   : '??????????',
	    'minutes' : '??????????',
	    'seconds' : '????????????'
	
	  };
	
	  /* Create various aliases for convenience */
	
	  FlipClock.Lang['ru']      = FlipClock.Lang.Russian;
	  FlipClock.Lang['ru-ru']   = FlipClock.Lang.Russian;
	  FlipClock.Lang['russian']  = FlipClock.Lang.Russian;
	
	}(jQuery));
	(function($) {
			
		/**
		 * FlipClock Swedish Language Pack
		 *
		 * This class will used to translate tokens into the Swedish language.
		 *	
		 */
		 
		FlipClock.Lang.Swedish = {
			
			'years'   : '??r',
			'months'  : 'M??nader',
			'days'    : 'Dagar',
			'hours'   : 'Timmar',
			'minutes' : 'Minuter',
			'seconds' : 'Sekunder'	
	
		};
		
		/* Create various aliases for convenience */
	
		FlipClock.Lang['sv']      = FlipClock.Lang.Swedish;
		FlipClock.Lang['sv-se']   = FlipClock.Lang.Swedish;
		FlipClock.Lang['swedish'] = FlipClock.Lang.Swedish;
	
	}(jQuery));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {//! moment.js
	//! version : 2.10.6
	//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
	//! license : MIT
	//! momentjs.com
	
	(function (global, factory) {
	     true ? module.exports = factory() :
	    typeof define === 'function' && define.amd ? define(factory) :
	    global.moment = factory()
	}(this, function () { 'use strict';
	
	    var hookCallback;
	
	    function utils_hooks__hooks () {
	        return hookCallback.apply(null, arguments);
	    }
	
	    // This is done to register the method called with moment()
	    // without creating circular dependencies.
	    function setHookCallback (callback) {
	        hookCallback = callback;
	    }
	
	    function isArray(input) {
	        return Object.prototype.toString.call(input) === '[object Array]';
	    }
	
	    function isDate(input) {
	        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
	    }
	
	    function map(arr, fn) {
	        var res = [], i;
	        for (i = 0; i < arr.length; ++i) {
	            res.push(fn(arr[i], i));
	        }
	        return res;
	    }
	
	    function hasOwnProp(a, b) {
	        return Object.prototype.hasOwnProperty.call(a, b);
	    }
	
	    function extend(a, b) {
	        for (var i in b) {
	            if (hasOwnProp(b, i)) {
	                a[i] = b[i];
	            }
	        }
	
	        if (hasOwnProp(b, 'toString')) {
	            a.toString = b.toString;
	        }
	
	        if (hasOwnProp(b, 'valueOf')) {
	            a.valueOf = b.valueOf;
	        }
	
	        return a;
	    }
	
	    function create_utc__createUTC (input, format, locale, strict) {
	        return createLocalOrUTC(input, format, locale, strict, true).utc();
	    }
	
	    function defaultParsingFlags() {
	        // We need to deep clone this object.
	        return {
	            empty           : false,
	            unusedTokens    : [],
	            unusedInput     : [],
	            overflow        : -2,
	            charsLeftOver   : 0,
	            nullInput       : false,
	            invalidMonth    : null,
	            invalidFormat   : false,
	            userInvalidated : false,
	            iso             : false
	        };
	    }
	
	    function getParsingFlags(m) {
	        if (m._pf == null) {
	            m._pf = defaultParsingFlags();
	        }
	        return m._pf;
	    }
	
	    function valid__isValid(m) {
	        if (m._isValid == null) {
	            var flags = getParsingFlags(m);
	            m._isValid = !isNaN(m._d.getTime()) &&
	                flags.overflow < 0 &&
	                !flags.empty &&
	                !flags.invalidMonth &&
	                !flags.invalidWeekday &&
	                !flags.nullInput &&
	                !flags.invalidFormat &&
	                !flags.userInvalidated;
	
	            if (m._strict) {
	                m._isValid = m._isValid &&
	                    flags.charsLeftOver === 0 &&
	                    flags.unusedTokens.length === 0 &&
	                    flags.bigHour === undefined;
	            }
	        }
	        return m._isValid;
	    }
	
	    function valid__createInvalid (flags) {
	        var m = create_utc__createUTC(NaN);
	        if (flags != null) {
	            extend(getParsingFlags(m), flags);
	        }
	        else {
	            getParsingFlags(m).userInvalidated = true;
	        }
	
	        return m;
	    }
	
	    var momentProperties = utils_hooks__hooks.momentProperties = [];
	
	    function copyConfig(to, from) {
	        var i, prop, val;
	
	        if (typeof from._isAMomentObject !== 'undefined') {
	            to._isAMomentObject = from._isAMomentObject;
	        }
	        if (typeof from._i !== 'undefined') {
	            to._i = from._i;
	        }
	        if (typeof from._f !== 'undefined') {
	            to._f = from._f;
	        }
	        if (typeof from._l !== 'undefined') {
	            to._l = from._l;
	        }
	        if (typeof from._strict !== 'undefined') {
	            to._strict = from._strict;
	        }
	        if (typeof from._tzm !== 'undefined') {
	            to._tzm = from._tzm;
	        }
	        if (typeof from._isUTC !== 'undefined') {
	            to._isUTC = from._isUTC;
	        }
	        if (typeof from._offset !== 'undefined') {
	            to._offset = from._offset;
	        }
	        if (typeof from._pf !== 'undefined') {
	            to._pf = getParsingFlags(from);
	        }
	        if (typeof from._locale !== 'undefined') {
	            to._locale = from._locale;
	        }
	
	        if (momentProperties.length > 0) {
	            for (i in momentProperties) {
	                prop = momentProperties[i];
	                val = from[prop];
	                if (typeof val !== 'undefined') {
	                    to[prop] = val;
	                }
	            }
	        }
	
	        return to;
	    }
	
	    var updateInProgress = false;
	
	    // Moment prototype object
	    function Moment(config) {
	        copyConfig(this, config);
	        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
	        // Prevent infinite loop in case updateOffset creates new moment
	        // objects.
	        if (updateInProgress === false) {
	            updateInProgress = true;
	            utils_hooks__hooks.updateOffset(this);
	            updateInProgress = false;
	        }
	    }
	
	    function isMoment (obj) {
	        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
	    }
	
	    function absFloor (number) {
	        if (number < 0) {
	            return Math.ceil(number);
	        } else {
	            return Math.floor(number);
	        }
	    }
	
	    function toInt(argumentForCoercion) {
	        var coercedNumber = +argumentForCoercion,
	            value = 0;
	
	        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
	            value = absFloor(coercedNumber);
	        }
	
	        return value;
	    }
	
	    function compareArrays(array1, array2, dontConvert) {
	        var len = Math.min(array1.length, array2.length),
	            lengthDiff = Math.abs(array1.length - array2.length),
	            diffs = 0,
	            i;
	        for (i = 0; i < len; i++) {
	            if ((dontConvert && array1[i] !== array2[i]) ||
	                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
	                diffs++;
	            }
	        }
	        return diffs + lengthDiff;
	    }
	
	    function Locale() {
	    }
	
	    var locales = {};
	    var globalLocale;
	
	    function normalizeLocale(key) {
	        return key ? key.toLowerCase().replace('_', '-') : key;
	    }
	
	    // pick the locale from the array
	    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
	    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
	    function chooseLocale(names) {
	        var i = 0, j, next, locale, split;
	
	        while (i < names.length) {
	            split = normalizeLocale(names[i]).split('-');
	            j = split.length;
	            next = normalizeLocale(names[i + 1]);
	            next = next ? next.split('-') : null;
	            while (j > 0) {
	                locale = loadLocale(split.slice(0, j).join('-'));
	                if (locale) {
	                    return locale;
	                }
	                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
	                    //the next array item is better than a shallower substring of this one
	                    break;
	                }
	                j--;
	            }
	            i++;
	        }
	        return null;
	    }
	
	    function loadLocale(name) {
	        var oldLocale = null;
	        // TODO: Find a better way to register and load all the locales in Node
	        if (!locales[name] && typeof module !== 'undefined' &&
	                module && module.exports) {
	            try {
	                oldLocale = globalLocale._abbr;
	                __webpack_require__(12)("./" + name);
	                // because defineLocale currently also sets the global locale, we
	                // want to undo that for lazy loaded locales
	                locale_locales__getSetGlobalLocale(oldLocale);
	            } catch (e) { }
	        }
	        return locales[name];
	    }
	
	    // This function will load locale and then set the global locale.  If
	    // no arguments are passed in, it will simply return the current global
	    // locale key.
	    function locale_locales__getSetGlobalLocale (key, values) {
	        var data;
	        if (key) {
	            if (typeof values === 'undefined') {
	                data = locale_locales__getLocale(key);
	            }
	            else {
	                data = defineLocale(key, values);
	            }
	
	            if (data) {
	                // moment.duration._locale = moment._locale = data;
	                globalLocale = data;
	            }
	        }
	
	        return globalLocale._abbr;
	    }
	
	    function defineLocale (name, values) {
	        if (values !== null) {
	            values.abbr = name;
	            locales[name] = locales[name] || new Locale();
	            locales[name].set(values);
	
	            // backwards compat for now: also set the locale
	            locale_locales__getSetGlobalLocale(name);
	
	            return locales[name];
	        } else {
	            // useful for testing
	            delete locales[name];
	            return null;
	        }
	    }
	
	    // returns locale data
	    function locale_locales__getLocale (key) {
	        var locale;
	
	        if (key && key._locale && key._locale._abbr) {
	            key = key._locale._abbr;
	        }
	
	        if (!key) {
	            return globalLocale;
	        }
	
	        if (!isArray(key)) {
	            //short-circuit everything else
	            locale = loadLocale(key);
	            if (locale) {
	                return locale;
	            }
	            key = [key];
	        }
	
	        return chooseLocale(key);
	    }
	
	    var aliases = {};
	
	    function addUnitAlias (unit, shorthand) {
	        var lowerCase = unit.toLowerCase();
	        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
	    }
	
	    function normalizeUnits(units) {
	        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
	    }
	
	    function normalizeObjectUnits(inputObject) {
	        var normalizedInput = {},
	            normalizedProp,
	            prop;
	
	        for (prop in inputObject) {
	            if (hasOwnProp(inputObject, prop)) {
	                normalizedProp = normalizeUnits(prop);
	                if (normalizedProp) {
	                    normalizedInput[normalizedProp] = inputObject[prop];
	                }
	            }
	        }
	
	        return normalizedInput;
	    }
	
	    function makeGetSet (unit, keepTime) {
	        return function (value) {
	            if (value != null) {
	                get_set__set(this, unit, value);
	                utils_hooks__hooks.updateOffset(this, keepTime);
	                return this;
	            } else {
	                return get_set__get(this, unit);
	            }
	        };
	    }
	
	    function get_set__get (mom, unit) {
	        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
	    }
	
	    function get_set__set (mom, unit, value) {
	        return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
	    }
	
	    // MOMENTS
	
	    function getSet (units, value) {
	        var unit;
	        if (typeof units === 'object') {
	            for (unit in units) {
	                this.set(unit, units[unit]);
	            }
	        } else {
	            units = normalizeUnits(units);
	            if (typeof this[units] === 'function') {
	                return this[units](value);
	            }
	        }
	        return this;
	    }
	
	    function zeroFill(number, targetLength, forceSign) {
	        var absNumber = '' + Math.abs(number),
	            zerosToFill = targetLength - absNumber.length,
	            sign = number >= 0;
	        return (sign ? (forceSign ? '+' : '') : '-') +
	            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
	    }
	
	    var formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;
	
	    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;
	
	    var formatFunctions = {};
	
	    var formatTokenFunctions = {};
	
	    // token:    'M'
	    // padded:   ['MM', 2]
	    // ordinal:  'Mo'
	    // callback: function () { this.month() + 1 }
	    function addFormatToken (token, padded, ordinal, callback) {
	        var func = callback;
	        if (typeof callback === 'string') {
	            func = function () {
	                return this[callback]();
	            };
	        }
	        if (token) {
	            formatTokenFunctions[token] = func;
	        }
	        if (padded) {
	            formatTokenFunctions[padded[0]] = function () {
	                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
	            };
	        }
	        if (ordinal) {
	            formatTokenFunctions[ordinal] = function () {
	                return this.localeData().ordinal(func.apply(this, arguments), token);
	            };
	        }
	    }
	
	    function removeFormattingTokens(input) {
	        if (input.match(/\[[\s\S]/)) {
	            return input.replace(/^\[|\]$/g, '');
	        }
	        return input.replace(/\\/g, '');
	    }
	
	    function makeFormatFunction(format) {
	        var array = format.match(formattingTokens), i, length;
	
	        for (i = 0, length = array.length; i < length; i++) {
	            if (formatTokenFunctions[array[i]]) {
	                array[i] = formatTokenFunctions[array[i]];
	            } else {
	                array[i] = removeFormattingTokens(array[i]);
	            }
	        }
	
	        return function (mom) {
	            var output = '';
	            for (i = 0; i < length; i++) {
	                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
	            }
	            return output;
	        };
	    }
	
	    // format date using native date object
	    function formatMoment(m, format) {
	        if (!m.isValid()) {
	            return m.localeData().invalidDate();
	        }
	
	        format = expandFormat(format, m.localeData());
	        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);
	
	        return formatFunctions[format](m);
	    }
	
	    function expandFormat(format, locale) {
	        var i = 5;
	
	        function replaceLongDateFormatTokens(input) {
	            return locale.longDateFormat(input) || input;
	        }
	
	        localFormattingTokens.lastIndex = 0;
	        while (i >= 0 && localFormattingTokens.test(format)) {
	            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
	            localFormattingTokens.lastIndex = 0;
	            i -= 1;
	        }
	
	        return format;
	    }
	
	    var match1         = /\d/;            //       0 - 9
	    var match2         = /\d\d/;          //      00 - 99
	    var match3         = /\d{3}/;         //     000 - 999
	    var match4         = /\d{4}/;         //    0000 - 9999
	    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
	    var match1to2      = /\d\d?/;         //       0 - 99
	    var match1to3      = /\d{1,3}/;       //       0 - 999
	    var match1to4      = /\d{1,4}/;       //       0 - 9999
	    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999
	
	    var matchUnsigned  = /\d+/;           //       0 - inf
	    var matchSigned    = /[+-]?\d+/;      //    -inf - inf
	
	    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
	
	    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123
	
	    // any word (or two) characters or numbers including two/three word month in arabic.
	    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
	
	    var regexes = {};
	
	    function isFunction (sth) {
	        // https://github.com/moment/moment/issues/2325
	        return typeof sth === 'function' &&
	            Object.prototype.toString.call(sth) === '[object Function]';
	    }
	
	
	    function addRegexToken (token, regex, strictRegex) {
	        regexes[token] = isFunction(regex) ? regex : function (isStrict) {
	            return (isStrict && strictRegex) ? strictRegex : regex;
	        };
	    }
	
	    function getParseRegexForToken (token, config) {
	        if (!hasOwnProp(regexes, token)) {
	            return new RegExp(unescapeFormat(token));
	        }
	
	        return regexes[token](config._strict, config._locale);
	    }
	
	    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
	    function unescapeFormat(s) {
	        return s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
	            return p1 || p2 || p3 || p4;
	        }).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	    }
	
	    var tokens = {};
	
	    function addParseToken (token, callback) {
	        var i, func = callback;
	        if (typeof token === 'string') {
	            token = [token];
	        }
	        if (typeof callback === 'number') {
	            func = function (input, array) {
	                array[callback] = toInt(input);
	            };
	        }
	        for (i = 0; i < token.length; i++) {
	            tokens[token[i]] = func;
	        }
	    }
	
	    function addWeekParseToken (token, callback) {
	        addParseToken(token, function (input, array, config, token) {
	            config._w = config._w || {};
	            callback(input, config._w, config, token);
	        });
	    }
	
	    function addTimeToArrayFromToken(token, input, config) {
	        if (input != null && hasOwnProp(tokens, token)) {
	            tokens[token](input, config._a, config, token);
	        }
	    }
	
	    var YEAR = 0;
	    var MONTH = 1;
	    var DATE = 2;
	    var HOUR = 3;
	    var MINUTE = 4;
	    var SECOND = 5;
	    var MILLISECOND = 6;
	
	    function daysInMonth(year, month) {
	        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	    }
	
	    // FORMATTING
	
	    addFormatToken('M', ['MM', 2], 'Mo', function () {
	        return this.month() + 1;
	    });
	
	    addFormatToken('MMM', 0, 0, function (format) {
	        return this.localeData().monthsShort(this, format);
	    });
	
	    addFormatToken('MMMM', 0, 0, function (format) {
	        return this.localeData().months(this, format);
	    });
	
	    // ALIASES
	
	    addUnitAlias('month', 'M');
	
	    // PARSING
	
	    addRegexToken('M',    match1to2);
	    addRegexToken('MM',   match1to2, match2);
	    addRegexToken('MMM',  matchWord);
	    addRegexToken('MMMM', matchWord);
	
	    addParseToken(['M', 'MM'], function (input, array) {
	        array[MONTH] = toInt(input) - 1;
	    });
	
	    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
	        var month = config._locale.monthsParse(input, token, config._strict);
	        // if we didn't find a month name, mark the date as invalid.
	        if (month != null) {
	            array[MONTH] = month;
	        } else {
	            getParsingFlags(config).invalidMonth = input;
	        }
	    });
	
	    // LOCALES
	
	    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
	    function localeMonths (m) {
	        return this._months[m.month()];
	    }
	
	    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
	    function localeMonthsShort (m) {
	        return this._monthsShort[m.month()];
	    }
	
	    function localeMonthsParse (monthName, format, strict) {
	        var i, mom, regex;
	
	        if (!this._monthsParse) {
	            this._monthsParse = [];
	            this._longMonthsParse = [];
	            this._shortMonthsParse = [];
	        }
	
	        for (i = 0; i < 12; i++) {
	            // make the regex if we don't have it already
	            mom = create_utc__createUTC([2000, i]);
	            if (strict && !this._longMonthsParse[i]) {
	                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
	                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
	            }
	            if (!strict && !this._monthsParse[i]) {
	                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
	                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
	            }
	            // test the regex
	            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
	                return i;
	            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
	                return i;
	            } else if (!strict && this._monthsParse[i].test(monthName)) {
	                return i;
	            }
	        }
	    }
	
	    // MOMENTS
	
	    function setMonth (mom, value) {
	        var dayOfMonth;
	
	        // TODO: Move this out of here!
	        if (typeof value === 'string') {
	            value = mom.localeData().monthsParse(value);
	            // TODO: Another silent failure?
	            if (typeof value !== 'number') {
	                return mom;
	            }
	        }
	
	        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
	        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
	        return mom;
	    }
	
	    function getSetMonth (value) {
	        if (value != null) {
	            setMonth(this, value);
	            utils_hooks__hooks.updateOffset(this, true);
	            return this;
	        } else {
	            return get_set__get(this, 'Month');
	        }
	    }
	
	    function getDaysInMonth () {
	        return daysInMonth(this.year(), this.month());
	    }
	
	    function checkOverflow (m) {
	        var overflow;
	        var a = m._a;
	
	        if (a && getParsingFlags(m).overflow === -2) {
	            overflow =
	                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
	                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
	                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
	                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
	                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
	                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
	                -1;
	
	            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
	                overflow = DATE;
	            }
	
	            getParsingFlags(m).overflow = overflow;
	        }
	
	        return m;
	    }
	
	    function warn(msg) {
	        if (utils_hooks__hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
	            console.warn('Deprecation warning: ' + msg);
	        }
	    }
	
	    function deprecate(msg, fn) {
	        var firstTime = true;
	
	        return extend(function () {
	            if (firstTime) {
	                warn(msg + '\n' + (new Error()).stack);
	                firstTime = false;
	            }
	            return fn.apply(this, arguments);
	        }, fn);
	    }
	
	    var deprecations = {};
	
	    function deprecateSimple(name, msg) {
	        if (!deprecations[name]) {
	            warn(msg);
	            deprecations[name] = true;
	        }
	    }
	
	    utils_hooks__hooks.suppressDeprecationWarnings = false;
	
	    var from_string__isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
	
	    var isoDates = [
	        ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
	        ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
	        ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
	        ['GGGG-[W]WW', /\d{4}-W\d{2}/],
	        ['YYYY-DDD', /\d{4}-\d{3}/]
	    ];
	
	    // iso time formats and regexes
	    var isoTimes = [
	        ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
	        ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
	        ['HH:mm', /(T| )\d\d:\d\d/],
	        ['HH', /(T| )\d\d/]
	    ];
	
	    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;
	
	    // date from iso format
	    function configFromISO(config) {
	        var i, l,
	            string = config._i,
	            match = from_string__isoRegex.exec(string);
	
	        if (match) {
	            getParsingFlags(config).iso = true;
	            for (i = 0, l = isoDates.length; i < l; i++) {
	                if (isoDates[i][1].exec(string)) {
	                    config._f = isoDates[i][0];
	                    break;
	                }
	            }
	            for (i = 0, l = isoTimes.length; i < l; i++) {
	                if (isoTimes[i][1].exec(string)) {
	                    // match[6] should be 'T' or space
	                    config._f += (match[6] || ' ') + isoTimes[i][0];
	                    break;
	                }
	            }
	            if (string.match(matchOffset)) {
	                config._f += 'Z';
	            }
	            configFromStringAndFormat(config);
	        } else {
	            config._isValid = false;
	        }
	    }
	
	    // date from iso format or fallback
	    function configFromString(config) {
	        var matched = aspNetJsonRegex.exec(config._i);
	
	        if (matched !== null) {
	            config._d = new Date(+matched[1]);
	            return;
	        }
	
	        configFromISO(config);
	        if (config._isValid === false) {
	            delete config._isValid;
	            utils_hooks__hooks.createFromInputFallback(config);
	        }
	    }
	
	    utils_hooks__hooks.createFromInputFallback = deprecate(
	        'moment construction falls back to js Date. This is ' +
	        'discouraged and will be removed in upcoming major ' +
	        'release. Please refer to ' +
	        'https://github.com/moment/moment/issues/1407 for more info.',
	        function (config) {
	            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
	        }
	    );
	
	    function createDate (y, m, d, h, M, s, ms) {
	        //can't just apply() to create a date:
	        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
	        var date = new Date(y, m, d, h, M, s, ms);
	
	        //the date constructor doesn't accept years < 1970
	        if (y < 1970) {
	            date.setFullYear(y);
	        }
	        return date;
	    }
	
	    function createUTCDate (y) {
	        var date = new Date(Date.UTC.apply(null, arguments));
	        if (y < 1970) {
	            date.setUTCFullYear(y);
	        }
	        return date;
	    }
	
	    addFormatToken(0, ['YY', 2], 0, function () {
	        return this.year() % 100;
	    });
	
	    addFormatToken(0, ['YYYY',   4],       0, 'year');
	    addFormatToken(0, ['YYYYY',  5],       0, 'year');
	    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');
	
	    // ALIASES
	
	    addUnitAlias('year', 'y');
	
	    // PARSING
	
	    addRegexToken('Y',      matchSigned);
	    addRegexToken('YY',     match1to2, match2);
	    addRegexToken('YYYY',   match1to4, match4);
	    addRegexToken('YYYYY',  match1to6, match6);
	    addRegexToken('YYYYYY', match1to6, match6);
	
	    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
	    addParseToken('YYYY', function (input, array) {
	        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
	    });
	    addParseToken('YY', function (input, array) {
	        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
	    });
	
	    // HELPERS
	
	    function daysInYear(year) {
	        return isLeapYear(year) ? 366 : 365;
	    }
	
	    function isLeapYear(year) {
	        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	    }
	
	    // HOOKS
	
	    utils_hooks__hooks.parseTwoDigitYear = function (input) {
	        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
	    };
	
	    // MOMENTS
	
	    var getSetYear = makeGetSet('FullYear', false);
	
	    function getIsLeapYear () {
	        return isLeapYear(this.year());
	    }
	
	    addFormatToken('w', ['ww', 2], 'wo', 'week');
	    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');
	
	    // ALIASES
	
	    addUnitAlias('week', 'w');
	    addUnitAlias('isoWeek', 'W');
	
	    // PARSING
	
	    addRegexToken('w',  match1to2);
	    addRegexToken('ww', match1to2, match2);
	    addRegexToken('W',  match1to2);
	    addRegexToken('WW', match1to2, match2);
	
	    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
	        week[token.substr(0, 1)] = toInt(input);
	    });
	
	    // HELPERS
	
	    // firstDayOfWeek       0 = sun, 6 = sat
	    //                      the day of the week that starts the week
	    //                      (usually sunday or monday)
	    // firstDayOfWeekOfYear 0 = sun, 6 = sat
	    //                      the first week is the week that contains the first
	    //                      of this day of the week
	    //                      (eg. ISO weeks use thursday (4))
	    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
	        var end = firstDayOfWeekOfYear - firstDayOfWeek,
	            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
	            adjustedMoment;
	
	
	        if (daysToDayOfWeek > end) {
	            daysToDayOfWeek -= 7;
	        }
	
	        if (daysToDayOfWeek < end - 7) {
	            daysToDayOfWeek += 7;
	        }
	
	        adjustedMoment = local__createLocal(mom).add(daysToDayOfWeek, 'd');
	        return {
	            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
	            year: adjustedMoment.year()
	        };
	    }
	
	    // LOCALES
	
	    function localeWeek (mom) {
	        return weekOfYear(mom, this._week.dow, this._week.doy).week;
	    }
	
	    var defaultLocaleWeek = {
	        dow : 0, // Sunday is the first day of the week.
	        doy : 6  // The week that contains Jan 1st is the first week of the year.
	    };
	
	    function localeFirstDayOfWeek () {
	        return this._week.dow;
	    }
	
	    function localeFirstDayOfYear () {
	        return this._week.doy;
	    }
	
	    // MOMENTS
	
	    function getSetWeek (input) {
	        var week = this.localeData().week(this);
	        return input == null ? week : this.add((input - week) * 7, 'd');
	    }
	
	    function getSetISOWeek (input) {
	        var week = weekOfYear(this, 1, 4).week;
	        return input == null ? week : this.add((input - week) * 7, 'd');
	    }
	
	    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');
	
	    // ALIASES
	
	    addUnitAlias('dayOfYear', 'DDD');
	
	    // PARSING
	
	    addRegexToken('DDD',  match1to3);
	    addRegexToken('DDDD', match3);
	    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
	        config._dayOfYear = toInt(input);
	    });
	
	    // HELPERS
	
	    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
	    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
	        var week1Jan = 6 + firstDayOfWeek - firstDayOfWeekOfYear, janX = createUTCDate(year, 0, 1 + week1Jan), d = janX.getUTCDay(), dayOfYear;
	        if (d < firstDayOfWeek) {
	            d += 7;
	        }
	
	        weekday = weekday != null ? 1 * weekday : firstDayOfWeek;
	
	        dayOfYear = 1 + week1Jan + 7 * (week - 1) - d + weekday;
	
	        return {
	            year: dayOfYear > 0 ? year : year - 1,
	            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
	        };
	    }
	
	    // MOMENTS
	
	    function getSetDayOfYear (input) {
	        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
	        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
	    }
	
	    // Pick the first defined of two or three arguments.
	    function defaults(a, b, c) {
	        if (a != null) {
	            return a;
	        }
	        if (b != null) {
	            return b;
	        }
	        return c;
	    }
	
	    function currentDateArray(config) {
	        var now = new Date();
	        if (config._useUTC) {
	            return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()];
	        }
	        return [now.getFullYear(), now.getMonth(), now.getDate()];
	    }
	
	    // convert an array to a date.
	    // the array should mirror the parameters below
	    // note: all values past the year are optional and will default to the lowest possible value.
	    // [year, month, day , hour, minute, second, millisecond]
	    function configFromArray (config) {
	        var i, date, input = [], currentDate, yearToUse;
	
	        if (config._d) {
	            return;
	        }
	
	        currentDate = currentDateArray(config);
	
	        //compute day of the year from weeks and weekdays
	        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
	            dayOfYearFromWeekInfo(config);
	        }
	
	        //if the day of the year is set, figure out what it is
	        if (config._dayOfYear) {
	            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
	
	            if (config._dayOfYear > daysInYear(yearToUse)) {
	                getParsingFlags(config)._overflowDayOfYear = true;
	            }
	
	            date = createUTCDate(yearToUse, 0, config._dayOfYear);
	            config._a[MONTH] = date.getUTCMonth();
	            config._a[DATE] = date.getUTCDate();
	        }
	
	        // Default to current date.
	        // * if no year, month, day of month are given, default to today
	        // * if day of month is given, default month and year
	        // * if month is given, default only year
	        // * if year is given, don't default anything
	        for (i = 0; i < 3 && config._a[i] == null; ++i) {
	            config._a[i] = input[i] = currentDate[i];
	        }
	
	        // Zero out whatever was not defaulted, including time
	        for (; i < 7; i++) {
	            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
	        }
	
	        // Check for 24:00:00.000
	        if (config._a[HOUR] === 24 &&
	                config._a[MINUTE] === 0 &&
	                config._a[SECOND] === 0 &&
	                config._a[MILLISECOND] === 0) {
	            config._nextDay = true;
	            config._a[HOUR] = 0;
	        }
	
	        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
	        // Apply timezone offset from input. The actual utcOffset can be changed
	        // with parseZone.
	        if (config._tzm != null) {
	            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
	        }
	
	        if (config._nextDay) {
	            config._a[HOUR] = 24;
	        }
	    }
	
	    function dayOfYearFromWeekInfo(config) {
	        var w, weekYear, week, weekday, dow, doy, temp;
	
	        w = config._w;
	        if (w.GG != null || w.W != null || w.E != null) {
	            dow = 1;
	            doy = 4;
	
	            // TODO: We need to take the current isoWeekYear, but that depends on
	            // how we interpret now (local, utc, fixed offset). So create
	            // a now version of current config (take local/utc/offset flags, and
	            // create now).
	            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
	            week = defaults(w.W, 1);
	            weekday = defaults(w.E, 1);
	        } else {
	            dow = config._locale._week.dow;
	            doy = config._locale._week.doy;
	
	            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
	            week = defaults(w.w, 1);
	
	            if (w.d != null) {
	                // weekday -- low day numbers are considered next week
	                weekday = w.d;
	                if (weekday < dow) {
	                    ++week;
	                }
	            } else if (w.e != null) {
	                // local weekday -- counting starts from begining of week
	                weekday = w.e + dow;
	            } else {
	                // default to begining of week
	                weekday = dow;
	            }
	        }
	        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);
	
	        config._a[YEAR] = temp.year;
	        config._dayOfYear = temp.dayOfYear;
	    }
	
	    utils_hooks__hooks.ISO_8601 = function () {};
	
	    // date from string and format string
	    function configFromStringAndFormat(config) {
	        // TODO: Move this to another part of the creation flow to prevent circular deps
	        if (config._f === utils_hooks__hooks.ISO_8601) {
	            configFromISO(config);
	            return;
	        }
	
	        config._a = [];
	        getParsingFlags(config).empty = true;
	
	        // This array is used to make a Date, either with `new Date` or `Date.UTC`
	        var string = '' + config._i,
	            i, parsedInput, tokens, token, skipped,
	            stringLength = string.length,
	            totalParsedInputLength = 0;
	
	        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
	
	        for (i = 0; i < tokens.length; i++) {
	            token = tokens[i];
	            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
	            if (parsedInput) {
	                skipped = string.substr(0, string.indexOf(parsedInput));
	                if (skipped.length > 0) {
	                    getParsingFlags(config).unusedInput.push(skipped);
	                }
	                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
	                totalParsedInputLength += parsedInput.length;
	            }
	            // don't parse if it's not a known token
	            if (formatTokenFunctions[token]) {
	                if (parsedInput) {
	                    getParsingFlags(config).empty = false;
	                }
	                else {
	                    getParsingFlags(config).unusedTokens.push(token);
	                }
	                addTimeToArrayFromToken(token, parsedInput, config);
	            }
	            else if (config._strict && !parsedInput) {
	                getParsingFlags(config).unusedTokens.push(token);
	            }
	        }
	
	        // add remaining unparsed input length to the string
	        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
	        if (string.length > 0) {
	            getParsingFlags(config).unusedInput.push(string);
	        }
	
	        // clear _12h flag if hour is <= 12
	        if (getParsingFlags(config).bigHour === true &&
	                config._a[HOUR] <= 12 &&
	                config._a[HOUR] > 0) {
	            getParsingFlags(config).bigHour = undefined;
	        }
	        // handle meridiem
	        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
	
	        configFromArray(config);
	        checkOverflow(config);
	    }
	
	
	    function meridiemFixWrap (locale, hour, meridiem) {
	        var isPm;
	
	        if (meridiem == null) {
	            // nothing to do
	            return hour;
	        }
	        if (locale.meridiemHour != null) {
	            return locale.meridiemHour(hour, meridiem);
	        } else if (locale.isPM != null) {
	            // Fallback
	            isPm = locale.isPM(meridiem);
	            if (isPm && hour < 12) {
	                hour += 12;
	            }
	            if (!isPm && hour === 12) {
	                hour = 0;
	            }
	            return hour;
	        } else {
	            // this is not supposed to happen
	            return hour;
	        }
	    }
	
	    function configFromStringAndArray(config) {
	        var tempConfig,
	            bestMoment,
	
	            scoreToBeat,
	            i,
	            currentScore;
	
	        if (config._f.length === 0) {
	            getParsingFlags(config).invalidFormat = true;
	            config._d = new Date(NaN);
	            return;
	        }
	
	        for (i = 0; i < config._f.length; i++) {
	            currentScore = 0;
	            tempConfig = copyConfig({}, config);
	            if (config._useUTC != null) {
	                tempConfig._useUTC = config._useUTC;
	            }
	            tempConfig._f = config._f[i];
	            configFromStringAndFormat(tempConfig);
	
	            if (!valid__isValid(tempConfig)) {
	                continue;
	            }
	
	            // if there is any input that was not parsed add a penalty for that format
	            currentScore += getParsingFlags(tempConfig).charsLeftOver;
	
	            //or tokens
	            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;
	
	            getParsingFlags(tempConfig).score = currentScore;
	
	            if (scoreToBeat == null || currentScore < scoreToBeat) {
	                scoreToBeat = currentScore;
	                bestMoment = tempConfig;
	            }
	        }
	
	        extend(config, bestMoment || tempConfig);
	    }
	
	    function configFromObject(config) {
	        if (config._d) {
	            return;
	        }
	
	        var i = normalizeObjectUnits(config._i);
	        config._a = [i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond];
	
	        configFromArray(config);
	    }
	
	    function createFromConfig (config) {
	        var res = new Moment(checkOverflow(prepareConfig(config)));
	        if (res._nextDay) {
	            // Adding is smart enough around DST
	            res.add(1, 'd');
	            res._nextDay = undefined;
	        }
	
	        return res;
	    }
	
	    function prepareConfig (config) {
	        var input = config._i,
	            format = config._f;
	
	        config._locale = config._locale || locale_locales__getLocale(config._l);
	
	        if (input === null || (format === undefined && input === '')) {
	            return valid__createInvalid({nullInput: true});
	        }
	
	        if (typeof input === 'string') {
	            config._i = input = config._locale.preparse(input);
	        }
	
	        if (isMoment(input)) {
	            return new Moment(checkOverflow(input));
	        } else if (isArray(format)) {
	            configFromStringAndArray(config);
	        } else if (format) {
	            configFromStringAndFormat(config);
	        } else if (isDate(input)) {
	            config._d = input;
	        } else {
	            configFromInput(config);
	        }
	
	        return config;
	    }
	
	    function configFromInput(config) {
	        var input = config._i;
	        if (input === undefined) {
	            config._d = new Date();
	        } else if (isDate(input)) {
	            config._d = new Date(+input);
	        } else if (typeof input === 'string') {
	            configFromString(config);
	        } else if (isArray(input)) {
	            config._a = map(input.slice(0), function (obj) {
	                return parseInt(obj, 10);
	            });
	            configFromArray(config);
	        } else if (typeof(input) === 'object') {
	            configFromObject(config);
	        } else if (typeof(input) === 'number') {
	            // from milliseconds
	            config._d = new Date(input);
	        } else {
	            utils_hooks__hooks.createFromInputFallback(config);
	        }
	    }
	
	    function createLocalOrUTC (input, format, locale, strict, isUTC) {
	        var c = {};
	
	        if (typeof(locale) === 'boolean') {
	            strict = locale;
	            locale = undefined;
	        }
	        // object construction must be done this way.
	        // https://github.com/moment/moment/issues/1423
	        c._isAMomentObject = true;
	        c._useUTC = c._isUTC = isUTC;
	        c._l = locale;
	        c._i = input;
	        c._f = format;
	        c._strict = strict;
	
	        return createFromConfig(c);
	    }
	
	    function local__createLocal (input, format, locale, strict) {
	        return createLocalOrUTC(input, format, locale, strict, false);
	    }
	
	    var prototypeMin = deprecate(
	         'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
	         function () {
	             var other = local__createLocal.apply(null, arguments);
	             return other < this ? this : other;
	         }
	     );
	
	    var prototypeMax = deprecate(
	        'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
	        function () {
	            var other = local__createLocal.apply(null, arguments);
	            return other > this ? this : other;
	        }
	    );
	
	    // Pick a moment m from moments so that m[fn](other) is true for all
	    // other. This relies on the function fn to be transitive.
	    //
	    // moments should either be an array of moment objects or an array, whose
	    // first element is an array of moment objects.
	    function pickBy(fn, moments) {
	        var res, i;
	        if (moments.length === 1 && isArray(moments[0])) {
	            moments = moments[0];
	        }
	        if (!moments.length) {
	            return local__createLocal();
	        }
	        res = moments[0];
	        for (i = 1; i < moments.length; ++i) {
	            if (!moments[i].isValid() || moments[i][fn](res)) {
	                res = moments[i];
	            }
	        }
	        return res;
	    }
	
	    // TODO: Use [].sort instead?
	    function min () {
	        var args = [].slice.call(arguments, 0);
	
	        return pickBy('isBefore', args);
	    }
	
	    function max () {
	        var args = [].slice.call(arguments, 0);
	
	        return pickBy('isAfter', args);
	    }
	
	    function Duration (duration) {
	        var normalizedInput = normalizeObjectUnits(duration),
	            years = normalizedInput.year || 0,
	            quarters = normalizedInput.quarter || 0,
	            months = normalizedInput.month || 0,
	            weeks = normalizedInput.week || 0,
	            days = normalizedInput.day || 0,
	            hours = normalizedInput.hour || 0,
	            minutes = normalizedInput.minute || 0,
	            seconds = normalizedInput.second || 0,
	            milliseconds = normalizedInput.millisecond || 0;
	
	        // representation for dateAddRemove
	        this._milliseconds = +milliseconds +
	            seconds * 1e3 + // 1000
	            minutes * 6e4 + // 1000 * 60
	            hours * 36e5; // 1000 * 60 * 60
	        // Because of dateAddRemove treats 24 hours as different from a
	        // day when working around DST, we need to store them separately
	        this._days = +days +
	            weeks * 7;
	        // It is impossible translate months into days without knowing
	        // which months you are are talking about, so we have to store
	        // it separately.
	        this._months = +months +
	            quarters * 3 +
	            years * 12;
	
	        this._data = {};
	
	        this._locale = locale_locales__getLocale();
	
	        this._bubble();
	    }
	
	    function isDuration (obj) {
	        return obj instanceof Duration;
	    }
	
	    function offset (token, separator) {
	        addFormatToken(token, 0, 0, function () {
	            var offset = this.utcOffset();
	            var sign = '+';
	            if (offset < 0) {
	                offset = -offset;
	                sign = '-';
	            }
	            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
	        });
	    }
	
	    offset('Z', ':');
	    offset('ZZ', '');
	
	    // PARSING
	
	    addRegexToken('Z',  matchOffset);
	    addRegexToken('ZZ', matchOffset);
	    addParseToken(['Z', 'ZZ'], function (input, array, config) {
	        config._useUTC = true;
	        config._tzm = offsetFromString(input);
	    });
	
	    // HELPERS
	
	    // timezone chunker
	    // '+10:00' > ['10',  '00']
	    // '-1530'  > ['-15', '30']
	    var chunkOffset = /([\+\-]|\d\d)/gi;
	
	    function offsetFromString(string) {
	        var matches = ((string || '').match(matchOffset) || []);
	        var chunk   = matches[matches.length - 1] || [];
	        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
	        var minutes = +(parts[1] * 60) + toInt(parts[2]);
	
	        return parts[0] === '+' ? minutes : -minutes;
	    }
	
	    // Return a moment from input, that is local/utc/zone equivalent to model.
	    function cloneWithOffset(input, model) {
	        var res, diff;
	        if (model._isUTC) {
	            res = model.clone();
	            diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - (+res);
	            // Use low-level api, because this fn is low-level api.
	            res._d.setTime(+res._d + diff);
	            utils_hooks__hooks.updateOffset(res, false);
	            return res;
	        } else {
	            return local__createLocal(input).local();
	        }
	    }
	
	    function getDateOffset (m) {
	        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
	        // https://github.com/moment/moment/pull/1871
	        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
	    }
	
	    // HOOKS
	
	    // This function will be called whenever a moment is mutated.
	    // It is intended to keep the offset in sync with the timezone.
	    utils_hooks__hooks.updateOffset = function () {};
	
	    // MOMENTS
	
	    // keepLocalTime = true means only change the timezone, without
	    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
	    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
	    // +0200, so we adjust the time as needed, to be valid.
	    //
	    // Keeping the time actually adds/subtracts (one hour)
	    // from the actual represented time. That is why we call updateOffset
	    // a second time. In case it wants us to change the offset again
	    // _changeInProgress == true case, then we have to adjust, because
	    // there is no such time in the given timezone.
	    function getSetOffset (input, keepLocalTime) {
	        var offset = this._offset || 0,
	            localAdjust;
	        if (input != null) {
	            if (typeof input === 'string') {
	                input = offsetFromString(input);
	            }
	            if (Math.abs(input) < 16) {
	                input = input * 60;
	            }
	            if (!this._isUTC && keepLocalTime) {
	                localAdjust = getDateOffset(this);
	            }
	            this._offset = input;
	            this._isUTC = true;
	            if (localAdjust != null) {
	                this.add(localAdjust, 'm');
	            }
	            if (offset !== input) {
	                if (!keepLocalTime || this._changeInProgress) {
	                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
	                } else if (!this._changeInProgress) {
	                    this._changeInProgress = true;
	                    utils_hooks__hooks.updateOffset(this, true);
	                    this._changeInProgress = null;
	                }
	            }
	            return this;
	        } else {
	            return this._isUTC ? offset : getDateOffset(this);
	        }
	    }
	
	    function getSetZone (input, keepLocalTime) {
	        if (input != null) {
	            if (typeof input !== 'string') {
	                input = -input;
	            }
	
	            this.utcOffset(input, keepLocalTime);
	
	            return this;
	        } else {
	            return -this.utcOffset();
	        }
	    }
	
	    function setOffsetToUTC (keepLocalTime) {
	        return this.utcOffset(0, keepLocalTime);
	    }
	
	    function setOffsetToLocal (keepLocalTime) {
	        if (this._isUTC) {
	            this.utcOffset(0, keepLocalTime);
	            this._isUTC = false;
	
	            if (keepLocalTime) {
	                this.subtract(getDateOffset(this), 'm');
	            }
	        }
	        return this;
	    }
	
	    function setOffsetToParsedOffset () {
	        if (this._tzm) {
	            this.utcOffset(this._tzm);
	        } else if (typeof this._i === 'string') {
	            this.utcOffset(offsetFromString(this._i));
	        }
	        return this;
	    }
	
	    function hasAlignedHourOffset (input) {
	        input = input ? local__createLocal(input).utcOffset() : 0;
	
	        return (this.utcOffset() - input) % 60 === 0;
	    }
	
	    function isDaylightSavingTime () {
	        return (
	            this.utcOffset() > this.clone().month(0).utcOffset() ||
	            this.utcOffset() > this.clone().month(5).utcOffset()
	        );
	    }
	
	    function isDaylightSavingTimeShifted () {
	        if (typeof this._isDSTShifted !== 'undefined') {
	            return this._isDSTShifted;
	        }
	
	        var c = {};
	
	        copyConfig(c, this);
	        c = prepareConfig(c);
	
	        if (c._a) {
	            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
	            this._isDSTShifted = this.isValid() &&
	                compareArrays(c._a, other.toArray()) > 0;
	        } else {
	            this._isDSTShifted = false;
	        }
	
	        return this._isDSTShifted;
	    }
	
	    function isLocal () {
	        return !this._isUTC;
	    }
	
	    function isUtcOffset () {
	        return this._isUTC;
	    }
	
	    function isUtc () {
	        return this._isUTC && this._offset === 0;
	    }
	
	    var aspNetRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;
	
	    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
	    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
	    var create__isoRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;
	
	    function create__createDuration (input, key) {
	        var duration = input,
	            // matching against regexp is expensive, do it on demand
	            match = null,
	            sign,
	            ret,
	            diffRes;
	
	        if (isDuration(input)) {
	            duration = {
	                ms : input._milliseconds,
	                d  : input._days,
	                M  : input._months
	            };
	        } else if (typeof input === 'number') {
	            duration = {};
	            if (key) {
	                duration[key] = input;
	            } else {
	                duration.milliseconds = input;
	            }
	        } else if (!!(match = aspNetRegex.exec(input))) {
	            sign = (match[1] === '-') ? -1 : 1;
	            duration = {
	                y  : 0,
	                d  : toInt(match[DATE])        * sign,
	                h  : toInt(match[HOUR])        * sign,
	                m  : toInt(match[MINUTE])      * sign,
	                s  : toInt(match[SECOND])      * sign,
	                ms : toInt(match[MILLISECOND]) * sign
	            };
	        } else if (!!(match = create__isoRegex.exec(input))) {
	            sign = (match[1] === '-') ? -1 : 1;
	            duration = {
	                y : parseIso(match[2], sign),
	                M : parseIso(match[3], sign),
	                d : parseIso(match[4], sign),
	                h : parseIso(match[5], sign),
	                m : parseIso(match[6], sign),
	                s : parseIso(match[7], sign),
	                w : parseIso(match[8], sign)
	            };
	        } else if (duration == null) {// checks for null or undefined
	            duration = {};
	        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
	            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));
	
	            duration = {};
	            duration.ms = diffRes.milliseconds;
	            duration.M = diffRes.months;
	        }
	
	        ret = new Duration(duration);
	
	        if (isDuration(input) && hasOwnProp(input, '_locale')) {
	            ret._locale = input._locale;
	        }
	
	        return ret;
	    }
	
	    create__createDuration.fn = Duration.prototype;
	
	    function parseIso (inp, sign) {
	        // We'd normally use ~~inp for this, but unfortunately it also
	        // converts floats to ints.
	        // inp may be undefined, so careful calling replace on it.
	        var res = inp && parseFloat(inp.replace(',', '.'));
	        // apply sign while we're at it
	        return (isNaN(res) ? 0 : res) * sign;
	    }
	
	    function positiveMomentsDifference(base, other) {
	        var res = {milliseconds: 0, months: 0};
	
	        res.months = other.month() - base.month() +
	            (other.year() - base.year()) * 12;
	        if (base.clone().add(res.months, 'M').isAfter(other)) {
	            --res.months;
	        }
	
	        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));
	
	        return res;
	    }
	
	    function momentsDifference(base, other) {
	        var res;
	        other = cloneWithOffset(other, base);
	        if (base.isBefore(other)) {
	            res = positiveMomentsDifference(base, other);
	        } else {
	            res = positiveMomentsDifference(other, base);
	            res.milliseconds = -res.milliseconds;
	            res.months = -res.months;
	        }
	
	        return res;
	    }
	
	    function createAdder(direction, name) {
	        return function (val, period) {
	            var dur, tmp;
	            //invert the arguments, but complain about it
	            if (period !== null && !isNaN(+period)) {
	                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
	                tmp = val; val = period; period = tmp;
	            }
	
	            val = typeof val === 'string' ? +val : val;
	            dur = create__createDuration(val, period);
	            add_subtract__addSubtract(this, dur, direction);
	            return this;
	        };
	    }
	
	    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
	        var milliseconds = duration._milliseconds,
	            days = duration._days,
	            months = duration._months;
	        updateOffset = updateOffset == null ? true : updateOffset;
	
	        if (milliseconds) {
	            mom._d.setTime(+mom._d + milliseconds * isAdding);
	        }
	        if (days) {
	            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
	        }
	        if (months) {
	            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
	        }
	        if (updateOffset) {
	            utils_hooks__hooks.updateOffset(mom, days || months);
	        }
	    }
	
	    var add_subtract__add      = createAdder(1, 'add');
	    var add_subtract__subtract = createAdder(-1, 'subtract');
	
	    function moment_calendar__calendar (time, formats) {
	        // We want to compare the start of today, vs this.
	        // Getting start-of-today depends on whether we're local/utc/offset or not.
	        var now = time || local__createLocal(),
	            sod = cloneWithOffset(now, this).startOf('day'),
	            diff = this.diff(sod, 'days', true),
	            format = diff < -6 ? 'sameElse' :
	                diff < -1 ? 'lastWeek' :
	                diff < 0 ? 'lastDay' :
	                diff < 1 ? 'sameDay' :
	                diff < 2 ? 'nextDay' :
	                diff < 7 ? 'nextWeek' : 'sameElse';
	        return this.format(formats && formats[format] || this.localeData().calendar(format, this, local__createLocal(now)));
	    }
	
	    function clone () {
	        return new Moment(this);
	    }
	
	    function isAfter (input, units) {
	        var inputMs;
	        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
	        if (units === 'millisecond') {
	            input = isMoment(input) ? input : local__createLocal(input);
	            return +this > +input;
	        } else {
	            inputMs = isMoment(input) ? +input : +local__createLocal(input);
	            return inputMs < +this.clone().startOf(units);
	        }
	    }
	
	    function isBefore (input, units) {
	        var inputMs;
	        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
	        if (units === 'millisecond') {
	            input = isMoment(input) ? input : local__createLocal(input);
	            return +this < +input;
	        } else {
	            inputMs = isMoment(input) ? +input : +local__createLocal(input);
	            return +this.clone().endOf(units) < inputMs;
	        }
	    }
	
	    function isBetween (from, to, units) {
	        return this.isAfter(from, units) && this.isBefore(to, units);
	    }
	
	    function isSame (input, units) {
	        var inputMs;
	        units = normalizeUnits(units || 'millisecond');
	        if (units === 'millisecond') {
	            input = isMoment(input) ? input : local__createLocal(input);
	            return +this === +input;
	        } else {
	            inputMs = +local__createLocal(input);
	            return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
	        }
	    }
	
	    function diff (input, units, asFloat) {
	        var that = cloneWithOffset(input, this),
	            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4,
	            delta, output;
	
	        units = normalizeUnits(units);
	
	        if (units === 'year' || units === 'month' || units === 'quarter') {
	            output = monthDiff(this, that);
	            if (units === 'quarter') {
	                output = output / 3;
	            } else if (units === 'year') {
	                output = output / 12;
	            }
	        } else {
	            delta = this - that;
	            output = units === 'second' ? delta / 1e3 : // 1000
	                units === 'minute' ? delta / 6e4 : // 1000 * 60
	                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
	                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
	                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
	                delta;
	        }
	        return asFloat ? output : absFloor(output);
	    }
	
	    function monthDiff (a, b) {
	        // difference in months
	        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
	            // b is in (anchor - 1 month, anchor + 1 month)
	            anchor = a.clone().add(wholeMonthDiff, 'months'),
	            anchor2, adjust;
	
	        if (b - anchor < 0) {
	            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
	            // linear across the month
	            adjust = (b - anchor) / (anchor - anchor2);
	        } else {
	            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
	            // linear across the month
	            adjust = (b - anchor) / (anchor2 - anchor);
	        }
	
	        return -(wholeMonthDiff + adjust);
	    }
	
	    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
	
	    function toString () {
	        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
	    }
	
	    function moment_format__toISOString () {
	        var m = this.clone().utc();
	        if (0 < m.year() && m.year() <= 9999) {
	            if ('function' === typeof Date.prototype.toISOString) {
	                // native implementation is ~50x faster, use it when we can
	                return this.toDate().toISOString();
	            } else {
	                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	            }
	        } else {
	            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	        }
	    }
	
	    function format (inputString) {
	        var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
	        return this.localeData().postformat(output);
	    }
	
	    function from (time, withoutSuffix) {
	        if (!this.isValid()) {
	            return this.localeData().invalidDate();
	        }
	        return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
	    }
	
	    function fromNow (withoutSuffix) {
	        return this.from(local__createLocal(), withoutSuffix);
	    }
	
	    function to (time, withoutSuffix) {
	        if (!this.isValid()) {
	            return this.localeData().invalidDate();
	        }
	        return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
	    }
	
	    function toNow (withoutSuffix) {
	        return this.to(local__createLocal(), withoutSuffix);
	    }
	
	    function locale (key) {
	        var newLocaleData;
	
	        if (key === undefined) {
	            return this._locale._abbr;
	        } else {
	            newLocaleData = locale_locales__getLocale(key);
	            if (newLocaleData != null) {
	                this._locale = newLocaleData;
	            }
	            return this;
	        }
	    }
	
	    var lang = deprecate(
	        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
	        function (key) {
	            if (key === undefined) {
	                return this.localeData();
	            } else {
	                return this.locale(key);
	            }
	        }
	    );
	
	    function localeData () {
	        return this._locale;
	    }
	
	    function startOf (units) {
	        units = normalizeUnits(units);
	        // the following switch intentionally omits break keywords
	        // to utilize falling through the cases.
	        switch (units) {
	        case 'year':
	            this.month(0);
	            /* falls through */
	        case 'quarter':
	        case 'month':
	            this.date(1);
	            /* falls through */
	        case 'week':
	        case 'isoWeek':
	        case 'day':
	            this.hours(0);
	            /* falls through */
	        case 'hour':
	            this.minutes(0);
	            /* falls through */
	        case 'minute':
	            this.seconds(0);
	            /* falls through */
	        case 'second':
	            this.milliseconds(0);
	        }
	
	        // weeks are a special case
	        if (units === 'week') {
	            this.weekday(0);
	        }
	        if (units === 'isoWeek') {
	            this.isoWeekday(1);
	        }
	
	        // quarters are also special
	        if (units === 'quarter') {
	            this.month(Math.floor(this.month() / 3) * 3);
	        }
	
	        return this;
	    }
	
	    function endOf (units) {
	        units = normalizeUnits(units);
	        if (units === undefined || units === 'millisecond') {
	            return this;
	        }
	        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
	    }
	
	    function to_type__valueOf () {
	        return +this._d - ((this._offset || 0) * 60000);
	    }
	
	    function unix () {
	        return Math.floor(+this / 1000);
	    }
	
	    function toDate () {
	        return this._offset ? new Date(+this) : this._d;
	    }
	
	    function toArray () {
	        var m = this;
	        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
	    }
	
	    function toObject () {
	        var m = this;
	        return {
	            years: m.year(),
	            months: m.month(),
	            date: m.date(),
	            hours: m.hours(),
	            minutes: m.minutes(),
	            seconds: m.seconds(),
	            milliseconds: m.milliseconds()
	        };
	    }
	
	    function moment_valid__isValid () {
	        return valid__isValid(this);
	    }
	
	    function parsingFlags () {
	        return extend({}, getParsingFlags(this));
	    }
	
	    function invalidAt () {
	        return getParsingFlags(this).overflow;
	    }
	
	    addFormatToken(0, ['gg', 2], 0, function () {
	        return this.weekYear() % 100;
	    });
	
	    addFormatToken(0, ['GG', 2], 0, function () {
	        return this.isoWeekYear() % 100;
	    });
	
	    function addWeekYearFormatToken (token, getter) {
	        addFormatToken(0, [token, token.length], 0, getter);
	    }
	
	    addWeekYearFormatToken('gggg',     'weekYear');
	    addWeekYearFormatToken('ggggg',    'weekYear');
	    addWeekYearFormatToken('GGGG',  'isoWeekYear');
	    addWeekYearFormatToken('GGGGG', 'isoWeekYear');
	
	    // ALIASES
	
	    addUnitAlias('weekYear', 'gg');
	    addUnitAlias('isoWeekYear', 'GG');
	
	    // PARSING
	
	    addRegexToken('G',      matchSigned);
	    addRegexToken('g',      matchSigned);
	    addRegexToken('GG',     match1to2, match2);
	    addRegexToken('gg',     match1to2, match2);
	    addRegexToken('GGGG',   match1to4, match4);
	    addRegexToken('gggg',   match1to4, match4);
	    addRegexToken('GGGGG',  match1to6, match6);
	    addRegexToken('ggggg',  match1to6, match6);
	
	    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
	        week[token.substr(0, 2)] = toInt(input);
	    });
	
	    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
	        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
	    });
	
	    // HELPERS
	
	    function weeksInYear(year, dow, doy) {
	        return weekOfYear(local__createLocal([year, 11, 31 + dow - doy]), dow, doy).week;
	    }
	
	    // MOMENTS
	
	    function getSetWeekYear (input) {
	        var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
	        return input == null ? year : this.add((input - year), 'y');
	    }
	
	    function getSetISOWeekYear (input) {
	        var year = weekOfYear(this, 1, 4).year;
	        return input == null ? year : this.add((input - year), 'y');
	    }
	
	    function getISOWeeksInYear () {
	        return weeksInYear(this.year(), 1, 4);
	    }
	
	    function getWeeksInYear () {
	        var weekInfo = this.localeData()._week;
	        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
	    }
	
	    addFormatToken('Q', 0, 0, 'quarter');
	
	    // ALIASES
	
	    addUnitAlias('quarter', 'Q');
	
	    // PARSING
	
	    addRegexToken('Q', match1);
	    addParseToken('Q', function (input, array) {
	        array[MONTH] = (toInt(input) - 1) * 3;
	    });
	
	    // MOMENTS
	
	    function getSetQuarter (input) {
	        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
	    }
	
	    addFormatToken('D', ['DD', 2], 'Do', 'date');
	
	    // ALIASES
	
	    addUnitAlias('date', 'D');
	
	    // PARSING
	
	    addRegexToken('D',  match1to2);
	    addRegexToken('DD', match1to2, match2);
	    addRegexToken('Do', function (isStrict, locale) {
	        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
	    });
	
	    addParseToken(['D', 'DD'], DATE);
	    addParseToken('Do', function (input, array) {
	        array[DATE] = toInt(input.match(match1to2)[0], 10);
	    });
	
	    // MOMENTS
	
	    var getSetDayOfMonth = makeGetSet('Date', true);
	
	    addFormatToken('d', 0, 'do', 'day');
	
	    addFormatToken('dd', 0, 0, function (format) {
	        return this.localeData().weekdaysMin(this, format);
	    });
	
	    addFormatToken('ddd', 0, 0, function (format) {
	        return this.localeData().weekdaysShort(this, format);
	    });
	
	    addFormatToken('dddd', 0, 0, function (format) {
	        return this.localeData().weekdays(this, format);
	    });
	
	    addFormatToken('e', 0, 0, 'weekday');
	    addFormatToken('E', 0, 0, 'isoWeekday');
	
	    // ALIASES
	
	    addUnitAlias('day', 'd');
	    addUnitAlias('weekday', 'e');
	    addUnitAlias('isoWeekday', 'E');
	
	    // PARSING
	
	    addRegexToken('d',    match1to2);
	    addRegexToken('e',    match1to2);
	    addRegexToken('E',    match1to2);
	    addRegexToken('dd',   matchWord);
	    addRegexToken('ddd',  matchWord);
	    addRegexToken('dddd', matchWord);
	
	    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config) {
	        var weekday = config._locale.weekdaysParse(input);
	        // if we didn't get a weekday name, mark the date as invalid
	        if (weekday != null) {
	            week.d = weekday;
	        } else {
	            getParsingFlags(config).invalidWeekday = input;
	        }
	    });
	
	    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
	        week[token] = toInt(input);
	    });
	
	    // HELPERS
	
	    function parseWeekday(input, locale) {
	        if (typeof input !== 'string') {
	            return input;
	        }
	
	        if (!isNaN(input)) {
	            return parseInt(input, 10);
	        }
	
	        input = locale.weekdaysParse(input);
	        if (typeof input === 'number') {
	            return input;
	        }
	
	        return null;
	    }
	
	    // LOCALES
	
	    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
	    function localeWeekdays (m) {
	        return this._weekdays[m.day()];
	    }
	
	    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
	    function localeWeekdaysShort (m) {
	        return this._weekdaysShort[m.day()];
	    }
	
	    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
	    function localeWeekdaysMin (m) {
	        return this._weekdaysMin[m.day()];
	    }
	
	    function localeWeekdaysParse (weekdayName) {
	        var i, mom, regex;
	
	        this._weekdaysParse = this._weekdaysParse || [];
	
	        for (i = 0; i < 7; i++) {
	            // make the regex if we don't have it already
	            if (!this._weekdaysParse[i]) {
	                mom = local__createLocal([2000, 1]).day(i);
	                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
	                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
	            }
	            // test the regex
	            if (this._weekdaysParse[i].test(weekdayName)) {
	                return i;
	            }
	        }
	    }
	
	    // MOMENTS
	
	    function getSetDayOfWeek (input) {
	        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
	        if (input != null) {
	            input = parseWeekday(input, this.localeData());
	            return this.add(input - day, 'd');
	        } else {
	            return day;
	        }
	    }
	
	    function getSetLocaleDayOfWeek (input) {
	        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
	        return input == null ? weekday : this.add(input - weekday, 'd');
	    }
	
	    function getSetISODayOfWeek (input) {
	        // behaves the same as moment#day except
	        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
	        // as a setter, sunday should belong to the previous week.
	        return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
	    }
	
	    addFormatToken('H', ['HH', 2], 0, 'hour');
	    addFormatToken('h', ['hh', 2], 0, function () {
	        return this.hours() % 12 || 12;
	    });
	
	    function meridiem (token, lowercase) {
	        addFormatToken(token, 0, 0, function () {
	            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
	        });
	    }
	
	    meridiem('a', true);
	    meridiem('A', false);
	
	    // ALIASES
	
	    addUnitAlias('hour', 'h');
	
	    // PARSING
	
	    function matchMeridiem (isStrict, locale) {
	        return locale._meridiemParse;
	    }
	
	    addRegexToken('a',  matchMeridiem);
	    addRegexToken('A',  matchMeridiem);
	    addRegexToken('H',  match1to2);
	    addRegexToken('h',  match1to2);
	    addRegexToken('HH', match1to2, match2);
	    addRegexToken('hh', match1to2, match2);
	
	    addParseToken(['H', 'HH'], HOUR);
	    addParseToken(['a', 'A'], function (input, array, config) {
	        config._isPm = config._locale.isPM(input);
	        config._meridiem = input;
	    });
	    addParseToken(['h', 'hh'], function (input, array, config) {
	        array[HOUR] = toInt(input);
	        getParsingFlags(config).bigHour = true;
	    });
	
	    // LOCALES
	
	    function localeIsPM (input) {
	        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
	        // Using charAt should be more compatible.
	        return ((input + '').toLowerCase().charAt(0) === 'p');
	    }
	
	    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
	    function localeMeridiem (hours, minutes, isLower) {
	        if (hours > 11) {
	            return isLower ? 'pm' : 'PM';
	        } else {
	            return isLower ? 'am' : 'AM';
	        }
	    }
	
	
	    // MOMENTS
	
	    // Setting the hour should keep the time, because the user explicitly
	    // specified which hour he wants. So trying to maintain the same hour (in
	    // a new timezone) makes sense. Adding/subtracting hours does not follow
	    // this rule.
	    var getSetHour = makeGetSet('Hours', true);
	
	    addFormatToken('m', ['mm', 2], 0, 'minute');
	
	    // ALIASES
	
	    addUnitAlias('minute', 'm');
	
	    // PARSING
	
	    addRegexToken('m',  match1to2);
	    addRegexToken('mm', match1to2, match2);
	    addParseToken(['m', 'mm'], MINUTE);
	
	    // MOMENTS
	
	    var getSetMinute = makeGetSet('Minutes', false);
	
	    addFormatToken('s', ['ss', 2], 0, 'second');
	
	    // ALIASES
	
	    addUnitAlias('second', 's');
	
	    // PARSING
	
	    addRegexToken('s',  match1to2);
	    addRegexToken('ss', match1to2, match2);
	    addParseToken(['s', 'ss'], SECOND);
	
	    // MOMENTS
	
	    var getSetSecond = makeGetSet('Seconds', false);
	
	    addFormatToken('S', 0, 0, function () {
	        return ~~(this.millisecond() / 100);
	    });
	
	    addFormatToken(0, ['SS', 2], 0, function () {
	        return ~~(this.millisecond() / 10);
	    });
	
	    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
	    addFormatToken(0, ['SSSS', 4], 0, function () {
	        return this.millisecond() * 10;
	    });
	    addFormatToken(0, ['SSSSS', 5], 0, function () {
	        return this.millisecond() * 100;
	    });
	    addFormatToken(0, ['SSSSSS', 6], 0, function () {
	        return this.millisecond() * 1000;
	    });
	    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
	        return this.millisecond() * 10000;
	    });
	    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
	        return this.millisecond() * 100000;
	    });
	    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
	        return this.millisecond() * 1000000;
	    });
	
	
	    // ALIASES
	
	    addUnitAlias('millisecond', 'ms');
	
	    // PARSING
	
	    addRegexToken('S',    match1to3, match1);
	    addRegexToken('SS',   match1to3, match2);
	    addRegexToken('SSS',  match1to3, match3);
	
	    var token;
	    for (token = 'SSSS'; token.length <= 9; token += 'S') {
	        addRegexToken(token, matchUnsigned);
	    }
	
	    function parseMs(input, array) {
	        array[MILLISECOND] = toInt(('0.' + input) * 1000);
	    }
	
	    for (token = 'S'; token.length <= 9; token += 'S') {
	        addParseToken(token, parseMs);
	    }
	    // MOMENTS
	
	    var getSetMillisecond = makeGetSet('Milliseconds', false);
	
	    addFormatToken('z',  0, 0, 'zoneAbbr');
	    addFormatToken('zz', 0, 0, 'zoneName');
	
	    // MOMENTS
	
	    function getZoneAbbr () {
	        return this._isUTC ? 'UTC' : '';
	    }
	
	    function getZoneName () {
	        return this._isUTC ? 'Coordinated Universal Time' : '';
	    }
	
	    var momentPrototype__proto = Moment.prototype;
	
	    momentPrototype__proto.add          = add_subtract__add;
	    momentPrototype__proto.calendar     = moment_calendar__calendar;
	    momentPrototype__proto.clone        = clone;
	    momentPrototype__proto.diff         = diff;
	    momentPrototype__proto.endOf        = endOf;
	    momentPrototype__proto.format       = format;
	    momentPrototype__proto.from         = from;
	    momentPrototype__proto.fromNow      = fromNow;
	    momentPrototype__proto.to           = to;
	    momentPrototype__proto.toNow        = toNow;
	    momentPrototype__proto.get          = getSet;
	    momentPrototype__proto.invalidAt    = invalidAt;
	    momentPrototype__proto.isAfter      = isAfter;
	    momentPrototype__proto.isBefore     = isBefore;
	    momentPrototype__proto.isBetween    = isBetween;
	    momentPrototype__proto.isSame       = isSame;
	    momentPrototype__proto.isValid      = moment_valid__isValid;
	    momentPrototype__proto.lang         = lang;
	    momentPrototype__proto.locale       = locale;
	    momentPrototype__proto.localeData   = localeData;
	    momentPrototype__proto.max          = prototypeMax;
	    momentPrototype__proto.min          = prototypeMin;
	    momentPrototype__proto.parsingFlags = parsingFlags;
	    momentPrototype__proto.set          = getSet;
	    momentPrototype__proto.startOf      = startOf;
	    momentPrototype__proto.subtract     = add_subtract__subtract;
	    momentPrototype__proto.toArray      = toArray;
	    momentPrototype__proto.toObject     = toObject;
	    momentPrototype__proto.toDate       = toDate;
	    momentPrototype__proto.toISOString  = moment_format__toISOString;
	    momentPrototype__proto.toJSON       = moment_format__toISOString;
	    momentPrototype__proto.toString     = toString;
	    momentPrototype__proto.unix         = unix;
	    momentPrototype__proto.valueOf      = to_type__valueOf;
	
	    // Year
	    momentPrototype__proto.year       = getSetYear;
	    momentPrototype__proto.isLeapYear = getIsLeapYear;
	
	    // Week Year
	    momentPrototype__proto.weekYear    = getSetWeekYear;
	    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;
	
	    // Quarter
	    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;
	
	    // Month
	    momentPrototype__proto.month       = getSetMonth;
	    momentPrototype__proto.daysInMonth = getDaysInMonth;
	
	    // Week
	    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
	    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
	    momentPrototype__proto.weeksInYear    = getWeeksInYear;
	    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;
	
	    // Day
	    momentPrototype__proto.date       = getSetDayOfMonth;
	    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
	    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
	    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
	    momentPrototype__proto.dayOfYear  = getSetDayOfYear;
	
	    // Hour
	    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;
	
	    // Minute
	    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;
	
	    // Second
	    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;
	
	    // Millisecond
	    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;
	
	    // Offset
	    momentPrototype__proto.utcOffset            = getSetOffset;
	    momentPrototype__proto.utc                  = setOffsetToUTC;
	    momentPrototype__proto.local                = setOffsetToLocal;
	    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
	    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
	    momentPrototype__proto.isDST                = isDaylightSavingTime;
	    momentPrototype__proto.isDSTShifted         = isDaylightSavingTimeShifted;
	    momentPrototype__proto.isLocal              = isLocal;
	    momentPrototype__proto.isUtcOffset          = isUtcOffset;
	    momentPrototype__proto.isUtc                = isUtc;
	    momentPrototype__proto.isUTC                = isUtc;
	
	    // Timezone
	    momentPrototype__proto.zoneAbbr = getZoneAbbr;
	    momentPrototype__proto.zoneName = getZoneName;
	
	    // Deprecations
	    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
	    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
	    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
	    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);
	
	    var momentPrototype = momentPrototype__proto;
	
	    function moment__createUnix (input) {
	        return local__createLocal(input * 1000);
	    }
	
	    function moment__createInZone () {
	        return local__createLocal.apply(null, arguments).parseZone();
	    }
	
	    var defaultCalendar = {
	        sameDay : '[Today at] LT',
	        nextDay : '[Tomorrow at] LT',
	        nextWeek : 'dddd [at] LT',
	        lastDay : '[Yesterday at] LT',
	        lastWeek : '[Last] dddd [at] LT',
	        sameElse : 'L'
	    };
	
	    function locale_calendar__calendar (key, mom, now) {
	        var output = this._calendar[key];
	        return typeof output === 'function' ? output.call(mom, now) : output;
	    }
	
	    var defaultLongDateFormat = {
	        LTS  : 'h:mm:ss A',
	        LT   : 'h:mm A',
	        L    : 'MM/DD/YYYY',
	        LL   : 'MMMM D, YYYY',
	        LLL  : 'MMMM D, YYYY h:mm A',
	        LLLL : 'dddd, MMMM D, YYYY h:mm A'
	    };
	
	    function longDateFormat (key) {
	        var format = this._longDateFormat[key],
	            formatUpper = this._longDateFormat[key.toUpperCase()];
	
	        if (format || !formatUpper) {
	            return format;
	        }
	
	        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
	            return val.slice(1);
	        });
	
	        return this._longDateFormat[key];
	    }
	
	    var defaultInvalidDate = 'Invalid date';
	
	    function invalidDate () {
	        return this._invalidDate;
	    }
	
	    var defaultOrdinal = '%d';
	    var defaultOrdinalParse = /\d{1,2}/;
	
	    function ordinal (number) {
	        return this._ordinal.replace('%d', number);
	    }
	
	    function preParsePostFormat (string) {
	        return string;
	    }
	
	    var defaultRelativeTime = {
	        future : 'in %s',
	        past   : '%s ago',
	        s  : 'a few seconds',
	        m  : 'a minute',
	        mm : '%d minutes',
	        h  : 'an hour',
	        hh : '%d hours',
	        d  : 'a day',
	        dd : '%d days',
	        M  : 'a month',
	        MM : '%d months',
	        y  : 'a year',
	        yy : '%d years'
	    };
	
	    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
	        var output = this._relativeTime[string];
	        return (typeof output === 'function') ?
	            output(number, withoutSuffix, string, isFuture) :
	            output.replace(/%d/i, number);
	    }
	
	    function pastFuture (diff, output) {
	        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
	        return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
	    }
	
	    function locale_set__set (config) {
	        var prop, i;
	        for (i in config) {
	            prop = config[i];
	            if (typeof prop === 'function') {
	                this[i] = prop;
	            } else {
	                this['_' + i] = prop;
	            }
	        }
	        // Lenient ordinal parsing accepts just a number in addition to
	        // number + (possibly) stuff coming from _ordinalParseLenient.
	        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
	    }
	
	    var prototype__proto = Locale.prototype;
	
	    prototype__proto._calendar       = defaultCalendar;
	    prototype__proto.calendar        = locale_calendar__calendar;
	    prototype__proto._longDateFormat = defaultLongDateFormat;
	    prototype__proto.longDateFormat  = longDateFormat;
	    prototype__proto._invalidDate    = defaultInvalidDate;
	    prototype__proto.invalidDate     = invalidDate;
	    prototype__proto._ordinal        = defaultOrdinal;
	    prototype__proto.ordinal         = ordinal;
	    prototype__proto._ordinalParse   = defaultOrdinalParse;
	    prototype__proto.preparse        = preParsePostFormat;
	    prototype__proto.postformat      = preParsePostFormat;
	    prototype__proto._relativeTime   = defaultRelativeTime;
	    prototype__proto.relativeTime    = relative__relativeTime;
	    prototype__proto.pastFuture      = pastFuture;
	    prototype__proto.set             = locale_set__set;
	
	    // Month
	    prototype__proto.months       =        localeMonths;
	    prototype__proto._months      = defaultLocaleMonths;
	    prototype__proto.monthsShort  =        localeMonthsShort;
	    prototype__proto._monthsShort = defaultLocaleMonthsShort;
	    prototype__proto.monthsParse  =        localeMonthsParse;
	
	    // Week
	    prototype__proto.week = localeWeek;
	    prototype__proto._week = defaultLocaleWeek;
	    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
	    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;
	
	    // Day of Week
	    prototype__proto.weekdays       =        localeWeekdays;
	    prototype__proto._weekdays      = defaultLocaleWeekdays;
	    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
	    prototype__proto._weekdaysMin   = defaultLocaleWeekdaysMin;
	    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
	    prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
	    prototype__proto.weekdaysParse  =        localeWeekdaysParse;
	
	    // Hours
	    prototype__proto.isPM = localeIsPM;
	    prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
	    prototype__proto.meridiem = localeMeridiem;
	
	    function lists__get (format, index, field, setter) {
	        var locale = locale_locales__getLocale();
	        var utc = create_utc__createUTC().set(setter, index);
	        return locale[field](utc, format);
	    }
	
	    function list (format, index, field, count, setter) {
	        if (typeof format === 'number') {
	            index = format;
	            format = undefined;
	        }
	
	        format = format || '';
	
	        if (index != null) {
	            return lists__get(format, index, field, setter);
	        }
	
	        var i;
	        var out = [];
	        for (i = 0; i < count; i++) {
	            out[i] = lists__get(format, i, field, setter);
	        }
	        return out;
	    }
	
	    function lists__listMonths (format, index) {
	        return list(format, index, 'months', 12, 'month');
	    }
	
	    function lists__listMonthsShort (format, index) {
	        return list(format, index, 'monthsShort', 12, 'month');
	    }
	
	    function lists__listWeekdays (format, index) {
	        return list(format, index, 'weekdays', 7, 'day');
	    }
	
	    function lists__listWeekdaysShort (format, index) {
	        return list(format, index, 'weekdaysShort', 7, 'day');
	    }
	
	    function lists__listWeekdaysMin (format, index) {
	        return list(format, index, 'weekdaysMin', 7, 'day');
	    }
	
	    locale_locales__getSetGlobalLocale('en', {
	        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (toInt(number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        }
	    });
	
	    // Side effect imports
	    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
	    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);
	
	    var mathAbs = Math.abs;
	
	    function duration_abs__abs () {
	        var data           = this._data;
	
	        this._milliseconds = mathAbs(this._milliseconds);
	        this._days         = mathAbs(this._days);
	        this._months       = mathAbs(this._months);
	
	        data.milliseconds  = mathAbs(data.milliseconds);
	        data.seconds       = mathAbs(data.seconds);
	        data.minutes       = mathAbs(data.minutes);
	        data.hours         = mathAbs(data.hours);
	        data.months        = mathAbs(data.months);
	        data.years         = mathAbs(data.years);
	
	        return this;
	    }
	
	    function duration_add_subtract__addSubtract (duration, input, value, direction) {
	        var other = create__createDuration(input, value);
	
	        duration._milliseconds += direction * other._milliseconds;
	        duration._days         += direction * other._days;
	        duration._months       += direction * other._months;
	
	        return duration._bubble();
	    }
	
	    // supports only 2.0-style add(1, 's') or add(duration)
	    function duration_add_subtract__add (input, value) {
	        return duration_add_subtract__addSubtract(this, input, value, 1);
	    }
	
	    // supports only 2.0-style subtract(1, 's') or subtract(duration)
	    function duration_add_subtract__subtract (input, value) {
	        return duration_add_subtract__addSubtract(this, input, value, -1);
	    }
	
	    function absCeil (number) {
	        if (number < 0) {
	            return Math.floor(number);
	        } else {
	            return Math.ceil(number);
	        }
	    }
	
	    function bubble () {
	        var milliseconds = this._milliseconds;
	        var days         = this._days;
	        var months       = this._months;
	        var data         = this._data;
	        var seconds, minutes, hours, years, monthsFromDays;
	
	        // if we have a mix of positive and negative values, bubble down first
	        // check: https://github.com/moment/moment/issues/2166
	        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
	                (milliseconds <= 0 && days <= 0 && months <= 0))) {
	            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
	            days = 0;
	            months = 0;
	        }
	
	        // The following code bubbles up values, see the tests for
	        // examples of what that means.
	        data.milliseconds = milliseconds % 1000;
	
	        seconds           = absFloor(milliseconds / 1000);
	        data.seconds      = seconds % 60;
	
	        minutes           = absFloor(seconds / 60);
	        data.minutes      = minutes % 60;
	
	        hours             = absFloor(minutes / 60);
	        data.hours        = hours % 24;
	
	        days += absFloor(hours / 24);
	
	        // convert days to months
	        monthsFromDays = absFloor(daysToMonths(days));
	        months += monthsFromDays;
	        days -= absCeil(monthsToDays(monthsFromDays));
	
	        // 12 months -> 1 year
	        years = absFloor(months / 12);
	        months %= 12;
	
	        data.days   = days;
	        data.months = months;
	        data.years  = years;
	
	        return this;
	    }
	
	    function daysToMonths (days) {
	        // 400 years have 146097 days (taking into account leap year rules)
	        // 400 years have 12 months === 4800
	        return days * 4800 / 146097;
	    }
	
	    function monthsToDays (months) {
	        // the reverse of daysToMonths
	        return months * 146097 / 4800;
	    }
	
	    function as (units) {
	        var days;
	        var months;
	        var milliseconds = this._milliseconds;
	
	        units = normalizeUnits(units);
	
	        if (units === 'month' || units === 'year') {
	            days   = this._days   + milliseconds / 864e5;
	            months = this._months + daysToMonths(days);
	            return units === 'month' ? months : months / 12;
	        } else {
	            // handle milliseconds separately because of floating point math errors (issue #1867)
	            days = this._days + Math.round(monthsToDays(this._months));
	            switch (units) {
	                case 'week'   : return days / 7     + milliseconds / 6048e5;
	                case 'day'    : return days         + milliseconds / 864e5;
	                case 'hour'   : return days * 24    + milliseconds / 36e5;
	                case 'minute' : return days * 1440  + milliseconds / 6e4;
	                case 'second' : return days * 86400 + milliseconds / 1000;
	                // Math.floor prevents floating point math errors here
	                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
	                default: throw new Error('Unknown unit ' + units);
	            }
	        }
	    }
	
	    // TODO: Use this.as('ms')?
	    function duration_as__valueOf () {
	        return (
	            this._milliseconds +
	            this._days * 864e5 +
	            (this._months % 12) * 2592e6 +
	            toInt(this._months / 12) * 31536e6
	        );
	    }
	
	    function makeAs (alias) {
	        return function () {
	            return this.as(alias);
	        };
	    }
	
	    var asMilliseconds = makeAs('ms');
	    var asSeconds      = makeAs('s');
	    var asMinutes      = makeAs('m');
	    var asHours        = makeAs('h');
	    var asDays         = makeAs('d');
	    var asWeeks        = makeAs('w');
	    var asMonths       = makeAs('M');
	    var asYears        = makeAs('y');
	
	    function duration_get__get (units) {
	        units = normalizeUnits(units);
	        return this[units + 's']();
	    }
	
	    function makeGetter(name) {
	        return function () {
	            return this._data[name];
	        };
	    }
	
	    var milliseconds = makeGetter('milliseconds');
	    var seconds      = makeGetter('seconds');
	    var minutes      = makeGetter('minutes');
	    var hours        = makeGetter('hours');
	    var days         = makeGetter('days');
	    var months       = makeGetter('months');
	    var years        = makeGetter('years');
	
	    function weeks () {
	        return absFloor(this.days() / 7);
	    }
	
	    var round = Math.round;
	    var thresholds = {
	        s: 45,  // seconds to minute
	        m: 45,  // minutes to hour
	        h: 22,  // hours to day
	        d: 26,  // days to month
	        M: 11   // months to year
	    };
	
	    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
	    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
	        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
	    }
	
	    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
	        var duration = create__createDuration(posNegDuration).abs();
	        var seconds  = round(duration.as('s'));
	        var minutes  = round(duration.as('m'));
	        var hours    = round(duration.as('h'));
	        var days     = round(duration.as('d'));
	        var months   = round(duration.as('M'));
	        var years    = round(duration.as('y'));
	
	        var a = seconds < thresholds.s && ['s', seconds]  ||
	                minutes === 1          && ['m']           ||
	                minutes < thresholds.m && ['mm', minutes] ||
	                hours   === 1          && ['h']           ||
	                hours   < thresholds.h && ['hh', hours]   ||
	                days    === 1          && ['d']           ||
	                days    < thresholds.d && ['dd', days]    ||
	                months  === 1          && ['M']           ||
	                months  < thresholds.M && ['MM', months]  ||
	                years   === 1          && ['y']           || ['yy', years];
	
	        a[2] = withoutSuffix;
	        a[3] = +posNegDuration > 0;
	        a[4] = locale;
	        return substituteTimeAgo.apply(null, a);
	    }
	
	    // This function allows you to set a threshold for relative time strings
	    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
	        if (thresholds[threshold] === undefined) {
	            return false;
	        }
	        if (limit === undefined) {
	            return thresholds[threshold];
	        }
	        thresholds[threshold] = limit;
	        return true;
	    }
	
	    function humanize (withSuffix) {
	        var locale = this.localeData();
	        var output = duration_humanize__relativeTime(this, !withSuffix, locale);
	
	        if (withSuffix) {
	            output = locale.pastFuture(+this, output);
	        }
	
	        return locale.postformat(output);
	    }
	
	    var iso_string__abs = Math.abs;
	
	    function iso_string__toISOString() {
	        // for ISO strings we do not use the normal bubbling rules:
	        //  * milliseconds bubble up until they become hours
	        //  * days do not bubble at all
	        //  * months bubble up until they become years
	        // This is because there is no context-free conversion between hours and days
	        // (think of clock changes)
	        // and also not between days and months (28-31 days per month)
	        var seconds = iso_string__abs(this._milliseconds) / 1000;
	        var days         = iso_string__abs(this._days);
	        var months       = iso_string__abs(this._months);
	        var minutes, hours, years;
	
	        // 3600 seconds -> 60 minutes -> 1 hour
	        minutes           = absFloor(seconds / 60);
	        hours             = absFloor(minutes / 60);
	        seconds %= 60;
	        minutes %= 60;
	
	        // 12 months -> 1 year
	        years  = absFloor(months / 12);
	        months %= 12;
	
	
	        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
	        var Y = years;
	        var M = months;
	        var D = days;
	        var h = hours;
	        var m = minutes;
	        var s = seconds;
	        var total = this.asSeconds();
	
	        if (!total) {
	            // this is the same as C#'s (Noda) and python (isodate)...
	            // but not other JS (goog.date)
	            return 'P0D';
	        }
	
	        return (total < 0 ? '-' : '') +
	            'P' +
	            (Y ? Y + 'Y' : '') +
	            (M ? M + 'M' : '') +
	            (D ? D + 'D' : '') +
	            ((h || m || s) ? 'T' : '') +
	            (h ? h + 'H' : '') +
	            (m ? m + 'M' : '') +
	            (s ? s + 'S' : '');
	    }
	
	    var duration_prototype__proto = Duration.prototype;
	
	    duration_prototype__proto.abs            = duration_abs__abs;
	    duration_prototype__proto.add            = duration_add_subtract__add;
	    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
	    duration_prototype__proto.as             = as;
	    duration_prototype__proto.asMilliseconds = asMilliseconds;
	    duration_prototype__proto.asSeconds      = asSeconds;
	    duration_prototype__proto.asMinutes      = asMinutes;
	    duration_prototype__proto.asHours        = asHours;
	    duration_prototype__proto.asDays         = asDays;
	    duration_prototype__proto.asWeeks        = asWeeks;
	    duration_prototype__proto.asMonths       = asMonths;
	    duration_prototype__proto.asYears        = asYears;
	    duration_prototype__proto.valueOf        = duration_as__valueOf;
	    duration_prototype__proto._bubble        = bubble;
	    duration_prototype__proto.get            = duration_get__get;
	    duration_prototype__proto.milliseconds   = milliseconds;
	    duration_prototype__proto.seconds        = seconds;
	    duration_prototype__proto.minutes        = minutes;
	    duration_prototype__proto.hours          = hours;
	    duration_prototype__proto.days           = days;
	    duration_prototype__proto.weeks          = weeks;
	    duration_prototype__proto.months         = months;
	    duration_prototype__proto.years          = years;
	    duration_prototype__proto.humanize       = humanize;
	    duration_prototype__proto.toISOString    = iso_string__toISOString;
	    duration_prototype__proto.toString       = iso_string__toISOString;
	    duration_prototype__proto.toJSON         = iso_string__toISOString;
	    duration_prototype__proto.locale         = locale;
	    duration_prototype__proto.localeData     = localeData;
	
	    // Deprecations
	    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
	    duration_prototype__proto.lang = lang;
	
	    // Side effect imports
	
	    addFormatToken('X', 0, 0, 'unix');
	    addFormatToken('x', 0, 0, 'valueOf');
	
	    // PARSING
	
	    addRegexToken('x', matchSigned);
	    addRegexToken('X', matchTimestamp);
	    addParseToken('X', function (input, array, config) {
	        config._d = new Date(parseFloat(input, 10) * 1000);
	    });
	    addParseToken('x', function (input, array, config) {
	        config._d = new Date(toInt(input));
	    });
	
	    // Side effect imports
	
	
	    utils_hooks__hooks.version = '2.10.6';
	
	    setHookCallback(local__createLocal);
	
	    utils_hooks__hooks.fn                    = momentPrototype;
	    utils_hooks__hooks.min                   = min;
	    utils_hooks__hooks.max                   = max;
	    utils_hooks__hooks.utc                   = create_utc__createUTC;
	    utils_hooks__hooks.unix                  = moment__createUnix;
	    utils_hooks__hooks.months                = lists__listMonths;
	    utils_hooks__hooks.isDate                = isDate;
	    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
	    utils_hooks__hooks.invalid               = valid__createInvalid;
	    utils_hooks__hooks.duration              = create__createDuration;
	    utils_hooks__hooks.isMoment              = isMoment;
	    utils_hooks__hooks.weekdays              = lists__listWeekdays;
	    utils_hooks__hooks.parseZone             = moment__createInZone;
	    utils_hooks__hooks.localeData            = locale_locales__getLocale;
	    utils_hooks__hooks.isDuration            = isDuration;
	    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
	    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
	    utils_hooks__hooks.defineLocale          = defineLocale;
	    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
	    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
	    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;
	
	    var _moment = utils_hooks__hooks;
	
	    return _moment;
	
	}));
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)(module)))

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./af": 13,
		"./af.js": 13,
		"./ar": 14,
		"./ar-ma": 15,
		"./ar-ma.js": 15,
		"./ar-sa": 16,
		"./ar-sa.js": 16,
		"./ar-tn": 17,
		"./ar-tn.js": 17,
		"./ar.js": 14,
		"./az": 18,
		"./az.js": 18,
		"./be": 19,
		"./be.js": 19,
		"./bg": 20,
		"./bg.js": 20,
		"./bn": 21,
		"./bn.js": 21,
		"./bo": 22,
		"./bo.js": 22,
		"./br": 23,
		"./br.js": 23,
		"./bs": 24,
		"./bs.js": 24,
		"./ca": 25,
		"./ca.js": 25,
		"./cs": 26,
		"./cs.js": 26,
		"./cv": 27,
		"./cv.js": 27,
		"./cy": 28,
		"./cy.js": 28,
		"./da": 29,
		"./da.js": 29,
		"./de": 30,
		"./de-at": 31,
		"./de-at.js": 31,
		"./de.js": 30,
		"./el": 32,
		"./el.js": 32,
		"./en-au": 33,
		"./en-au.js": 33,
		"./en-ca": 34,
		"./en-ca.js": 34,
		"./en-gb": 35,
		"./en-gb.js": 35,
		"./eo": 36,
		"./eo.js": 36,
		"./es": 37,
		"./es.js": 37,
		"./et": 38,
		"./et.js": 38,
		"./eu": 39,
		"./eu.js": 39,
		"./fa": 40,
		"./fa.js": 40,
		"./fi": 41,
		"./fi.js": 41,
		"./fo": 42,
		"./fo.js": 42,
		"./fr": 43,
		"./fr-ca": 44,
		"./fr-ca.js": 44,
		"./fr.js": 43,
		"./fy": 45,
		"./fy.js": 45,
		"./gl": 46,
		"./gl.js": 46,
		"./he": 47,
		"./he.js": 47,
		"./hi": 48,
		"./hi.js": 48,
		"./hr": 49,
		"./hr.js": 49,
		"./hu": 50,
		"./hu.js": 50,
		"./hy-am": 51,
		"./hy-am.js": 51,
		"./id": 52,
		"./id.js": 52,
		"./is": 53,
		"./is.js": 53,
		"./it": 54,
		"./it.js": 54,
		"./ja": 55,
		"./ja.js": 55,
		"./jv": 56,
		"./jv.js": 56,
		"./ka": 57,
		"./ka.js": 57,
		"./km": 58,
		"./km.js": 58,
		"./ko": 59,
		"./ko.js": 59,
		"./lb": 60,
		"./lb.js": 60,
		"./lt": 61,
		"./lt.js": 61,
		"./lv": 62,
		"./lv.js": 62,
		"./me": 63,
		"./me.js": 63,
		"./mk": 64,
		"./mk.js": 64,
		"./ml": 65,
		"./ml.js": 65,
		"./mr": 66,
		"./mr.js": 66,
		"./ms": 67,
		"./ms-my": 68,
		"./ms-my.js": 68,
		"./ms.js": 67,
		"./my": 69,
		"./my.js": 69,
		"./nb": 70,
		"./nb.js": 70,
		"./ne": 71,
		"./ne.js": 71,
		"./nl": 72,
		"./nl.js": 72,
		"./nn": 73,
		"./nn.js": 73,
		"./pl": 74,
		"./pl.js": 74,
		"./pt": 75,
		"./pt-br": 76,
		"./pt-br.js": 76,
		"./pt.js": 75,
		"./ro": 77,
		"./ro.js": 77,
		"./ru": 78,
		"./ru.js": 78,
		"./si": 79,
		"./si.js": 79,
		"./sk": 80,
		"./sk.js": 80,
		"./sl": 81,
		"./sl.js": 81,
		"./sq": 82,
		"./sq.js": 82,
		"./sr": 83,
		"./sr-cyrl": 84,
		"./sr-cyrl.js": 84,
		"./sr.js": 83,
		"./sv": 85,
		"./sv.js": 85,
		"./ta": 86,
		"./ta.js": 86,
		"./th": 87,
		"./th.js": 87,
		"./tl-ph": 88,
		"./tl-ph.js": 88,
		"./tr": 89,
		"./tr.js": 89,
		"./tzl": 90,
		"./tzl.js": 90,
		"./tzm": 91,
		"./tzm-latn": 92,
		"./tzm-latn.js": 92,
		"./tzm.js": 91,
		"./uk": 93,
		"./uk.js": 93,
		"./uz": 94,
		"./uz.js": 94,
		"./vi": 95,
		"./vi.js": 95,
		"./zh-cn": 96,
		"./zh-cn.js": 96,
		"./zh-tw": 97,
		"./zh-tw.js": 97
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 12;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : afrikaans (af)
	//! author : Werner Mollentze : https://github.com/wernerm
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var af = moment.defineLocale('af', {
	        months : 'Januarie_Februarie_Maart_April_Mei_Junie_Julie_Augustus_September_Oktober_November_Desember'.split('_'),
	        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Aug_Sep_Okt_Nov_Des'.split('_'),
	        weekdays : 'Sondag_Maandag_Dinsdag_Woensdag_Donderdag_Vrydag_Saterdag'.split('_'),
	        weekdaysShort : 'Son_Maa_Din_Woe_Don_Vry_Sat'.split('_'),
	        weekdaysMin : 'So_Ma_Di_Wo_Do_Vr_Sa'.split('_'),
	        meridiemParse: /vm|nm/i,
	        isPM : function (input) {
	            return /^nm$/i.test(input);
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 12) {
	                return isLower ? 'vm' : 'VM';
	            } else {
	                return isLower ? 'nm' : 'NM';
	            }
	        },
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd, D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay : '[Vandag om] LT',
	            nextDay : '[M??re om] LT',
	            nextWeek : 'dddd [om] LT',
	            lastDay : '[Gister om] LT',
	            lastWeek : '[Laas] dddd [om] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'oor %s',
	            past : '%s gelede',
	            s : '\'n paar sekondes',
	            m : '\'n minuut',
	            mm : '%d minute',
	            h : '\'n uur',
	            hh : '%d ure',
	            d : '\'n dag',
	            dd : '%d dae',
	            M : '\'n maand',
	            MM : '%d maande',
	            y : '\'n jaar',
	            yy : '%d jaar'
	        },
	        ordinalParse: /\d{1,2}(ste|de)/,
	        ordinal : function (number) {
	            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de'); // Thanks to Joris R??ling : https://github.com/jjupiter
	        },
	        week : {
	            dow : 1, // Maandag is die eerste dag van die week.
	            doy : 4  // Die week wat die 4de Januarie bevat is die eerste week van die jaar.
	        }
	    });
	
	    return af;
	
	}));

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! Locale: Arabic (ar)
	//! Author: Abdel Said: https://github.com/abdelsaid
	//! Changes in months, weekdays: Ahmed Elkhatib
	//! Native plural forms: forabi https://github.com/forabi
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '??',
	        '2': '??',
	        '3': '??',
	        '4': '??',
	        '5': '??',
	        '6': '??',
	        '7': '??',
	        '8': '??',
	        '9': '??',
	        '0': '??'
	    }, numberMap = {
	        '??': '1',
	        '??': '2',
	        '??': '3',
	        '??': '4',
	        '??': '5',
	        '??': '6',
	        '??': '7',
	        '??': '8',
	        '??': '9',
	        '??': '0'
	    }, pluralForm = function (n) {
	        return n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
	    }, plurals = {
	        s : ['?????? ???? ??????????', '?????????? ??????????', ['??????????????', '??????????????'], '%d ????????', '%d ??????????', '%d ??????????'],
	        m : ['?????? ???? ??????????', '?????????? ??????????', ['??????????????', '??????????????'], '%d ??????????', '%d ??????????', '%d ??????????'],
	        h : ['?????? ???? ????????', '???????? ??????????', ['????????????', '????????????'], '%d ??????????', '%d ????????', '%d ????????'],
	        d : ['?????? ???? ??????', '?????? ????????', ['??????????', '??????????'], '%d ????????', '%d ??????????', '%d ??????'],
	        M : ['?????? ???? ??????', '?????? ????????', ['??????????', '??????????'], '%d ????????', '%d ????????', '%d ??????'],
	        y : ['?????? ???? ??????', '?????? ????????', ['??????????', '??????????'], '%d ??????????', '%d ??????????', '%d ??????']
	    }, pluralize = function (u) {
	        return function (number, withoutSuffix, string, isFuture) {
	            var f = pluralForm(number),
	                str = plurals[u][pluralForm(number)];
	            if (f === 2) {
	                str = str[withoutSuffix ? 0 : 1];
	            }
	            return str.replace(/%d/i, number);
	        };
	    }, months = [
	        '?????????? ???????????? ??????????',
	        '???????? ????????????',
	        '???????? ????????',
	        '?????????? ??????????',
	        '???????? ????????',
	        '???????????? ??????????',
	        '???????? ??????????',
	        '???? ??????????',
	        '?????????? ????????????',
	        '?????????? ?????????? ????????????',
	        '?????????? ???????????? ????????????',
	        '?????????? ?????????? ????????????'
	    ];
	
	    var ar = moment.defineLocale('ar', {
	        months : months,
	        monthsShort : months,
	        weekdays : '??????????_??????????????_????????????????_????????????????_????????????_????????????_??????????'.split('_'),
	        weekdaysShort : '??????_??????????_????????????_????????????_????????_????????_??????'.split('_'),
	        weekdaysMin : '??_??_??_??_??_??_??'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'D/\u200FM/\u200FYYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd D MMMM YYYY HH:mm'
	        },
	        meridiemParse: /??|??/,
	        isPM : function (input) {
	            return '??' === input;
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return '??';
	            } else {
	                return '??';
	            }
	        },
	        calendar : {
	            sameDay: '[?????????? ?????? ????????????] LT',
	            nextDay: '[???????? ?????? ????????????] LT',
	            nextWeek: 'dddd [?????? ????????????] LT',
	            lastDay: '[?????? ?????? ????????????] LT',
	            lastWeek: 'dddd [?????? ????????????] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : '?????? %s',
	            past : '?????? %s',
	            s : pluralize('s'),
	            m : pluralize('m'),
	            mm : pluralize('m'),
	            h : pluralize('h'),
	            hh : pluralize('h'),
	            d : pluralize('d'),
	            dd : pluralize('d'),
	            M : pluralize('M'),
	            MM : pluralize('M'),
	            y : pluralize('y'),
	            yy : pluralize('y')
	        },
	        preparse: function (string) {
	            return string.replace(/\u200f/g, '').replace(/[????????????????????]/g, function (match) {
	                return numberMap[match];
	            }).replace(/??/g, ',');
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            }).replace(/,/g, '??');
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ar;
	
	}));

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Moroccan Arabic (ar-ma)
	//! author : ElFadili Yassine : https://github.com/ElFadiliY
	//! author : Abdel Said : https://github.com/abdelsaid
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ar_ma = moment.defineLocale('ar-ma', {
	        months : '??????????_????????????_????????_??????????_??????_??????????_????????????_??????_??????????_????????????_??????????_??????????'.split('_'),
	        monthsShort : '??????????_????????????_????????_??????????_??????_??????????_????????????_??????_??????????_????????????_??????????_??????????'.split('_'),
	        weekdays : '??????????_??????????????_????????????????_????????????????_????????????_????????????_??????????'.split('_'),
	        weekdaysShort : '??????_??????????_????????????_????????????_????????_????????_??????'.split('_'),
	        weekdaysMin : '??_??_??_??_??_??_??'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[?????????? ?????? ????????????] LT',
	            nextDay: '[?????? ?????? ????????????] LT',
	            nextWeek: 'dddd [?????? ????????????] LT',
	            lastDay: '[?????? ?????? ????????????] LT',
	            lastWeek: 'dddd [?????? ????????????] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : '???? %s',
	            past : '?????? %s',
	            s : '????????',
	            m : '??????????',
	            mm : '%d ??????????',
	            h : '????????',
	            hh : '%d ??????????',
	            d : '??????',
	            dd : '%d ????????',
	            M : '??????',
	            MM : '%d ????????',
	            y : '??????',
	            yy : '%d ??????????'
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ar_ma;
	
	}));

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Arabic Saudi Arabia (ar-sa)
	//! author : Suhail Alkowaileet : https://github.com/xsoh
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '??',
	        '2': '??',
	        '3': '??',
	        '4': '??',
	        '5': '??',
	        '6': '??',
	        '7': '??',
	        '8': '??',
	        '9': '??',
	        '0': '??'
	    }, numberMap = {
	        '??': '1',
	        '??': '2',
	        '??': '3',
	        '??': '4',
	        '??': '5',
	        '??': '6',
	        '??': '7',
	        '??': '8',
	        '??': '9',
	        '??': '0'
	    };
	
	    var ar_sa = moment.defineLocale('ar-sa', {
	        months : '??????????_????????????_????????_??????????_????????_??????????_??????????_??????????_????????????_????????????_????????????_????????????'.split('_'),
	        monthsShort : '??????????_????????????_????????_??????????_????????_??????????_??????????_??????????_????????????_????????????_????????????_????????????'.split('_'),
	        weekdays : '??????????_??????????????_????????????????_????????????????_????????????_????????????_??????????'.split('_'),
	        weekdaysShort : '??????_??????????_????????????_????????????_????????_????????_??????'.split('_'),
	        weekdaysMin : '??_??_??_??_??_??_??'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd D MMMM YYYY HH:mm'
	        },
	        meridiemParse: /??|??/,
	        isPM : function (input) {
	            return '??' === input;
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return '??';
	            } else {
	                return '??';
	            }
	        },
	        calendar : {
	            sameDay: '[?????????? ?????? ????????????] LT',
	            nextDay: '[?????? ?????? ????????????] LT',
	            nextWeek: 'dddd [?????? ????????????] LT',
	            lastDay: '[?????? ?????? ????????????] LT',
	            lastWeek: 'dddd [?????? ????????????] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : '???? %s',
	            past : '?????? %s',
	            s : '????????',
	            m : '??????????',
	            mm : '%d ??????????',
	            h : '????????',
	            hh : '%d ??????????',
	            d : '??????',
	            dd : '%d ????????',
	            M : '??????',
	            MM : '%d ????????',
	            y : '??????',
	            yy : '%d ??????????'
	        },
	        preparse: function (string) {
	            return string.replace(/[????????????????????]/g, function (match) {
	                return numberMap[match];
	            }).replace(/??/g, ',');
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            }).replace(/,/g, '??');
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ar_sa;
	
	}));

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale  : Tunisian Arabic (ar-tn)
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ar_tn = moment.defineLocale('ar-tn', {
	        months: '??????????_??????????_????????_??????????_??????_????????_????????????_??????_????????????_????????????_????????????_????????????'.split('_'),
	        monthsShort: '??????????_??????????_????????_??????????_??????_????????_????????????_??????_????????????_????????????_????????????_????????????'.split('_'),
	        weekdays: '??????????_??????????????_????????????????_????????????????_????????????_????????????_??????????'.split('_'),
	        weekdaysShort: '??????_??????????_????????????_????????????_????????_????????_??????'.split('_'),
	        weekdaysMin: '??_??_??_??_??_??_??'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY HH:mm',
	            LLLL: 'dddd D MMMM YYYY HH:mm'
	        },
	        calendar: {
	            sameDay: '[?????????? ?????? ????????????] LT',
	            nextDay: '[?????? ?????? ????????????] LT',
	            nextWeek: 'dddd [?????? ????????????] LT',
	            lastDay: '[?????? ?????? ????????????] LT',
	            lastWeek: 'dddd [?????? ????????????] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '???? %s',
	            past: '?????? %s',
	            s: '????????',
	            m: '??????????',
	            mm: '%d ??????????',
	            h: '????????',
	            hh: '%d ??????????',
	            d: '??????',
	            dd: '%d ????????',
	            M: '??????',
	            MM: '%d ????????',
	            y: '??????',
	            yy: '%d ??????????'
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return ar_tn;
	
	}));

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : azerbaijani (az)
	//! author : topchiyev : https://github.com/topchiyev
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var suffixes = {
	        1: '-inci',
	        5: '-inci',
	        8: '-inci',
	        70: '-inci',
	        80: '-inci',
	        2: '-nci',
	        7: '-nci',
	        20: '-nci',
	        50: '-nci',
	        3: '-??nc??',
	        4: '-??nc??',
	        100: '-??nc??',
	        6: '-nc??',
	        9: '-uncu',
	        10: '-uncu',
	        30: '-uncu',
	        60: '-??nc??',
	        90: '-??nc??'
	    };
	
	    var az = moment.defineLocale('az', {
	        months : 'yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr'.split('_'),
	        monthsShort : 'yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek'.split('_'),
	        weekdays : 'Bazar_Bazar ert??si_????r????nb?? ax??am??_????r????nb??_C??m?? ax??am??_C??m??_????nb??'.split('_'),
	        weekdaysShort : 'Baz_BzE_??Ax_????r_CAx_C??m_????n'.split('_'),
	        weekdaysMin : 'Bz_BE_??A_????_CA_C??_????'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd, D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay : '[bug??n saat] LT',
	            nextDay : '[sabah saat] LT',
	            nextWeek : '[g??l??n h??ft??] dddd [saat] LT',
	            lastDay : '[d??n??n] LT',
	            lastWeek : '[ke????n h??ft??] dddd [saat] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s sonra',
	            past : '%s ??vv??l',
	            s : 'birne???? saniyy??',
	            m : 'bir d??qiq??',
	            mm : '%d d??qiq??',
	            h : 'bir saat',
	            hh : '%d saat',
	            d : 'bir g??n',
	            dd : '%d g??n',
	            M : 'bir ay',
	            MM : '%d ay',
	            y : 'bir il',
	            yy : '%d il'
	        },
	        meridiemParse: /gec??|s??h??r|g??nd??z|ax??am/,
	        isPM : function (input) {
	            return /^(g??nd??z|ax??am)$/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return 'gec??';
	            } else if (hour < 12) {
	                return 's??h??r';
	            } else if (hour < 17) {
	                return 'g??nd??z';
	            } else {
	                return 'ax??am';
	            }
	        },
	        ordinalParse: /\d{1,2}-(??nc??|inci|nci|??nc??|nc??|uncu)/,
	        ordinal : function (number) {
	            if (number === 0) {  // special case for zero
	                return number + '-??nc??';
	            }
	            var a = number % 10,
	                b = number % 100 - a,
	                c = number >= 100 ? 100 : null;
	            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return az;
	
	}));

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : belarusian (be)
	//! author : Dmitry Demidov : https://github.com/demidov91
	//! author: Praleska: http://praleska.pro/
	//! Author : Menelion Elens??le : https://github.com/Oire
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function plural(word, num) {
	        var forms = word.split('_');
	        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
	    }
	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': withoutSuffix ? '??????????????_??????????????_????????????' : '??????????????_??????????????_????????????',
	            'hh': withoutSuffix ? '??????????????_??????????????_????????????' : '??????????????_??????????????_????????????',
	            'dd': '??????????_??????_????????',
	            'MM': '??????????_????????????_??????????????',
	            'yy': '??????_????????_??????????'
	        };
	        if (key === 'm') {
	            return withoutSuffix ? '??????????????' : '??????????????';
	        }
	        else if (key === 'h') {
	            return withoutSuffix ? '??????????????' : '??????????????';
	        }
	        else {
	            return number + ' ' + plural(format[key], +number);
	        }
	    }
	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': '????????????????_????????_??????????????_????????????????_??????????????_??????????????_????????????_??????????????_????????????????_????????????????????_????????????????_??????????????'.split('_'),
	            'accusative': '????????????????_????????????_????????????????_??????????????????_????????????_??????????????_????????????_????????????_??????????????_??????????????????????_??????????????????_????????????'.split('_')
	        },
	        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';
	        return months[nounCase][m.month()];
	    }
	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': '??????????????_????????????????????_??????????????_????????????_????????????_??????????????_????????????'.split('_'),
	            'accusative': '??????????????_????????????????????_??????????????_????????????_????????????_??????????????_????????????'.split('_')
	        },
	        nounCase = (/\[ ?[????] ?(?:??????????????|??????????????????)? ?\] ?dddd/).test(format) ?
	            'accusative' :
	            'nominative';
	        return weekdays[nounCase][m.day()];
	    }
	
	    var be = moment.defineLocale('be', {
	        months : monthsCaseReplace,
	        monthsShort : '????????_??????_??????_????????_????????_????????_??????_????????_??????_????????_????????_????????'.split('_'),
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : '????_????_????_????_????_????_????'.split('_'),
	        weekdaysMin : '????_????_????_????_????_????_????'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY ??.',
	            LLL : 'D MMMM YYYY ??., HH:mm',
	            LLLL : 'dddd, D MMMM YYYY ??., HH:mm'
	        },
	        calendar : {
	            sameDay: '[?????????? ??] LT',
	            nextDay: '[???????????? ??] LT',
	            lastDay: '[?????????? ??] LT',
	            nextWeek: function () {
	                return '[??] dddd [??] LT';
	            },
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                case 5:
	                case 6:
	                    return '[?? ??????????????] dddd [??] LT';
	                case 1:
	                case 2:
	                case 4:
	                    return '[?? ????????????] dddd [??] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : '???????? %s',
	            past : '%s ????????',
	            s : '???????????????? ????????????',
	            m : relativeTimeWithPlural,
	            mm : relativeTimeWithPlural,
	            h : relativeTimeWithPlural,
	            hh : relativeTimeWithPlural,
	            d : '??????????',
	            dd : relativeTimeWithPlural,
	            M : '??????????',
	            MM : relativeTimeWithPlural,
	            y : '??????',
	            yy : relativeTimeWithPlural
	        },
	        meridiemParse: /????????|????????????|??????|????????????/,
	        isPM : function (input) {
	            return /^(??????|????????????)$/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return '????????';
	            } else if (hour < 12) {
	                return '????????????';
	            } else if (hour < 17) {
	                return '??????';
	            } else {
	                return '????????????';
	            }
	        },
	        ordinalParse: /\d{1,2}-(??|??|????)/,
	        ordinal: function (number, period) {
	            switch (period) {
	            case 'M':
	            case 'd':
	            case 'DDD':
	            case 'w':
	            case 'W':
	                return (number % 10 === 2 || number % 10 === 3) && (number % 100 !== 12 && number % 100 !== 13) ? number + '-??' : number + '-??';
	            case 'D':
	                return number + '-????';
	            default:
	                return number;
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return be;
	
	}));

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : bulgarian (bg)
	//! author : Krasen Borisov : https://github.com/kraz
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var bg = moment.defineLocale('bg', {
	        months : '????????????_????????????????_????????_??????????_??????_??????_??????_????????????_??????????????????_????????????????_??????????????_????????????????'.split('_'),
	        monthsShort : '??????_??????_??????_??????_??????_??????_??????_??????_??????_??????_??????_??????'.split('_'),
	        weekdays : '????????????_????????????????????_??????????????_??????????_??????????????????_??????????_????????????'.split('_'),
	        weekdaysShort : '??????_??????_??????_??????_??????_??????_??????'.split('_'),
	        weekdaysMin : '????_????_????_????_????_????_????'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'H:mm:ss',
	            L : 'D.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY H:mm',
	            LLLL : 'dddd, D MMMM YYYY H:mm'
	        },
	        calendar : {
	            sameDay : '[???????? ??] LT',
	            nextDay : '[???????? ??] LT',
	            nextWeek : 'dddd [??] LT',
	            lastDay : '[?????????? ??] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                case 6:
	                    return '[?? ????????????????????] dddd [??] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[?? ??????????????????] dddd [??] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '???????? %s',
	            past : '?????????? %s',
	            s : '?????????????? ??????????????',
	            m : '????????????',
	            mm : '%d ????????????',
	            h : '??????',
	            hh : '%d ????????',
	            d : '??????',
	            dd : '%d ??????',
	            M : '??????????',
	            MM : '%d ????????????',
	            y : '????????????',
	            yy : '%d ????????????'
	        },
	        ordinalParse: /\d{1,2}-(????|????|????|????|????|????)/,
	        ordinal : function (number) {
	            var lastDigit = number % 10,
	                last2Digits = number % 100;
	            if (number === 0) {
	                return number + '-????';
	            } else if (last2Digits === 0) {
	                return number + '-????';
	            } else if (last2Digits > 10 && last2Digits < 20) {
	                return number + '-????';
	            } else if (lastDigit === 1) {
	                return number + '-????';
	            } else if (lastDigit === 2) {
	                return number + '-????';
	            } else if (lastDigit === 7 || lastDigit === 8) {
	                return number + '-????';
	            } else {
	                return number + '-????';
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return bg;
	
	}));

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Bengali (bn)
	//! author : Kaushik Gandhi : https://github.com/kaushikgandhi
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '???',
	        '2': '???',
	        '3': '???',
	        '4': '???',
	        '5': '???',
	        '6': '???',
	        '7': '???',
	        '8': '???',
	        '9': '???',
	        '0': '???'
	    },
	    numberMap = {
	        '???': '1',
	        '???': '2',
	        '???': '3',
	        '???': '4',
	        '???': '5',
	        '???': '6',
	        '???': '7',
	        '???': '8',
	        '???': '9',
	        '???': '0'
	    };
	
	    var bn = moment.defineLocale('bn', {
	        months : '????????????????????????_????????????????????????_???????????????_??????????????????_??????_?????????_???????????????_??????????????????_??????????????????????????????_?????????????????????_?????????????????????_????????????????????????'.split('_'),
	        monthsShort : '????????????_?????????_???????????????_?????????_??????_?????????_?????????_??????_???????????????_???????????????_??????_??????????????????'.split('_'),
	        weekdays : '??????????????????_??????????????????_????????????????????????_??????????????????_???????????????????????????????????????_???????????????????????????_??????????????????'.split('_'),
	        weekdaysShort : '?????????_?????????_???????????????_?????????_??????????????????????????????_??????????????????_?????????'.split('_'),
	        weekdaysMin : '??????_??????_????????????_??????_???????????????_??????_?????????'.split('_'),
	        longDateFormat : {
	            LT : 'A h:mm ?????????',
	            LTS : 'A h:mm:ss ?????????',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, A h:mm ?????????',
	            LLLL : 'dddd, D MMMM YYYY, A h:mm ?????????'
	        },
	        calendar : {
	            sameDay : '[??????] LT',
	            nextDay : '[????????????????????????] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[???????????????] LT',
	            lastWeek : '[??????] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s ?????????',
	            past : '%s ?????????',
	            s : '????????? ?????????????????????',
	            m : '?????? ???????????????',
	            mm : '%d ???????????????',
	            h : '?????? ???????????????',
	            hh : '%d ???????????????',
	            d : '?????? ?????????',
	            dd : '%d ?????????',
	            M : '?????? ?????????',
	            MM : '%d ?????????',
	            y : '?????? ?????????',
	            yy : '%d ?????????'
	        },
	        preparse: function (string) {
	            return string.replace(/[??????????????????????????????]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiemParse: /?????????|????????????|???????????????|???????????????|?????????/,
	        isPM: function (input) {
	            return /^(???????????????|???????????????|?????????)$/.test(input);
	        },
	        //Bengali is a vast language its spoken
	        //in different forms in various parts of the world.
	        //I have just generalized with most common one used
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return '?????????';
	            } else if (hour < 10) {
	                return '????????????';
	            } else if (hour < 17) {
	                return '???????????????';
	            } else if (hour < 20) {
	                return '???????????????';
	            } else {
	                return '?????????';
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return bn;
	
	}));

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : tibetan (bo)
	//! author : Thupten N. Chakrishar : https://github.com/vajradog
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '???',
	        '2': '???',
	        '3': '???',
	        '4': '???',
	        '5': '???',
	        '6': '???',
	        '7': '???',
	        '8': '???',
	        '9': '???',
	        '0': '???'
	    },
	    numberMap = {
	        '???': '1',
	        '???': '2',
	        '???': '3',
	        '???': '4',
	        '???': '5',
	        '???': '6',
	        '???': '7',
	        '???': '8',
	        '???': '9',
	        '???': '0'
	    };
	
	    var bo = moment.defineLocale('bo', {
	        months : '??????????????????????????????_?????????????????????????????????_?????????????????????????????????_??????????????????????????????_???????????????????????????_?????????????????????????????????_?????????????????????????????????_????????????????????????????????????_??????????????????????????????_??????????????????????????????_?????????????????????????????????????????????_?????????????????????????????????????????????'.split('_'),
	        monthsShort : '??????????????????????????????_?????????????????????????????????_?????????????????????????????????_??????????????????????????????_???????????????????????????_?????????????????????????????????_?????????????????????????????????_????????????????????????????????????_??????????????????????????????_??????????????????????????????_?????????????????????????????????????????????_?????????????????????????????????????????????'.split('_'),
	        weekdays : '???????????????????????????_???????????????????????????_????????????????????????????????????_??????????????????????????????_??????????????????????????????_??????????????????????????????_?????????????????????????????????'.split('_'),
	        weekdaysShort : '???????????????_???????????????_????????????????????????_??????????????????_??????????????????_??????????????????_?????????????????????'.split('_'),
	        weekdaysMin : '???????????????_???????????????_????????????????????????_??????????????????_??????????????????_??????????????????_?????????????????????'.split('_'),
	        longDateFormat : {
	            LT : 'A h:mm',
	            LTS : 'A h:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, A h:mm',
	            LLLL : 'dddd, D MMMM YYYY, A h:mm'
	        },
	        calendar : {
	            sameDay : '[??????????????????] LT',
	            nextDay : '[??????????????????] LT',
	            nextWeek : '[?????????????????????????????????????????????], LT',
	            lastDay : '[????????????] LT',
	            lastWeek : '[??????????????????????????????????????????] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s ??????',
	            past : '%s ???????????????',
	            s : '???????????????',
	            m : '??????????????????????????????',
	            mm : '%d ???????????????',
	            h : '?????????????????????????????????',
	            hh : '%d ??????????????????',
	            d : '????????????????????????',
	            dd : '%d ????????????',
	            M : '???????????????????????????',
	            MM : '%d ????????????',
	            y : '?????????????????????',
	            yy : '%d ??????'
	        },
	        preparse: function (string) {
	            return string.replace(/[??????????????????????????????]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiemParse: /??????????????????|?????????????????????|?????????????????????|?????????????????????|??????????????????/,
	        isPM: function (input) {
	            return /^(?????????????????????|?????????????????????|??????????????????)$/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return '??????????????????';
	            } else if (hour < 10) {
	                return '?????????????????????';
	            } else if (hour < 17) {
	                return '?????????????????????';
	            } else if (hour < 20) {
	                return '?????????????????????';
	            } else {
	                return '??????????????????';
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return bo;
	
	}));

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : breton (br)
	//! author : Jean-Baptiste Le Duigou : https://github.com/jbleduigou
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function relativeTimeWithMutation(number, withoutSuffix, key) {
	        var format = {
	            'mm': 'munutenn',
	            'MM': 'miz',
	            'dd': 'devezh'
	        };
	        return number + ' ' + mutation(format[key], number);
	    }
	    function specialMutationForYears(number) {
	        switch (lastNumber(number)) {
	        case 1:
	        case 3:
	        case 4:
	        case 5:
	        case 9:
	            return number + ' bloaz';
	        default:
	            return number + ' vloaz';
	        }
	    }
	    function lastNumber(number) {
	        if (number > 9) {
	            return lastNumber(number % 10);
	        }
	        return number;
	    }
	    function mutation(text, number) {
	        if (number === 2) {
	            return softMutation(text);
	        }
	        return text;
	    }
	    function softMutation(text) {
	        var mutationTable = {
	            'm': 'v',
	            'b': 'v',
	            'd': 'z'
	        };
	        if (mutationTable[text.charAt(0)] === undefined) {
	            return text;
	        }
	        return mutationTable[text.charAt(0)] + text.substring(1);
	    }
	
	    var br = moment.defineLocale('br', {
	        months : 'Genver_C\'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu'.split('_'),
	        monthsShort : 'Gen_C\'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker'.split('_'),
	        weekdays : 'Sul_Lun_Meurzh_Merc\'her_Yaou_Gwener_Sadorn'.split('_'),
	        weekdaysShort : 'Sul_Lun_Meu_Mer_Yao_Gwe_Sad'.split('_'),
	        weekdaysMin : 'Su_Lu_Me_Mer_Ya_Gw_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'h[e]mm A',
	            LTS : 'h[e]mm:ss A',
	            L : 'DD/MM/YYYY',
	            LL : 'D [a viz] MMMM YYYY',
	            LLL : 'D [a viz] MMMM YYYY h[e]mm A',
	            LLLL : 'dddd, D [a viz] MMMM YYYY h[e]mm A'
	        },
	        calendar : {
	            sameDay : '[Hiziv da] LT',
	            nextDay : '[Warc\'hoazh da] LT',
	            nextWeek : 'dddd [da] LT',
	            lastDay : '[Dec\'h da] LT',
	            lastWeek : 'dddd [paset da] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'a-benn %s',
	            past : '%s \'zo',
	            s : 'un nebeud segondenno??',
	            m : 'ur vunutenn',
	            mm : relativeTimeWithMutation,
	            h : 'un eur',
	            hh : '%d eur',
	            d : 'un devezh',
	            dd : relativeTimeWithMutation,
	            M : 'ur miz',
	            MM : relativeTimeWithMutation,
	            y : 'ur bloaz',
	            yy : specialMutationForYears
	        },
	        ordinalParse: /\d{1,2}(a??|vet)/,
	        ordinal : function (number) {
	            var output = (number === 1) ? 'a??' : 'vet';
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return br;
	
	}));

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : bosnian (bs)
	//! author : Nedim Cholich : https://github.com/frontyard
	//! based on (hr) translation by Bojan Markovi??
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function translate(number, withoutSuffix, key) {
	        var result = number + ' ';
	        switch (key) {
	        case 'm':
	            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
	        case 'mm':
	            if (number === 1) {
	                result += 'minuta';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'minute';
	            } else {
	                result += 'minuta';
	            }
	            return result;
	        case 'h':
	            return withoutSuffix ? 'jedan sat' : 'jednog sata';
	        case 'hh':
	            if (number === 1) {
	                result += 'sat';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'sata';
	            } else {
	                result += 'sati';
	            }
	            return result;
	        case 'dd':
	            if (number === 1) {
	                result += 'dan';
	            } else {
	                result += 'dana';
	            }
	            return result;
	        case 'MM':
	            if (number === 1) {
	                result += 'mjesec';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'mjeseca';
	            } else {
	                result += 'mjeseci';
	            }
	            return result;
	        case 'yy':
	            if (number === 1) {
	                result += 'godina';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'godine';
	            } else {
	                result += 'godina';
	            }
	            return result;
	        }
	    }
	
	    var bs = moment.defineLocale('bs', {
	        months : 'januar_februar_mart_april_maj_juni_juli_august_septembar_oktobar_novembar_decembar'.split('_'),
	        monthsShort : 'jan._feb._mar._apr._maj._jun._jul._aug._sep._okt._nov._dec.'.split('_'),
	        weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_??etvrtak_petak_subota'.split('_'),
	        weekdaysShort : 'ned._pon._uto._sri._??et._pet._sub.'.split('_'),
	        weekdaysMin : 'ne_po_ut_sr_??e_pe_su'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'H:mm:ss',
	            L : 'DD. MM. YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY H:mm',
	            LLLL : 'dddd, D. MMMM YYYY H:mm'
	        },
	        calendar : {
	            sameDay  : '[danas u] LT',
	            nextDay  : '[sutra u] LT',
	            nextWeek : function () {
	                switch (this.day()) {
	                case 0:
	                    return '[u] [nedjelju] [u] LT';
	                case 3:
	                    return '[u] [srijedu] [u] LT';
	                case 6:
	                    return '[u] [subotu] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[u] dddd [u] LT';
	                }
	            },
	            lastDay  : '[ju??er u] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                    return '[pro??lu] dddd [u] LT';
	                case 6:
	                    return '[pro??le] [subote] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[pro??li] dddd [u] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past   : 'prije %s',
	            s      : 'par sekundi',
	            m      : translate,
	            mm     : translate,
	            h      : translate,
	            hh     : translate,
	            d      : 'dan',
	            dd     : translate,
	            M      : 'mjesec',
	            MM     : translate,
	            y      : 'godinu',
	            yy     : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return bs;
	
	}));

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : catalan (ca)
	//! author : Juan G. Hurtado : https://github.com/juanghurtado
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ca = moment.defineLocale('ca', {
	        months : 'gener_febrer_mar??_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre'.split('_'),
	        monthsShort : 'gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.'.split('_'),
	        weekdays : 'diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte'.split('_'),
	        weekdaysShort : 'dg._dl._dt._dc._dj._dv._ds.'.split('_'),
	        weekdaysMin : 'Dg_Dl_Dt_Dc_Dj_Dv_Ds'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY H:mm',
	            LLLL : 'dddd D MMMM YYYY H:mm'
	        },
	        calendar : {
	            sameDay : function () {
	                return '[avui a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            nextDay : function () {
	                return '[dem?? a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            nextWeek : function () {
	                return 'dddd [a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            lastDay : function () {
	                return '[ahir a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            lastWeek : function () {
	                return '[el] dddd [passat a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'en %s',
	            past : 'fa %s',
	            s : 'uns segons',
	            m : 'un minut',
	            mm : '%d minuts',
	            h : 'una hora',
	            hh : '%d hores',
	            d : 'un dia',
	            dd : '%d dies',
	            M : 'un mes',
	            MM : '%d mesos',
	            y : 'un any',
	            yy : '%d anys'
	        },
	        ordinalParse: /\d{1,2}(r|n|t|??|a)/,
	        ordinal : function (number, period) {
	            var output = (number === 1) ? 'r' :
	                (number === 2) ? 'n' :
	                (number === 3) ? 'r' :
	                (number === 4) ? 't' : '??';
	            if (period === 'w' || period === 'W') {
	                output = 'a';
	            }
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return ca;
	
	}));

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : czech (cs)
	//! author : petrbela : https://github.com/petrbela
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var months = 'leden_??nor_b??ezen_duben_kv??ten_??erven_??ervenec_srpen_z??????_????jen_listopad_prosinec'.split('_'),
	        monthsShort = 'led_??no_b??e_dub_kv??_??vn_??vc_srp_z????_????j_lis_pro'.split('_');
	    function plural(n) {
	        return (n > 1) && (n < 5) && (~~(n / 10) !== 1);
	    }
	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        switch (key) {
	        case 's':  // a few seconds / in a few seconds / a few seconds ago
	            return (withoutSuffix || isFuture) ? 'p??r sekund' : 'p??r sekundami';
	        case 'm':  // a minute / in a minute / a minute ago
	            return withoutSuffix ? 'minuta' : (isFuture ? 'minutu' : 'minutou');
	        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'minuty' : 'minut');
	            } else {
	                return result + 'minutami';
	            }
	            break;
	        case 'h':  // an hour / in an hour / an hour ago
	            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
	        case 'hh': // 9 hours / in 9 hours / 9 hours ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'hodiny' : 'hodin');
	            } else {
	                return result + 'hodinami';
	            }
	            break;
	        case 'd':  // a day / in a day / a day ago
	            return (withoutSuffix || isFuture) ? 'den' : 'dnem';
	        case 'dd': // 9 days / in 9 days / 9 days ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'dny' : 'dn??');
	            } else {
	                return result + 'dny';
	            }
	            break;
	        case 'M':  // a month / in a month / a month ago
	            return (withoutSuffix || isFuture) ? 'm??s??c' : 'm??s??cem';
	        case 'MM': // 9 months / in 9 months / 9 months ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'm??s??ce' : 'm??s??c??');
	            } else {
	                return result + 'm??s??ci';
	            }
	            break;
	        case 'y':  // a year / in a year / a year ago
	            return (withoutSuffix || isFuture) ? 'rok' : 'rokem';
	        case 'yy': // 9 years / in 9 years / 9 years ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'roky' : 'let');
	            } else {
	                return result + 'lety';
	            }
	            break;
	        }
	    }
	
	    var cs = moment.defineLocale('cs', {
	        months : months,
	        monthsShort : monthsShort,
	        monthsParse : (function (months, monthsShort) {
	            var i, _monthsParse = [];
	            for (i = 0; i < 12; i++) {
	                // use custom parser to solve problem with July (??ervenec)
	                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
	            }
	            return _monthsParse;
	        }(months, monthsShort)),
	        weekdays : 'ned??le_pond??l??_??ter??_st??eda_??tvrtek_p??tek_sobota'.split('_'),
	        weekdaysShort : 'ne_po_??t_st_??t_p??_so'.split('_'),
	        weekdaysMin : 'ne_po_??t_st_??t_p??_so'.split('_'),
	        longDateFormat : {
	            LT: 'H:mm',
	            LTS : 'H:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY H:mm',
	            LLLL : 'dddd D. MMMM YYYY H:mm'
	        },
	        calendar : {
	            sameDay: '[dnes v] LT',
	            nextDay: '[z??tra v] LT',
	            nextWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[v ned??li v] LT';
	                case 1:
	                case 2:
	                    return '[v] dddd [v] LT';
	                case 3:
	                    return '[ve st??edu v] LT';
	                case 4:
	                    return '[ve ??tvrtek v] LT';
	                case 5:
	                    return '[v p??tek v] LT';
	                case 6:
	                    return '[v sobotu v] LT';
	                }
	            },
	            lastDay: '[v??era v] LT',
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[minulou ned??li v] LT';
	                case 1:
	                case 2:
	                    return '[minul??] dddd [v] LT';
	                case 3:
	                    return '[minulou st??edu v] LT';
	                case 4:
	                case 5:
	                    return '[minul??] dddd [v] LT';
	                case 6:
	                    return '[minulou sobotu v] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past : 'p??ed %s',
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinalParse : /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return cs;
	
	}));

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : chuvash (cv)
	//! author : Anatoly Mironov : https://github.com/mirontoli
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var cv = moment.defineLocale('cv', {
	        months : '????????????_??????????_??????_??????_??????_????????????_??????_??????????_????????_??????_??????_????????????'.split('_'),
	        monthsShort : '??????_??????_??????_??????_??????_??????_??????_??????_??????_??????_??????_??????'.split('_'),
	        weekdays : '??????????????????????_????????????????_??????????????????_??????????_??????????????????????_??????????????_????????????????'.split('_'),
	        weekdaysShort : '??????_??????_??????_????_??????_??????_??????'.split('_'),
	        weekdaysMin : '????_????_????_????_????_????_????'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD-MM-YYYY',
	            LL : 'YYYY [??????????] MMMM [????????????] D[-????????]',
	            LLL : 'YYYY [??????????] MMMM [????????????] D[-????????], HH:mm',
	            LLLL : 'dddd, YYYY [??????????] MMMM [????????????] D[-????????], HH:mm'
	        },
	        calendar : {
	            sameDay: '[????????] LT [??????????????]',
	            nextDay: '[????????] LT [??????????????]',
	            lastDay: '[????????] LT [??????????????]',
	            nextWeek: '[??????????] dddd LT [??????????????]',
	            lastWeek: '[??????????] dddd LT [??????????????]',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : function (output) {
	                var affix = /??????????$/i.exec(output) ? '??????' : /??????$/i.exec(output) ? '??????' : '??????';
	                return output + affix;
	            },
	            past : '%s ????????????',
	            s : '??????-???? ??????????????',
	            m : '?????? ??????????',
	            mm : '%d ??????????',
	            h : '?????? ??????????',
	            hh : '%d ??????????',
	            d : '?????? ??????',
	            dd : '%d ??????',
	            M : '?????? ????????',
	            MM : '%d ????????',
	            y : '?????? ??????',
	            yy : '%d ??????'
	        },
	        ordinalParse: /\d{1,2}-??????/,
	        ordinal : '%d-??????',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return cv;
	
	}));

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Welsh (cy)
	//! author : Robert Allen
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var cy = moment.defineLocale('cy', {
	        months: 'Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr'.split('_'),
	        monthsShort: 'Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag'.split('_'),
	        weekdays: 'Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn'.split('_'),
	        weekdaysShort: 'Sul_Llun_Maw_Mer_Iau_Gwe_Sad'.split('_'),
	        weekdaysMin: 'Su_Ll_Ma_Me_Ia_Gw_Sa'.split('_'),
	        // time formats are the same as en-gb
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY HH:mm',
	            LLLL: 'dddd, D MMMM YYYY HH:mm'
	        },
	        calendar: {
	            sameDay: '[Heddiw am] LT',
	            nextDay: '[Yfory am] LT',
	            nextWeek: 'dddd [am] LT',
	            lastDay: '[Ddoe am] LT',
	            lastWeek: 'dddd [diwethaf am] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'mewn %s',
	            past: '%s yn ??l',
	            s: 'ychydig eiliadau',
	            m: 'munud',
	            mm: '%d munud',
	            h: 'awr',
	            hh: '%d awr',
	            d: 'diwrnod',
	            dd: '%d diwrnod',
	            M: 'mis',
	            MM: '%d mis',
	            y: 'blwyddyn',
	            yy: '%d flynedd'
	        },
	        ordinalParse: /\d{1,2}(fed|ain|af|il|ydd|ed|eg)/,
	        // traditional ordinal numbers above 31 are not commonly used in colloquial Welsh
	        ordinal: function (number) {
	            var b = number,
	                output = '',
	                lookup = [
	                    '', 'af', 'il', 'ydd', 'ydd', 'ed', 'ed', 'ed', 'fed', 'fed', 'fed', // 1af to 10fed
	                    'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'fed' // 11eg to 20fed
	                ];
	            if (b > 20) {
	                if (b === 40 || b === 50 || b === 60 || b === 80 || b === 100) {
	                    output = 'fed'; // not 30ain, 70ain or 90ain
	                } else {
	                    output = 'ain';
	                }
	            } else if (b > 0) {
	                output = lookup[b];
	            }
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return cy;
	
	}));

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : danish (da)
	//! author : Ulrik Nielsen : https://github.com/mrbase
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var da = moment.defineLocale('da', {
	        months : 'januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
	        weekdays : 's??ndag_mandag_tirsdag_onsdag_torsdag_fredag_l??rdag'.split('_'),
	        weekdaysShort : 's??n_man_tir_ons_tor_fre_l??r'.split('_'),
	        weekdaysMin : 's??_ma_ti_on_to_fr_l??'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY HH:mm',
	            LLLL : 'dddd [d.] D. MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay : '[I dag kl.] LT',
	            nextDay : '[I morgen kl.] LT',
	            nextWeek : 'dddd [kl.] LT',
	            lastDay : '[I g??r kl.] LT',
	            lastWeek : '[sidste] dddd [kl] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'om %s',
	            past : '%s siden',
	            s : 'f?? sekunder',
	            m : 'et minut',
	            mm : '%d minutter',
	            h : 'en time',
	            hh : '%d timer',
	            d : 'en dag',
	            dd : '%d dage',
	            M : 'en m??ned',
	            MM : '%d m??neder',
	            y : 'et ??r',
	            yy : '%d ??r'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return da;
	
	}));

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : german (de)
	//! author : lluchs : https://github.com/lluchs
	//! author: Menelion Elens??le: https://github.com/Oire
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            'm': ['eine Minute', 'einer Minute'],
	            'h': ['eine Stunde', 'einer Stunde'],
	            'd': ['ein Tag', 'einem Tag'],
	            'dd': [number + ' Tage', number + ' Tagen'],
	            'M': ['ein Monat', 'einem Monat'],
	            'MM': [number + ' Monate', number + ' Monaten'],
	            'y': ['ein Jahr', 'einem Jahr'],
	            'yy': [number + ' Jahre', number + ' Jahren']
	        };
	        return withoutSuffix ? format[key][0] : format[key][1];
	    }
	
	    var de = moment.defineLocale('de', {
	        months : 'Januar_Februar_M??rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
	        monthsShort : 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
	        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
	        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
	        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
	        longDateFormat : {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY HH:mm',
	            LLLL : 'dddd, D. MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[Heute um] LT [Uhr]',
	            sameElse: 'L',
	            nextDay: '[Morgen um] LT [Uhr]',
	            nextWeek: 'dddd [um] LT [Uhr]',
	            lastDay: '[Gestern um] LT [Uhr]',
	            lastWeek: '[letzten] dddd [um] LT [Uhr]'
	        },
	        relativeTime : {
	            future : 'in %s',
	            past : 'vor %s',
	            s : 'ein paar Sekunden',
	            m : processRelativeTime,
	            mm : '%d Minuten',
	            h : processRelativeTime,
	            hh : '%d Stunden',
	            d : processRelativeTime,
	            dd : processRelativeTime,
	            M : processRelativeTime,
	            MM : processRelativeTime,
	            y : processRelativeTime,
	            yy : processRelativeTime
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return de;
	
	}));

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : austrian german (de-at)
	//! author : lluchs : https://github.com/lluchs
	//! author: Menelion Elens??le: https://github.com/Oire
	//! author : Martin Groller : https://github.com/MadMG
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            'm': ['eine Minute', 'einer Minute'],
	            'h': ['eine Stunde', 'einer Stunde'],
	            'd': ['ein Tag', 'einem Tag'],
	            'dd': [number + ' Tage', number + ' Tagen'],
	            'M': ['ein Monat', 'einem Monat'],
	            'MM': [number + ' Monate', number + ' Monaten'],
	            'y': ['ein Jahr', 'einem Jahr'],
	            'yy': [number + ' Jahre', number + ' Jahren']
	        };
	        return withoutSuffix ? format[key][0] : format[key][1];
	    }
	
	    var de_at = moment.defineLocale('de-at', {
	        months : 'J??nner_Februar_M??rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
	        monthsShort : 'J??n._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
	        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
	        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
	        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
	        longDateFormat : {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY HH:mm',
	            LLLL : 'dddd, D. MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[Heute um] LT [Uhr]',
	            sameElse: 'L',
	            nextDay: '[Morgen um] LT [Uhr]',
	            nextWeek: 'dddd [um] LT [Uhr]',
	            lastDay: '[Gestern um] LT [Uhr]',
	            lastWeek: '[letzten] dddd [um] LT [Uhr]'
	        },
	        relativeTime : {
	            future : 'in %s',
	            past : 'vor %s',
	            s : 'ein paar Sekunden',
	            m : processRelativeTime,
	            mm : '%d Minuten',
	            h : processRelativeTime,
	            hh : '%d Stunden',
	            d : processRelativeTime,
	            dd : processRelativeTime,
	            M : processRelativeTime,
	            MM : processRelativeTime,
	            y : processRelativeTime,
	            yy : processRelativeTime
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return de_at;
	
	}));

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : modern greek (el)
	//! author : Aggelos Karalias : https://github.com/mehiel
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var el = moment.defineLocale('el', {
	        monthsNominativeEl : '????????????????????_??????????????????????_??????????????_????????????????_??????????_??????????????_??????????????_??????????????????_??????????????????????_??????????????????_??????????????????_????????????????????'.split('_'),
	        monthsGenitiveEl : '????????????????????_??????????????????????_??????????????_????????????????_??????????_??????????????_??????????????_??????????????????_??????????????????????_??????????????????_??????????????????_????????????????????'.split('_'),
	        months : function (momentToFormat, format) {
	            if (/D/.test(format.substring(0, format.indexOf('MMMM')))) { // if there is a day number before 'MMMM'
	                return this._monthsGenitiveEl[momentToFormat.month()];
	            } else {
	                return this._monthsNominativeEl[momentToFormat.month()];
	            }
	        },
	        monthsShort : '??????_??????_??????_??????_??????_????????_????????_??????_??????_??????_??????_??????'.split('_'),
	        weekdays : '??????????????_??????????????_??????????_??????????????_????????????_??????????????????_??????????????'.split('_'),
	        weekdaysShort : '??????_??????_??????_??????_??????_??????_??????'.split('_'),
	        weekdaysMin : '????_????_????_????_????_????_????'.split('_'),
	        meridiem : function (hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? '????' : '????';
	            } else {
	                return isLower ? '????' : '????';
	            }
	        },
	        isPM : function (input) {
	            return ((input + '').toLowerCase()[0] === '??');
	        },
	        meridiemParse : /[????]\.????\.?/i,
	        longDateFormat : {
	            LT : 'h:mm A',
	            LTS : 'h:mm:ss A',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY h:mm A',
	            LLLL : 'dddd, D MMMM YYYY h:mm A'
	        },
	        calendarEl : {
	            sameDay : '[???????????? {}] LT',
	            nextDay : '[?????????? {}] LT',
	            nextWeek : 'dddd [{}] LT',
	            lastDay : '[???????? {}] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                    case 6:
	                        return '[???? ??????????????????????] dddd [{}] LT';
	                    default:
	                        return '[?????? ??????????????????????] dddd [{}] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        calendar : function (key, mom) {
	            var output = this._calendarEl[key],
	                hours = mom && mom.hours();
	            if (typeof output === 'function') {
	                output = output.apply(mom);
	            }
	            return output.replace('{}', (hours % 12 === 1 ? '??????' : '????????'));
	        },
	        relativeTime : {
	            future : '???? %s',
	            past : '%s ????????',
	            s : '???????? ????????????????????????',
	            m : '?????? ??????????',
	            mm : '%d ??????????',
	            h : '?????? ??????',
	            hh : '%d ????????',
	            d : '?????? ????????',
	            dd : '%d ??????????',
	            M : '???????? ??????????',
	            MM : '%d ??????????',
	            y : '???????? ????????????',
	            yy : '%d ????????????'
	        },
	        ordinalParse: /\d{1,2}??/,
	        ordinal: '%d??',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4st is the first week of the year.
	        }
	    });
	
	    return el;
	
	}));

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : australian english (en-au)
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var en_au = moment.defineLocale('en-au', {
	        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
	        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
	        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'h:mm A',
	            LTS : 'h:mm:ss A',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY h:mm A',
	            LLLL : 'dddd, D MMMM YYYY h:mm A'
	        },
	        calendar : {
	            sameDay : '[Today at] LT',
	            nextDay : '[Tomorrow at] LT',
	            nextWeek : 'dddd [at] LT',
	            lastDay : '[Yesterday at] LT',
	            lastWeek : '[Last] dddd [at] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'in %s',
	            past : '%s ago',
	            s : 'a few seconds',
	            m : 'a minute',
	            mm : '%d minutes',
	            h : 'an hour',
	            hh : '%d hours',
	            d : 'a day',
	            dd : '%d days',
	            M : 'a month',
	            MM : '%d months',
	            y : 'a year',
	            yy : '%d years'
	        },
	        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (~~(number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return en_au;
	
	}));

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : canadian english (en-ca)
	//! author : Jonathan Abourbih : https://github.com/jonbca
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var en_ca = moment.defineLocale('en-ca', {
	        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
	        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
	        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'h:mm A',
	            LTS : 'h:mm:ss A',
	            L : 'YYYY-MM-DD',
	            LL : 'D MMMM, YYYY',
	            LLL : 'D MMMM, YYYY h:mm A',
	            LLLL : 'dddd, D MMMM, YYYY h:mm A'
	        },
	        calendar : {
	            sameDay : '[Today at] LT',
	            nextDay : '[Tomorrow at] LT',
	            nextWeek : 'dddd [at] LT',
	            lastDay : '[Yesterday at] LT',
	            lastWeek : '[Last] dddd [at] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'in %s',
	            past : '%s ago',
	            s : 'a few seconds',
	            m : 'a minute',
	            mm : '%d minutes',
	            h : 'an hour',
	            hh : '%d hours',
	            d : 'a day',
	            dd : '%d days',
	            M : 'a month',
	            MM : '%d months',
	            y : 'a year',
	            yy : '%d years'
	        },
	        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (~~(number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        }
	    });
	
	    return en_ca;
	
	}));

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : great britain english (en-gb)
	//! author : Chris Gedrim : https://github.com/chrisgedrim
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var en_gb = moment.defineLocale('en-gb', {
	        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
	        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
	        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd, D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay : '[Today at] LT',
	            nextDay : '[Tomorrow at] LT',
	            nextWeek : 'dddd [at] LT',
	            lastDay : '[Yesterday at] LT',
	            lastWeek : '[Last] dddd [at] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'in %s',
	            past : '%s ago',
	            s : 'a few seconds',
	            m : 'a minute',
	            mm : '%d minutes',
	            h : 'an hour',
	            hh : '%d hours',
	            d : 'a day',
	            dd : '%d days',
	            M : 'a month',
	            MM : '%d months',
	            y : 'a year',
	            yy : '%d years'
	        },
	        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (~~(number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return en_gb;
	
	}));

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : esperanto (eo)
	//! author : Colin Dean : https://github.com/colindean
	//! komento: Mi estas malcerta se mi korekte traktis akuzativojn en tiu traduko.
	//!          Se ne, bonvolu korekti kaj avizi min por ke mi povas lerni!
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var eo = moment.defineLocale('eo', {
	        months : 'januaro_februaro_marto_aprilo_majo_junio_julio_a??gusto_septembro_oktobro_novembro_decembro'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_a??g_sep_okt_nov_dec'.split('_'),
	        weekdays : 'Diman??o_Lundo_Mardo_Merkredo_??a??do_Vendredo_Sabato'.split('_'),
	        weekdaysShort : 'Dim_Lun_Mard_Merk_??a??_Ven_Sab'.split('_'),
	        weekdaysMin : 'Di_Lu_Ma_Me_??a_Ve_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'YYYY-MM-DD',
	            LL : 'D[-an de] MMMM, YYYY',
	            LLL : 'D[-an de] MMMM, YYYY HH:mm',
	            LLLL : 'dddd, [la] D[-an de] MMMM, YYYY HH:mm'
	        },
	        meridiemParse: /[ap]\.t\.m/i,
	        isPM: function (input) {
	            return input.charAt(0).toLowerCase() === 'p';
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? 'p.t.m.' : 'P.T.M.';
	            } else {
	                return isLower ? 'a.t.m.' : 'A.T.M.';
	            }
	        },
	        calendar : {
	            sameDay : '[Hodia?? je] LT',
	            nextDay : '[Morga?? je] LT',
	            nextWeek : 'dddd [je] LT',
	            lastDay : '[Hiera?? je] LT',
	            lastWeek : '[pasinta] dddd [je] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'je %s',
	            past : 'anta?? %s',
	            s : 'sekundoj',
	            m : 'minuto',
	            mm : '%d minutoj',
	            h : 'horo',
	            hh : '%d horoj',
	            d : 'tago',//ne 'diurno', ??ar estas uzita por proksimumo
	            dd : '%d tagoj',
	            M : 'monato',
	            MM : '%d monatoj',
	            y : 'jaro',
	            yy : '%d jaroj'
	        },
	        ordinalParse: /\d{1,2}a/,
	        ordinal : '%da',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return eo;
	
	}));

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : spanish (es)
	//! author : Julio Napur?? : https://github.com/julionc
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var monthsShortDot = 'Ene._Feb._Mar._Abr._May._Jun._Jul._Ago._Sep._Oct._Nov._Dic.'.split('_'),
	        monthsShort = 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_');
	
	    var es = moment.defineLocale('es', {
	        months : 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
	        monthsShort : function (m, format) {
	            if (/-MMM-/.test(format)) {
	                return monthsShort[m.month()];
	            } else {
	                return monthsShortDot[m.month()];
	            }
	        },
	        weekdays : 'Domingo_Lunes_Martes_Mi??rcoles_Jueves_Viernes_S??bado'.split('_'),
	        weekdaysShort : 'Dom._Lun._Mar._Mi??._Jue._Vie._S??b.'.split('_'),
	        weekdaysMin : 'Do_Lu_Ma_Mi_Ju_Vi_S??'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'H:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D [de] MMMM [de] YYYY',
	            LLL : 'D [de] MMMM [de] YYYY H:mm',
	            LLLL : 'dddd, D [de] MMMM [de] YYYY H:mm'
	        },
	        calendar : {
	            sameDay : function () {
	                return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            nextDay : function () {
	                return '[ma??ana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            nextWeek : function () {
	                return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            lastDay : function () {
	                return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            lastWeek : function () {
	                return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'en %s',
	            past : 'hace %s',
	            s : 'unos segundos',
	            m : 'un minuto',
	            mm : '%d minutos',
	            h : 'una hora',
	            hh : '%d horas',
	            d : 'un d??a',
	            dd : '%d d??as',
	            M : 'un mes',
	            MM : '%d meses',
	            y : 'un a??o',
	            yy : '%d a??os'
	        },
	        ordinalParse : /\d{1,2}??/,
	        ordinal : '%d??',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return es;
	
	}));

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : estonian (et)
	//! author : Henry Kehlmann : https://github.com/madhenry
	//! improvements : Illimar Tambek : https://github.com/ragulka
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            's' : ['m??ne sekundi', 'm??ni sekund', 'paar sekundit'],
	            'm' : ['??he minuti', '??ks minut'],
	            'mm': [number + ' minuti', number + ' minutit'],
	            'h' : ['??he tunni', 'tund aega', '??ks tund'],
	            'hh': [number + ' tunni', number + ' tundi'],
	            'd' : ['??he p??eva', '??ks p??ev'],
	            'M' : ['kuu aja', 'kuu aega', '??ks kuu'],
	            'MM': [number + ' kuu', number + ' kuud'],
	            'y' : ['??he aasta', 'aasta', '??ks aasta'],
	            'yy': [number + ' aasta', number + ' aastat']
	        };
	        if (withoutSuffix) {
	            return format[key][2] ? format[key][2] : format[key][1];
	        }
	        return isFuture ? format[key][0] : format[key][1];
	    }
	
	    var et = moment.defineLocale('et', {
	        months        : 'jaanuar_veebruar_m??rts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember'.split('_'),
	        monthsShort   : 'jaan_veebr_m??rts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets'.split('_'),
	        weekdays      : 'p??hap??ev_esmasp??ev_teisip??ev_kolmap??ev_neljap??ev_reede_laup??ev'.split('_'),
	        weekdaysShort : 'P_E_T_K_N_R_L'.split('_'),
	        weekdaysMin   : 'P_E_T_K_N_R_L'.split('_'),
	        longDateFormat : {
	            LT   : 'H:mm',
	            LTS : 'H:mm:ss',
	            L    : 'DD.MM.YYYY',
	            LL   : 'D. MMMM YYYY',
	            LLL  : 'D. MMMM YYYY H:mm',
	            LLLL : 'dddd, D. MMMM YYYY H:mm'
	        },
	        calendar : {
	            sameDay  : '[T??na,] LT',
	            nextDay  : '[Homme,] LT',
	            nextWeek : '[J??rgmine] dddd LT',
	            lastDay  : '[Eile,] LT',
	            lastWeek : '[Eelmine] dddd LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s p??rast',
	            past   : '%s tagasi',
	            s      : processRelativeTime,
	            m      : processRelativeTime,
	            mm     : processRelativeTime,
	            h      : processRelativeTime,
	            hh     : processRelativeTime,
	            d      : processRelativeTime,
	            dd     : '%d p??eva',
	            M      : processRelativeTime,
	            MM     : processRelativeTime,
	            y      : processRelativeTime,
	            yy     : processRelativeTime
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return et;
	
	}));

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : euskara (eu)
	//! author : Eneko Illarramendi : https://github.com/eillarra
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var eu = moment.defineLocale('eu', {
	        months : 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split('_'),
	        monthsShort : 'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split('_'),
	        weekdays : 'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split('_'),
	        weekdaysShort : 'ig._al._ar._az._og._ol._lr.'.split('_'),
	        weekdaysMin : 'ig_al_ar_az_og_ol_lr'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'YYYY-MM-DD',
	            LL : 'YYYY[ko] MMMM[ren] D[a]',
	            LLL : 'YYYY[ko] MMMM[ren] D[a] HH:mm',
	            LLLL : 'dddd, YYYY[ko] MMMM[ren] D[a] HH:mm',
	            l : 'YYYY-M-D',
	            ll : 'YYYY[ko] MMM D[a]',
	            lll : 'YYYY[ko] MMM D[a] HH:mm',
	            llll : 'ddd, YYYY[ko] MMM D[a] HH:mm'
	        },
	        calendar : {
	            sameDay : '[gaur] LT[etan]',
	            nextDay : '[bihar] LT[etan]',
	            nextWeek : 'dddd LT[etan]',
	            lastDay : '[atzo] LT[etan]',
	            lastWeek : '[aurreko] dddd LT[etan]',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s barru',
	            past : 'duela %s',
	            s : 'segundo batzuk',
	            m : 'minutu bat',
	            mm : '%d minutu',
	            h : 'ordu bat',
	            hh : '%d ordu',
	            d : 'egun bat',
	            dd : '%d egun',
	            M : 'hilabete bat',
	            MM : '%d hilabete',
	            y : 'urte bat',
	            yy : '%d urte'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return eu;
	
	}));

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Persian (fa)
	//! author : Ebrahim Byagowi : https://github.com/ebraminio
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '??',
	        '2': '??',
	        '3': '??',
	        '4': '??',
	        '5': '??',
	        '6': '??',
	        '7': '??',
	        '8': '??',
	        '9': '??',
	        '0': '??'
	    }, numberMap = {
	        '??': '1',
	        '??': '2',
	        '??': '3',
	        '??': '4',
	        '??': '5',
	        '??': '6',
	        '??': '7',
	        '??': '8',
	        '??': '9',
	        '??': '0'
	    };
	
	    var fa = moment.defineLocale('fa', {
	        months : '????????????_??????????_????????_??????????_????_????????_??????????_??????_??????????????_??????????_????????????_????????????'.split('_'),
	        monthsShort : '????????????_??????????_????????_??????????_????_????????_??????????_??????_??????????????_??????????_????????????_????????????'.split('_'),
	        weekdays : '????\u200c????????_????????????_????\u200c????????_????????????????_??????\u200c????????_????????_????????'.split('_'),
	        weekdaysShort : '????\u200c????????_????????????_????\u200c????????_????????????????_??????\u200c????????_????????_????????'.split('_'),
	        weekdaysMin : '??_??_??_??_??_??_??'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd, D MMMM YYYY HH:mm'
	        },
	        meridiemParse: /?????? ???? ??????|?????? ???? ??????/,
	        isPM: function (input) {
	            return /?????? ???? ??????/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return '?????? ???? ??????';
	            } else {
	                return '?????? ???? ??????';
	            }
	        },
	        calendar : {
	            sameDay : '[?????????? ????????] LT',
	            nextDay : '[???????? ????????] LT',
	            nextWeek : 'dddd [????????] LT',
	            lastDay : '[?????????? ????????] LT',
	            lastWeek : 'dddd [??????] [????????] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '???? %s',
	            past : '%s ??????',
	            s : '?????????? ??????????',
	            m : '???? ??????????',
	            mm : '%d ??????????',
	            h : '???? ????????',
	            hh : '%d ????????',
	            d : '???? ??????',
	            dd : '%d ??????',
	            M : '???? ??????',
	            MM : '%d ??????',
	            y : '???? ??????',
	            yy : '%d ??????'
	        },
	        preparse: function (string) {
	            return string.replace(/[??-??]/g, function (match) {
	                return numberMap[match];
	            }).replace(/??/g, ',');
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            }).replace(/,/g, '??');
	        },
	        ordinalParse: /\d{1,2}??/,
	        ordinal : '%d??',
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return fa;
	
	}));

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : finnish (fi)
	//! author : Tarmo Aidantausta : https://github.com/bleadof
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var numbersPast = 'nolla yksi kaksi kolme nelj?? viisi kuusi seitsem??n kahdeksan yhdeks??n'.split(' '),
	        numbersFuture = [
	            'nolla', 'yhden', 'kahden', 'kolmen', 'nelj??n', 'viiden', 'kuuden',
	            numbersPast[7], numbersPast[8], numbersPast[9]
	        ];
	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = '';
	        switch (key) {
	        case 's':
	            return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
	        case 'm':
	            return isFuture ? 'minuutin' : 'minuutti';
	        case 'mm':
	            result = isFuture ? 'minuutin' : 'minuuttia';
	            break;
	        case 'h':
	            return isFuture ? 'tunnin' : 'tunti';
	        case 'hh':
	            result = isFuture ? 'tunnin' : 'tuntia';
	            break;
	        case 'd':
	            return isFuture ? 'p??iv??n' : 'p??iv??';
	        case 'dd':
	            result = isFuture ? 'p??iv??n' : 'p??iv????';
	            break;
	        case 'M':
	            return isFuture ? 'kuukauden' : 'kuukausi';
	        case 'MM':
	            result = isFuture ? 'kuukauden' : 'kuukautta';
	            break;
	        case 'y':
	            return isFuture ? 'vuoden' : 'vuosi';
	        case 'yy':
	            result = isFuture ? 'vuoden' : 'vuotta';
	            break;
	        }
	        result = verbalNumber(number, isFuture) + ' ' + result;
	        return result;
	    }
	    function verbalNumber(number, isFuture) {
	        return number < 10 ? (isFuture ? numbersFuture[number] : numbersPast[number]) : number;
	    }
	
	    var fi = moment.defineLocale('fi', {
	        months : 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kes??kuu_hein??kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
	        monthsShort : 'tammi_helmi_maalis_huhti_touko_kes??_hein??_elo_syys_loka_marras_joulu'.split('_'),
	        weekdays : 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
	        weekdaysShort : 'su_ma_ti_ke_to_pe_la'.split('_'),
	        weekdaysMin : 'su_ma_ti_ke_to_pe_la'.split('_'),
	        longDateFormat : {
	            LT : 'HH.mm',
	            LTS : 'HH.mm.ss',
	            L : 'DD.MM.YYYY',
	            LL : 'Do MMMM[ta] YYYY',
	            LLL : 'Do MMMM[ta] YYYY, [klo] HH.mm',
	            LLLL : 'dddd, Do MMMM[ta] YYYY, [klo] HH.mm',
	            l : 'D.M.YYYY',
	            ll : 'Do MMM YYYY',
	            lll : 'Do MMM YYYY, [klo] HH.mm',
	            llll : 'ddd, Do MMM YYYY, [klo] HH.mm'
	        },
	        calendar : {
	            sameDay : '[t??n????n] [klo] LT',
	            nextDay : '[huomenna] [klo] LT',
	            nextWeek : 'dddd [klo] LT',
	            lastDay : '[eilen] [klo] LT',
	            lastWeek : '[viime] dddd[na] [klo] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s p????st??',
	            past : '%s sitten',
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return fi;
	
	}));

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : faroese (fo)
	//! author : Ragnar Johannesen : https://github.com/ragnar123
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var fo = moment.defineLocale('fo', {
	        months : 'januar_februar_mars_apr??l_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
	        weekdays : 'sunnudagur_m??nadagur_t??sdagur_mikudagur_h??sdagur_fr??ggjadagur_leygardagur'.split('_'),
	        weekdaysShort : 'sun_m??n_t??s_mik_h??s_fr??_ley'.split('_'),
	        weekdaysMin : 'su_m??_t??_mi_h??_fr_le'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd D. MMMM, YYYY HH:mm'
	        },
	        calendar : {
	            sameDay : '[?? dag kl.] LT',
	            nextDay : '[?? morgin kl.] LT',
	            nextWeek : 'dddd [kl.] LT',
	            lastDay : '[?? gj??r kl.] LT',
	            lastWeek : '[s????stu] dddd [kl] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'um %s',
	            past : '%s s????ani',
	            s : 'f?? sekund',
	            m : 'ein minutt',
	            mm : '%d minuttir',
	            h : 'ein t??mi',
	            hh : '%d t??mar',
	            d : 'ein dagur',
	            dd : '%d dagar',
	            M : 'ein m??na??i',
	            MM : '%d m??na??ir',
	            y : 'eitt ??r',
	            yy : '%d ??r'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return fo;
	
	}));

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : french (fr)
	//! author : John Fischer : https://github.com/jfroffice
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var fr = moment.defineLocale('fr', {
	        months : 'janvier_f??vrier_mars_avril_mai_juin_juillet_ao??t_septembre_octobre_novembre_d??cembre'.split('_'),
	        monthsShort : 'janv._f??vr._mars_avr._mai_juin_juil._ao??t_sept._oct._nov._d??c.'.split('_'),
	        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
	        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
	        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[Aujourd\'hui ??] LT',
	            nextDay: '[Demain ??] LT',
	            nextWeek: 'dddd [??] LT',
	            lastDay: '[Hier ??] LT',
	            lastWeek: 'dddd [dernier ??] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'dans %s',
	            past : 'il y a %s',
	            s : 'quelques secondes',
	            m : 'une minute',
	            mm : '%d minutes',
	            h : 'une heure',
	            hh : '%d heures',
	            d : 'un jour',
	            dd : '%d jours',
	            M : 'un mois',
	            MM : '%d mois',
	            y : 'un an',
	            yy : '%d ans'
	        },
	        ordinalParse: /\d{1,2}(er|)/,
	        ordinal : function (number) {
	            return number + (number === 1 ? 'er' : '');
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return fr;
	
	}));

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : canadian french (fr-ca)
	//! author : Jonathan Abourbih : https://github.com/jonbca
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var fr_ca = moment.defineLocale('fr-ca', {
	        months : 'janvier_f??vrier_mars_avril_mai_juin_juillet_ao??t_septembre_octobre_novembre_d??cembre'.split('_'),
	        monthsShort : 'janv._f??vr._mars_avr._mai_juin_juil._ao??t_sept._oct._nov._d??c.'.split('_'),
	        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
	        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
	        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'YYYY-MM-DD',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[Aujourd\'hui ??] LT',
	            nextDay: '[Demain ??] LT',
	            nextWeek: 'dddd [??] LT',
	            lastDay: '[Hier ??] LT',
	            lastWeek: 'dddd [dernier ??] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'dans %s',
	            past : 'il y a %s',
	            s : 'quelques secondes',
	            m : 'une minute',
	            mm : '%d minutes',
	            h : 'une heure',
	            hh : '%d heures',
	            d : 'un jour',
	            dd : '%d jours',
	            M : 'un mois',
	            MM : '%d mois',
	            y : 'un an',
	            yy : '%d ans'
	        },
	        ordinalParse: /\d{1,2}(er|e)/,
	        ordinal : function (number) {
	            return number + (number === 1 ? 'er' : 'e');
	        }
	    });
	
	    return fr_ca;
	
	}));

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : frisian (fy)
	//! author : Robin van der Vliet : https://github.com/robin0van0der0v
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var monthsShortWithDots = 'jan._feb._mrt._apr._mai_jun._jul._aug._sep._okt._nov._des.'.split('_'),
	        monthsShortWithoutDots = 'jan_feb_mrt_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_');
	
	    var fy = moment.defineLocale('fy', {
	        months : 'jannewaris_febrewaris_maart_april_maaie_juny_july_augustus_septimber_oktober_novimber_desimber'.split('_'),
	        monthsShort : function (m, format) {
	            if (/-MMM-/.test(format)) {
	                return monthsShortWithoutDots[m.month()];
	            } else {
	                return monthsShortWithDots[m.month()];
	            }
	        },
	        weekdays : 'snein_moandei_tiisdei_woansdei_tongersdei_freed_sneon'.split('_'),
	        weekdaysShort : 'si._mo._ti._wo._to._fr._so.'.split('_'),
	        weekdaysMin : 'Si_Mo_Ti_Wo_To_Fr_So'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD-MM-YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[hjoed om] LT',
	            nextDay: '[moarn om] LT',
	            nextWeek: 'dddd [om] LT',
	            lastDay: '[juster om] LT',
	            lastWeek: '[??fr??ne] dddd [om] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'oer %s',
	            past : '%s lyn',
	            s : 'in pear sekonden',
	            m : 'ien min??t',
	            mm : '%d minuten',
	            h : 'ien oere',
	            hh : '%d oeren',
	            d : 'ien dei',
	            dd : '%d dagen',
	            M : 'ien moanne',
	            MM : '%d moannen',
	            y : 'ien jier',
	            yy : '%d jierren'
	        },
	        ordinalParse: /\d{1,2}(ste|de)/,
	        ordinal : function (number) {
	            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return fy;
	
	}));

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : galician (gl)
	//! author : Juan G. Hurtado : https://github.com/juanghurtado
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var gl = moment.defineLocale('gl', {
	        months : 'Xaneiro_Febreiro_Marzo_Abril_Maio_Xu??o_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro'.split('_'),
	        monthsShort : 'Xan._Feb._Mar._Abr._Mai._Xu??._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
	        weekdays : 'Domingo_Luns_Martes_M??rcores_Xoves_Venres_S??bado'.split('_'),
	        weekdaysShort : 'Dom._Lun._Mar._M??r._Xov._Ven._S??b.'.split('_'),
	        weekdaysMin : 'Do_Lu_Ma_M??_Xo_Ve_S??'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'H:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY H:mm',
	            LLLL : 'dddd D MMMM YYYY H:mm'
	        },
	        calendar : {
	            sameDay : function () {
	                return '[hoxe ' + ((this.hours() !== 1) ? '??s' : '??') + '] LT';
	            },
	            nextDay : function () {
	                return '[ma???? ' + ((this.hours() !== 1) ? '??s' : '??') + '] LT';
	            },
	            nextWeek : function () {
	                return 'dddd [' + ((this.hours() !== 1) ? '??s' : 'a') + '] LT';
	            },
	            lastDay : function () {
	                return '[onte ' + ((this.hours() !== 1) ? '??' : 'a') + '] LT';
	            },
	            lastWeek : function () {
	                return '[o] dddd [pasado ' + ((this.hours() !== 1) ? '??s' : 'a') + '] LT';
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : function (str) {
	                if (str === 'uns segundos') {
	                    return 'nuns segundos';
	                }
	                return 'en ' + str;
	            },
	            past : 'hai %s',
	            s : 'uns segundos',
	            m : 'un minuto',
	            mm : '%d minutos',
	            h : 'unha hora',
	            hh : '%d horas',
	            d : 'un d??a',
	            dd : '%d d??as',
	            M : 'un mes',
	            MM : '%d meses',
	            y : 'un ano',
	            yy : '%d anos'
	        },
	        ordinalParse : /\d{1,2}??/,
	        ordinal : '%d??',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return gl;
	
	}));

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Hebrew (he)
	//! author : Tomer Cohen : https://github.com/tomer
	//! author : Moshe Simantov : https://github.com/DevelopmentIL
	//! author : Tal Ater : https://github.com/TalAter
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var he = moment.defineLocale('he', {
	        months : '??????????_????????????_??????_??????????_??????_????????_????????_????????????_????????????_??????????????_????????????_??????????'.split('_'),
	        monthsShort : '????????_????????_??????_????????_??????_????????_????????_????????_????????_????????_????????_????????'.split('_'),
	        weekdays : '??????????_??????_??????????_??????????_??????????_????????_??????'.split('_'),
	        weekdaysShort : '????_????_????_????_????_????_????'.split('_'),
	        weekdaysMin : '??_??_??_??_??_??_??'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D [??]MMMM YYYY',
	            LLL : 'D [??]MMMM YYYY HH:mm',
	            LLLL : 'dddd, D [??]MMMM YYYY HH:mm',
	            l : 'D/M/YYYY',
	            ll : 'D MMM YYYY',
	            lll : 'D MMM YYYY HH:mm',
	            llll : 'ddd, D MMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay : '[???????? ????]LT',
	            nextDay : '[?????? ????]LT',
	            nextWeek : 'dddd [????????] LT',
	            lastDay : '[?????????? ????]LT',
	            lastWeek : '[????????] dddd [???????????? ????????] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '???????? %s',
	            past : '???????? %s',
	            s : '???????? ??????????',
	            m : '??????',
	            mm : '%d ????????',
	            h : '??????',
	            hh : function (number) {
	                if (number === 2) {
	                    return '????????????';
	                }
	                return number + ' ????????';
	            },
	            d : '??????',
	            dd : function (number) {
	                if (number === 2) {
	                    return '????????????';
	                }
	                return number + ' ????????';
	            },
	            M : '????????',
	            MM : function (number) {
	                if (number === 2) {
	                    return '??????????????';
	                }
	                return number + ' ????????????';
	            },
	            y : '??????',
	            yy : function (number) {
	                if (number === 2) {
	                    return '????????????';
	                } else if (number % 10 === 0 && number !== 10) {
	                    return number + ' ??????';
	                }
	                return number + ' ????????';
	            }
	        }
	    });
	
	    return he;
	
	}));

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : hindi (hi)
	//! author : Mayank Singhal : https://github.com/mayanksinghal
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '???',
	        '2': '???',
	        '3': '???',
	        '4': '???',
	        '5': '???',
	        '6': '???',
	        '7': '???',
	        '8': '???',
	        '9': '???',
	        '0': '???'
	    },
	    numberMap = {
	        '???': '1',
	        '???': '2',
	        '???': '3',
	        '???': '4',
	        '???': '5',
	        '???': '6',
	        '???': '7',
	        '???': '8',
	        '???': '9',
	        '???': '0'
	    };
	
	    var hi = moment.defineLocale('hi', {
	        months : '???????????????_??????????????????_???????????????_??????????????????_??????_?????????_???????????????_???????????????_?????????????????????_?????????????????????_??????????????????_?????????????????????'.split('_'),
	        monthsShort : '??????._?????????._???????????????_???????????????._??????_?????????_?????????._??????._?????????._???????????????._??????._?????????.'.split('_'),
	        weekdays : '??????????????????_??????????????????_?????????????????????_??????????????????_?????????????????????_????????????????????????_??????????????????'.split('_'),
	        weekdaysShort : '?????????_?????????_????????????_?????????_????????????_???????????????_?????????'.split('_'),
	        weekdaysMin : '???_??????_??????_??????_??????_??????_???'.split('_'),
	        longDateFormat : {
	            LT : 'A h:mm ?????????',
	            LTS : 'A h:mm:ss ?????????',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, A h:mm ?????????',
	            LLLL : 'dddd, D MMMM YYYY, A h:mm ?????????'
	        },
	        calendar : {
	            sameDay : '[??????] LT',
	            nextDay : '[??????] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[??????] LT',
	            lastWeek : '[???????????????] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s ?????????',
	            past : '%s ????????????',
	            s : '????????? ?????? ????????????',
	            m : '?????? ????????????',
	            mm : '%d ????????????',
	            h : '?????? ????????????',
	            hh : '%d ????????????',
	            d : '?????? ?????????',
	            dd : '%d ?????????',
	            M : '?????? ???????????????',
	            MM : '%d ???????????????',
	            y : '?????? ????????????',
	            yy : '%d ????????????'
	        },
	        preparse: function (string) {
	            return string.replace(/[??????????????????????????????]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        // Hindi notation for meridiems are quite fuzzy in practice. While there exists
	        // a rigid notion of a 'Pahar' it is not used as rigidly in modern Hindi.
	        meridiemParse: /?????????|????????????|???????????????|?????????/,
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === '?????????') {
	                return hour < 4 ? hour : hour + 12;
	            } else if (meridiem === '????????????') {
	                return hour;
	            } else if (meridiem === '???????????????') {
	                return hour >= 10 ? hour : hour + 12;
	            } else if (meridiem === '?????????') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return '?????????';
	            } else if (hour < 10) {
	                return '????????????';
	            } else if (hour < 17) {
	                return '???????????????';
	            } else if (hour < 20) {
	                return '?????????';
	            } else {
	                return '?????????';
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return hi;
	
	}));

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : hrvatski (hr)
	//! author : Bojan Markovi?? : https://github.com/bmarkovic
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function translate(number, withoutSuffix, key) {
	        var result = number + ' ';
	        switch (key) {
	        case 'm':
	            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
	        case 'mm':
	            if (number === 1) {
	                result += 'minuta';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'minute';
	            } else {
	                result += 'minuta';
	            }
	            return result;
	        case 'h':
	            return withoutSuffix ? 'jedan sat' : 'jednog sata';
	        case 'hh':
	            if (number === 1) {
	                result += 'sat';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'sata';
	            } else {
	                result += 'sati';
	            }
	            return result;
	        case 'dd':
	            if (number === 1) {
	                result += 'dan';
	            } else {
	                result += 'dana';
	            }
	            return result;
	        case 'MM':
	            if (number === 1) {
	                result += 'mjesec';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'mjeseca';
	            } else {
	                result += 'mjeseci';
	            }
	            return result;
	        case 'yy':
	            if (number === 1) {
	                result += 'godina';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'godine';
	            } else {
	                result += 'godina';
	            }
	            return result;
	        }
	    }
	
	    var hr = moment.defineLocale('hr', {
	        months : 'sije??anj_velja??a_o??ujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac'.split('_'),
	        monthsShort : 'sij._velj._o??u._tra._svi._lip._srp._kol._ruj._lis._stu._pro.'.split('_'),
	        weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_??etvrtak_petak_subota'.split('_'),
	        weekdaysShort : 'ned._pon._uto._sri._??et._pet._sub.'.split('_'),
	        weekdaysMin : 'ne_po_ut_sr_??e_pe_su'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'H:mm:ss',
	            L : 'DD. MM. YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY H:mm',
	            LLLL : 'dddd, D. MMMM YYYY H:mm'
	        },
	        calendar : {
	            sameDay  : '[danas u] LT',
	            nextDay  : '[sutra u] LT',
	            nextWeek : function () {
	                switch (this.day()) {
	                case 0:
	                    return '[u] [nedjelju] [u] LT';
	                case 3:
	                    return '[u] [srijedu] [u] LT';
	                case 6:
	                    return '[u] [subotu] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[u] dddd [u] LT';
	                }
	            },
	            lastDay  : '[ju??er u] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                    return '[pro??lu] dddd [u] LT';
	                case 6:
	                    return '[pro??le] [subote] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[pro??li] dddd [u] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past   : 'prije %s',
	            s      : 'par sekundi',
	            m      : translate,
	            mm     : translate,
	            h      : translate,
	            hh     : translate,
	            d      : 'dan',
	            dd     : translate,
	            M      : 'mjesec',
	            MM     : translate,
	            y      : 'godinu',
	            yy     : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return hr;
	
	}));

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : hungarian (hu)
	//! author : Adam Brunner : https://github.com/adambrunner
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var weekEndings = 'vas??rnap h??tf??n kedden szerd??n cs??t??rt??k??n p??nteken szombaton'.split(' ');
	    function translate(number, withoutSuffix, key, isFuture) {
	        var num = number,
	            suffix;
	        switch (key) {
	        case 's':
	            return (isFuture || withoutSuffix) ? 'n??h??ny m??sodperc' : 'n??h??ny m??sodperce';
	        case 'm':
	            return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
	        case 'mm':
	            return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
	        case 'h':
	            return 'egy' + (isFuture || withoutSuffix ? ' ??ra' : ' ??r??ja');
	        case 'hh':
	            return num + (isFuture || withoutSuffix ? ' ??ra' : ' ??r??ja');
	        case 'd':
	            return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
	        case 'dd':
	            return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
	        case 'M':
	            return 'egy' + (isFuture || withoutSuffix ? ' h??nap' : ' h??napja');
	        case 'MM':
	            return num + (isFuture || withoutSuffix ? ' h??nap' : ' h??napja');
	        case 'y':
	            return 'egy' + (isFuture || withoutSuffix ? ' ??v' : ' ??ve');
	        case 'yy':
	            return num + (isFuture || withoutSuffix ? ' ??v' : ' ??ve');
	        }
	        return '';
	    }
	    function week(isFuture) {
	        return (isFuture ? '' : '[m??lt] ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
	    }
	
	    var hu = moment.defineLocale('hu', {
	        months : 'janu??r_febru??r_m??rcius_??prilis_m??jus_j??nius_j??lius_augusztus_szeptember_okt??ber_november_december'.split('_'),
	        monthsShort : 'jan_feb_m??rc_??pr_m??j_j??n_j??l_aug_szept_okt_nov_dec'.split('_'),
	        weekdays : 'vas??rnap_h??tf??_kedd_szerda_cs??t??rt??k_p??ntek_szombat'.split('_'),
	        weekdaysShort : 'vas_h??t_kedd_sze_cs??t_p??n_szo'.split('_'),
	        weekdaysMin : 'v_h_k_sze_cs_p_szo'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'H:mm:ss',
	            L : 'YYYY.MM.DD.',
	            LL : 'YYYY. MMMM D.',
	            LLL : 'YYYY. MMMM D. H:mm',
	            LLLL : 'YYYY. MMMM D., dddd H:mm'
	        },
	        meridiemParse: /de|du/i,
	        isPM: function (input) {
	            return input.charAt(1).toLowerCase() === 'u';
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 12) {
	                return isLower === true ? 'de' : 'DE';
	            } else {
	                return isLower === true ? 'du' : 'DU';
	            }
	        },
	        calendar : {
	            sameDay : '[ma] LT[-kor]',
	            nextDay : '[holnap] LT[-kor]',
	            nextWeek : function () {
	                return week.call(this, true);
	            },
	            lastDay : '[tegnap] LT[-kor]',
	            lastWeek : function () {
	                return week.call(this, false);
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s m??lva',
	            past : '%s',
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return hu;
	
	}));

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Armenian (hy-am)
	//! author : Armendarabyan : https://github.com/armendarabyan
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': '??????????????_??????????????_????????_??????????_??????????_????????????_????????????_??????????????_??????????????????_??????????????????_????????????????_??????????????????'.split('_'),
	            'accusative': '????????????????_????????????????_??????????_????????????_????????????_??????????????_??????????????_????????????????_????????????????????_????????????????????_??????????????????_????????????????????'.split('_')
	        },
	        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';
	        return months[nounCase][m.month()];
	    }
	    function monthsShortCaseReplace(m, format) {
	        var monthsShort = '??????_??????_??????_??????_??????_??????_??????_??????_??????_??????_??????_??????'.split('_');
	        return monthsShort[m.month()];
	    }
	    function weekdaysCaseReplace(m, format) {
	        var weekdays = '????????????_????????????????????_??????????????????_????????????????????_??????????????????_????????????_??????????'.split('_');
	        return weekdays[m.day()];
	    }
	
	    var hy_am = moment.defineLocale('hy-am', {
	        months : monthsCaseReplace,
	        monthsShort : monthsShortCaseReplace,
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : '??????_??????_??????_??????_??????_????????_??????'.split('_'),
	        weekdaysMin : '??????_??????_??????_??????_??????_????????_??????'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY ??.',
	            LLL : 'D MMMM YYYY ??., HH:mm',
	            LLLL : 'dddd, D MMMM YYYY ??., HH:mm'
	        },
	        calendar : {
	            sameDay: '[??????????] LT',
	            nextDay: '[????????] LT',
	            lastDay: '[????????] LT',
	            nextWeek: function () {
	                return 'dddd [?????? ????????] LT';
	            },
	            lastWeek: function () {
	                return '[??????????] dddd [?????? ????????] LT';
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : '%s ????????',
	            past : '%s ????????',
	            s : '???? ???????? ????????????????',
	            m : '????????',
	            mm : '%d ????????',
	            h : '??????',
	            hh : '%d ??????',
	            d : '????',
	            dd : '%d ????',
	            M : '????????',
	            MM : '%d ????????',
	            y : '????????',
	            yy : '%d ????????'
	        },
	        meridiemParse: /??????????????|????????????????|??????????????|????????????????/,
	        isPM: function (input) {
	            return /^(??????????????|????????????????)$/.test(input);
	        },
	        meridiem : function (hour) {
	            if (hour < 4) {
	                return '??????????????';
	            } else if (hour < 12) {
	                return '????????????????';
	            } else if (hour < 17) {
	                return '??????????????';
	            } else {
	                return '????????????????';
	            }
	        },
	        ordinalParse: /\d{1,2}|\d{1,2}-(????|????)/,
	        ordinal: function (number, period) {
	            switch (period) {
	            case 'DDD':
	            case 'w':
	            case 'W':
	            case 'DDDo':
	                if (number === 1) {
	                    return number + '-????';
	                }
	                return number + '-????';
	            default:
	                return number;
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return hy_am;
	
	}));

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Bahasa Indonesia (id)
	//! author : Mohammad Satrio Utomo : https://github.com/tyok
	//! reference: http://id.wikisource.org/wiki/Pedoman_Umum_Ejaan_Bahasa_Indonesia_yang_Disempurnakan
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var id = moment.defineLocale('id', {
	        months : 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split('_'),
	        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des'.split('_'),
	        weekdays : 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
	        weekdaysShort : 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
	        weekdaysMin : 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
	        longDateFormat : {
	            LT : 'HH.mm',
	            LTS : 'HH.mm.ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY [pukul] HH.mm',
	            LLLL : 'dddd, D MMMM YYYY [pukul] HH.mm'
	        },
	        meridiemParse: /pagi|siang|sore|malam/,
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'pagi') {
	                return hour;
	            } else if (meridiem === 'siang') {
	                return hour >= 11 ? hour : hour + 12;
	            } else if (meridiem === 'sore' || meridiem === 'malam') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 11) {
	                return 'pagi';
	            } else if (hours < 15) {
	                return 'siang';
	            } else if (hours < 19) {
	                return 'sore';
	            } else {
	                return 'malam';
	            }
	        },
	        calendar : {
	            sameDay : '[Hari ini pukul] LT',
	            nextDay : '[Besok pukul] LT',
	            nextWeek : 'dddd [pukul] LT',
	            lastDay : '[Kemarin pukul] LT',
	            lastWeek : 'dddd [lalu pukul] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'dalam %s',
	            past : '%s yang lalu',
	            s : 'beberapa detik',
	            m : 'semenit',
	            mm : '%d menit',
	            h : 'sejam',
	            hh : '%d jam',
	            d : 'sehari',
	            dd : '%d hari',
	            M : 'sebulan',
	            MM : '%d bulan',
	            y : 'setahun',
	            yy : '%d tahun'
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return id;
	
	}));

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : icelandic (is)
	//! author : Hinrik ??rn Sigur??sson : https://github.com/hinrik
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function plural(n) {
	        if (n % 100 === 11) {
	            return true;
	        } else if (n % 10 === 1) {
	            return false;
	        }
	        return true;
	    }
	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        switch (key) {
	        case 's':
	            return withoutSuffix || isFuture ? 'nokkrar sek??ndur' : 'nokkrum sek??ndum';
	        case 'm':
	            return withoutSuffix ? 'm??n??ta' : 'm??n??tu';
	        case 'mm':
	            if (plural(number)) {
	                return result + (withoutSuffix || isFuture ? 'm??n??tur' : 'm??n??tum');
	            } else if (withoutSuffix) {
	                return result + 'm??n??ta';
	            }
	            return result + 'm??n??tu';
	        case 'hh':
	            if (plural(number)) {
	                return result + (withoutSuffix || isFuture ? 'klukkustundir' : 'klukkustundum');
	            }
	            return result + 'klukkustund';
	        case 'd':
	            if (withoutSuffix) {
	                return 'dagur';
	            }
	            return isFuture ? 'dag' : 'degi';
	        case 'dd':
	            if (plural(number)) {
	                if (withoutSuffix) {
	                    return result + 'dagar';
	                }
	                return result + (isFuture ? 'daga' : 'd??gum');
	            } else if (withoutSuffix) {
	                return result + 'dagur';
	            }
	            return result + (isFuture ? 'dag' : 'degi');
	        case 'M':
	            if (withoutSuffix) {
	                return 'm??nu??ur';
	            }
	            return isFuture ? 'm??nu??' : 'm??nu??i';
	        case 'MM':
	            if (plural(number)) {
	                if (withoutSuffix) {
	                    return result + 'm??nu??ir';
	                }
	                return result + (isFuture ? 'm??nu??i' : 'm??nu??um');
	            } else if (withoutSuffix) {
	                return result + 'm??nu??ur';
	            }
	            return result + (isFuture ? 'm??nu??' : 'm??nu??i');
	        case 'y':
	            return withoutSuffix || isFuture ? '??r' : '??ri';
	        case 'yy':
	            if (plural(number)) {
	                return result + (withoutSuffix || isFuture ? '??r' : '??rum');
	            }
	            return result + (withoutSuffix || isFuture ? '??r' : '??ri');
	        }
	    }
	
	    var is = moment.defineLocale('is', {
	        months : 'jan??ar_febr??ar_mars_apr??l_ma??_j??n??_j??l??_??g??st_september_okt??ber_n??vember_desember'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_ma??_j??n_j??l_??g??_sep_okt_n??v_des'.split('_'),
	        weekdays : 'sunnudagur_m??nudagur_??ri??judagur_mi??vikudagur_fimmtudagur_f??studagur_laugardagur'.split('_'),
	        weekdaysShort : 'sun_m??n_??ri_mi??_fim_f??s_lau'.split('_'),
	        weekdaysMin : 'Su_M??_??r_Mi_Fi_F??_La'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'H:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY [kl.] H:mm',
	            LLLL : 'dddd, D. MMMM YYYY [kl.] H:mm'
	        },
	        calendar : {
	            sameDay : '[?? dag kl.] LT',
	            nextDay : '[?? morgun kl.] LT',
	            nextWeek : 'dddd [kl.] LT',
	            lastDay : '[?? g??r kl.] LT',
	            lastWeek : '[s????asta] dddd [kl.] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'eftir %s',
	            past : 'fyrir %s s????an',
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : 'klukkustund',
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return is;
	
	}));

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : italian (it)
	//! author : Lorenzo : https://github.com/aliem
	//! author: Mattia Larentis: https://github.com/nostalgiaz
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var it = moment.defineLocale('it', {
	        months : 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split('_'),
	        monthsShort : 'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
	        weekdays : 'Domenica_Luned??_Marted??_Mercoled??_Gioved??_Venerd??_Sabato'.split('_'),
	        weekdaysShort : 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
	        weekdaysMin : 'D_L_Ma_Me_G_V_S'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd, D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[Oggi alle] LT',
	            nextDay: '[Domani alle] LT',
	            nextWeek: 'dddd [alle] LT',
	            lastDay: '[Ieri alle] LT',
	            lastWeek: function () {
	                switch (this.day()) {
	                    case 0:
	                        return '[la scorsa] dddd [alle] LT';
	                    default:
	                        return '[lo scorso] dddd [alle] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : function (s) {
	                return ((/^[0-9].+$/).test(s) ? 'tra' : 'in') + ' ' + s;
	            },
	            past : '%s fa',
	            s : 'alcuni secondi',
	            m : 'un minuto',
	            mm : '%d minuti',
	            h : 'un\'ora',
	            hh : '%d ore',
	            d : 'un giorno',
	            dd : '%d giorni',
	            M : 'un mese',
	            MM : '%d mesi',
	            y : 'un anno',
	            yy : '%d anni'
	        },
	        ordinalParse : /\d{1,2}??/,
	        ordinal: '%d??',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return it;
	
	}));

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : japanese (ja)
	//! author : LI Long : https://github.com/baryon
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ja = moment.defineLocale('ja', {
	        months : '1???_2???_3???_4???_5???_6???_7???_8???_9???_10???_11???_12???'.split('_'),
	        monthsShort : '1???_2???_3???_4???_5???_6???_7???_8???_9???_10???_11???_12???'.split('_'),
	        weekdays : '?????????_?????????_?????????_?????????_?????????_?????????_?????????'.split('_'),
	        weekdaysShort : '???_???_???_???_???_???_???'.split('_'),
	        weekdaysMin : '???_???_???_???_???_???_???'.split('_'),
	        longDateFormat : {
	            LT : 'Ah???m???',
	            LTS : 'Ah???m???s???',
	            L : 'YYYY/MM/DD',
	            LL : 'YYYY???M???D???',
	            LLL : 'YYYY???M???D???Ah???m???',
	            LLLL : 'YYYY???M???D???Ah???m??? dddd'
	        },
	        meridiemParse: /??????|??????/i,
	        isPM : function (input) {
	            return input === '??????';
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return '??????';
	            } else {
	                return '??????';
	            }
	        },
	        calendar : {
	            sameDay : '[??????] LT',
	            nextDay : '[??????] LT',
	            nextWeek : '[??????]dddd LT',
	            lastDay : '[??????] LT',
	            lastWeek : '[??????]dddd LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s???',
	            past : '%s???',
	            s : '??????',
	            m : '1???',
	            mm : '%d???',
	            h : '1??????',
	            hh : '%d??????',
	            d : '1???',
	            dd : '%d???',
	            M : '1??????',
	            MM : '%d??????',
	            y : '1???',
	            yy : '%d???'
	        }
	    });
	
	    return ja;
	
	}));

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Boso Jowo (jv)
	//! author : Rony Lantip : https://github.com/lantip
	//! reference: http://jv.wikipedia.org/wiki/Basa_Jawa
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var jv = moment.defineLocale('jv', {
	        months : 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_Nopember_Desember'.split('_'),
	        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nop_Des'.split('_'),
	        weekdays : 'Minggu_Senen_Seloso_Rebu_Kemis_Jemuwah_Septu'.split('_'),
	        weekdaysShort : 'Min_Sen_Sel_Reb_Kem_Jem_Sep'.split('_'),
	        weekdaysMin : 'Mg_Sn_Sl_Rb_Km_Jm_Sp'.split('_'),
	        longDateFormat : {
	            LT : 'HH.mm',
	            LTS : 'HH.mm.ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY [pukul] HH.mm',
	            LLLL : 'dddd, D MMMM YYYY [pukul] HH.mm'
	        },
	        meridiemParse: /enjing|siyang|sonten|ndalu/,
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'enjing') {
	                return hour;
	            } else if (meridiem === 'siyang') {
	                return hour >= 11 ? hour : hour + 12;
	            } else if (meridiem === 'sonten' || meridiem === 'ndalu') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 11) {
	                return 'enjing';
	            } else if (hours < 15) {
	                return 'siyang';
	            } else if (hours < 19) {
	                return 'sonten';
	            } else {
	                return 'ndalu';
	            }
	        },
	        calendar : {
	            sameDay : '[Dinten puniko pukul] LT',
	            nextDay : '[Mbenjang pukul] LT',
	            nextWeek : 'dddd [pukul] LT',
	            lastDay : '[Kala wingi pukul] LT',
	            lastWeek : 'dddd [kepengker pukul] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'wonten ing %s',
	            past : '%s ingkang kepengker',
	            s : 'sawetawis detik',
	            m : 'setunggal menit',
	            mm : '%d menit',
	            h : 'setunggal jam',
	            hh : '%d jam',
	            d : 'sedinten',
	            dd : '%d dinten',
	            M : 'sewulan',
	            MM : '%d wulan',
	            y : 'setaun',
	            yy : '%d taun'
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return jv;
	
	}));

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Georgian (ka)
	//! author : Irakli Janiashvili : https://github.com/irakli-janiashvili
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': '?????????????????????_???????????????????????????_???????????????_??????????????????_???????????????_??????????????????_??????????????????_?????????????????????_??????????????????????????????_???????????????????????????_????????????????????????_???????????????????????????'.split('_'),
	            'accusative': '?????????????????????_???????????????????????????_???????????????_?????????????????????_???????????????_??????????????????_??????????????????_?????????????????????_??????????????????????????????_???????????????????????????_????????????????????????_???????????????????????????'.split('_')
	        },
	        nounCase = (/D[oD] *MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';
	        return months[nounCase][m.month()];
	    }
	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': '???????????????_????????????????????????_???????????????????????????_???????????????????????????_???????????????????????????_???????????????????????????_??????????????????'.split('_'),
	            'accusative': '??????????????????_????????????????????????_???????????????????????????_???????????????????????????_???????????????????????????_???????????????????????????_??????????????????'.split('_')
	        },
	        nounCase = (/(????????????|??????????????????)/).test(format) ?
	            'accusative' :
	            'nominative';
	        return weekdays[nounCase][m.day()];
	    }
	
	    var ka = moment.defineLocale('ka', {
	        months : monthsCaseReplace,
	        monthsShort : '?????????_?????????_?????????_?????????_?????????_?????????_?????????_?????????_?????????_?????????_?????????_?????????'.split('_'),
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : '?????????_?????????_?????????_?????????_?????????_?????????_?????????'.split('_'),
	        weekdaysMin : '??????_??????_??????_??????_??????_??????_??????'.split('_'),
	        longDateFormat : {
	            LT : 'h:mm A',
	            LTS : 'h:mm:ss A',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY h:mm A',
	            LLLL : 'dddd, D MMMM YYYY h:mm A'
	        },
	        calendar : {
	            sameDay : '[????????????] LT[-??????]',
	            nextDay : '[????????????] LT[-??????]',
	            lastDay : '[???????????????] LT[-??????]',
	            nextWeek : '[??????????????????] dddd LT[-??????]',
	            lastWeek : '[????????????] dddd LT-??????',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : function (s) {
	                return (/(????????????|????????????|???????????????|????????????)/).test(s) ?
	                    s.replace(/???$/, '??????') :
	                    s + '??????';
	            },
	            past : function (s) {
	                if ((/(????????????|????????????|???????????????|?????????|?????????)/).test(s)) {
	                    return s.replace(/(???|???)$/, '?????? ?????????');
	                }
	                if ((/????????????/).test(s)) {
	                    return s.replace(/????????????$/, '???????????? ?????????');
	                }
	            },
	            s : '??????????????????????????? ????????????',
	            m : '????????????',
	            mm : '%d ????????????',
	            h : '???????????????',
	            hh : '%d ???????????????',
	            d : '?????????',
	            dd : '%d ?????????',
	            M : '?????????',
	            MM : '%d ?????????',
	            y : '????????????',
	            yy : '%d ????????????'
	        },
	        ordinalParse: /0|1-??????|??????-\d{1,2}|\d{1,2}-???/,
	        ordinal : function (number) {
	            if (number === 0) {
	                return number;
	            }
	            if (number === 1) {
	                return number + '-??????';
	            }
	            if ((number < 20) || (number <= 100 && (number % 20 === 0)) || (number % 100 === 0)) {
	                return '??????-' + number;
	            }
	            return number + '-???';
	        },
	        week : {
	            dow : 1,
	            doy : 7
	        }
	    });
	
	    return ka;
	
	}));

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : khmer (km)
	//! author : Kruy Vanna : https://github.com/kruyvanna
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var km = moment.defineLocale('km', {
	        months: '????????????_??????????????????_????????????_????????????_????????????_??????????????????_??????????????????_????????????_???????????????_????????????_????????????????????????_????????????'.split('_'),
	        monthsShort: '????????????_??????????????????_????????????_????????????_????????????_??????????????????_??????????????????_????????????_???????????????_????????????_????????????????????????_????????????'.split('_'),
	        weekdays: '?????????????????????_???????????????_??????????????????_?????????_??????????????????????????????_???????????????_????????????'.split('_'),
	        weekdaysShort: '?????????????????????_???????????????_??????????????????_?????????_??????????????????????????????_???????????????_????????????'.split('_'),
	        weekdaysMin: '?????????????????????_???????????????_??????????????????_?????????_??????????????????????????????_???????????????_????????????'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY HH:mm',
	            LLLL: 'dddd, D MMMM YYYY HH:mm'
	        },
	        calendar: {
	            sameDay: '[?????????????????? ????????????] LT',
	            nextDay: '[??????????????? ????????????] LT',
	            nextWeek: 'dddd [????????????] LT',
	            lastDay: '[???????????????????????? ????????????] LT',
	            lastWeek: 'dddd [??????????????????????????????] [????????????] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%s?????????',
	            past: '%s?????????',
	            s: '??????????????????????????????????????????',
	            m: '?????????????????????',
	            mm: '%d ????????????',
	            h: '?????????????????????',
	            hh: '%d ????????????',
	            d: '?????????????????????',
	            dd: '%d ????????????',
	            M: '???????????????',
	            MM: '%d ??????',
	            y: '????????????????????????',
	            yy: '%d ???????????????'
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return km;
	
	}));

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : korean (ko)
	//!
	//! authors
	//!
	//! - Kyungwook, Park : https://github.com/kyungw00k
	//! - Jeeeyul Lee <jeeeyul@gmail.com>
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ko = moment.defineLocale('ko', {
	        months : '1???_2???_3???_4???_5???_6???_7???_8???_9???_10???_11???_12???'.split('_'),
	        monthsShort : '1???_2???_3???_4???_5???_6???_7???_8???_9???_10???_11???_12???'.split('_'),
	        weekdays : '?????????_?????????_?????????_?????????_?????????_?????????_?????????'.split('_'),
	        weekdaysShort : '???_???_???_???_???_???_???'.split('_'),
	        weekdaysMin : '???_???_???_???_???_???_???'.split('_'),
	        longDateFormat : {
	            LT : 'A h??? m???',
	            LTS : 'A h??? m??? s???',
	            L : 'YYYY.MM.DD',
	            LL : 'YYYY??? MMMM D???',
	            LLL : 'YYYY??? MMMM D??? A h??? m???',
	            LLLL : 'YYYY??? MMMM D??? dddd A h??? m???'
	        },
	        calendar : {
	            sameDay : '?????? LT',
	            nextDay : '?????? LT',
	            nextWeek : 'dddd LT',
	            lastDay : '?????? LT',
	            lastWeek : '????????? dddd LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s ???',
	            past : '%s ???',
	            s : '??????',
	            ss : '%d???',
	            m : '??????',
	            mm : '%d???',
	            h : '?????????',
	            hh : '%d??????',
	            d : '??????',
	            dd : '%d???',
	            M : '??????',
	            MM : '%d???',
	            y : '??????',
	            yy : '%d???'
	        },
	        ordinalParse : /\d{1,2}???/,
	        ordinal : '%d???',
	        meridiemParse : /??????|??????/,
	        isPM : function (token) {
	            return token === '??????';
	        },
	        meridiem : function (hour, minute, isUpper) {
	            return hour < 12 ? '??????' : '??????';
	        }
	    });
	
	    return ko;
	
	}));

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Luxembourgish (lb)
	//! author : mweimerskirch : https://github.com/mweimerskirch, David Raison : https://github.com/kwisatz
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            'm': ['eng Minutt', 'enger Minutt'],
	            'h': ['eng Stonn', 'enger Stonn'],
	            'd': ['een Dag', 'engem Dag'],
	            'M': ['ee Mount', 'engem Mount'],
	            'y': ['ee Joer', 'engem Joer']
	        };
	        return withoutSuffix ? format[key][0] : format[key][1];
	    }
	    function processFutureTime(string) {
	        var number = string.substr(0, string.indexOf(' '));
	        if (eifelerRegelAppliesToNumber(number)) {
	            return 'a ' + string;
	        }
	        return 'an ' + string;
	    }
	    function processPastTime(string) {
	        var number = string.substr(0, string.indexOf(' '));
	        if (eifelerRegelAppliesToNumber(number)) {
	            return 'viru ' + string;
	        }
	        return 'virun ' + string;
	    }
	    /**
	     * Returns true if the word before the given number loses the '-n' ending.
	     * e.g. 'an 10 Deeg' but 'a 5 Deeg'
	     *
	     * @param number {integer}
	     * @returns {boolean}
	     */
	    function eifelerRegelAppliesToNumber(number) {
	        number = parseInt(number, 10);
	        if (isNaN(number)) {
	            return false;
	        }
	        if (number < 0) {
	            // Negative Number --> always true
	            return true;
	        } else if (number < 10) {
	            // Only 1 digit
	            if (4 <= number && number <= 7) {
	                return true;
	            }
	            return false;
	        } else if (number < 100) {
	            // 2 digits
	            var lastDigit = number % 10, firstDigit = number / 10;
	            if (lastDigit === 0) {
	                return eifelerRegelAppliesToNumber(firstDigit);
	            }
	            return eifelerRegelAppliesToNumber(lastDigit);
	        } else if (number < 10000) {
	            // 3 or 4 digits --> recursively check first digit
	            while (number >= 10) {
	                number = number / 10;
	            }
	            return eifelerRegelAppliesToNumber(number);
	        } else {
	            // Anything larger than 4 digits: recursively check first n-3 digits
	            number = number / 1000;
	            return eifelerRegelAppliesToNumber(number);
	        }
	    }
	
	    var lb = moment.defineLocale('lb', {
	        months: 'Januar_Februar_M??erz_Abr??ll_Mee_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
	        monthsShort: 'Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
	        weekdays: 'Sonndeg_M??indeg_D??nschdeg_M??ttwoch_Donneschdeg_Freideg_Samschdeg'.split('_'),
	        weekdaysShort: 'So._M??._D??._M??._Do._Fr._Sa.'.split('_'),
	        weekdaysMin: 'So_M??_D??_M??_Do_Fr_Sa'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm [Auer]',
	            LTS: 'H:mm:ss [Auer]',
	            L: 'DD.MM.YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY H:mm [Auer]',
	            LLLL: 'dddd, D. MMMM YYYY H:mm [Auer]'
	        },
	        calendar: {
	            sameDay: '[Haut um] LT',
	            sameElse: 'L',
	            nextDay: '[Muer um] LT',
	            nextWeek: 'dddd [um] LT',
	            lastDay: '[G??schter um] LT',
	            lastWeek: function () {
	                // Different date string for 'D??nschdeg' (Tuesday) and 'Donneschdeg' (Thursday) due to phonological rule
	                switch (this.day()) {
	                    case 2:
	                    case 4:
	                        return '[Leschten] dddd [um] LT';
	                    default:
	                        return '[Leschte] dddd [um] LT';
	                }
	            }
	        },
	        relativeTime : {
	            future : processFutureTime,
	            past : processPastTime,
	            s : 'e puer Sekonnen',
	            m : processRelativeTime,
	            mm : '%d Minutten',
	            h : processRelativeTime,
	            hh : '%d Stonnen',
	            d : processRelativeTime,
	            dd : '%d Deeg',
	            M : processRelativeTime,
	            MM : '%d M??int',
	            y : processRelativeTime,
	            yy : '%d Joer'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return lb;
	
	}));

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Lithuanian (lt)
	//! author : Mindaugas Moz??ras : https://github.com/mmozuras
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var units = {
	        'm' : 'minut??_minut??s_minut??',
	        'mm': 'minut??s_minu??i??_minutes',
	        'h' : 'valanda_valandos_valand??',
	        'hh': 'valandos_valand??_valandas',
	        'd' : 'diena_dienos_dien??',
	        'dd': 'dienos_dien??_dienas',
	        'M' : 'm??nuo_m??nesio_m??nes??',
	        'MM': 'm??nesiai_m??nesi??_m??nesius',
	        'y' : 'metai_met??_metus',
	        'yy': 'metai_met??_metus'
	    },
	    weekDays = 'sekmadienis_pirmadienis_antradienis_tre??iadienis_ketvirtadienis_penktadienis_??e??tadienis'.split('_');
	    function translateSeconds(number, withoutSuffix, key, isFuture) {
	        if (withoutSuffix) {
	            return 'kelios sekund??s';
	        } else {
	            return isFuture ? 'keli?? sekund??i??' : 'kelias sekundes';
	        }
	    }
	    function monthsCaseReplace(m, format) {
	        var months = {
	                'nominative': 'sausis_vasaris_kovas_balandis_gegu????_bir??elis_liepa_rugpj??tis_rugs??jis_spalis_lapkritis_gruodis'.split('_'),
	                'accusative': 'sausio_vasario_kovo_baland??io_gegu????s_bir??elio_liepos_rugpj????io_rugs??jo_spalio_lapkri??io_gruod??io'.split('_')
	            },
	            nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
	                'accusative' :
	                'nominative';
	        return months[nounCase][m.month()];
	    }
	    function translateSingular(number, withoutSuffix, key, isFuture) {
	        return withoutSuffix ? forms(key)[0] : (isFuture ? forms(key)[1] : forms(key)[2]);
	    }
	    function special(number) {
	        return number % 10 === 0 || (number > 10 && number < 20);
	    }
	    function forms(key) {
	        return units[key].split('_');
	    }
	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        if (number === 1) {
	            return result + translateSingular(number, withoutSuffix, key[0], isFuture);
	        } else if (withoutSuffix) {
	            return result + (special(number) ? forms(key)[1] : forms(key)[0]);
	        } else {
	            if (isFuture) {
	                return result + forms(key)[1];
	            } else {
	                return result + (special(number) ? forms(key)[1] : forms(key)[2]);
	            }
	        }
	    }
	    function relativeWeekDay(moment, format) {
	        var nominative = format.indexOf('dddd HH:mm') === -1,
	            weekDay = weekDays[moment.day()];
	        return nominative ? weekDay : weekDay.substring(0, weekDay.length - 2) + '??';
	    }
	
	    var lt = moment.defineLocale('lt', {
	        months : monthsCaseReplace,
	        monthsShort : 'sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd'.split('_'),
	        weekdays : relativeWeekDay,
	        weekdaysShort : 'Sek_Pir_Ant_Tre_Ket_Pen_??e??'.split('_'),
	        weekdaysMin : 'S_P_A_T_K_Pn_??'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'YYYY-MM-DD',
	            LL : 'YYYY [m.] MMMM D [d.]',
	            LLL : 'YYYY [m.] MMMM D [d.], HH:mm [val.]',
	            LLLL : 'YYYY [m.] MMMM D [d.], dddd, HH:mm [val.]',
	            l : 'YYYY-MM-DD',
	            ll : 'YYYY [m.] MMMM D [d.]',
	            lll : 'YYYY [m.] MMMM D [d.], HH:mm [val.]',
	            llll : 'YYYY [m.] MMMM D [d.], ddd, HH:mm [val.]'
	        },
	        calendar : {
	            sameDay : '[??iandien] LT',
	            nextDay : '[Rytoj] LT',
	            nextWeek : 'dddd LT',
	            lastDay : '[Vakar] LT',
	            lastWeek : '[Pra??jus??] dddd LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'po %s',
	            past : 'prie?? %s',
	            s : translateSeconds,
	            m : translateSingular,
	            mm : translate,
	            h : translateSingular,
	            hh : translate,
	            d : translateSingular,
	            dd : translate,
	            M : translateSingular,
	            MM : translate,
	            y : translateSingular,
	            yy : translate
	        },
	        ordinalParse: /\d{1,2}-oji/,
	        ordinal : function (number) {
	            return number + '-oji';
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return lt;
	
	}));

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : latvian (lv)
	//! author : Kristaps Karlsons : https://github.com/skakri
	//! author : J??nis Elmeris : https://github.com/JanisE
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var units = {
	        'm': 'min??tes_min??t??m_min??te_min??tes'.split('_'),
	        'mm': 'min??tes_min??t??m_min??te_min??tes'.split('_'),
	        'h': 'stundas_stund??m_stunda_stundas'.split('_'),
	        'hh': 'stundas_stund??m_stunda_stundas'.split('_'),
	        'd': 'dienas_dien??m_diena_dienas'.split('_'),
	        'dd': 'dienas_dien??m_diena_dienas'.split('_'),
	        'M': 'm??ne??a_m??ne??iem_m??nesis_m??ne??i'.split('_'),
	        'MM': 'm??ne??a_m??ne??iem_m??nesis_m??ne??i'.split('_'),
	        'y': 'gada_gadiem_gads_gadi'.split('_'),
	        'yy': 'gada_gadiem_gads_gadi'.split('_')
	    };
	    /**
	     * @param withoutSuffix boolean true = a length of time; false = before/after a period of time.
	     */
	    function format(forms, number, withoutSuffix) {
	        if (withoutSuffix) {
	            // E.g. "21 min??te", "3 min??tes".
	            return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
	        } else {
	            // E.g. "21 min??tes" as in "p??c 21 min??tes".
	            // E.g. "3 min??t??m" as in "p??c 3 min??t??m".
	            return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
	        }
	    }
	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        return number + ' ' + format(units[key], number, withoutSuffix);
	    }
	    function relativeTimeWithSingular(number, withoutSuffix, key) {
	        return format(units[key], number, withoutSuffix);
	    }
	    function relativeSeconds(number, withoutSuffix) {
	        return withoutSuffix ? 'da??as sekundes' : 'da????m sekund??m';
	    }
	
	    var lv = moment.defineLocale('lv', {
	        months : 'janv??ris_febru??ris_marts_apr??lis_maijs_j??nijs_j??lijs_augusts_septembris_oktobris_novembris_decembris'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_mai_j??n_j??l_aug_sep_okt_nov_dec'.split('_'),
	        weekdays : 'sv??tdiena_pirmdiena_otrdiena_tre??diena_ceturtdiena_piektdiena_sestdiena'.split('_'),
	        weekdaysShort : 'Sv_P_O_T_C_Pk_S'.split('_'),
	        weekdaysMin : 'Sv_P_O_T_C_Pk_S'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD.MM.YYYY.',
	            LL : 'YYYY. [gada] D. MMMM',
	            LLL : 'YYYY. [gada] D. MMMM, HH:mm',
	            LLLL : 'YYYY. [gada] D. MMMM, dddd, HH:mm'
	        },
	        calendar : {
	            sameDay : '[??odien pulksten] LT',
	            nextDay : '[R??t pulksten] LT',
	            nextWeek : 'dddd [pulksten] LT',
	            lastDay : '[Vakar pulksten] LT',
	            lastWeek : '[Pag??ju????] dddd [pulksten] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'p??c %s',
	            past : 'pirms %s',
	            s : relativeSeconds,
	            m : relativeTimeWithSingular,
	            mm : relativeTimeWithPlural,
	            h : relativeTimeWithSingular,
	            hh : relativeTimeWithPlural,
	            d : relativeTimeWithSingular,
	            dd : relativeTimeWithPlural,
	            M : relativeTimeWithSingular,
	            MM : relativeTimeWithPlural,
	            y : relativeTimeWithSingular,
	            yy : relativeTimeWithPlural
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return lv;
	
	}));

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Montenegrin (me)
	//! author : Miodrag Nika?? <miodrag@restartit.me> : https://github.com/miodragnikac
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var translator = {
	        words: { //Different grammatical cases
	            m: ['jedan minut', 'jednog minuta'],
	            mm: ['minut', 'minuta', 'minuta'],
	            h: ['jedan sat', 'jednog sata'],
	            hh: ['sat', 'sata', 'sati'],
	            dd: ['dan', 'dana', 'dana'],
	            MM: ['mjesec', 'mjeseca', 'mjeseci'],
	            yy: ['godina', 'godine', 'godina']
	        },
	        correctGrammaticalCase: function (number, wordKey) {
	            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
	        },
	        translate: function (number, withoutSuffix, key) {
	            var wordKey = translator.words[key];
	            if (key.length === 1) {
	                return withoutSuffix ? wordKey[0] : wordKey[1];
	            } else {
	                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
	            }
	        }
	    };
	
	    var me = moment.defineLocale('me', {
	        months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
	        monthsShort: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
	        weekdays: ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', '??etvrtak', 'petak', 'subota'],
	        weekdaysShort: ['ned.', 'pon.', 'uto.', 'sri.', '??et.', 'pet.', 'sub.'],
	        weekdaysMin: ['ne', 'po', 'ut', 'sr', '??e', 'pe', 'su'],
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS : 'H:mm:ss',
	            L: 'DD. MM. YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY H:mm',
	            LLLL: 'dddd, D. MMMM YYYY H:mm'
	        },
	        calendar: {
	            sameDay: '[danas u] LT',
	            nextDay: '[sjutra u] LT',
	
	            nextWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[u] [nedjelju] [u] LT';
	                case 3:
	                    return '[u] [srijedu] [u] LT';
	                case 6:
	                    return '[u] [subotu] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[u] dddd [u] LT';
	                }
	            },
	            lastDay  : '[ju??e u] LT',
	            lastWeek : function () {
	                var lastWeekDays = [
	                    '[pro??le] [nedjelje] [u] LT',
	                    '[pro??log] [ponedjeljka] [u] LT',
	                    '[pro??log] [utorka] [u] LT',
	                    '[pro??le] [srijede] [u] LT',
	                    '[pro??log] [??etvrtka] [u] LT',
	                    '[pro??log] [petka] [u] LT',
	                    '[pro??le] [subote] [u] LT'
	                ];
	                return lastWeekDays[this.day()];
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past   : 'prije %s',
	            s      : 'nekoliko sekundi',
	            m      : translator.translate,
	            mm     : translator.translate,
	            h      : translator.translate,
	            hh     : translator.translate,
	            d      : 'dan',
	            dd     : translator.translate,
	            M      : 'mjesec',
	            MM     : translator.translate,
	            y      : 'godinu',
	            yy     : translator.translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return me;
	
	}));

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : macedonian (mk)
	//! author : Borislav Mickov : https://github.com/B0k0
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var mk = moment.defineLocale('mk', {
	        months : '??????????????_????????????????_????????_??????????_??????_????????_????????_????????????_??????????????????_????????????????_??????????????_????????????????'.split('_'),
	        monthsShort : '??????_??????_??????_??????_??????_??????_??????_??????_??????_??????_??????_??????'.split('_'),
	        weekdays : '????????????_????????????????????_??????????????_??????????_????????????????_??????????_????????????'.split('_'),
	        weekdaysShort : '??????_??????_??????_??????_??????_??????_??????'.split('_'),
	        weekdaysMin : '??e_??o_????_????_????_????_??a'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'H:mm:ss',
	            L : 'D.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY H:mm',
	            LLLL : 'dddd, D MMMM YYYY H:mm'
	        },
	        calendar : {
	            sameDay : '[?????????? ????] LT',
	            nextDay : '[???????? ????] LT',
	            nextWeek : 'dddd [????] LT',
	            lastDay : '[?????????? ????] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                case 6:
	                    return '[???? ????????????????????] dddd [????] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[???? ????????????????????] dddd [????] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '?????????? %s',
	            past : '???????? %s',
	            s : '?????????????? ??????????????',
	            m : '????????????',
	            mm : '%d ????????????',
	            h : '??????',
	            hh : '%d ????????',
	            d : '??????',
	            dd : '%d ????????',
	            M : '??????????',
	            MM : '%d ????????????',
	            y : '????????????',
	            yy : '%d ????????????'
	        },
	        ordinalParse: /\d{1,2}-(????|????|????|????|????|????)/,
	        ordinal : function (number) {
	            var lastDigit = number % 10,
	                last2Digits = number % 100;
	            if (number === 0) {
	                return number + '-????';
	            } else if (last2Digits === 0) {
	                return number + '-????';
	            } else if (last2Digits > 10 && last2Digits < 20) {
	                return number + '-????';
	            } else if (lastDigit === 1) {
	                return number + '-????';
	            } else if (lastDigit === 2) {
	                return number + '-????';
	            } else if (lastDigit === 7 || lastDigit === 8) {
	                return number + '-????';
	            } else {
	                return number + '-????';
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return mk;
	
	}));

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : malayalam (ml)
	//! author : Floyd Pink : https://github.com/floydpink
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ml = moment.defineLocale('ml', {
	        months : '??????????????????_???????????????????????????_?????????????????????_??????????????????_????????????_?????????_????????????_????????????????????????_??????????????????????????????_?????????????????????_???????????????_??????????????????'.split('_'),
	        monthsShort : '?????????._??????????????????._?????????._???????????????._????????????_?????????_????????????._??????._?????????????????????._???????????????._?????????._????????????.'.split('_'),
	        weekdays : '????????????????????????_??????????????????????????????_???????????????????????????_????????????????????????_???????????????????????????_?????????????????????????????????_????????????????????????'.split('_'),
	        weekdaysShort : '????????????_??????????????????_???????????????_????????????_??????????????????_??????????????????_?????????'.split('_'),
	        weekdaysMin : '??????_??????_??????_??????_????????????_??????_???'.split('_'),
	        longDateFormat : {
	            LT : 'A h:mm -??????',
	            LTS : 'A h:mm:ss -??????',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, A h:mm -??????',
	            LLLL : 'dddd, D MMMM YYYY, A h:mm -??????'
	        },
	        calendar : {
	            sameDay : '[???????????????] LT',
	            nextDay : '[????????????] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[??????????????????] LT',
	            lastWeek : '[??????????????????] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s ?????????????????????',
	            past : '%s ???????????????',
	            s : '????????? ???????????????????????????',
	            m : '????????? ????????????????????????',
	            mm : '%d ????????????????????????',
	            h : '????????? ????????????????????????',
	            hh : '%d ????????????????????????',
	            d : '????????? ???????????????',
	            dd : '%d ???????????????',
	            M : '????????? ????????????',
	            MM : '%d ????????????',
	            y : '????????? ????????????',
	            yy : '%d ????????????'
	        },
	        meridiemParse: /??????????????????|??????????????????|???????????? ?????????????????????|??????????????????????????????|??????????????????/i,
	        isPM : function (input) {
	            return /^(???????????? ?????????????????????|??????????????????????????????|??????????????????)$/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return '??????????????????';
	            } else if (hour < 12) {
	                return '??????????????????';
	            } else if (hour < 17) {
	                return '???????????? ?????????????????????';
	            } else if (hour < 20) {
	                return '??????????????????????????????';
	            } else {
	                return '??????????????????';
	            }
	        }
	    });
	
	    return ml;
	
	}));

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Marathi (mr)
	//! author : Harshad Kale : https://github.com/kalehv
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '???',
	        '2': '???',
	        '3': '???',
	        '4': '???',
	        '5': '???',
	        '6': '???',
	        '7': '???',
	        '8': '???',
	        '9': '???',
	        '0': '???'
	    },
	    numberMap = {
	        '???': '1',
	        '???': '2',
	        '???': '3',
	        '???': '4',
	        '???': '5',
	        '???': '6',
	        '???': '7',
	        '???': '8',
	        '???': '9',
	        '???': '0'
	    };
	
	    var mr = moment.defineLocale('mr', {
	        months : '????????????????????????_??????????????????????????????_???????????????_??????????????????_??????_?????????_????????????_???????????????_????????????????????????_?????????????????????_???????????????????????????_?????????????????????'.split('_'),
	        monthsShort: '????????????._??????????????????._???????????????._???????????????._??????._?????????._????????????._??????._??????????????????._???????????????._?????????????????????._???????????????.'.split('_'),
	        weekdays : '??????????????????_??????????????????_?????????????????????_??????????????????_?????????????????????_????????????????????????_??????????????????'.split('_'),
	        weekdaysShort : '?????????_?????????_????????????_?????????_????????????_???????????????_?????????'.split('_'),
	        weekdaysMin : '???_??????_??????_??????_??????_??????_???'.split('_'),
	        longDateFormat : {
	            LT : 'A h:mm ???????????????',
	            LTS : 'A h:mm:ss ???????????????',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, A h:mm ???????????????',
	            LLLL : 'dddd, D MMMM YYYY, A h:mm ???????????????'
	        },
	        calendar : {
	            sameDay : '[??????] LT',
	            nextDay : '[???????????????] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[?????????] LT',
	            lastWeek: '[???????????????] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s ????????????',
	            past : '%s ??????????????????',
	            s : '???????????????',
	            m: '?????? ???????????????',
	            mm: '%d ??????????????????',
	            h : '?????? ?????????',
	            hh : '%d ?????????',
	            d : '?????? ????????????',
	            dd : '%d ????????????',
	            M : '?????? ???????????????',
	            MM : '%d ???????????????',
	            y : '?????? ????????????',
	            yy : '%d ???????????????'
	        },
	        preparse: function (string) {
	            return string.replace(/[??????????????????????????????]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiemParse: /??????????????????|???????????????|??????????????????|????????????????????????/,
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === '??????????????????') {
	                return hour < 4 ? hour : hour + 12;
	            } else if (meridiem === '???????????????') {
	                return hour;
	            } else if (meridiem === '??????????????????') {
	                return hour >= 10 ? hour : hour + 12;
	            } else if (meridiem === '????????????????????????') {
	                return hour + 12;
	            }
	        },
	        meridiem: function (hour, minute, isLower) {
	            if (hour < 4) {
	                return '??????????????????';
	            } else if (hour < 10) {
	                return '???????????????';
	            } else if (hour < 17) {
	                return '??????????????????';
	            } else if (hour < 20) {
	                return '????????????????????????';
	            } else {
	                return '??????????????????';
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return mr;
	
	}));

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Bahasa Malaysia (ms-MY)
	//! author : Weldan Jamili : https://github.com/weldan
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ms = moment.defineLocale('ms', {
	        months : 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
	        monthsShort : 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
	        weekdays : 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
	        weekdaysShort : 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
	        weekdaysMin : 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
	        longDateFormat : {
	            LT : 'HH.mm',
	            LTS : 'HH.mm.ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY [pukul] HH.mm',
	            LLLL : 'dddd, D MMMM YYYY [pukul] HH.mm'
	        },
	        meridiemParse: /pagi|tengahari|petang|malam/,
	        meridiemHour: function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'pagi') {
	                return hour;
	            } else if (meridiem === 'tengahari') {
	                return hour >= 11 ? hour : hour + 12;
	            } else if (meridiem === 'petang' || meridiem === 'malam') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 11) {
	                return 'pagi';
	            } else if (hours < 15) {
	                return 'tengahari';
	            } else if (hours < 19) {
	                return 'petang';
	            } else {
	                return 'malam';
	            }
	        },
	        calendar : {
	            sameDay : '[Hari ini pukul] LT',
	            nextDay : '[Esok pukul] LT',
	            nextWeek : 'dddd [pukul] LT',
	            lastDay : '[Kelmarin pukul] LT',
	            lastWeek : 'dddd [lepas pukul] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'dalam %s',
	            past : '%s yang lepas',
	            s : 'beberapa saat',
	            m : 'seminit',
	            mm : '%d minit',
	            h : 'sejam',
	            hh : '%d jam',
	            d : 'sehari',
	            dd : '%d hari',
	            M : 'sebulan',
	            MM : '%d bulan',
	            y : 'setahun',
	            yy : '%d tahun'
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ms;
	
	}));

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Bahasa Malaysia (ms-MY)
	//! author : Weldan Jamili : https://github.com/weldan
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ms_my = moment.defineLocale('ms-my', {
	        months : 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
	        monthsShort : 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
	        weekdays : 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
	        weekdaysShort : 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
	        weekdaysMin : 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
	        longDateFormat : {
	            LT : 'HH.mm',
	            LTS : 'HH.mm.ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY [pukul] HH.mm',
	            LLLL : 'dddd, D MMMM YYYY [pukul] HH.mm'
	        },
	        meridiemParse: /pagi|tengahari|petang|malam/,
	        meridiemHour: function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'pagi') {
	                return hour;
	            } else if (meridiem === 'tengahari') {
	                return hour >= 11 ? hour : hour + 12;
	            } else if (meridiem === 'petang' || meridiem === 'malam') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 11) {
	                return 'pagi';
	            } else if (hours < 15) {
	                return 'tengahari';
	            } else if (hours < 19) {
	                return 'petang';
	            } else {
	                return 'malam';
	            }
	        },
	        calendar : {
	            sameDay : '[Hari ini pukul] LT',
	            nextDay : '[Esok pukul] LT',
	            nextWeek : 'dddd [pukul] LT',
	            lastDay : '[Kelmarin pukul] LT',
	            lastWeek : 'dddd [lepas pukul] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'dalam %s',
	            past : '%s yang lepas',
	            s : 'beberapa saat',
	            m : 'seminit',
	            mm : '%d minit',
	            h : 'sejam',
	            hh : '%d jam',
	            d : 'sehari',
	            dd : '%d hari',
	            M : 'sebulan',
	            MM : '%d bulan',
	            y : 'setahun',
	            yy : '%d tahun'
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ms_my;
	
	}));

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Burmese (my)
	//! author : Squar team, mysquar.com
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '???',
	        '2': '???',
	        '3': '???',
	        '4': '???',
	        '5': '???',
	        '6': '???',
	        '7': '???',
	        '8': '???',
	        '9': '???',
	        '0': '???'
	    }, numberMap = {
	        '???': '1',
	        '???': '2',
	        '???': '3',
	        '???': '4',
	        '???': '5',
	        '???': '6',
	        '???': '7',
	        '???': '8',
	        '???': '9',
	        '???': '0'
	    };
	
	    var my = moment.defineLocale('my', {
	        months: '????????????????????????_??????????????????????????????_?????????_????????????_??????_????????????_?????????????????????_??????????????????_????????????????????????_??????????????????????????????_????????????????????????_?????????????????????'.split('_'),
	        monthsShort: '?????????_??????_?????????_?????????_??????_????????????_???????????????_??????_?????????_???????????????_?????????_??????'.split('_'),
	        weekdays: '???????????????????????????_?????????????????????_??????????????????_????????????????????????_????????????????????????_??????????????????_?????????'.split('_'),
	        weekdaysShort: '?????????_??????_??????_?????????_?????????_?????????_??????'.split('_'),
	        weekdaysMin: '?????????_??????_??????_?????????_?????????_?????????_??????'.split('_'),
	
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY HH:mm',
	            LLLL: 'dddd D MMMM YYYY HH:mm'
	        },
	        calendar: {
	            sameDay: '[?????????.] LT [?????????]',
	            nextDay: '[????????????????????????] LT [?????????]',
	            nextWeek: 'dddd LT [?????????]',
	            lastDay: '[?????????.???] LT [?????????]',
	            lastWeek: '[??????????????????????????????] dddd LT [?????????]',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '?????????????????? %s ?????????',
	            past: '?????????????????????????????? %s ???',
	            s: '??????????????????.????????????????????????',
	            m: '????????????????????????',
	            mm: '%d ???????????????',
	            h: '?????????????????????',
	            hh: '%d ????????????',
	            d: '??????????????????',
	            dd: '%d ?????????',
	            M: '????????????',
	            MM: '%d ???',
	            y: '?????????????????????',
	            yy: '%d ????????????'
	        },
	        preparse: function (string) {
	            return string.replace(/[??????????????????????????????]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return my;
	
	}));

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : norwegian bokm??l (nb)
	//! authors : Espen Hovlandsdal : https://github.com/rexxars
	//!           Sigurd Gartmann : https://github.com/sigurdga
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var nb = moment.defineLocale('nb', {
	        months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
	        weekdays : 's??ndag_mandag_tirsdag_onsdag_torsdag_fredag_l??rdag'.split('_'),
	        weekdaysShort : 's??n_man_tirs_ons_tors_fre_l??r'.split('_'),
	        weekdaysMin : 's??_ma_ti_on_to_fr_l??'.split('_'),
	        longDateFormat : {
	            LT : 'H.mm',
	            LTS : 'H.mm.ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY [kl.] H.mm',
	            LLLL : 'dddd D. MMMM YYYY [kl.] H.mm'
	        },
	        calendar : {
	            sameDay: '[i dag kl.] LT',
	            nextDay: '[i morgen kl.] LT',
	            nextWeek: 'dddd [kl.] LT',
	            lastDay: '[i g??r kl.] LT',
	            lastWeek: '[forrige] dddd [kl.] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'om %s',
	            past : 'for %s siden',
	            s : 'noen sekunder',
	            m : 'ett minutt',
	            mm : '%d minutter',
	            h : 'en time',
	            hh : '%d timer',
	            d : 'en dag',
	            dd : '%d dager',
	            M : 'en m??ned',
	            MM : '%d m??neder',
	            y : 'ett ??r',
	            yy : '%d ??r'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return nb;
	
	}));

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : nepali/nepalese
	//! author : suvash : https://github.com/suvash
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '???',
	        '2': '???',
	        '3': '???',
	        '4': '???',
	        '5': '???',
	        '6': '???',
	        '7': '???',
	        '8': '???',
	        '9': '???',
	        '0': '???'
	    },
	    numberMap = {
	        '???': '1',
	        '???': '2',
	        '???': '3',
	        '???': '4',
	        '???': '5',
	        '???': '6',
	        '???': '7',
	        '???': '8',
	        '???': '9',
	        '???': '0'
	    };
	
	    var ne = moment.defineLocale('ne', {
	        months : '???????????????_???????????????????????????_???????????????_??????????????????_??????_?????????_???????????????_???????????????_??????????????????????????????_?????????????????????_????????????????????????_????????????????????????'.split('_'),
	        monthsShort : '??????._??????????????????._???????????????_???????????????._??????_?????????_???????????????._??????._???????????????._???????????????._????????????._????????????.'.split('_'),
	        weekdays : '??????????????????_??????????????????_????????????????????????_??????????????????_?????????????????????_????????????????????????_??????????????????'.split('_'),
	        weekdaysShort : '?????????._?????????._???????????????._?????????._????????????._???????????????._?????????.'.split('_'),
	        weekdaysMin : '??????._??????._?????????_??????._??????._??????._???.'.split('_'),
	        longDateFormat : {
	            LT : 'A?????? h:mm ?????????',
	            LTS : 'A?????? h:mm:ss ?????????',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, A?????? h:mm ?????????',
	            LLLL : 'dddd, D MMMM YYYY, A?????? h:mm ?????????'
	        },
	        preparse: function (string) {
	            return string.replace(/[??????????????????????????????]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiemParse: /????????????|???????????????|??????????????????|??????????????????|????????????|????????????/,
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === '????????????') {
	                return hour < 3 ? hour : hour + 12;
	            } else if (meridiem === '???????????????') {
	                return hour;
	            } else if (meridiem === '??????????????????') {
	                return hour >= 10 ? hour : hour + 12;
	            } else if (meridiem === '??????????????????' || meridiem === '????????????') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 3) {
	                return '????????????';
	            } else if (hour < 10) {
	                return '???????????????';
	            } else if (hour < 15) {
	                return '??????????????????';
	            } else if (hour < 18) {
	                return '??????????????????';
	            } else if (hour < 20) {
	                return '????????????';
	            } else {
	                return '????????????';
	            }
	        },
	        calendar : {
	            sameDay : '[??????] LT',
	            nextDay : '[????????????] LT',
	            nextWeek : '[???????????????] dddd[,] LT',
	            lastDay : '[????????????] LT',
	            lastWeek : '[????????????] dddd[,] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s??????',
	            past : '%s ???????????????',
	            s : '???????????? ?????????',
	            m : '?????? ???????????????',
	            mm : '%d ???????????????',
	            h : '?????? ???????????????',
	            hh : '%d ???????????????',
	            d : '?????? ?????????',
	            dd : '%d ?????????',
	            M : '?????? ???????????????',
	            MM : '%d ???????????????',
	            y : '?????? ????????????',
	            yy : '%d ????????????'
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ne;
	
	}));

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : dutch (nl)
	//! author : Joris R??ling : https://github.com/jjupiter
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var monthsShortWithDots = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split('_'),
	        monthsShortWithoutDots = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_');
	
	    var nl = moment.defineLocale('nl', {
	        months : 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
	        monthsShort : function (m, format) {
	            if (/-MMM-/.test(format)) {
	                return monthsShortWithoutDots[m.month()];
	            } else {
	                return monthsShortWithDots[m.month()];
	            }
	        },
	        weekdays : 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
	        weekdaysShort : 'zo._ma._di._wo._do._vr._za.'.split('_'),
	        weekdaysMin : 'Zo_Ma_Di_Wo_Do_Vr_Za'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD-MM-YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[vandaag om] LT',
	            nextDay: '[morgen om] LT',
	            nextWeek: 'dddd [om] LT',
	            lastDay: '[gisteren om] LT',
	            lastWeek: '[afgelopen] dddd [om] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'over %s',
	            past : '%s geleden',
	            s : 'een paar seconden',
	            m : '????n minuut',
	            mm : '%d minuten',
	            h : '????n uur',
	            hh : '%d uur',
	            d : '????n dag',
	            dd : '%d dagen',
	            M : '????n maand',
	            MM : '%d maanden',
	            y : '????n jaar',
	            yy : '%d jaar'
	        },
	        ordinalParse: /\d{1,2}(ste|de)/,
	        ordinal : function (number) {
	            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return nl;
	
	}));

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : norwegian nynorsk (nn)
	//! author : https://github.com/mechuwind
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var nn = moment.defineLocale('nn', {
	        months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
	        weekdays : 'sundag_m??ndag_tysdag_onsdag_torsdag_fredag_laurdag'.split('_'),
	        weekdaysShort : 'sun_m??n_tys_ons_tor_fre_lau'.split('_'),
	        weekdaysMin : 'su_m??_ty_on_to_fr_l??'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[I dag klokka] LT',
	            nextDay: '[I morgon klokka] LT',
	            nextWeek: 'dddd [klokka] LT',
	            lastDay: '[I g??r klokka] LT',
	            lastWeek: '[F??reg??ande] dddd [klokka] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'om %s',
	            past : 'for %s sidan',
	            s : 'nokre sekund',
	            m : 'eit minutt',
	            mm : '%d minutt',
	            h : 'ein time',
	            hh : '%d timar',
	            d : 'ein dag',
	            dd : '%d dagar',
	            M : 'ein m??nad',
	            MM : '%d m??nader',
	            y : 'eit ??r',
	            yy : '%d ??r'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return nn;
	
	}));

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : polish (pl)
	//! author : Rafal Hirsz : https://github.com/evoL
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var monthsNominative = 'stycze??_luty_marzec_kwiecie??_maj_czerwiec_lipiec_sierpie??_wrzesie??_pa??dziernik_listopad_grudzie??'.split('_'),
	        monthsSubjective = 'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_wrze??nia_pa??dziernika_listopada_grudnia'.split('_');
	    function plural(n) {
	        return (n % 10 < 5) && (n % 10 > 1) && ((~~(n / 10) % 10) !== 1);
	    }
	    function translate(number, withoutSuffix, key) {
	        var result = number + ' ';
	        switch (key) {
	        case 'm':
	            return withoutSuffix ? 'minuta' : 'minut??';
	        case 'mm':
	            return result + (plural(number) ? 'minuty' : 'minut');
	        case 'h':
	            return withoutSuffix  ? 'godzina'  : 'godzin??';
	        case 'hh':
	            return result + (plural(number) ? 'godziny' : 'godzin');
	        case 'MM':
	            return result + (plural(number) ? 'miesi??ce' : 'miesi??cy');
	        case 'yy':
	            return result + (plural(number) ? 'lata' : 'lat');
	        }
	    }
	
	    var pl = moment.defineLocale('pl', {
	        months : function (momentToFormat, format) {
	            if (format === '') {
	                // Hack: if format empty we know this is used to generate
	                // RegExp by moment. Give then back both valid forms of months
	                // in RegExp ready format.
	                return '(' + monthsSubjective[momentToFormat.month()] + '|' + monthsNominative[momentToFormat.month()] + ')';
	            } else if (/D MMMM/.test(format)) {
	                return monthsSubjective[momentToFormat.month()];
	            } else {
	                return monthsNominative[momentToFormat.month()];
	            }
	        },
	        monthsShort : 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_pa??_lis_gru'.split('_'),
	        weekdays : 'niedziela_poniedzia??ek_wtorek_??roda_czwartek_pi??tek_sobota'.split('_'),
	        weekdaysShort : 'nie_pon_wt_??r_czw_pt_sb'.split('_'),
	        weekdaysMin : 'N_Pn_Wt_??r_Cz_Pt_So'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd, D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[Dzi?? o] LT',
	            nextDay: '[Jutro o] LT',
	            nextWeek: '[W] dddd [o] LT',
	            lastDay: '[Wczoraj o] LT',
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[W zesz???? niedziel?? o] LT';
	                case 3:
	                    return '[W zesz???? ??rod?? o] LT';
	                case 6:
	                    return '[W zesz???? sobot?? o] LT';
	                default:
	                    return '[W zesz??y] dddd [o] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past : '%s temu',
	            s : 'kilka sekund',
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : '1 dzie??',
	            dd : '%d dni',
	            M : 'miesi??c',
	            MM : translate,
	            y : 'rok',
	            yy : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return pl;
	
	}));

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : portuguese (pt)
	//! author : Jefferson : https://github.com/jalex79
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var pt = moment.defineLocale('pt', {
	        months : 'Janeiro_Fevereiro_Mar??o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
	        monthsShort : 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
	        weekdays : 'Domingo_Segunda-Feira_Ter??a-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_S??bado'.split('_'),
	        weekdaysShort : 'Dom_Seg_Ter_Qua_Qui_Sex_S??b'.split('_'),
	        weekdaysMin : 'Dom_2??_3??_4??_5??_6??_S??b'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D [de] MMMM [de] YYYY',
	            LLL : 'D [de] MMMM [de] YYYY HH:mm',
	            LLLL : 'dddd, D [de] MMMM [de] YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[Hoje ??s] LT',
	            nextDay: '[Amanh?? ??s] LT',
	            nextWeek: 'dddd [??s] LT',
	            lastDay: '[Ontem ??s] LT',
	            lastWeek: function () {
	                return (this.day() === 0 || this.day() === 6) ?
	                    '[??ltimo] dddd [??s] LT' : // Saturday + Sunday
	                    '[??ltima] dddd [??s] LT'; // Monday - Friday
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'em %s',
	            past : 'h?? %s',
	            s : 'segundos',
	            m : 'um minuto',
	            mm : '%d minutos',
	            h : 'uma hora',
	            hh : '%d horas',
	            d : 'um dia',
	            dd : '%d dias',
	            M : 'um m??s',
	            MM : '%d meses',
	            y : 'um ano',
	            yy : '%d anos'
	        },
	        ordinalParse: /\d{1,2}??/,
	        ordinal : '%d??',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return pt;
	
	}));

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : brazilian portuguese (pt-br)
	//! author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var pt_br = moment.defineLocale('pt-br', {
	        months : 'Janeiro_Fevereiro_Mar??o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
	        monthsShort : 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
	        weekdays : 'Domingo_Segunda-Feira_Ter??a-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_S??bado'.split('_'),
	        weekdaysShort : 'Dom_Seg_Ter_Qua_Qui_Sex_S??b'.split('_'),
	        weekdaysMin : 'Dom_2??_3??_4??_5??_6??_S??b'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D [de] MMMM [de] YYYY',
	            LLL : 'D [de] MMMM [de] YYYY [??s] HH:mm',
	            LLLL : 'dddd, D [de] MMMM [de] YYYY [??s] HH:mm'
	        },
	        calendar : {
	            sameDay: '[Hoje ??s] LT',
	            nextDay: '[Amanh?? ??s] LT',
	            nextWeek: 'dddd [??s] LT',
	            lastDay: '[Ontem ??s] LT',
	            lastWeek: function () {
	                return (this.day() === 0 || this.day() === 6) ?
	                    '[??ltimo] dddd [??s] LT' : // Saturday + Sunday
	                    '[??ltima] dddd [??s] LT'; // Monday - Friday
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'em %s',
	            past : '%s atr??s',
	            s : 'poucos segundos',
	            m : 'um minuto',
	            mm : '%d minutos',
	            h : 'uma hora',
	            hh : '%d horas',
	            d : 'um dia',
	            dd : '%d dias',
	            M : 'um m??s',
	            MM : '%d meses',
	            y : 'um ano',
	            yy : '%d anos'
	        },
	        ordinalParse: /\d{1,2}??/,
	        ordinal : '%d??'
	    });
	
	    return pt_br;
	
	}));

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : romanian (ro)
	//! author : Vlad Gurdiga : https://github.com/gurdiga
	//! author : Valentin Agachi : https://github.com/avaly
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	                'mm': 'minute',
	                'hh': 'ore',
	                'dd': 'zile',
	                'MM': 'luni',
	                'yy': 'ani'
	            },
	            separator = ' ';
	        if (number % 100 >= 20 || (number >= 100 && number % 100 === 0)) {
	            separator = ' de ';
	        }
	        return number + separator + format[key];
	    }
	
	    var ro = moment.defineLocale('ro', {
	        months : 'ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie'.split('_'),
	        monthsShort : 'ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.'.split('_'),
	        weekdays : 'duminic??_luni_mar??i_miercuri_joi_vineri_s??mb??t??'.split('_'),
	        weekdaysShort : 'Dum_Lun_Mar_Mie_Joi_Vin_S??m'.split('_'),
	        weekdaysMin : 'Du_Lu_Ma_Mi_Jo_Vi_S??'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'H:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY H:mm',
	            LLLL : 'dddd, D MMMM YYYY H:mm'
	        },
	        calendar : {
	            sameDay: '[azi la] LT',
	            nextDay: '[m??ine la] LT',
	            nextWeek: 'dddd [la] LT',
	            lastDay: '[ieri la] LT',
	            lastWeek: '[fosta] dddd [la] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'peste %s',
	            past : '%s ??n urm??',
	            s : 'c??teva secunde',
	            m : 'un minut',
	            mm : relativeTimeWithPlural,
	            h : 'o or??',
	            hh : relativeTimeWithPlural,
	            d : 'o zi',
	            dd : relativeTimeWithPlural,
	            M : 'o lun??',
	            MM : relativeTimeWithPlural,
	            y : 'un an',
	            yy : relativeTimeWithPlural
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ro;
	
	}));

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : russian (ru)
	//! author : Viktorminator : https://github.com/Viktorminator
	//! Author : Menelion Elens??le : https://github.com/Oire
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function plural(word, num) {
	        var forms = word.split('_');
	        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
	    }
	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': withoutSuffix ? '????????????_????????????_??????????' : '????????????_????????????_??????????',
	            'hh': '??????_????????_??????????',
	            'dd': '????????_??????_????????',
	            'MM': '??????????_????????????_??????????????',
	            'yy': '??????_????????_??????'
	        };
	        if (key === 'm') {
	            return withoutSuffix ? '????????????' : '????????????';
	        }
	        else {
	            return number + ' ' + plural(format[key], +number);
	        }
	    }
	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': '????????????_??????????????_????????_????????????_??????_????????_????????_????????????_????????????????_??????????????_????????????_??????????????'.split('_'),
	            'accusative': '????????????_??????????????_??????????_????????????_??????_????????_????????_??????????????_????????????????_??????????????_????????????_??????????????'.split('_')
	        },
	        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';
	        return months[nounCase][m.month()];
	    }
	    function monthsShortCaseReplace(m, format) {
	        var monthsShort = {
	            'nominative': '??????_??????_????????_??????_??????_????????_????????_??????_??????_??????_??????_??????'.split('_'),
	            'accusative': '??????_??????_??????_??????_??????_????????_????????_??????_??????_??????_??????_??????'.split('_')
	        },
	        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';
	        return monthsShort[nounCase][m.month()];
	    }
	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': '??????????????????????_??????????????????????_??????????????_??????????_??????????????_??????????????_??????????????'.split('_'),
	            'accusative': '??????????????????????_??????????????????????_??????????????_??????????_??????????????_??????????????_??????????????'.split('_')
	        },
	        nounCase = (/\[ ?[????] ?(?:??????????????|??????????????????|??????)? ?\] ?dddd/).test(format) ?
	            'accusative' :
	            'nominative';
	        return weekdays[nounCase][m.day()];
	    }
	
	    var ru = moment.defineLocale('ru', {
	        months : monthsCaseReplace,
	        monthsShort : monthsShortCaseReplace,
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : '????_????_????_????_????_????_????'.split('_'),
	        weekdaysMin : '????_????_????_????_????_????_????'.split('_'),
	        monthsParse : [/^??????/i, /^??????/i, /^??????/i, /^??????/i, /^????[??|??]/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i],
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY ??.',
	            LLL : 'D MMMM YYYY ??., HH:mm',
	            LLLL : 'dddd, D MMMM YYYY ??., HH:mm'
	        },
	        calendar : {
	            sameDay: '[?????????????? ??] LT',
	            nextDay: '[???????????? ??] LT',
	            lastDay: '[?????????? ??] LT',
	            nextWeek: function () {
	                return this.day() === 2 ? '[????] dddd [??] LT' : '[??] dddd [??] LT';
	            },
	            lastWeek: function (now) {
	                if (now.week() !== this.week()) {
	                    switch (this.day()) {
	                    case 0:
	                        return '[?? ??????????????] dddd [??] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                        return '[?? ??????????????] dddd [??] LT';
	                    case 3:
	                    case 5:
	                    case 6:
	                        return '[?? ??????????????] dddd [??] LT';
	                    }
	                } else {
	                    if (this.day() === 2) {
	                        return '[????] dddd [??] LT';
	                    } else {
	                        return '[??] dddd [??] LT';
	                    }
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : '?????????? %s',
	            past : '%s ??????????',
	            s : '?????????????????? ????????????',
	            m : relativeTimeWithPlural,
	            mm : relativeTimeWithPlural,
	            h : '??????',
	            hh : relativeTimeWithPlural,
	            d : '????????',
	            dd : relativeTimeWithPlural,
	            M : '??????????',
	            MM : relativeTimeWithPlural,
	            y : '??????',
	            yy : relativeTimeWithPlural
	        },
	        meridiemParse: /????????|????????|??????|????????????/i,
	        isPM : function (input) {
	            return /^(??????|????????????)$/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return '????????';
	            } else if (hour < 12) {
	                return '????????';
	            } else if (hour < 17) {
	                return '??????';
	            } else {
	                return '????????????';
	            }
	        },
	        ordinalParse: /\d{1,2}-(??|????|??)/,
	        ordinal: function (number, period) {
	            switch (period) {
	            case 'M':
	            case 'd':
	            case 'DDD':
	                return number + '-??';
	            case 'D':
	                return number + '-????';
	            case 'w':
	            case 'W':
	                return number + '-??';
	            default:
	                return number;
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ru;
	
	}));

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Sinhalese (si)
	//! author : Sampath Sitinamaluwa : https://github.com/sampathsris
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var si = moment.defineLocale('si', {
	        months : '??????????????????_????????????????????????_??????????????????_????????????????????????_????????????_????????????_????????????_?????????????????????_?????????????????????????????????_????????????????????????_???????????????????????????_???????????????????????????'.split('_'),
	        monthsShort : '??????_?????????_????????????_?????????_????????????_????????????_????????????_?????????_????????????_?????????_????????????_????????????'.split('_'),
	        weekdays : '???????????????_???????????????_???????????????????????????_???????????????_??????????????????????????????????????????_????????????????????????_???????????????????????????'.split('_'),
	        weekdaysShort : '?????????_?????????_??????_?????????_???????????????_????????????_?????????'.split('_'),
	        weekdaysMin : '???_???_???_???_????????????_??????_??????'.split('_'),
	        longDateFormat : {
	            LT : 'a h:mm',
	            LTS : 'a h:mm:ss',
	            L : 'YYYY/MM/DD',
	            LL : 'YYYY MMMM D',
	            LLL : 'YYYY MMMM D, a h:mm',
	            LLLL : 'YYYY MMMM D [????????????] dddd, a h:mm:ss'
	        },
	        calendar : {
	            sameDay : '[??????] LT[???]',
	            nextDay : '[?????????] LT[???]',
	            nextWeek : 'dddd LT[???]',
	            lastDay : '[?????????] LT[???]',
	            lastWeek : '[??????????????????] dddd LT[???]',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s????????????',
	            past : '%s?????? ?????????',
	            s : '??????????????? ??????????????????',
	            m : '???????????????????????????',
	            mm : '???????????????????????? %d',
	            h : '?????????',
	            hh : '????????? %d',
	            d : '????????????',
	            dd : '????????? %d',
	            M : '????????????',
	            MM : '????????? %d',
	            y : '?????????',
	            yy : '????????? %d'
	        },
	        ordinalParse: /\d{1,2} ????????????/,
	        ordinal : function (number) {
	            return number + ' ????????????';
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? '???.???.' : '????????? ?????????';
	            } else {
	                return isLower ? '??????.???.' : '????????? ?????????';
	            }
	        }
	    });
	
	    return si;
	
	}));

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : slovak (sk)
	//! author : Martin Minka : https://github.com/k2s
	//! based on work of petrbela : https://github.com/petrbela
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var months = 'janu??r_febru??r_marec_apr??l_m??j_j??n_j??l_august_september_okt??ber_november_december'.split('_'),
	        monthsShort = 'jan_feb_mar_apr_m??j_j??n_j??l_aug_sep_okt_nov_dec'.split('_');
	    function plural(n) {
	        return (n > 1) && (n < 5);
	    }
	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        switch (key) {
	        case 's':  // a few seconds / in a few seconds / a few seconds ago
	            return (withoutSuffix || isFuture) ? 'p??r sek??nd' : 'p??r sekundami';
	        case 'm':  // a minute / in a minute / a minute ago
	            return withoutSuffix ? 'min??ta' : (isFuture ? 'min??tu' : 'min??tou');
	        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'min??ty' : 'min??t');
	            } else {
	                return result + 'min??tami';
	            }
	            break;
	        case 'h':  // an hour / in an hour / an hour ago
	            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
	        case 'hh': // 9 hours / in 9 hours / 9 hours ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'hodiny' : 'hod??n');
	            } else {
	                return result + 'hodinami';
	            }
	            break;
	        case 'd':  // a day / in a day / a day ago
	            return (withoutSuffix || isFuture) ? 'de??' : 'd??om';
	        case 'dd': // 9 days / in 9 days / 9 days ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'dni' : 'dn??');
	            } else {
	                return result + 'd??ami';
	            }
	            break;
	        case 'M':  // a month / in a month / a month ago
	            return (withoutSuffix || isFuture) ? 'mesiac' : 'mesiacom';
	        case 'MM': // 9 months / in 9 months / 9 months ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'mesiace' : 'mesiacov');
	            } else {
	                return result + 'mesiacmi';
	            }
	            break;
	        case 'y':  // a year / in a year / a year ago
	            return (withoutSuffix || isFuture) ? 'rok' : 'rokom';
	        case 'yy': // 9 years / in 9 years / 9 years ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'roky' : 'rokov');
	            } else {
	                return result + 'rokmi';
	            }
	            break;
	        }
	    }
	
	    var sk = moment.defineLocale('sk', {
	        months : months,
	        monthsShort : monthsShort,
	        monthsParse : (function (months, monthsShort) {
	            var i, _monthsParse = [];
	            for (i = 0; i < 12; i++) {
	                // use custom parser to solve problem with July (??ervenec)
	                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
	            }
	            return _monthsParse;
	        }(months, monthsShort)),
	        weekdays : 'nede??a_pondelok_utorok_streda_??tvrtok_piatok_sobota'.split('_'),
	        weekdaysShort : 'ne_po_ut_st_??t_pi_so'.split('_'),
	        weekdaysMin : 'ne_po_ut_st_??t_pi_so'.split('_'),
	        longDateFormat : {
	            LT: 'H:mm',
	            LTS : 'H:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY H:mm',
	            LLLL : 'dddd D. MMMM YYYY H:mm'
	        },
	        calendar : {
	            sameDay: '[dnes o] LT',
	            nextDay: '[zajtra o] LT',
	            nextWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[v nede??u o] LT';
	                case 1:
	                case 2:
	                    return '[v] dddd [o] LT';
	                case 3:
	                    return '[v stredu o] LT';
	                case 4:
	                    return '[vo ??tvrtok o] LT';
	                case 5:
	                    return '[v piatok o] LT';
	                case 6:
	                    return '[v sobotu o] LT';
	                }
	            },
	            lastDay: '[v??era o] LT',
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[minul?? nede??u o] LT';
	                case 1:
	                case 2:
	                    return '[minul??] dddd [o] LT';
	                case 3:
	                    return '[minul?? stredu o] LT';
	                case 4:
	                case 5:
	                    return '[minul??] dddd [o] LT';
	                case 6:
	                    return '[minul?? sobotu o] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past : 'pred %s',
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return sk;
	
	}));

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : slovenian (sl)
	//! author : Robert Sedov??ek : https://github.com/sedovsek
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        switch (key) {
	        case 's':
	            return withoutSuffix || isFuture ? 'nekaj sekund' : 'nekaj sekundami';
	        case 'm':
	            return withoutSuffix ? 'ena minuta' : 'eno minuto';
	        case 'mm':
	            if (number === 1) {
	                result += withoutSuffix ? 'minuta' : 'minuto';
	            } else if (number === 2) {
	                result += withoutSuffix || isFuture ? 'minuti' : 'minutama';
	            } else if (number < 5) {
	                result += withoutSuffix || isFuture ? 'minute' : 'minutami';
	            } else {
	                result += withoutSuffix || isFuture ? 'minut' : 'minutami';
	            }
	            return result;
	        case 'h':
	            return withoutSuffix ? 'ena ura' : 'eno uro';
	        case 'hh':
	            if (number === 1) {
	                result += withoutSuffix ? 'ura' : 'uro';
	            } else if (number === 2) {
	                result += withoutSuffix || isFuture ? 'uri' : 'urama';
	            } else if (number < 5) {
	                result += withoutSuffix || isFuture ? 'ure' : 'urami';
	            } else {
	                result += withoutSuffix || isFuture ? 'ur' : 'urami';
	            }
	            return result;
	        case 'd':
	            return withoutSuffix || isFuture ? 'en dan' : 'enim dnem';
	        case 'dd':
	            if (number === 1) {
	                result += withoutSuffix || isFuture ? 'dan' : 'dnem';
	            } else if (number === 2) {
	                result += withoutSuffix || isFuture ? 'dni' : 'dnevoma';
	            } else {
	                result += withoutSuffix || isFuture ? 'dni' : 'dnevi';
	            }
	            return result;
	        case 'M':
	            return withoutSuffix || isFuture ? 'en mesec' : 'enim mesecem';
	        case 'MM':
	            if (number === 1) {
	                result += withoutSuffix || isFuture ? 'mesec' : 'mesecem';
	            } else if (number === 2) {
	                result += withoutSuffix || isFuture ? 'meseca' : 'mesecema';
	            } else if (number < 5) {
	                result += withoutSuffix || isFuture ? 'mesece' : 'meseci';
	            } else {
	                result += withoutSuffix || isFuture ? 'mesecev' : 'meseci';
	            }
	            return result;
	        case 'y':
	            return withoutSuffix || isFuture ? 'eno leto' : 'enim letom';
	        case 'yy':
	            if (number === 1) {
	                result += withoutSuffix || isFuture ? 'leto' : 'letom';
	            } else if (number === 2) {
	                result += withoutSuffix || isFuture ? 'leti' : 'letoma';
	            } else if (number < 5) {
	                result += withoutSuffix || isFuture ? 'leta' : 'leti';
	            } else {
	                result += withoutSuffix || isFuture ? 'let' : 'leti';
	            }
	            return result;
	        }
	    }
	
	    var sl = moment.defineLocale('sl', {
	        months : 'januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december'.split('_'),
	        monthsShort : 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
	        weekdays : 'nedelja_ponedeljek_torek_sreda_??etrtek_petek_sobota'.split('_'),
	        weekdaysShort : 'ned._pon._tor._sre._??et._pet._sob.'.split('_'),
	        weekdaysMin : 'ne_po_to_sr_??e_pe_so'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'H:mm:ss',
	            L : 'DD. MM. YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY H:mm',
	            LLLL : 'dddd, D. MMMM YYYY H:mm'
	        },
	        calendar : {
	            sameDay  : '[danes ob] LT',
	            nextDay  : '[jutri ob] LT',
	
	            nextWeek : function () {
	                switch (this.day()) {
	                case 0:
	                    return '[v] [nedeljo] [ob] LT';
	                case 3:
	                    return '[v] [sredo] [ob] LT';
	                case 6:
	                    return '[v] [soboto] [ob] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[v] dddd [ob] LT';
	                }
	            },
	            lastDay  : '[v??eraj ob] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                    return '[prej??njo] [nedeljo] [ob] LT';
	                case 3:
	                    return '[prej??njo] [sredo] [ob] LT';
	                case 6:
	                    return '[prej??njo] [soboto] [ob] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[prej??nji] dddd [ob] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '??ez %s',
	            past   : 'pred %s',
	            s      : processRelativeTime,
	            m      : processRelativeTime,
	            mm     : processRelativeTime,
	            h      : processRelativeTime,
	            hh     : processRelativeTime,
	            d      : processRelativeTime,
	            dd     : processRelativeTime,
	            M      : processRelativeTime,
	            MM     : processRelativeTime,
	            y      : processRelativeTime,
	            yy     : processRelativeTime
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return sl;
	
	}));

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Albanian (sq)
	//! author : Flak??rim Ismani : https://github.com/flakerimi
	//! author: Menelion Elens??le: https://github.com/Oire (tests)
	//! author : Oerd Cukalla : https://github.com/oerd (fixes)
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var sq = moment.defineLocale('sq', {
	        months : 'Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_N??ntor_Dhjetor'.split('_'),
	        monthsShort : 'Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_N??n_Dhj'.split('_'),
	        weekdays : 'E Diel_E H??n??_E Mart??_E M??rkur??_E Enjte_E Premte_E Shtun??'.split('_'),
	        weekdaysShort : 'Die_H??n_Mar_M??r_Enj_Pre_Sht'.split('_'),
	        weekdaysMin : 'D_H_Ma_M??_E_P_Sh'.split('_'),
	        meridiemParse: /PD|MD/,
	        isPM: function (input) {
	            return input.charAt(0) === 'M';
	        },
	        meridiem : function (hours, minutes, isLower) {
	            return hours < 12 ? 'PD' : 'MD';
	        },
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd, D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay : '[Sot n??] LT',
	            nextDay : '[Nes??r n??] LT',
	            nextWeek : 'dddd [n??] LT',
	            lastDay : '[Dje n??] LT',
	            lastWeek : 'dddd [e kaluar n??] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'n?? %s',
	            past : '%s m?? par??',
	            s : 'disa sekonda',
	            m : 'nj?? minut??',
	            mm : '%d minuta',
	            h : 'nj?? or??',
	            hh : '%d or??',
	            d : 'nj?? dit??',
	            dd : '%d dit??',
	            M : 'nj?? muaj',
	            MM : '%d muaj',
	            y : 'nj?? vit',
	            yy : '%d vite'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return sq;
	
	}));

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Serbian-latin (sr)
	//! author : Milan Jana??kovi??<milanjanackovic@gmail.com> : https://github.com/milan-j
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var translator = {
	        words: { //Different grammatical cases
	            m: ['jedan minut', 'jedne minute'],
	            mm: ['minut', 'minute', 'minuta'],
	            h: ['jedan sat', 'jednog sata'],
	            hh: ['sat', 'sata', 'sati'],
	            dd: ['dan', 'dana', 'dana'],
	            MM: ['mesec', 'meseca', 'meseci'],
	            yy: ['godina', 'godine', 'godina']
	        },
	        correctGrammaticalCase: function (number, wordKey) {
	            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
	        },
	        translate: function (number, withoutSuffix, key) {
	            var wordKey = translator.words[key];
	            if (key.length === 1) {
	                return withoutSuffix ? wordKey[0] : wordKey[1];
	            } else {
	                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
	            }
	        }
	    };
	
	    var sr = moment.defineLocale('sr', {
	        months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
	        monthsShort: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
	        weekdays: ['nedelja', 'ponedeljak', 'utorak', 'sreda', '??etvrtak', 'petak', 'subota'],
	        weekdaysShort: ['ned.', 'pon.', 'uto.', 'sre.', '??et.', 'pet.', 'sub.'],
	        weekdaysMin: ['ne', 'po', 'ut', 'sr', '??e', 'pe', 'su'],
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS : 'H:mm:ss',
	            L: 'DD. MM. YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY H:mm',
	            LLLL: 'dddd, D. MMMM YYYY H:mm'
	        },
	        calendar: {
	            sameDay: '[danas u] LT',
	            nextDay: '[sutra u] LT',
	            nextWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[u] [nedelju] [u] LT';
	                case 3:
	                    return '[u] [sredu] [u] LT';
	                case 6:
	                    return '[u] [subotu] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[u] dddd [u] LT';
	                }
	            },
	            lastDay  : '[ju??e u] LT',
	            lastWeek : function () {
	                var lastWeekDays = [
	                    '[pro??le] [nedelje] [u] LT',
	                    '[pro??log] [ponedeljka] [u] LT',
	                    '[pro??log] [utorka] [u] LT',
	                    '[pro??le] [srede] [u] LT',
	                    '[pro??log] [??etvrtka] [u] LT',
	                    '[pro??log] [petka] [u] LT',
	                    '[pro??le] [subote] [u] LT'
	                ];
	                return lastWeekDays[this.day()];
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past   : 'pre %s',
	            s      : 'nekoliko sekundi',
	            m      : translator.translate,
	            mm     : translator.translate,
	            h      : translator.translate,
	            hh     : translator.translate,
	            d      : 'dan',
	            dd     : translator.translate,
	            M      : 'mesec',
	            MM     : translator.translate,
	            y      : 'godinu',
	            yy     : translator.translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return sr;
	
	}));

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Serbian-cyrillic (sr-cyrl)
	//! author : Milan Jana??kovi??<milanjanackovic@gmail.com> : https://github.com/milan-j
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var translator = {
	        words: { //Different grammatical cases
	            m: ['?????????? ??????????', '?????????? ????????????'],
	            mm: ['??????????', '????????????', '????????????'],
	            h: ['?????????? ??????', '???????????? ????????'],
	            hh: ['??????', '????????', '????????'],
	            dd: ['??????', '????????', '????????'],
	            MM: ['??????????', '????????????', '????????????'],
	            yy: ['????????????', '????????????', '????????????']
	        },
	        correctGrammaticalCase: function (number, wordKey) {
	            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
	        },
	        translate: function (number, withoutSuffix, key) {
	            var wordKey = translator.words[key];
	            if (key.length === 1) {
	                return withoutSuffix ? wordKey[0] : wordKey[1];
	            } else {
	                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
	            }
	        }
	    };
	
	    var sr_cyrl = moment.defineLocale('sr-cyrl', {
	        months: ['????????????', '??????????????', '????????', '??????????', '??????', '??????', '??????', '????????????', '??????????????????', '??????????????', '????????????????', '????????????????'],
	        monthsShort: ['??????.', '??????.', '??????.', '??????.', '??????', '??????', '??????', '??????.', '??????.', '??????.', '??????.', '??????.'],
	        weekdays: ['????????????', '??????????????????', '????????????', '??????????', '????????????????', '??????????', '????????????'],
	        weekdaysShort: ['??????.', '??????.', '??????.', '??????.', '??????.', '??????.', '??????.'],
	        weekdaysMin: ['????', '????', '????', '????', '????', '????', '????'],
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS : 'H:mm:ss',
	            L: 'DD. MM. YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY H:mm',
	            LLLL: 'dddd, D. MMMM YYYY H:mm'
	        },
	        calendar: {
	            sameDay: '[?????????? ??] LT',
	            nextDay: '[?????????? ??] LT',
	            nextWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[??] [????????????] [??] LT';
	                case 3:
	                    return '[??] [??????????] [??] LT';
	                case 6:
	                    return '[??] [????????????] [??] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[??] dddd [??] LT';
	                }
	            },
	            lastDay  : '[???????? ??] LT',
	            lastWeek : function () {
	                var lastWeekDays = [
	                    '[????????????] [????????????] [??] LT',
	                    '[??????????????] [??????????????????] [??] LT',
	                    '[??????????????] [????????????] [??] LT',
	                    '[????????????] [??????????] [??] LT',
	                    '[??????????????] [????????????????] [??] LT',
	                    '[??????????????] [??????????] [??] LT',
	                    '[????????????] [????????????] [??] LT'
	                ];
	                return lastWeekDays[this.day()];
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '???? %s',
	            past   : '?????? %s',
	            s      : '???????????????? ??????????????',
	            m      : translator.translate,
	            mm     : translator.translate,
	            h      : translator.translate,
	            hh     : translator.translate,
	            d      : '??????',
	            dd     : translator.translate,
	            M      : '??????????',
	            MM     : translator.translate,
	            y      : '????????????',
	            yy     : translator.translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return sr_cyrl;
	
	}));

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : swedish (sv)
	//! author : Jens Alm : https://github.com/ulmus
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var sv = moment.defineLocale('sv', {
	        months : 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
	        weekdays : 's??ndag_m??ndag_tisdag_onsdag_torsdag_fredag_l??rdag'.split('_'),
	        weekdaysShort : 's??n_m??n_tis_ons_tor_fre_l??r'.split('_'),
	        weekdaysMin : 's??_m??_ti_on_to_fr_l??'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'YYYY-MM-DD',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[Idag] LT',
	            nextDay: '[Imorgon] LT',
	            lastDay: '[Ig??r] LT',
	            nextWeek: '[P??] dddd LT',
	            lastWeek: '[I] dddd[s] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'om %s',
	            past : 'f??r %s sedan',
	            s : 'n??gra sekunder',
	            m : 'en minut',
	            mm : '%d minuter',
	            h : 'en timme',
	            hh : '%d timmar',
	            d : 'en dag',
	            dd : '%d dagar',
	            M : 'en m??nad',
	            MM : '%d m??nader',
	            y : 'ett ??r',
	            yy : '%d ??r'
	        },
	        ordinalParse: /\d{1,2}(e|a)/,
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (~~(number % 100 / 10) === 1) ? 'e' :
	                (b === 1) ? 'a' :
	                (b === 2) ? 'a' :
	                (b === 3) ? 'e' : 'e';
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return sv;
	
	}));

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : tamil (ta)
	//! author : Arjunkumar Krishnamoorthy : https://github.com/tk120404
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ta = moment.defineLocale('ta', {
	        months : '???????????????_????????????????????????_??????????????????_??????????????????_??????_????????????_????????????_??????????????????_?????????????????????????????????_???????????????????????????_?????????????????????_????????????????????????'.split('_'),
	        monthsShort : '???????????????_????????????????????????_??????????????????_??????????????????_??????_????????????_????????????_??????????????????_?????????????????????????????????_???????????????????????????_?????????????????????_????????????????????????'.split('_'),
	        weekdays : '?????????????????????????????????????????????_????????????????????????????????????_???????????????????????????????????????_??????????????????????????????_????????????????????????????????????_???????????????????????????????????????_??????????????????????????????'.split('_'),
	        weekdaysShort : '??????????????????_?????????????????????_????????????????????????_???????????????_?????????????????????_??????????????????_?????????'.split('_'),
	        weekdaysMin : '??????_??????_??????_??????_??????_??????_???'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, HH:mm',
	            LLLL : 'dddd, D MMMM YYYY, HH:mm'
	        },
	        calendar : {
	            sameDay : '[???????????????] LT',
	            nextDay : '[????????????] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[??????????????????] LT',
	            lastWeek : '[??????????????? ???????????????] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s ?????????',
	            past : '%s ????????????',
	            s : '????????? ????????? ???????????????????????????',
	            m : '????????? ?????????????????????',
	            mm : '%d ??????????????????????????????',
	            h : '????????? ????????? ???????????????',
	            hh : '%d ????????? ???????????????',
	            d : '????????? ????????????',
	            dd : '%d ?????????????????????',
	            M : '????????? ???????????????',
	            MM : '%d ????????????????????????',
	            y : '????????? ??????????????????',
	            yy : '%d ????????????????????????'
	        },
	        ordinalParse: /\d{1,2}?????????/,
	        ordinal : function (number) {
	            return number + '?????????';
	        },
	        // refer http://ta.wikipedia.org/s/1er1
	        meridiemParse: /???????????????|???????????????|????????????|?????????????????????|?????????????????????|????????????/,
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 2) {
	                return ' ???????????????';
	            } else if (hour < 6) {
	                return ' ???????????????';  // ???????????????
	            } else if (hour < 10) {
	                return ' ????????????'; // ????????????
	            } else if (hour < 14) {
	                return ' ?????????????????????'; // ?????????????????????
	            } else if (hour < 18) {
	                return ' ?????????????????????'; // ?????????????????????
	            } else if (hour < 22) {
	                return ' ????????????'; // ????????????
	            } else {
	                return ' ???????????????';
	            }
	        },
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === '???????????????') {
	                return hour < 2 ? hour : hour + 12;
	            } else if (meridiem === '???????????????' || meridiem === '????????????') {
	                return hour;
	            } else if (meridiem === '?????????????????????') {
	                return hour >= 10 ? hour : hour + 12;
	            } else {
	                return hour + 12;
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ta;
	
	}));

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : thai (th)
	//! author : Kridsada Thanabulpong : https://github.com/sirn
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var th = moment.defineLocale('th', {
	        months : '??????????????????_??????????????????????????????_??????????????????_??????????????????_?????????????????????_????????????????????????_?????????????????????_?????????????????????_?????????????????????_??????????????????_???????????????????????????_?????????????????????'.split('_'),
	        monthsShort : '????????????_???????????????_????????????_????????????_???????????????_??????????????????_???????????????_???????????????_???????????????_????????????_?????????????????????_???????????????'.split('_'),
	        weekdays : '?????????????????????_??????????????????_??????????????????_?????????_????????????????????????_???????????????_???????????????'.split('_'),
	        weekdaysShort : '?????????????????????_??????????????????_??????????????????_?????????_???????????????_???????????????_???????????????'.split('_'), // yes, three characters difference
	        weekdaysMin : '??????._???._???._???._??????._???._???.'.split('_'),
	        longDateFormat : {
	            LT : 'H ?????????????????? m ????????????',
	            LTS : 'H ?????????????????? m ???????????? s ??????????????????',
	            L : 'YYYY/MM/DD',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY ???????????? H ?????????????????? m ????????????',
	            LLLL : '?????????dddd????????? D MMMM YYYY ???????????? H ?????????????????? m ????????????'
	        },
	        meridiemParse: /??????????????????????????????|??????????????????????????????/,
	        isPM: function (input) {
	            return input === '??????????????????????????????';
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return '??????????????????????????????';
	            } else {
	                return '??????????????????????????????';
	            }
	        },
	        calendar : {
	            sameDay : '[?????????????????? ????????????] LT',
	            nextDay : '[???????????????????????? ????????????] LT',
	            nextWeek : 'dddd[???????????? ????????????] LT',
	            lastDay : '[????????????????????????????????? ????????????] LT',
	            lastWeek : '[?????????]dddd[????????????????????? ????????????] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '????????? %s',
	            past : '%s?????????????????????',
	            s : '????????????????????????????????????',
	            m : '1 ????????????',
	            mm : '%d ????????????',
	            h : '1 ?????????????????????',
	            hh : '%d ?????????????????????',
	            d : '1 ?????????',
	            dd : '%d ?????????',
	            M : '1 ???????????????',
	            MM : '%d ???????????????',
	            y : '1 ??????',
	            yy : '%d ??????'
	        }
	    });
	
	    return th;
	
	}));

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Tagalog/Filipino (tl-ph)
	//! author : Dan Hagman
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var tl_ph = moment.defineLocale('tl-ph', {
	        months : 'Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre'.split('_'),
	        monthsShort : 'Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis'.split('_'),
	        weekdays : 'Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado'.split('_'),
	        weekdaysShort : 'Lin_Lun_Mar_Miy_Huw_Biy_Sab'.split('_'),
	        weekdaysMin : 'Li_Lu_Ma_Mi_Hu_Bi_Sab'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'MM/D/YYYY',
	            LL : 'MMMM D, YYYY',
	            LLL : 'MMMM D, YYYY HH:mm',
	            LLLL : 'dddd, MMMM DD, YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[Ngayon sa] LT',
	            nextDay: '[Bukas sa] LT',
	            nextWeek: 'dddd [sa] LT',
	            lastDay: '[Kahapon sa] LT',
	            lastWeek: 'dddd [huling linggo] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'sa loob ng %s',
	            past : '%s ang nakalipas',
	            s : 'ilang segundo',
	            m : 'isang minuto',
	            mm : '%d minuto',
	            h : 'isang oras',
	            hh : '%d oras',
	            d : 'isang araw',
	            dd : '%d araw',
	            M : 'isang buwan',
	            MM : '%d buwan',
	            y : 'isang taon',
	            yy : '%d taon'
	        },
	        ordinalParse: /\d{1,2}/,
	        ordinal : function (number) {
	            return number;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return tl_ph;
	
	}));

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : turkish (tr)
	//! authors : Erhan Gundogan : https://github.com/erhangundogan,
	//!           Burak Yi??it Kaya: https://github.com/BYK
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var suffixes = {
	        1: '\'inci',
	        5: '\'inci',
	        8: '\'inci',
	        70: '\'inci',
	        80: '\'inci',
	        2: '\'nci',
	        7: '\'nci',
	        20: '\'nci',
	        50: '\'nci',
	        3: '\'??nc??',
	        4: '\'??nc??',
	        100: '\'??nc??',
	        6: '\'nc??',
	        9: '\'uncu',
	        10: '\'uncu',
	        30: '\'uncu',
	        60: '\'??nc??',
	        90: '\'??nc??'
	    };
	
	    var tr = moment.defineLocale('tr', {
	        months : 'Ocak_??ubat_Mart_Nisan_May??s_Haziran_Temmuz_A??ustos_Eyl??l_Ekim_Kas??m_Aral??k'.split('_'),
	        monthsShort : 'Oca_??ub_Mar_Nis_May_Haz_Tem_A??u_Eyl_Eki_Kas_Ara'.split('_'),
	        weekdays : 'Pazar_Pazartesi_Sal??_??ar??amba_Per??embe_Cuma_Cumartesi'.split('_'),
	        weekdaysShort : 'Paz_Pts_Sal_??ar_Per_Cum_Cts'.split('_'),
	        weekdaysMin : 'Pz_Pt_Sa_??a_Pe_Cu_Ct'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd, D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay : '[bug??n saat] LT',
	            nextDay : '[yar??n saat] LT',
	            nextWeek : '[haftaya] dddd [saat] LT',
	            lastDay : '[d??n] LT',
	            lastWeek : '[ge??en hafta] dddd [saat] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s sonra',
	            past : '%s ??nce',
	            s : 'birka?? saniye',
	            m : 'bir dakika',
	            mm : '%d dakika',
	            h : 'bir saat',
	            hh : '%d saat',
	            d : 'bir g??n',
	            dd : '%d g??n',
	            M : 'bir ay',
	            MM : '%d ay',
	            y : 'bir y??l',
	            yy : '%d y??l'
	        },
	        ordinalParse: /\d{1,2}'(inci|nci|??nc??|nc??|uncu|??nc??)/,
	        ordinal : function (number) {
	            if (number === 0) {  // special case for zero
	                return number + '\'??nc??';
	            }
	            var a = number % 10,
	                b = number % 100 - a,
	                c = number >= 100 ? 100 : null;
	            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return tr;
	
	}));

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : talossan (tzl)
	//! author : Robin van der Vliet : https://github.com/robin0van0der0v with the help of Iust?? Canun
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	
	    var tzl = moment.defineLocale('tzl', {
	        months : 'Januar_Fevraglh_Mar??_Avr??u_Mai_G??n_Julia_Guscht_Setemvar_Listop??ts_Noemvar_Zecemvar'.split('_'),
	        monthsShort : 'Jan_Fev_Mar_Avr_Mai_G??n_Jul_Gus_Set_Lis_Noe_Zec'.split('_'),
	        weekdays : 'S??ladi_L??ne??i_Maitzi_M??rcuri_Xh??adi_Vi??ner??i_S??turi'.split('_'),
	        weekdaysShort : 'S??l_L??n_Mai_M??r_Xh??_Vi??_S??t'.split('_'),
	        weekdaysMin : 'S??_L??_Ma_M??_Xh_Vi_S??'.split('_'),
	        longDateFormat : {
	            LT : 'HH.mm',
	            LTS : 'LT.ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D. MMMM [dallas] YYYY',
	            LLL : 'D. MMMM [dallas] YYYY LT',
	            LLLL : 'dddd, [li] D. MMMM [dallas] YYYY LT'
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? 'd\'o' : 'D\'O';
	            } else {
	                return isLower ? 'd\'a' : 'D\'A';
	            }
	        },
	        calendar : {
	            sameDay : '[oxhi ??] LT',
	            nextDay : '[dem?? ??] LT',
	            nextWeek : 'dddd [??] LT',
	            lastDay : '[ieiri ??] LT',
	            lastWeek : '[s??r el] dddd [lasteu ??] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'osprei %s',
	            past : 'ja%s',
	            s : processRelativeTime,
	            m : processRelativeTime,
	            mm : processRelativeTime,
	            h : processRelativeTime,
	            hh : processRelativeTime,
	            d : processRelativeTime,
	            dd : processRelativeTime,
	            M : processRelativeTime,
	            MM : processRelativeTime,
	            y : processRelativeTime,
	            yy : processRelativeTime
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            's': ['viensas secunds', '\'iensas secunds'],
	            'm': ['\'n m??ut', '\'iens m??ut'],
	            'mm': [number + ' m??uts', ' ' + number + ' m??uts'],
	            'h': ['\'n ??ora', '\'iensa ??ora'],
	            'hh': [number + ' ??oras', ' ' + number + ' ??oras'],
	            'd': ['\'n ziua', '\'iensa ziua'],
	            'dd': [number + ' ziuas', ' ' + number + ' ziuas'],
	            'M': ['\'n mes', '\'iens mes'],
	            'MM': [number + ' mesen', ' ' + number + ' mesen'],
	            'y': ['\'n ar', '\'iens ar'],
	            'yy': [number + ' ars', ' ' + number + ' ars']
	        };
	        return isFuture ? format[key][0] : (withoutSuffix ? format[key][0] : format[key][1].trim());
	    }
	
	    return tzl;
	
	}));

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Morocco Central Atlas Tamazi??t (tzm)
	//! author : Abdel Said : https://github.com/abdelsaid
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var tzm = moment.defineLocale('tzm', {
	        months : '??????????????????_???????????????_????????????_???????????????_???????????????_???????????????_??????????????????_????????????_????????????????????????_???????????????_????????????????????????_?????????????????????'.split('_'),
	        monthsShort : '??????????????????_???????????????_????????????_???????????????_???????????????_???????????????_??????????????????_????????????_????????????????????????_???????????????_????????????????????????_?????????????????????'.split('_'),
	        weekdays : '??????????????????_???????????????_??????????????????_???????????????_???????????????_?????????????????????_?????????????????????'.split('_'),
	        weekdaysShort : '??????????????????_???????????????_??????????????????_???????????????_???????????????_?????????????????????_?????????????????????'.split('_'),
	        weekdaysMin : '??????????????????_???????????????_??????????????????_???????????????_???????????????_?????????????????????_?????????????????????'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[???????????? ???] LT',
	            nextDay: '[???????????? ???] LT',
	            nextWeek: 'dddd [???] LT',
	            lastDay: '[??????????????? ???] LT',
	            lastWeek: 'dddd [???] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : '???????????? ??? ????????? %s',
	            past : '????????? %s',
	            s : '????????????',
	            m : '???????????????',
	            mm : '%d ???????????????',
	            h : '????????????',
	            hh : '%d ????????????????????????',
	            d : '?????????',
	            dd : '%d o????????????',
	            M : '??????o??????',
	            MM : '%d ??????????????????',
	            y : '???????????????',
	            yy : '%d ??????????????????'
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return tzm;
	
	}));

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Morocco Central Atlas Tamazi??t in Latin (tzm-latn)
	//! author : Abdel Said : https://github.com/abdelsaid
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var tzm_latn = moment.defineLocale('tzm-latn', {
	        months : 'innayr_br??ayr??_mar??s??_ibrir_mayyw_ywnyw_ywlywz_??w??t_??wtanbir_kt??wbr??_nwwanbir_dwjnbir'.split('_'),
	        monthsShort : 'innayr_br??ayr??_mar??s??_ibrir_mayyw_ywnyw_ywlywz_??w??t_??wtanbir_kt??wbr??_nwwanbir_dwjnbir'.split('_'),
	        weekdays : 'asamas_aynas_asinas_akras_akwas_asimwas_asi???yas'.split('_'),
	        weekdaysShort : 'asamas_aynas_asinas_akras_akwas_asimwas_asi???yas'.split('_'),
	        weekdaysMin : 'asamas_aynas_asinas_akras_akwas_asimwas_asi???yas'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'dddd D MMMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[asdkh g] LT',
	            nextDay: '[aska g] LT',
	            nextWeek: 'dddd [g] LT',
	            lastDay: '[assant g] LT',
	            lastWeek: 'dddd [g] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'dadkh s yan %s',
	            past : 'yan %s',
	            s : 'imik',
	            m : 'minu???',
	            mm : '%d minu???',
	            h : 'sa??a',
	            hh : '%d tassa??in',
	            d : 'ass',
	            dd : '%d ossan',
	            M : 'ayowr',
	            MM : '%d iyyirn',
	            y : 'asgas',
	            yy : '%d isgasn'
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return tzm_latn;
	
	}));

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : ukrainian (uk)
	//! author : zemlanin : https://github.com/zemlanin
	//! Author : Menelion Elens??le : https://github.com/Oire
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function plural(word, num) {
	        var forms = word.split('_');
	        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
	    }
	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': '??????????????_??????????????_????????????',
	            'hh': '????????????_????????????_??????????',
	            'dd': '????????_??????_????????',
	            'MM': '????????????_????????????_??????????????',
	            'yy': '??????_????????_??????????'
	        };
	        if (key === 'm') {
	            return withoutSuffix ? '??????????????' : '??????????????';
	        }
	        else if (key === 'h') {
	            return withoutSuffix ? '????????????' : '????????????';
	        }
	        else {
	            return number + ' ' + plural(format[key], +number);
	        }
	    }
	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': '????????????_??????????_????????????????_??????????????_??????????????_??????????????_????????????_??????????????_????????????????_??????????????_????????????????_??????????????'.split('_'),
	            'accusative': '??????????_????????????_??????????????_????????????_????????????_????????????_??????????_????????????_??????????????_????????????_??????????????????_????????????'.split('_')
	        },
	        nounCase = (/D[oD]? *MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';
	        return months[nounCase][m.month()];
	    }
	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': '????????????_??????????????????_????????????????_????????????_????????????_?????????????????_????????????'.split('_'),
	            'accusative': '????????????_??????????????????_????????????????_????????????_????????????_?????????????????_????????????'.split('_'),
	            'genitive': '????????????_??????????????????_????????????????_????????????_????????????????_?????????????????_????????????'.split('_')
	        },
	        nounCase = (/(\[[????????]\]) ?dddd/).test(format) ?
	            'accusative' :
	            ((/\[?(?:??????????????|??????????????????)? ?\] ?dddd/).test(format) ?
	                'genitive' :
	                'nominative');
	        return weekdays[nounCase][m.day()];
	    }
	    function processHoursFunction(str) {
	        return function () {
	            return str + '??' + (this.hours() === 11 ? '??' : '') + '] LT';
	        };
	    }
	
	    var uk = moment.defineLocale('uk', {
	        months : monthsCaseReplace,
	        monthsShort : '??????_??????_??????_????????_????????_????????_??????_????????_??????_????????_????????_????????'.split('_'),
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : '????_????_????_????_????_????_????'.split('_'),
	        weekdaysMin : '????_????_????_????_????_????_????'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY ??.',
	            LLL : 'D MMMM YYYY ??., HH:mm',
	            LLLL : 'dddd, D MMMM YYYY ??., HH:mm'
	        },
	        calendar : {
	            sameDay: processHoursFunction('[???????????????? '),
	            nextDay: processHoursFunction('[???????????? '),
	            lastDay: processHoursFunction('[?????????? '),
	            nextWeek: processHoursFunction('[??] dddd ['),
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                case 5:
	                case 6:
	                    return processHoursFunction('[??????????????] dddd [').call(this);
	                case 1:
	                case 2:
	                case 4:
	                    return processHoursFunction('[????????????????] dddd [').call(this);
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : '???? %s',
	            past : '%s ????????',
	            s : '???????????????? ????????????',
	            m : relativeTimeWithPlural,
	            mm : relativeTimeWithPlural,
	            h : '????????????',
	            hh : relativeTimeWithPlural,
	            d : '????????',
	            dd : relativeTimeWithPlural,
	            M : '????????????',
	            MM : relativeTimeWithPlural,
	            y : '??????',
	            yy : relativeTimeWithPlural
	        },
	        // M. E.: those two are virtually unused but a user might want to implement them for his/her website for some reason
	        meridiemParse: /????????|??????????|??????|????????????/,
	        isPM: function (input) {
	            return /^(??????|????????????)$/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return '????????';
	            } else if (hour < 12) {
	                return '??????????';
	            } else if (hour < 17) {
	                return '??????';
	            } else {
	                return '????????????';
	            }
	        },
	        ordinalParse: /\d{1,2}-(??|????)/,
	        ordinal: function (number, period) {
	            switch (period) {
	            case 'M':
	            case 'd':
	            case 'DDD':
	            case 'w':
	            case 'W':
	                return number + '-??';
	            case 'D':
	                return number + '-????';
	            default:
	                return number;
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return uk;
	
	}));

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : uzbek (uz)
	//! author : Sardor Muminov : https://github.com/muminoff
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var uz = moment.defineLocale('uz', {
	        months : '????????????_??????????????_????????_????????????_??????_????????_????????_????????????_????????????????_??????????????_????????????_??????????????'.split('_'),
	        monthsShort : '??????_??????_??????_??????_??????_??????_??????_??????_??????_??????_??????_??????'.split('_'),
	        weekdays : '??????????????_??????????????_??????????????_????????????????_????????????????_????????_??????????'.split('_'),
	        weekdaysShort : '??????_??????_??????_??????_??????_??????_??????'.split('_'),
	        weekdaysMin : '????_????_????_????_????_????_????'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY HH:mm',
	            LLLL : 'D MMMM YYYY, dddd HH:mm'
	        },
	        calendar : {
	            sameDay : '[?????????? ????????] LT [????]',
	            nextDay : '[????????????] LT [????]',
	            nextWeek : 'dddd [???????? ????????] LT [????]',
	            lastDay : '[???????? ????????] LT [????]',
	            lastWeek : '[??????????] dddd [???????? ????????] LT [????]',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '???????? %s ??????????',
	            past : '?????? ???????? %s ??????????',
	            s : '????????????',
	            m : '?????? ????????????',
	            mm : '%d ????????????',
	            h : '?????? ????????',
	            hh : '%d ????????',
	            d : '?????? ??????',
	            dd : '%d ??????',
	            M : '?????? ????',
	            MM : '%d ????',
	            y : '?????? ??????',
	            yy : '%d ??????'
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return uz;
	
	}));

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : vietnamese (vi)
	//! author : Bang Nguyen : https://github.com/bangnk
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var vi = moment.defineLocale('vi', {
	        months : 'th??ng 1_th??ng 2_th??ng 3_th??ng 4_th??ng 5_th??ng 6_th??ng 7_th??ng 8_th??ng 9_th??ng 10_th??ng 11_th??ng 12'.split('_'),
	        monthsShort : 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
	        weekdays : 'ch??? nh???t_th??? hai_th??? ba_th??? t??_th??? n??m_th??? s??u_th??? b???y'.split('_'),
	        weekdaysShort : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
	        weekdaysMin : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM [n??m] YYYY',
	            LLL : 'D MMMM [n??m] YYYY HH:mm',
	            LLLL : 'dddd, D MMMM [n??m] YYYY HH:mm',
	            l : 'DD/M/YYYY',
	            ll : 'D MMM YYYY',
	            lll : 'D MMM YYYY HH:mm',
	            llll : 'ddd, D MMM YYYY HH:mm'
	        },
	        calendar : {
	            sameDay: '[H??m nay l??c] LT',
	            nextDay: '[Ng??y mai l??c] LT',
	            nextWeek: 'dddd [tu???n t???i l??c] LT',
	            lastDay: '[H??m qua l??c] LT',
	            lastWeek: 'dddd [tu???n r???i l??c] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : '%s t???i',
	            past : '%s tr?????c',
	            s : 'v??i gi??y',
	            m : 'm???t ph??t',
	            mm : '%d ph??t',
	            h : 'm???t gi???',
	            hh : '%d gi???',
	            d : 'm???t ng??y',
	            dd : '%d ng??y',
	            M : 'm???t th??ng',
	            MM : '%d th??ng',
	            y : 'm???t n??m',
	            yy : '%d n??m'
	        },
	        ordinalParse: /\d{1,2}/,
	        ordinal : function (number) {
	            return number;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return vi;
	
	}));

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : chinese (zh-cn)
	//! author : suupic : https://github.com/suupic
	//! author : Zeno Zeng : https://github.com/zenozeng
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var zh_cn = moment.defineLocale('zh-cn', {
	        months : '??????_??????_??????_??????_??????_??????_??????_??????_??????_??????_?????????_?????????'.split('_'),
	        monthsShort : '1???_2???_3???_4???_5???_6???_7???_8???_9???_10???_11???_12???'.split('_'),
	        weekdays : '?????????_?????????_?????????_?????????_?????????_?????????_?????????'.split('_'),
	        weekdaysShort : '??????_??????_??????_??????_??????_??????_??????'.split('_'),
	        weekdaysMin : '???_???_???_???_???_???_???'.split('_'),
	        longDateFormat : {
	            LT : 'Ah???mm???',
	            LTS : 'Ah???m???s???',
	            L : 'YYYY-MM-DD',
	            LL : 'YYYY???MMMD???',
	            LLL : 'YYYY???MMMD???Ah???mm???',
	            LLLL : 'YYYY???MMMD???ddddAh???mm???',
	            l : 'YYYY-MM-DD',
	            ll : 'YYYY???MMMD???',
	            lll : 'YYYY???MMMD???Ah???mm???',
	            llll : 'YYYY???MMMD???ddddAh???mm???'
	        },
	        meridiemParse: /??????|??????|??????|??????|??????|??????/,
	        meridiemHour: function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === '??????' || meridiem === '??????' ||
	                    meridiem === '??????') {
	                return hour;
	            } else if (meridiem === '??????' || meridiem === '??????') {
	                return hour + 12;
	            } else {
	                // '??????'
	                return hour >= 11 ? hour : hour + 12;
	            }
	        },
	        meridiem : function (hour, minute, isLower) {
	            var hm = hour * 100 + minute;
	            if (hm < 600) {
	                return '??????';
	            } else if (hm < 900) {
	                return '??????';
	            } else if (hm < 1130) {
	                return '??????';
	            } else if (hm < 1230) {
	                return '??????';
	            } else if (hm < 1800) {
	                return '??????';
	            } else {
	                return '??????';
	            }
	        },
	        calendar : {
	            sameDay : function () {
	                return this.minutes() === 0 ? '[??????]Ah[??????]' : '[??????]LT';
	            },
	            nextDay : function () {
	                return this.minutes() === 0 ? '[??????]Ah[??????]' : '[??????]LT';
	            },
	            lastDay : function () {
	                return this.minutes() === 0 ? '[??????]Ah[??????]' : '[??????]LT';
	            },
	            nextWeek : function () {
	                var startOfWeek, prefix;
	                startOfWeek = moment().startOf('week');
	                prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[???]' : '[???]';
	                return this.minutes() === 0 ? prefix + 'dddAh??????' : prefix + 'dddAh???mm';
	            },
	            lastWeek : function () {
	                var startOfWeek, prefix;
	                startOfWeek = moment().startOf('week');
	                prefix = this.unix() < startOfWeek.unix()  ? '[???]' : '[???]';
	                return this.minutes() === 0 ? prefix + 'dddAh??????' : prefix + 'dddAh???mm';
	            },
	            sameElse : 'LL'
	        },
	        ordinalParse: /\d{1,2}(???|???|???)/,
	        ordinal : function (number, period) {
	            switch (period) {
	            case 'd':
	            case 'D':
	            case 'DDD':
	                return number + '???';
	            case 'M':
	                return number + '???';
	            case 'w':
	            case 'W':
	                return number + '???';
	            default:
	                return number;
	            }
	        },
	        relativeTime : {
	            future : '%s???',
	            past : '%s???',
	            s : '??????',
	            m : '1 ??????',
	            mm : '%d ??????',
	            h : '1 ??????',
	            hh : '%d ??????',
	            d : '1 ???',
	            dd : '%d ???',
	            M : '1 ??????',
	            MM : '%d ??????',
	            y : '1 ???',
	            yy : '%d ???'
	        },
	        week : {
	            // GB/T 7408-1994?????????????????????????????????????????????????????????????????????????ISO 8601:1988??????
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return zh_cn;
	
	}));

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : traditional chinese (zh-tw)
	//! author : Ben : https://github.com/ben-lin
	
	(function (global, factory) {
	    true ? factory(__webpack_require__(10)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var zh_tw = moment.defineLocale('zh-tw', {
	        months : '??????_??????_??????_??????_??????_??????_??????_??????_??????_??????_?????????_?????????'.split('_'),
	        monthsShort : '1???_2???_3???_4???_5???_6???_7???_8???_9???_10???_11???_12???'.split('_'),
	        weekdays : '?????????_?????????_?????????_?????????_?????????_?????????_?????????'.split('_'),
	        weekdaysShort : '??????_??????_??????_??????_??????_??????_??????'.split('_'),
	        weekdaysMin : '???_???_???_???_???_???_???'.split('_'),
	        longDateFormat : {
	            LT : 'Ah???mm???',
	            LTS : 'Ah???m???s???',
	            L : 'YYYY???MMMD???',
	            LL : 'YYYY???MMMD???',
	            LLL : 'YYYY???MMMD???Ah???mm???',
	            LLLL : 'YYYY???MMMD???ddddAh???mm???',
	            l : 'YYYY???MMMD???',
	            ll : 'YYYY???MMMD???',
	            lll : 'YYYY???MMMD???Ah???mm???',
	            llll : 'YYYY???MMMD???ddddAh???mm???'
	        },
	        meridiemParse: /??????|??????|??????|??????|??????/,
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === '??????' || meridiem === '??????') {
	                return hour;
	            } else if (meridiem === '??????') {
	                return hour >= 11 ? hour : hour + 12;
	            } else if (meridiem === '??????' || meridiem === '??????') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hour, minute, isLower) {
	            var hm = hour * 100 + minute;
	            if (hm < 900) {
	                return '??????';
	            } else if (hm < 1130) {
	                return '??????';
	            } else if (hm < 1230) {
	                return '??????';
	            } else if (hm < 1800) {
	                return '??????';
	            } else {
	                return '??????';
	            }
	        },
	        calendar : {
	            sameDay : '[??????]LT',
	            nextDay : '[??????]LT',
	            nextWeek : '[???]ddddLT',
	            lastDay : '[??????]LT',
	            lastWeek : '[???]ddddLT',
	            sameElse : 'L'
	        },
	        ordinalParse: /\d{1,2}(???|???|???)/,
	        ordinal : function (number, period) {
	            switch (period) {
	            case 'd' :
	            case 'D' :
	            case 'DDD' :
	                return number + '???';
	            case 'M' :
	                return number + '???';
	            case 'w' :
	            case 'W' :
	                return number + '???';
	            default :
	                return number;
	            }
	        },
	        relativeTime : {
	            future : '%s???',
	            past : '%s???',
	            s : '??????',
	            m : '?????????',
	            mm : '%d??????',
	            h : '?????????',
	            hh : '%d??????',
	            d : '??????',
	            dd : '%d???',
	            M : '?????????',
	            MM : '%d??????',
	            y : '??????',
	            yy : '%d???'
	        }
	    });
	
	    return zh_tw;
	
	}));

/***/ }
/******/ ]);
//# sourceMappingURL=booking_page.bundle.js.map