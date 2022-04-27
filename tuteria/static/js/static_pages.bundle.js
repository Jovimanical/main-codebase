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
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(8);
	module.exports = __webpack_require__(151);


/***/ },

/***/ 1:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/* global $ */
	// require('bootstrap');
	'use strict';
	
	var Utils = __webpack_require__(3);
	var Urls = __webpack_require__(5);
	__webpack_require__(6);
	var mdetect = __webpack_require__(7);
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
	        console.log("parsley kicked");
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
	       var form2 = xhr.responseJSON.form
			var error = form2.errors;
			for (var o in form2.fields){
				error = error.concat(form2.fields[o].errors)
			}
	        console.log(error);
	        var errorNode = $('.signupErrorMessage');
	        errorNode.empty();
	        for (var key in error) {
	            errorNode.append('<p class="text-danger">' + error[key] + '</p>');
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
	        console.log("Triggered");
	        var form = $('#signup_form'),
	            phone = $("#phone_no"),
	            password = $("#pass_group"),
	            phone_container = $('#phone_container'),
	            password_container = $('#password_container'),
	            submitBtn = $("#submit_btn");
	        if (status) {
	            form.attr('action', Urls['users:mailing_signup']());
	            // if (phone.length > 0) {
	            phone_data = phone.remove();
	            // }
	            // if (password.length > 0) {
	            password_data = password.remove();
	            // }
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
	exports.SignUp = SignUp;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 2:
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ },

/***/ 3:
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
						  var resp = _error.responseJSON.form.errors
	            // var resp = JSON.parse(_error.responseText).form_errors;
	            console.debug(_error);
	            $('.invalid-form-error-message').html(resp[0]).addClass("filled");
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
	    errorTemplate: "<span></span>",
	    excluded: "input[type=text]:hidden, input[type=select]:hidden, textarea:hidden"
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
	
	function GoogleAutoComplete(input, callback, custom_callback) {
	    var autocomplete, map, geocoder, marker;
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
	        if (!!custom_callback) {
	            custom_callback(map, geocoder, marker);
	        }
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
	function GeocodeFunction(geocoder, full_address, successcallback, callback, errorCallback) {
	    geocoder.geocode({ 'address': full_address }, function (results, status) {
	        if (status == window.google.maps.GeocoderStatus.OK) {
	            console.log(results);
	            if (results.length > 0) {
	                var address = full_address;
	                var latitude = results[0].geometry.location.lat().toFixed(7);
	                var longitude = results[0].geometry.location.lng().toFixed(7);
	                successcallback(latitude, longitude, results);
	            }
	            callback();
	        } else {
	            errorCallback();
	        }
	    });
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
	            GeocodeFunction(geocoder, full_address, function (latitude, longitude) {
	                location_field.val(full_address);
	                if (latitude) {
	                    latitude_field.val(parseFloat(latitude).toFixed(5));
	                }
	                if (longitude) {
	                    longitude_field.val(parseFloat(longitude).toFixed(5));
	                }
	            }, function () {
	                $(that).unbind("submit").submit();
	            }, function () {
	                var field = location_field.val();
	                if (field === "") {
	                    longitude_field.val("");
	                    latitude_field.val("");
	                }
	                $(that).unbind("submit").submit();
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
	exports.GeocodeFunction = GeocodeFunction;
	exports.filterOptionByText = function (node, text) {
	    return node.find('option').filter(function () {
	        node.trigger('change');
	        if (text == 'Federal Capital Territory') {
	            return $(this).html() == 'Abuja';
	        }
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

/***/ 4:
/***/ function(module, exports) {

	module.exports = Bloodhound;

/***/ },

/***/ 5:
/***/ function(module, exports) {

	module.exports = Urls;

/***/ },

/***/ 6:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	International Telephone Input v3.7.1
	https://github.com/Bluefieldscom/intl-tel-input.git
	*/
	"use strict";
	
	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($) {
	            factory($, window, document);
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else {
	        factory(jQuery, window, document);
	    }
	})(function ($, window, document, undefined) {
	    "use strict";
	    var pluginName = "intlTelInput",
	        id = 1,
	        // give each instance it's own id for namespaced event handling
	    defaults = {
	        // automatically format the number according to the selected country
	        autoFormat: true,
	        // if there is just a dial code in the input: remove it on blur, and re-add it on focus
	        autoHideDialCode: true,
	        // default country
	        defaultCountry: "",
	        // token for ipinfo - required for https or over 1000 daily page views support
	        ipinfoToken: "",
	        // don't insert international dial codes
	        nationalMode: false,
	        // number type to use for placeholders
	        numberType: "MOBILE",
	        // display only these countries
	        onlyCountries: [],
	        // the countries at the top of the list. defaults to united states and united kingdom
	        preferredCountries: ["us", "gb"],
	        // make the dropdown the same width as the input
	        responsiveDropdown: false,
	        // specify the path to the libphonenumber script to enable validation/formatting
	        utilsScript: ""
	    },
	        keys = {
	        UP: 38,
	        DOWN: 40,
	        ENTER: 13,
	        ESC: 27,
	        PLUS: 43,
	        A: 65,
	        Z: 90,
	        ZERO: 48,
	        NINE: 57,
	        SPACE: 32,
	        BSPACE: 8,
	        DEL: 46,
	        CTRL: 17,
	        CMD1: 91,
	        // Chrome
	        CMD2: 224
	    },
	        windowLoaded = false;
	    // keep track of if the window.load event has fired as impossible to check after the fact
	    $(window).load(function () {
	        windowLoaded = true;
	    });
	    function Plugin(element, options) {
	        this.element = element;
	        this.options = $.extend({}, defaults, options);
	        this._defaults = defaults;
	        // event namespace
	        this.ns = "." + pluginName + id++;
	        // Chrome, FF, Safari, IE9+
	        this.isGoodBrowser = Boolean(element.setSelectionRange);
	        this.hadInitialPlaceholder = Boolean($(element).attr("placeholder"));
	        this._name = pluginName;
	        this.init();
	    }
	    Plugin.prototype = {
	        init: function init() {
	            var that = this;
	            // if defaultCountry is set to "auto", we must do a lookup first
	            if (this.options.defaultCountry == "auto") {
	                // reset this in case lookup fails
	                this.options.defaultCountry = "";
	                var ipinfoURL = "//ipinfo.io";
	                if (this.options.ipinfoToken) {
	                    ipinfoURL += "?token=" + this.options.ipinfoToken;
	                }
	                $.get(ipinfoURL, function (response) {
	                    if (response && response.country) {
	                        that.options.defaultCountry = response.country.toLowerCase();
	                    }
	                }, "jsonp").always(function () {
	                    that._ready();
	                });
	            } else {
	                this._ready();
	            }
	        },
	        _ready: function _ready() {
	            // if in nationalMode, disable options relating to dial codes
	            if (this.options.nationalMode) {
	                this.options.autoHideDialCode = false;
	            }
	            // IE Mobile doesn't support the keypress event (see issue 68) which makes autoFormat impossible
	            if (navigator.userAgent.match(/IEMobile/i)) {
	                this.options.autoFormat = false;
	            }
	            // auto enable responsiveDropdown mode on small screens (dropdown is currently set to 430px in CSS)
	            if (window.innerWidth < 500) {
	                this.options.responsiveDropdown = true;
	            }
	            // process all the data: onlyCountries, preferredCountries etc
	            this._processCountryData();
	            // generate the markup
	            this._generateMarkup();
	            // set the initial state of the input value and the selected flag
	            this._setInitialState();
	            // start all of the event listeners: autoHideDialCode, input keydown, selectedFlag click
	            this._initListeners();
	        },
	        /********************
	        *  PRIVATE METHODS
	        ********************/
	        // prepare all of the country data, including onlyCountries and preferredCountries options
	        _processCountryData: function _processCountryData() {
	            // set the instances country data objects
	            this._setInstanceCountryData();
	            // set the preferredCountries property
	            this._setPreferredCountries();
	        },
	        // add a country code to this.countryCodes
	        _addCountryCode: function _addCountryCode(iso2, dialCode, priority) {
	            if (!(dialCode in this.countryCodes)) {
	                this.countryCodes[dialCode] = [];
	            }
	            var index = priority || 0;
	            this.countryCodes[dialCode][index] = iso2;
	        },
	        // process onlyCountries array if present, and generate the countryCodes map
	        _setInstanceCountryData: function _setInstanceCountryData() {
	            var i;
	            // process onlyCountries option
	            if (this.options.onlyCountries.length) {
	                this.countries = [];
	                for (i = 0; i < allCountries.length; i++) {
	                    if ($.inArray(allCountries[i].iso2, this.options.onlyCountries) != -1) {
	                        this.countries.push(allCountries[i]);
	                    }
	                }
	            } else {
	                this.countries = allCountries;
	            }
	            // generate countryCodes map
	            this.countryCodes = {};
	            for (i = 0; i < this.countries.length; i++) {
	                var c = this.countries[i];
	                this._addCountryCode(c.iso2, c.dialCode, c.priority);
	                // area codes
	                if (c.areaCodes) {
	                    for (var j = 0; j < c.areaCodes.length; j++) {
	                        // full dial code is country code + dial code
	                        this._addCountryCode(c.iso2, c.dialCode + c.areaCodes[j]);
	                    }
	                }
	            }
	        },
	        // process preferred countries - iterate through the preferences,
	        // fetching the country data for each one
	        _setPreferredCountries: function _setPreferredCountries() {
	            this.preferredCountries = [];
	            for (var i = 0; i < this.options.preferredCountries.length; i++) {
	                var countryCode = this.options.preferredCountries[i],
	                    countryData = this._getCountryData(countryCode, false, true);
	                if (countryData) {
	                    this.preferredCountries.push(countryData);
	                }
	            }
	        },
	        // generate all of the markup for the plugin: the selected flag overlay, and the dropdown
	        _generateMarkup: function _generateMarkup() {
	            // telephone input
	            this.telInput = $(this.element);
	            // containers (mostly for positioning)
	            this.telInput.wrap($("<div>", {
	                "class": "intl-tel-input"
	            }));
	            var flagsContainer = $("<div>", {
	                "class": "flag-dropdown"
	            }).insertAfter(this.telInput);
	            // currently selected flag (displayed to left of input)
	            var selectedFlag = $("<div>", {
	                "class": "selected-flag"
	            }).appendTo(flagsContainer);
	            this.selectedFlagInner = $("<div>", {
	                "class": "flag"
	            }).appendTo(selectedFlag);
	            // CSS triangle
	            $("<div>", {
	                "class": "arrow"
	            }).appendTo(this.selectedFlagInner);
	            // country list contains: preferred countries, then divider, then all countries
	            this.countryList = $("<ul>", {
	                "class": "country-list v-hide"
	            }).appendTo(flagsContainer);
	            if (this.preferredCountries.length) {
	                this._appendListItems(this.preferredCountries, "preferred");
	                $("<li>", {
	                    "class": "divider"
	                }).appendTo(this.countryList);
	            }
	            this._appendListItems(this.countries, "");
	            // now we can grab the dropdown height, and hide it properly
	            this.dropdownHeight = this.countryList.outerHeight();
	            this.countryList.removeClass("v-hide").addClass("hide");
	            // and set the width
	            if (this.options.responsiveDropdown) {
	                this.countryList.outerWidth(this.telInput.outerWidth());
	            }
	            // this is useful in lots of places
	            this.countryListItems = this.countryList.children(".country");
	        },
	        // add a country <li> to the countryList <ul> container
	        _appendListItems: function _appendListItems(countries, className) {
	            // we create so many DOM elements, I decided it was faster to build a temp string
	            // and then add everything to the DOM in one go at the end
	            var tmp = "";
	            // for each country
	            for (var i = 0; i < countries.length; i++) {
	                var c = countries[i];
	                // open the list item
	                tmp += "<li class='country " + className + "' data-dial-code='" + c.dialCode + "' data-country-code='" + c.iso2 + "'>";
	                // add the flag
	                tmp += "<div class='flag " + c.iso2 + "'></div>";
	                // and the country name and dial code
	                tmp += "<span class='country-name'>" + c.name + "</span>";
	                tmp += "<span class='dial-code'>+" + c.dialCode + "</span>";
	                // close the list item
	                tmp += "</li>";
	            }
	            this.countryList.append(tmp);
	        },
	        // set the initial state of the input value and the selected flag
	        _setInitialState: function _setInitialState() {
	            var val = this.telInput.val();
	            // if there is a number, and it's valid, we can go ahead and set the flag, else fall back to default
	            if (this._getDialCode(val)) {
	                this._updateFlagFromNumber(val);
	            } else {
	                var defaultCountry;
	                // check the defaultCountry option, else fall back to the first in the list
	                if (this.options.defaultCountry) {
	                    defaultCountry = this._getCountryData(this.options.defaultCountry, false, false);
	                } else {
	                    defaultCountry = this.preferredCountries.length ? this.preferredCountries[0] : this.countries[0];
	                }
	                this._selectFlag(defaultCountry.iso2);
	                // if empty, insert the default dial code (this function will check !nationalMode and !autoHideDialCode)
	                if (!val) {
	                    this._updateDialCode(defaultCountry.dialCode, false);
	                }
	            }
	            // format
	            if (val) {
	                // this wont be run after _updateDialCode as that's only called if no val
	                this._updateVal(val, false);
	            }
	        },
	        // initialise the main event listeners: input keyup, and click selected flag
	        _initListeners: function _initListeners() {
	            var that = this;
	            this._initKeyListeners();
	            // autoFormat prevents the change event from firing, so we need to check for changes between focus and blur in order to manually trigger it
	            if (this.options.autoHideDialCode || this.options.autoFormat) {
	                this._initFocusListeners();
	            }
	            // hack for input nested inside label: clicking the selected-flag to open the dropdown would then automatically trigger a 2nd click on the input which would close it again
	            var label = this.telInput.closest("label");
	            if (label.length) {
	                label.on("click" + this.ns, function (e) {
	                    // if the dropdown is closed, then focus the input, else ignore the click
	                    if (that.countryList.hasClass("hide")) {
	                        that.telInput.focus();
	                    } else {
	                        e.preventDefault();
	                    }
	                });
	            }
	            // toggle country dropdown on click
	            var selectedFlag = this.selectedFlagInner.parent();
	            selectedFlag.on("click" + this.ns, function (e) {
	                // only intercept this event if we're opening the dropdown
	                // else let it bubble up to the top ("click-off-to-close" listener)
	                // we cannot just stopPropagation as it may be needed to close another instance
	                if (that.countryList.hasClass("hide") && !that.telInput.prop("disabled")) {
	                    that._showDropdown();
	                }
	            });
	            // if the user has specified the path to the utils script, fetch it on window.load
	            if (this.options.utilsScript) {
	                // if the plugin is being initialised after the window.load event has already been fired
	                if (windowLoaded) {
	                    this.loadUtils();
	                } else {
	                    // wait until the load event so we don't block any other requests e.g. the flags image
	                    $(window).load(function () {
	                        that.loadUtils();
	                    });
	                }
	            }
	        },
	        _initKeyListeners: function _initKeyListeners() {
	            var that = this;
	            if (this.options.autoFormat) {
	                // format number and update flag on keypress
	                // use keypress event as we want to ignore all input except for a select few keys,
	                // but we dont want to ignore the navigation keys like the arrows etc.
	                // NOTE: no point in refactoring this to only bind these listeners on focus/blur because then you would need to have those 2 listeners running the whole time anyway...
	                this.telInput.on("keypress" + this.ns, function (e) {
	                    // 32 is space, and after that it's all chars (not meta/nav keys)
	                    // this fix is needed for Firefox, which triggers keypress event for some meta/nav keys
	                    // Update: also ignore if this is a metaKey e.g. FF and Safari trigger keypress on the v of Ctrl+v
	                    // Update: also check that we have utils before we do any autoFormat stuff
	                    if (e.which >= keys.SPACE && !e.metaKey && window.intlTelInputUtils) {
	                        e.preventDefault();
	                        // allowed keys are just numeric keys and plus
	                        // we must allow plus for the case where the user does select-all and then hits plus to start typing a new number. we could refine this logic to first check that the selection contains a plus, but that wont work in old browsers, and I think it's overkill anyway
	                        var isAllowedKey = e.which >= keys.ZERO && e.which <= keys.NINE || e.which == keys.PLUS,
	                            input = that.telInput[0],
	                            noSelection = that.isGoodBrowser && input.selectionStart == input.selectionEnd,
	                            max = that.telInput.attr("maxlength"),
	                            // assumes that if max exists, it is >0
	                        isBelowMax = max ? that.telInput.val().length < max : true;
	                        // first: ensure we dont go over maxlength. we must do this here to prevent adding digits in the middle of the number
	                        // still reformat even if not an allowed key as they could by typing a formatting char, but ignore if there's a selection as doesn't make sense to replace selection with illegal char and then immediately remove it
	                        if (isBelowMax && (isAllowedKey || noSelection)) {
	                            var newChar = isAllowedKey ? String.fromCharCode(e.which) : null;
	                            that._handleInputKey(newChar, true);
	                        }
	                        if (!isAllowedKey) {
	                            that.telInput.trigger("invalidkey");
	                        }
	                    }
	                });
	            }
	            // handle keyup event
	            // for autoFormat: we use keyup to catch delete events after the fact
	            this.telInput.on("keyup" + this.ns, function (e) {
	                // the "enter" key event from selecting a dropdown item is triggered here on the input, because the document.keydown handler that initially handles that event triggers a focus on the input, and so the keyup for that same key event gets triggered here. weird, but just make sure we dont bother doing any re-formatting in this case (we've already done preventDefault in the keydown handler, so it wont actually submit the form or anything).
	                if (e.which == keys.ENTER) {} else if (that.options.autoFormat && window.intlTelInputUtils) {
	                    var isCtrl = e.which == keys.CTRL || e.which == keys.CMD1 || e.which == keys.CMD2,
	                        input = that.telInput[0],
	                        // noSelection defaults to false for bad browsers, else would be reformatting on all ctrl keys e.g. select-all/copy
	                    noSelection = that.isGoodBrowser && input.selectionStart == input.selectionEnd,
	                        // cursorAtEnd defaults to false for bad browsers else they would never get a reformat on delete
	                    cursorAtEnd = that.isGoodBrowser && input.selectionStart == that.telInput.val().length;
	                    // if delete in the middle: reformat with no suffix (no need to reformat if delete at end)
	                    // if backspace: reformat with no suffix (need to reformat if at end to remove any lingering suffix - this is a feature)
	                    // if ctrl and no selection (i.e. could have just been a paste): reformat (if cursorAtEnd: add suffix)
	                    if (e.which == keys.DEL && !cursorAtEnd || e.which == keys.BSPACE || isCtrl && noSelection) {
	                        // important to remember never to add suffix on any delete key as can fuck up in ie8 so you can never delete a formatting char at the end
	                        that._handleInputKey(null, isCtrl && cursorAtEnd);
	                    }
	                    // prevent deleting the plus (if not in nationalMode)
	                    if (!that.options.nationalMode) {
	                        var val = that.telInput.val();
	                        if (val.substr(0, 1) != "+") {
	                            // newCursorPos is current pos + 1 to account for the plus we are about to add
	                            var newCursorPos = that.isGoodBrowser ? input.selectionStart + 1 : 0;
	                            that.telInput.val("+" + val);
	                            if (that.isGoodBrowser) {
	                                input.setSelectionRange(newCursorPos, newCursorPos);
	                            }
	                        }
	                    }
	                } else {
	                    // if no autoFormat, just update flag
	                    that._updateFlagFromNumber(that.telInput.val());
	                }
	            });
	        },
	        // when autoFormat is enabled: handle various key events on the input: the 2 main situations are 1) adding a new number character, which will replace any selection, reformat, and try to preserve the cursor position. and 2) reformatting on backspace, or paste event
	        _handleInputKey: function _handleInputKey(newNumericChar, addSuffix) {
	            var val = this.telInput.val(),
	                newCursor = null,
	                cursorAtEnd = false,
	                // raw DOM element
	            input = this.telInput[0];
	            if (this.isGoodBrowser) {
	                var selectionEnd = input.selectionEnd,
	                    originalLen = val.length;
	                cursorAtEnd = selectionEnd == originalLen;
	                // if handling a new number character: insert it in the right place and calculate the new cursor position
	                if (newNumericChar) {
	                    // replace any selection they may have made with the new char
	                    val = val.substr(0, input.selectionStart) + newNumericChar + val.substring(selectionEnd, originalLen);
	                    // if the cursor was not at the end then calculate it's new pos
	                    if (!cursorAtEnd) {
	                        newCursor = selectionEnd + (val.length - originalLen);
	                    }
	                } else {
	                    // here we're not handling a new char, we're just doing a re-format, but we still need to maintain the cursor position
	                    newCursor = input.selectionStart;
	                }
	            } else if (newNumericChar) {
	                val += newNumericChar;
	            }
	            // update the number and flag
	            this.setNumber(val, addSuffix);
	            // update the cursor position
	            if (this.isGoodBrowser) {
	                // if it was at the end, keep it there
	                if (cursorAtEnd) {
	                    newCursor = this.telInput.val().length;
	                }
	                input.setSelectionRange(newCursor, newCursor);
	            }
	        },
	        // listen for focus and blur
	        _initFocusListeners: function _initFocusListeners() {
	            var that = this;
	            if (this.options.autoHideDialCode) {
	                // mousedown decides where the cursor goes, so if we're focusing we must preventDefault as we'll be inserting the dial code, and we want the cursor to be at the end no matter where they click
	                this.telInput.on("mousedown" + this.ns, function (e) {
	                    if (!that.telInput.is(":focus") && !that.telInput.val()) {
	                        e.preventDefault();
	                        // but this also cancels the focus, so we must trigger that manually
	                        that.telInput.focus();
	                    }
	                });
	            }
	            this.telInput.on("focus" + this.ns, function () {
	                var value = that.telInput.val();
	                // save this to compare on blur
	                that.telInput.data("focusVal", value);
	                if (that.options.autoHideDialCode) {
	                    // on focus: if empty, insert the dial code for the currently selected flag
	                    if (!value) {
	                        that._updateVal("+" + that.selectedCountryData.dialCode, true);
	                        // after auto-inserting a dial code, if the first key they hit is '+' then assume they are entering a new number, so remove the dial code. use keypress instead of keydown because keydown gets triggered for the shift key (required to hit the + key), and instead of keyup because that shows the new '+' before removing the old one
	                        that.telInput.one("keypress.plus" + that.ns, function (e) {
	                            if (e.which == keys.PLUS) {
	                                // if autoFormat is enabled, this key event will have already have been handled by another keypress listener (hence we need to add the "+"). if disabled, it will be handled after this by a keyup listener (hence no need to add the "+").
	                                var newVal = that.options.autoFormat && window.intlTelInputUtils ? "+" : "";
	                                that.telInput.val(newVal);
	                            }
	                        });
	                        // after tabbing in, make sure the cursor is at the end we must use setTimeout to get outside of the focus handler as it seems the selection happens after that
	                        setTimeout(function () {
	                            var input = that.telInput[0];
	                            if (that.isGoodBrowser) {
	                                var len = that.telInput.val().length;
	                                input.setSelectionRange(len, len);
	                            }
	                        });
	                    }
	                }
	            });
	            this.telInput.on("blur" + this.ns, function () {
	                if (that.options.autoHideDialCode) {
	                    // on blur: if just a dial code then remove it
	                    var value = that.telInput.val(),
	                        startsPlus = value.substr(0, 1) == "+";
	                    if (startsPlus) {
	                        var numeric = that._getNumeric(value);
	                        // if just a plus, or if just a dial code
	                        if (!numeric || that.selectedCountryData.dialCode == numeric) {
	                            that.telInput.val("");
	                        }
	                    }
	                    // remove the keypress listener we added on focus
	                    that.telInput.off("keypress.plus" + that.ns);
	                }
	                // if autoFormat, we must manually trigger change event if value has changed
	                if (that.options.autoFormat && window.intlTelInputUtils && that.telInput.val() != that.telInput.data("focusVal")) {
	                    that.telInput.trigger("change");
	                }
	            });
	        },
	        // extract the numeric digits from the given string
	        _getNumeric: function _getNumeric(s) {
	            return s.replace(/\D/g, "");
	        },
	        // show the dropdown
	        _showDropdown: function _showDropdown() {
	            this._setDropdownPosition();
	            // update highlighting and scroll to active list item
	            var activeListItem = this.countryList.children(".active");
	            this._highlightListItem(activeListItem);
	            // show it
	            this.countryList.removeClass("hide");
	            this._scrollTo(activeListItem);
	            // bind all the dropdown-related listeners: mouseover, click, click-off, keydown
	            this._bindDropdownListeners();
	            // update the arrow
	            this.selectedFlagInner.children(".arrow").addClass("up");
	        },
	        // decide where to position dropdown (depends on position within viewport, and scroll)
	        _setDropdownPosition: function _setDropdownPosition() {
	            var inputTop = this.telInput.offset().top,
	                windowTop = $(window).scrollTop(),
	                // dropdownFitsBelow = (dropdownBottom < windowBottom)
	            dropdownFitsBelow = inputTop + this.telInput.outerHeight() + this.dropdownHeight < windowTop + $(window).height(),
	                dropdownFitsAbove = inputTop - this.dropdownHeight > windowTop;
	            // dropdownHeight - 1 for border
	            var cssTop = !dropdownFitsBelow && dropdownFitsAbove ? "-" + (this.dropdownHeight - 1) + "px" : "";
	            this.countryList.css("top", cssTop);
	        },
	        // we only bind dropdown listeners when the dropdown is open
	        _bindDropdownListeners: function _bindDropdownListeners() {
	            var that = this;
	            // when mouse over a list item, just highlight that one
	            // we add the class "highlight", so if they hit "enter" we know which one to select
	            this.countryList.on("mouseover" + this.ns, ".country", function (e) {
	                that._highlightListItem($(this));
	            });
	            // listen for country selection
	            this.countryList.on("click" + this.ns, ".country", function (e) {
	                that._selectListItem($(this));
	            });
	            // click off to close
	            // (except when this initial opening click is bubbling up)
	            // we cannot just stopPropagation as it may be needed to close another instance
	            var isOpening = true;
	            $("html").on("click" + this.ns, function (e) {
	                if (!isOpening) {
	                    that._closeDropdown();
	                }
	                isOpening = false;
	            });
	            // listen for up/down scrolling, enter to select, or letters to jump to country name.
	            // use keydown as keypress doesn't fire for non-char keys and we want to catch if they
	            // just hit down and hold it to scroll down (no keyup event).
	            // listen on the document because that's where key events are triggered if no input has focus
	            var query = "",
	                queryTimer = null;
	            $(document).on("keydown" + this.ns, function (e) {
	                // prevent down key from scrolling the whole page,
	                // and enter key from submitting a form etc
	                e.preventDefault();
	                if (e.which == keys.UP || e.which == keys.DOWN) {
	                    // up and down to navigate
	                    that._handleUpDownKey(e.which);
	                } else if (e.which == keys.ENTER) {
	                    // enter to select
	                    that._handleEnterKey();
	                } else if (e.which == keys.ESC) {
	                    // esc to close
	                    that._closeDropdown();
	                } else if (e.which >= keys.A && e.which <= keys.Z || e.which == keys.SPACE) {
	                    // upper case letters (note: keyup/keydown only return upper case letters)
	                    // jump to countries that start with the query string
	                    if (queryTimer) {
	                        clearTimeout(queryTimer);
	                    }
	                    query += String.fromCharCode(e.which);
	                    that._searchForCountry(query);
	                    // if the timer hits 1 second, reset the query
	                    queryTimer = setTimeout(function () {
	                        query = "";
	                    }, 1e3);
	                }
	            });
	        },
	        // highlight the next/prev item in the list (and ensure it is visible)
	        _handleUpDownKey: function _handleUpDownKey(key) {
	            var current = this.countryList.children(".highlight").first();
	            var next = key == keys.UP ? current.prev() : current.next();
	            if (next.length) {
	                // skip the divider
	                if (next.hasClass("divider")) {
	                    next = key == keys.UP ? next.prev() : next.next();
	                }
	                this._highlightListItem(next);
	                this._scrollTo(next);
	            }
	        },
	        // select the currently highlighted item
	        _handleEnterKey: function _handleEnterKey() {
	            var currentCountry = this.countryList.children(".highlight").first();
	            if (currentCountry.length) {
	                this._selectListItem(currentCountry);
	            }
	        },
	        // find the first list item whose name starts with the query string
	        _searchForCountry: function _searchForCountry(query) {
	            for (var i = 0; i < this.countries.length; i++) {
	                if (this._startsWith(this.countries[i].name, query)) {
	                    var listItem = this.countryList.children("[data-country-code=" + this.countries[i].iso2 + "]").not(".preferred");
	                    // update highlighting and scroll
	                    this._highlightListItem(listItem);
	                    this._scrollTo(listItem, true);
	                    break;
	                }
	            }
	        },
	        // check if (uppercase) string a starts with string b
	        _startsWith: function _startsWith(a, b) {
	            return a.substr(0, b.length).toUpperCase() == b;
	        },
	        // update the input's value to the given val
	        // if autoFormat=true, format it first according to the country-specific formatting rules
	        _updateVal: function _updateVal(val, addSuffix) {
	            var formatted;
	            if (this.options.autoFormat && window.intlTelInputUtils) {
	                formatted = intlTelInputUtils.formatNumber(val, this.selectedCountryData.iso2, addSuffix);
	                // ensure we dont go over maxlength. we must do this here to truncate any formatting suffix, and also handle paste events
	                var max = this.telInput.attr("maxlength");
	                if (max && formatted.length > max) {
	                    formatted = formatted.substr(0, max);
	                }
	            } else {
	                // no autoFormat, so just insert the original value
	                formatted = val;
	            }
	            this.telInput.val(formatted);
	        },
	        // check if need to select a new flag based on the given number
	        _updateFlagFromNumber: function _updateFlagFromNumber(number) {
	            // if we're in nationalMode and we're on US/Canada, make sure the number starts with a +1 so _getDialCode will be able to extract the area code
	            // update: if we dont yet have selectedCountryData, but we're here (trying to update the flag from the number), that means we're initialising the plugin with a number that already has a dial code, so fine to ignore this bit
	            if (this.options.nationalMode && this.selectedCountryData && this.selectedCountryData.dialCode == "1" && number.substr(0, 1) != "+") {
	                number = "+1" + number;
	            }
	            // try and extract valid dial code from input
	            var dialCode = this._getDialCode(number);
	            if (dialCode) {
	                // check if one of the matching countries is already selected
	                var countryCodes = this.countryCodes[this._getNumeric(dialCode)],
	                    alreadySelected = false;
	                if (this.selectedCountryData) {
	                    for (var i = 0; i < countryCodes.length; i++) {
	                        if (countryCodes[i] == this.selectedCountryData.iso2) {
	                            alreadySelected = true;
	                        }
	                    }
	                }
	                // if a matching country is not already selected (or this is an unknown NANP area code): choose the first in the list
	                if (!alreadySelected || this._isUnknownNanp(number, dialCode)) {
	                    // if using onlyCountries option, countryCodes[0] may be empty, so we must find the first non-empty index
	                    for (var j = 0; j < countryCodes.length; j++) {
	                        if (countryCodes[j]) {
	                            this._selectFlag(countryCodes[j]);
	                            break;
	                        }
	                    }
	                }
	            }
	        },
	        // check if the given number contains an unknown area code from the North American Numbering Plan i.e. the only dialCode that could be extracted was +1 but the actual number's length is >=4
	        _isUnknownNanp: function _isUnknownNanp(number, dialCode) {
	            return dialCode == "+1" && this._getNumeric(number).length >= 4;
	        },
	        // remove highlighting from other list items and highlight the given item
	        _highlightListItem: function _highlightListItem(listItem) {
	            this.countryListItems.removeClass("highlight");
	            listItem.addClass("highlight");
	        },
	        // find the country data for the given country code
	        // the ignoreOnlyCountriesOption is only used during init() while parsing the onlyCountries array
	        _getCountryData: function _getCountryData(countryCode, ignoreOnlyCountriesOption, allowFail) {
	            var countryList = ignoreOnlyCountriesOption ? allCountries : this.countries;
	            for (var i = 0; i < countryList.length; i++) {
	                if (countryList[i].iso2 == countryCode) {
	                    return countryList[i];
	                }
	            }
	            if (allowFail) {
	                return null;
	            } else {
	                throw new Error("No country data for '" + countryCode + "'");
	            }
	        },
	        // select the given flag, update the placeholder and the active list item
	        _selectFlag: function _selectFlag(countryCode) {
	            // do this first as it will throw an error and stop if countryCode is invalid
	            this.selectedCountryData = this._getCountryData(countryCode, false, false);
	            this.selectedFlagInner.attr("class", "flag " + countryCode);
	            // update the selected country's title attribute
	            var title = this.selectedCountryData.name + ": +" + this.selectedCountryData.dialCode;
	            this.selectedFlagInner.parent().attr("title", title);
	            // and the input's placeholder
	            this._updatePlaceholder();
	            // update the active list item
	            var listItem = this.countryListItems.children(".flag." + countryCode).first().parent();
	            this.countryListItems.removeClass("active");
	            listItem.addClass("active");
	        },
	        // update the input placeholder to an example number from the currently selected country
	        _updatePlaceholder: function _updatePlaceholder() {
	            if (window.intlTelInputUtils && !this.hadInitialPlaceholder) {
	                var iso2 = this.selectedCountryData.iso2,
	                    numberType = intlTelInputUtils.numberType[this.options.numberType || "FIXED_LINE"],
	                    placeholder = intlTelInputUtils.getExampleNumber(iso2, this.options.nationalMode, numberType);
	                this.telInput.attr("placeholder", placeholder);
	            }
	        },
	        // called when the user selects a list item from the dropdown
	        _selectListItem: function _selectListItem(listItem) {
	            // update selected flag and active list item
	            var countryCode = listItem.attr("data-country-code");
	            this._selectFlag(countryCode);
	            this._closeDropdown();
	            this._updateDialCode(listItem.attr("data-dial-code"), true);
	            // always fire the change event as even if nationalMode=true (and we haven't updated the input val), the system as a whole has still changed - see country-sync example. think of it as making a selection from a select element.
	            this.telInput.trigger("change");
	            // focus the input
	            this.telInput.focus();
	        },
	        // close the dropdown and unbind any listeners
	        _closeDropdown: function _closeDropdown() {
	            this.countryList.addClass("hide");
	            // update the arrow
	            this.selectedFlagInner.children(".arrow").removeClass("up");
	            // unbind key events
	            $(document).off(this.ns);
	            // unbind click-off-to-close
	            $("html").off(this.ns);
	            // unbind hover and click listeners
	            this.countryList.off(this.ns);
	        },
	        // check if an element is visible within it's container, else scroll until it is
	        _scrollTo: function _scrollTo(element, middle) {
	            var container = this.countryList,
	                containerHeight = container.height(),
	                containerTop = container.offset().top,
	                containerBottom = containerTop + containerHeight,
	                elementHeight = element.outerHeight(),
	                elementTop = element.offset().top,
	                elementBottom = elementTop + elementHeight,
	                newScrollTop = elementTop - containerTop + container.scrollTop(),
	                middleOffset = containerHeight / 2 - elementHeight / 2;
	            if (elementTop < containerTop) {
	                // scroll up
	                if (middle) {
	                    newScrollTop -= middleOffset;
	                }
	                container.scrollTop(newScrollTop);
	            } else if (elementBottom > containerBottom) {
	                // scroll down
	                if (middle) {
	                    newScrollTop += middleOffset;
	                }
	                var heightDifference = containerHeight - elementHeight;
	                container.scrollTop(newScrollTop - heightDifference);
	            }
	        },
	        // replace any existing dial code with the new one (if not in nationalMode)
	        // also we need to know if we're focusing for a couple of reasons e.g. if so, we want to add any formatting suffix, also if the input is empty and we're not in nationalMode, then we want to insert the dial code
	        _updateDialCode: function _updateDialCode(newDialCode, focusing) {
	            var inputVal = this.telInput.val(),
	                newNumber;
	            // save having to pass this every time
	            newDialCode = "+" + newDialCode;
	            if (this.options.nationalMode && inputVal.substr(0, 1) != "+") {
	                // if nationalMode, we just want to re-format
	                newNumber = inputVal;
	            } else if (inputVal) {
	                // if the previous number contained a valid dial code, replace it
	                // (if more than just a plus character)
	                var prevDialCode = this._getDialCode(inputVal);
	                if (prevDialCode.length > 1) {
	                    newNumber = inputVal.replace(prevDialCode, newDialCode);
	                } else {
	                    // if the previous number didn't contain a dial code, we should persist it
	                    var existingNumber = inputVal.substr(0, 1) != "+" ? $.trim(inputVal) : "";
	                    newNumber = newDialCode + existingNumber;
	                }
	            } else {
	                newNumber = !this.options.autoHideDialCode || focusing ? newDialCode : "";
	            }
	            this._updateVal(newNumber, focusing);
	        },
	        // try and extract a valid international dial code from a full telephone number
	        // Note: returns the raw string inc plus character and any whitespace/dots etc
	        _getDialCode: function _getDialCode(number) {
	            var dialCode = "";
	            // only interested in international numbers (starting with a plus)
	            if (number.charAt(0) == "+") {
	                var numericChars = "";
	                // iterate over chars
	                for (var i = 0; i < number.length; i++) {
	                    var c = number.charAt(i);
	                    // if char is number
	                    if ($.isNumeric(c)) {
	                        numericChars += c;
	                        // if current numericChars make a valid dial code
	                        if (this.countryCodes[numericChars]) {
	                            // store the actual raw string (useful for matching later)
	                            dialCode = number.substr(0, i + 1);
	                        }
	                        // longest dial code is 4 chars
	                        if (numericChars.length == 4) {
	                            break;
	                        }
	                    }
	                }
	            }
	            return dialCode;
	        },
	        /********************
	        *  PUBLIC METHODS
	        ********************/
	        // remove plugin
	        destroy: function destroy() {
	            // make sure the dropdown is closed (and unbind listeners)
	            this._closeDropdown();
	            // key events, and focus/blur events if autoHideDialCode=true
	            this.telInput.off(this.ns);
	            // click event to open dropdown
	            this.selectedFlagInner.parent().off(this.ns);
	            // label click hack
	            this.telInput.closest("label").off(this.ns);
	            // remove markup
	            var container = this.telInput.parent();
	            container.before(this.telInput).remove();
	        },
	        // format the number to E164
	        getCleanNumber: function getCleanNumber() {
	            if (window.intlTelInputUtils) {
	                return intlTelInputUtils.formatNumberE164(this.telInput.val(), this.selectedCountryData.iso2);
	            }
	            return "";
	        },
	        // get the type of the entered number e.g. landline/mobile
	        getNumberType: function getNumberType() {
	            if (window.intlTelInputUtils) {
	                return intlTelInputUtils.getNumberType(this.telInput.val(), this.selectedCountryData.iso2);
	            }
	            return -99;
	        },
	        // get the country data for the currently selected flag
	        getSelectedCountryData: function getSelectedCountryData() {
	            // if this is undefined, the plugin will return it's instance instead, so in that case an empty object makes more sense
	            return this.selectedCountryData || {};
	        },
	        // get the validation error
	        getValidationError: function getValidationError() {
	            if (window.intlTelInputUtils) {
	                return intlTelInputUtils.getValidationError(this.telInput.val(), this.selectedCountryData.iso2);
	            }
	            return -99;
	        },
	        // validate the input val - assumes the global function isValidNumber (from utilsScript)
	        isValidNumber: function isValidNumber() {
	            var val = $.trim(this.telInput.val()),
	                countryCode = this.options.nationalMode ? this.selectedCountryData.iso2 : "",
	                // libphonenumber allows alpha chars, but in order to allow that, we'd need a method to retrieve the processed number, with letters replaced with numbers
	            containsAlpha = /[a-zA-Z]/.test(val);
	            if (!containsAlpha && window.intlTelInputUtils) {
	                return intlTelInputUtils.isValidNumber(val, countryCode);
	            }
	            return false;
	        },
	        // load the utils script
	        loadUtils: function loadUtils(path) {
	            var utilsScript = path || this.options.utilsScript;
	            if (!$.fn[pluginName].loadedUtilsScript && utilsScript) {
	                // don't do this twice! (dont just check if the global intlTelInputUtils exists as if init plugin multiple times in quick succession, it may not have finished loading yet)
	                $.fn[pluginName].loadedUtilsScript = true;
	                // dont use $.getScript as it prevents caching
	                $.ajax({
	                    url: utilsScript,
	                    success: function success() {
	                        // tell all instances the utils are ready
	                        $(".intl-tel-input input").intlTelInput("utilsLoaded");
	                    },
	                    dataType: "script",
	                    cache: true
	                });
	            }
	        },
	        // update the selected flag, and update the input val accordingly
	        selectCountry: function selectCountry(countryCode) {
	            // check if already selected
	            if (!this.selectedFlagInner.hasClass(countryCode)) {
	                this._selectFlag(countryCode);
	                this._updateDialCode(this.selectedCountryData.dialCode, false);
	            }
	        },
	        // set the input value and update the flag
	        setNumber: function setNumber(number, addSuffix) {
	            // ensure starts with plus
	            if (!this.options.nationalMode && number.substr(0, 1) != "+") {
	                number = "+" + number;
	            }
	            // we must update the flag first, which updates this.selectedCountryData, which is used later for formatting the number before displaying it
	            this._updateFlagFromNumber(number);
	            this._updateVal(number, addSuffix);
	        },
	        // this is called when the utils are ready
	        utilsLoaded: function utilsLoaded() {
	            // if autoFormat is enabled and there's an initial value in the input, then format it
	            if (this.options.autoFormat && this.telInput.val()) {
	                this._updateVal(this.telInput.val());
	            }
	            this._updatePlaceholder();
	        }
	    };
	    // adapted to allow public functions
	    // using https://github.com/jquery-boilerplate/jquery-boilerplate/wiki/Extending-jQuery-Boilerplate
	    $.fn[pluginName] = function (options) {
	        var args = arguments;
	        // Is the first parameter an object (options), or was omitted,
	        // instantiate a new instance of the plugin.
	        if (options === undefined || typeof options === "object") {
	            return this.each(function () {
	                if (!$.data(this, "plugin_" + pluginName)) {
	                    $.data(this, "plugin_" + pluginName, new Plugin(this, options));
	                }
	            });
	        } else if (typeof options === "string" && options[0] !== "_" && options !== "init") {
	            // If the first parameter is a string and it doesn't start
	            // with an underscore or "contains" the `init`-function,
	            // treat this as a call to a public method.
	            // Cache the method call to make it possible to return a value
	            var returns;
	            this.each(function () {
	                var instance = $.data(this, "plugin_" + pluginName);
	                // Tests that there's already a plugin-instance
	                // and checks that the requested public method exists
	                if (instance instanceof Plugin && typeof instance[options] === "function") {
	                    // Call the method of our plugin instance,
	                    // and pass it the supplied arguments.
	                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
	                }
	                // Allow instances to be destroyed via the 'destroy' method
	                if (options === "destroy") {
	                    $.data(this, "plugin_" + pluginName, null);
	                }
	            });
	            // If the earlier cached method gives a value back return the value,
	            // otherwise return this to preserve chainability.
	            return returns !== undefined ? returns : this;
	        }
	    };
	    /********************
	    *  STATIC METHODS
	    ********************/
	    // get the country data object
	    $.fn[pluginName].getCountryData = function () {
	        return allCountries;
	    };
	    // set the country data object
	    $.fn[pluginName].setCountryData = function (obj) {
	        allCountries = obj;
	    };
	    // Tell JSHint to ignore this warning: "character may get silently deleted by one or more browsers"
	    // jshint -W100
	    // Array of country objects for the flag dropdown.
	    // Each contains a name, country code (ISO 3166-1 alpha-2) and dial code.
	    // Originally from https://github.com/mledoze/countries
	    // then modified using the following JavaScript (NOW OUT OF DATE):
	    /*
	    var result = [];
	    _.each(countries, function(c) {
	    // ignore countries without a dial code
	    if (c.callingCode[0].length) {
	    result.push({
	      // var locals contains country names with localised versions in brackets
	      n: _.findWhere(locals, {
	        countryCode: c.cca2
	      }).name,
	      i: c.cca2.toLowerCase(),
	      d: c.callingCode[0]
	    });
	    }
	    });
	    JSON.stringify(result);
	    */
	    // then with a couple of manual re-arrangements to be alphabetical
	    // then changed Kazakhstan from +76 to +7
	    // and Vatican City from +379 to +39 (see issue 50)
	    // and Caribean Netherlands from +5997 to +599
	    // and Curacao from +5999 to +599
	    // Removed: Åland Islands, Christmas Island, Cocos Islands, Guernsey, Isle of Man, Jersey, Kosovo, Mayotte, Pitcairn Islands, South Georgia, Svalbard, Western Sahara
	    // Update: converted objects to arrays to save bytes!
	    // Update: added "priority" for countries with the same dialCode as others
	    // Update: added array of area codes for countries with the same dialCode as others
	    // So each country array has the following information:
	    // [
	    //    Country name,
	    //    iso2 code,
	    //    International dial code,
	    //    Order (if >1 country with same dial code),
	    //    Area codes (if >1 country with same dial code)
	    // ]
	    var allCountries = [["Afghanistan (‫افغانستان‬‎)", "af", "93"], ["Albania (Shqipëri)", "al", "355"], ["Algeria (‫الجزائر‬‎)", "dz", "213"], ["American Samoa", "as", "1684"], ["Andorra", "ad", "376"], ["Angola", "ao", "244"], ["Anguilla", "ai", "1264"], ["Antigua and Barbuda", "ag", "1268"], ["Argentina", "ar", "54"], ["Armenia (Հայաստան)", "am", "374"], ["Aruba", "aw", "297"], ["Australia", "au", "61"], ["Austria (Österreich)", "at", "43"], ["Azerbaijan (Azərbaycan)", "az", "994"], ["Bahamas", "bs", "1242"], ["Bahrain (‫البحرين‬‎)", "bh", "973"], ["Bangladesh (বাংলাদেশ)", "bd", "880"], ["Barbados", "bb", "1246"], ["Belarus (Беларусь)", "by", "375"], ["Belgium (België)", "be", "32"], ["Belize", "bz", "501"], ["Benin (Bénin)", "bj", "229"], ["Bermuda", "bm", "1441"], ["Bhutan (འབྲུག)", "bt", "975"], ["Bolivia", "bo", "591"], ["Bosnia and Herzegovina (Босна и Херцеговина)", "ba", "387"], ["Botswana", "bw", "267"], ["Brazil (Brasil)", "br", "55"], ["British Indian Ocean Territory", "io", "246"], ["British Virgin Islands", "vg", "1284"], ["Brunei", "bn", "673"], ["Bulgaria (България)", "bg", "359"], ["Burkina Faso", "bf", "226"], ["Burundi (Uburundi)", "bi", "257"], ["Cambodia (កម្ពុជា)", "kh", "855"], ["Cameroon (Cameroun)", "cm", "237"], ["Canada", "ca", "1", 1, ["204", "236", "249", "250", "289", "306", "343", "365", "387", "403", "416", "418", "431", "437", "438", "450", "506", "514", "519", "548", "579", "581", "587", "604", "613", "639", "647", "672", "705", "709", "742", "778", "780", "782", "807", "819", "825", "867", "873", "902", "905"]], ["Cape Verde (Kabu Verdi)", "cv", "238"], ["Caribbean Netherlands", "bq", "599", 1], ["Cayman Islands", "ky", "1345"], ["Central African Republic (République centrafricaine)", "cf", "236"], ["Chad (Tchad)", "td", "235"], ["Chile", "cl", "56"], ["China (中国)", "cn", "86"], ["Colombia", "co", "57"], ["Comoros (‫جزر القمر‬‎)", "km", "269"], ["Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)", "cd", "243"], ["Congo (Republic) (Congo-Brazzaville)", "cg", "242"], ["Cook Islands", "ck", "682"], ["Costa Rica", "cr", "506"], ["Côte d’Ivoire", "ci", "225"], ["Croatia (Hrvatska)", "hr", "385"], ["Cuba", "cu", "53"], ["Curaçao", "cw", "599", 0], ["Cyprus (Κύπρος)", "cy", "357"], ["Czech Republic (Česká republika)", "cz", "420"], ["Denmark (Danmark)", "dk", "45"], ["Djibouti", "dj", "253"], ["Dominica", "dm", "1767"], ["Dominican Republic (República Dominicana)", "do", "1", 2, ["809", "829", "849"]], ["Ecuador", "ec", "593"], ["Egypt (‫مصر‬‎)", "eg", "20"], ["El Salvador", "sv", "503"], ["Equatorial Guinea (Guinea Ecuatorial)", "gq", "240"], ["Eritrea", "er", "291"], ["Estonia (Eesti)", "ee", "372"], ["Ethiopia", "et", "251"], ["Falkland Islands (Islas Malvinas)", "fk", "500"], ["Faroe Islands (Føroyar)", "fo", "298"], ["Fiji", "fj", "679"], ["Finland (Suomi)", "fi", "358"], ["France", "fr", "33"], ["French Guiana (Guyane française)", "gf", "594"], ["French Polynesia (Polynésie française)", "pf", "689"], ["Gabon", "ga", "241"], ["Gambia", "gm", "220"], ["Georgia (საქართველო)", "ge", "995"], ["Germany (Deutschland)", "de", "49"], ["Ghana (Gaana)", "gh", "233"], ["Gibraltar", "gi", "350"], ["Greece (Ελλάδα)", "gr", "30"], ["Greenland (Kalaallit Nunaat)", "gl", "299"], ["Grenada", "gd", "1473"], ["Guadeloupe", "gp", "590", 0], ["Guam", "gu", "1671"], ["Guatemala", "gt", "502"], ["Guinea (Guinée)", "gn", "224"], ["Guinea-Bissau (Guiné Bissau)", "gw", "245"], ["Guyana", "gy", "592"], ["Haiti", "ht", "509"], ["Honduras", "hn", "504"], ["Hong Kong (香港)", "hk", "852"], ["Hungary (Magyarország)", "hu", "36"], ["Iceland (Ísland)", "is", "354"], ["India (भारत)", "in", "91"], ["Indonesia", "id", "62"], ["Iran (‫ایران‬‎)", "ir", "98"], ["Iraq (‫العراق‬‎)", "iq", "964"], ["Ireland", "ie", "353"], ["Israel (‫ישראל‬‎)", "il", "972"], ["Italy (Italia)", "it", "39", 0], ["Jamaica", "jm", "1876"], ["Japan (日本)", "jp", "81"], ["Jordan (‫الأردن‬‎)", "jo", "962"], ["Kazakhstan (Казахстан)", "kz", "7", 1], ["Kenya", "ke", "254"], ["Kiribati", "ki", "686"], ["Kuwait (‫الكويت‬‎)", "kw", "965"], ["Kyrgyzstan (Кыргызстан)", "kg", "996"], ["Laos (ລາວ)", "la", "856"], ["Latvia (Latvija)", "lv", "371"], ["Lebanon (‫لبنان‬‎)", "lb", "961"], ["Lesotho", "ls", "266"], ["Liberia", "lr", "231"], ["Libya (‫ليبيا‬‎)", "ly", "218"], ["Liechtenstein", "li", "423"], ["Lithuania (Lietuva)", "lt", "370"], ["Luxembourg", "lu", "352"], ["Macau (澳門)", "mo", "853"], ["Macedonia (FYROM) (Македонија)", "mk", "389"], ["Madagascar (Madagasikara)", "mg", "261"], ["Malawi", "mw", "265"], ["Malaysia", "my", "60"], ["Maldives", "mv", "960"], ["Mali", "ml", "223"], ["Malta", "mt", "356"], ["Marshall Islands", "mh", "692"], ["Martinique", "mq", "596"], ["Mauritania (‫موريتانيا‬‎)", "mr", "222"], ["Mauritius (Moris)", "mu", "230"], ["Mexico (México)", "mx", "52"], ["Micronesia", "fm", "691"], ["Moldova (Republica Moldova)", "md", "373"], ["Monaco", "mc", "377"], ["Mongolia (Монгол)", "mn", "976"], ["Montenegro (Crna Gora)", "me", "382"], ["Montserrat", "ms", "1664"], ["Morocco (‫المغرب‬‎)", "ma", "212"], ["Mozambique (Moçambique)", "mz", "258"], ["Myanmar (Burma) (မြန်မာ)", "mm", "95"], ["Namibia (Namibië)", "na", "264"], ["Nauru", "nr", "674"], ["Nepal (नेपाल)", "np", "977"], ["Netherlands (Nederland)", "nl", "31"], ["New Caledonia (Nouvelle-Calédonie)", "nc", "687"], ["New Zealand", "nz", "64"], ["Nicaragua", "ni", "505"], ["Niger (Nijar)", "ne", "227"], ["Nigeria", "ng", "234"], ["Niue", "nu", "683"], ["Norfolk Island", "nf", "672"], ["North Korea (조선 민주주의 인민 공화국)", "kp", "850"], ["Northern Mariana Islands", "mp", "1670"], ["Norway (Norge)", "no", "47"], ["Oman (‫عُمان‬‎)", "om", "968"], ["Pakistan (‫پاکستان‬‎)", "pk", "92"], ["Palau", "pw", "680"], ["Palestine (‫فلسطين‬‎)", "ps", "970"], ["Panama (Panamá)", "pa", "507"], ["Papua New Guinea", "pg", "675"], ["Paraguay", "py", "595"], ["Peru (Perú)", "pe", "51"], ["Philippines", "ph", "63"], ["Poland (Polska)", "pl", "48"], ["Portugal", "pt", "351"], ["Puerto Rico", "pr", "1", 3, ["787", "939"]], ["Qatar (‫قطر‬‎)", "qa", "974"], ["Réunion (La Réunion)", "re", "262"], ["Romania (România)", "ro", "40"], ["Russia (Россия)", "ru", "7", 0], ["Rwanda", "rw", "250"], ["Saint Barthélemy (Saint-Barthélemy)", "bl", "590", 1], ["Saint Helena", "sh", "290"], ["Saint Kitts and Nevis", "kn", "1869"], ["Saint Lucia", "lc", "1758"], ["Saint Martin (Saint-Martin (partie française))", "mf", "590", 2], ["Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)", "pm", "508"], ["Saint Vincent and the Grenadines", "vc", "1784"], ["Samoa", "ws", "685"], ["San Marino", "sm", "378"], ["São Tomé and Príncipe (São Tomé e Príncipe)", "st", "239"], ["Saudi Arabia (‫المملكة العربية السعودية‬‎)", "sa", "966"], ["Senegal (Sénégal)", "sn", "221"], ["Serbia (Србија)", "rs", "381"], ["Seychelles", "sc", "248"], ["Sierra Leone", "sl", "232"], ["Singapore", "sg", "65"], ["Sint Maarten", "sx", "1721"], ["Slovakia (Slovensko)", "sk", "421"], ["Slovenia (Slovenija)", "si", "386"], ["Solomon Islands", "sb", "677"], ["Somalia (Soomaaliya)", "so", "252"], ["South Africa", "za", "27"], ["South Korea (대한민국)", "kr", "82"], ["South Sudan (‫جنوب السودان‬‎)", "ss", "211"], ["Spain (España)", "es", "34"], ["Sri Lanka (ශ්‍රී ලංකාව)", "lk", "94"], ["Sudan (‫السودان‬‎)", "sd", "249"], ["Suriname", "sr", "597"], ["Swaziland", "sz", "268"], ["Sweden (Sverige)", "se", "46"], ["Switzerland (Schweiz)", "ch", "41"], ["Syria (‫سوريا‬‎)", "sy", "963"], ["Taiwan (台灣)", "tw", "886"], ["Tajikistan", "tj", "992"], ["Tanzania", "tz", "255"], ["Thailand (ไทย)", "th", "66"], ["Timor-Leste", "tl", "670"], ["Togo", "tg", "228"], ["Tokelau", "tk", "690"], ["Tonga", "to", "676"], ["Trinidad and Tobago", "tt", "1868"], ["Tunisia (‫تونس‬‎)", "tn", "216"], ["Turkey (Türkiye)", "tr", "90"], ["Turkmenistan", "tm", "993"], ["Turks and Caicos Islands", "tc", "1649"], ["Tuvalu", "tv", "688"], ["U.S. Virgin Islands", "vi", "1340"], ["Uganda", "ug", "256"], ["Ukraine (Україна)", "ua", "380"], ["United Arab Emirates (‫الإمارات العربية المتحدة‬‎)", "ae", "971"], ["United Kingdom", "gb", "44"], ["United States", "us", "1", 0], ["Uruguay", "uy", "598"], ["Uzbekistan (Oʻzbekiston)", "uz", "998"], ["Vanuatu", "vu", "678"], ["Vatican City (Città del Vaticano)", "va", "39", 1], ["Venezuela", "ve", "58"], ["Vietnam (Việt Nam)", "vn", "84"], ["Wallis and Futuna", "wf", "681"], ["Yemen (‫اليمن‬‎)", "ye", "967"], ["Zambia", "zm", "260"], ["Zimbabwe", "zw", "263"]];
	    // loop over all of the countries above
	    for (var i = 0; i < allCountries.length; i++) {
	        var c = allCountries[i];
	        allCountries[i] = {
	            name: c[0],
	            iso2: c[1],
	            dialCode: c[2],
	            priority: c[3] || 0,
	            areaCodes: c[4] || null
	        };
	    }
	});
	// wrap in UMD - see https://github.com/umdjs/umd/blob/master/jqueryPlugin.js

/***/ },

/***/ 7:
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
	//	- Updated DetectTizen(). Now tests for “mobile” to disambiguate from Samsung Smart TVs
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

/***/ 8:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	__webpack_require__(9);
	
	$(function () {
		$('#mobile_navigation .search').click(function () {
			$('#mobile_skill_input').focus();
		});
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 9:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/* ========================================================================
	 * Bootstrap: sidebar.js v0.1
	 * ========================================================================
	 * Copyright 2011-2014 Asyraf Abdul Rahman
	 * Licensed under MIT
	 * ======================================================================== */
	
	'use strict';
	
	+(function ($) {
	  'use strict';
	
	  // SIDEBAR PUBLIC CLASS DEFINITION
	  // ================================
	
	  var Sidebar = function Sidebar(element, options) {
	    this.$element = $(element);
	    this.options = $.extend({}, Sidebar.DEFAULTS, options);
	    this.transitioning = null;
	
	    if (this.options.parent) this.$parent = $(this.options.parent);
	    if (this.options.toggle) this.toggle();
	  };
	
	  Sidebar.DEFAULTS = {
	    toggle: true
	  };
	
	  Sidebar.prototype.show = function () {
	    if (this.transitioning || this.$element.hasClass('sidebar-open')) return;
	
	    var startEvent = $.Event('show.bs.sidebar');
	    this.$element.trigger(startEvent);
	    if (startEvent.isDefaultPrevented()) return;
	
	    this.$element.addClass('sidebar-open');
	
	    this.transitioning = 1;
	
	    var complete = function complete() {
	      this.$element;
	      this.transitioning = 0;
	      this.$element.trigger('shown.bs.sidebar');
	    };
	
	    if (!$.support.transition) return complete.call(this);
	
	    this.$element.one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(400);
	  };
	
	  Sidebar.prototype.hide = function () {
	    if (this.transitioning || !this.$element.hasClass('sidebar-open')) return;
	
	    var startEvent = $.Event('hide.bs.sidebar');
	    this.$element.trigger(startEvent);
	    if (startEvent.isDefaultPrevented()) return;
	
	    this.$element.removeClass('sidebar-open');
	
	    this.transitioning = 1;
	
	    var complete = function complete() {
	      this.transitioning = 0;
	      this.$element.trigger('hidden.bs.sidebar');
	    };
	
	    if (!$.support.transition) return complete.call(this);
	
	    this.$element.one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(400);
	  };
	
	  Sidebar.prototype.toggle = function () {
	    this[this.$element.hasClass('sidebar-open') ? 'hide' : 'show']();
	  };
	
	  var old = $.fn.sidebar;
	
	  $.fn.sidebar = function (option) {
	    return this.each(function () {
	      var $this = $(this);
	      var data = $this.data('bs.sidebar');
	      var options = $.extend({}, Sidebar.DEFAULTS, $this.data(), typeof options == 'object' && option);
	
	      if (!data && options.toggle && option == 'show') option = !option;
	      if (!data) $this.data('bs.sidebar', data = new Sidebar(this, options));
	      if (typeof option == 'string') data[option]();
	    });
	  };
	
	  $.fn.sidebar.Constructor = Sidebar;
	
	  $.fn.sidebar.noConflict = function () {
	    $.fn.sidebar = old;
	    return this;
	  };
	
	  $(document).on('click.bs.sidebar.data-api', '[data-toggle="sidebar"]', function (e) {
	    var $this = $(this),
	        href;
	    var target = $this.attr('data-target') || e.preventDefault() || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '');
	    var $target = $(target);
	    var data = $target.data('bs.sidebar');
	    var option = data ? 'toggle' : $this.data();
	
	    $target.sidebar(option);
	  });
	
	  $('html').on('click.bs.sidebar.autohide', function (event) {
	    var $this = $(event.target);
	    var isButtonOrSidebar = $this.is('.sidebar, [data-toggle="sidebar"]') || $this.parents('.sidebar, [data-toggle="sidebar"]').length;
	    if (isButtonOrSidebar) {
	      return;
	    } else {
	      var $target = $('.sidebar');
	      $target.each(function (i, trgt) {
	        var $trgt = $(trgt);
	        if ($trgt.data('bs.sidebar') && $trgt.hasClass('sidebar-open')) {
	          $trgt.sidebar('hide');
	        }
	      });
	    }
	  });
	})(jQuery);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 11:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function($) {// `window.ParsleyExtend`, like `ParsleyAbstract`, is inherited by `ParsleyField` and `ParsleyForm`
	// That way, we could add new methods or redefine some for these both classes. In particular case
	// We are adding async validation methods that returns promises, bind them properly to triggered
	// Events like onkeyup when field is invalid or on form submit. These validation methods adds an
	// Extra `remote` validator which could not be simply added like other `ParsleyExtra` validators
	// Because returns promises instead of booleans.
	'use strict';
	
	window.ParsleyExtend = window.ParsleyExtend || {};
	window.ParsleyExtend = $.extend(window.ParsleyExtend, {
	  asyncSupport: true,
	
	  asyncValidators: $.extend({
	    'default': {
	      fn: function fn(xhr) {
	        return 'resolved' === xhr.state();
	      },
	      url: false
	    },
	    reverse: {
	      fn: function fn(xhr) {
	        // If reverse option is set, a failing ajax request is considered successful
	        return 'rejected' === xhr.state();
	      },
	      url: false
	    }
	  }, window.ParsleyExtend.asyncValidators),
	
	  addAsyncValidator: function addAsyncValidator(name, fn, url, options) {
	    this.asyncValidators[name.toLowerCase()] = {
	      fn: fn,
	      url: url || false,
	      options: options || {}
	    };
	
	    return this;
	  },
	
	  asyncValidate: function asyncValidate() {
	    if ('ParsleyForm' === this.__class__) return this._asyncValidateForm.apply(this, arguments);
	
	    return this._asyncValidateField.apply(this, arguments);
	  },
	
	  asyncIsValid: function asyncIsValid() {
	    if ('ParsleyField' === this.__class__) return this._asyncIsValidField.apply(this, arguments);
	
	    return this._asyncIsValidForm.apply(this, arguments);
	  },
	
	  onSubmitValidate: function onSubmitValidate(event) {
	    var that = this;
	
	    // This is a Parsley generated submit event, do not validate, do not prevent, simply exit and keep normal behavior
	    if (true === event.parsley) return;
	
	    // Clone the event object
	    this.submitEvent = $.extend(true, {}, event);
	
	    // Prevent form submit and immediately stop its event propagation
	    if (event instanceof $.Event) {
	      event.stopImmediatePropagation();
	      event.preventDefault();
	    }
	
	    return this._asyncValidateForm(undefined, event).done(function () {
	      // If user do not have prevented the event, re-submit form
	      if (!that.submitEvent.isDefaultPrevented()) that.$element.trigger($.extend($.Event('submit'), { parsley: true }));
	    });
	  },
	
	  eventValidate: function eventValidate(event) {
	    // For keyup, keypress, keydown.. events that could be a little bit obstrusive
	    // do not validate if val length < min threshold on first validation. Once field have been validated once and info
	    // about success or failure have been displayed, always validate with this trigger to reflect every yalidation change.
	    if (new RegExp('key').test(event.type)) if (!this._ui.validationInformationVisible && this.getValue().length <= this.options.validationThreshold) return;
	
	    this._ui.validatedOnce = true;
	    this.asyncValidate();
	  },
	
	  // Returns Promise
	  _asyncValidateForm: function _asyncValidateForm(group, event) {
	    var that = this,
	        promises = [];
	
	    this._refreshFields();
	
	    $.emit('parsley:form:validate', this);
	
	    for (var i = 0; i < this.fields.length; i++) {
	
	      // do not validate a field if not the same as given validation group
	      if (group && group !== this.fields[i].options.group) continue;
	
	      promises.push(this.fields[i]._asyncValidateField());
	    }
	
	    return $.when.apply($, promises).done(function () {
	      $.emit('parsley:form:success', that);
	    }).fail(function () {
	      $.emit('parsley:form:error', that);
	    }).always(function () {
	      $.emit('parsley:form:validated', that);
	    });
	  },
	
	  _asyncIsValidForm: function _asyncIsValidForm(group, force) {
	    var promises = [];
	    this._refreshFields();
	
	    for (var i = 0; i < this.fields.length; i++) {
	
	      // do not validate a field if not the same as given validation group
	      if (group && group !== this.fields[i].options.group) continue;
	
	      promises.push(this.fields[i]._asyncIsValidField(force));
	    }
	
	    return $.when.apply($, promises);
	  },
	
	  _asyncValidateField: function _asyncValidateField(force) {
	    var that = this;
	
	    $.emit('parsley:field:validate', this);
	
	    return this._asyncIsValidField(force).done(function () {
	      $.emit('parsley:field:success', that);
	    }).fail(function () {
	      $.emit('parsley:field:error', that);
	    }).always(function () {
	      $.emit('parsley:field:validated', that);
	    });
	  },
	
	  _asyncIsValidField: function _asyncIsValidField(force, value) {
	    var deferred = $.Deferred(),
	        remoteConstraintIndex;
	
	    // If regular isValid (matching regular constraints) returns `false`, no need to go further
	    // Directly reject promise, do not run remote validator and save server load
	    if (false === this.isValid(force, value)) deferred.rejectWith(this);
	
	    // If regular constraints are valid, and there is a remote validator registered, run it
	    else if ('undefined' !== typeof this.constraintsByName.remote) this._remote(deferred);
	
	      // Otherwise all is good, resolve promise
	      else deferred.resolveWith(this);
	
	    // Return promise
	    return deferred.promise();
	  },
	
	  _remote: function _remote(deferred) {
	    var that = this,
	        data = {},
	        ajaxOptions,
	        csr,
	        validator = this.options.remoteValidator || (true === this.options.remoteReverse ? 'reverse' : 'default');
	
	    validator = validator.toLowerCase();
	
	    if ('undefined' === typeof this.asyncValidators[validator]) throw new Error('Calling an undefined async validator: `' + validator + '`');
	
	    // Fill data with current value
	    data[this.$element.attr('name') || this.$element.attr('id')] = this.getValue();
	
	    // Merge options passed in from the function with the ones in the attribute
	    this.options.remoteOptions = $.extend(true, this.options.remoteOptions || {}, this.asyncValidators[validator].options);
	
	    // All `$.ajax(options)` could be overridden or extended directly from DOM in `data-parsley-remote-options`
	    ajaxOptions = $.extend(true, {}, {
	      url: this.asyncValidators[validator].url || this.options.remote,
	      data: data,
	      type: 'GET'
	    }, this.options.remoteOptions || {});
	
	    // Generate store key based on ajax options
	    csr = $.param(ajaxOptions);
	
	    // Initialise querry cache
	    if ('undefined' === typeof this._remoteCache) this._remoteCache = {};
	
	    // Try to retrieve stored xhr
	    if (!this._remoteCache[csr]) {
	      // Prevent multi burst xhr queries
	      if (this._xhr && 'pending' === this._xhr.state()) this._xhr.abort();
	
	      // Make ajax call
	      this._xhr = $.ajax(ajaxOptions);
	
	      // Store remote call result to avoid next calls with exact same parameters
	      this._remoteCache[csr] = this._xhr;
	    }
	
	    this._remoteCache[csr].done(function (data, textStatus, xhr) {
	      that._handleRemoteResult(validator, xhr, deferred);
	    }).fail(function (xhr, status, message) {
	      // If we aborted the query, do not handle nothing for this value
	      if ('abort' === status) return;
	
	      that._handleRemoteResult(validator, xhr, deferred);
	    });
	  },
	
	  _handleRemoteResult: function _handleRemoteResult(validator, xhr, deferred) {
	    // If true, simply resolve and exit
	    if ('function' === typeof this.asyncValidators[validator].fn && this.asyncValidators[validator].fn.call(this, xhr)) {
	      deferred.resolveWith(this);
	
	      return;
	    }
	
	    // Else, create a proper remote validation Violation to trigger right UI
	    this.validationResult = [new window.ParsleyValidator.Validator.Violation(this.constraintsByName.remote, this.getValue(), null)];
	
	    deferred.rejectWith(this);
	  }
	});
	
	// Remote validator is just an always true sync validator with lowest (-1) priority possible
	// It will be overloaded in `validateThroughValidator()` that will do the heavy async work
	// This 'hack' is needed not to mess up too much with error messages and stuff in `ParsleyUI`
	window.ParsleyConfig = window.ParsleyConfig || {};
	window.ParsleyConfig.validators = window.ParsleyConfig.validators || {};
	window.ParsleyConfig.validators.remote = {
	  fn: function fn() {
	    return true;
	  },
	  priority: -1
	};
	
	/*!
	* Parsleyjs
	* Guillaume Potier - <guillaume@wisembly.com>
	* Version 2.0.6 - built Sat Jan 24 2015 14:44:37
	* MIT Licensed
	*
	*/
	!(function (factory) {
	  if (true) {
	    // AMD. Register as an anonymous module depending on jQuery.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else {
	    // No AMD. Register plugin with global jQuery object.
	    factory(jQuery);
	  }
	})(function ($) {
	  // small hack for requirejs if jquery is loaded through map and not path
	  // see http://requirejs.org/docs/jquery.html
	  if ('undefined' === typeof $ && 'undefined' !== typeof window.jQuery) $ = window.jQuery;
	  var ParsleyUtils = {
	    // Parsley DOM-API
	    // returns object from dom attributes and values
	    // if attr is given, returns bool if attr present in DOM or not
	    attr: function attr($element, namespace, checkAttr) {
	      var attribute,
	          obj = {},
	          msie = this.msieversion(),
	          regex = new RegExp('^' + namespace, 'i');
	      if ('undefined' === typeof $element || 'undefined' === typeof $element[0]) return {};
	      for (var i in $element[0].attributes) {
	        attribute = $element[0].attributes[i];
	        if ('undefined' !== typeof attribute && null !== attribute && (!msie || msie >= 8 || attribute.specified) && regex.test(attribute.name)) {
	          if ('undefined' !== typeof checkAttr && new RegExp(checkAttr + '$', 'i').test(attribute.name)) return true;
	          obj[this.camelize(attribute.name.replace(namespace, ''))] = this.deserializeValue(attribute.value);
	        }
	      }
	      return 'undefined' === typeof checkAttr ? obj : false;
	    },
	    setAttr: function setAttr($element, namespace, attr, value) {
	      $element[0].setAttribute(this.dasherize(namespace + attr), String(value));
	    },
	    // Recursive object / array getter
	    get: function get(obj, path) {
	      var i = 0,
	          paths = (path || '').split('.');
	      while (this.isObject(obj) || this.isArray(obj)) {
	        obj = obj[paths[i++]];
	        if (i === paths.length) return obj;
	      }
	      return undefined;
	    },
	    hash: function hash(length) {
	      return String(Math.random()).substring(2, length ? length + 2 : 9);
	    },
	    /** Third party functions **/
	    // Underscore isArray
	    isArray: function isArray(mixed) {
	      return Object.prototype.toString.call(mixed) === '[object Array]';
	    },
	    // Underscore isObject
	    isObject: function isObject(mixed) {
	      return mixed === Object(mixed);
	    },
	    // Zepto deserialize function
	    deserializeValue: function deserializeValue(value) {
	      var num;
	      try {
	        return value ? value == "true" || (value == "false" ? false : value == "null" ? null : !isNaN(num = Number(value)) ? num : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value;
	      } catch (e) {
	        return value;
	      }
	    },
	    // Zepto camelize function
	    camelize: function camelize(str) {
	      return str.replace(/-+(.)?/g, function (match, chr) {
	        return chr ? chr.toUpperCase() : '';
	      });
	    },
	    // Zepto dasherize function
	    dasherize: function dasherize(str) {
	      return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
	    },
	    // http://support.microsoft.com/kb/167820
	    // http://stackoverflow.com/questions/19999388/jquery-check-if-user-is-using-ie
	    msieversion: function msieversion() {
	      var ua = window.navigator.userAgent,
	          msie = ua.indexOf('MSIE ');
	      if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	      return 0;
	    }
	  };
	  // All these options could be overriden and specified directly in DOM using
	  // `data-parsley-` default DOM-API
	  // eg: `inputs` can be set in DOM using `data-parsley-inputs="input, textarea"`
	  // eg: `data-parsley-stop-on-first-failing-constraint="false"`
	  var ParsleyDefaults = {
	    // ### General
	    // Default data-namespace for DOM API
	    namespace: 'data-parsley-',
	    // Supported inputs by default
	    inputs: 'input, textarea, select',
	    // Excluded inputs by default
	    excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden]',
	    // Stop validating field on highest priority failing constraint
	    priorityEnabled: true,
	    // ### UI
	    // Enable\Disable error messages
	    uiEnabled: true,
	    // Key events threshold before validation
	    validationThreshold: 3,
	    // Focused field on form validation error. 'fist'|'last'|'none'
	    focus: 'first',
	    // `$.Event()` that will trigger validation. eg: `keyup`, `change`...
	    trigger: false,
	    // Class that would be added on every failing validation Parsley field
	    errorClass: 'parsley-error',
	    // Same for success validation
	    successClass: 'parsley-success',
	    // Return the `$element` that will receive these above success or error classes
	    // Could also be (and given directly from DOM) a valid selector like `'#div'`
	    classHandler: function classHandler(ParsleyField) {},
	    // Return the `$element` where errors will be appended
	    // Could also be (and given directly from DOM) a valid selector like `'#div'`
	    errorsContainer: function errorsContainer(ParsleyField) {},
	    // ul elem that would receive errors' list
	    errorsWrapper: '<ul class="parsley-errors-list"></ul>',
	    // li elem that would receive error message
	    errorTemplate: '<li></li>'
	  };
	
	  var ParsleyAbstract = function ParsleyAbstract() {};
	  ParsleyAbstract.prototype = {
	    asyncSupport: false,
	    actualizeOptions: function actualizeOptions() {
	      this.options = this.OptionsFactory.get(this);
	      return this;
	    },
	    // ParsleyValidator validate proxy function . Could be replaced by third party scripts
	    validateThroughValidator: function validateThroughValidator(value, constraints, priority) {
	      return window.ParsleyValidator.validate(value, constraints, priority);
	    },
	    // Subscribe an event and a handler for a specific field or a specific form
	    // If on a ParsleyForm instance, it will be attached to form instance and also
	    // To every field instance for this form
	    subscribe: function subscribe(name, fn) {
	      $.listenTo(this, name.toLowerCase(), fn);
	      return this;
	    },
	    // Same as subscribe above. Unsubscribe an event for field, or form + its fields
	    unsubscribe: function unsubscribe(name) {
	      $.unsubscribeTo(this, name.toLowerCase());
	      return this;
	    },
	    // Reset UI
	    reset: function reset() {
	      // Field case: just emit a reset event for UI
	      if ('ParsleyForm' !== this.__class__) return $.emit('parsley:field:reset', this);
	      // Form case: emit a reset event for each field
	      for (var i = 0; i < this.fields.length; i++) $.emit('parsley:field:reset', this.fields[i]);
	      $.emit('parsley:form:reset', this);
	    },
	    // Destroy Parsley instance (+ UI)
	    destroy: function destroy() {
	      // Field case: emit destroy event to clean UI and then destroy stored instance
	      if ('ParsleyForm' !== this.__class__) {
	        this.$element.removeData('Parsley');
	        this.$element.removeData('ParsleyFieldMultiple');
	        $.emit('parsley:field:destroy', this);
	        return;
	      }
	      // Form case: destroy all its fields and then destroy stored instance
	      for (var i = 0; i < this.fields.length; i++) this.fields[i].destroy();
	      this.$element.removeData('Parsley');
	      $.emit('parsley:form:destroy', this);
	    }
	  };
	  /*!
	  * validator.js
	  * Guillaume Potier - <guillaume@wisembly.com>
	  * Version 1.0.1 - built Mon Aug 25 2014 16:10:10
	  * MIT Licensed
	  *
	  */
	  var Validator = (function () {
	    var exports = {};
	    /**
	    * Validator
	    */
	    var Validator = function Validator(options) {
	      this.__class__ = 'Validator';
	      this.__version__ = '1.0.1';
	      this.options = options || {};
	      this.bindingKey = this.options.bindingKey || '_validatorjsConstraint';
	    };
	    Validator.prototype = {
	      constructor: Validator,
	      /*
	      * Validate string: validate( string, Assert, string ) || validate( string, [ Assert, Assert ], [ string, string ] )
	      * Validate object: validate( object, Constraint, string ) || validate( object, Constraint, [ string, string ] )
	      * Validate binded object: validate( object, string ) || validate( object, [ string, string ] )
	      */
	      validate: function validate(objectOrString, AssertsOrConstraintOrGroup, group) {
	        if ('string' !== typeof objectOrString && 'object' !== typeof objectOrString) throw new Error('You must validate an object or a string');
	        // string / array validation
	        if ('string' === typeof objectOrString || _isArray(objectOrString)) return this._validateString(objectOrString, AssertsOrConstraintOrGroup, group);
	        // binded object validation
	        if (this.isBinded(objectOrString)) return this._validateBindedObject(objectOrString, AssertsOrConstraintOrGroup);
	        // regular object validation
	        return this._validateObject(objectOrString, AssertsOrConstraintOrGroup, group);
	      },
	      bind: function bind(object, constraint) {
	        if ('object' !== typeof object) throw new Error('Must bind a Constraint to an object');
	        object[this.bindingKey] = new Constraint(constraint);
	        return this;
	      },
	      unbind: function unbind(object) {
	        if ('undefined' === typeof object._validatorjsConstraint) return this;
	        delete object[this.bindingKey];
	        return this;
	      },
	      isBinded: function isBinded(object) {
	        return 'undefined' !== typeof object[this.bindingKey];
	      },
	      getBinded: function getBinded(object) {
	        return this.isBinded(object) ? object[this.bindingKey] : null;
	      },
	      _validateString: function _validateString(string, assert, group) {
	        var result,
	            failures = [];
	        if (!_isArray(assert)) assert = [assert];
	        for (var i = 0; i < assert.length; i++) {
	          if (!(assert[i] instanceof Assert)) throw new Error('You must give an Assert or an Asserts array to validate a string');
	          result = assert[i].check(string, group);
	          if (result instanceof Violation) failures.push(result);
	        }
	        return failures.length ? failures : true;
	      },
	      _validateObject: function _validateObject(object, constraint, group) {
	        if ('object' !== typeof constraint) throw new Error('You must give a constraint to validate an object');
	        if (constraint instanceof Constraint) return constraint.check(object, group);
	        return new Constraint(constraint).check(object, group);
	      },
	      _validateBindedObject: function _validateBindedObject(object, group) {
	        return object[this.bindingKey].check(object, group);
	      }
	    };
	    Validator.errorCode = {
	      must_be_a_string: 'must_be_a_string',
	      must_be_an_array: 'must_be_an_array',
	      must_be_a_number: 'must_be_a_number',
	      must_be_a_string_or_array: 'must_be_a_string_or_array'
	    };
	    /**
	    * Constraint
	    */
	    var Constraint = function Constraint(data, options) {
	      this.__class__ = 'Constraint';
	      this.options = options || {};
	      this.nodes = {};
	      if (data) {
	        try {
	          this._bootstrap(data);
	        } catch (err) {
	          throw new Error('Should give a valid mapping object to Constraint', err, data);
	        }
	      }
	    };
	    Constraint.prototype = {
	      constructor: Constraint,
	      check: function check(object, group) {
	        var result,
	            failures = {};
	        // check all constraint nodes.
	        for (var property in this.nodes) {
	          var isRequired = false;
	          var constraint = this.get(property);
	          var constraints = _isArray(constraint) ? constraint : [constraint];
	          for (var i = constraints.length - 1; i >= 0; i--) {
	            if ('Required' === constraints[i].__class__) {
	              isRequired = constraints[i].requiresValidation(group);
	              continue;
	            }
	          }
	          if (!this.has(property, object) && !this.options.strict && !isRequired) {
	            continue;
	          }
	          try {
	            if (!this.has(property, this.options.strict || isRequired ? object : undefined)) {
	              // we trigger here a HaveProperty Assert violation to have uniform Violation object in the end
	              new Assert().HaveProperty(property).validate(object);
	            }
	            result = this._check(property, object[property], group);
	            // check returned an array of Violations or an object mapping Violations
	            if (_isArray(result) && result.length > 0 || !_isArray(result) && !_isEmptyObject(result)) {
	              failures[property] = result;
	            }
	          } catch (violation) {
	            failures[property] = violation;
	          }
	        }
	        return _isEmptyObject(failures) ? true : failures;
	      },
	      add: function add(node, object) {
	        if (object instanceof Assert || _isArray(object) && object[0] instanceof Assert) {
	          this.nodes[node] = object;
	          return this;
	        }
	        if ('object' === typeof object && !_isArray(object)) {
	          this.nodes[node] = object instanceof Constraint ? object : new Constraint(object);
	          return this;
	        }
	        throw new Error('Should give an Assert, an Asserts array, a Constraint', object);
	      },
	      has: function has(node, nodes) {
	        nodes = 'undefined' !== typeof nodes ? nodes : this.nodes;
	        return 'undefined' !== typeof nodes[node];
	      },
	      get: function get(node, placeholder) {
	        return this.has(node) ? this.nodes[node] : placeholder || null;
	      },
	      remove: function remove(node) {
	        var _nodes = [];
	        for (var i in this.nodes) if (i !== node) _nodes[i] = this.nodes[i];
	        this.nodes = _nodes;
	        return this;
	      },
	      _bootstrap: function _bootstrap(data) {
	        if (data instanceof Constraint) return this.nodes = data.nodes;
	        for (var node in data) this.add(node, data[node]);
	      },
	      _check: function _check(node, value, group) {
	        // Assert
	        if (this.nodes[node] instanceof Assert) return this._checkAsserts(value, [this.nodes[node]], group);
	        // Asserts
	        if (_isArray(this.nodes[node])) return this._checkAsserts(value, this.nodes[node], group);
	        // Constraint -> check api
	        if (this.nodes[node] instanceof Constraint) return this.nodes[node].check(value, group);
	        throw new Error('Invalid node', this.nodes[node]);
	      },
	      _checkAsserts: function _checkAsserts(value, asserts, group) {
	        var result,
	            failures = [];
	        for (var i = 0; i < asserts.length; i++) {
	          result = asserts[i].check(value, group);
	          if ('undefined' !== typeof result && true !== result) failures.push(result);
	          // Some asserts (Collection for example) could return an object
	          // if ( result && ! ( result instanceof Violation ) )
	          //   return result;
	          //
	          // // Vast assert majority return Violation
	          // if ( result instanceof Violation )
	          //   failures.push( result );
	        }
	        return failures;
	      }
	    };
	    /**
	    * Violation
	    */
	    var Violation = function Violation(assert, value, violation) {
	      this.__class__ = 'Violation';
	      if (!(assert instanceof Assert)) throw new Error('Should give an assertion implementing the Assert interface');
	      this.assert = assert;
	      this.value = value;
	      if ('undefined' !== typeof violation) this.violation = violation;
	    };
	    Violation.prototype = {
	      show: function show() {
	        var show = {
	          assert: this.assert.__class__,
	          value: this.value
	        };
	        if (this.violation) show.violation = this.violation;
	        return show;
	      },
	      __toString: function __toString() {
	        if ('undefined' !== typeof this.violation) this.violation = '", ' + this.getViolation().constraint + ' expected was ' + this.getViolation().expected;
	        return this.assert.__class__ + ' assert failed for "' + this.value + this.violation || '';
	      },
	      getViolation: function getViolation() {
	        var constraint, expected;
	        for (constraint in this.violation) expected = this.violation[constraint];
	        return { constraint: constraint, expected: expected };
	      }
	    };
	    /**
	    * Assert
	    */
	    var Assert = function Assert(group) {
	      this.__class__ = 'Assert';
	      this.__parentClass__ = this.__class__;
	      this.groups = [];
	      if ('undefined' !== typeof group) this.addGroup(group);
	    };
	    Assert.prototype = {
	      construct: Assert,
	      requiresValidation: function requiresValidation(group) {
	        if (group && !this.hasGroup(group)) return false;
	        if (!group && this.hasGroups()) return false;
	        return true;
	      },
	      check: function check(value, group) {
	        if (!this.requiresValidation(group)) return;
	        try {
	          return this.validate(value, group);
	        } catch (violation) {
	          return violation;
	        }
	      },
	      hasGroup: function hasGroup(group) {
	        if (_isArray(group)) return this.hasOneOf(group);
	        // All Asserts respond to "Any" group
	        if ('Any' === group) return true;
	        // Asserts with no group also respond to "Default" group. Else return false
	        if (!this.hasGroups()) return 'Default' === group;
	        return -1 !== this.groups.indexOf(group);
	      },
	      hasOneOf: function hasOneOf(groups) {
	        for (var i = 0; i < groups.length; i++) if (this.hasGroup(groups[i])) return true;
	        return false;
	      },
	      hasGroups: function hasGroups() {
	        return this.groups.length > 0;
	      },
	      addGroup: function addGroup(group) {
	        if (_isArray(group)) return this.addGroups(group);
	        if (!this.hasGroup(group)) this.groups.push(group);
	        return this;
	      },
	      removeGroup: function removeGroup(group) {
	        var _groups = [];
	        for (var i = 0; i < this.groups.length; i++) if (group !== this.groups[i]) _groups.push(this.groups[i]);
	        this.groups = _groups;
	        return this;
	      },
	      addGroups: function addGroups(groups) {
	        for (var i = 0; i < groups.length; i++) this.addGroup(groups[i]);
	        return this;
	      },
	      /**
	      * Asserts definitions
	      */
	      HaveProperty: function HaveProperty(node) {
	        this.__class__ = 'HaveProperty';
	        this.node = node;
	        this.validate = function (object) {
	          if ('undefined' === typeof object[this.node]) throw new Violation(this, object, { value: this.node });
	          return true;
	        };
	        return this;
	      },
	      Blank: function Blank() {
	        this.__class__ = 'Blank';
	        this.validate = function (value) {
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if ('' !== value.replace(/^\s+/g, '').replace(/\s+$/g, '')) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      Callback: function Callback(fn) {
	        this.__class__ = 'Callback';
	        this.arguments = Array.prototype.slice.call(arguments);
	        if (1 === this.arguments.length) this.arguments = [];else this.arguments.splice(0, 1);
	        if ('function' !== typeof fn) throw new Error('Callback must be instanciated with a function');
	        this.fn = fn;
	        this.validate = function (value) {
	          var result = this.fn.apply(this, [value].concat(this.arguments));
	          if (true !== result) throw new Violation(this, value, { result: result });
	          return true;
	        };
	        return this;
	      },
	      Choice: function Choice(list) {
	        this.__class__ = 'Choice';
	        if (!_isArray(list) && 'function' !== typeof list) throw new Error('Choice must be instanciated with an array or a function');
	        this.list = list;
	        this.validate = function (value) {
	          var list = 'function' === typeof this.list ? this.list() : this.list;
	          for (var i = 0; i < list.length; i++) if (value === list[i]) return true;
	          throw new Violation(this, value, { choices: list });
	        };
	        return this;
	      },
	      Collection: function Collection(assertOrConstraint) {
	        this.__class__ = 'Collection';
	        this.constraint = 'undefined' !== typeof assertOrConstraint ? assertOrConstraint instanceof Assert ? assertOrConstraint : new Constraint(assertOrConstraint) : false;
	        this.validate = function (collection, group) {
	          var result,
	              validator = new Validator(),
	              count = 0,
	              failures = {},
	              groups = this.groups.length ? this.groups : group;
	          if (!_isArray(collection)) throw new Violation(this, collection, { value: Validator.errorCode.must_be_an_array });
	          for (var i = 0; i < collection.length; i++) {
	            result = this.constraint ? validator.validate(collection[i], this.constraint, groups) : validator.validate(collection[i], groups);
	            if (!_isEmptyObject(result)) failures[count] = result;
	            count++;
	          }
	          return !_isEmptyObject(failures) ? failures : true;
	        };
	        return this;
	      },
	      Count: function Count(count) {
	        this.__class__ = 'Count';
	        this.count = count;
	        this.validate = function (array) {
	          if (!_isArray(array)) throw new Violation(this, array, { value: Validator.errorCode.must_be_an_array });
	          var count = 'function' === typeof this.count ? this.count(array) : this.count;
	          if (isNaN(Number(count))) throw new Error('Count must be a valid interger', count);
	          if (count !== array.length) throw new Violation(this, array, { count: count });
	          return true;
	        };
	        return this;
	      },
	      Email: function Email() {
	        this.__class__ = 'Email';
	        this.validate = function (value) {
	          var regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if (!regExp.test(value)) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      EqualTo: function EqualTo(reference) {
	        this.__class__ = 'EqualTo';
	        if ('undefined' === typeof reference) throw new Error('EqualTo must be instanciated with a value or a function');
	        this.reference = reference;
	        this.validate = function (value) {
	          var reference = 'function' === typeof this.reference ? this.reference(value) : this.reference;
	          if (reference !== value) throw new Violation(this, value, { value: reference });
	          return true;
	        };
	        return this;
	      },
	      GreaterThan: function GreaterThan(threshold) {
	        this.__class__ = 'GreaterThan';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold >= value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      GreaterThanOrEqual: function GreaterThanOrEqual(threshold) {
	        this.__class__ = 'GreaterThanOrEqual';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold > value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      InstanceOf: function InstanceOf(classRef) {
	        this.__class__ = 'InstanceOf';
	        if ('undefined' === typeof classRef) throw new Error('InstanceOf must be instanciated with a value');
	        this.classRef = classRef;
	        this.validate = function (value) {
	          if (true !== value instanceof this.classRef) throw new Violation(this, value, { classRef: this.classRef });
	          return true;
	        };
	        return this;
	      },
	      Length: function Length(boundaries) {
	        this.__class__ = 'Length';
	        if (!boundaries.min && !boundaries.max) throw new Error('Lenth assert must be instanciated with a { min: x, max: y } object');
	        this.min = boundaries.min;
	        this.max = boundaries.max;
	        this.validate = function (value) {
	          if ('string' !== typeof value && !_isArray(value)) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string_or_array });
	          if ('undefined' !== typeof this.min && this.min === this.max && value.length !== this.min) throw new Violation(this, value, { min: this.min, max: this.max });
	          if ('undefined' !== typeof this.max && value.length > this.max) throw new Violation(this, value, { max: this.max });
	          if ('undefined' !== typeof this.min && value.length < this.min) throw new Violation(this, value, { min: this.min });
	          return true;
	        };
	        return this;
	      },
	      LessThan: function LessThan(threshold) {
	        this.__class__ = 'LessThan';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold <= value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      LessThanOrEqual: function LessThanOrEqual(threshold) {
	        this.__class__ = 'LessThanOrEqual';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold < value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      NotNull: function NotNull() {
	        this.__class__ = 'NotNull';
	        this.validate = function (value) {
	          if (null === value || 'undefined' === typeof value) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      NotBlank: function NotBlank() {
	        this.__class__ = 'NotBlank';
	        this.validate = function (value) {
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if ('' === value.replace(/^\s+/g, '').replace(/\s+$/g, '')) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      Null: function Null() {
	        this.__class__ = 'Null';
	        this.validate = function (value) {
	          if (null !== value) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      Range: function Range(min, max) {
	        this.__class__ = 'Range';
	        if ('undefined' === typeof min || 'undefined' === typeof max) throw new Error('Range assert expects min and max values');
	        this.min = min;
	        this.max = max;
	        this.validate = function (value) {
	          try {
	            // validate strings and objects with their Length
	            if ('string' === typeof value && isNaN(Number(value)) || _isArray(value)) new Assert().Length({ min: this.min, max: this.max }).validate(value);
	            // validate numbers with their value
	            else new Assert().GreaterThanOrEqual(this.min).validate(value) && new Assert().LessThanOrEqual(this.max).validate(value);
	            return true;
	          } catch (violation) {
	            throw new Violation(this, value, violation.violation);
	          }
	          return true;
	        };
	        return this;
	      },
	      Regexp: function Regexp(regexp, flag) {
	        this.__class__ = 'Regexp';
	        if ('undefined' === typeof regexp) throw new Error('You must give a regexp');
	        this.regexp = regexp;
	        this.flag = flag || '';
	        this.validate = function (value) {
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if (!new RegExp(this.regexp, this.flag).test(value)) throw new Violation(this, value, { regexp: this.regexp, flag: this.flag });
	          return true;
	        };
	        return this;
	      },
	      Required: function Required() {
	        this.__class__ = 'Required';
	        this.validate = function (value) {
	          if ('undefined' === typeof value) throw new Violation(this, value);
	          try {
	            if ('string' === typeof value) new Assert().NotNull().validate(value) && new Assert().NotBlank().validate(value);else if (true === _isArray(value)) new Assert().Length({ min: 1 }).validate(value);
	          } catch (violation) {
	            throw new Violation(this, value);
	          }
	          return true;
	        };
	        return this;
	      },
	      // Unique() or Unique ( { key: foo } )
	      Unique: function Unique(object) {
	        this.__class__ = 'Unique';
	        if ('object' === typeof object) this.key = object.key;
	        this.validate = function (array) {
	          var value,
	              store = [];
	          if (!_isArray(array)) throw new Violation(this, array, { value: Validator.errorCode.must_be_an_array });
	          for (var i = 0; i < array.length; i++) {
	            value = 'object' === typeof array[i] ? array[i][this.key] : array[i];
	            if ('undefined' === typeof value) continue;
	            if (-1 !== store.indexOf(value)) throw new Violation(this, array, { value: value });
	            store.push(value);
	          }
	          return true;
	        };
	        return this;
	      }
	    };
	    // expose to the world these awesome classes
	    exports.Assert = Assert;
	    exports.Validator = Validator;
	    exports.Violation = Violation;
	    exports.Constraint = Constraint;
	    /**
	    * Some useful object prototypes / functions here
	    */
	    // IE8<= compatibility
	    // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
	    if (!Array.prototype.indexOf) Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
	
	      if (this === null) {
	        throw new TypeError();
	      }
	      var t = Object(this);
	      var len = t.length >>> 0;
	      if (len === 0) {
	        return -1;
	      }
	      var n = 0;
	      if (arguments.length > 1) {
	        n = Number(arguments[1]);
	        if (n != n) {
	          // shortcut for verifying if it's NaN
	          n = 0;
	        } else if (n !== 0 && n != Infinity && n != -Infinity) {
	          n = (n > 0 || -1) * Math.floor(Math.abs(n));
	        }
	      }
	      if (n >= len) {
	        return -1;
	      }
	      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
	      for (; k < len; k++) {
	        if (k in t && t[k] === searchElement) {
	          return k;
	        }
	      }
	      return -1;
	    };
	    // Test if object is empty, useful for Constraint violations check
	    var _isEmptyObject = function _isEmptyObject(obj) {
	      for (var property in obj) return false;
	      return true;
	    };
	    var _isArray = function _isArray(obj) {
	      return Object.prototype.toString.call(obj) === '[object Array]';
	    };
	    // AMD export
	    if (true) {
	      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return exports;
	      }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	      // commonjs export
	    } else if (typeof module !== 'undefined' && module.exports) {
	        module.exports = exports;
	        // browser
	      } else {
	          window['undefined' !== typeof validatorjs_ns ? validatorjs_ns : 'Validator'] = exports;
	        }
	
	    return exports;
	  })();
	
	  // This is needed for Browserify usage that requires Validator.js through module.exports
	  Validator = 'undefined' !== typeof Validator ? Validator :  true ? module.exports : null;
	  var ParsleyValidator = function ParsleyValidator(validators, catalog) {
	    this.__class__ = 'ParsleyValidator';
	    this.Validator = Validator;
	    // Default Parsley locale is en
	    this.locale = 'en';
	    this.init(validators || {}, catalog || {});
	  };
	  ParsleyValidator.prototype = {
	    init: function init(validators, catalog) {
	      this.catalog = catalog;
	      for (var name in validators) this.addValidator(name, validators[name].fn, validators[name].priority, validators[name].requirementsTransformer);
	      $.emit('parsley:validator:init');
	    },
	    // Set new messages locale if we have dictionary loaded in ParsleyConfig.i18n
	    setLocale: function setLocale(locale) {
	      if ('undefined' === typeof this.catalog[locale]) throw new Error(locale + ' is not available in the catalog');
	      this.locale = locale;
	      return this;
	    },
	    // Add a new messages catalog for a given locale. Set locale for this catalog if set === `true`
	    addCatalog: function addCatalog(locale, messages, set) {
	      if ('object' === typeof messages) this.catalog[locale] = messages;
	      if (true === set) return this.setLocale(locale);
	      return this;
	    },
	    // Add a specific message for a given constraint in a given locale
	    addMessage: function addMessage(locale, name, message) {
	      if ('undefined' === typeof this.catalog[locale]) this.catalog[locale] = {};
	      this.catalog[locale][name.toLowerCase()] = message;
	      return this;
	    },
	    validate: function validate(value, constraints, priority) {
	      return new this.Validator.Validator().validate.apply(new Validator.Validator(), arguments);
	    },
	    // Add a new validator
	    addValidator: function addValidator(name, fn, priority, requirementsTransformer) {
	      this.validators[name.toLowerCase()] = function (requirements) {
	        return $.extend(new Validator.Assert().Callback(fn, requirements), {
	          priority: priority,
	          requirementsTransformer: requirementsTransformer
	        });
	      };
	      return this;
	    },
	    updateValidator: function updateValidator(name, fn, priority, requirementsTransformer) {
	      return this.addValidator(name, fn, priority, requirementsTransformer);
	    },
	    removeValidator: function removeValidator(name) {
	      delete this.validators[name];
	      return this;
	    },
	    getErrorMessage: function getErrorMessage(constraint) {
	      var message;
	      // Type constraints are a bit different, we have to match their requirements too to find right error message
	      if ('type' === constraint.name) message = this.catalog[this.locale][constraint.name][constraint.requirements];else message = this.formatMessage(this.catalog[this.locale][constraint.name], constraint.requirements);
	      return '' !== message ? message : this.catalog[this.locale].defaultMessage;
	    },
	    // Kind of light `sprintf()` implementation
	    formatMessage: function formatMessage(string, parameters) {
	      if ('object' === typeof parameters) {
	        for (var i in parameters) string = this.formatMessage(string, parameters[i]);
	        return string;
	      }
	      return 'string' === typeof string ? string.replace(new RegExp('%s', 'i'), parameters) : '';
	    },
	    // Here is the Parsley default validators list.
	    // This is basically Validatorjs validators, with different API for some of them
	    // and a Parsley priority set
	    validators: {
	      notblank: function notblank() {
	        return $.extend(new Validator.Assert().NotBlank(), { priority: 2 });
	      },
	      required: function required() {
	        return $.extend(new Validator.Assert().Required(), { priority: 512 });
	      },
	      type: function type(_type) {
	        var assert;
	        switch (_type) {
	          case 'email':
	            assert = new Validator.Assert().Email();
	            break;
	          // range type just ensure we have a number here
	          case 'range':
	          case 'number':
	            assert = new Validator.Assert().Regexp('^-?(?:\\d+|\\d{1,3}(?:,\\d{3})+)?(?:\\.\\d+)?$');
	            break;
	          case 'integer':
	            assert = new Validator.Assert().Regexp('^-?\\d+$');
	            break;
	          case 'digits':
	            assert = new Validator.Assert().Regexp('^\\d+$');
	            break;
	          case 'alphanum':
	            assert = new Validator.Assert().Regexp('^\\w+$', 'i');
	            break;
	          case 'url':
	            assert = new Validator.Assert().Regexp('(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,24}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)', 'i');
	            break;
	          default:
	            throw new Error('validator type `' + _type + '` is not supported');
	        }
	        return $.extend(assert, { priority: 256 });
	      },
	      pattern: function pattern(regexp) {
	        var flags = '';
	        // Test if RegExp is literal, if not, nothing to be done, otherwise, we need to isolate flags and pattern
	        if (!!/^\/.*\/(?:[gimy]*)$/.test(regexp)) {
	          // Replace the regexp literal string with the first match group: ([gimy]*)
	          // If no flag is present, this will be a blank string
	          flags = regexp.replace(/.*\/([gimy]*)$/, '$1');
	          // Again, replace the regexp literal string with the first match group:
	          // everything excluding the opening and closing slashes and the flags
	          regexp = regexp.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
	        }
	        return $.extend(new Validator.Assert().Regexp(regexp, flags), { priority: 64 });
	      },
	      minlength: function minlength(value) {
	        return $.extend(new Validator.Assert().Length({ min: value }), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      maxlength: function maxlength(value) {
	        return $.extend(new Validator.Assert().Length({ max: value }), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      length: function length(array) {
	        return $.extend(new Validator.Assert().Length({ min: array[0], max: array[1] }), { priority: 32 });
	      },
	      mincheck: function mincheck(length) {
	        return this.minlength(length);
	      },
	      maxcheck: function maxcheck(length) {
	        return this.maxlength(length);
	      },
	      check: function check(array) {
	        return this.length(array);
	      },
	      min: function min(value) {
	        return $.extend(new Validator.Assert().GreaterThanOrEqual(value), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      max: function max(value) {
	        return $.extend(new Validator.Assert().LessThanOrEqual(value), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      range: function range(array) {
	        return $.extend(new Validator.Assert().Range(array[0], array[1]), {
	          priority: 32,
	          requirementsTransformer: function requirementsTransformer() {
	            for (var i = 0; i < array.length; i++) array[i] = 'string' === typeof array[i] && !isNaN(array[i]) ? parseInt(array[i], 10) : array[i];
	            return array;
	          }
	        });
	      },
	      equalto: function equalto(value) {
	        return $.extend(new Validator.Assert().EqualTo(value), {
	          priority: 256,
	          requirementsTransformer: function requirementsTransformer() {
	            return $(value).length ? $(value).val() : value;
	          }
	        });
	      }
	    }
	  };
	
	  var ParsleyUI = function ParsleyUI(options) {
	    this.__class__ = 'ParsleyUI';
	  };
	  ParsleyUI.prototype = {
	    listen: function listen() {
	      $.listen('parsley:form:init', this, this.setupForm);
	      $.listen('parsley:field:init', this, this.setupField);
	      $.listen('parsley:field:validated', this, this.reflow);
	      $.listen('parsley:form:validated', this, this.focus);
	      $.listen('parsley:field:reset', this, this.reset);
	      $.listen('parsley:form:destroy', this, this.destroy);
	      $.listen('parsley:field:destroy', this, this.destroy);
	      return this;
	    },
	    reflow: function reflow(fieldInstance) {
	      // If this field has not an active UI (case for multiples) don't bother doing something
	      if ('undefined' === typeof fieldInstance._ui || false === fieldInstance._ui.active) return;
	      // Diff between two validation results
	      var diff = this._diff(fieldInstance.validationResult, fieldInstance._ui.lastValidationResult);
	      // Then store current validation result for next reflow
	      fieldInstance._ui.lastValidationResult = fieldInstance.validationResult;
	      // Field have been validated at least once if here. Useful for binded key events...
	      fieldInstance._ui.validatedOnce = true;
	      // Handle valid / invalid / none field class
	      this.manageStatusClass(fieldInstance);
	      // Add, remove, updated errors messages
	      this.manageErrorsMessages(fieldInstance, diff);
	      // Triggers impl
	      this.actualizeTriggers(fieldInstance);
	      // If field is not valid for the first time, bind keyup trigger to ease UX and quickly inform user
	      if ((diff.kept.length || diff.added.length) && 'undefined' === typeof fieldInstance._ui.failedOnce) this.manageFailingFieldTrigger(fieldInstance);
	    },
	    // Returns an array of field's error message(s)
	    getErrorsMessages: function getErrorsMessages(fieldInstance) {
	      // No error message, field is valid
	      if (true === fieldInstance.validationResult) return [];
	      var messages = [];
	      for (var i = 0; i < fieldInstance.validationResult.length; i++) messages.push(this._getErrorMessage(fieldInstance, fieldInstance.validationResult[i].assert));
	      return messages;
	    },
	    manageStatusClass: function manageStatusClass(fieldInstance) {
	      if (true === fieldInstance.validationResult) this._successClass(fieldInstance);else if (fieldInstance.validationResult.length > 0) this._errorClass(fieldInstance);else this._resetClass(fieldInstance);
	    },
	    manageErrorsMessages: function manageErrorsMessages(fieldInstance, diff) {
	      if ('undefined' !== typeof fieldInstance.options.errorsMessagesDisabled) return;
	      // Case where we have errorMessage option that configure an unique field error message, regardless failing validators
	      if ('undefined' !== typeof fieldInstance.options.errorMessage) {
	        if (diff.added.length || diff.kept.length) {
	          if (0 === fieldInstance._ui.$errorsWrapper.find('.parsley-custom-error-message').length) fieldInstance._ui.$errorsWrapper.append($(fieldInstance.options.errorTemplate).addClass('parsley-custom-error-message'));
	          return fieldInstance._ui.$errorsWrapper.addClass('filled').find('.parsley-custom-error-message').html(fieldInstance.options.errorMessage);
	        }
	        return fieldInstance._ui.$errorsWrapper.removeClass('filled').find('.parsley-custom-error-message').remove();
	      }
	      // Show, hide, update failing constraints messages
	      for (var i = 0; i < diff.removed.length; i++) this.removeError(fieldInstance, diff.removed[i].assert.name, true);
	      for (i = 0; i < diff.added.length; i++) this.addError(fieldInstance, diff.added[i].assert.name, undefined, diff.added[i].assert, true);
	      for (i = 0; i < diff.kept.length; i++) this.updateError(fieldInstance, diff.kept[i].assert.name, undefined, diff.kept[i].assert, true);
	    },
	    // TODO: strange API here, intuitive for manual usage with addError(pslyInstance, 'foo', 'bar')
	    // but a little bit complex for above internal usage, with forced undefined parameter...
	    addError: function addError(fieldInstance, name, message, assert, doNotUpdateClass) {
	      fieldInstance._ui.$errorsWrapper.addClass('filled').append($(fieldInstance.options.errorTemplate).addClass('parsley-' + name).html(message || this._getErrorMessage(fieldInstance, assert)));
	      if (true !== doNotUpdateClass) this._errorClass(fieldInstance);
	    },
	    // Same as above
	    updateError: function updateError(fieldInstance, name, message, assert, doNotUpdateClass) {
	      fieldInstance._ui.$errorsWrapper.addClass('filled').find('.parsley-' + name).html(message || this._getErrorMessage(fieldInstance, assert));
	      if (true !== doNotUpdateClass) this._errorClass(fieldInstance);
	    },
	    // Same as above twice
	    removeError: function removeError(fieldInstance, name, doNotUpdateClass) {
	      fieldInstance._ui.$errorsWrapper.removeClass('filled').find('.parsley-' + name).remove();
	      // edge case possible here: remove a standard Parsley error that is still failing in fieldInstance.validationResult
	      // but highly improbable cuz' manually removing a well Parsley handled error makes no sense.
	      if (true !== doNotUpdateClass) this.manageStatusClass(fieldInstance);
	    },
	    focus: function focus(formInstance) {
	      if (true === formInstance.validationResult || 'none' === formInstance.options.focus) return formInstance._focusedField = null;
	      formInstance._focusedField = null;
	      for (var i = 0; i < formInstance.fields.length; i++) if (true !== formInstance.fields[i].validationResult && formInstance.fields[i].validationResult.length > 0 && 'undefined' === typeof formInstance.fields[i].options.noFocus) {
	        if ('first' === formInstance.options.focus) {
	          formInstance._focusedField = formInstance.fields[i].$element;
	          return formInstance._focusedField.focus();
	        }
	        formInstance._focusedField = formInstance.fields[i].$element;
	      }
	      if (null === formInstance._focusedField) return null;
	      return formInstance._focusedField.focus();
	    },
	    _getErrorMessage: function _getErrorMessage(fieldInstance, constraint) {
	      var customConstraintErrorMessage = constraint.name + 'Message';
	      if ('undefined' !== typeof fieldInstance.options[customConstraintErrorMessage]) return window.ParsleyValidator.formatMessage(fieldInstance.options[customConstraintErrorMessage], constraint.requirements);
	      return window.ParsleyValidator.getErrorMessage(constraint);
	    },
	    _diff: function _diff(newResult, oldResult, deep) {
	      var added = [],
	          kept = [];
	      for (var i = 0; i < newResult.length; i++) {
	        var found = false;
	        for (var j = 0; j < oldResult.length; j++) if (newResult[i].assert.name === oldResult[j].assert.name) {
	          found = true;
	          break;
	        }
	        if (found) kept.push(newResult[i]);else added.push(newResult[i]);
	      }
	      return {
	        kept: kept,
	        added: added,
	        removed: !deep ? this._diff(oldResult, newResult, true).added : []
	      };
	    },
	    setupForm: function setupForm(formInstance) {
	      formInstance.$element.on('submit.Parsley', false, $.proxy(formInstance.onSubmitValidate, formInstance));
	      // UI could be disabled
	      if (false === formInstance.options.uiEnabled) return;
	      formInstance.$element.attr('novalidate', '');
	    },
	    setupField: function setupField(fieldInstance) {
	      var _ui = { active: false };
	      // UI could be disabled
	      if (false === fieldInstance.options.uiEnabled) return;
	      _ui.active = true;
	      // Give field its Parsley id in DOM
	      fieldInstance.$element.attr(fieldInstance.options.namespace + 'id', fieldInstance.__id__);
	      /** Generate important UI elements and store them in fieldInstance **/
	      // $errorClassHandler is the $element that woul have parsley-error and parsley-success classes
	      _ui.$errorClassHandler = this._manageClassHandler(fieldInstance);
	      // $errorsWrapper is a div that would contain the various field errors, it will be appended into $errorsContainer
	      _ui.errorsWrapperId = 'parsley-id-' + ('undefined' !== typeof fieldInstance.options.multiple ? 'multiple-' + fieldInstance.options.multiple : fieldInstance.__id__);
	      _ui.$errorsWrapper = $(fieldInstance.options.errorsWrapper).attr('id', _ui.errorsWrapperId);
	      // ValidationResult UI storage to detect what have changed bwt two validations, and update DOM accordingly
	      _ui.lastValidationResult = [];
	      _ui.validatedOnce = false;
	      _ui.validationInformationVisible = false;
	      // Store it in fieldInstance for later
	      fieldInstance._ui = _ui;
	      // Stops excluded inputs from getting errorContainer added
	      if (!fieldInstance.$element.is(fieldInstance.options.excluded)) {
	        /** Mess with DOM now **/
	        this._insertErrorWrapper(fieldInstance);
	      }
	      // Bind triggers first time
	      this.actualizeTriggers(fieldInstance);
	    },
	    // Determine which element will have `parsley-error` and `parsley-success` classes
	    _manageClassHandler: function _manageClassHandler(fieldInstance) {
	      // An element selector could be passed through DOM with `data-parsley-class-handler=#foo`
	      if ('string' === typeof fieldInstance.options.classHandler && $(fieldInstance.options.classHandler).length) return $(fieldInstance.options.classHandler);
	      // Class handled could also be determined by function given in Parsley options
	      var $handler = fieldInstance.options.classHandler(fieldInstance);
	      // If this function returned a valid existing DOM element, go for it
	      if ('undefined' !== typeof $handler && $handler.length) return $handler;
	      // Otherwise, if simple element (input, texatrea, select...) it will perfectly host the classes
	      if ('undefined' === typeof fieldInstance.options.multiple || fieldInstance.$element.is('select')) return fieldInstance.$element;
	      // But if multiple element (radio, checkbox), that would be their parent
	      return fieldInstance.$element.parent();
	    },
	    _insertErrorWrapper: function _insertErrorWrapper(fieldInstance) {
	      var $errorsContainer;
	      if ('string' === typeof fieldInstance.options.errorsContainer) {
	        if ($(fieldInstance.options.errorsContainer).length) return $(fieldInstance.options.errorsContainer).append(fieldInstance._ui.$errorsWrapper);else if (window.console && window.console.warn) window.console.warn('The errors container `' + fieldInstance.options.errorsContainer + '` does not exist in DOM');
	      } else if ('function' === typeof fieldInstance.options.errorsContainer) $errorsContainer = fieldInstance.options.errorsContainer(fieldInstance);
	      if ('undefined' !== typeof $errorsContainer && $errorsContainer.length) return $errorsContainer.append(fieldInstance._ui.$errorsWrapper);
	      return 'undefined' === typeof fieldInstance.options.multiple ? fieldInstance.$element.after(fieldInstance._ui.$errorsWrapper) : fieldInstance.$element.parent().after(fieldInstance._ui.$errorsWrapper);
	    },
	    actualizeTriggers: function actualizeTriggers(fieldInstance) {
	      var $toBind = fieldInstance.$element;
	      if (fieldInstance.options.multiple) $toBind = $('[' + fieldInstance.options.namespace + 'multiple="' + fieldInstance.options.multiple + '"]');
	      // Remove Parsley events already binded on this field
	      $toBind.off('.Parsley');
	      // If no trigger is set, all good
	      if (false === fieldInstance.options.trigger) return;
	      var triggers = fieldInstance.options.trigger.replace(/^\s+/g, '').replace(/\s+$/g, '');
	      if ('' === triggers) return;
	      // Bind fieldInstance.eventValidate if exists (for parsley.ajax for example), ParsleyUI.eventValidate otherwise
	      $toBind.on(triggers.split(' ').join('.Parsley ') + '.Parsley', $.proxy('function' === typeof fieldInstance.eventValidate ? fieldInstance.eventValidate : this.eventValidate, fieldInstance));
	    },
	    // Called through $.proxy with fieldInstance. `this` context is ParsleyField
	    eventValidate: function eventValidate(event) {
	      // For keyup, keypress, keydown... events that could be a little bit obstrusive
	      // do not validate if val length < min threshold on first validation. Once field have been validated once and info
	      // about success or failure have been displayed, always validate with this trigger to reflect every yalidation change.
	      if (new RegExp('key').test(event.type)) if (!this._ui.validationInformationVisible && this.getValue().length <= this.options.validationThreshold) return;
	      this._ui.validatedOnce = true;
	      this.validate();
	    },
	    manageFailingFieldTrigger: function manageFailingFieldTrigger(fieldInstance) {
	      fieldInstance._ui.failedOnce = true;
	      // Radio and checkboxes fields must bind every field multiple
	      if (fieldInstance.options.multiple) $('[' + fieldInstance.options.namespace + 'multiple="' + fieldInstance.options.multiple + '"]').each(function () {
	        if (!new RegExp('change', 'i').test($(this).parsley().options.trigger || '')) return $(this).on('change.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
	      });
	      // Select case
	      if (fieldInstance.$element.is('select')) if (!new RegExp('change', 'i').test(fieldInstance.options.trigger || '')) return fieldInstance.$element.on('change.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
	      // All other inputs fields
	      if (!new RegExp('keyup', 'i').test(fieldInstance.options.trigger || '')) return fieldInstance.$element.on('keyup.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
	    },
	    reset: function reset(parsleyInstance) {
	      // Reset all event listeners
	      parsleyInstance.$element.off('.Parsley');
	      parsleyInstance.$element.off('.ParsleyFailedOnce');
	      // Nothing to do if UI never initialized for this field
	      if ('undefined' === typeof parsleyInstance._ui) return;
	      if ('ParsleyForm' === parsleyInstance.__class__) return;
	      // Reset all errors' li
	      parsleyInstance._ui.$errorsWrapper.removeClass('filled').children().remove();
	      // Reset validation class
	      this._resetClass(parsleyInstance);
	      // Reset validation flags and last validation result
	      parsleyInstance._ui.validatedOnce = false;
	      parsleyInstance._ui.lastValidationResult = [];
	      parsleyInstance._ui.validationInformationVisible = false;
	    },
	    destroy: function destroy(parsleyInstance) {
	      this.reset(parsleyInstance);
	      if ('ParsleyForm' === parsleyInstance.__class__) return;
	      if ('undefined' !== typeof parsleyInstance._ui) parsleyInstance._ui.$errorsWrapper.remove();
	      delete parsleyInstance._ui;
	    },
	    _successClass: function _successClass(fieldInstance) {
	      fieldInstance._ui.validationInformationVisible = true;
	      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.errorClass).addClass(fieldInstance.options.successClass);
	    },
	    _errorClass: function _errorClass(fieldInstance) {
	      fieldInstance._ui.validationInformationVisible = true;
	      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).addClass(fieldInstance.options.errorClass);
	    },
	    _resetClass: function _resetClass(fieldInstance) {
	      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).removeClass(fieldInstance.options.errorClass);
	    }
	  };
	
	  var ParsleyOptionsFactory = function ParsleyOptionsFactory(defaultOptions, globalOptions, userOptions, namespace) {
	    this.__class__ = 'OptionsFactory';
	    this.__id__ = ParsleyUtils.hash(4);
	    this.formOptions = null;
	    this.fieldOptions = null;
	    this.staticOptions = $.extend(true, {}, defaultOptions, globalOptions, userOptions, { namespace: namespace });
	  };
	  ParsleyOptionsFactory.prototype = {
	    get: function get(parsleyInstance) {
	      if ('undefined' === typeof parsleyInstance.__class__) throw new Error('Parsley Instance expected');
	      switch (parsleyInstance.__class__) {
	        case 'Parsley':
	          return this.staticOptions;
	        case 'ParsleyForm':
	          return this.getFormOptions(parsleyInstance);
	        case 'ParsleyField':
	        case 'ParsleyFieldMultiple':
	          return this.getFieldOptions(parsleyInstance);
	        default:
	          throw new Error('Instance ' + parsleyInstance.__class__ + ' is not supported');
	      }
	    },
	    getFormOptions: function getFormOptions(formInstance) {
	      this.formOptions = ParsleyUtils.attr(formInstance.$element, this.staticOptions.namespace);
	      // not deep extend, since formOptions is a 1 level deep object
	      return $.extend({}, this.staticOptions, this.formOptions);
	    },
	    getFieldOptions: function getFieldOptions(fieldInstance) {
	      this.fieldOptions = ParsleyUtils.attr(fieldInstance.$element, this.staticOptions.namespace);
	      if (null === this.formOptions && 'undefined' !== typeof fieldInstance.parent) this.formOptions = this.getFormOptions(fieldInstance.parent);
	      // not deep extend, since formOptions and fieldOptions is a 1 level deep object
	      return $.extend({}, this.staticOptions, this.formOptions, this.fieldOptions);
	    }
	  };
	
	  var ParsleyForm = function ParsleyForm(element, OptionsFactory) {
	    this.__class__ = 'ParsleyForm';
	    this.__id__ = ParsleyUtils.hash(4);
	    if ('OptionsFactory' !== ParsleyUtils.get(OptionsFactory, '__class__')) throw new Error('You must give an OptionsFactory instance');
	    this.OptionsFactory = OptionsFactory;
	    this.$element = $(element);
	    this.validationResult = null;
	    this.options = this.OptionsFactory.get(this);
	  };
	  ParsleyForm.prototype = {
	    onSubmitValidate: function onSubmitValidate(event) {
	      this.validate(undefined, undefined, event);
	      // prevent form submission if validation fails
	      if (false === this.validationResult && event instanceof $.Event) {
	        event.stopImmediatePropagation();
	        event.preventDefault();
	      }
	      return this;
	    },
	    // @returns boolean
	    validate: function validate(group, force, event) {
	      this.submitEvent = event;
	      this.validationResult = true;
	      var fieldValidationResult = [];
	      $.emit('parsley:form:validate', this);
	      // Refresh form DOM options and form's fields that could have changed
	      this._refreshFields();
	      // loop through fields to validate them one by one
	      for (var i = 0; i < this.fields.length; i++) {
	        // do not validate a field if not the same as given validation group
	        if (group && !this._isFieldInGroup(this.fields[i], group)) continue;
	        fieldValidationResult = this.fields[i].validate(force);
	        if (true !== fieldValidationResult && fieldValidationResult.length > 0 && this.validationResult) this.validationResult = false;
	      }
	      $.emit('parsley:form:' + (this.validationResult ? 'success' : 'error'), this);
	      $.emit('parsley:form:validated', this);
	      return this.validationResult;
	    },
	    // Iterate over refreshed fields, and stop on first failure
	    isValid: function isValid(group, force) {
	      this._refreshFields();
	      for (var i = 0; i < this.fields.length; i++) {
	        // do not validate a field if not the same as given validation group
	        if (group && !this._isFieldInGroup(this.fields[i], group)) continue;
	        if (false === this.fields[i].isValid(force)) return false;
	      }
	      return true;
	    },
	    _isFieldInGroup: function _isFieldInGroup(field, group) {
	      if (ParsleyUtils.isArray(field.options.group)) return -1 !== $.inArray(group, field.options.group);
	      return field.options.group === group;
	    },
	    _refreshFields: function _refreshFields() {
	      return this.actualizeOptions()._bindFields();
	    },
	    _bindFields: function _bindFields() {
	      var self = this;
	      this.fields = [];
	      this.fieldsMappedById = {};
	      this.$element.find(this.options.inputs).each(function () {
	        var fieldInstance = new window.Parsley(this, {}, self);
	        // Only add valid and not excluded `ParsleyField` and `ParsleyFieldMultiple` children
	        if (('ParsleyField' === fieldInstance.__class__ || 'ParsleyFieldMultiple' === fieldInstance.__class__) && !fieldInstance.$element.is(fieldInstance.options.excluded)) if ('undefined' === typeof self.fieldsMappedById[fieldInstance.__class__ + '-' + fieldInstance.__id__]) {
	          self.fieldsMappedById[fieldInstance.__class__ + '-' + fieldInstance.__id__] = fieldInstance;
	          self.fields.push(fieldInstance);
	        }
	      });
	      return this;
	    }
	  };
	
	  var ConstraintFactory = function ConstraintFactory(parsleyField, name, requirements, priority, isDomConstraint) {
	    var assert = {};
	    if (!new RegExp('ParsleyField').test(ParsleyUtils.get(parsleyField, '__class__'))) throw new Error('ParsleyField or ParsleyFieldMultiple instance expected');
	    if ('function' === typeof window.ParsleyValidator.validators[name]) assert = window.ParsleyValidator.validators[name](requirements);
	    if ('Assert' !== assert.__parentClass__) throw new Error('Valid validator expected');
	    var getPriority = function getPriority() {
	      if ('undefined' !== typeof parsleyField.options[name + 'Priority']) return parsleyField.options[name + 'Priority'];
	      return ParsleyUtils.get(assert, 'priority') || 2;
	    };
	    priority = priority || getPriority();
	    // If validator have a requirementsTransformer, execute it
	    if ('function' === typeof assert.requirementsTransformer) {
	      requirements = assert.requirementsTransformer();
	      // rebuild assert with new requirements
	      assert = window.ParsleyValidator.validators[name](requirements);
	    }
	    return $.extend(assert, {
	      name: name,
	      requirements: requirements,
	      priority: priority,
	      groups: [priority],
	      isDomConstraint: isDomConstraint || ParsleyUtils.attr(parsleyField.$element, parsleyField.options.namespace, name)
	    });
	  };
	
	  var ParsleyField = function ParsleyField(field, OptionsFactory, parsleyFormInstance) {
	    this.__class__ = 'ParsleyField';
	    this.__id__ = ParsleyUtils.hash(4);
	    this.$element = $(field);
	    // If we have a parent `ParsleyForm` instance given, use its `OptionsFactory`, and save parent
	    if ('undefined' !== typeof parsleyFormInstance) {
	      this.parent = parsleyFormInstance;
	      this.OptionsFactory = this.parent.OptionsFactory;
	      this.options = this.OptionsFactory.get(this);
	      // Else, take the `Parsley` one
	    } else {
	        this.OptionsFactory = OptionsFactory;
	        this.options = this.OptionsFactory.get(this);
	      }
	    // Initialize some properties
	    this.constraints = [];
	    this.constraintsByName = {};
	    this.validationResult = [];
	    // Bind constraints
	    this._bindConstraints();
	  };
	  ParsleyField.prototype = {
	    // # Public API
	    // Validate field and $.emit some events for mainly `ParsleyUI`
	    // @returns validationResult:
	    //  - `true` if all constraints pass
	    //  - `[]` if not required field and empty (not validated)
	    //  - `[Violation, [Violation...]]` if there were validation errors
	    validate: function validate(force) {
	      this.value = this.getValue();
	      // Field Validate event. `this.value` could be altered for custom needs
	      $.emit('parsley:field:validate', this);
	      $.emit('parsley:field:' + (this.isValid(force, this.value) ? 'success' : 'error'), this);
	      // Field validated event. `this.validationResult` could be altered for custom needs too
	      $.emit('parsley:field:validated', this);
	      return this.validationResult;
	    },
	    // Just validate field. Do not trigger any event
	    // Same @return as `validate()`
	    isValid: function isValid(force, value) {
	      // Recompute options and rebind constraints to have latest changes
	      this.refreshConstraints();
	      // Sort priorities to validate more important first
	      var priorities = this._getConstraintsSortedPriorities();
	      if (0 === priorities.length) return this.validationResult = [];
	      // Value could be passed as argument, needed to add more power to 'parsley:field:validate'
	      if ('undefined' === typeof value || null === value) value = this.getValue();
	      // If a field is empty and not required, leave it alone, it's just fine
	      // Except if `data-parsley-validate-if-empty` explicitely added, useful for some custom validators
	      if (!value.length && !this._isRequired() && 'undefined' === typeof this.options.validateIfEmpty && true !== force) return this.validationResult = [];
	      // If we want to validate field against all constraints, just call Validator and let it do the job
	      if (false === this.options.priorityEnabled) return true === (this.validationResult = this.validateThroughValidator(value, this.constraints, 'Any'));
	      // Else, iterate over priorities one by one, and validate related asserts one by one
	      for (var i = 0; i < priorities.length; i++) if (true !== (this.validationResult = this.validateThroughValidator(value, this.constraints, priorities[i]))) return false;
	      return true;
	    },
	    // @returns Parsley field computed value that could be overrided or configured in DOM
	    getValue: function getValue() {
	      var value;
	      // Value could be overriden in DOM
	      if ('undefined' !== typeof this.options.value) value = this.options.value;else value = this.$element.val();
	      // Handle wrong DOM or configurations
	      if ('undefined' === typeof value || null === value) return '';
	      // Use `data-parsley-trim-value="true"` to auto trim inputs entry
	      if (true === this.options.trimValue) return value.replace(/^\s+|\s+$/g, '');
	      return value;
	    },
	    // Actualize options that could have change since previous validation
	    // Re-bind accordingly constraints (could be some new, removed or updated)
	    refreshConstraints: function refreshConstraints() {
	      return this.actualizeOptions()._bindConstraints();
	    },
	    /**
	    * Add a new constraint to a field
	    *
	    * @method addConstraint
	    * @param {String}   name
	    * @param {Mixed}    requirements      optional
	    * @param {Number}   priority          optional
	    * @param {Boolean}  isDomConstraint   optional
	    */
	    addConstraint: function addConstraint(name, requirements, priority, isDomConstraint) {
	      name = name.toLowerCase();
	      if ('function' === typeof window.ParsleyValidator.validators[name]) {
	        var constraint = new ConstraintFactory(this, name, requirements, priority, isDomConstraint);
	        // if constraint already exist, delete it and push new version
	        if ('undefined' !== this.constraintsByName[constraint.name]) this.removeConstraint(constraint.name);
	        this.constraints.push(constraint);
	        this.constraintsByName[constraint.name] = constraint;
	      }
	      return this;
	    },
	    // Remove a constraint
	    removeConstraint: function removeConstraint(name) {
	      for (var i = 0; i < this.constraints.length; i++) if (name === this.constraints[i].name) {
	        this.constraints.splice(i, 1);
	        break;
	      }
	      delete this.constraintsByName[name];
	      return this;
	    },
	    // Update a constraint (Remove + re-add)
	    updateConstraint: function updateConstraint(name, parameters, priority) {
	      return this.removeConstraint(name).addConstraint(name, parameters, priority);
	    },
	    // # Internals
	    // Internal only.
	    // Bind constraints from config + options + DOM
	    _bindConstraints: function _bindConstraints() {
	      var constraints = [],
	          constraintsByName = {};
	      // clean all existing DOM constraints to only keep javascript user constraints
	      for (var i = 0; i < this.constraints.length; i++) if (false === this.constraints[i].isDomConstraint) {
	        constraints.push(this.constraints[i]);
	        constraintsByName[this.constraints[i].name] = this.constraints[i];
	      }
	      this.constraints = constraints;
	      this.constraintsByName = constraintsByName;
	      // then re-add Parsley DOM-API constraints
	      for (var name in this.options) this.addConstraint(name, this.options[name]);
	      // finally, bind special HTML5 constraints
	      return this._bindHtml5Constraints();
	    },
	    // Internal only.
	    // Bind specific HTML5 constraints to be HTML5 compliant
	    _bindHtml5Constraints: function _bindHtml5Constraints() {
	      // html5 required
	      if (this.$element.hasClass('required') || this.$element.attr('required')) this.addConstraint('required', true, undefined, true);
	      // html5 pattern
	      if ('string' === typeof this.$element.attr('pattern')) this.addConstraint('pattern', this.$element.attr('pattern'), undefined, true);
	      // range
	      if ('undefined' !== typeof this.$element.attr('min') && 'undefined' !== typeof this.$element.attr('max')) this.addConstraint('range', [this.$element.attr('min'), this.$element.attr('max')], undefined, true);
	      // HTML5 min
	      else if ('undefined' !== typeof this.$element.attr('min')) this.addConstraint('min', this.$element.attr('min'), undefined, true);
	        // HTML5 max
	        else if ('undefined' !== typeof this.$element.attr('max')) this.addConstraint('max', this.$element.attr('max'), undefined, true);
	
	      // length
	      if ('undefined' !== typeof this.$element.attr('minlength') && 'undefined' !== typeof this.$element.attr('maxlength')) this.addConstraint('length', [this.$element.attr('minlength'), this.$element.attr('maxlength')], undefined, true);
	      // HTML5 minlength
	      else if ('undefined' !== typeof this.$element.attr('minlength')) this.addConstraint('minlength', this.$element.attr('minlength'), undefined, true);
	        // HTML5 maxlength
	        else if ('undefined' !== typeof this.$element.attr('maxlength')) this.addConstraint('maxlength', this.$element.attr('maxlength'), undefined, true);
	
	      // html5 types
	      var type = this.$element.attr('type');
	      if ('undefined' === typeof type) return this;
	      // Small special case here for HTML5 number: integer validator if step attribute is undefined or an integer value, number otherwise
	      if ('number' === type) {
	        if ('undefined' === typeof this.$element.attr('step') || 0 === parseFloat(this.$element.attr('step')) % 1) {
	          return this.addConstraint('type', 'integer', undefined, true);
	        } else {
	          return this.addConstraint('type', 'number', undefined, true);
	        }
	        // Regular other HTML5 supported types
	      } else if (new RegExp(type, 'i').test('email url range')) {
	          return this.addConstraint('type', type, undefined, true);
	        }
	      return this;
	    },
	    // Internal only.
	    // Field is required if have required constraint without `false` value
	    _isRequired: function _isRequired() {
	      if ('undefined' === typeof this.constraintsByName.required) return false;
	      return false !== this.constraintsByName.required.requirements;
	    },
	    // Internal only.
	    // Sort constraints by priority DESC
	    _getConstraintsSortedPriorities: function _getConstraintsSortedPriorities() {
	      var priorities = [];
	      // Create array unique of priorities
	      for (var i = 0; i < this.constraints.length; i++) if (-1 === priorities.indexOf(this.constraints[i].priority)) priorities.push(this.constraints[i].priority);
	      // Sort them by priority DESC
	      priorities.sort(function (a, b) {
	        return b - a;
	      });
	      return priorities;
	    }
	  };
	
	  var ParsleyMultiple = function ParsleyMultiple() {
	    this.__class__ = 'ParsleyFieldMultiple';
	  };
	  ParsleyMultiple.prototype = {
	    // Add new `$element` sibling for multiple field
	    addElement: function addElement($element) {
	      this.$elements.push($element);
	      return this;
	    },
	    // See `ParsleyField.refreshConstraints()`
	    refreshConstraints: function refreshConstraints() {
	      var fieldConstraints;
	      this.constraints = [];
	      // Select multiple special treatment
	      if (this.$element.is('select')) {
	        this.actualizeOptions()._bindConstraints();
	        return this;
	      }
	      // Gather all constraints for each input in the multiple group
	      for (var i = 0; i < this.$elements.length; i++) {
	        // Check if element have not been dynamically removed since last binding
	        if (!$('html').has(this.$elements[i]).length) {
	          this.$elements.splice(i, 1);
	          continue;
	        }
	        fieldConstraints = this.$elements[i].data('ParsleyFieldMultiple').refreshConstraints().constraints;
	        for (var j = 0; j < fieldConstraints.length; j++) this.addConstraint(fieldConstraints[j].name, fieldConstraints[j].requirements, fieldConstraints[j].priority, fieldConstraints[j].isDomConstraint);
	      }
	      return this;
	    },
	    // See `ParsleyField.getValue()`
	    getValue: function getValue() {
	      // Value could be overriden in DOM
	      if ('undefined' !== typeof this.options.value) return this.options.value;
	      // Radio input case
	      if (this.$element.is('input[type=radio]')) return $('[' + this.options.namespace + 'multiple="' + this.options.multiple + '"]:checked').val() || '';
	      // checkbox input case
	      if (this.$element.is('input[type=checkbox]')) {
	        var values = [];
	        $('[' + this.options.namespace + 'multiple="' + this.options.multiple + '"]:checked').each(function () {
	          values.push($(this).val());
	        });
	        return values.length ? values : [];
	      }
	      // Select multiple case
	      if (this.$element.is('select') && null === this.$element.val()) return [];
	      // Default case that should never happen
	      return this.$element.val();
	    },
	    _init: function _init(multiple) {
	      this.$elements = [this.$element];
	      this.options.multiple = multiple;
	      return this;
	    }
	  };
	
	  var o = $({}),
	      subscribed = {};
	  // $.listen(name, callback);
	  // $.listen(name, context, callback);
	  $.listen = function (name) {
	    if ('undefined' === typeof subscribed[name]) subscribed[name] = [];
	    if ('function' === typeof arguments[1]) return subscribed[name].push({ fn: arguments[1] });
	    if ('object' === typeof arguments[1] && 'function' === typeof arguments[2]) return subscribed[name].push({ fn: arguments[2], ctxt: arguments[1] });
	    throw new Error('Wrong parameters');
	  };
	  $.listenTo = function (instance, name, fn) {
	    if ('undefined' === typeof subscribed[name]) subscribed[name] = [];
	    if (!(instance instanceof ParsleyField) && !(instance instanceof ParsleyForm)) throw new Error('Must give Parsley instance');
	    if ('string' !== typeof name || 'function' !== typeof fn) throw new Error('Wrong parameters');
	    subscribed[name].push({ instance: instance, fn: fn });
	  };
	  $.unsubscribe = function (name, fn) {
	    if ('undefined' === typeof subscribed[name]) return;
	    if ('string' !== typeof name || 'function' !== typeof fn) throw new Error('Wrong arguments');
	    for (var i = 0; i < subscribed[name].length; i++) if (subscribed[name][i].fn === fn) return subscribed[name].splice(i, 1);
	  };
	  $.unsubscribeTo = function (instance, name) {
	    if ('undefined' === typeof subscribed[name]) return;
	    if (!(instance instanceof ParsleyField) && !(instance instanceof ParsleyForm)) throw new Error('Must give Parsley instance');
	    for (var i = 0; i < subscribed[name].length; i++) if ('undefined' !== typeof subscribed[name][i].instance && subscribed[name][i].instance.__id__ === instance.__id__) return subscribed[name].splice(i, 1);
	  };
	  $.unsubscribeAll = function (name) {
	    if ('undefined' === typeof subscribed[name]) return;
	    delete subscribed[name];
	  };
	  // $.emit(name [, arguments...]);
	  // $.emit(name, instance [, arguments...]);
	  $.emit = function (name, instance) {
	    if ('undefined' === typeof subscribed[name]) return;
	    // loop through registered callbacks for this event
	    for (var i = 0; i < subscribed[name].length; i++) {
	      // if instance is not registered, simple emit
	      if ('undefined' === typeof subscribed[name][i].instance) {
	        subscribed[name][i].fn.apply('undefined' !== typeof subscribed[name][i].ctxt ? subscribed[name][i].ctxt : o, Array.prototype.slice.call(arguments, 1));
	        continue;
	      }
	      // if instance registered but no instance given for the emit, continue
	      if (!(instance instanceof ParsleyField) && !(instance instanceof ParsleyForm)) continue;
	      // if instance is registered and same id, emit
	      if (subscribed[name][i].instance.__id__ === instance.__id__) {
	        subscribed[name][i].fn.apply(o, Array.prototype.slice.call(arguments, 1));
	        continue;
	      }
	      // if registered instance is a Form and fired one is a Field, loop over all its fields and emit if field found
	      if (subscribed[name][i].instance instanceof ParsleyForm && instance instanceof ParsleyField) for (var j = 0; j < subscribed[name][i].instance.fields.length; j++) if (subscribed[name][i].instance.fields[j].__id__ === instance.__id__) {
	        subscribed[name][i].fn.apply(o, Array.prototype.slice.call(arguments, 1));
	        continue;
	      }
	    }
	  };
	  $.subscribed = function () {
	    return subscribed;
	  };
	
	  // ParsleyConfig definition if not already set
	  window.ParsleyConfig = window.ParsleyConfig || {};
	  window.ParsleyConfig.i18n = window.ParsleyConfig.i18n || {};
	  // Define then the messages
	  window.ParsleyConfig.i18n.en = $.extend(window.ParsleyConfig.i18n.en || {}, {
	    defaultMessage: "This value seems to be invalid.",
	    type: {
	      email: "This value should be a valid email.",
	      url: "This value should be a valid url.",
	      number: "This value should be a valid number.",
	      integer: "This value should be a valid integer.",
	      digits: "This value should be digits.",
	      alphanum: "This value should be alphanumeric."
	    },
	    notblank: "This value should not be blank.",
	    required: "This value is required.",
	    pattern: "This value seems to be invalid.",
	    min: "This value should be greater than or equal to %s.",
	    max: "This value should be lower than or equal to %s.",
	    range: "This value should be between %s and %s.",
	    minlength: "This value is too short. It should have %s characters or more.",
	    maxlength: "This value is too long. It should have %s characters or fewer.",
	    length: "This value length is invalid. It should be between %s and %s characters long.",
	    mincheck: "You must select at least %s choices.",
	    maxcheck: "You must select %s choices or fewer.",
	    check: "You must select between %s and %s choices.",
	    equalto: "This value should be the same."
	  });
	  // If file is loaded after Parsley main file, auto-load locale
	  if ('undefined' !== typeof window.ParsleyValidator) window.ParsleyValidator.addCatalog('en', window.ParsleyConfig.i18n.en, true);
	
	  //     Parsley.js 2.0.6
	  //     http://parsleyjs.org
	  //     (c) 20012-2014 Guillaume Potier, Wisembly
	  //     Parsley may be freely distributed under the MIT license.
	
	  // ### Parsley factory
	  var Parsley = function Parsley(element, options, parsleyFormInstance) {
	    this.__class__ = 'Parsley';
	    this.__version__ = '2.0.6';
	    this.__id__ = ParsleyUtils.hash(4);
	    // Parsley must be instantiated with a DOM element or jQuery $element
	    if ('undefined' === typeof element) throw new Error('You must give an element');
	    if ('undefined' !== typeof parsleyFormInstance && 'ParsleyForm' !== parsleyFormInstance.__class__) throw new Error('Parent instance must be a ParsleyForm instance');
	    return this.init($(element), options, parsleyFormInstance);
	  };
	  Parsley.prototype = {
	    init: function init($element, options, parsleyFormInstance) {
	      if (!$element.length) throw new Error('You must bind Parsley on an existing element.');
	      this.$element = $element;
	      // If element have already been binded, returns its saved Parsley instance
	      if (this.$element.data('Parsley')) {
	        var savedparsleyFormInstance = this.$element.data('Parsley');
	        // If saved instance have been binded without a ParsleyForm parent and there is one given in this call, add it
	        if ('undefined' !== typeof parsleyFormInstance) savedparsleyFormInstance.parent = parsleyFormInstance;
	        return savedparsleyFormInstance;
	      }
	      // Handle 'static' options
	      this.OptionsFactory = new ParsleyOptionsFactory(ParsleyDefaults, ParsleyUtils.get(window, 'ParsleyConfig') || {}, options, this.getNamespace(options));
	      this.options = this.OptionsFactory.get(this);
	      // A ParsleyForm instance is obviously a `<form>` elem but also every node that is not an input and have `data-parsley-validate` attribute
	      if (this.$element.is('form') || ParsleyUtils.attr(this.$element, this.options.namespace, 'validate') && !this.$element.is(this.options.inputs)) return this.bind('parsleyForm');
	      // Every other supported element and not excluded element is binded as a `ParsleyField` or `ParsleyFieldMultiple`
	      else if (this.$element.is(this.options.inputs) && !this.$element.is(this.options.excluded)) return this.isMultiple() ? this.handleMultiple(parsleyFormInstance) : this.bind('parsleyField', parsleyFormInstance);
	      return this;
	    },
	    isMultiple: function isMultiple() {
	      return this.$element.is('input[type=radio], input[type=checkbox]') && 'undefined' === typeof this.options.multiple || this.$element.is('select') && 'undefined' !== typeof this.$element.attr('multiple');
	    },
	    // Multiples fields are a real nightmare :(
	    // Maybe some refacto would be appreciated here...
	    handleMultiple: function handleMultiple(parsleyFormInstance) {
	      var that = this,
	          name,
	          multiple,
	          parsleyMultipleInstance;
	      // Get parsleyFormInstance options if exist, mixed with element attributes
	      this.options = $.extend(this.options, parsleyFormInstance ? parsleyFormInstance.OptionsFactory.get(parsleyFormInstance) : {}, ParsleyUtils.attr(this.$element, this.options.namespace));
	      // Handle multiple name
	      if (this.options.multiple) multiple = this.options.multiple;else if ('undefined' !== typeof this.$element.attr('name') && this.$element.attr('name').length) multiple = name = this.$element.attr('name');else if ('undefined' !== typeof this.$element.attr('id') && this.$element.attr('id').length) multiple = this.$element.attr('id');
	      // Special select multiple input
	      if (this.$element.is('select') && 'undefined' !== typeof this.$element.attr('multiple')) {
	        return this.bind('parsleyFieldMultiple', parsleyFormInstance, multiple || this.__id__);
	        // Else for radio / checkboxes, we need a `name` or `data-parsley-multiple` to properly bind it
	      } else if ('undefined' === typeof multiple) {
	          if (window.console && window.console.warn) window.console.warn('To be binded by Parsley, a radio, a checkbox and a multiple select input must have either a name or a multiple option.', this.$element);
	          return this;
	        }
	      // Remove special chars
	      multiple = multiple.replace(/(:|\.|\[|\]|\{|\}|\$)/g, '');
	      // Add proper `data-parsley-multiple` to siblings if we have a valid multiple name
	      if ('undefined' !== typeof name) {
	        $('input[name="' + name + '"]').each(function () {
	          if ($(this).is('input[type=radio], input[type=checkbox]')) $(this).attr(that.options.namespace + 'multiple', multiple);
	        });
	      }
	      // Check here if we don't already have a related multiple instance saved
	      if ($('[' + this.options.namespace + 'multiple=' + multiple + ']').length) {
	        for (var i = 0; i < $('[' + this.options.namespace + 'multiple=' + multiple + ']').length; i++) {
	          if ('undefined' !== typeof $($('[' + this.options.namespace + 'multiple=' + multiple + ']').get(i)).data('Parsley')) {
	            parsleyMultipleInstance = $($('[' + this.options.namespace + 'multiple=' + multiple + ']').get(i)).data('Parsley');
	            if (!this.$element.data('ParsleyFieldMultiple')) {
	              parsleyMultipleInstance.addElement(this.$element);
	              this.$element.attr(this.options.namespace + 'id', parsleyMultipleInstance.__id__);
	            }
	            break;
	          }
	        }
	      }
	      // Create a secret ParsleyField instance for every multiple field. It would be stored in `data('ParsleyFieldMultiple')`
	      // And would be useful later to access classic `ParsleyField` stuff while being in a `ParsleyFieldMultiple` instance
	      this.bind('parsleyField', parsleyFormInstance, multiple, true);
	      return parsleyMultipleInstance || this.bind('parsleyFieldMultiple', parsleyFormInstance, multiple);
	    },
	    // Retrieve namespace used for DOM-API
	    getNamespace: function getNamespace(options) {
	      // `data-parsley-namespace=<namespace>`
	      if ('undefined' !== typeof this.$element.data('parsleyNamespace')) return this.$element.data('parsleyNamespace');
	      if ('undefined' !== typeof ParsleyUtils.get(options, 'namespace')) return options.namespace;
	      if ('undefined' !== typeof ParsleyUtils.get(window, 'ParsleyConfig.namespace')) return window.ParsleyConfig.namespace;
	      return ParsleyDefaults.namespace;
	    },
	    // Return proper `ParsleyForm`, `ParsleyField` or `ParsleyFieldMultiple`
	    bind: function bind(type, parentParsleyFormInstance, multiple, doNotStore) {
	      var parsleyInstance;
	      switch (type) {
	        case 'parsleyForm':
	          parsleyInstance = $.extend(new ParsleyForm(this.$element, this.OptionsFactory), new ParsleyAbstract(), window.ParsleyExtend)._bindFields();
	          break;
	        case 'parsleyField':
	          parsleyInstance = $.extend(new ParsleyField(this.$element, this.OptionsFactory, parentParsleyFormInstance), new ParsleyAbstract(), window.ParsleyExtend);
	          break;
	        case 'parsleyFieldMultiple':
	          parsleyInstance = $.extend(new ParsleyField(this.$element, this.OptionsFactory, parentParsleyFormInstance), new ParsleyAbstract(), new ParsleyMultiple(), window.ParsleyExtend)._init(multiple);
	          break;
	        default:
	          throw new Error(type + 'is not a supported Parsley type');
	      }
	      if ('undefined' !== typeof multiple) ParsleyUtils.setAttr(this.$element, this.options.namespace, 'multiple', multiple);
	      if ('undefined' !== typeof doNotStore) {
	        this.$element.data('ParsleyFieldMultiple', parsleyInstance);
	        return parsleyInstance;
	      }
	      // Store instance if `ParsleyForm`, `ParsleyField` or `ParsleyFieldMultiple`
	      if (new RegExp('ParsleyF', 'i').test(parsleyInstance.__class__)) {
	        // Store for later access the freshly binded instance in DOM element itself using jQuery `data()`
	        this.$element.data('Parsley', parsleyInstance);
	        // Tell the world we got a new ParsleyForm or ParsleyField instance!
	        $.emit('parsley:' + ('parsleyForm' === type ? 'form' : 'field') + ':init', parsleyInstance);
	      }
	      return parsleyInstance;
	    }
	  };
	  // ### jQuery API
	  // `$('.elem').parsley(options)` or `$('.elem').psly(options)`
	  $.fn.parsley = $.fn.psly = function (options) {
	    if (this.length > 1) {
	      var instances = [];
	      this.each(function () {
	        instances.push($(this).parsley(options));
	      });
	      return instances;
	    }
	    // Return undefined if applied to non existing DOM element
	    if (!$(this).length) {
	      if (window.console && window.console.warn) window.console.warn('You must bind Parsley on an existing element.');
	      return;
	    }
	    return new Parsley(this, options);
	  };
	  // ### ParsleyUI
	  // UI is a class apart that only listen to some events and them modify DOM accordingly
	  // Could be overriden by defining a `window.ParsleyConfig.ParsleyUI` appropriate class (with `listen()` method basically)
	  window.ParsleyUI = 'function' === typeof ParsleyUtils.get(window, 'ParsleyConfig.ParsleyUI') ? new window.ParsleyConfig.ParsleyUI().listen() : new ParsleyUI().listen();
	  // ### ParsleyField and ParsleyForm extension
	  // Ensure that defined if not already the case
	  if ('undefined' === typeof window.ParsleyExtend) window.ParsleyExtend = {};
	  // ### ParsleyConfig
	  // Ensure that defined if not already the case
	  if ('undefined' === typeof window.ParsleyConfig) window.ParsleyConfig = {};
	  // ### Globals
	  window.Parsley = window.psly = Parsley;
	  window.ParsleyUtils = ParsleyUtils;
	  window.ParsleyValidator = new ParsleyValidator(window.ParsleyConfig.validators, window.ParsleyConfig.i18n);
	  // ### PARSLEY auto-binding
	  // Prevent it by setting `ParsleyConfig.autoBind` to `false`
	  if (false !== ParsleyUtils.get(window, 'ParsleyConfig.autoBind')) $(function () {
	    // Works only on `data-parsley-validate`.
	    if ($('[data-parsley-validate]').length) $('[data-parsley-validate]').parsley();
	  });
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 12:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	* Parsleyjs
	* Guillaume Potier - <guillaume@wisembly.com>
	* Version 2.0.6 - built Sat Jan 24 2015 14:44:37
	* MIT Licensed
	*
	*/
	'use strict';
	
	!(function (factory) {
	  if (true) {
	    // AMD. Register as an anonymous module depending on jQuery.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else {
	    // No AMD. Register plugin with global jQuery object.
	    factory(jQuery);
	  }
	})(function ($) {
	  // small hack for requirejs if jquery is loaded through map and not path
	  // see http://requirejs.org/docs/jquery.html
	  if ('undefined' === typeof $ && 'undefined' !== typeof window.jQuery) $ = window.jQuery;
	  var ParsleyUtils = {
	    // Parsley DOM-API
	    // returns object from dom attributes and values
	    // if attr is given, returns bool if attr present in DOM or not
	    attr: function attr($element, namespace, checkAttr) {
	      var attribute,
	          obj = {},
	          msie = this.msieversion(),
	          regex = new RegExp('^' + namespace, 'i');
	      if ('undefined' === typeof $element || 'undefined' === typeof $element[0]) return {};
	      for (var i in $element[0].attributes) {
	        attribute = $element[0].attributes[i];
	        if ('undefined' !== typeof attribute && null !== attribute && (!msie || msie >= 8 || attribute.specified) && regex.test(attribute.name)) {
	          if ('undefined' !== typeof checkAttr && new RegExp(checkAttr + '$', 'i').test(attribute.name)) return true;
	          obj[this.camelize(attribute.name.replace(namespace, ''))] = this.deserializeValue(attribute.value);
	        }
	      }
	      return 'undefined' === typeof checkAttr ? obj : false;
	    },
	    setAttr: function setAttr($element, namespace, attr, value) {
	      $element[0].setAttribute(this.dasherize(namespace + attr), String(value));
	    },
	    // Recursive object / array getter
	    get: function get(obj, path) {
	      var i = 0,
	          paths = (path || '').split('.');
	      while (this.isObject(obj) || this.isArray(obj)) {
	        obj = obj[paths[i++]];
	        if (i === paths.length) return obj;
	      }
	      return undefined;
	    },
	    hash: function hash(length) {
	      return String(Math.random()).substring(2, length ? length + 2 : 9);
	    },
	    /** Third party functions **/
	    // Underscore isArray
	    isArray: function isArray(mixed) {
	      return Object.prototype.toString.call(mixed) === '[object Array]';
	    },
	    // Underscore isObject
	    isObject: function isObject(mixed) {
	      return mixed === Object(mixed);
	    },
	    // Zepto deserialize function
	    deserializeValue: function deserializeValue(value) {
	      var num;
	      try {
	        return value ? value == "true" || (value == "false" ? false : value == "null" ? null : !isNaN(num = Number(value)) ? num : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value;
	      } catch (e) {
	        return value;
	      }
	    },
	    // Zepto camelize function
	    camelize: function camelize(str) {
	      return str.replace(/-+(.)?/g, function (match, chr) {
	        return chr ? chr.toUpperCase() : '';
	      });
	    },
	    // Zepto dasherize function
	    dasherize: function dasherize(str) {
	      return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
	    },
	    // http://support.microsoft.com/kb/167820
	    // http://stackoverflow.com/questions/19999388/jquery-check-if-user-is-using-ie
	    msieversion: function msieversion() {
	      var ua = window.navigator.userAgent,
	          msie = ua.indexOf('MSIE ');
	      if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	      return 0;
	    }
	  };
	  // All these options could be overriden and specified directly in DOM using
	  // `data-parsley-` default DOM-API
	  // eg: `inputs` can be set in DOM using `data-parsley-inputs="input, textarea"`
	  // eg: `data-parsley-stop-on-first-failing-constraint="false"`
	  var ParsleyDefaults = {
	    // ### General
	    // Default data-namespace for DOM API
	    namespace: 'data-parsley-',
	    // Supported inputs by default
	    inputs: 'input, textarea, select',
	    // Excluded inputs by default
	    excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden]',
	    // Stop validating field on highest priority failing constraint
	    priorityEnabled: true,
	    // ### UI
	    // Enable\Disable error messages
	    uiEnabled: true,
	    // Key events threshold before validation
	    validationThreshold: 3,
	    // Focused field on form validation error. 'fist'|'last'|'none'
	    focus: 'first',
	    // `$.Event()` that will trigger validation. eg: `keyup`, `change`...
	    trigger: false,
	    // Class that would be added on every failing validation Parsley field
	    errorClass: 'parsley-error',
	    // Same for success validation
	    successClass: 'parsley-success',
	    // Return the `$element` that will receive these above success or error classes
	    // Could also be (and given directly from DOM) a valid selector like `'#div'`
	    classHandler: function classHandler(ParsleyField) {},
	    // Return the `$element` where errors will be appended
	    // Could also be (and given directly from DOM) a valid selector like `'#div'`
	    errorsContainer: function errorsContainer(ParsleyField) {},
	    // ul elem that would receive errors' list
	    errorsWrapper: '<ul class="parsley-errors-list"></ul>',
	    // li elem that would receive error message
	    errorTemplate: '<li></li>'
	  };
	
	  var ParsleyAbstract = function ParsleyAbstract() {};
	  ParsleyAbstract.prototype = {
	    asyncSupport: false,
	    actualizeOptions: function actualizeOptions() {
	      this.options = this.OptionsFactory.get(this);
	      return this;
	    },
	    // ParsleyValidator validate proxy function . Could be replaced by third party scripts
	    validateThroughValidator: function validateThroughValidator(value, constraints, priority) {
	      return window.ParsleyValidator.validate(value, constraints, priority);
	    },
	    // Subscribe an event and a handler for a specific field or a specific form
	    // If on a ParsleyForm instance, it will be attached to form instance and also
	    // To every field instance for this form
	    subscribe: function subscribe(name, fn) {
	      $.listenTo(this, name.toLowerCase(), fn);
	      return this;
	    },
	    // Same as subscribe above. Unsubscribe an event for field, or form + its fields
	    unsubscribe: function unsubscribe(name) {
	      $.unsubscribeTo(this, name.toLowerCase());
	      return this;
	    },
	    // Reset UI
	    reset: function reset() {
	      // Field case: just emit a reset event for UI
	      if ('ParsleyForm' !== this.__class__) return $.emit('parsley:field:reset', this);
	      // Form case: emit a reset event for each field
	      for (var i = 0; i < this.fields.length; i++) $.emit('parsley:field:reset', this.fields[i]);
	      $.emit('parsley:form:reset', this);
	    },
	    // Destroy Parsley instance (+ UI)
	    destroy: function destroy() {
	      // Field case: emit destroy event to clean UI and then destroy stored instance
	      if ('ParsleyForm' !== this.__class__) {
	        this.$element.removeData('Parsley');
	        this.$element.removeData('ParsleyFieldMultiple');
	        $.emit('parsley:field:destroy', this);
	        return;
	      }
	      // Form case: destroy all its fields and then destroy stored instance
	      for (var i = 0; i < this.fields.length; i++) this.fields[i].destroy();
	      this.$element.removeData('Parsley');
	      $.emit('parsley:form:destroy', this);
	    }
	  };
	  /*!
	  * validator.js
	  * Guillaume Potier - <guillaume@wisembly.com>
	  * Version 1.0.1 - built Mon Aug 25 2014 16:10:10
	  * MIT Licensed
	  *
	  */
	  var Validator = (function () {
	    var exports = {};
	    /**
	    * Validator
	    */
	    var Validator = function Validator(options) {
	      this.__class__ = 'Validator';
	      this.__version__ = '1.0.1';
	      this.options = options || {};
	      this.bindingKey = this.options.bindingKey || '_validatorjsConstraint';
	    };
	    Validator.prototype = {
	      constructor: Validator,
	      /*
	      * Validate string: validate( string, Assert, string ) || validate( string, [ Assert, Assert ], [ string, string ] )
	      * Validate object: validate( object, Constraint, string ) || validate( object, Constraint, [ string, string ] )
	      * Validate binded object: validate( object, string ) || validate( object, [ string, string ] )
	      */
	      validate: function validate(objectOrString, AssertsOrConstraintOrGroup, group) {
	        if ('string' !== typeof objectOrString && 'object' !== typeof objectOrString) throw new Error('You must validate an object or a string');
	        // string / array validation
	        if ('string' === typeof objectOrString || _isArray(objectOrString)) return this._validateString(objectOrString, AssertsOrConstraintOrGroup, group);
	        // binded object validation
	        if (this.isBinded(objectOrString)) return this._validateBindedObject(objectOrString, AssertsOrConstraintOrGroup);
	        // regular object validation
	        return this._validateObject(objectOrString, AssertsOrConstraintOrGroup, group);
	      },
	      bind: function bind(object, constraint) {
	        if ('object' !== typeof object) throw new Error('Must bind a Constraint to an object');
	        object[this.bindingKey] = new Constraint(constraint);
	        return this;
	      },
	      unbind: function unbind(object) {
	        if ('undefined' === typeof object._validatorjsConstraint) return this;
	        delete object[this.bindingKey];
	        return this;
	      },
	      isBinded: function isBinded(object) {
	        return 'undefined' !== typeof object[this.bindingKey];
	      },
	      getBinded: function getBinded(object) {
	        return this.isBinded(object) ? object[this.bindingKey] : null;
	      },
	      _validateString: function _validateString(string, assert, group) {
	        var result,
	            failures = [];
	        if (!_isArray(assert)) assert = [assert];
	        for (var i = 0; i < assert.length; i++) {
	          if (!(assert[i] instanceof Assert)) throw new Error('You must give an Assert or an Asserts array to validate a string');
	          result = assert[i].check(string, group);
	          if (result instanceof Violation) failures.push(result);
	        }
	        return failures.length ? failures : true;
	      },
	      _validateObject: function _validateObject(object, constraint, group) {
	        if ('object' !== typeof constraint) throw new Error('You must give a constraint to validate an object');
	        if (constraint instanceof Constraint) return constraint.check(object, group);
	        return new Constraint(constraint).check(object, group);
	      },
	      _validateBindedObject: function _validateBindedObject(object, group) {
	        return object[this.bindingKey].check(object, group);
	      }
	    };
	    Validator.errorCode = {
	      must_be_a_string: 'must_be_a_string',
	      must_be_an_array: 'must_be_an_array',
	      must_be_a_number: 'must_be_a_number',
	      must_be_a_string_or_array: 'must_be_a_string_or_array'
	    };
	    /**
	    * Constraint
	    */
	    var Constraint = function Constraint(data, options) {
	      this.__class__ = 'Constraint';
	      this.options = options || {};
	      this.nodes = {};
	      if (data) {
	        try {
	          this._bootstrap(data);
	        } catch (err) {
	          throw new Error('Should give a valid mapping object to Constraint', err, data);
	        }
	      }
	    };
	    Constraint.prototype = {
	      constructor: Constraint,
	      check: function check(object, group) {
	        var result,
	            failures = {};
	        // check all constraint nodes.
	        for (var property in this.nodes) {
	          var isRequired = false;
	          var constraint = this.get(property);
	          var constraints = _isArray(constraint) ? constraint : [constraint];
	          for (var i = constraints.length - 1; i >= 0; i--) {
	            if ('Required' === constraints[i].__class__) {
	              isRequired = constraints[i].requiresValidation(group);
	              continue;
	            }
	          }
	          if (!this.has(property, object) && !this.options.strict && !isRequired) {
	            continue;
	          }
	          try {
	            if (!this.has(property, this.options.strict || isRequired ? object : undefined)) {
	              // we trigger here a HaveProperty Assert violation to have uniform Violation object in the end
	              new Assert().HaveProperty(property).validate(object);
	            }
	            result = this._check(property, object[property], group);
	            // check returned an array of Violations or an object mapping Violations
	            if (_isArray(result) && result.length > 0 || !_isArray(result) && !_isEmptyObject(result)) {
	              failures[property] = result;
	            }
	          } catch (violation) {
	            failures[property] = violation;
	          }
	        }
	        return _isEmptyObject(failures) ? true : failures;
	      },
	      add: function add(node, object) {
	        if (object instanceof Assert || _isArray(object) && object[0] instanceof Assert) {
	          this.nodes[node] = object;
	          return this;
	        }
	        if ('object' === typeof object && !_isArray(object)) {
	          this.nodes[node] = object instanceof Constraint ? object : new Constraint(object);
	          return this;
	        }
	        throw new Error('Should give an Assert, an Asserts array, a Constraint', object);
	      },
	      has: function has(node, nodes) {
	        nodes = 'undefined' !== typeof nodes ? nodes : this.nodes;
	        return 'undefined' !== typeof nodes[node];
	      },
	      get: function get(node, placeholder) {
	        return this.has(node) ? this.nodes[node] : placeholder || null;
	      },
	      remove: function remove(node) {
	        var _nodes = [];
	        for (var i in this.nodes) if (i !== node) _nodes[i] = this.nodes[i];
	        this.nodes = _nodes;
	        return this;
	      },
	      _bootstrap: function _bootstrap(data) {
	        if (data instanceof Constraint) return this.nodes = data.nodes;
	        for (var node in data) this.add(node, data[node]);
	      },
	      _check: function _check(node, value, group) {
	        // Assert
	        if (this.nodes[node] instanceof Assert) return this._checkAsserts(value, [this.nodes[node]], group);
	        // Asserts
	        if (_isArray(this.nodes[node])) return this._checkAsserts(value, this.nodes[node], group);
	        // Constraint -> check api
	        if (this.nodes[node] instanceof Constraint) return this.nodes[node].check(value, group);
	        throw new Error('Invalid node', this.nodes[node]);
	      },
	      _checkAsserts: function _checkAsserts(value, asserts, group) {
	        var result,
	            failures = [];
	        for (var i = 0; i < asserts.length; i++) {
	          result = asserts[i].check(value, group);
	          if ('undefined' !== typeof result && true !== result) failures.push(result);
	          // Some asserts (Collection for example) could return an object
	          // if ( result && ! ( result instanceof Violation ) )
	          //   return result;
	          //
	          // // Vast assert majority return Violation
	          // if ( result instanceof Violation )
	          //   failures.push( result );
	        }
	        return failures;
	      }
	    };
	    /**
	    * Violation
	    */
	    var Violation = function Violation(assert, value, violation) {
	      this.__class__ = 'Violation';
	      if (!(assert instanceof Assert)) throw new Error('Should give an assertion implementing the Assert interface');
	      this.assert = assert;
	      this.value = value;
	      if ('undefined' !== typeof violation) this.violation = violation;
	    };
	    Violation.prototype = {
	      show: function show() {
	        var show = {
	          assert: this.assert.__class__,
	          value: this.value
	        };
	        if (this.violation) show.violation = this.violation;
	        return show;
	      },
	      __toString: function __toString() {
	        if ('undefined' !== typeof this.violation) this.violation = '", ' + this.getViolation().constraint + ' expected was ' + this.getViolation().expected;
	        return this.assert.__class__ + ' assert failed for "' + this.value + this.violation || '';
	      },
	      getViolation: function getViolation() {
	        var constraint, expected;
	        for (constraint in this.violation) expected = this.violation[constraint];
	        return { constraint: constraint, expected: expected };
	      }
	    };
	    /**
	    * Assert
	    */
	    var Assert = function Assert(group) {
	      this.__class__ = 'Assert';
	      this.__parentClass__ = this.__class__;
	      this.groups = [];
	      if ('undefined' !== typeof group) this.addGroup(group);
	    };
	    Assert.prototype = {
	      construct: Assert,
	      requiresValidation: function requiresValidation(group) {
	        if (group && !this.hasGroup(group)) return false;
	        if (!group && this.hasGroups()) return false;
	        return true;
	      },
	      check: function check(value, group) {
	        if (!this.requiresValidation(group)) return;
	        try {
	          return this.validate(value, group);
	        } catch (violation) {
	          return violation;
	        }
	      },
	      hasGroup: function hasGroup(group) {
	        if (_isArray(group)) return this.hasOneOf(group);
	        // All Asserts respond to "Any" group
	        if ('Any' === group) return true;
	        // Asserts with no group also respond to "Default" group. Else return false
	        if (!this.hasGroups()) return 'Default' === group;
	        return -1 !== this.groups.indexOf(group);
	      },
	      hasOneOf: function hasOneOf(groups) {
	        for (var i = 0; i < groups.length; i++) if (this.hasGroup(groups[i])) return true;
	        return false;
	      },
	      hasGroups: function hasGroups() {
	        return this.groups.length > 0;
	      },
	      addGroup: function addGroup(group) {
	        if (_isArray(group)) return this.addGroups(group);
	        if (!this.hasGroup(group)) this.groups.push(group);
	        return this;
	      },
	      removeGroup: function removeGroup(group) {
	        var _groups = [];
	        for (var i = 0; i < this.groups.length; i++) if (group !== this.groups[i]) _groups.push(this.groups[i]);
	        this.groups = _groups;
	        return this;
	      },
	      addGroups: function addGroups(groups) {
	        for (var i = 0; i < groups.length; i++) this.addGroup(groups[i]);
	        return this;
	      },
	      /**
	      * Asserts definitions
	      */
	      HaveProperty: function HaveProperty(node) {
	        this.__class__ = 'HaveProperty';
	        this.node = node;
	        this.validate = function (object) {
	          if ('undefined' === typeof object[this.node]) throw new Violation(this, object, { value: this.node });
	          return true;
	        };
	        return this;
	      },
	      Blank: function Blank() {
	        this.__class__ = 'Blank';
	        this.validate = function (value) {
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if ('' !== value.replace(/^\s+/g, '').replace(/\s+$/g, '')) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      Callback: function Callback(fn) {
	        this.__class__ = 'Callback';
	        this.arguments = Array.prototype.slice.call(arguments);
	        if (1 === this.arguments.length) this.arguments = [];else this.arguments.splice(0, 1);
	        if ('function' !== typeof fn) throw new Error('Callback must be instanciated with a function');
	        this.fn = fn;
	        this.validate = function (value) {
	          var result = this.fn.apply(this, [value].concat(this.arguments));
	          if (true !== result) throw new Violation(this, value, { result: result });
	          return true;
	        };
	        return this;
	      },
	      Choice: function Choice(list) {
	        this.__class__ = 'Choice';
	        if (!_isArray(list) && 'function' !== typeof list) throw new Error('Choice must be instanciated with an array or a function');
	        this.list = list;
	        this.validate = function (value) {
	          var list = 'function' === typeof this.list ? this.list() : this.list;
	          for (var i = 0; i < list.length; i++) if (value === list[i]) return true;
	          throw new Violation(this, value, { choices: list });
	        };
	        return this;
	      },
	      Collection: function Collection(assertOrConstraint) {
	        this.__class__ = 'Collection';
	        this.constraint = 'undefined' !== typeof assertOrConstraint ? assertOrConstraint instanceof Assert ? assertOrConstraint : new Constraint(assertOrConstraint) : false;
	        this.validate = function (collection, group) {
	          var result,
	              validator = new Validator(),
	              count = 0,
	              failures = {},
	              groups = this.groups.length ? this.groups : group;
	          if (!_isArray(collection)) throw new Violation(this, collection, { value: Validator.errorCode.must_be_an_array });
	          for (var i = 0; i < collection.length; i++) {
	            result = this.constraint ? validator.validate(collection[i], this.constraint, groups) : validator.validate(collection[i], groups);
	            if (!_isEmptyObject(result)) failures[count] = result;
	            count++;
	          }
	          return !_isEmptyObject(failures) ? failures : true;
	        };
	        return this;
	      },
	      Count: function Count(count) {
	        this.__class__ = 'Count';
	        this.count = count;
	        this.validate = function (array) {
	          if (!_isArray(array)) throw new Violation(this, array, { value: Validator.errorCode.must_be_an_array });
	          var count = 'function' === typeof this.count ? this.count(array) : this.count;
	          if (isNaN(Number(count))) throw new Error('Count must be a valid interger', count);
	          if (count !== array.length) throw new Violation(this, array, { count: count });
	          return true;
	        };
	        return this;
	      },
	      Email: function Email() {
	        this.__class__ = 'Email';
	        this.validate = function (value) {
	          var regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if (!regExp.test(value)) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      EqualTo: function EqualTo(reference) {
	        this.__class__ = 'EqualTo';
	        if ('undefined' === typeof reference) throw new Error('EqualTo must be instanciated with a value or a function');
	        this.reference = reference;
	        this.validate = function (value) {
	          var reference = 'function' === typeof this.reference ? this.reference(value) : this.reference;
	          if (reference !== value) throw new Violation(this, value, { value: reference });
	          return true;
	        };
	        return this;
	      },
	      GreaterThan: function GreaterThan(threshold) {
	        this.__class__ = 'GreaterThan';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold >= value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      GreaterThanOrEqual: function GreaterThanOrEqual(threshold) {
	        this.__class__ = 'GreaterThanOrEqual';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold > value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      InstanceOf: function InstanceOf(classRef) {
	        this.__class__ = 'InstanceOf';
	        if ('undefined' === typeof classRef) throw new Error('InstanceOf must be instanciated with a value');
	        this.classRef = classRef;
	        this.validate = function (value) {
	          if (true !== value instanceof this.classRef) throw new Violation(this, value, { classRef: this.classRef });
	          return true;
	        };
	        return this;
	      },
	      Length: function Length(boundaries) {
	        this.__class__ = 'Length';
	        if (!boundaries.min && !boundaries.max) throw new Error('Lenth assert must be instanciated with a { min: x, max: y } object');
	        this.min = boundaries.min;
	        this.max = boundaries.max;
	        this.validate = function (value) {
	          if ('string' !== typeof value && !_isArray(value)) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string_or_array });
	          if ('undefined' !== typeof this.min && this.min === this.max && value.length !== this.min) throw new Violation(this, value, { min: this.min, max: this.max });
	          if ('undefined' !== typeof this.max && value.length > this.max) throw new Violation(this, value, { max: this.max });
	          if ('undefined' !== typeof this.min && value.length < this.min) throw new Violation(this, value, { min: this.min });
	          return true;
	        };
	        return this;
	      },
	      LessThan: function LessThan(threshold) {
	        this.__class__ = 'LessThan';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold <= value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      LessThanOrEqual: function LessThanOrEqual(threshold) {
	        this.__class__ = 'LessThanOrEqual';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold < value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      NotNull: function NotNull() {
	        this.__class__ = 'NotNull';
	        this.validate = function (value) {
	          if (null === value || 'undefined' === typeof value) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      NotBlank: function NotBlank() {
	        this.__class__ = 'NotBlank';
	        this.validate = function (value) {
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if ('' === value.replace(/^\s+/g, '').replace(/\s+$/g, '')) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      Null: function Null() {
	        this.__class__ = 'Null';
	        this.validate = function (value) {
	          if (null !== value) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      Range: function Range(min, max) {
	        this.__class__ = 'Range';
	        if ('undefined' === typeof min || 'undefined' === typeof max) throw new Error('Range assert expects min and max values');
	        this.min = min;
	        this.max = max;
	        this.validate = function (value) {
	          try {
	            // validate strings and objects with their Length
	            if ('string' === typeof value && isNaN(Number(value)) || _isArray(value)) new Assert().Length({ min: this.min, max: this.max }).validate(value);
	            // validate numbers with their value
	            else new Assert().GreaterThanOrEqual(this.min).validate(value) && new Assert().LessThanOrEqual(this.max).validate(value);
	            return true;
	          } catch (violation) {
	            throw new Violation(this, value, violation.violation);
	          }
	          return true;
	        };
	        return this;
	      },
	      Regexp: function Regexp(regexp, flag) {
	        this.__class__ = 'Regexp';
	        if ('undefined' === typeof regexp) throw new Error('You must give a regexp');
	        this.regexp = regexp;
	        this.flag = flag || '';
	        this.validate = function (value) {
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if (!new RegExp(this.regexp, this.flag).test(value)) throw new Violation(this, value, { regexp: this.regexp, flag: this.flag });
	          return true;
	        };
	        return this;
	      },
	      Required: function Required() {
	        this.__class__ = 'Required';
	        this.validate = function (value) {
	          if ('undefined' === typeof value) throw new Violation(this, value);
	          try {
	            if ('string' === typeof value) new Assert().NotNull().validate(value) && new Assert().NotBlank().validate(value);else if (true === _isArray(value)) new Assert().Length({ min: 1 }).validate(value);
	          } catch (violation) {
	            throw new Violation(this, value);
	          }
	          return true;
	        };
	        return this;
	      },
	      // Unique() or Unique ( { key: foo } )
	      Unique: function Unique(object) {
	        this.__class__ = 'Unique';
	        if ('object' === typeof object) this.key = object.key;
	        this.validate = function (array) {
	          var value,
	              store = [];
	          if (!_isArray(array)) throw new Violation(this, array, { value: Validator.errorCode.must_be_an_array });
	          for (var i = 0; i < array.length; i++) {
	            value = 'object' === typeof array[i] ? array[i][this.key] : array[i];
	            if ('undefined' === typeof value) continue;
	            if (-1 !== store.indexOf(value)) throw new Violation(this, array, { value: value });
	            store.push(value);
	          }
	          return true;
	        };
	        return this;
	      }
	    };
	    // expose to the world these awesome classes
	    exports.Assert = Assert;
	    exports.Validator = Validator;
	    exports.Violation = Violation;
	    exports.Constraint = Constraint;
	    /**
	    * Some useful object prototypes / functions here
	    */
	    // IE8<= compatibility
	    // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
	    if (!Array.prototype.indexOf) Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
	
	      if (this === null) {
	        throw new TypeError();
	      }
	      var t = Object(this);
	      var len = t.length >>> 0;
	      if (len === 0) {
	        return -1;
	      }
	      var n = 0;
	      if (arguments.length > 1) {
	        n = Number(arguments[1]);
	        if (n != n) {
	          // shortcut for verifying if it's NaN
	          n = 0;
	        } else if (n !== 0 && n != Infinity && n != -Infinity) {
	          n = (n > 0 || -1) * Math.floor(Math.abs(n));
	        }
	      }
	      if (n >= len) {
	        return -1;
	      }
	      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
	      for (; k < len; k++) {
	        if (k in t && t[k] === searchElement) {
	          return k;
	        }
	      }
	      return -1;
	    };
	    // Test if object is empty, useful for Constraint violations check
	    var _isEmptyObject = function _isEmptyObject(obj) {
	      for (var property in obj) return false;
	      return true;
	    };
	    var _isArray = function _isArray(obj) {
	      return Object.prototype.toString.call(obj) === '[object Array]';
	    };
	    // AMD export
	    if (true) {
	      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return exports;
	      }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	      // commonjs export
	    } else if (typeof module !== 'undefined' && module.exports) {
	        module.exports = exports;
	        // browser
	      } else {
	          window['undefined' !== typeof validatorjs_ns ? validatorjs_ns : 'Validator'] = exports;
	        }
	
	    return exports;
	  })();
	
	  // This is needed for Browserify usage that requires Validator.js through module.exports
	  Validator = 'undefined' !== typeof Validator ? Validator :  true ? module.exports : null;
	  var ParsleyValidator = function ParsleyValidator(validators, catalog) {
	    this.__class__ = 'ParsleyValidator';
	    this.Validator = Validator;
	    // Default Parsley locale is en
	    this.locale = 'en';
	    this.init(validators || {}, catalog || {});
	  };
	  ParsleyValidator.prototype = {
	    init: function init(validators, catalog) {
	      this.catalog = catalog;
	      for (var name in validators) this.addValidator(name, validators[name].fn, validators[name].priority, validators[name].requirementsTransformer);
	      $.emit('parsley:validator:init');
	    },
	    // Set new messages locale if we have dictionary loaded in ParsleyConfig.i18n
	    setLocale: function setLocale(locale) {
	      if ('undefined' === typeof this.catalog[locale]) throw new Error(locale + ' is not available in the catalog');
	      this.locale = locale;
	      return this;
	    },
	    // Add a new messages catalog for a given locale. Set locale for this catalog if set === `true`
	    addCatalog: function addCatalog(locale, messages, set) {
	      if ('object' === typeof messages) this.catalog[locale] = messages;
	      if (true === set) return this.setLocale(locale);
	      return this;
	    },
	    // Add a specific message for a given constraint in a given locale
	    addMessage: function addMessage(locale, name, message) {
	      if ('undefined' === typeof this.catalog[locale]) this.catalog[locale] = {};
	      this.catalog[locale][name.toLowerCase()] = message;
	      return this;
	    },
	    validate: function validate(value, constraints, priority) {
	      return new this.Validator.Validator().validate.apply(new Validator.Validator(), arguments);
	    },
	    // Add a new validator
	    addValidator: function addValidator(name, fn, priority, requirementsTransformer) {
	      this.validators[name.toLowerCase()] = function (requirements) {
	        return $.extend(new Validator.Assert().Callback(fn, requirements), {
	          priority: priority,
	          requirementsTransformer: requirementsTransformer
	        });
	      };
	      return this;
	    },
	    updateValidator: function updateValidator(name, fn, priority, requirementsTransformer) {
	      return this.addValidator(name, fn, priority, requirementsTransformer);
	    },
	    removeValidator: function removeValidator(name) {
	      delete this.validators[name];
	      return this;
	    },
	    getErrorMessage: function getErrorMessage(constraint) {
	      var message;
	      // Type constraints are a bit different, we have to match their requirements too to find right error message
	      if ('type' === constraint.name) message = this.catalog[this.locale][constraint.name][constraint.requirements];else message = this.formatMessage(this.catalog[this.locale][constraint.name], constraint.requirements);
	      return '' !== message ? message : this.catalog[this.locale].defaultMessage;
	    },
	    // Kind of light `sprintf()` implementation
	    formatMessage: function formatMessage(string, parameters) {
	      if ('object' === typeof parameters) {
	        for (var i in parameters) string = this.formatMessage(string, parameters[i]);
	        return string;
	      }
	      return 'string' === typeof string ? string.replace(new RegExp('%s', 'i'), parameters) : '';
	    },
	    // Here is the Parsley default validators list.
	    // This is basically Validatorjs validators, with different API for some of them
	    // and a Parsley priority set
	    validators: {
	      notblank: function notblank() {
	        return $.extend(new Validator.Assert().NotBlank(), { priority: 2 });
	      },
	      required: function required() {
	        return $.extend(new Validator.Assert().Required(), { priority: 512 });
	      },
	      type: function type(_type) {
	        var assert;
	        switch (_type) {
	          case 'email':
	            assert = new Validator.Assert().Email();
	            break;
	          // range type just ensure we have a number here
	          case 'range':
	          case 'number':
	            assert = new Validator.Assert().Regexp('^-?(?:\\d+|\\d{1,3}(?:,\\d{3})+)?(?:\\.\\d+)?$');
	            break;
	          case 'integer':
	            assert = new Validator.Assert().Regexp('^-?\\d+$');
	            break;
	          case 'digits':
	            assert = new Validator.Assert().Regexp('^\\d+$');
	            break;
	          case 'alphanum':
	            assert = new Validator.Assert().Regexp('^\\w+$', 'i');
	            break;
	          case 'url':
	            assert = new Validator.Assert().Regexp('(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,24}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)', 'i');
	            break;
	          default:
	            throw new Error('validator type `' + _type + '` is not supported');
	        }
	        return $.extend(assert, { priority: 256 });
	      },
	      pattern: function pattern(regexp) {
	        var flags = '';
	        // Test if RegExp is literal, if not, nothing to be done, otherwise, we need to isolate flags and pattern
	        if (!!/^\/.*\/(?:[gimy]*)$/.test(regexp)) {
	          // Replace the regexp literal string with the first match group: ([gimy]*)
	          // If no flag is present, this will be a blank string
	          flags = regexp.replace(/.*\/([gimy]*)$/, '$1');
	          // Again, replace the regexp literal string with the first match group:
	          // everything excluding the opening and closing slashes and the flags
	          regexp = regexp.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
	        }
	        return $.extend(new Validator.Assert().Regexp(regexp, flags), { priority: 64 });
	      },
	      minlength: function minlength(value) {
	        return $.extend(new Validator.Assert().Length({ min: value }), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      maxlength: function maxlength(value) {
	        return $.extend(new Validator.Assert().Length({ max: value }), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      length: function length(array) {
	        return $.extend(new Validator.Assert().Length({ min: array[0], max: array[1] }), { priority: 32 });
	      },
	      mincheck: function mincheck(length) {
	        return this.minlength(length);
	      },
	      maxcheck: function maxcheck(length) {
	        return this.maxlength(length);
	      },
	      check: function check(array) {
	        return this.length(array);
	      },
	      min: function min(value) {
	        return $.extend(new Validator.Assert().GreaterThanOrEqual(value), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      max: function max(value) {
	        return $.extend(new Validator.Assert().LessThanOrEqual(value), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      range: function range(array) {
	        return $.extend(new Validator.Assert().Range(array[0], array[1]), {
	          priority: 32,
	          requirementsTransformer: function requirementsTransformer() {
	            for (var i = 0; i < array.length; i++) array[i] = 'string' === typeof array[i] && !isNaN(array[i]) ? parseInt(array[i], 10) : array[i];
	            return array;
	          }
	        });
	      },
	      equalto: function equalto(value) {
	        return $.extend(new Validator.Assert().EqualTo(value), {
	          priority: 256,
	          requirementsTransformer: function requirementsTransformer() {
	            return $(value).length ? $(value).val() : value;
	          }
	        });
	      }
	    }
	  };
	
	  var ParsleyUI = function ParsleyUI(options) {
	    this.__class__ = 'ParsleyUI';
	  };
	  ParsleyUI.prototype = {
	    listen: function listen() {
	      $.listen('parsley:form:init', this, this.setupForm);
	      $.listen('parsley:field:init', this, this.setupField);
	      $.listen('parsley:field:validated', this, this.reflow);
	      $.listen('parsley:form:validated', this, this.focus);
	      $.listen('parsley:field:reset', this, this.reset);
	      $.listen('parsley:form:destroy', this, this.destroy);
	      $.listen('parsley:field:destroy', this, this.destroy);
	      return this;
	    },
	    reflow: function reflow(fieldInstance) {
	      // If this field has not an active UI (case for multiples) don't bother doing something
	      if ('undefined' === typeof fieldInstance._ui || false === fieldInstance._ui.active) return;
	      // Diff between two validation results
	      var diff = this._diff(fieldInstance.validationResult, fieldInstance._ui.lastValidationResult);
	      // Then store current validation result for next reflow
	      fieldInstance._ui.lastValidationResult = fieldInstance.validationResult;
	      // Field have been validated at least once if here. Useful for binded key events...
	      fieldInstance._ui.validatedOnce = true;
	      // Handle valid / invalid / none field class
	      this.manageStatusClass(fieldInstance);
	      // Add, remove, updated errors messages
	      this.manageErrorsMessages(fieldInstance, diff);
	      // Triggers impl
	      this.actualizeTriggers(fieldInstance);
	      // If field is not valid for the first time, bind keyup trigger to ease UX and quickly inform user
	      if ((diff.kept.length || diff.added.length) && 'undefined' === typeof fieldInstance._ui.failedOnce) this.manageFailingFieldTrigger(fieldInstance);
	    },
	    // Returns an array of field's error message(s)
	    getErrorsMessages: function getErrorsMessages(fieldInstance) {
	      // No error message, field is valid
	      if (true === fieldInstance.validationResult) return [];
	      var messages = [];
	      for (var i = 0; i < fieldInstance.validationResult.length; i++) messages.push(this._getErrorMessage(fieldInstance, fieldInstance.validationResult[i].assert));
	      return messages;
	    },
	    manageStatusClass: function manageStatusClass(fieldInstance) {
	      if (true === fieldInstance.validationResult) this._successClass(fieldInstance);else if (fieldInstance.validationResult.length > 0) this._errorClass(fieldInstance);else this._resetClass(fieldInstance);
	    },
	    manageErrorsMessages: function manageErrorsMessages(fieldInstance, diff) {
	      if ('undefined' !== typeof fieldInstance.options.errorsMessagesDisabled) return;
	      // Case where we have errorMessage option that configure an unique field error message, regardless failing validators
	      if ('undefined' !== typeof fieldInstance.options.errorMessage) {
	        if (diff.added.length || diff.kept.length) {
	          if (0 === fieldInstance._ui.$errorsWrapper.find('.parsley-custom-error-message').length) fieldInstance._ui.$errorsWrapper.append($(fieldInstance.options.errorTemplate).addClass('parsley-custom-error-message'));
	          return fieldInstance._ui.$errorsWrapper.addClass('filled').find('.parsley-custom-error-message').html(fieldInstance.options.errorMessage);
	        }
	        return fieldInstance._ui.$errorsWrapper.removeClass('filled').find('.parsley-custom-error-message').remove();
	      }
	      // Show, hide, update failing constraints messages
	      for (var i = 0; i < diff.removed.length; i++) this.removeError(fieldInstance, diff.removed[i].assert.name, true);
	      for (i = 0; i < diff.added.length; i++) this.addError(fieldInstance, diff.added[i].assert.name, undefined, diff.added[i].assert, true);
	      for (i = 0; i < diff.kept.length; i++) this.updateError(fieldInstance, diff.kept[i].assert.name, undefined, diff.kept[i].assert, true);
	    },
	    // TODO: strange API here, intuitive for manual usage with addError(pslyInstance, 'foo', 'bar')
	    // but a little bit complex for above internal usage, with forced undefined parameter...
	    addError: function addError(fieldInstance, name, message, assert, doNotUpdateClass) {
	      fieldInstance._ui.$errorsWrapper.addClass('filled').append($(fieldInstance.options.errorTemplate).addClass('parsley-' + name).html(message || this._getErrorMessage(fieldInstance, assert)));
	      if (true !== doNotUpdateClass) this._errorClass(fieldInstance);
	    },
	    // Same as above
	    updateError: function updateError(fieldInstance, name, message, assert, doNotUpdateClass) {
	      fieldInstance._ui.$errorsWrapper.addClass('filled').find('.parsley-' + name).html(message || this._getErrorMessage(fieldInstance, assert));
	      if (true !== doNotUpdateClass) this._errorClass(fieldInstance);
	    },
	    // Same as above twice
	    removeError: function removeError(fieldInstance, name, doNotUpdateClass) {
	      fieldInstance._ui.$errorsWrapper.removeClass('filled').find('.parsley-' + name).remove();
	      // edge case possible here: remove a standard Parsley error that is still failing in fieldInstance.validationResult
	      // but highly improbable cuz' manually removing a well Parsley handled error makes no sense.
	      if (true !== doNotUpdateClass) this.manageStatusClass(fieldInstance);
	    },
	    focus: function focus(formInstance) {
	      if (true === formInstance.validationResult || 'none' === formInstance.options.focus) return formInstance._focusedField = null;
	      formInstance._focusedField = null;
	      for (var i = 0; i < formInstance.fields.length; i++) if (true !== formInstance.fields[i].validationResult && formInstance.fields[i].validationResult.length > 0 && 'undefined' === typeof formInstance.fields[i].options.noFocus) {
	        if ('first' === formInstance.options.focus) {
	          formInstance._focusedField = formInstance.fields[i].$element;
	          return formInstance._focusedField.focus();
	        }
	        formInstance._focusedField = formInstance.fields[i].$element;
	      }
	      if (null === formInstance._focusedField) return null;
	      return formInstance._focusedField.focus();
	    },
	    _getErrorMessage: function _getErrorMessage(fieldInstance, constraint) {
	      var customConstraintErrorMessage = constraint.name + 'Message';
	      if ('undefined' !== typeof fieldInstance.options[customConstraintErrorMessage]) return window.ParsleyValidator.formatMessage(fieldInstance.options[customConstraintErrorMessage], constraint.requirements);
	      return window.ParsleyValidator.getErrorMessage(constraint);
	    },
	    _diff: function _diff(newResult, oldResult, deep) {
	      var added = [],
	          kept = [];
	      for (var i = 0; i < newResult.length; i++) {
	        var found = false;
	        for (var j = 0; j < oldResult.length; j++) if (newResult[i].assert.name === oldResult[j].assert.name) {
	          found = true;
	          break;
	        }
	        if (found) kept.push(newResult[i]);else added.push(newResult[i]);
	      }
	      return {
	        kept: kept,
	        added: added,
	        removed: !deep ? this._diff(oldResult, newResult, true).added : []
	      };
	    },
	    setupForm: function setupForm(formInstance) {
	      formInstance.$element.on('submit.Parsley', false, $.proxy(formInstance.onSubmitValidate, formInstance));
	      // UI could be disabled
	      if (false === formInstance.options.uiEnabled) return;
	      formInstance.$element.attr('novalidate', '');
	    },
	    setupField: function setupField(fieldInstance) {
	      var _ui = { active: false };
	      // UI could be disabled
	      if (false === fieldInstance.options.uiEnabled) return;
	      _ui.active = true;
	      // Give field its Parsley id in DOM
	      fieldInstance.$element.attr(fieldInstance.options.namespace + 'id', fieldInstance.__id__);
	      /** Generate important UI elements and store them in fieldInstance **/
	      // $errorClassHandler is the $element that woul have parsley-error and parsley-success classes
	      _ui.$errorClassHandler = this._manageClassHandler(fieldInstance);
	      // $errorsWrapper is a div that would contain the various field errors, it will be appended into $errorsContainer
	      _ui.errorsWrapperId = 'parsley-id-' + ('undefined' !== typeof fieldInstance.options.multiple ? 'multiple-' + fieldInstance.options.multiple : fieldInstance.__id__);
	      _ui.$errorsWrapper = $(fieldInstance.options.errorsWrapper).attr('id', _ui.errorsWrapperId);
	      // ValidationResult UI storage to detect what have changed bwt two validations, and update DOM accordingly
	      _ui.lastValidationResult = [];
	      _ui.validatedOnce = false;
	      _ui.validationInformationVisible = false;
	      // Store it in fieldInstance for later
	      fieldInstance._ui = _ui;
	      // Stops excluded inputs from getting errorContainer added
	      if (!fieldInstance.$element.is(fieldInstance.options.excluded)) {
	        /** Mess with DOM now **/
	        this._insertErrorWrapper(fieldInstance);
	      }
	      // Bind triggers first time
	      this.actualizeTriggers(fieldInstance);
	    },
	    // Determine which element will have `parsley-error` and `parsley-success` classes
	    _manageClassHandler: function _manageClassHandler(fieldInstance) {
	      // An element selector could be passed through DOM with `data-parsley-class-handler=#foo`
	      if ('string' === typeof fieldInstance.options.classHandler && $(fieldInstance.options.classHandler).length) return $(fieldInstance.options.classHandler);
	      // Class handled could also be determined by function given in Parsley options
	      var $handler = fieldInstance.options.classHandler(fieldInstance);
	      // If this function returned a valid existing DOM element, go for it
	      if ('undefined' !== typeof $handler && $handler.length) return $handler;
	      // Otherwise, if simple element (input, texatrea, select...) it will perfectly host the classes
	      if ('undefined' === typeof fieldInstance.options.multiple || fieldInstance.$element.is('select')) return fieldInstance.$element;
	      // But if multiple element (radio, checkbox), that would be their parent
	      return fieldInstance.$element.parent();
	    },
	    _insertErrorWrapper: function _insertErrorWrapper(fieldInstance) {
	      var $errorsContainer;
	      if ('string' === typeof fieldInstance.options.errorsContainer) {
	        if ($(fieldInstance.options.errorsContainer).length) return $(fieldInstance.options.errorsContainer).append(fieldInstance._ui.$errorsWrapper);else if (window.console && window.console.warn) window.console.warn('The errors container `' + fieldInstance.options.errorsContainer + '` does not exist in DOM');
	      } else if ('function' === typeof fieldInstance.options.errorsContainer) $errorsContainer = fieldInstance.options.errorsContainer(fieldInstance);
	      if ('undefined' !== typeof $errorsContainer && $errorsContainer.length) return $errorsContainer.append(fieldInstance._ui.$errorsWrapper);
	      return 'undefined' === typeof fieldInstance.options.multiple ? fieldInstance.$element.after(fieldInstance._ui.$errorsWrapper) : fieldInstance.$element.parent().after(fieldInstance._ui.$errorsWrapper);
	    },
	    actualizeTriggers: function actualizeTriggers(fieldInstance) {
	      var $toBind = fieldInstance.$element;
	      if (fieldInstance.options.multiple) $toBind = $('[' + fieldInstance.options.namespace + 'multiple="' + fieldInstance.options.multiple + '"]');
	      // Remove Parsley events already binded on this field
	      $toBind.off('.Parsley');
	      // If no trigger is set, all good
	      if (false === fieldInstance.options.trigger) return;
	      var triggers = fieldInstance.options.trigger.replace(/^\s+/g, '').replace(/\s+$/g, '');
	      if ('' === triggers) return;
	      // Bind fieldInstance.eventValidate if exists (for parsley.ajax for example), ParsleyUI.eventValidate otherwise
	      $toBind.on(triggers.split(' ').join('.Parsley ') + '.Parsley', $.proxy('function' === typeof fieldInstance.eventValidate ? fieldInstance.eventValidate : this.eventValidate, fieldInstance));
	    },
	    // Called through $.proxy with fieldInstance. `this` context is ParsleyField
	    eventValidate: function eventValidate(event) {
	      // For keyup, keypress, keydown... events that could be a little bit obstrusive
	      // do not validate if val length < min threshold on first validation. Once field have been validated once and info
	      // about success or failure have been displayed, always validate with this trigger to reflect every yalidation change.
	      if (new RegExp('key').test(event.type)) if (!this._ui.validationInformationVisible && this.getValue().length <= this.options.validationThreshold) return;
	      this._ui.validatedOnce = true;
	      this.validate();
	    },
	    manageFailingFieldTrigger: function manageFailingFieldTrigger(fieldInstance) {
	      fieldInstance._ui.failedOnce = true;
	      // Radio and checkboxes fields must bind every field multiple
	      if (fieldInstance.options.multiple) $('[' + fieldInstance.options.namespace + 'multiple="' + fieldInstance.options.multiple + '"]').each(function () {
	        if (!new RegExp('change', 'i').test($(this).parsley().options.trigger || '')) return $(this).on('change.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
	      });
	      // Select case
	      if (fieldInstance.$element.is('select')) if (!new RegExp('change', 'i').test(fieldInstance.options.trigger || '')) return fieldInstance.$element.on('change.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
	      // All other inputs fields
	      if (!new RegExp('keyup', 'i').test(fieldInstance.options.trigger || '')) return fieldInstance.$element.on('keyup.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
	    },
	    reset: function reset(parsleyInstance) {
	      // Reset all event listeners
	      parsleyInstance.$element.off('.Parsley');
	      parsleyInstance.$element.off('.ParsleyFailedOnce');
	      // Nothing to do if UI never initialized for this field
	      if ('undefined' === typeof parsleyInstance._ui) return;
	      if ('ParsleyForm' === parsleyInstance.__class__) return;
	      // Reset all errors' li
	      parsleyInstance._ui.$errorsWrapper.removeClass('filled').children().remove();
	      // Reset validation class
	      this._resetClass(parsleyInstance);
	      // Reset validation flags and last validation result
	      parsleyInstance._ui.validatedOnce = false;
	      parsleyInstance._ui.lastValidationResult = [];
	      parsleyInstance._ui.validationInformationVisible = false;
	    },
	    destroy: function destroy(parsleyInstance) {
	      this.reset(parsleyInstance);
	      if ('ParsleyForm' === parsleyInstance.__class__) return;
	      if ('undefined' !== typeof parsleyInstance._ui) parsleyInstance._ui.$errorsWrapper.remove();
	      delete parsleyInstance._ui;
	    },
	    _successClass: function _successClass(fieldInstance) {
	      fieldInstance._ui.validationInformationVisible = true;
	      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.errorClass).addClass(fieldInstance.options.successClass);
	    },
	    _errorClass: function _errorClass(fieldInstance) {
	      fieldInstance._ui.validationInformationVisible = true;
	      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).addClass(fieldInstance.options.errorClass);
	    },
	    _resetClass: function _resetClass(fieldInstance) {
	      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).removeClass(fieldInstance.options.errorClass);
	    }
	  };
	
	  var ParsleyOptionsFactory = function ParsleyOptionsFactory(defaultOptions, globalOptions, userOptions, namespace) {
	    this.__class__ = 'OptionsFactory';
	    this.__id__ = ParsleyUtils.hash(4);
	    this.formOptions = null;
	    this.fieldOptions = null;
	    this.staticOptions = $.extend(true, {}, defaultOptions, globalOptions, userOptions, { namespace: namespace });
	  };
	  ParsleyOptionsFactory.prototype = {
	    get: function get(parsleyInstance) {
	      if ('undefined' === typeof parsleyInstance.__class__) throw new Error('Parsley Instance expected');
	      switch (parsleyInstance.__class__) {
	        case 'Parsley':
	          return this.staticOptions;
	        case 'ParsleyForm':
	          return this.getFormOptions(parsleyInstance);
	        case 'ParsleyField':
	        case 'ParsleyFieldMultiple':
	          return this.getFieldOptions(parsleyInstance);
	        default:
	          throw new Error('Instance ' + parsleyInstance.__class__ + ' is not supported');
	      }
	    },
	    getFormOptions: function getFormOptions(formInstance) {
	      this.formOptions = ParsleyUtils.attr(formInstance.$element, this.staticOptions.namespace);
	      // not deep extend, since formOptions is a 1 level deep object
	      return $.extend({}, this.staticOptions, this.formOptions);
	    },
	    getFieldOptions: function getFieldOptions(fieldInstance) {
	      this.fieldOptions = ParsleyUtils.attr(fieldInstance.$element, this.staticOptions.namespace);
	      if (null === this.formOptions && 'undefined' !== typeof fieldInstance.parent) this.formOptions = this.getFormOptions(fieldInstance.parent);
	      // not deep extend, since formOptions and fieldOptions is a 1 level deep object
	      return $.extend({}, this.staticOptions, this.formOptions, this.fieldOptions);
	    }
	  };
	
	  var ParsleyForm = function ParsleyForm(element, OptionsFactory) {
	    this.__class__ = 'ParsleyForm';
	    this.__id__ = ParsleyUtils.hash(4);
	    if ('OptionsFactory' !== ParsleyUtils.get(OptionsFactory, '__class__')) throw new Error('You must give an OptionsFactory instance');
	    this.OptionsFactory = OptionsFactory;
	    this.$element = $(element);
	    this.validationResult = null;
	    this.options = this.OptionsFactory.get(this);
	  };
	  ParsleyForm.prototype = {
	    onSubmitValidate: function onSubmitValidate(event) {
	      this.validate(undefined, undefined, event);
	      // prevent form submission if validation fails
	      if (false === this.validationResult && event instanceof $.Event) {
	        event.stopImmediatePropagation();
	        event.preventDefault();
	      }
	      return this;
	    },
	    // @returns boolean
	    validate: function validate(group, force, event) {
	      this.submitEvent = event;
	      this.validationResult = true;
	      var fieldValidationResult = [];
	      $.emit('parsley:form:validate', this);
	      // Refresh form DOM options and form's fields that could have changed
	      this._refreshFields();
	      // loop through fields to validate them one by one
	      for (var i = 0; i < this.fields.length; i++) {
	        // do not validate a field if not the same as given validation group
	        if (group && !this._isFieldInGroup(this.fields[i], group)) continue;
	        fieldValidationResult = this.fields[i].validate(force);
	        if (true !== fieldValidationResult && fieldValidationResult.length > 0 && this.validationResult) this.validationResult = false;
	      }
	      $.emit('parsley:form:' + (this.validationResult ? 'success' : 'error'), this);
	      $.emit('parsley:form:validated', this);
	      return this.validationResult;
	    },
	    // Iterate over refreshed fields, and stop on first failure
	    isValid: function isValid(group, force) {
	      this._refreshFields();
	      for (var i = 0; i < this.fields.length; i++) {
	        // do not validate a field if not the same as given validation group
	        if (group && !this._isFieldInGroup(this.fields[i], group)) continue;
	        if (false === this.fields[i].isValid(force)) return false;
	      }
	      return true;
	    },
	    _isFieldInGroup: function _isFieldInGroup(field, group) {
	      if (ParsleyUtils.isArray(field.options.group)) return -1 !== $.inArray(group, field.options.group);
	      return field.options.group === group;
	    },
	    _refreshFields: function _refreshFields() {
	      return this.actualizeOptions()._bindFields();
	    },
	    _bindFields: function _bindFields() {
	      var self = this;
	      this.fields = [];
	      this.fieldsMappedById = {};
	      this.$element.find(this.options.inputs).each(function () {
	        var fieldInstance = new window.Parsley(this, {}, self);
	        // Only add valid and not excluded `ParsleyField` and `ParsleyFieldMultiple` children
	        if (('ParsleyField' === fieldInstance.__class__ || 'ParsleyFieldMultiple' === fieldInstance.__class__) && !fieldInstance.$element.is(fieldInstance.options.excluded)) if ('undefined' === typeof self.fieldsMappedById[fieldInstance.__class__ + '-' + fieldInstance.__id__]) {
	          self.fieldsMappedById[fieldInstance.__class__ + '-' + fieldInstance.__id__] = fieldInstance;
	          self.fields.push(fieldInstance);
	        }
	      });
	      return this;
	    }
	  };
	
	  var ConstraintFactory = function ConstraintFactory(parsleyField, name, requirements, priority, isDomConstraint) {
	    var assert = {};
	    if (!new RegExp('ParsleyField').test(ParsleyUtils.get(parsleyField, '__class__'))) throw new Error('ParsleyField or ParsleyFieldMultiple instance expected');
	    if ('function' === typeof window.ParsleyValidator.validators[name]) assert = window.ParsleyValidator.validators[name](requirements);
	    if ('Assert' !== assert.__parentClass__) throw new Error('Valid validator expected');
	    var getPriority = function getPriority() {
	      if ('undefined' !== typeof parsleyField.options[name + 'Priority']) return parsleyField.options[name + 'Priority'];
	      return ParsleyUtils.get(assert, 'priority') || 2;
	    };
	    priority = priority || getPriority();
	    // If validator have a requirementsTransformer, execute it
	    if ('function' === typeof assert.requirementsTransformer) {
	      requirements = assert.requirementsTransformer();
	      // rebuild assert with new requirements
	      assert = window.ParsleyValidator.validators[name](requirements);
	    }
	    return $.extend(assert, {
	      name: name,
	      requirements: requirements,
	      priority: priority,
	      groups: [priority],
	      isDomConstraint: isDomConstraint || ParsleyUtils.attr(parsleyField.$element, parsleyField.options.namespace, name)
	    });
	  };
	
	  var ParsleyField = function ParsleyField(field, OptionsFactory, parsleyFormInstance) {
	    this.__class__ = 'ParsleyField';
	    this.__id__ = ParsleyUtils.hash(4);
	    this.$element = $(field);
	    // If we have a parent `ParsleyForm` instance given, use its `OptionsFactory`, and save parent
	    if ('undefined' !== typeof parsleyFormInstance) {
	      this.parent = parsleyFormInstance;
	      this.OptionsFactory = this.parent.OptionsFactory;
	      this.options = this.OptionsFactory.get(this);
	      // Else, take the `Parsley` one
	    } else {
	        this.OptionsFactory = OptionsFactory;
	        this.options = this.OptionsFactory.get(this);
	      }
	    // Initialize some properties
	    this.constraints = [];
	    this.constraintsByName = {};
	    this.validationResult = [];
	    // Bind constraints
	    this._bindConstraints();
	  };
	  ParsleyField.prototype = {
	    // # Public API
	    // Validate field and $.emit some events for mainly `ParsleyUI`
	    // @returns validationResult:
	    //  - `true` if all constraints pass
	    //  - `[]` if not required field and empty (not validated)
	    //  - `[Violation, [Violation...]]` if there were validation errors
	    validate: function validate(force) {
	      this.value = this.getValue();
	      // Field Validate event. `this.value` could be altered for custom needs
	      $.emit('parsley:field:validate', this);
	      $.emit('parsley:field:' + (this.isValid(force, this.value) ? 'success' : 'error'), this);
	      // Field validated event. `this.validationResult` could be altered for custom needs too
	      $.emit('parsley:field:validated', this);
	      return this.validationResult;
	    },
	    // Just validate field. Do not trigger any event
	    // Same @return as `validate()`
	    isValid: function isValid(force, value) {
	      // Recompute options and rebind constraints to have latest changes
	      this.refreshConstraints();
	      // Sort priorities to validate more important first
	      var priorities = this._getConstraintsSortedPriorities();
	      if (0 === priorities.length) return this.validationResult = [];
	      // Value could be passed as argument, needed to add more power to 'parsley:field:validate'
	      if ('undefined' === typeof value || null === value) value = this.getValue();
	      // If a field is empty and not required, leave it alone, it's just fine
	      // Except if `data-parsley-validate-if-empty` explicitely added, useful for some custom validators
	      if (!value.length && !this._isRequired() && 'undefined' === typeof this.options.validateIfEmpty && true !== force) return this.validationResult = [];
	      // If we want to validate field against all constraints, just call Validator and let it do the job
	      if (false === this.options.priorityEnabled) return true === (this.validationResult = this.validateThroughValidator(value, this.constraints, 'Any'));
	      // Else, iterate over priorities one by one, and validate related asserts one by one
	      for (var i = 0; i < priorities.length; i++) if (true !== (this.validationResult = this.validateThroughValidator(value, this.constraints, priorities[i]))) return false;
	      return true;
	    },
	    // @returns Parsley field computed value that could be overrided or configured in DOM
	    getValue: function getValue() {
	      var value;
	      // Value could be overriden in DOM
	      if ('undefined' !== typeof this.options.value) value = this.options.value;else value = this.$element.val();
	      // Handle wrong DOM or configurations
	      if ('undefined' === typeof value || null === value) return '';
	      // Use `data-parsley-trim-value="true"` to auto trim inputs entry
	      if (true === this.options.trimValue) return value.replace(/^\s+|\s+$/g, '');
	      return value;
	    },
	    // Actualize options that could have change since previous validation
	    // Re-bind accordingly constraints (could be some new, removed or updated)
	    refreshConstraints: function refreshConstraints() {
	      return this.actualizeOptions()._bindConstraints();
	    },
	    /**
	    * Add a new constraint to a field
	    *
	    * @method addConstraint
	    * @param {String}   name
	    * @param {Mixed}    requirements      optional
	    * @param {Number}   priority          optional
	    * @param {Boolean}  isDomConstraint   optional
	    */
	    addConstraint: function addConstraint(name, requirements, priority, isDomConstraint) {
	      name = name.toLowerCase();
	      if ('function' === typeof window.ParsleyValidator.validators[name]) {
	        var constraint = new ConstraintFactory(this, name, requirements, priority, isDomConstraint);
	        // if constraint already exist, delete it and push new version
	        if ('undefined' !== this.constraintsByName[constraint.name]) this.removeConstraint(constraint.name);
	        this.constraints.push(constraint);
	        this.constraintsByName[constraint.name] = constraint;
	      }
	      return this;
	    },
	    // Remove a constraint
	    removeConstraint: function removeConstraint(name) {
	      for (var i = 0; i < this.constraints.length; i++) if (name === this.constraints[i].name) {
	        this.constraints.splice(i, 1);
	        break;
	      }
	      delete this.constraintsByName[name];
	      return this;
	    },
	    // Update a constraint (Remove + re-add)
	    updateConstraint: function updateConstraint(name, parameters, priority) {
	      return this.removeConstraint(name).addConstraint(name, parameters, priority);
	    },
	    // # Internals
	    // Internal only.
	    // Bind constraints from config + options + DOM
	    _bindConstraints: function _bindConstraints() {
	      var constraints = [],
	          constraintsByName = {};
	      // clean all existing DOM constraints to only keep javascript user constraints
	      for (var i = 0; i < this.constraints.length; i++) if (false === this.constraints[i].isDomConstraint) {
	        constraints.push(this.constraints[i]);
	        constraintsByName[this.constraints[i].name] = this.constraints[i];
	      }
	      this.constraints = constraints;
	      this.constraintsByName = constraintsByName;
	      // then re-add Parsley DOM-API constraints
	      for (var name in this.options) this.addConstraint(name, this.options[name]);
	      // finally, bind special HTML5 constraints
	      return this._bindHtml5Constraints();
	    },
	    // Internal only.
	    // Bind specific HTML5 constraints to be HTML5 compliant
	    _bindHtml5Constraints: function _bindHtml5Constraints() {
	      // html5 required
	      if (this.$element.hasClass('required') || this.$element.attr('required')) this.addConstraint('required', true, undefined, true);
	      // html5 pattern
	      if ('string' === typeof this.$element.attr('pattern')) this.addConstraint('pattern', this.$element.attr('pattern'), undefined, true);
	      // range
	      if ('undefined' !== typeof this.$element.attr('min') && 'undefined' !== typeof this.$element.attr('max')) this.addConstraint('range', [this.$element.attr('min'), this.$element.attr('max')], undefined, true);
	      // HTML5 min
	      else if ('undefined' !== typeof this.$element.attr('min')) this.addConstraint('min', this.$element.attr('min'), undefined, true);
	        // HTML5 max
	        else if ('undefined' !== typeof this.$element.attr('max')) this.addConstraint('max', this.$element.attr('max'), undefined, true);
	
	      // length
	      if ('undefined' !== typeof this.$element.attr('minlength') && 'undefined' !== typeof this.$element.attr('maxlength')) this.addConstraint('length', [this.$element.attr('minlength'), this.$element.attr('maxlength')], undefined, true);
	      // HTML5 minlength
	      else if ('undefined' !== typeof this.$element.attr('minlength')) this.addConstraint('minlength', this.$element.attr('minlength'), undefined, true);
	        // HTML5 maxlength
	        else if ('undefined' !== typeof this.$element.attr('maxlength')) this.addConstraint('maxlength', this.$element.attr('maxlength'), undefined, true);
	
	      // html5 types
	      var type = this.$element.attr('type');
	      if ('undefined' === typeof type) return this;
	      // Small special case here for HTML5 number: integer validator if step attribute is undefined or an integer value, number otherwise
	      if ('number' === type) {
	        if ('undefined' === typeof this.$element.attr('step') || 0 === parseFloat(this.$element.attr('step')) % 1) {
	          return this.addConstraint('type', 'integer', undefined, true);
	        } else {
	          return this.addConstraint('type', 'number', undefined, true);
	        }
	        // Regular other HTML5 supported types
	      } else if (new RegExp(type, 'i').test('email url range')) {
	          return this.addConstraint('type', type, undefined, true);
	        }
	      return this;
	    },
	    // Internal only.
	    // Field is required if have required constraint without `false` value
	    _isRequired: function _isRequired() {
	      if ('undefined' === typeof this.constraintsByName.required) return false;
	      return false !== this.constraintsByName.required.requirements;
	    },
	    // Internal only.
	    // Sort constraints by priority DESC
	    _getConstraintsSortedPriorities: function _getConstraintsSortedPriorities() {
	      var priorities = [];
	      // Create array unique of priorities
	      for (var i = 0; i < this.constraints.length; i++) if (-1 === priorities.indexOf(this.constraints[i].priority)) priorities.push(this.constraints[i].priority);
	      // Sort them by priority DESC
	      priorities.sort(function (a, b) {
	        return b - a;
	      });
	      return priorities;
	    }
	  };
	
	  var ParsleyMultiple = function ParsleyMultiple() {
	    this.__class__ = 'ParsleyFieldMultiple';
	  };
	  ParsleyMultiple.prototype = {
	    // Add new `$element` sibling for multiple field
	    addElement: function addElement($element) {
	      this.$elements.push($element);
	      return this;
	    },
	    // See `ParsleyField.refreshConstraints()`
	    refreshConstraints: function refreshConstraints() {
	      var fieldConstraints;
	      this.constraints = [];
	      // Select multiple special treatment
	      if (this.$element.is('select')) {
	        this.actualizeOptions()._bindConstraints();
	        return this;
	      }
	      // Gather all constraints for each input in the multiple group
	      for (var i = 0; i < this.$elements.length; i++) {
	        // Check if element have not been dynamically removed since last binding
	        if (!$('html').has(this.$elements[i]).length) {
	          this.$elements.splice(i, 1);
	          continue;
	        }
	        fieldConstraints = this.$elements[i].data('ParsleyFieldMultiple').refreshConstraints().constraints;
	        for (var j = 0; j < fieldConstraints.length; j++) this.addConstraint(fieldConstraints[j].name, fieldConstraints[j].requirements, fieldConstraints[j].priority, fieldConstraints[j].isDomConstraint);
	      }
	      return this;
	    },
	    // See `ParsleyField.getValue()`
	    getValue: function getValue() {
	      // Value could be overriden in DOM
	      if ('undefined' !== typeof this.options.value) return this.options.value;
	      // Radio input case
	      if (this.$element.is('input[type=radio]')) return $('[' + this.options.namespace + 'multiple="' + this.options.multiple + '"]:checked').val() || '';
	      // checkbox input case
	      if (this.$element.is('input[type=checkbox]')) {
	        var values = [];
	        $('[' + this.options.namespace + 'multiple="' + this.options.multiple + '"]:checked').each(function () {
	          values.push($(this).val());
	        });
	        return values.length ? values : [];
	      }
	      // Select multiple case
	      if (this.$element.is('select') && null === this.$element.val()) return [];
	      // Default case that should never happen
	      return this.$element.val();
	    },
	    _init: function _init(multiple) {
	      this.$elements = [this.$element];
	      this.options.multiple = multiple;
	      return this;
	    }
	  };
	
	  var o = $({}),
	      subscribed = {};
	  // $.listen(name, callback);
	  // $.listen(name, context, callback);
	  $.listen = function (name) {
	    if ('undefined' === typeof subscribed[name]) subscribed[name] = [];
	    if ('function' === typeof arguments[1]) return subscribed[name].push({ fn: arguments[1] });
	    if ('object' === typeof arguments[1] && 'function' === typeof arguments[2]) return subscribed[name].push({ fn: arguments[2], ctxt: arguments[1] });
	    throw new Error('Wrong parameters');
	  };
	  $.listenTo = function (instance, name, fn) {
	    if ('undefined' === typeof subscribed[name]) subscribed[name] = [];
	    if (!(instance instanceof ParsleyField) && !(instance instanceof ParsleyForm)) throw new Error('Must give Parsley instance');
	    if ('string' !== typeof name || 'function' !== typeof fn) throw new Error('Wrong parameters');
	    subscribed[name].push({ instance: instance, fn: fn });
	  };
	  $.unsubscribe = function (name, fn) {
	    if ('undefined' === typeof subscribed[name]) return;
	    if ('string' !== typeof name || 'function' !== typeof fn) throw new Error('Wrong arguments');
	    for (var i = 0; i < subscribed[name].length; i++) if (subscribed[name][i].fn === fn) return subscribed[name].splice(i, 1);
	  };
	  $.unsubscribeTo = function (instance, name) {
	    if ('undefined' === typeof subscribed[name]) return;
	    if (!(instance instanceof ParsleyField) && !(instance instanceof ParsleyForm)) throw new Error('Must give Parsley instance');
	    for (var i = 0; i < subscribed[name].length; i++) if ('undefined' !== typeof subscribed[name][i].instance && subscribed[name][i].instance.__id__ === instance.__id__) return subscribed[name].splice(i, 1);
	  };
	  $.unsubscribeAll = function (name) {
	    if ('undefined' === typeof subscribed[name]) return;
	    delete subscribed[name];
	  };
	  // $.emit(name [, arguments...]);
	  // $.emit(name, instance [, arguments...]);
	  $.emit = function (name, instance) {
	    if ('undefined' === typeof subscribed[name]) return;
	    // loop through registered callbacks for this event
	    for (var i = 0; i < subscribed[name].length; i++) {
	      // if instance is not registered, simple emit
	      if ('undefined' === typeof subscribed[name][i].instance) {
	        subscribed[name][i].fn.apply('undefined' !== typeof subscribed[name][i].ctxt ? subscribed[name][i].ctxt : o, Array.prototype.slice.call(arguments, 1));
	        continue;
	      }
	      // if instance registered but no instance given for the emit, continue
	      if (!(instance instanceof ParsleyField) && !(instance instanceof ParsleyForm)) continue;
	      // if instance is registered and same id, emit
	      if (subscribed[name][i].instance.__id__ === instance.__id__) {
	        subscribed[name][i].fn.apply(o, Array.prototype.slice.call(arguments, 1));
	        continue;
	      }
	      // if registered instance is a Form and fired one is a Field, loop over all its fields and emit if field found
	      if (subscribed[name][i].instance instanceof ParsleyForm && instance instanceof ParsleyField) for (var j = 0; j < subscribed[name][i].instance.fields.length; j++) if (subscribed[name][i].instance.fields[j].__id__ === instance.__id__) {
	        subscribed[name][i].fn.apply(o, Array.prototype.slice.call(arguments, 1));
	        continue;
	      }
	    }
	  };
	  $.subscribed = function () {
	    return subscribed;
	  };
	
	  // ParsleyConfig definition if not already set
	  window.ParsleyConfig = window.ParsleyConfig || {};
	  window.ParsleyConfig.i18n = window.ParsleyConfig.i18n || {};
	  // Define then the messages
	  window.ParsleyConfig.i18n.en = $.extend(window.ParsleyConfig.i18n.en || {}, {
	    defaultMessage: "This value seems to be invalid.",
	    type: {
	      email: "This value should be a valid email.",
	      url: "This value should be a valid url.",
	      number: "This value should be a valid number.",
	      integer: "This value should be a valid integer.",
	      digits: "This value should be digits.",
	      alphanum: "This value should be alphanumeric."
	    },
	    notblank: "This value should not be blank.",
	    required: "This value is required.",
	    pattern: "This value seems to be invalid.",
	    min: "This value should be greater than or equal to %s.",
	    max: "This value should be lower than or equal to %s.",
	    range: "This value should be between %s and %s.",
	    minlength: "This value is too short. It should have %s characters or more.",
	    maxlength: "This value is too long. It should have %s characters or fewer.",
	    length: "This value length is invalid. It should be between %s and %s characters long.",
	    mincheck: "You must select at least %s choices.",
	    maxcheck: "You must select %s choices or fewer.",
	    check: "You must select between %s and %s choices.",
	    equalto: "This value should be the same."
	  });
	  // If file is loaded after Parsley main file, auto-load locale
	  if ('undefined' !== typeof window.ParsleyValidator) window.ParsleyValidator.addCatalog('en', window.ParsleyConfig.i18n.en, true);
	
	  //     Parsley.js 2.0.6
	  //     http://parsleyjs.org
	  //     (c) 20012-2014 Guillaume Potier, Wisembly
	  //     Parsley may be freely distributed under the MIT license.
	
	  // ### Parsley factory
	  var Parsley = function Parsley(element, options, parsleyFormInstance) {
	    this.__class__ = 'Parsley';
	    this.__version__ = '2.0.6';
	    this.__id__ = ParsleyUtils.hash(4);
	    // Parsley must be instantiated with a DOM element or jQuery $element
	    if ('undefined' === typeof element) throw new Error('You must give an element');
	    if ('undefined' !== typeof parsleyFormInstance && 'ParsleyForm' !== parsleyFormInstance.__class__) throw new Error('Parent instance must be a ParsleyForm instance');
	    return this.init($(element), options, parsleyFormInstance);
	  };
	  Parsley.prototype = {
	    init: function init($element, options, parsleyFormInstance) {
	      if (!$element.length) throw new Error('You must bind Parsley on an existing element.');
	      this.$element = $element;
	      // If element have already been binded, returns its saved Parsley instance
	      if (this.$element.data('Parsley')) {
	        var savedparsleyFormInstance = this.$element.data('Parsley');
	        // If saved instance have been binded without a ParsleyForm parent and there is one given in this call, add it
	        if ('undefined' !== typeof parsleyFormInstance) savedparsleyFormInstance.parent = parsleyFormInstance;
	        return savedparsleyFormInstance;
	      }
	      // Handle 'static' options
	      this.OptionsFactory = new ParsleyOptionsFactory(ParsleyDefaults, ParsleyUtils.get(window, 'ParsleyConfig') || {}, options, this.getNamespace(options));
	      this.options = this.OptionsFactory.get(this);
	      // A ParsleyForm instance is obviously a `<form>` elem but also every node that is not an input and have `data-parsley-validate` attribute
	      if (this.$element.is('form') || ParsleyUtils.attr(this.$element, this.options.namespace, 'validate') && !this.$element.is(this.options.inputs)) return this.bind('parsleyForm');
	      // Every other supported element and not excluded element is binded as a `ParsleyField` or `ParsleyFieldMultiple`
	      else if (this.$element.is(this.options.inputs) && !this.$element.is(this.options.excluded)) return this.isMultiple() ? this.handleMultiple(parsleyFormInstance) : this.bind('parsleyField', parsleyFormInstance);
	      return this;
	    },
	    isMultiple: function isMultiple() {
	      return this.$element.is('input[type=radio], input[type=checkbox]') && 'undefined' === typeof this.options.multiple || this.$element.is('select') && 'undefined' !== typeof this.$element.attr('multiple');
	    },
	    // Multiples fields are a real nightmare :(
	    // Maybe some refacto would be appreciated here...
	    handleMultiple: function handleMultiple(parsleyFormInstance) {
	      var that = this,
	          name,
	          multiple,
	          parsleyMultipleInstance;
	      // Get parsleyFormInstance options if exist, mixed with element attributes
	      this.options = $.extend(this.options, parsleyFormInstance ? parsleyFormInstance.OptionsFactory.get(parsleyFormInstance) : {}, ParsleyUtils.attr(this.$element, this.options.namespace));
	      // Handle multiple name
	      if (this.options.multiple) multiple = this.options.multiple;else if ('undefined' !== typeof this.$element.attr('name') && this.$element.attr('name').length) multiple = name = this.$element.attr('name');else if ('undefined' !== typeof this.$element.attr('id') && this.$element.attr('id').length) multiple = this.$element.attr('id');
	      // Special select multiple input
	      if (this.$element.is('select') && 'undefined' !== typeof this.$element.attr('multiple')) {
	        return this.bind('parsleyFieldMultiple', parsleyFormInstance, multiple || this.__id__);
	        // Else for radio / checkboxes, we need a `name` or `data-parsley-multiple` to properly bind it
	      } else if ('undefined' === typeof multiple) {
	          if (window.console && window.console.warn) window.console.warn('To be binded by Parsley, a radio, a checkbox and a multiple select input must have either a name or a multiple option.', this.$element);
	          return this;
	        }
	      // Remove special chars
	      multiple = multiple.replace(/(:|\.|\[|\]|\{|\}|\$)/g, '');
	      // Add proper `data-parsley-multiple` to siblings if we have a valid multiple name
	      if ('undefined' !== typeof name) {
	        $('input[name="' + name + '"]').each(function () {
	          if ($(this).is('input[type=radio], input[type=checkbox]')) $(this).attr(that.options.namespace + 'multiple', multiple);
	        });
	      }
	      // Check here if we don't already have a related multiple instance saved
	      if ($('[' + this.options.namespace + 'multiple=' + multiple + ']').length) {
	        for (var i = 0; i < $('[' + this.options.namespace + 'multiple=' + multiple + ']').length; i++) {
	          if ('undefined' !== typeof $($('[' + this.options.namespace + 'multiple=' + multiple + ']').get(i)).data('Parsley')) {
	            parsleyMultipleInstance = $($('[' + this.options.namespace + 'multiple=' + multiple + ']').get(i)).data('Parsley');
	            if (!this.$element.data('ParsleyFieldMultiple')) {
	              parsleyMultipleInstance.addElement(this.$element);
	              this.$element.attr(this.options.namespace + 'id', parsleyMultipleInstance.__id__);
	            }
	            break;
	          }
	        }
	      }
	      // Create a secret ParsleyField instance for every multiple field. It would be stored in `data('ParsleyFieldMultiple')`
	      // And would be useful later to access classic `ParsleyField` stuff while being in a `ParsleyFieldMultiple` instance
	      this.bind('parsleyField', parsleyFormInstance, multiple, true);
	      return parsleyMultipleInstance || this.bind('parsleyFieldMultiple', parsleyFormInstance, multiple);
	    },
	    // Retrieve namespace used for DOM-API
	    getNamespace: function getNamespace(options) {
	      // `data-parsley-namespace=<namespace>`
	      if ('undefined' !== typeof this.$element.data('parsleyNamespace')) return this.$element.data('parsleyNamespace');
	      if ('undefined' !== typeof ParsleyUtils.get(options, 'namespace')) return options.namespace;
	      if ('undefined' !== typeof ParsleyUtils.get(window, 'ParsleyConfig.namespace')) return window.ParsleyConfig.namespace;
	      return ParsleyDefaults.namespace;
	    },
	    // Return proper `ParsleyForm`, `ParsleyField` or `ParsleyFieldMultiple`
	    bind: function bind(type, parentParsleyFormInstance, multiple, doNotStore) {
	      var parsleyInstance;
	      switch (type) {
	        case 'parsleyForm':
	          parsleyInstance = $.extend(new ParsleyForm(this.$element, this.OptionsFactory), new ParsleyAbstract(), window.ParsleyExtend)._bindFields();
	          break;
	        case 'parsleyField':
	          parsleyInstance = $.extend(new ParsleyField(this.$element, this.OptionsFactory, parentParsleyFormInstance), new ParsleyAbstract(), window.ParsleyExtend);
	          break;
	        case 'parsleyFieldMultiple':
	          parsleyInstance = $.extend(new ParsleyField(this.$element, this.OptionsFactory, parentParsleyFormInstance), new ParsleyAbstract(), new ParsleyMultiple(), window.ParsleyExtend)._init(multiple);
	          break;
	        default:
	          throw new Error(type + 'is not a supported Parsley type');
	      }
	      if ('undefined' !== typeof multiple) ParsleyUtils.setAttr(this.$element, this.options.namespace, 'multiple', multiple);
	      if ('undefined' !== typeof doNotStore) {
	        this.$element.data('ParsleyFieldMultiple', parsleyInstance);
	        return parsleyInstance;
	      }
	      // Store instance if `ParsleyForm`, `ParsleyField` or `ParsleyFieldMultiple`
	      if (new RegExp('ParsleyF', 'i').test(parsleyInstance.__class__)) {
	        // Store for later access the freshly binded instance in DOM element itself using jQuery `data()`
	        this.$element.data('Parsley', parsleyInstance);
	        // Tell the world we got a new ParsleyForm or ParsleyField instance!
	        $.emit('parsley:' + ('parsleyForm' === type ? 'form' : 'field') + ':init', parsleyInstance);
	      }
	      return parsleyInstance;
	    }
	  };
	  // ### jQuery API
	  // `$('.elem').parsley(options)` or `$('.elem').psly(options)`
	  $.fn.parsley = $.fn.psly = function (options) {
	    if (this.length > 1) {
	      var instances = [];
	      this.each(function () {
	        instances.push($(this).parsley(options));
	      });
	      return instances;
	    }
	    // Return undefined if applied to non existing DOM element
	    if (!$(this).length) {
	      if (window.console && window.console.warn) window.console.warn('You must bind Parsley on an existing element.');
	      return;
	    }
	    return new Parsley(this, options);
	  };
	  // ### ParsleyUI
	  // UI is a class apart that only listen to some events and them modify DOM accordingly
	  // Could be overriden by defining a `window.ParsleyConfig.ParsleyUI` appropriate class (with `listen()` method basically)
	  window.ParsleyUI = 'function' === typeof ParsleyUtils.get(window, 'ParsleyConfig.ParsleyUI') ? new window.ParsleyConfig.ParsleyUI().listen() : new ParsleyUI().listen();
	  // ### ParsleyField and ParsleyForm extension
	  // Ensure that defined if not already the case
	  if ('undefined' === typeof window.ParsleyExtend) window.ParsleyExtend = {};
	  // ### ParsleyConfig
	  // Ensure that defined if not already the case
	  if ('undefined' === typeof window.ParsleyConfig) window.ParsleyConfig = {};
	  // ### Globals
	  window.Parsley = window.psly = Parsley;
	  window.ParsleyUtils = ParsleyUtils;
	  window.ParsleyValidator = new ParsleyValidator(window.ParsleyConfig.validators, window.ParsleyConfig.i18n);
	  // ### PARSLEY auto-binding
	  // Prevent it by setting `ParsleyConfig.autoBind` to `false`
	  if (false !== ParsleyUtils.get(window, 'ParsleyConfig.autoBind')) $(function () {
	    // Works only on `data-parsley-validate`.
	    if ($('[data-parsley-validate]').length) $('[data-parsley-validate]').parsley();
	  });
	});

/***/ },

/***/ 136:
/***/ function(module, exports) {

	/*
	 * angular-ui-bootstrap
	 * http://angular-ui.github.io/bootstrap/
	
	 * Version: 0.12.1 - 2015-02-20
	 * License: MIT
	 */
	"use strict";
	
	angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.transition", "ui.bootstrap.collapse", "ui.bootstrap.accordion", "ui.bootstrap.alert", "ui.bootstrap.bindHtml", "ui.bootstrap.buttons", "ui.bootstrap.carousel", "ui.bootstrap.dateparser", "ui.bootstrap.position", "ui.bootstrap.datepicker", "ui.bootstrap.dropdown", "ui.bootstrap.modal", "ui.bootstrap.pagination", "ui.bootstrap.tooltip", "ui.bootstrap.popover", "ui.bootstrap.progressbar", "ui.bootstrap.rating", "ui.bootstrap.tabs", "ui.bootstrap.timepicker", "ui.bootstrap.typeahead"]), angular.module("ui.bootstrap.tpls", ["template/accordion/accordion-group.html", "template/accordion/accordion.html", "template/alert/alert.html", "template/carousel/carousel.html", "template/carousel/slide.html", "template/datepicker/datepicker.html", "template/datepicker/day.html", "template/datepicker/month.html", "template/datepicker/popup.html", "template/datepicker/year.html", "template/modal/backdrop.html", "template/modal/window.html", "template/pagination/pager.html", "template/pagination/pagination.html", "template/tooltip/tooltip-html-unsafe-popup.html", "template/tooltip/tooltip-popup.html", "template/popover/popover.html", "template/progressbar/bar.html", "template/progressbar/progress.html", "template/progressbar/progressbar.html", "template/rating/rating.html", "template/tabs/tab.html", "template/tabs/tabset.html", "template/timepicker/timepicker.html", "template/typeahead/typeahead-match.html", "template/typeahead/typeahead-popup.html"]), angular.module("ui.bootstrap.transition", []).factory("$transition", ["$q", "$timeout", "$rootScope", function (a, b, c) {
	  function d(a) {
	    for (var b in a) if (void 0 !== f.style[b]) return a[b];
	  }var e = function e(d, f, g) {
	    g = g || {};var h = a.defer(),
	        i = e[g.animation ? "animationEndEventName" : "transitionEndEventName"],
	        j = function j() {
	      c.$apply(function () {
	        d.unbind(i, j), h.resolve(d);
	      });
	    };return i && d.bind(i, j), b(function () {
	      angular.isString(f) ? d.addClass(f) : angular.isFunction(f) ? f(d) : angular.isObject(f) && d.css(f), i || h.resolve(d);
	    }), h.promise.cancel = function () {
	      i && d.unbind(i, j), h.reject("Transition cancelled");
	    }, h.promise;
	  },
	      f = document.createElement("trans"),
	      g = { WebkitTransition: "webkitTransitionEnd", MozTransition: "transitionend", OTransition: "oTransitionEnd", transition: "transitionend" },
	      h = { WebkitTransition: "webkitAnimationEnd", MozTransition: "animationend", OTransition: "oAnimationEnd", transition: "animationend" };return e.transitionEndEventName = d(g), e.animationEndEventName = d(h), e;
	}]), angular.module("ui.bootstrap.collapse", ["ui.bootstrap.transition"]).directive("collapse", ["$transition", function (a) {
	  return { link: function link(b, c, d) {
	      function e(b) {
	        function d() {
	          j === e && (j = void 0);
	        }var e = a(c, b);return j && j.cancel(), j = e, e.then(d, d), e;
	      }function f() {
	        k ? (k = !1, g()) : (c.removeClass("collapse").addClass("collapsing"), e({ height: c[0].scrollHeight + "px" }).then(g));
	      }function g() {
	        c.removeClass("collapsing"), c.addClass("collapse in"), c.css({ height: "auto" });
	      }function h() {
	        if (k) k = !1, i(), c.css({ height: 0 });else {
	          c.css({ height: c[0].scrollHeight + "px" });{
	            c[0].offsetWidth;
	          }c.removeClass("collapse in").addClass("collapsing"), e({ height: 0 }).then(i);
	        }
	      }function i() {
	        c.removeClass("collapsing"), c.addClass("collapse");
	      }var j,
	          k = !0;b.$watch(d.collapse, function (a) {
	        a ? h() : f();
	      });
	    } };
	}]), angular.module("ui.bootstrap.accordion", ["ui.bootstrap.collapse"]).constant("accordionConfig", { closeOthers: !0 }).controller("AccordionController", ["$scope", "$attrs", "accordionConfig", function (a, b, c) {
	  this.groups = [], this.closeOthers = function (d) {
	    var e = angular.isDefined(b.closeOthers) ? a.$eval(b.closeOthers) : c.closeOthers;e && angular.forEach(this.groups, function (a) {
	      a !== d && (a.isOpen = !1);
	    });
	  }, this.addGroup = function (a) {
	    var b = this;this.groups.push(a), a.$on("$destroy", function () {
	      b.removeGroup(a);
	    });
	  }, this.removeGroup = function (a) {
	    var b = this.groups.indexOf(a);-1 !== b && this.groups.splice(b, 1);
	  };
	}]).directive("accordion", function () {
	  return { restrict: "EA", controller: "AccordionController", transclude: !0, replace: !1, templateUrl: "template/accordion/accordion.html" };
	}).directive("accordionGroup", function () {
	  return { require: "^accordion", restrict: "EA", transclude: !0, replace: !0, templateUrl: "template/accordion/accordion-group.html", scope: { heading: "@", isOpen: "=?", isDisabled: "=?" }, controller: function controller() {
	      this.setHeading = function (a) {
	        this.heading = a;
	      };
	    }, link: function link(a, b, c, d) {
	      d.addGroup(a), a.$watch("isOpen", function (b) {
	        b && d.closeOthers(a);
	      }), a.toggleOpen = function () {
	        a.isDisabled || (a.isOpen = !a.isOpen);
	      };
	    } };
	}).directive("accordionHeading", function () {
	  return { restrict: "EA", transclude: !0, template: "", replace: !0, require: "^accordionGroup", link: function link(a, b, c, d, e) {
	      d.setHeading(e(a, function () {}));
	    } };
	}).directive("accordionTransclude", function () {
	  return { require: "^accordionGroup", link: function link(a, b, c, d) {
	      a.$watch(function () {
	        return d[c.accordionTransclude];
	      }, function (a) {
	        a && (b.html(""), b.append(a));
	      });
	    } };
	}), angular.module("ui.bootstrap.alert", []).controller("AlertController", ["$scope", "$attrs", function (a, b) {
	  a.closeable = "close" in b, this.close = a.close;
	}]).directive("alert", function () {
	  return { restrict: "EA", controller: "AlertController", templateUrl: "template/alert/alert.html", transclude: !0, replace: !0, scope: { type: "@", close: "&" } };
	}).directive("dismissOnTimeout", ["$timeout", function (a) {
	  return { require: "alert", link: function link(b, c, d, e) {
	      a(function () {
	        e.close();
	      }, parseInt(d.dismissOnTimeout, 10));
	    } };
	}]), angular.module("ui.bootstrap.bindHtml", []).directive("bindHtmlUnsafe", function () {
	  return function (a, b, c) {
	    b.addClass("ng-binding").data("$binding", c.bindHtmlUnsafe), a.$watch(c.bindHtmlUnsafe, function (a) {
	      b.html(a || "");
	    });
	  };
	}), angular.module("ui.bootstrap.buttons", []).constant("buttonConfig", { activeClass: "active", toggleEvent: "click" }).controller("ButtonsController", ["buttonConfig", function (a) {
	  this.activeClass = a.activeClass || "active", this.toggleEvent = a.toggleEvent || "click";
	}]).directive("btnRadio", function () {
	  return { require: ["btnRadio", "ngModel"], controller: "ButtonsController", link: function link(a, b, c, d) {
	      var e = d[0],
	          f = d[1];f.$render = function () {
	        b.toggleClass(e.activeClass, angular.equals(f.$modelValue, a.$eval(c.btnRadio)));
	      }, b.bind(e.toggleEvent, function () {
	        var d = b.hasClass(e.activeClass);(!d || angular.isDefined(c.uncheckable)) && a.$apply(function () {
	          f.$setViewValue(d ? null : a.$eval(c.btnRadio)), f.$render();
	        });
	      });
	    } };
	}).directive("btnCheckbox", function () {
	  return { require: ["btnCheckbox", "ngModel"], controller: "ButtonsController", link: function link(a, b, c, d) {
	      function e() {
	        return g(c.btnCheckboxTrue, !0);
	      }function f() {
	        return g(c.btnCheckboxFalse, !1);
	      }function g(b, c) {
	        var d = a.$eval(b);return angular.isDefined(d) ? d : c;
	      }var h = d[0],
	          i = d[1];i.$render = function () {
	        b.toggleClass(h.activeClass, angular.equals(i.$modelValue, e()));
	      }, b.bind(h.toggleEvent, function () {
	        a.$apply(function () {
	          i.$setViewValue(b.hasClass(h.activeClass) ? f() : e()), i.$render();
	        });
	      });
	    } };
	}), angular.module("ui.bootstrap.carousel", ["ui.bootstrap.transition"]).controller("CarouselController", ["$scope", "$timeout", "$interval", "$transition", function (a, b, c, d) {
	  function e() {
	    f();var b = +a.interval;!isNaN(b) && b > 0 && (h = c(g, b));
	  }function f() {
	    h && (c.cancel(h), h = null);
	  }function g() {
	    var b = +a.interval;i && !isNaN(b) && b > 0 ? a.next() : a.pause();
	  }var h,
	      i,
	      j = this,
	      k = j.slides = a.slides = [],
	      l = -1;j.currentSlide = null;var m = !1;j.select = a.select = function (c, f) {
	    function g() {
	      if (!m) {
	        if (j.currentSlide && angular.isString(f) && !a.noTransition && c.$element) {
	          c.$element.addClass(f);{
	            c.$element[0].offsetWidth;
	          }angular.forEach(k, function (a) {
	            angular.extend(a, { direction: "", entering: !1, leaving: !1, active: !1 });
	          }), angular.extend(c, { direction: f, active: !0, entering: !0 }), angular.extend(j.currentSlide || {}, { direction: f, leaving: !0 }), a.$currentTransition = d(c.$element, {}), (function (b, c) {
	            a.$currentTransition.then(function () {
	              h(b, c);
	            }, function () {
	              h(b, c);
	            });
	          })(c, j.currentSlide);
	        } else h(c, j.currentSlide);j.currentSlide = c, l = i, e();
	      }
	    }function h(b, c) {
	      angular.extend(b, { direction: "", active: !0, leaving: !1, entering: !1 }), angular.extend(c || {}, { direction: "", active: !1, leaving: !1, entering: !1 }), a.$currentTransition = null;
	    }var i = k.indexOf(c);void 0 === f && (f = i > l ? "next" : "prev"), c && c !== j.currentSlide && (a.$currentTransition ? (a.$currentTransition.cancel(), b(g)) : g());
	  }, a.$on("$destroy", function () {
	    m = !0;
	  }), j.indexOfSlide = function (a) {
	    return k.indexOf(a);
	  }, a.next = function () {
	    var b = (l + 1) % k.length;return a.$currentTransition ? void 0 : j.select(k[b], "next");
	  }, a.prev = function () {
	    var b = 0 > l - 1 ? k.length - 1 : l - 1;return a.$currentTransition ? void 0 : j.select(k[b], "prev");
	  }, a.isActive = function (a) {
	    return j.currentSlide === a;
	  }, a.$watch("interval", e), a.$on("$destroy", f), a.play = function () {
	    i || (i = !0, e());
	  }, a.pause = function () {
	    a.noPause || (i = !1, f());
	  }, j.addSlide = function (b, c) {
	    b.$element = c, k.push(b), 1 === k.length || b.active ? (j.select(k[k.length - 1]), 1 == k.length && a.play()) : b.active = !1;
	  }, j.removeSlide = function (a) {
	    var b = k.indexOf(a);k.splice(b, 1), k.length > 0 && a.active ? j.select(b >= k.length ? k[b - 1] : k[b]) : l > b && l--;
	  };
	}]).directive("carousel", [function () {
	  return { restrict: "EA", transclude: !0, replace: !0, controller: "CarouselController", require: "carousel", templateUrl: "template/carousel/carousel.html", scope: { interval: "=", noTransition: "=", noPause: "=" } };
	}]).directive("slide", function () {
	  return { require: "^carousel", restrict: "EA", transclude: !0, replace: !0, templateUrl: "template/carousel/slide.html", scope: { active: "=?" }, link: function link(a, b, c, d) {
	      d.addSlide(a, b), a.$on("$destroy", function () {
	        d.removeSlide(a);
	      }), a.$watch("active", function (b) {
	        b && d.select(a);
	      });
	    } };
	}), angular.module("ui.bootstrap.dateparser", []).service("dateParser", ["$locale", "orderByFilter", function (a, b) {
	  function c(a) {
	    var c = [],
	        d = a.split("");return angular.forEach(e, function (b, e) {
	      var f = a.indexOf(e);if (f > -1) {
	        a = a.split(""), d[f] = "(" + b.regex + ")", a[f] = "$";for (var g = f + 1, h = f + e.length; h > g; g++) d[g] = "", a[g] = "$";a = a.join(""), c.push({ index: f, apply: b.apply });
	      }
	    }), { regex: new RegExp("^" + d.join("") + "$"), map: b(c, "index") };
	  }function d(a, b, c) {
	    return 1 === b && c > 28 ? 29 === c && (a % 4 === 0 && a % 100 !== 0 || a % 400 === 0) : 3 === b || 5 === b || 8 === b || 10 === b ? 31 > c : !0;
	  }this.parsers = {};var e = { yyyy: { regex: "\\d{4}", apply: function apply(a) {
	        this.year = +a;
	      } }, yy: { regex: "\\d{2}", apply: function apply(a) {
	        this.year = +a + 2e3;
	      } }, y: { regex: "\\d{1,4}", apply: function apply(a) {
	        this.year = +a;
	      } }, MMMM: { regex: a.DATETIME_FORMATS.MONTH.join("|"), apply: function apply(b) {
	        this.month = a.DATETIME_FORMATS.MONTH.indexOf(b);
	      } }, MMM: { regex: a.DATETIME_FORMATS.SHORTMONTH.join("|"), apply: function apply(b) {
	        this.month = a.DATETIME_FORMATS.SHORTMONTH.indexOf(b);
	      } }, MM: { regex: "0[1-9]|1[0-2]", apply: function apply(a) {
	        this.month = a - 1;
	      } }, M: { regex: "[1-9]|1[0-2]", apply: function apply(a) {
	        this.month = a - 1;
	      } }, dd: { regex: "[0-2][0-9]{1}|3[0-1]{1}", apply: function apply(a) {
	        this.date = +a;
	      } }, d: { regex: "[1-2]?[0-9]{1}|3[0-1]{1}", apply: function apply(a) {
	        this.date = +a;
	      } }, EEEE: { regex: a.DATETIME_FORMATS.DAY.join("|") }, EEE: { regex: a.DATETIME_FORMATS.SHORTDAY.join("|") } };this.parse = function (b, e) {
	    if (!angular.isString(b) || !e) return b;e = a.DATETIME_FORMATS[e] || e, this.parsers[e] || (this.parsers[e] = c(e));var f = this.parsers[e],
	        g = f.regex,
	        h = f.map,
	        i = b.match(g);if (i && i.length) {
	      for (var j, k = { year: 1900, month: 0, date: 1, hours: 0 }, l = 1, m = i.length; m > l; l++) {
	        var n = h[l - 1];n.apply && n.apply.call(k, i[l]);
	      }return d(k.year, k.month, k.date) && (j = new Date(k.year, k.month, k.date, k.hours)), j;
	    }
	  };
	}]), angular.module("ui.bootstrap.position", []).factory("$position", ["$document", "$window", function (a, b) {
	  function c(a, c) {
	    return a.currentStyle ? a.currentStyle[c] : b.getComputedStyle ? b.getComputedStyle(a)[c] : a.style[c];
	  }function d(a) {
	    return "static" === (c(a, "position") || "static");
	  }var e = function e(b) {
	    for (var c = a[0], e = b.offsetParent || c; e && e !== c && d(e);) e = e.offsetParent;return e || c;
	  };return { position: function position(b) {
	      var c = this.offset(b),
	          d = { top: 0, left: 0 },
	          f = e(b[0]);f != a[0] && (d = this.offset(angular.element(f)), d.top += f.clientTop - f.scrollTop, d.left += f.clientLeft - f.scrollLeft);var g = b[0].getBoundingClientRect();return { width: g.width || b.prop("offsetWidth"), height: g.height || b.prop("offsetHeight"), top: c.top - d.top, left: c.left - d.left };
	    }, offset: function offset(c) {
	      var d = c[0].getBoundingClientRect();return { width: d.width || c.prop("offsetWidth"), height: d.height || c.prop("offsetHeight"), top: d.top + (b.pageYOffset || a[0].documentElement.scrollTop), left: d.left + (b.pageXOffset || a[0].documentElement.scrollLeft) };
	    }, positionElements: function positionElements(a, b, c, d) {
	      var e,
	          f,
	          g,
	          h,
	          i = c.split("-"),
	          j = i[0],
	          k = i[1] || "center";e = d ? this.offset(a) : this.position(a), f = b.prop("offsetWidth"), g = b.prop("offsetHeight");var l = { center: function center() {
	          return e.left + e.width / 2 - f / 2;
	        }, left: function left() {
	          return e.left;
	        }, right: function right() {
	          return e.left + e.width;
	        } },
	          m = { center: function center() {
	          return e.top + e.height / 2 - g / 2;
	        }, top: function top() {
	          return e.top;
	        }, bottom: function bottom() {
	          return e.top + e.height;
	        } };switch (j) {case "right":
	          h = { top: m[k](), left: l[j]() };break;case "left":
	          h = { top: m[k](), left: e.left - f };break;case "bottom":
	          h = { top: m[j](), left: l[k]() };break;default:
	          h = { top: e.top - g, left: l[k]() };}return h;
	    } };
	}]), angular.module("ui.bootstrap.datepicker", ["ui.bootstrap.dateparser", "ui.bootstrap.position"]).constant("datepickerConfig", { formatDay: "dd", formatMonth: "MMMM", formatYear: "yyyy", formatDayHeader: "EEE", formatDayTitle: "MMMM yyyy", formatMonthTitle: "yyyy", datepickerMode: "day", minMode: "day", maxMode: "year", showWeeks: !0, startingDay: 0, yearRange: 20, minDate: null, maxDate: null }).controller("DatepickerController", ["$scope", "$attrs", "$parse", "$interpolate", "$timeout", "$log", "dateFilter", "datepickerConfig", function (a, b, c, d, e, f, g, h) {
	  var i = this,
	      j = { $setViewValue: angular.noop };this.modes = ["day", "month", "year"], angular.forEach(["formatDay", "formatMonth", "formatYear", "formatDayHeader", "formatDayTitle", "formatMonthTitle", "minMode", "maxMode", "showWeeks", "startingDay", "yearRange"], function (c, e) {
	    i[c] = angular.isDefined(b[c]) ? 8 > e ? d(b[c])(a.$parent) : a.$parent.$eval(b[c]) : h[c];
	  }), angular.forEach(["minDate", "maxDate"], function (d) {
	    b[d] ? a.$parent.$watch(c(b[d]), function (a) {
	      i[d] = a ? new Date(a) : null, i.refreshView();
	    }) : i[d] = h[d] ? new Date(h[d]) : null;
	  }), a.datepickerMode = a.datepickerMode || h.datepickerMode, a.uniqueId = "datepicker-" + a.$id + "-" + Math.floor(1e4 * Math.random()), this.activeDate = angular.isDefined(b.initDate) ? a.$parent.$eval(b.initDate) : new Date(), a.isActive = function (b) {
	    return 0 === i.compare(b.date, i.activeDate) ? (a.activeDateId = b.uid, !0) : !1;
	  }, this.init = function (a) {
	    j = a, j.$render = function () {
	      i.render();
	    };
	  }, this.render = function () {
	    if (j.$modelValue) {
	      var a = new Date(j.$modelValue),
	          b = !isNaN(a);b ? this.activeDate = a : f.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.'), j.$setValidity("date", b);
	    }this.refreshView();
	  }, this.refreshView = function () {
	    if (this.element) {
	      this._refreshView();var a = j.$modelValue ? new Date(j.$modelValue) : null;j.$setValidity("date-disabled", !a || this.element && !this.isDisabled(a));
	    }
	  }, this.createDateObject = function (a, b) {
	    var c = j.$modelValue ? new Date(j.$modelValue) : null;return { date: a, label: g(a, b), selected: c && 0 === this.compare(a, c), disabled: this.isDisabled(a), current: 0 === this.compare(a, new Date()) };
	  }, this.isDisabled = function (c) {
	    return this.minDate && this.compare(c, this.minDate) < 0 || this.maxDate && this.compare(c, this.maxDate) > 0 || b.dateDisabled && a.dateDisabled({ date: c, mode: a.datepickerMode });
	  }, this.split = function (a, b) {
	    for (var c = []; a.length > 0;) c.push(a.splice(0, b));return c;
	  }, a.select = function (b) {
	    if (a.datepickerMode === i.minMode) {
	      var c = j.$modelValue ? new Date(j.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);c.setFullYear(b.getFullYear(), b.getMonth(), b.getDate()), j.$setViewValue(c), j.$render();
	    } else i.activeDate = b, a.datepickerMode = i.modes[i.modes.indexOf(a.datepickerMode) - 1];
	  }, a.move = function (a) {
	    var b = i.activeDate.getFullYear() + a * (i.step.years || 0),
	        c = i.activeDate.getMonth() + a * (i.step.months || 0);i.activeDate.setFullYear(b, c, 1), i.refreshView();
	  }, a.toggleMode = function (b) {
	    b = b || 1, a.datepickerMode === i.maxMode && 1 === b || a.datepickerMode === i.minMode && -1 === b || (a.datepickerMode = i.modes[i.modes.indexOf(a.datepickerMode) + b]);
	  }, a.keys = { 13: "enter", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home", 37: "left", 38: "up", 39: "right", 40: "down" };var k = function k() {
	    e(function () {
	      i.element[0].focus();
	    }, 0, !1);
	  };a.$on("datepicker.focus", k), a.keydown = function (b) {
	    var c = a.keys[b.which];if (c && !b.shiftKey && !b.altKey) if ((b.preventDefault(), b.stopPropagation(), "enter" === c || "space" === c)) {
	      if (i.isDisabled(i.activeDate)) return;a.select(i.activeDate), k();
	    } else !b.ctrlKey || "up" !== c && "down" !== c ? (i.handleKeyDown(c, b), i.refreshView()) : (a.toggleMode("up" === c ? 1 : -1), k());
	  };
	}]).directive("datepicker", function () {
	  return { restrict: "EA", replace: !0, templateUrl: "template/datepicker/datepicker.html", scope: { datepickerMode: "=?", dateDisabled: "&" }, require: ["datepicker", "?^ngModel"], controller: "DatepickerController", link: function link(a, b, c, d) {
	      var e = d[0],
	          f = d[1];f && e.init(f);
	    } };
	}).directive("daypicker", ["dateFilter", function (a) {
	  return { restrict: "EA", replace: !0, templateUrl: "template/datepicker/day.html", require: "^datepicker", link: function link(b, c, d, e) {
	      function f(a, b) {
	        return 1 !== b || a % 4 !== 0 || a % 100 === 0 && a % 400 !== 0 ? i[b] : 29;
	      }function g(a, b) {
	        var c = new Array(b),
	            d = new Date(a),
	            e = 0;for (d.setHours(12); b > e;) c[e++] = new Date(d), d.setDate(d.getDate() + 1);return c;
	      }function h(a) {
	        var b = new Date(a);b.setDate(b.getDate() + 4 - (b.getDay() || 7));var c = b.getTime();return b.setMonth(0), b.setDate(1), Math.floor(Math.round((c - b) / 864e5) / 7) + 1;
	      }b.showWeeks = e.showWeeks, e.step = { months: 1 }, e.element = c;var i = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];e._refreshView = function () {
	        var c = e.activeDate.getFullYear(),
	            d = e.activeDate.getMonth(),
	            f = new Date(c, d, 1),
	            i = e.startingDay - f.getDay(),
	            j = i > 0 ? 7 - i : -i,
	            k = new Date(f);j > 0 && k.setDate(-j + 1);for (var l = g(k, 42), m = 0; 42 > m; m++) l[m] = angular.extend(e.createDateObject(l[m], e.formatDay), { secondary: l[m].getMonth() !== d, uid: b.uniqueId + "-" + m });b.labels = new Array(7);for (var n = 0; 7 > n; n++) b.labels[n] = { abbr: a(l[n].date, e.formatDayHeader), full: a(l[n].date, "EEEE") };if ((b.title = a(e.activeDate, e.formatDayTitle), b.rows = e.split(l, 7), b.showWeeks)) {
	          b.weekNumbers = [];for (var o = h(b.rows[0][0].date), p = b.rows.length; b.weekNumbers.push(o++) < p;);
	        }
	      }, e.compare = function (a, b) {
	        return new Date(a.getFullYear(), a.getMonth(), a.getDate()) - new Date(b.getFullYear(), b.getMonth(), b.getDate());
	      }, e.handleKeyDown = function (a) {
	        var b = e.activeDate.getDate();if ("left" === a) b -= 1;else if ("up" === a) b -= 7;else if ("right" === a) b += 1;else if ("down" === a) b += 7;else if ("pageup" === a || "pagedown" === a) {
	          var c = e.activeDate.getMonth() + ("pageup" === a ? -1 : 1);e.activeDate.setMonth(c, 1), b = Math.min(f(e.activeDate.getFullYear(), e.activeDate.getMonth()), b);
	        } else "home" === a ? b = 1 : "end" === a && (b = f(e.activeDate.getFullYear(), e.activeDate.getMonth()));e.activeDate.setDate(b);
	      }, e.refreshView();
	    } };
	}]).directive("monthpicker", ["dateFilter", function (a) {
	  return { restrict: "EA", replace: !0, templateUrl: "template/datepicker/month.html", require: "^datepicker", link: function link(b, c, d, e) {
	      e.step = { years: 1 }, e.element = c, e._refreshView = function () {
	        for (var c = new Array(12), d = e.activeDate.getFullYear(), f = 0; 12 > f; f++) c[f] = angular.extend(e.createDateObject(new Date(d, f, 1), e.formatMonth), { uid: b.uniqueId + "-" + f });b.title = a(e.activeDate, e.formatMonthTitle), b.rows = e.split(c, 3);
	      }, e.compare = function (a, b) {
	        return new Date(a.getFullYear(), a.getMonth()) - new Date(b.getFullYear(), b.getMonth());
	      }, e.handleKeyDown = function (a) {
	        var b = e.activeDate.getMonth();if ("left" === a) b -= 1;else if ("up" === a) b -= 3;else if ("right" === a) b += 1;else if ("down" === a) b += 3;else if ("pageup" === a || "pagedown" === a) {
	          var c = e.activeDate.getFullYear() + ("pageup" === a ? -1 : 1);e.activeDate.setFullYear(c);
	        } else "home" === a ? b = 0 : "end" === a && (b = 11);e.activeDate.setMonth(b);
	      }, e.refreshView();
	    } };
	}]).directive("yearpicker", ["dateFilter", function () {
	  return { restrict: "EA", replace: !0, templateUrl: "template/datepicker/year.html", require: "^datepicker", link: function link(a, b, c, d) {
	      function e(a) {
	        return parseInt((a - 1) / f, 10) * f + 1;
	      }var f = d.yearRange;d.step = { years: f }, d.element = b, d._refreshView = function () {
	        for (var b = new Array(f), c = 0, g = e(d.activeDate.getFullYear()); f > c; c++) b[c] = angular.extend(d.createDateObject(new Date(g + c, 0, 1), d.formatYear), { uid: a.uniqueId + "-" + c });a.title = [b[0].label, b[f - 1].label].join(" - "), a.rows = d.split(b, 5);
	      }, d.compare = function (a, b) {
	        return a.getFullYear() - b.getFullYear();
	      }, d.handleKeyDown = function (a) {
	        var b = d.activeDate.getFullYear();"left" === a ? b -= 1 : "up" === a ? b -= 5 : "right" === a ? b += 1 : "down" === a ? b += 5 : "pageup" === a || "pagedown" === a ? b += ("pageup" === a ? -1 : 1) * d.step.years : "home" === a ? b = e(d.activeDate.getFullYear()) : "end" === a && (b = e(d.activeDate.getFullYear()) + f - 1), d.activeDate.setFullYear(b);
	      }, d.refreshView();
	    } };
	}]).constant("datepickerPopupConfig", { datepickerPopup: "yyyy-MM-dd", currentText: "Today", clearText: "Clear", closeText: "Done", closeOnDateSelection: !0, appendToBody: !1, showButtonBar: !0 }).directive("datepickerPopup", ["$compile", "$parse", "$document", "$position", "dateFilter", "dateParser", "datepickerPopupConfig", function (a, b, c, d, e, f, g) {
	  return { restrict: "EA", require: "ngModel", scope: { isOpen: "=?", currentText: "@", clearText: "@", closeText: "@", dateDisabled: "&" }, link: function link(h, i, j, k) {
	      function l(a) {
	        return a.replace(/([A-Z])/g, function (a) {
	          return "-" + a.toLowerCase();
	        });
	      }function m(a) {
	        if (a) {
	          if (angular.isDate(a) && !isNaN(a)) return k.$setValidity("date", !0), a;if (angular.isString(a)) {
	            var b = f.parse(a, n) || new Date(a);return isNaN(b) ? void k.$setValidity("date", !1) : (k.$setValidity("date", !0), b);
	          }return void k.$setValidity("date", !1);
	        }return k.$setValidity("date", !0), null;
	      }var n,
	          o = angular.isDefined(j.closeOnDateSelection) ? h.$parent.$eval(j.closeOnDateSelection) : g.closeOnDateSelection,
	          p = angular.isDefined(j.datepickerAppendToBody) ? h.$parent.$eval(j.datepickerAppendToBody) : g.appendToBody;h.showButtonBar = angular.isDefined(j.showButtonBar) ? h.$parent.$eval(j.showButtonBar) : g.showButtonBar, h.getText = function (a) {
	        return h[a + "Text"] || g[a + "Text"];
	      }, j.$observe("datepickerPopup", function (a) {
	        n = a || g.datepickerPopup, k.$render();
	      });var q = angular.element("<div datepicker-popup-wrap><div datepicker></div></div>");q.attr({ "ng-model": "date", "ng-change": "dateSelection()" });var r = angular.element(q.children()[0]);j.datepickerOptions && angular.forEach(h.$parent.$eval(j.datepickerOptions), function (a, b) {
	        r.attr(l(b), a);
	      }), h.watchData = {}, angular.forEach(["minDate", "maxDate", "datepickerMode"], function (a) {
	        if (j[a]) {
	          var c = b(j[a]);if ((h.$parent.$watch(c, function (b) {
	            h.watchData[a] = b;
	          }), r.attr(l(a), "watchData." + a), "datepickerMode" === a)) {
	            var d = c.assign;h.$watch("watchData." + a, function (a, b) {
	              a !== b && d(h.$parent, a);
	            });
	          }
	        }
	      }), j.dateDisabled && r.attr("date-disabled", "dateDisabled({ date: date, mode: mode })"), k.$parsers.unshift(m), h.dateSelection = function (a) {
	        angular.isDefined(a) && (h.date = a), k.$setViewValue(h.date), k.$render(), o && (h.isOpen = !1, i[0].focus());
	      }, i.bind("input change keyup", function () {
	        h.$apply(function () {
	          h.date = k.$modelValue;
	        });
	      }), k.$render = function () {
	        var a = k.$viewValue ? e(k.$viewValue, n) : "";i.val(a), h.date = m(k.$modelValue);
	      };var s = function s(a) {
	        h.isOpen && a.target !== i[0] && h.$apply(function () {
	          h.isOpen = !1;
	        });
	      },
	          t = function t(a) {
	        h.keydown(a);
	      };i.bind("keydown", t), h.keydown = function (a) {
	        27 === a.which ? (a.preventDefault(), a.stopPropagation(), h.close()) : 40 !== a.which || h.isOpen || (h.isOpen = !0);
	      }, h.$watch("isOpen", function (a) {
	        a ? (h.$broadcast("datepicker.focus"), h.position = p ? d.offset(i) : d.position(i), h.position.top = h.position.top + i.prop("offsetHeight"), c.bind("click", s)) : c.unbind("click", s);
	      }), h.select = function (a) {
	        if ("today" === a) {
	          var b = new Date();angular.isDate(k.$modelValue) ? (a = new Date(k.$modelValue), a.setFullYear(b.getFullYear(), b.getMonth(), b.getDate())) : a = new Date(b.setHours(0, 0, 0, 0));
	        }h.dateSelection(a);
	      }, h.close = function () {
	        h.isOpen = !1, i[0].focus();
	      };var u = a(q)(h);q.remove(), p ? c.find("body").append(u) : i.after(u), h.$on("$destroy", function () {
	        u.remove(), i.unbind("keydown", t), c.unbind("click", s);
	      });
	    } };
	}]).directive("datepickerPopupWrap", function () {
	  return { restrict: "EA", replace: !0, transclude: !0, templateUrl: "template/datepicker/popup.html", link: function link(a, b) {
	      b.bind("click", function (a) {
	        a.preventDefault(), a.stopPropagation();
	      });
	    } };
	}), angular.module("ui.bootstrap.dropdown", []).constant("dropdownConfig", { openClass: "open" }).service("dropdownService", ["$document", function (a) {
	  var b = null;this.open = function (e) {
	    b || (a.bind("click", c), a.bind("keydown", d)), b && b !== e && (b.isOpen = !1), b = e;
	  }, this.close = function (e) {
	    b === e && (b = null, a.unbind("click", c), a.unbind("keydown", d));
	  };var c = function c(a) {
	    if (b) {
	      var c = b.getToggleElement();a && c && c[0].contains(a.target) || b.$apply(function () {
	        b.isOpen = !1;
	      });
	    }
	  },
	      d = function d(a) {
	    27 === a.which && (b.focusToggleElement(), c());
	  };
	}]).controller("DropdownController", ["$scope", "$attrs", "$parse", "dropdownConfig", "dropdownService", "$animate", function (a, b, c, d, e, f) {
	  var g,
	      h = this,
	      i = a.$new(),
	      j = d.openClass,
	      k = angular.noop,
	      l = b.onToggle ? c(b.onToggle) : angular.noop;this.init = function (d) {
	    h.$element = d, b.isOpen && (g = c(b.isOpen), k = g.assign, a.$watch(g, function (a) {
	      i.isOpen = !!a;
	    }));
	  }, this.toggle = function (a) {
	    return i.isOpen = arguments.length ? !!a : !i.isOpen;
	  }, this.isOpen = function () {
	    return i.isOpen;
	  }, i.getToggleElement = function () {
	    return h.toggleElement;
	  }, i.focusToggleElement = function () {
	    h.toggleElement && h.toggleElement[0].focus();
	  }, i.$watch("isOpen", function (b, c) {
	    f[b ? "addClass" : "removeClass"](h.$element, j), b ? (i.focusToggleElement(), e.open(i)) : e.close(i), k(a, b), angular.isDefined(b) && b !== c && l(a, { open: !!b });
	  }), a.$on("$locationChangeSuccess", function () {
	    i.isOpen = !1;
	  }), a.$on("$destroy", function () {
	    i.$destroy();
	  });
	}]).directive("dropdown", function () {
	  return { controller: "DropdownController", link: function link(a, b, c, d) {
	      d.init(b);
	    } };
	}).directive("dropdownToggle", function () {
	  return { require: "?^dropdown", link: function link(a, b, c, d) {
	      if (d) {
	        d.toggleElement = b;var e = function e(_e) {
	          _e.preventDefault(), b.hasClass("disabled") || c.disabled || a.$apply(function () {
	            d.toggle();
	          });
	        };b.bind("click", e), b.attr({ "aria-haspopup": !0, "aria-expanded": !1 }), a.$watch(d.isOpen, function (a) {
	          b.attr("aria-expanded", !!a);
	        }), a.$on("$destroy", function () {
	          b.unbind("click", e);
	        });
	      }
	    } };
	}), angular.module("ui.bootstrap.modal", ["ui.bootstrap.transition"]).factory("$$stackedMap", function () {
	  return { createNew: function createNew() {
	      var a = [];return { add: function add(b, c) {
	          a.push({ key: b, value: c });
	        }, get: function get(b) {
	          for (var c = 0; c < a.length; c++) if (b == a[c].key) return a[c];
	        }, keys: function keys() {
	          for (var b = [], c = 0; c < a.length; c++) b.push(a[c].key);return b;
	        }, top: function top() {
	          return a[a.length - 1];
	        }, remove: function remove(b) {
	          for (var c = -1, d = 0; d < a.length; d++) if (b == a[d].key) {
	            c = d;break;
	          }return a.splice(c, 1)[0];
	        }, removeTop: function removeTop() {
	          return a.splice(a.length - 1, 1)[0];
	        }, length: function length() {
	          return a.length;
	        } };
	    } };
	}).directive("modalBackdrop", ["$timeout", function (a) {
	  return { restrict: "EA", replace: !0, templateUrl: "template/modal/backdrop.html", link: function link(b, c, d) {
	      b.backdropClass = d.backdropClass || "", b.animate = !1, a(function () {
	        b.animate = !0;
	      });
	    } };
	}]).directive("modalWindow", ["$modalStack", "$timeout", function (a, b) {
	  return { restrict: "EA", scope: { index: "@", animate: "=" }, replace: !0, transclude: !0, templateUrl: function templateUrl(a, b) {
	      return b.templateUrl || "template/modal/window.html";
	    }, link: function link(c, d, e) {
	      d.addClass(e.windowClass || ""), c.size = e.size, b(function () {
	        c.animate = !0, d[0].querySelectorAll("[autofocus]").length || d[0].focus();
	      }), c.close = function (b) {
	        var c = a.getTop();c && c.value.backdrop && "static" != c.value.backdrop && b.target === b.currentTarget && (b.preventDefault(), b.stopPropagation(), a.dismiss(c.key, "backdrop click"));
	      };
	    } };
	}]).directive("modalTransclude", function () {
	  return { link: function link(a, b, c, d, e) {
	      e(a.$parent, function (a) {
	        b.empty(), b.append(a);
	      });
	    } };
	}).factory("$modalStack", ["$transition", "$timeout", "$document", "$compile", "$rootScope", "$$stackedMap", function (a, b, c, d, e, f) {
	  function g() {
	    for (var a = -1, b = n.keys(), c = 0; c < b.length; c++) n.get(b[c]).value.backdrop && (a = c);return a;
	  }function h(a) {
	    var b = c.find("body").eq(0),
	        d = n.get(a).value;n.remove(a), j(d.modalDomEl, d.modalScope, 300, function () {
	      d.modalScope.$destroy(), b.toggleClass(m, n.length() > 0), i();
	    });
	  }function i() {
	    if (k && -1 == g()) {
	      var a = l;j(k, l, 150, function () {
	        a.$destroy(), a = null;
	      }), k = void 0, l = void 0;
	    }
	  }function j(c, d, e, f) {
	    function g() {
	      g.done || (g.done = !0, c.remove(), f && f());
	    }d.animate = !1;var h = a.transitionEndEventName;if (h) {
	      var i = b(g, e);c.bind(h, function () {
	        b.cancel(i), g(), d.$apply();
	      });
	    } else b(g);
	  }var k,
	      l,
	      m = "modal-open",
	      n = f.createNew(),
	      o = {};return e.$watch(g, function (a) {
	    l && (l.index = a);
	  }), c.bind("keydown", function (a) {
	    var b;27 === a.which && (b = n.top(), b && b.value.keyboard && (a.preventDefault(), e.$apply(function () {
	      o.dismiss(b.key, "escape key press");
	    })));
	  }), o.open = function (a, b) {
	    n.add(a, { deferred: b.deferred, modalScope: b.scope, backdrop: b.backdrop, keyboard: b.keyboard });var f = c.find("body").eq(0),
	        h = g();if (h >= 0 && !k) {
	      l = e.$new(!0), l.index = h;var i = angular.element("<div modal-backdrop></div>");i.attr("backdrop-class", b.backdropClass), k = d(i)(l), f.append(k);
	    }var j = angular.element("<div modal-window></div>");j.attr({ "template-url": b.windowTemplateUrl, "window-class": b.windowClass, size: b.size, index: n.length() - 1, animate: "animate" }).html(b.content);var o = d(j)(b.scope);n.top().value.modalDomEl = o, f.append(o), f.addClass(m);
	  }, o.close = function (a, b) {
	    var c = n.get(a);c && (c.value.deferred.resolve(b), h(a));
	  }, o.dismiss = function (a, b) {
	    var c = n.get(a);c && (c.value.deferred.reject(b), h(a));
	  }, o.dismissAll = function (a) {
	    for (var b = this.getTop(); b;) this.dismiss(b.key, a), b = this.getTop();
	  }, o.getTop = function () {
	    return n.top();
	  }, o;
	}]).provider("$modal", function () {
	  var a = { options: { backdrop: !0, keyboard: !0 }, $get: ["$injector", "$rootScope", "$q", "$http", "$templateCache", "$controller", "$modalStack", function (b, c, d, e, f, g, h) {
	      function i(a) {
	        return a.template ? d.when(a.template) : e.get(angular.isFunction(a.templateUrl) ? a.templateUrl() : a.templateUrl, { cache: f }).then(function (a) {
	          return a.data;
	        });
	      }function j(a) {
	        var c = [];return angular.forEach(a, function (a) {
	          (angular.isFunction(a) || angular.isArray(a)) && c.push(d.when(b.invoke(a)));
	        }), c;
	      }var k = {};return k.open = function (b) {
	        var e = d.defer(),
	            f = d.defer(),
	            k = { result: e.promise, opened: f.promise, close: function close(a) {
	            h.close(k, a);
	          }, dismiss: function dismiss(a) {
	            h.dismiss(k, a);
	          } };if ((b = angular.extend({}, a.options, b), b.resolve = b.resolve || {}, !b.template && !b.templateUrl)) throw new Error("One of template or templateUrl options is required.");var l = d.all([i(b)].concat(j(b.resolve)));return l.then(function (a) {
	          var d = (b.scope || c).$new();d.$close = k.close, d.$dismiss = k.dismiss;var f,
	              i = {},
	              j = 1;b.controller && (i.$scope = d, i.$modalInstance = k, angular.forEach(b.resolve, function (b, c) {
	            i[c] = a[j++];
	          }), f = g(b.controller, i), b.controllerAs && (d[b.controllerAs] = f)), h.open(k, { scope: d, deferred: e, content: a[0], backdrop: b.backdrop, keyboard: b.keyboard, backdropClass: b.backdropClass, windowClass: b.windowClass, windowTemplateUrl: b.windowTemplateUrl, size: b.size });
	        }, function (a) {
	          e.reject(a);
	        }), l.then(function () {
	          f.resolve(!0);
	        }, function () {
	          f.reject(!1);
	        }), k;
	      }, k;
	    }] };return a;
	}), angular.module("ui.bootstrap.pagination", []).controller("PaginationController", ["$scope", "$attrs", "$parse", function (a, b, c) {
	  var d = this,
	      e = { $setViewValue: angular.noop },
	      f = b.numPages ? c(b.numPages).assign : angular.noop;this.init = function (f, g) {
	    e = f, this.config = g, e.$render = function () {
	      d.render();
	    }, b.itemsPerPage ? a.$parent.$watch(c(b.itemsPerPage), function (b) {
	      d.itemsPerPage = parseInt(b, 10), a.totalPages = d.calculateTotalPages();
	    }) : this.itemsPerPage = g.itemsPerPage;
	  }, this.calculateTotalPages = function () {
	    var b = this.itemsPerPage < 1 ? 1 : Math.ceil(a.totalItems / this.itemsPerPage);return Math.max(b || 0, 1);
	  }, this.render = function () {
	    a.page = parseInt(e.$viewValue, 10) || 1;
	  }, a.selectPage = function (b) {
	    a.page !== b && b > 0 && b <= a.totalPages && (e.$setViewValue(b), e.$render());
	  }, a.getText = function (b) {
	    return a[b + "Text"] || d.config[b + "Text"];
	  }, a.noPrevious = function () {
	    return 1 === a.page;
	  }, a.noNext = function () {
	    return a.page === a.totalPages;
	  }, a.$watch("totalItems", function () {
	    a.totalPages = d.calculateTotalPages();
	  }), a.$watch("totalPages", function (b) {
	    f(a.$parent, b), a.page > b ? a.selectPage(b) : e.$render();
	  });
	}]).constant("paginationConfig", { itemsPerPage: 10, boundaryLinks: !1, directionLinks: !0, firstText: "First", previousText: "Previous", nextText: "Next", lastText: "Last", rotate: !0 }).directive("pagination", ["$parse", "paginationConfig", function (a, b) {
	  return { restrict: "EA", scope: { totalItems: "=", firstText: "@", previousText: "@", nextText: "@", lastText: "@" }, require: ["pagination", "?ngModel"], controller: "PaginationController", templateUrl: "template/pagination/pagination.html", replace: !0, link: function link(c, d, e, f) {
	      function g(a, b, c) {
	        return { number: a, text: b, active: c };
	      }function h(a, b) {
	        var c = [],
	            d = 1,
	            e = b,
	            f = angular.isDefined(k) && b > k;f && (l ? (d = Math.max(a - Math.floor(k / 2), 1), e = d + k - 1, e > b && (e = b, d = e - k + 1)) : (d = (Math.ceil(a / k) - 1) * k + 1, e = Math.min(d + k - 1, b)));for (var h = d; e >= h; h++) {
	          var i = g(h, h, h === a);c.push(i);
	        }if (f && !l) {
	          if (d > 1) {
	            var j = g(d - 1, "...", !1);c.unshift(j);
	          }if (b > e) {
	            var m = g(e + 1, "...", !1);c.push(m);
	          }
	        }return c;
	      }var i = f[0],
	          j = f[1];if (j) {
	        var k = angular.isDefined(e.maxSize) ? c.$parent.$eval(e.maxSize) : b.maxSize,
	            l = angular.isDefined(e.rotate) ? c.$parent.$eval(e.rotate) : b.rotate;c.boundaryLinks = angular.isDefined(e.boundaryLinks) ? c.$parent.$eval(e.boundaryLinks) : b.boundaryLinks, c.directionLinks = angular.isDefined(e.directionLinks) ? c.$parent.$eval(e.directionLinks) : b.directionLinks, i.init(j, b), e.maxSize && c.$parent.$watch(a(e.maxSize), function (a) {
	          k = parseInt(a, 10), i.render();
	        });var m = i.render;i.render = function () {
	          m(), c.page > 0 && c.page <= c.totalPages && (c.pages = h(c.page, c.totalPages));
	        };
	      }
	    } };
	}]).constant("pagerConfig", { itemsPerPage: 10, previousText: "« Previous", nextText: "Next »", align: !0 }).directive("pager", ["pagerConfig", function (a) {
	  return { restrict: "EA", scope: { totalItems: "=", previousText: "@", nextText: "@" }, require: ["pager", "?ngModel"], controller: "PaginationController", templateUrl: "template/pagination/pager.html", replace: !0, link: function link(b, c, d, e) {
	      var f = e[0],
	          g = e[1];g && (b.align = angular.isDefined(d.align) ? b.$parent.$eval(d.align) : a.align, f.init(g, a));
	    } };
	}]), angular.module("ui.bootstrap.tooltip", ["ui.bootstrap.position", "ui.bootstrap.bindHtml"]).provider("$tooltip", function () {
	  function a(a) {
	    var b = /[A-Z]/g,
	        c = "-";return a.replace(b, function (a, b) {
	      return (b ? c : "") + a.toLowerCase();
	    });
	  }var b = { placement: "top", animation: !0, popupDelay: 0 },
	      c = { mouseenter: "mouseleave", click: "click", focus: "blur" },
	      d = {};this.options = function (a) {
	    angular.extend(d, a);
	  }, this.setTriggers = function (a) {
	    angular.extend(c, a);
	  }, this.$get = ["$window", "$compile", "$timeout", "$document", "$position", "$interpolate", function (e, f, g, h, i, j) {
	    return function (e, k, l) {
	      function m(a) {
	        var b = a || n.trigger || l,
	            d = c[b] || b;return { show: b, hide: d };
	      }var n = angular.extend({}, b, d),
	          o = a(e),
	          p = j.startSymbol(),
	          q = j.endSymbol(),
	          r = "<div " + o + '-popup title="' + p + "title" + q + '" content="' + p + "content" + q + '" placement="' + p + "placement" + q + '" animation="animation" is-open="isOpen"></div>';return { restrict: "EA", compile: function compile() {
	          var a = f(r);return function (b, c, d) {
	            function f() {
	              D.isOpen ? l() : j();
	            }function j() {
	              (!C || b.$eval(d[k + "Enable"])) && (s(), D.popupDelay ? z || (z = g(o, D.popupDelay, !1), z.then(function (a) {
	                a();
	              })) : o()());
	            }function l() {
	              b.$apply(function () {
	                p();
	              });
	            }function o() {
	              return z = null, y && (g.cancel(y), y = null), D.content ? (q(), w.css({ top: 0, left: 0, display: "block" }), D.$digest(), E(), D.isOpen = !0, D.$digest(), E) : angular.noop;
	            }function p() {
	              D.isOpen = !1, g.cancel(z), z = null, D.animation ? y || (y = g(r, 500)) : r();
	            }function q() {
	              w && r(), x = D.$new(), w = a(x, function (a) {
	                A ? h.find("body").append(a) : c.after(a);
	              });
	            }function r() {
	              y = null, w && (w.remove(), w = null), x && (x.$destroy(), x = null);
	            }function s() {
	              t(), u();
	            }function t() {
	              var a = d[k + "Placement"];D.placement = angular.isDefined(a) ? a : n.placement;
	            }function u() {
	              var a = d[k + "PopupDelay"],
	                  b = parseInt(a, 10);D.popupDelay = isNaN(b) ? n.popupDelay : b;
	            }function v() {
	              var a = d[k + "Trigger"];F(), B = m(a), B.show === B.hide ? c.bind(B.show, f) : (c.bind(B.show, j), c.bind(B.hide, l));
	            }var w,
	                x,
	                y,
	                z,
	                A = angular.isDefined(n.appendToBody) ? n.appendToBody : !1,
	                B = m(void 0),
	                C = angular.isDefined(d[k + "Enable"]),
	                D = b.$new(!0),
	                E = function E() {
	              var a = i.positionElements(c, w, D.placement, A);a.top += "px", a.left += "px", w.css(a);
	            };D.isOpen = !1, d.$observe(e, function (a) {
	              D.content = a, !a && D.isOpen && p();
	            }), d.$observe(k + "Title", function (a) {
	              D.title = a;
	            });var F = function F() {
	              c.unbind(B.show, j), c.unbind(B.hide, l);
	            };v();var G = b.$eval(d[k + "Animation"]);D.animation = angular.isDefined(G) ? !!G : n.animation;var H = b.$eval(d[k + "AppendToBody"]);A = angular.isDefined(H) ? H : A, A && b.$on("$locationChangeSuccess", function () {
	              D.isOpen && p();
	            }), b.$on("$destroy", function () {
	              g.cancel(y), g.cancel(z), F(), r(), D = null;
	            });
	          };
	        } };
	    };
	  }];
	}).directive("tooltipPopup", function () {
	  return { restrict: "EA", replace: !0, scope: { content: "@", placement: "@", animation: "&", isOpen: "&" }, templateUrl: "template/tooltip/tooltip-popup.html" };
	}).directive("tooltip", ["$tooltip", function (a) {
	  return a("tooltip", "tooltip", "mouseenter");
	}]).directive("tooltipHtmlUnsafePopup", function () {
	  return { restrict: "EA", replace: !0, scope: { content: "@", placement: "@", animation: "&", isOpen: "&" }, templateUrl: "template/tooltip/tooltip-html-unsafe-popup.html" };
	}).directive("tooltipHtmlUnsafe", ["$tooltip", function (a) {
	  return a("tooltipHtmlUnsafe", "tooltip", "mouseenter");
	}]), angular.module("ui.bootstrap.popover", ["ui.bootstrap.tooltip"]).directive("popoverPopup", function () {
	  return { restrict: "EA", replace: !0, scope: { title: "@", content: "@", placement: "@", animation: "&", isOpen: "&" }, templateUrl: "template/popover/popover.html" };
	}).directive("popover", ["$tooltip", function (a) {
	  return a("popover", "popover", "click");
	}]), angular.module("ui.bootstrap.progressbar", []).constant("progressConfig", { animate: !0, max: 100 }).controller("ProgressController", ["$scope", "$attrs", "progressConfig", function (a, b, c) {
	  var d = this,
	      e = angular.isDefined(b.animate) ? a.$parent.$eval(b.animate) : c.animate;this.bars = [], a.max = angular.isDefined(b.max) ? a.$parent.$eval(b.max) : c.max, this.addBar = function (b, c) {
	    e || c.css({ transition: "none" }), this.bars.push(b), b.$watch("value", function (c) {
	      b.percent = +(100 * c / a.max).toFixed(2);
	    }), b.$on("$destroy", function () {
	      c = null, d.removeBar(b);
	    });
	  }, this.removeBar = function (a) {
	    this.bars.splice(this.bars.indexOf(a), 1);
	  };
	}]).directive("progress", function () {
	  return { restrict: "EA", replace: !0, transclude: !0, controller: "ProgressController", require: "progress", scope: {}, templateUrl: "template/progressbar/progress.html" };
	}).directive("bar", function () {
	  return { restrict: "EA", replace: !0, transclude: !0, require: "^progress", scope: { value: "=", type: "@" }, templateUrl: "template/progressbar/bar.html", link: function link(a, b, c, d) {
	      d.addBar(a, b);
	    } };
	}).directive("progressbar", function () {
	  return { restrict: "EA", replace: !0, transclude: !0, controller: "ProgressController", scope: { value: "=", type: "@" }, templateUrl: "template/progressbar/progressbar.html", link: function link(a, b, c, d) {
	      d.addBar(a, angular.element(b.children()[0]));
	    } };
	}), angular.module("ui.bootstrap.rating", []).constant("ratingConfig", { max: 5, stateOn: null, stateOff: null }).controller("RatingController", ["$scope", "$attrs", "ratingConfig", function (a, b, c) {
	  var d = { $setViewValue: angular.noop };this.init = function (e) {
	    d = e, d.$render = this.render, this.stateOn = angular.isDefined(b.stateOn) ? a.$parent.$eval(b.stateOn) : c.stateOn, this.stateOff = angular.isDefined(b.stateOff) ? a.$parent.$eval(b.stateOff) : c.stateOff;var f = angular.isDefined(b.ratingStates) ? a.$parent.$eval(b.ratingStates) : new Array(angular.isDefined(b.max) ? a.$parent.$eval(b.max) : c.max);a.range = this.buildTemplateObjects(f);
	  }, this.buildTemplateObjects = function (a) {
	    for (var b = 0, c = a.length; c > b; b++) a[b] = angular.extend({ index: b }, { stateOn: this.stateOn, stateOff: this.stateOff }, a[b]);return a;
	  }, a.rate = function (b) {
	    !a.readonly && b >= 0 && b <= a.range.length && (d.$setViewValue(b), d.$render());
	  }, a.enter = function (b) {
	    a.readonly || (a.value = b), a.onHover({ value: b });
	  }, a.reset = function () {
	    a.value = d.$viewValue, a.onLeave();
	  }, a.onKeydown = function (b) {
	    /(37|38|39|40)/.test(b.which) && (b.preventDefault(), b.stopPropagation(), a.rate(a.value + (38 === b.which || 39 === b.which ? 1 : -1)));
	  }, this.render = function () {
	    a.value = d.$viewValue;
	  };
	}]).directive("rating", function () {
	  return { restrict: "EA", require: ["rating", "ngModel"], scope: { readonly: "=?", onHover: "&", onLeave: "&" }, controller: "RatingController", templateUrl: "template/rating/rating.html", replace: !0, link: function link(a, b, c, d) {
	      var e = d[0],
	          f = d[1];f && e.init(f);
	    } };
	}), angular.module("ui.bootstrap.tabs", []).controller("TabsetController", ["$scope", function (a) {
	  var b = this,
	      c = b.tabs = a.tabs = [];b.select = function (a) {
	    angular.forEach(c, function (b) {
	      b.active && b !== a && (b.active = !1, b.onDeselect());
	    }), a.active = !0, a.onSelect();
	  }, b.addTab = function (a) {
	    c.push(a), 1 === c.length ? a.active = !0 : a.active && b.select(a);
	  }, b.removeTab = function (a) {
	    var e = c.indexOf(a);if (a.active && c.length > 1 && !d) {
	      var f = e == c.length - 1 ? e - 1 : e + 1;b.select(c[f]);
	    }c.splice(e, 1);
	  };var d;a.$on("$destroy", function () {
	    d = !0;
	  });
	}]).directive("tabset", function () {
	  return { restrict: "EA", transclude: !0, replace: !0, scope: { type: "@" }, controller: "TabsetController", templateUrl: "template/tabs/tabset.html", link: function link(a, b, c) {
	      a.vertical = angular.isDefined(c.vertical) ? a.$parent.$eval(c.vertical) : !1, a.justified = angular.isDefined(c.justified) ? a.$parent.$eval(c.justified) : !1;
	    } };
	}).directive("tab", ["$parse", function (a) {
	  return { require: "^tabset", restrict: "EA", replace: !0, templateUrl: "template/tabs/tab.html", transclude: !0, scope: { active: "=?", heading: "@", onSelect: "&select", onDeselect: "&deselect" }, controller: function controller() {}, compile: function compile(b, c, d) {
	      return function (b, c, e, f) {
	        b.$watch("active", function (a) {
	          a && f.select(b);
	        }), b.disabled = !1, e.disabled && b.$parent.$watch(a(e.disabled), function (a) {
	          b.disabled = !!a;
	        }), b.select = function () {
	          b.disabled || (b.active = !0);
	        }, f.addTab(b), b.$on("$destroy", function () {
	          f.removeTab(b);
	        }), b.$transcludeFn = d;
	      };
	    } };
	}]).directive("tabHeadingTransclude", [function () {
	  return { restrict: "A", require: "^tab", link: function link(a, b) {
	      a.$watch("headingElement", function (a) {
	        a && (b.html(""), b.append(a));
	      });
	    } };
	}]).directive("tabContentTransclude", function () {
	  function a(a) {
	    return a.tagName && (a.hasAttribute("tab-heading") || a.hasAttribute("data-tab-heading") || "tab-heading" === a.tagName.toLowerCase() || "data-tab-heading" === a.tagName.toLowerCase());
	  }return { restrict: "A", require: "^tabset", link: function link(b, c, d) {
	      var e = b.$eval(d.tabContentTransclude);e.$transcludeFn(e.$parent, function (b) {
	        angular.forEach(b, function (b) {
	          a(b) ? e.headingElement = b : c.append(b);
	        });
	      });
	    } };
	}), angular.module("ui.bootstrap.timepicker", []).constant("timepickerConfig", { hourStep: 1, minuteStep: 1, showMeridian: !0, meridians: null, readonlyInput: !1, mousewheel: !0 }).controller("TimepickerController", ["$scope", "$attrs", "$parse", "$log", "$locale", "timepickerConfig", function (a, b, c, d, e, f) {
	  function g() {
	    var b = parseInt(a.hours, 10),
	        c = a.showMeridian ? b > 0 && 13 > b : b >= 0 && 24 > b;return c ? (a.showMeridian && (12 === b && (b = 0), a.meridian === p[1] && (b += 12)), b) : void 0;
	  }function h() {
	    var b = parseInt(a.minutes, 10);return b >= 0 && 60 > b ? b : void 0;
	  }function i(a) {
	    return angular.isDefined(a) && a.toString().length < 2 ? "0" + a : a;
	  }function j(a) {
	    k(), o.$setViewValue(new Date(n)), l(a);
	  }function k() {
	    o.$setValidity("time", !0), a.invalidHours = !1, a.invalidMinutes = !1;
	  }function l(b) {
	    var c = n.getHours(),
	        d = n.getMinutes();a.showMeridian && (c = 0 === c || 12 === c ? 12 : c % 12), a.hours = "h" === b ? c : i(c), a.minutes = "m" === b ? d : i(d), a.meridian = n.getHours() < 12 ? p[0] : p[1];
	  }function m(a) {
	    var b = new Date(n.getTime() + 6e4 * a);n.setHours(b.getHours(), b.getMinutes()), j();
	  }var n = new Date(),
	      o = { $setViewValue: angular.noop },
	      p = angular.isDefined(b.meridians) ? a.$parent.$eval(b.meridians) : f.meridians || e.DATETIME_FORMATS.AMPMS;this.init = function (c, d) {
	    o = c, o.$render = this.render;var e = d.eq(0),
	        g = d.eq(1),
	        h = angular.isDefined(b.mousewheel) ? a.$parent.$eval(b.mousewheel) : f.mousewheel;h && this.setupMousewheelEvents(e, g), a.readonlyInput = angular.isDefined(b.readonlyInput) ? a.$parent.$eval(b.readonlyInput) : f.readonlyInput, this.setupInputEvents(e, g);
	  };var q = f.hourStep;b.hourStep && a.$parent.$watch(c(b.hourStep), function (a) {
	    q = parseInt(a, 10);
	  });var r = f.minuteStep;b.minuteStep && a.$parent.$watch(c(b.minuteStep), function (a) {
	    r = parseInt(a, 10);
	  }), a.showMeridian = f.showMeridian, b.showMeridian && a.$parent.$watch(c(b.showMeridian), function (b) {
	    if ((a.showMeridian = !!b, o.$error.time)) {
	      var c = g(),
	          d = h();angular.isDefined(c) && angular.isDefined(d) && (n.setHours(c), j());
	    } else l();
	  }), this.setupMousewheelEvents = function (b, c) {
	    var d = function d(a) {
	      a.originalEvent && (a = a.originalEvent);var b = a.wheelDelta ? a.wheelDelta : -a.deltaY;return a.detail || b > 0;
	    };b.bind("mousewheel wheel", function (b) {
	      a.$apply(d(b) ? a.incrementHours() : a.decrementHours()), b.preventDefault();
	    }), c.bind("mousewheel wheel", function (b) {
	      a.$apply(d(b) ? a.incrementMinutes() : a.decrementMinutes()), b.preventDefault();
	    });
	  }, this.setupInputEvents = function (b, c) {
	    if (a.readonlyInput) return a.updateHours = angular.noop, void (a.updateMinutes = angular.noop);var d = function d(b, c) {
	      o.$setViewValue(null), o.$setValidity("time", !1), angular.isDefined(b) && (a.invalidHours = b), angular.isDefined(c) && (a.invalidMinutes = c);
	    };a.updateHours = function () {
	      var a = g();angular.isDefined(a) ? (n.setHours(a), j("h")) : d(!0);
	    }, b.bind("blur", function () {
	      !a.invalidHours && a.hours < 10 && a.$apply(function () {
	        a.hours = i(a.hours);
	      });
	    }), a.updateMinutes = function () {
	      var a = h();angular.isDefined(a) ? (n.setMinutes(a), j("m")) : d(void 0, !0);
	    }, c.bind("blur", function () {
	      !a.invalidMinutes && a.minutes < 10 && a.$apply(function () {
	        a.minutes = i(a.minutes);
	      });
	    });
	  }, this.render = function () {
	    var a = o.$modelValue ? new Date(o.$modelValue) : null;isNaN(a) ? (o.$setValidity("time", !1), d.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.')) : (a && (n = a), k(), l());
	  }, a.incrementHours = function () {
	    m(60 * q);
	  }, a.decrementHours = function () {
	    m(60 * -q);
	  }, a.incrementMinutes = function () {
	    m(r);
	  }, a.decrementMinutes = function () {
	    m(-r);
	  }, a.toggleMeridian = function () {
	    m(720 * (n.getHours() < 12 ? 1 : -1));
	  };
	}]).directive("timepicker", function () {
	  return { restrict: "EA", require: ["timepicker", "?^ngModel"], controller: "TimepickerController", replace: !0, scope: {}, templateUrl: "template/timepicker/timepicker.html", link: function link(a, b, c, d) {
	      var e = d[0],
	          f = d[1];f && e.init(f, b.find("input"));
	    } };
	}), angular.module("ui.bootstrap.typeahead", ["ui.bootstrap.position", "ui.bootstrap.bindHtml"]).factory("typeaheadParser", ["$parse", function (a) {
	  var b = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;return { parse: function parse(c) {
	      var d = c.match(b);if (!d) throw new Error('Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "' + c + '".');return { itemName: d[3], source: a(d[4]), viewMapper: a(d[2] || d[1]), modelMapper: a(d[1]) };
	    } };
	}]).directive("typeahead", ["$compile", "$parse", "$q", "$timeout", "$document", "$position", "typeaheadParser", function (a, b, c, d, e, f, g) {
	  var h = [9, 13, 27, 38, 40];return { require: "ngModel", link: function link(i, j, k, l) {
	      var m,
	          n = i.$eval(k.typeaheadMinLength) || 1,
	          o = i.$eval(k.typeaheadWaitMs) || 0,
	          p = i.$eval(k.typeaheadEditable) !== !1,
	          q = b(k.typeaheadLoading).assign || angular.noop,
	          r = b(k.typeaheadOnSelect),
	          s = k.typeaheadInputFormatter ? b(k.typeaheadInputFormatter) : void 0,
	          t = k.typeaheadAppendToBody ? i.$eval(k.typeaheadAppendToBody) : !1,
	          u = i.$eval(k.typeaheadFocusFirst) !== !1,
	          v = b(k.ngModel).assign,
	          w = g.parse(k.typeahead),
	          x = i.$new();i.$on("$destroy", function () {
	        x.$destroy();
	      });var y = "typeahead-" + x.$id + "-" + Math.floor(1e4 * Math.random());j.attr({ "aria-autocomplete": "list", "aria-expanded": !1, "aria-owns": y });var z = angular.element("<div typeahead-popup></div>");z.attr({ id: y, matches: "matches", active: "activeIdx", select: "select(activeIdx)", query: "query", position: "position" }), angular.isDefined(k.typeaheadTemplateUrl) && z.attr("template-url", k.typeaheadTemplateUrl);var A = function A() {
	        x.matches = [], x.activeIdx = -1, j.attr("aria-expanded", !1);
	      },
	          B = function B(a) {
	        return y + "-option-" + a;
	      };x.$watch("activeIdx", function (a) {
	        0 > a ? j.removeAttr("aria-activedescendant") : j.attr("aria-activedescendant", B(a));
	      });var C = function C(a) {
	        var b = { $viewValue: a };q(i, !0), c.when(w.source(i, b)).then(function (c) {
	          var d = a === l.$viewValue;if (d && m) if (c.length > 0) {
	            x.activeIdx = u ? 0 : -1, x.matches.length = 0;for (var e = 0; e < c.length; e++) b[w.itemName] = c[e], x.matches.push({ id: B(e), label: w.viewMapper(x, b), model: c[e] });x.query = a, x.position = t ? f.offset(j) : f.position(j), x.position.top = x.position.top + j.prop("offsetHeight"), j.attr("aria-expanded", !0);
	          } else A();d && q(i, !1);
	        }, function () {
	          A(), q(i, !1);
	        });
	      };A(), x.query = void 0;var D,
	          E = function E(a) {
	        D = d(function () {
	          C(a);
	        }, o);
	      },
	          F = function F() {
	        D && d.cancel(D);
	      };l.$parsers.unshift(function (a) {
	        return m = !0, a && a.length >= n ? o > 0 ? (F(), E(a)) : C(a) : (q(i, !1), F(), A()), p ? a : a ? void l.$setValidity("editable", !1) : (l.$setValidity("editable", !0), a);
	      }), l.$formatters.push(function (a) {
	        var b,
	            c,
	            d = {};return s ? (d.$model = a, s(i, d)) : (d[w.itemName] = a, b = w.viewMapper(i, d), d[w.itemName] = void 0, c = w.viewMapper(i, d), b !== c ? b : a);
	      }), x.select = function (a) {
	        var b,
	            c,
	            e = {};e[w.itemName] = c = x.matches[a].model, b = w.modelMapper(i, e), v(i, b), l.$setValidity("editable", !0), r(i, { $item: c, $model: b, $label: w.viewMapper(i, e) }), A(), d(function () {
	          j[0].focus();
	        }, 0, !1);
	      }, j.bind("keydown", function (a) {
	        0 !== x.matches.length && -1 !== h.indexOf(a.which) && (-1 != x.activeIdx || 13 !== a.which && 9 !== a.which) && (a.preventDefault(), 40 === a.which ? (x.activeIdx = (x.activeIdx + 1) % x.matches.length, x.$digest()) : 38 === a.which ? (x.activeIdx = (x.activeIdx > 0 ? x.activeIdx : x.matches.length) - 1, x.$digest()) : 13 === a.which || 9 === a.which ? x.$apply(function () {
	          x.select(x.activeIdx);
	        }) : 27 === a.which && (a.stopPropagation(), A(), x.$digest()));
	      }), j.bind("blur", function () {
	        m = !1;
	      });var G = function G(a) {
	        j[0] !== a.target && (A(), x.$digest());
	      };e.bind("click", G), i.$on("$destroy", function () {
	        e.unbind("click", G), t && H.remove();
	      });var H = a(z)(x);t ? e.find("body").append(H) : j.after(H);
	    } };
	}]).directive("typeaheadPopup", function () {
	  return { restrict: "EA", scope: { matches: "=", query: "=", active: "=", position: "=", select: "&" }, replace: !0, templateUrl: "template/typeahead/typeahead-popup.html", link: function link(a, b, c) {
	      a.templateUrl = c.templateUrl, a.isOpen = function () {
	        return a.matches.length > 0;
	      }, a.isActive = function (b) {
	        return a.active == b;
	      }, a.selectActive = function (b) {
	        a.active = b;
	      }, a.selectMatch = function (b) {
	        a.select({ activeIdx: b });
	      };
	    } };
	}).directive("typeaheadMatch", ["$http", "$templateCache", "$compile", "$parse", function (a, b, c, d) {
	  return { restrict: "EA", scope: { index: "=", match: "=", query: "=" }, link: function link(e, f, g) {
	      var h = d(g.templateUrl)(e.$parent) || "template/typeahead/typeahead-match.html";a.get(h, { cache: b }).success(function (a) {
	        f.replaceWith(c(a.trim())(e));
	      });
	    } };
	}]).filter("typeaheadHighlight", function () {
	  function a(a) {
	    return a.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
	  }return function (b, c) {
	    return c ? ("" + b).replace(new RegExp(a(c), "gi"), "<strong>$&</strong>") : b;
	  };
	}), angular.module("template/accordion/accordion-group.html", []).run(["$templateCache", function (a) {
	  a.put("template/accordion/accordion-group.html", '<div class="panel panel-default">\n  <div class="panel-heading">\n    <h4 class="panel-title">\n      <a href class="accordion-toggle" ng-click="toggleOpen()" accordion-transclude="heading"><span ng-class="{\'text-muted\': isDisabled}">{{heading}}</span></a>\n    </h4>\n  </div>\n  <div class="panel-collapse" collapse="!isOpen">\n	  <div class="panel-body" ng-transclude></div>\n  </div>\n</div>\n');
	}]), angular.module("template/accordion/accordion.html", []).run(["$templateCache", function (a) {
	  a.put("template/accordion/accordion.html", '<div class="panel-group" ng-transclude></div>');
	}]), angular.module("template/alert/alert.html", []).run(["$templateCache", function (a) {
	  a.put("template/alert/alert.html", '<div class="alert" ng-class="[\'alert-\' + (type || \'warning\'), closeable ? \'alert-dismissable\' : null]" role="alert">\n    <button ng-show="closeable" type="button" class="close" ng-click="close()">\n        <span aria-hidden="true">&times;</span>\n        <span class="sr-only">Close</span>\n    </button>\n    <div ng-transclude></div>\n</div>\n');
	}]), angular.module("template/carousel/carousel.html", []).run(["$templateCache", function (a) {
	  a.put("template/carousel/carousel.html", '<div ng-mouseenter="pause()" ng-mouseleave="play()" class="carousel" ng-swipe-right="prev()" ng-swipe-left="next()">\n    <ol class="carousel-indicators" ng-show="slides.length > 1">\n        <li ng-repeat="slide in slides track by $index" ng-class="{active: isActive(slide)}" ng-click="select(slide)"></li>\n    </ol>\n    <div class="carousel-inner" ng-transclude></div>\n    <a class="left carousel-control" ng-click="prev()" ng-show="slides.length > 1"><span class="glyphicon glyphicon-chevron-left"></span></a>\n    <a class="right carousel-control" ng-click="next()" ng-show="slides.length > 1"><span class="glyphicon glyphicon-chevron-right"></span></a>\n</div>\n');
	}]), angular.module("template/carousel/slide.html", []).run(["$templateCache", function (a) {
	  a.put("template/carousel/slide.html", "<div ng-class=\"{\n    'active': leaving || (active && !entering),\n    'prev': (next || active) && direction=='prev',\n    'next': (next || active) && direction=='next',\n    'right': direction=='prev',\n    'left': direction=='next'\n  }\" class=\"item text-center\" ng-transclude></div>\n");
	}]), angular.module("template/datepicker/datepicker.html", []).run(["$templateCache", function (a) {
	  a.put("template/datepicker/datepicker.html", '<div ng-switch="datepickerMode" role="application" ng-keydown="keydown($event)">\n  <daypicker ng-switch-when="day" tabindex="0"></daypicker>\n  <monthpicker ng-switch-when="month" tabindex="0"></monthpicker>\n  <yearpicker ng-switch-when="year" tabindex="0"></yearpicker>\n</div>');
	}]), angular.module("template/datepicker/day.html", []).run(["$templateCache", function (a) {
	  a.put("template/datepicker/day.html", '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="{{5 + showWeeks}}"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n    <tr>\n      <th ng-show="showWeeks" class="text-center"></th>\n      <th ng-repeat="label in labels track by $index" class="text-center"><small aria-label="{{label.full}}">{{label.abbr}}</small></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-show="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}</em></td>\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default btn-sm" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-muted\': dt.secondary, \'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
	}]), angular.module("template/datepicker/month.html", []).run(["$templateCache", function (a) {
	  a.put("template/datepicker/month.html", '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
	}]), angular.module("template/datepicker/popup.html", []).run(["$templateCache", function (a) {
	  a.put("template/datepicker/popup.html", '<ul class="dropdown-menu" ng-style="{display: (isOpen && \'block\') || \'none\', top: position.top+\'px\', left: position.left+\'px\'}" ng-keydown="keydown($event)">\n	<li ng-transclude></li>\n	<li ng-if="showButtonBar" style="padding:10px 9px 2px">\n		<span class="btn-group pull-left">\n			<button type="button" class="btn btn-sm btn-info" ng-click="select(\'today\')">{{ getText(\'current\') }}</button>\n			<button type="button" class="btn btn-sm btn-danger" ng-click="select(null)">{{ getText(\'clear\') }}</button>\n		</span>\n		<button type="button" class="btn btn-sm btn-success pull-right" ng-click="close()">{{ getText(\'close\') }}</button>\n	</li>\n</ul>\n');
	}]), angular.module("template/datepicker/year.html", []).run(["$templateCache", function (a) {
	  a.put("template/datepicker/year.html", '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="3"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
	}]), angular.module("template/modal/backdrop.html", []).run(["$templateCache", function (a) {
	  a.put("template/modal/backdrop.html", '<div class="modal-backdrop fade {{ backdropClass }}"\n     ng-class="{in: animate}"\n     ng-style="{\'z-index\': 1040 + (index && 1 || 0) + index*10}"\n></div>\n');
	}]), angular.module("template/modal/window.html", []).run(["$templateCache", function (a) {
	  a.put("template/modal/window.html", '<div tabindex="-1" role="dialog" class="modal fade" ng-class="{in: animate}" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)">\n    <div class="modal-dialog" ng-class="{\'modal-sm\': size == \'sm\', \'modal-lg\': size == \'lg\'}"><div class="modal-content" modal-transclude></div></div>\n</div>');
	}]), angular.module("template/pagination/pager.html", []).run(["$templateCache", function (a) {
	  a.put("template/pagination/pager.html", '<ul class="pager">\n  <li ng-class="{disabled: noPrevious(), previous: align}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}</a></li>\n  <li ng-class="{disabled: noNext(), next: align}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}</a></li>\n</ul>');
	}]), angular.module("template/pagination/pagination.html", []).run(["$templateCache", function (a) {
	  a.put("template/pagination/pagination.html", '<ul class="pagination">\n  <li ng-if="boundaryLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(1)">{{getText(\'first\')}}</a></li>\n  <li ng-if="directionLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}</a></li>\n  <li ng-repeat="page in pages track by $index" ng-class="{active: page.active}"><a href ng-click="selectPage(page.number)">{{page.text}}</a></li>\n  <li ng-if="directionLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}</a></li>\n  <li ng-if="boundaryLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(totalPages)">{{getText(\'last\')}}</a></li>\n</ul>');
	}]), angular.module("template/tooltip/tooltip-html-unsafe-popup.html", []).run(["$templateCache", function (a) {
	  a.put("template/tooltip/tooltip-html-unsafe-popup.html", '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" bind-html-unsafe="content"></div>\n</div>\n');
	}]), angular.module("template/tooltip/tooltip-popup.html", []).run(["$templateCache", function (a) {
	  a.put("template/tooltip/tooltip-popup.html", '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" ng-bind="content"></div>\n</div>\n');
	}]), angular.module("template/popover/popover.html", []).run(["$templateCache", function (a) {
	  a.put("template/popover/popover.html", '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="arrow"></div>\n\n  <div class="popover-inner">\n      <h3 class="popover-title" ng-bind="title" ng-show="title"></h3>\n      <div class="popover-content" ng-bind="content"></div>\n  </div>\n</div>\n');
	}]), angular.module("template/progressbar/bar.html", []).run(["$templateCache", function (a) {
	  a.put("template/progressbar/bar.html", '<div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude></div>');
	}]), angular.module("template/progressbar/progress.html", []).run(["$templateCache", function (a) {
	  a.put("template/progressbar/progress.html", '<div class="progress" ng-transclude></div>');
	}]), angular.module("template/progressbar/progressbar.html", []).run(["$templateCache", function (a) {
	  a.put("template/progressbar/progressbar.html", '<div class="progress">\n  <div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude></div>\n</div>');
	}]), angular.module("template/rating/rating.html", []).run(["$templateCache", function (a) {
	  a.put("template/rating/rating.html", '<span ng-mouseleave="reset()" ng-keydown="onKeydown($event)" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="{{range.length}}" aria-valuenow="{{value}}">\n    <i ng-repeat="r in range track by $index" ng-mouseenter="enter($index + 1)" ng-click="rate($index + 1)" class="glyphicon" ng-class="$index < value && (r.stateOn || \'glyphicon-star\') || (r.stateOff || \'glyphicon-star-empty\')">\n        <span class="sr-only">({{ $index < value ? \'*\' : \' \' }})</span>\n    </i>\n</span>');
	}]), angular.module("template/tabs/tab.html", []).run(["$templateCache", function (a) {
	  a.put("template/tabs/tab.html", '<li ng-class="{active: active, disabled: disabled}">\n  <a href ng-click="select()" tab-heading-transclude>{{heading}}</a>\n</li>\n');
	}]), angular.module("template/tabs/tabset.html", []).run(["$templateCache", function (a) {
	  a.put("template/tabs/tabset.html", '<div>\n  <ul class="nav nav-{{type || \'tabs\'}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" ng-transclude></ul>\n  <div class="tab-content">\n    <div class="tab-pane" \n         ng-repeat="tab in tabs" \n         ng-class="{active: tab.active}"\n         tab-content-transclude="tab">\n    </div>\n  </div>\n</div>\n');
	}]), angular.module("template/timepicker/timepicker.html", []).run(["$templateCache", function (a) {
	  a.put("template/timepicker/timepicker.html", '<table>\n	<tbody>\n		<tr class="text-center">\n			<td><a ng-click="incrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n			<td>&nbsp;</td>\n			<td><a ng-click="incrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n			<td ng-show="showMeridian"></td>\n		</tr>\n		<tr>\n			<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidHours}">\n				<input type="text" ng-model="hours" ng-change="updateHours()" class="form-control text-center" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2">\n			</td>\n			<td>:</td>\n			<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidMinutes}">\n				<input type="text" ng-model="minutes" ng-change="updateMinutes()" class="form-control text-center" ng-readonly="readonlyInput" maxlength="2">\n			</td>\n			<td ng-show="showMeridian"><button type="button" class="btn btn-default text-center" ng-click="toggleMeridian()">{{meridian}}</button></td>\n		</tr>\n		<tr class="text-center">\n			<td><a ng-click="decrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n			<td>&nbsp;</td>\n			<td><a ng-click="decrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n			<td ng-show="showMeridian"></td>\n		</tr>\n	</tbody>\n</table>\n');
	}]), angular.module("template/typeahead/typeahead-match.html", []).run(["$templateCache", function (a) {
	  a.put("template/typeahead/typeahead-match.html", '<a tabindex="-1" bind-html-unsafe="match.label | typeaheadHighlight:query"></a>');
	}]), angular.module("template/typeahead/typeahead-popup.html", []).run(["$templateCache", function (a) {
	  a.put("template/typeahead/typeahead-popup.html", '<ul class="dropdown-menu" ng-show="isOpen()" ng-style="{top: position.top+\'px\', left: position.left+\'px\'}" style="display: block;" role="listbox" aria-hidden="{{!isOpen()}}">\n    <li ng-repeat="match in matches track by $index" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)" ng-click="selectMatch($index)" role="option" id="{{match.id}}">\n        <div typeahead-match index="$index" match="match" query="query" template-url="templateUrl"></div>\n    </li>\n</ul>\n');
	}]);

/***/ },

/***/ 151:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	var Utils = __webpack_require__(3);
	var mdetect = __webpack_require__(7);
	var Auth = __webpack_require__(1);
	var Urls = __webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(11);
	__webpack_require__(12);
	Utils.ParsleyConfig();
	function first_node() {
	    var first = $("a[href='#flexible']");
	    first.attr('aria-selected', false);
	    $(first.attr('href')).attr('aria-hidden', true);
	}
	
	function cancellation() {
	    var secs = window.location.href.split('/');
	    var node = secs[secs.length - 1];
	    if (node[0] === "#") {
	        console.log($(node));
	        var sttr = "a[href=" + node + "]";
	        $(sttr).attr('aria-selected', true);
	        $($(sttr).attr('href')).attr('aria-hidden', false);
	        first_node();
	    }
	    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	        //        e.target // newly activated tab
	        $(e.target).attr('aria-selected', true);
	        var link = $(e.target).attr('href');
	        $(link).attr('aria-hidden', false);
	
	        //        e.relatedTarget // previous active tab
	        if (e.relatedTarget) {
	            $(e.relatedTarget).attr('aria-selected', false);
	            $($(e.relatedTarget).attr('href')).attr('aria-hidden', true);
	        } else {
	            first_node();
	        }
	    });
	}
	function become_tutor() {
	    window.MobileEsp = mdetect.MobileEsp;
	    Auth.Authenticate($('#id_phone_number'), function (data) {
	        console.debug(data);
	        window.location.href = Urls['users:edit_profile']();
	    });
	    $('#carousel-example-generic').carousel({
	        interval: false
	    });
	    // Tuteria.BecomeTutor(urls)
	    var price = $('#price'),
	        four_month = $('#four-months'),
	        six_month = $('#seven-months'),
	        one_month = $('#one-point-five-months'),
	        hidden = $('.hide');
	
	    function CalculateEarnings(price) {
	        one_month.val(price * 20 * 0.65);
	        four_month.val(price * 80 * 0.70 + parseInt(one_month.val()));
	        six_month.val(price * 150 * 0.75 + parseInt(four_month.val()));
	    }
	
	    price.keydown(function (e) {
	        // Allow: backspace, delete, tab, escape, enter and .
	        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
	        // Allow: Ctrl+A
	        e.keyCode == 65 && e.ctrlKey === true ||
	        // Allow: home, end, left, right, down, up
	        e.keyCode >= 35 && e.keyCode <= 40) {
	            // let it happen, don't do anything
	            return;
	        }
	        // Ensure that it is a number and stop the keypress
	        if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
	            e.preventDefault();
	        }
	    });
	    function Calc(e) {
	        CalculateEarnings(parseInt(e.val()));
	        $.each(hidden, function (key, val) {
	            $(val).removeClass('hide');
	        });
	    }
	
	    // price.filter_input({regex: '[0-9]'});
	    $('#calculate-val').on('click', function (e) {
	        Calc($('#price'));
	    });
	    price.on('keyup', function () {
	        console.log($(this).val());
	        Calc($(this));
	    });
	}
	$(function () {
	    if (window.currentPage === "Cancellation") {
	        Auth.Authenticate($('#id_phone_number'));
	        cancellation();
	    } else if (window.currentPage === "SignUp") {
	        Auth.Authenticate($('#id_phone_number'), function (data) {
	            console.debug(data);
	            window.location.href = Urls['users:dashboard']();
	        });
	    } else if (window.currentPage === "Login") {
	        console.log("My login only");
	        Auth.Authenticate($('#id_phone_number'));
	    } else if (window.currentPage === 'Referrals2') {
	        console.log("hello22");
	        Auth.Authenticate($('#id_phone_number'), function (data) {
	            return window.location.href = Urls['home']();
	        });
	    } else if (window.currentPage == "Referrals__77") {
	        __webpack_require__(152);
	    } else if (window.currentPage === "Referrals") {
	        var app;
	        var x;
	        var hello;
	        var ContactModel;
	        var CJson;
	        var CJson2;
	
	        (function () {
	            var auth = function auth() {
	                hello.init({
	                    google: window.GOOGLE_CLIENT_ID
	                }, { scope: "friends", redirect_uri: Urls["yahoo_redirect"]() });
	                // var config = {
	                //   'client_id': window.GOOGLE_CLIENT_ID,
	                //   'scope': 'https://www.google.com/m8/feeds',
	                //   'immediate': false
	                // };     
	                // console.log("Started");
	                //   window.gapi.auth.authorize(config, function(data) {
	                //     console.log(data);
	                //     delete data['g-oauth-window'];
	                //       fetch(data);
	                //   });
	                hello('google').login({ scope: 'friends' }).then(function () {
	                    hello('google').api('me/contacts', { limit: 1000 }).then(function (x) {
	                        var contacts = x.data.map(function (x) {
	                            return new ContactModel(x);
	                        }).filter(function (x) {
	                            return x.email;
	                        }).sort(function (x, y) {
	                            if (x.name > y.name) return -1;
	                            if (x.name < y.name) return 1;
	                            return 0;
	                        }).map(function (x) {
	                            x.is_a_user(window.INVITEES);
	                            return x;
	                        });
	                        setTimeout(function () {
	                            //get your angular element
	                            var elem = angular.element('#base_ctrl');
	
	                            //get the injector.
	                            var injector = elem.injector();
	
	                            //get the service.
	                            var myService = injector.get('ContactService');
	
	                            //update the service.
	                            myService.setContacts(contacts);
	
	                            //apply the changes to the scope.
	                            elem.scope().$apply();
	                            angular.element('#angular_yahoo_btn').trigger('click');
	                        }, 200);
	                    });
	                }, function (e) {
	                    // alert('Signin error: ' + e.error.message);
	                });
	            };
	
	            var fetch = function fetch(token) {
	                $.ajax({
	                    url: 'https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=200',
	                    dataType: 'jsonp',
	                    data: token
	                }).done(function (data) {
	                    console.log(data);
	                    var contacts = data.feed.entry.map(function (x) {
	                        return new ContactModel(x);
	                    }).filter(function (x) {
	                        return x.email != '';
	                    }).sort(function (x, y) {
	                        if (x.name > y.name) return -1;
	                        if (x.name < y.name) return 1;
	                        return 0;
	                    }).map(function (x) {
	                        x.is_a_user(window.INVITEES);
	                        return x;
	                    });
	                    setTimeout(function () {
	                        //get your angular element
	                        var elem = angular.element('#base_ctrl');
	
	                        //get the injector.
	                        var injector = elem.injector();
	
	                        //get the service.
	                        var myService = injector.get('ContactService');
	
	                        //update the service.
	                        myService.setContacts(contacts);
	
	                        //apply the changes to the scope.
	                        elem.scope().$apply();
	                        angular.element('#angular_google_btn').trigger('click');
	                    }, 200);
	
	                    //     var contacts = data.feed.entry.map((x)=>{
	                    //         return new ContactModel(x)
	                    //     }).filter((x)=>{
	                    //         return x.email != ''
	                    //     })
	                    //     console.log(contacts);
	                    //     console.log(JSON.stringify(data.feed.entry));
	                });
	            };
	
	            app = __webpack_require__(155);
	            x = __webpack_require__(156);
	            hello = __webpack_require__(152);
	            ContactModel = x.ContactModel;
	            CJson = x.json;
	            CJson2 = x.json2;
	
	            Auth.Authenticate($('#id_phone_number'));
	
	            angular.bootstrap(document, ['referralBtn']);
	
	            $('.google_btn').click(function () {
	                auth();
	
	                // var contacts = CJson.feed.entry.map((x)=>{
	                //     return new ContactModel(x)
	                // }).filter((x)=>{
	                //     return x.email != ''
	                // }).sort((x,y)=>{
	                //     if(x.name > y.name) return -1;
	                //     if(x.name < y.name) return 1;
	                //     return 0;
	                // }).map((x)=>{
	                //     x.is_a_user(window.INVITEES);
	                //     return x
	                // })
	                // setTimeout(function(){
	                //   //get your angular element
	                //   var elem = angular.element('#base_ctrl');
	
	                //   //get the injector.
	                //   var injector = elem.injector();
	
	                //   //get the service.
	                //   var myService = injector.get('ContactService');
	
	                //   //update the service.
	                //   myService.setContacts(contacts);
	
	                //   //apply the changes to the scope.
	                //   elem.scope().$apply();
	                //     angular.element('#angular_google_btn').trigger('click');
	                // }, 200)
	            });
	
	            $('.yahoo_btn').click(function () {
	                // var contacts = CJson2.data.map((x)=>{
	                //             return new ContactModel(x,true)
	                //         }).filter((x)=>{
	                //             return x.email != ''
	                //         }).sort((x,y)=>{
	                //             if(x.name > y.name) return -1;
	                //             if(x.name < y.name) return 1;
	                //             return 0;
	                //         }).map((x)=>{
	                //             x.is_a_user(window.INVITEES);
	                //             return x
	                //         })
	                //             setTimeout(function(){
	                //   //get your angular element
	                //   var elem = angular.element('#base_ctrl');
	
	                //   //get the injector.
	                //   var injector = elem.injector();
	
	                //   //get the service.
	                //   var myService = injector.get('ContactService');
	
	                //   //update the service.
	                //   myService.setContacts(contacts);
	
	                //   //apply the changes to the scope.
	                //   elem.scope().$apply();
	                // angular.element('#angular_yahoo_btn').trigger('click');
	                // }, 200)
	
	                hello.init({
	                    yahoo: window.YAHOO_CLIENT_ID
	                }, { scope: "friends", redirect_uri: Urls["yahoo_redirect"]() });
	                hello('yahoo').login({ scope: 'friends' }).then(function () {
	                    var token = hello('yahoo').getAuthResponse();
	                    console.log(token);
	                    hello('yahoo').api('me/friends', { limit: 1000 }).then(function (x) {
	                        var contacts = x.data.map(function (x) {
	                            return new ContactModel(x, true);
	                        }).filter(function (x) {
	                            return x.email != '';
	                        }).sort(function (x, y) {
	                            if (x.name > y.name) return -1;
	                            if (x.name < y.name) return 1;
	                            return 0;
	                        }).map(function (x) {
	                            x.is_a_user(window.INVITEES);
	                            return x;
	                        });
	                        setTimeout(function () {
	                            //get your angular element
	                            var elem = angular.element('#base_ctrl');
	
	                            //get the injector.
	                            var injector = elem.injector();
	
	                            //get the service.
	                            var myService = injector.get('ContactService');
	
	                            //update the service.
	                            myService.setContacts(contacts);
	
	                            //apply the changes to the scope.
	                            elem.scope().$apply();
	                            angular.element('#angular_yahoo_btn').trigger('click');
	                        }, 200);
	                    });
	                }, function (e) {
	                    // alert('Signin error: ' + e.error.message);
	                });
	            });
	        })();
	    } else if (window.currentPage === "Reset") {
	            Auth.Authenticate($('#id_phone_number'));
	        } else if (window.currentPage === "BecomeTutor") {
	            become_tutor();
	        } else if (window.currentPage === "Trust") {
	            var v = $('#interview-form');
	            if (v.length > 0) {
	                Utils.parsleyfyForm(v);
	            }
	            Auth.Authenticate($('#id_phone_number'), function (data) {
	                console.debug(data);
	                window.location.href = Urls['users:edit_profile']();
	            });
	        } else if (window.currentPage === "Levels") {
	            Auth.Authenticate($('#id_phone_number'), function (data) {
	                console.debug(data);
	                window.location.href = Urls['users:edit_profile']();
	            });
	        } else if (window.currentPage === 'SubjectList') {
	            Auth.Authenticate();
	        } else if (window.currentPage === "Payout") {
	            var def_text;
	            var payout;
	
	            (function () {
	                var ChangeToPagaView = function ChangeToPagaView() {
	                    $('#other-bank-details').addClass('hidden');
	                    $('#account_sec label').text('Paga ID');
	                };
	
	                //require('./../calendar/libs/ladda.js');
	                Auth.Authenticate($('#id_phone_number'));
	                Utils.parsleyfyForm($('#payForm'));
	                def_text = $('#account_sec label').text();
	                payout = $('#id_payout_type');
	
	                if (payout.val() == '2') {
	                    ChangeToPagaView();
	                }
	                $('#id_payout_type').on('change', function () {
	                    var tag = $(this).find('option:selected');
	                    console.log(tag.text());
	                    if (tag.text() === 'Paga') {
	                        ChangeToPagaView();
	                    } else {
	                        $('#other-bank-details').removeClass('hidden');
	                        $('#account_sec label').text(def_text);
	                    }
	                });
	                Utils.formSubmission($('#payForm'), function () {}, function (data) {
	                    window.location.href = data.location;
	                }, function (xhr, re, btn) {
	                    var error = xhr.responseJSON.form_errors;
	                    console.log(error);
	                    var errorNode = $('#errorMessage');
	                    errorNode.empty();
	                    for (var key in error) {
	                        $('#errorMessage').append('<p class="text-danger">' + error[key][0] + '</p>');
	                    }
	                }, null, '#payoutButton');
	            })();
	        } else {
	            console.log("hello");
	            Auth.Authenticate();
	        }
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 152:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process, setImmediate) {/*! hellojs v1.9.8 | (c) 2012-2015 Andrew Dodson | MIT https://adodson.com/hello.js/LICENSE */ // ES5 Object.create
	'use strict';if(!Object.create){ // Shim, Object create
	// A shim for Object.create(), it adds a prototype to a new object
	Object.create = (function(){function F(){}return function(o){if(arguments.length != 1){throw new Error('Object.create implementation only accepts one parameter.');}F.prototype = o;return new F();};})();} // ES5 Object.keys
	if(!Object.keys){Object.keys = function(o,k,r){r = [];for(k in o) {if(r.hasOwnProperty.call(o,k))r.push(k);}return r;};} // ES5 [].indexOf
	if(!Array.prototype.indexOf){Array.prototype.indexOf = function(s){for(var j=0;j < this.length;j++) {if(this[j] === s){return j;}}return -1;};} // ES5 [].forEach
	if(!Array.prototype.forEach){Array.prototype.forEach = function(fun /*, thisArg*/){if(this === void 0 || this === null){throw new TypeError();}var t=Object(this);var len=t.length >>> 0;if(typeof fun !== 'function'){throw new TypeError();}var thisArg=arguments.length >= 2?arguments[1]:void 0;for(var i=0;i < len;i++) {if(i in t){fun.call(thisArg,t[i],i,t);}}return this;};} // ES5 [].filter
	if(!Array.prototype.filter){Array.prototype.filter = function(fun,thisArg){var a=[];this.forEach(function(val,i,t){if(fun.call(thisArg || void 0,val,i,t)){a.push(val);}});return a;};} // Production steps of ECMA-262, Edition 5, 15.4.4.19
	// Reference: http://es5.github.io/#x15.4.4.19
	if(!Array.prototype.map){Array.prototype.map = function(fun,thisArg){var a=[];this.forEach(function(val,i,t){a.push(fun.call(thisArg || void 0,val,i,t));});return a;};} // ES5 isArray
	if(!Array.isArray){ // Function Array.isArray
	Array.isArray = function(o){return Object.prototype.toString.call(o) === '[object Array]';};} // Test for location.assign
	if(typeof window === 'object' && typeof window.location === 'object' && !window.location.assign){window.location.assign = function(url){window.location = url;};} // Test for Function.bind
	if(!Function.prototype.bind){ // MDN
	// Polyfill IE8, does not support native Function.bind
	Function.prototype.bind = function(b){if(typeof this !== 'function'){throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');}function C(){}var a=[].slice;var f=a.call(arguments,1);var _this=this;var D=function D(){return _this.apply(this instanceof C?this:b || window,f.concat(a.call(arguments)));};C.prototype = this.prototype;D.prototype = new C();return D;};} /**
	 * @hello.js
	 *
	 * HelloJS is a client side Javascript SDK for making OAuth2 logins and subsequent REST calls.
	 *
	 * @author Andrew Dodson
	 * @website https://adodson.com/hello.js/
	 *
	 * @copyright Andrew Dodson, 2012 - 2015
	 * @license MIT: You are free to use and modify this code for any use, on the condition that this copyright notice remains.
	 */var hello=function hello(name){return hello.use(name);};hello.utils = { // Extend the first object with the properties and methods of the second
	extend:function extend(r /*, a[, b[, ...]] */){ // Get the arguments as an array but ommit the initial item
	Array.prototype.slice.call(arguments,1).forEach(function(a){if(r instanceof Object && a instanceof Object && r !== a){for(var x in a) {r[x] = hello.utils.extend(r[x],a[x]);}}else {r = a;}});return r;}}; // Core library
	hello.utils.extend(hello,{settings:{ // OAuth2 authentication defaults
	redirect_uri:window.location.href.split('#')[0],response_type:'token',display:'popup',state:'', // OAuth1 shim
	// The path to the OAuth1 server for signing user requests
	// Want to recreate your own? Checkout https://github.com/MrSwitch/node-oauth-shim
	oauth_proxy:'https://auth-server.herokuapp.com/proxy', // API timeout in milliseconds
	timeout:20000, // Popup Options
	popup:{resizable:1,scrollbars:1,width:500,height:550}, // Default service / network
	default_service:null, // Force authentication
	// When hello.login is fired.
	// (null): ignore current session expiry and continue with login
	// (true): ignore current session expiry and continue with login, ask for user to reauthenticate
	// (false): if the current session looks good for the request scopes return the current session.
	force:null, // Page URL
	// When 'display=page' this property defines where the users page should end up after redirect_uri
	// Ths could be problematic if the redirect_uri is indeed the final place,
	// Typically this circumvents the problem of the redirect_url being a dumb relay page.
	page_uri:window.location.href}, // Service configuration objects
	services:{}, // Use
	// Define a new instance of the HelloJS library with a default service
	use:function use(service){ // Create self, which inherits from its parent
	var self=Object.create(this); // Inherit the prototype from its parent
	self.settings = Object.create(this.settings); // Define the default service
	if(service){self.settings.default_service = service;} // Create an instance of Events
	self.utils.Event.call(self);return self;}, // Initialize
	// Define the client_ids for the endpoint services
	// @param object o, contains a key value pair, service => clientId
	// @param object opts, contains a key value pair of options used for defining the authentication defaults
	// @param number timeout, timeout in seconds
	init:function init(services,options){var utils=this.utils;if(!services){return this.services;} // Define provider credentials
	// Reformat the ID field
	for(var x in services) {if(services.hasOwnProperty(x)){if(typeof services[x] !== 'object'){services[x] = {id:services[x]};}}} // Merge services if there already exists some
	utils.extend(this.services,services); // Format the incoming
	for(x in this.services) {if(this.services.hasOwnProperty(x)){this.services[x].scope = this.services[x].scope || {};}} //
	// Update the default settings with this one.
	if(options){utils.extend(this.settings,options); // Do this immediatly incase the browser changes the current path.
	if('redirect_uri' in options){this.settings.redirect_uri = utils.url(options.redirect_uri).href;}}return this;}, // Login
	// Using the endpoint
	// @param network stringify       name to connect to
	// @param options object    (optional)  {display mode, is either none|popup(default)|page, scope: email,birthday,publish, .. }
	// @param callback  function  (optional)  fired on signin
	login:function login(){ // Create an object which inherits its parent as the prototype and constructs a new event chain.
	var _this=this;var utils=_this.utils;var error=utils.error;var promise=utils.Promise(); // Get parameters
	var p=utils.args({network:'s',options:'o',callback:'f'},arguments); // Local vars
	var url; // Get all the custom options and store to be appended to the querystring
	var qs=utils.diffKey(p.options,_this.settings); // Merge/override options with app defaults
	var opts=p.options = utils.merge(_this.settings,p.options || {}); // Merge/override options with app defaults
	opts.popup = utils.merge(_this.settings.popup,p.options.popup || {}); // Network
	p.network = p.network || _this.settings.default_service; // Bind callback to both reject and fulfill states
	promise.proxy.then(p.callback,p.callback); // Trigger an event on the global listener
	function emit(s,value){hello.emit(s,value);}promise.proxy.then(emit.bind(this,'auth.login auth'),emit.bind(this,'auth.failed auth')); // Is our service valid?
	if(typeof p.network !== 'string' || !(p.network in _this.services)){ // Trigger the default login.
	// Ahh we dont have one.
	return promise.reject(error('invalid_network','The provided network was not recognized'));}var provider=_this.services[p.network]; // Create a global listener to capture events triggered out of scope
	var callbackId=utils.globalEvent(function(str){ // The responseHandler returns a string, lets save this locally
	var obj;if(str){obj = JSON.parse(str);}else {obj = error('cancelled','The authentication was not completed');} // Handle these response using the local
	// Trigger on the parent
	if(!obj.error){ // Save on the parent window the new credentials
	// This fixes an IE10 bug i think... atleast it does for me.
	utils.store(obj.network,obj); // Fulfill a successful login
	promise.fulfill({network:obj.network,authResponse:obj});}else { // Reject a successful login
	promise.reject(obj);}});var redirectUri=utils.url(opts.redirect_uri).href; // May be a space-delimited list of multiple, complementary types
	var responseType=provider.oauth.response_type || opts.response_type; // Fallback to token if the module hasn't defined a grant url
	if(/\bcode\b/.test(responseType) && !provider.oauth.grant){responseType = responseType.replace(/\bcode\b/,'token');} // Query string parameters, we may pass our own arguments to form the querystring
	p.qs = utils.merge(qs,{client_id:encodeURIComponent(provider.id),response_type:encodeURIComponent(responseType),redirect_uri:encodeURIComponent(redirectUri),display:opts.display,scope:'basic',state:{client_id:provider.id,network:p.network,display:opts.display,callback:callbackId,state:opts.state,redirect_uri:redirectUri}}); // Get current session for merging scopes, and for quick auth response
	var session=utils.store(p.network); // Scopes (authentication permisions)
	// Ensure this is a string - IE has a problem moving Arrays between windows
	// Append the setup scope
	var SCOPE_SPLIT=/[,\s]+/;var scope=(opts.scope || '').toString() + ',' + p.qs.scope; // Append scopes from a previous session.
	// This helps keep app credentials constant,
	// Avoiding having to keep tabs on what scopes are authorized
	if(session && 'scope' in session && session.scope instanceof String){scope += ',' + session.scope;} // Convert scope to an Array
	// - easier to manipulate
	scope = scope.split(SCOPE_SPLIT); // Format remove duplicates and empty values
	scope = utils.unique(scope).filter(filterEmpty); // Save the the scopes to the state with the names that they were requested with.
	p.qs.state.scope = scope.join(','); // Map scopes to the providers naming convention
	scope = scope.map(function(item){ // Does this have a mapping?
	if(item in provider.scope){return provider.scope[item];}else { // Loop through all services and determine whether the scope is generic
	for(var x in _this.services) {var serviceScopes=_this.services[x].scope;if(serviceScopes && item in serviceScopes){ // Found an instance of this scope, so lets not assume its special
	return '';}} // This is a unique scope to this service so lets in it.
	return item;}}); // Stringify and Arrayify so that double mapped scopes are given the chance to be formatted
	scope = scope.join(',').split(SCOPE_SPLIT); // Again...
	// Format remove duplicates and empty values
	scope = utils.unique(scope).filter(filterEmpty); // Join with the expected scope delimiter into a string
	p.qs.scope = scope.join(provider.scope_delim || ','); // Is the user already signed in with the appropriate scopes, valid access_token?
	if(opts.force === false){if(session && 'access_token' in session && session.access_token && 'expires' in session && session.expires > new Date().getTime() / 1e3){ // What is different about the scopes in the session vs the scopes in the new login?
	var diff=utils.diff((session.scope || '').split(SCOPE_SPLIT),(p.qs.state.scope || '').split(SCOPE_SPLIT));if(diff.length === 0){ // OK trigger the callback
	promise.fulfill({unchanged:true,network:p.network,authResponse:session}); // Nothing has changed
	return promise;}}} // Page URL
	if(opts.display === 'page' && opts.page_uri){ // Add a page location, place to endup after session has authenticated
	p.qs.state.page_uri = utils.url(opts.page_uri).href;} // Bespoke
	// Override login querystrings from auth_options
	if('login' in provider && typeof provider.login === 'function'){ // Format the paramaters according to the providers formatting function
	provider.login(p);} // Add OAuth to state
	// Where the service is going to take advantage of the oauth_proxy
	if(!/\btoken\b/.test(responseType) || parseInt(provider.oauth.version,10) < 2 || opts.display === 'none' && provider.oauth.grant && session && session.refresh_token){ // Add the oauth endpoints
	p.qs.state.oauth = provider.oauth; // Add the proxy url
	p.qs.state.oauth_proxy = opts.oauth_proxy;} // Convert state to a string
	p.qs.state = encodeURIComponent(JSON.stringify(p.qs.state)); // URL
	if(parseInt(provider.oauth.version,10) === 1){ // Turn the request to the OAuth Proxy for 3-legged auth
	url = utils.qs(opts.oauth_proxy,p.qs,encodeFunction);} // Refresh token
	else if(opts.display === 'none' && provider.oauth.grant && session && session.refresh_token){ // Add the refresh_token to the request
	p.qs.refresh_token = session.refresh_token; // Define the request path
	url = utils.qs(opts.oauth_proxy,p.qs,encodeFunction);}else {url = utils.qs(provider.oauth.auth,p.qs,encodeFunction);} // Execute
	// Trigger how we want self displayed
	if(opts.display === 'none'){ // Sign-in in the background, iframe
	utils.iframe(url,redirectUri);} // Triggering popup?
	else if(opts.display === 'popup'){var popup=utils.popup(url,redirectUri,opts.popup);var timer=setInterval(function(){if(!popup || popup.closed){clearInterval(timer);if(!promise.state){var response=error('cancelled','Login has been cancelled');if(!popup){response = error('blocked','Popup was blocked');}response.network = p.network;promise.reject(response);}}},100);}else {window.location = url;}return promise.proxy;function encodeFunction(s){return s;}function filterEmpty(s){return !!s;}}, // Remove any data associated with a given service
	// @param string name of the service
	// @param function callback
	logout:function logout(){var _this=this;var utils=_this.utils;var error=utils.error; // Create a new promise
	var promise=utils.Promise();var p=utils.args({name:'s',options:'o',callback:'f'},arguments);p.options = p.options || {}; // Add callback to events
	promise.proxy.then(p.callback,p.callback); // Trigger an event on the global listener
	function emit(s,value){hello.emit(s,value);}promise.proxy.then(emit.bind(this,'auth.logout auth'),emit.bind(this,'error')); // Network
	p.name = p.name || this.settings.default_service;p.authResponse = utils.store(p.name);if(p.name && !(p.name in _this.services)){promise.reject(error('invalid_network','The network was unrecognized'));}else if(p.name && p.authResponse){ // Define the callback
	var callback=function callback(opts){ // Remove from the store
	utils.store(p.name,''); // Emit events by default
	promise.fulfill(hello.utils.merge({network:p.name},opts || {}));}; // Run an async operation to remove the users session
	var _opts={};if(p.options.force){var logout=_this.services[p.name].logout;if(logout){ // Convert logout to URL string,
	// If no string is returned, then this function will handle the logout async style
	if(typeof logout === 'function'){logout = logout(callback,p);} // If logout is a string then assume URL and open in iframe.
	if(typeof logout === 'string'){utils.iframe(logout);_opts.force = null;_opts.message = 'Logout success on providers site was indeterminate';}else if(logout === undefined){ // The callback function will handle the response.
	return promise.proxy;}}} // Remove local credentials
	callback(_opts);}else {promise.reject(error('invalid_session','There was no session to remove'));}return promise.proxy;}, // Returns all the sessions that are subscribed too
	// @param string optional, name of the service to get information about.
	getAuthResponse:function getAuthResponse(service){ // If the service doesn't exist
	service = service || this.settings.default_service;if(!service || !(service in this.services)){return null;}return this.utils.store(service) || null;}, // Events: placeholder for the events
	events:{}}); // Core utilities
	hello.utils.extend(hello.utils,{ // Error
	error:function error(code,message){return {error:{code:code,message:message}};}, // Append the querystring to a url
	// @param string url
	// @param object parameters
	qs:function qs(url,params,formatFunction){if(params){ // Set default formatting function
	formatFunction = formatFunction || encodeURIComponent; // Override the items in the URL which already exist
	for(var x in params) {var str='([\\?\\&])' + x + '=[^\\&]*';var reg=new RegExp(str);if(url.match(reg)){url = url.replace(reg,'$1' + x + '=' + formatFunction(params[x]));delete params[x];}}}if(!this.isEmpty(params)){return url + (url.indexOf('?') > -1?'&':'?') + this.param(params,formatFunction);}return url;}, // Param
	// Explode/encode the parameters of an URL string/object
	// @param string s, string to decode
	param:function param(s,formatFunction){var b;var a={};var m;if(typeof s === 'string'){formatFunction = formatFunction || decodeURIComponent;m = s.replace(/^[\#\?]/,'').match(/([^=\/\&]+)=([^\&]+)/g);if(m){for(var i=0;i < m.length;i++) {b = m[i].match(/([^=]+)=(.*)/);a[b[1]] = formatFunction(b[2]);}}return a;}else {formatFunction = formatFunction || encodeURIComponent;var o=s;a = [];for(var x in o) {if(o.hasOwnProperty(x)){if(o.hasOwnProperty(x)){a.push([x,o[x] === '?'?'?':formatFunction(o[x])].join('='));}}}return a.join('&');}}, // Local storage facade
	store:(function(){var a=['localStorage','sessionStorage'];var i=-1;var prefix='test'; // Set LocalStorage
	var localStorage;while(a[++i]) {try{ // In Chrome with cookies blocked, calling localStorage throws an error
	localStorage = window[a[i]];localStorage.setItem(prefix + i,i);localStorage.removeItem(prefix + i);break;}catch(e) {localStorage = null;}}if(!localStorage){var cache=null;localStorage = {getItem:function getItem(prop){prop = prop + '=';var m=document.cookie.split(';');for(var i=0;i < m.length;i++) {var _m=m[i].replace(/(^\s+|\s+$)/,'');if(_m && _m.indexOf(prop) === 0){return _m.substr(prop.length);}}return cache;},setItem:function setItem(prop,value){cache = value;document.cookie = prop + '=' + value;}}; // Fill the cache up
	cache = localStorage.getItem('hello');}function get(){var json={};try{json = JSON.parse(localStorage.getItem('hello')) || {};}catch(e) {}return json;}function set(json){localStorage.setItem('hello',JSON.stringify(json));} // Check if the browser support local storage
	return function(name,value,days){ // Local storage
	var json=get();if(name && value === undefined){return json[name] || null;}else if(name && value === null){try{delete json[name];}catch(e) {json[name] = null;}}else if(name){json[name] = value;}else {return json;}set(json);return json || null;};})(), // Create and Append new DOM elements
	// @param node string
	// @param attr object literal
	// @param dom/string
	append:function append(node,attr,target){var n=typeof node === 'string'?document.createElement(node):node;if(typeof attr === 'object'){if('tagName' in attr){target = attr;}else {for(var x in attr) {if(attr.hasOwnProperty(x)){if(typeof attr[x] === 'object'){for(var y in attr[x]) {if(attr[x].hasOwnProperty(y)){n[x][y] = attr[x][y];}}}else if(x === 'html'){n.innerHTML = attr[x];} // IE doesn't like us setting methods with setAttribute
	else if(!/^on/.test(x)){n.setAttribute(x,attr[x]);}else {n[x] = attr[x];}}}}}if(target === 'body'){(function self(){if(document.body){document.body.appendChild(n);}else {setTimeout(self,16);}})();}else if(typeof target === 'object'){target.appendChild(n);}else if(typeof target === 'string'){document.getElementsByTagName(target)[0].appendChild(n);}return n;}, // An easy way to create a hidden iframe
	// @param string src
	iframe:function iframe(src){this.append('iframe',{src:src,style:{position:'absolute',left:'-1000px',bottom:0,height:'1px',width:'1px'}},'body');}, // Recursive merge two objects into one, second parameter overides the first
	// @param a array
	merge:function merge() /* Args: a, b, c, .. n */{var args=Array.prototype.slice.call(arguments);args.unshift({});return this.extend.apply(null,args);}, // Makes it easier to assign parameters, where some are optional
	// @param o object
	// @param a arguments
	args:function args(o,_args){var p={};var i=0;var t=null;var x=null; // 'x' is the first key in the list of object parameters
	for(x in o) {if(o.hasOwnProperty(x)){break;}} // Passing in hash object of arguments?
	// Where the first argument can't be an object
	if(_args.length === 1 && typeof _args[0] === 'object' && o[x] != 'o!'){ // Could this object still belong to a property?
	// Check the object keys if they match any of the property keys
	for(x in _args[0]) {if(o.hasOwnProperty(x)){ // Does this key exist in the property list?
	if(x in o){ // Yes this key does exist so its most likely this function has been invoked with an object parameter
	// Return first argument as the hash of all arguments
	return _args[0];}}}} // Else loop through and account for the missing ones.
	for(x in o) {if(o.hasOwnProperty(x)){t = typeof _args[i];if(typeof o[x] === 'function' && o[x].test(_args[i]) || typeof o[x] === 'string' && (o[x].indexOf('s') > -1 && t === 'string' || o[x].indexOf('o') > -1 && t === 'object' || o[x].indexOf('i') > -1 && t === 'number' || o[x].indexOf('a') > -1 && t === 'object' || o[x].indexOf('f') > -1 && t === 'function')){p[x] = _args[i++];}else if(typeof o[x] === 'string' && o[x].indexOf('!') > -1){return false;}}}return p;}, // Returns a URL instance
	url:function url(path){ // If the path is empty
	if(!path){return window.location;} // Chrome and FireFox support new URL() to extract URL objects
	else if(window.URL && URL instanceof Function && URL.length !== 0){return new URL(path,window.location);} // Ugly shim, it works!
	else {var a=document.createElement('a');a.href = path;return a.cloneNode(false);}},diff:function diff(a,b){return b.filter(function(item){return a.indexOf(item) === -1;});}, // Get the different hash of properties unique to `a`, and not in `b`
	diffKey:function diffKey(a,b){if(a || !b){var r={};for(var x in a) { // Does the property not exist?
	if(!(x in b)){r[x] = a[x];}}return r;}return a;}, // Unique
	// Remove duplicate and null values from an array
	// @param a array
	unique:function unique(a){if(!Array.isArray(a)){return [];}return a.filter(function(item,index){ // Is this the first location of item
	return a.indexOf(item) === index;});},isEmpty:function isEmpty(obj){ // Scalar
	if(!obj)return true; // Array
	if(Array.isArray(obj)){return !obj.length;}else if(typeof obj === 'object'){ // Object
	for(var key in obj) {if(obj.hasOwnProperty(key)){return false;}}}return true;}, //jscs:disable
	/*!
		 **  Thenable -- Embeddable Minimum Strictly-Compliant Promises/A+ 1.1.1 Thenable
		 **  Copyright (c) 2013-2014 Ralf S. Engelschall <http://engelschall.com>
		 **  Licensed under The MIT License <http://opensource.org/licenses/MIT>
		 **  Source-Code distributed on <http://github.com/rse/thenable>
		 */Promise:(function(){ /*  promise states [Promises/A+ 2.1]  */var STATE_PENDING=0; /*  [Promises/A+ 2.1.1]  */var STATE_FULFILLED=1; /*  [Promises/A+ 2.1.2]  */var STATE_REJECTED=2; /*  [Promises/A+ 2.1.3]  */ /*  promise object constructor  */var api=function api(executor){ /*  optionally support non-constructor/plain-function call  */if(!(this instanceof api))return new api(executor); /*  initialize object  */this.id = "Thenable/1.0.6";this.state = STATE_PENDING; /*  initial state  */this.fulfillValue = undefined; /*  initial value  */ /*  [Promises/A+ 1.3, 2.1.2.2]  */this.rejectReason = undefined; /*  initial reason */ /*  [Promises/A+ 1.5, 2.1.3.2]  */this.onFulfilled = []; /*  initial handlers  */this.onRejected = []; /*  initial handlers  */ /*  provide optional information-hiding proxy  */this.proxy = {then:this.then.bind(this)}; /*  support optional executor function  */if(typeof executor === "function")executor.call(this,this.fulfill.bind(this),this.reject.bind(this));}; /*  promise API methods  */api.prototype = { /*  promise resolving methods  */fulfill:function fulfill(value){return deliver(this,STATE_FULFILLED,"fulfillValue",value);},reject:function reject(value){return deliver(this,STATE_REJECTED,"rejectReason",value);}, /*  "The then Method" [Promises/A+ 1.1, 1.2, 2.2]  */then:function then(onFulfilled,onRejected){var curr=this;var next=new api(); /*  [Promises/A+ 2.2.7]  */curr.onFulfilled.push(resolver(onFulfilled,next,"fulfill")); /*  [Promises/A+ 2.2.2/2.2.6]  */curr.onRejected.push(resolver(onRejected,next,"reject")); /*  [Promises/A+ 2.2.3/2.2.6]  */execute(curr);return next.proxy; /*  [Promises/A+ 2.2.7, 3.3]  */}}; /*  deliver an action  */var deliver=function deliver(curr,state,name,value){if(curr.state === STATE_PENDING){curr.state = state; /*  [Promises/A+ 2.1.2.1, 2.1.3.1]  */curr[name] = value; /*  [Promises/A+ 2.1.2.2, 2.1.3.2]  */execute(curr);}return curr;}; /*  execute all handlers  */var execute=function execute(curr){if(curr.state === STATE_FULFILLED)execute_handlers(curr,"onFulfilled",curr.fulfillValue);else if(curr.state === STATE_REJECTED)execute_handlers(curr,"onRejected",curr.rejectReason);}; /*  execute particular set of handlers  */var execute_handlers=function execute_handlers(curr,name,value){ /* global process: true */ /* global setImmediate: true */ /* global setTimeout: true */ /*  short-circuit processing  */if(curr[name].length === 0)return; /*  iterate over all handlers, exactly once  */var handlers=curr[name];curr[name] = []; /*  [Promises/A+ 2.2.2.3, 2.2.3.3]  */var func=function func(){for(var i=0;i < handlers.length;i++) handlers[i](value); /*  [Promises/A+ 2.2.5]  */}; /*  execute procedure asynchronously  */ /*  [Promises/A+ 2.2.4, 3.1]  */if(typeof process === "object" && typeof process.nextTick === "function")process.nextTick(func);else if(typeof setImmediate === "function")setImmediate(func);else setTimeout(func,0);}; /*  generate a resolver function  */var resolver=function resolver(cb,next,method){return function(value){if(typeof cb !== "function") /*  [Promises/A+ 2.2.1, 2.2.7.3, 2.2.7.4]  */next[method].call(next,value); /*  [Promises/A+ 2.2.7.3, 2.2.7.4]  */else {var result;try{result = cb(value);} /*  [Promises/A+ 2.2.2.1, 2.2.3.1, 2.2.5, 3.2]  */catch(e) {next.reject(e); /*  [Promises/A+ 2.2.7.2]  */return;}resolve(next,result); /*  [Promises/A+ 2.2.7.1]  */}};}; /*  "Promise Resolution Procedure"  */ /*  [Promises/A+ 2.3]  */var resolve=function resolve(promise,x){ /*  sanity check arguments  */ /*  [Promises/A+ 2.3.1]  */if(promise === x || promise.proxy === x){promise.reject(new TypeError("cannot resolve promise with itself"));return;} /*  surgically check for a "then" method
					(mainly to just call the "getter" of "then" only once)  */var then;if(typeof x === "object" && x !== null || typeof x === "function"){try{then = x.then;} /*  [Promises/A+ 2.3.3.1, 3.5]  */catch(e) {promise.reject(e); /*  [Promises/A+ 2.3.3.2]  */return;}} /*  handle own Thenables    [Promises/A+ 2.3.2]
					and similar "thenables" [Promises/A+ 2.3.3]  */if(typeof then === "function"){var resolved=false;try{ /*  call retrieved "then" method */ /*  [Promises/A+ 2.3.3.3]  */then.call(x, /*  resolvePromise  */function(y){if(resolved)return;resolved = true; /*  [Promises/A+ 2.3.3.3.3]  */if(y === x) /*  [Promises/A+ 3.6]  */promise.reject(new TypeError("circular thenable chain"));else resolve(promise,y);}, /*  rejectPromise  */function(r){if(resolved)return;resolved = true; /*  [Promises/A+ 2.3.3.3.3]  */promise.reject(r);});}catch(e) {if(!resolved) /*  [Promises/A+ 2.3.3.3.3]  */promise.reject(e); /*  [Promises/A+ 2.3.3.3.4]  */}return;} /*  handle other values  */promise.fulfill(x); /*  [Promises/A+ 2.3.4, 2.3.3.4]  */}; /*  export API  */return api;})(), //jscs:enable
	// Event
	// A contructor superclass for adding event menthods, on, off, emit.
	Event:function Event(){var separator=/[\s\,]+/; // If this doesn't support getPrototype then we can't get prototype.events of the parent
	// So lets get the current instance events, and add those to a parent property
	this.parent = {events:this.events,findEvents:this.findEvents,parent:this.parent,utils:this.utils};this.events = {}; // On, subscribe to events
	// @param evt   string
	// @param callback  function
	this.on = function(evt,callback){if(callback && typeof callback === 'function'){var a=evt.split(separator);for(var i=0;i < a.length;i++) { // Has this event already been fired on this instance?
	this.events[a[i]] = [callback].concat(this.events[a[i]] || []);}}return this;}; // Off, unsubscribe to events
	// @param evt   string
	// @param callback  function
	this.off = function(evt,callback){this.findEvents(evt,function(name,index){if(!callback || this.events[name][index] === callback){this.events[name][index] = null;}});return this;}; // Emit
	// Triggers any subscribed events
	this.emit = function(evt /*, data, ... */){ // Get arguments as an Array, knock off the first one
	var args=Array.prototype.slice.call(arguments,1);args.push(evt); // Handler
	var handler=function handler(name,index){ // Replace the last property with the event name
	args[args.length - 1] = name === '*'?evt:name; // Trigger
	this.events[name][index].apply(this,args);}; // Find the callbacks which match the condition and call
	var _this=this;while(_this && _this.findEvents) { // Find events which match
	_this.findEvents(evt + ',*',handler);_this = _this.parent;}return this;}; //
	// Easy functions
	this.emitAfter = function(){var _this=this;var args=arguments;setTimeout(function(){_this.emit.apply(_this,args);},0);return this;};this.findEvents = function(evt,callback){var a=evt.split(separator);for(var name in this.events) {if(this.events.hasOwnProperty(name)){if(a.indexOf(name) > -1){for(var i=0;i < this.events[name].length;i++) { // Does the event handler exist?
	if(this.events[name][i]){ // Emit on the local instance of this
	callback.call(this,name,i);}}}}}};return this;}, // Global Events
	// Attach the callback to the window object
	// Return its unique reference
	globalEvent:function globalEvent(callback,guid){ // If the guid has not been supplied then create a new one.
	guid = guid || '_hellojs_' + parseInt(Math.random() * 1e12,10).toString(36); // Define the callback function
	window[guid] = function(){ // Trigger the callback
	try{if(callback.apply(this,arguments)){delete window[guid];}}catch(e) {console.error(e);}};return guid;}, // Trigger a clientside popup
	// This has been augmented to support PhoneGap
	popup:function popup(url,redirectUri,options){var documentElement=document.documentElement; // Multi Screen Popup Positioning (http://stackoverflow.com/a/16861050)
	// Credit: http://www.xtf.dk/2011/08/center-new-popup-window-even-on.html
	// Fixes dual-screen position                         Most browsers      Firefox
	if(options.height){var dualScreenTop=window.screenTop !== undefined?window.screenTop:screen.top;var height=screen.height || window.innerHeight || documentElement.clientHeight;options.top = parseInt((height - options.height) / 2,10) + dualScreenTop;}if(options.width){var dualScreenLeft=window.screenLeft !== undefined?window.screenLeft:screen.left;var width=screen.width || window.innerWidth || documentElement.clientWidth;options.left = parseInt((width - options.width) / 2,10) + dualScreenLeft;} // Convert options into an array
	var optionsArray=[];Object.keys(options).forEach(function(name){var value=options[name];optionsArray.push(name + (value !== null?'=' + value:''));}); // Create a function for reopening the popup, and assigning events to the new popup object
	// This is a fix whereby triggering the
	var open=function open(url){ // Trigger callback
	var popup=window.open(url,'_blank',optionsArray.join(',')); // PhoneGap support
	// Add an event listener to listen to the change in the popup windows URL
	// This must appear before popup.focus();
	try{if(popup && popup.addEventListener){ // Get the origin of the redirect URI
	var a=hello.utils.url(redirectUri);var redirectUriOrigin=a.origin || a.protocol + '//' + a.hostname; // Listen to changes in the InAppBrowser window
	popup.addEventListener('loadstart',function(e){var url=e.url; // Is this the path, as given by the redirectUri?
	// Check the new URL agains the redirectUriOrigin.
	// According to #63 a user could click 'cancel' in some dialog boxes ....
	// The popup redirects to another page with the same origin, yet we still wish it to close.
	if(url.indexOf(redirectUriOrigin) !== 0){return;} // Split appart the URL
	var a=hello.utils.url(url); // We dont have window operations on the popup so lets create some
	// The location can be augmented in to a location object like so...
	var _popup={location:{ // Change the location of the popup
	assign:function assign(location){ // Unfourtunatly an app is may not change the location of a InAppBrowser window.
	// So to shim this, just open a new one.
	popup.addEventListener('exit',function(){ // For some reason its failing to close the window if a new window opens too soon.
	setTimeout(function(){open(location);},1000);});},search:a.search,hash:a.hash,href:a.href},close:function close(){if(popup.close){popup.close();}}}; // Then this URL contains information which HelloJS must process
	// URL string
	// Window - any action such as window relocation goes here
	// Opener - the parent window which opened this, aka this script
	hello.utils.responseHandler(_popup,window); // Always close the popup regardless of whether the hello.utils.responseHandler detects a state parameter or not in the querystring.
	// Such situations might arise such as those in #63
	_popup.close();});}}catch(e) {}if(popup && popup.focus){popup.focus();}return popup;}; // Call the open() function with the initial path
	//
	// OAuth redirect, fixes URI fragments from being lost in Safari
	// (URI Fragments within 302 Location URI are lost over HTTPS)
	// Loading the redirect.html before triggering the OAuth Flow seems to fix it.
	//
	// Firefox  decodes URL fragments when calling location.hash.
	//  - This is bad if the value contains break points which are escaped
	//  - Hence the url must be encoded twice as it contains breakpoints.
	if(navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1){url = redirectUri + '#oauth_redirect=' + encodeURIComponent(encodeURIComponent(url));}return open(url);}, // OAuth and API response handler
	responseHandler:function responseHandler(window,parent){var _this=this;var p;var location=window.location; // Is this an auth relay message which needs to call the proxy?
	p = _this.param(location.search); // OAuth2 or OAuth1 server response?
	if(p && p.state && (p.code || p.oauth_token)){var state=JSON.parse(p.state); // Add this path as the redirect_uri
	p.redirect_uri = state.redirect_uri || location.href.replace(/[\?\#].*$/,''); // Redirect to the host
	var path=state.oauth_proxy + '?' + _this.param(p);location.assign(path);return;} // Save session, from redirected authentication
	// #access_token has come in?
	//
	// FACEBOOK is returning auth errors within as a query_string... thats a stickler for consistency.
	// SoundCloud is the state in the querystring and the token in the hashtag, so we'll mix the two together
	p = _this.merge(_this.param(location.search || ''),_this.param(location.hash || '')); // If p.state
	if(p && 'state' in p){ // Remove any addition information
	// E.g. p.state = 'facebook.page';
	try{var a=JSON.parse(p.state);_this.extend(p,a);}catch(e) {console.error('Could not decode state parameter');} // Access_token?
	if('access_token' in p && p.access_token && p.network){if(!p.expires_in || parseInt(p.expires_in,10) === 0){ // If p.expires_in is unset, set to 0
	p.expires_in = 0;}p.expires_in = parseInt(p.expires_in,10);p.expires = new Date().getTime() / 1e3 + (p.expires_in || 60 * 60 * 24 * 365); // Lets use the "state" to assign it to one of our networks
	authCallback(p,window,parent);} // Error=?
	// &error_description=?
	// &state=?
	else if('error' in p && p.error && p.network){p.error = {code:p.error,message:p.error_message || p.error_description}; // Let the state handler handle it
	authCallback(p,window,parent);} // API call, or a cancelled login
	// Result is serialized JSON string
	else if(p.callback && p.callback in parent){ // Trigger a function in the parent
	var res='result' in p && p.result?JSON.parse(p.result):false; // Trigger the callback on the parent
	parent[p.callback](res);closeWindow();} // If this page is still open
	if(p.page_uri){location.assign(p.page_uri);}} // OAuth redirect, fixes URI fragments from being lost in Safari
	// (URI Fragments within 302 Location URI are lost over HTTPS)
	// Loading the redirect.html before triggering the OAuth Flow seems to fix it.
	else if('oauth_redirect' in p){location.assign(decodeURIComponent(p.oauth_redirect));return;} // Trigger a callback to authenticate
	function authCallback(obj,window,parent){var cb=obj.callback;var network=obj.network; // Trigger the callback on the parent
	_this.store(network,obj); // If this is a page request it has no parent or opener window to handle callbacks
	if('display' in obj && obj.display === 'page'){return;} // Remove from session object
	if(parent && cb && cb in parent){try{delete obj.callback;}catch(e) {} // Update store
	_this.store(network,obj); // Call the globalEvent function on the parent
	// It's safer to pass back a string to the parent,
	// Rather than an object/array (better for IE8)
	var str=JSON.stringify(obj);try{parent[cb](str);}catch(e) { // Error thrown whilst executing parent callback
	}}closeWindow();}function closeWindow(){ // Close this current window
	try{window.close();}catch(e) {} // IOS bug wont let us close a popup if still loading
	if(window.addEventListener){window.addEventListener('load',function(){window.close();});}}}}); // Events
	// Extend the hello object with its own event instance
	hello.utils.Event.call(hello); /////////////////////////////////////
	//
	// Save any access token that is in the current page URL
	// Handle any response solicited through iframe hash tag following an API request
	//
	/////////////////////////////////////
	hello.utils.responseHandler(window,window.opener || window.parent); ///////////////////////////////////
	// Monitoring session state
	// Check for session changes
	///////////////////////////////////
	(function(hello){ // Monitor for a change in state and fire
	var oldSessions={}; // Hash of expired tokens
	var expired={}; // Listen to other triggers to Auth events, use these to update this
	hello.on('auth.login, auth.logout',function(auth){if(auth && typeof auth === 'object' && auth.network){oldSessions[auth.network] = hello.utils.store(auth.network) || {};}});(function self(){var CURRENT_TIME=new Date().getTime() / 1e3;var emit=function emit(eventName){hello.emit('auth.' + eventName,{network:name,authResponse:session});}; // Loop through the services
	for(var name in hello.services) {if(hello.services.hasOwnProperty(name)){if(!hello.services[name].id){ // We haven't attached an ID so dont listen.
	continue;} // Get session
	var session=hello.utils.store(name) || {};var provider=hello.services[name];var oldSess=oldSessions[name] || {}; // Listen for globalEvents that did not get triggered from the child
	if(session && 'callback' in session){ // To do remove from session object...
	var cb=session.callback;try{delete session.callback;}catch(e) {} // Update store
	// Removing the callback
	hello.utils.store(name,session); // Emit global events
	try{window[cb](session);}catch(e) {}} // Refresh token
	if(session && 'expires' in session && session.expires < CURRENT_TIME){ // If auto refresh is possible
	// Either the browser supports
	var refresh=provider.refresh || session.refresh_token; // Has the refresh been run recently?
	if(refresh && (!(name in expired) || expired[name] < CURRENT_TIME)){ // Try to resignin
	hello.emit('notice',name + ' has expired trying to resignin');hello.login(name,{display:'none',force:false}); // Update expired, every 10 minutes
	expired[name] = CURRENT_TIME + 600;} // Does this provider not support refresh
	else if(!refresh && !(name in expired)){ // Label the event
	emit('expired');expired[name] = true;} // If session has expired then we dont want to store its value until it can be established that its been updated
	continue;} // Has session changed?
	else if(oldSess.access_token === session.access_token && oldSess.expires === session.expires){continue;} // Access_token has been removed
	else if(!session.access_token && oldSess.access_token){emit('logout');} // Access_token has been created
	else if(session.access_token && !oldSess.access_token){emit('login');} // Access_token has been updated
	else if(session.expires !== oldSess.expires){emit('update');} // Updated stored session
	oldSessions[name] = session; // Remove the expired flags
	if(name in expired){delete expired[name];}}} // Check error events
	setTimeout(self,1000);})();})(hello); // EOF CORE lib
	//////////////////////////////////
	/////////////////////////////////////////
	// API
	// @param path    string
	// @param query   object (optional)
	// @param method  string (optional)
	// @param data    object (optional)
	// @param timeout integer (optional)
	// @param callback  function (optional)
	hello.api = function(){ // Shorthand
	var _this=this;var utils=_this.utils;var error=utils.error; // Construct a new Promise object
	var promise=utils.Promise(); // Arguments
	var p=utils.args({path:'s!',query:'o',method:'s',data:'o',timeout:'i',callback:'f'},arguments); // Method
	p.method = (p.method || 'get').toLowerCase(); // Headers
	p.headers = p.headers || {}; // Query
	p.query = p.query || {}; // If get, put all parameters into query
	if(p.method === 'get' || p.method === 'delete'){utils.extend(p.query,p.data);p.data = {};}var data=p.data = p.data || {}; // Completed event callback
	promise.then(p.callback,p.callback); // Remove the network from path, e.g. facebook:/me/friends
	// Results in { network : facebook, path : me/friends }
	if(!p.path){return promise.reject(error('invalid_path','Missing the path parameter from the request'));}p.path = p.path.replace(/^\/+/,'');var a=(p.path.split(/[\/\:]/,2) || [])[0].toLowerCase();if(a in _this.services){p.network = a;var reg=new RegExp('^' + a + ':?\/?');p.path = p.path.replace(reg,'');} // Network & Provider
	// Define the network that this request is made for
	p.network = _this.settings.default_service = p.network || _this.settings.default_service;var o=_this.services[p.network]; // INVALID
	// Is there no service by the given network name?
	if(!o){return promise.reject(error('invalid_network','Could not match the service requested: ' + p.network));} // PATH
	// As long as the path isn't flagged as unavaiable, e.g. path == false
	if(!(!(p.method in o) || !(p.path in o[p.method]) || o[p.method][p.path] !== false)){return promise.reject(error('invalid_path','The provided path is not available on the selected network'));} // PROXY
	// OAuth1 calls always need a proxy
	if(!p.oauth_proxy){p.oauth_proxy = _this.settings.oauth_proxy;}if(!('proxy' in p)){p.proxy = p.oauth_proxy && o.oauth && parseInt(o.oauth.version,10) === 1;} // TIMEOUT
	// Adopt timeout from global settings by default
	if(!('timeout' in p)){p.timeout = _this.settings.timeout;} // Format response
	// Whether to run the raw response through post processing.
	if(!('formatResponse' in p)){p.formatResponse = true;} // Get the current session
	// Append the access_token to the query
	p.authResponse = _this.getAuthResponse(p.network);if(p.authResponse && p.authResponse.access_token){p.query.access_token = p.authResponse.access_token;}var url=p.path;var m; // Store the query as options
	// This is used to populate the request object before the data is augmented by the prewrap handlers.
	p.options = utils.clone(p.query); // Clone the data object
	// Prevent this script overwriting the data of the incoming object.
	// Ensure that everytime we run an iteration the callbacks haven't removed some data
	p.data = utils.clone(data); // URL Mapping
	// Is there a map for the given URL?
	var actions=o[({'delete':'del'})[p.method] || p.method] || {}; // Extrapolate the QueryString
	// Provide a clean path
	// Move the querystring into the data
	if(p.method === 'get'){var query=url.split(/[\?#]/)[1];if(query){utils.extend(p.query,utils.param(query)); // Remove the query part from the URL
	url = url.replace(/\?.*?(#|$)/,'$1');}} // Is the hash fragment defined
	if(m = url.match(/#(.+)/,'')){url = url.split('#')[0];p.path = m[1];}else if(url in actions){p.path = url;url = actions[url];}else if('default' in actions){url = actions['default'];} // Redirect Handler
	// This defines for the Form+Iframe+Hash hack where to return the results too.
	p.redirect_uri = _this.settings.redirect_uri; // Define FormatHandler
	// The request can be procesed in a multitude of ways
	// Here's the options - depending on the browser and endpoint
	p.xhr = o.xhr;p.jsonp = o.jsonp;p.form = o.form; // Make request
	if(typeof url === 'function'){ // Does self have its own callback?
	url(p,getPath);}else { // Else the URL is a string
	getPath(url);}return promise.proxy; // If url needs a base
	// Wrap everything in
	function getPath(url){ // Format the string if it needs it
	url = url.replace(/\@\{([a-z\_\-]+)(\|.*?)?\}/gi,function(m,key,defaults){var val=defaults?defaults.replace(/^\|/,''):'';if(key in p.query){val = p.query[key];delete p.query[key];}else if(p.data && key in p.data){val = p.data[key];delete p.data[key];}else if(!defaults){promise.reject(error('missing_attribute','The attribute ' + key + ' is missing from the request'));}return val;}); // Add base
	if(!url.match(/^https?:\/\//)){url = o.base + url;} // Define the request URL
	p.url = url; // Make the HTTP request with the curated request object
	// CALLBACK HANDLER
	// @ response object
	// @ statusCode integer if available
	utils.request(p,function(r,headers){ // Is this a raw response?
	if(!p.formatResponse){ // Bad request? error statusCode or otherwise contains an error response vis JSONP?
	if(typeof headers === 'object'?headers.statusCode >= 400:typeof r === 'object' && 'error' in r){promise.reject(r);}else {promise.fulfill(r);}return;} // Should this be an object
	if(r === true){r = {success:true};}else if(!r){r = {};} // The delete callback needs a better response
	if(p.method === 'delete'){r = !r || utils.isEmpty(r)?{success:true}:r;} // FORMAT RESPONSE?
	// Does self request have a corresponding formatter
	if(o.wrap && (p.path in o.wrap || 'default' in o.wrap)){var wrap=p.path in o.wrap?p.path:'default';var time=new Date().getTime(); // FORMAT RESPONSE
	var b=o.wrap[wrap](r,headers,p); // Has the response been utterly overwritten?
	// Typically self augments the existing object.. but for those rare occassions
	if(b){r = b;}} // Is there a next_page defined in the response?
	if(r && 'paging' in r && r.paging.next){ // Add the relative path if it is missing from the paging/next path
	if(r.paging.next[0] === '?'){r.paging.next = p.path + r.paging.next;} // The relative path has been defined, lets markup the handler in the HashFragment
	else {r.paging.next += '#' + p.path;}} // Dispatch to listeners
	// Emit events which pertain to the formatted response
	if(!r || 'error' in r){promise.reject(r);}else {promise.fulfill(r);}});}}; // API utilities
	hello.utils.extend(hello.utils,{ // Make an HTTP request
	request:function request(p,callback){var _this=this;var error=_this.error; // This has to go through a POST request
	if(!_this.isEmpty(p.data) && !('FileList' in window) && _this.hasBinary(p.data)){ // Disable XHR and JSONP
	p.xhr = false;p.jsonp = false;} // Check if the browser and service support CORS
	var cors=this.request_cors(function(){ // If it does then run this...
	return p.xhr === undefined || p.xhr && (typeof p.xhr !== 'function' || p.xhr(p,p.query));});if(cors){formatUrl(p,function(url){var x=_this.xhr(p.method,url,p.headers,p.data,callback);x.onprogress = p.onprogress || null; // Windows Phone does not support xhr.upload, see #74
	// Feature detect
	if(x.upload && p.onuploadprogress){x.upload.onprogress = p.onuploadprogress;}});return;} // Clone the query object
	// Each request modifies the query object and needs to be tared after each one.
	var _query=p.query;p.query = _this.clone(p.query); // Assign a new callbackID
	p.callbackID = _this.globalEvent(); // JSONP
	if(p.jsonp !== false){ // Clone the query object
	p.query.callback = p.callbackID; // If the JSONP is a function then run it
	if(typeof p.jsonp === 'function'){p.jsonp(p,p.query);} // Lets use JSONP if the method is 'get'
	if(p.method === 'get'){formatUrl(p,function(url){_this.jsonp(url,callback,p.callbackID,p.timeout);});return;}else { // It's not compatible reset query
	p.query = _query;}} // Otherwise we're on to the old school, iframe hacks and JSONP
	if(p.form !== false){ // Add some additional query parameters to the URL
	// We're pretty stuffed if the endpoint doesn't like these
	p.query.redirect_uri = p.redirect_uri;p.query.state = JSON.stringify({callback:p.callbackID});var opts;if(typeof p.form === 'function'){ // Format the request
	opts = p.form(p,p.query);}if(p.method === 'post' && opts !== false){formatUrl(p,function(url){_this.post(url,p.data,opts,callback,p.callbackID,p.timeout);});return;}} // None of the methods were successful throw an error
	callback(error('invalid_request','There was no mechanism for handling this request'));return; // Format URL
	// Constructs the request URL, optionally wraps the URL through a call to a proxy server
	// Returns the formatted URL
	function formatUrl(p,callback){ // Are we signing the request?
	var sign; // OAuth1
	// Remove the token from the query before signing
	if(p.authResponse && p.authResponse.oauth && parseInt(p.authResponse.oauth.version,10) === 1){ // OAUTH SIGNING PROXY
	sign = p.query.access_token; // Remove the access_token
	delete p.query.access_token; // Enfore use of Proxy
	p.proxy = true;} // POST body to querystring
	if(p.data && (p.method === 'get' || p.method === 'delete')){ // Attach the p.data to the querystring.
	_this.extend(p.query,p.data);p.data = null;} // Construct the path
	var path=_this.qs(p.url,p.query); // Proxy the request through a server
	// Used for signing OAuth1
	// And circumventing services without Access-Control Headers
	if(p.proxy){ // Use the proxy as a path
	path = _this.qs(p.oauth_proxy,{path:path,access_token:sign || '', // This will prompt the request to be signed as though it is OAuth1
	then:p.proxy_response_type || (p.method.toLowerCase() === 'get'?'redirect':'proxy'),method:p.method.toLowerCase(),suppress_response_codes:true});}callback(path);}}, // Test whether the browser supports the CORS response
	request_cors:function request_cors(callback){return 'withCredentials' in new XMLHttpRequest() && callback();}, // Return the type of DOM object
	domInstance:function domInstance(type,data){var test='HTML' + (type || '').replace(/^[a-z]/,function(m){return m.toUpperCase();}) + 'Element';if(!data){return false;}if(window[test]){return data instanceof window[test];}else if(window.Element){return data instanceof window.Element && (!type || data.tagName && data.tagName.toLowerCase() === type);}else {return !(data instanceof Object || data instanceof Array || data instanceof String || data instanceof Number) && data.tagName && data.tagName.toLowerCase() === type;}}, // Create a clone of an object
	clone:function clone(obj){ // Does not clone DOM elements, nor Binary data, e.g. Blobs, Filelists
	if(obj === null || typeof obj !== 'object' || obj instanceof Date || 'nodeName' in obj || this.isBinary(obj)){return obj;}if(Array.isArray(obj)){ // Clone each item in the array
	return obj.map(this.clone.bind(this));} // But does clone everything else.
	var clone={};for(var x in obj) {clone[x] = this.clone(obj[x]);}return clone;}, // XHR: uses CORS to make requests
	xhr:function xhr(method,url,headers,data,callback){var r=new XMLHttpRequest();var error=this.error; // Binary?
	var binary=false;if(method === 'blob'){binary = method;method = 'GET';}method = method.toUpperCase(); // Xhr.responseType 'json' is not supported in any of the vendors yet.
	r.onload = function(e){var json=r.response;try{json = JSON.parse(r.responseText);}catch(_e) {if(r.status === 401){json = error('access_denied',r.statusText);}}var headers=headersToJSON(r.getAllResponseHeaders());headers.statusCode = r.status;callback(json || (method === 'GET'?error('empty_response','Could not get resource'):{}),headers);};r.onerror = function(e){var json=r.responseText;try{json = JSON.parse(r.responseText);}catch(_e) {}callback(json || error('access_denied','Could not get resource'));};var x; // Should we add the query to the URL?
	if(method === 'GET' || method === 'DELETE'){data = null;}else if(data && typeof data !== 'string' && !(data instanceof FormData) && !(data instanceof File) && !(data instanceof Blob)){ // Loop through and add formData
	var f=new FormData();for(x in data) if(data.hasOwnProperty(x)){if(data[x] instanceof HTMLInputElement){if('files' in data[x] && data[x].files.length > 0){f.append(x,data[x].files[0]);}}else if(data[x] instanceof Blob){f.append(x,data[x],data.name);}else {f.append(x,data[x]);}}data = f;} // Open the path, async
	r.open(method,url,true);if(binary){if('responseType' in r){r.responseType = binary;}else {r.overrideMimeType('text/plain; charset=x-user-defined');}} // Set any bespoke headers
	if(headers){for(x in headers) {r.setRequestHeader(x,headers[x]);}}r.send(data);return r; // Headers are returned as a string
	function headersToJSON(s){var r={};var reg=/([a-z\-]+):\s?(.*);?/gi;var m;while(m = reg.exec(s)) {r[m[1]] = m[2];}return r;}}, // JSONP
	// Injects a script tag into the DOM to be executed and appends a callback function to the window object
	// @param string/function pathFunc either a string of the URL or a callback function pathFunc(querystringhash, continueFunc);
	// @param function callback a function to call on completion;
	jsonp:function jsonp(url,callback,callbackID,timeout){var _this=this;var error=_this.error; // Change the name of the callback
	var bool=0;var head=document.getElementsByTagName('head')[0];var operaFix;var result=error('server_error','server_error');var cb=function cb(){if(! bool++){window.setTimeout(function(){callback(result);head.removeChild(script);},0);}}; // Add callback to the window object
	callbackID = _this.globalEvent(function(json){result = json;return true; // Mark callback as done
	},callbackID); // The URL is a function for some cases and as such
	// Determine its value with a callback containing the new parameters of this function.
	url = url.replace(new RegExp('=\\?(&|$)'),'=' + callbackID + '$1'); // Build script tag
	var script=_this.append('script',{id:callbackID,name:callbackID,src:url,async:true,onload:cb,onerror:cb,onreadystatechange:function onreadystatechange(){if(/loaded|complete/i.test(this.readyState)){cb();}}}); // Opera fix error
	// Problem: If an error occurs with script loading Opera fails to trigger the script.onerror handler we specified
	//
	// Fix:
	// By setting the request to synchronous we can trigger the error handler when all else fails.
	// This action will be ignored if we've already called the callback handler "cb" with a successful onload event
	if(window.navigator.userAgent.toLowerCase().indexOf('opera') > -1){operaFix = _this.append('script',{text:'document.getElementById(\'' + callbackID + '\').onerror();'});script.async = false;} // Add timeout
	if(timeout){window.setTimeout(function(){result = error('timeout','timeout');cb();},timeout);} // TODO: add fix for IE,
	// However: unable recreate the bug of firing off the onreadystatechange before the script content has been executed and the value of "result" has been defined.
	// Inject script tag into the head element
	head.appendChild(script); // Append Opera Fix to run after our script
	if(operaFix){head.appendChild(operaFix);}}, // Post
	// Send information to a remote location using the post mechanism
	// @param string uri path
	// @param object data, key value data to send
	// @param function callback, function to execute in response
	post:function post(url,data,options,callback,callbackID,timeout){var _this=this;var error=_this.error;var doc=document; // This hack needs a form
	var form=null;var reenableAfterSubmit=[];var newform;var i=0;var x=null;var bool=0;var cb=function cb(r){if(! bool++){callback(r);}}; // What is the name of the callback to contain
	// We'll also use this to name the iframe
	_this.globalEvent(cb,callbackID); // Build the iframe window
	var win;try{ // IE7 hack, only lets us define the name here, not later.
	win = doc.createElement('<iframe name="' + callbackID + '">');}catch(e) {win = doc.createElement('iframe');}win.name = callbackID;win.id = callbackID;win.style.display = 'none'; // Override callback mechanism. Triggger a response onload/onerror
	if(options && options.callbackonload){ // Onload is being fired twice
	win.onload = function(){cb({response:'posted',message:'Content was posted'});};}if(timeout){setTimeout(function(){cb(error('timeout','The post operation timed out'));},timeout);}doc.body.appendChild(win); // If we are just posting a single item
	if(_this.domInstance('form',data)){ // Get the parent form
	form = data.form; // Loop through and disable all of its siblings
	for(i = 0;i < form.elements.length;i++) {if(form.elements[i] !== data){form.elements[i].setAttribute('disabled',true);}} // Move the focus to the form
	data = form;} // Posting a form
	if(_this.domInstance('form',data)){ // This is a form element
	form = data; // Does this form need to be a multipart form?
	for(i = 0;i < form.elements.length;i++) {if(!form.elements[i].disabled && form.elements[i].type === 'file'){form.encoding = form.enctype = 'multipart/form-data';form.elements[i].setAttribute('name','file');}}}else { // Its not a form element,
	// Therefore it must be a JSON object of Key=>Value or Key=>Element
	// If anyone of those values are a input type=file we shall shall insert its siblings into the form for which it belongs.
	for(x in data) if(data.hasOwnProperty(x)){ // Is this an input Element?
	if(_this.domInstance('input',data[x]) && data[x].type === 'file'){form = data[x].form;form.encoding = form.enctype = 'multipart/form-data';}} // Do If there is no defined form element, lets create one.
	if(!form){ // Build form
	form = doc.createElement('form');doc.body.appendChild(form);newform = form;}var input; // Add elements to the form if they dont exist
	for(x in data) if(data.hasOwnProperty(x)){ // Is this an element?
	var el=_this.domInstance('input',data[x]) || _this.domInstance('textArea',data[x]) || _this.domInstance('select',data[x]); // Is this not an input element, or one that exists outside the form.
	if(!el || data[x].form !== form){ // Does an element have the same name?
	var inputs=form.elements[x];if(input){ // Remove it.
	if(!(inputs instanceof NodeList)){inputs = [inputs];}for(i = 0;i < inputs.length;i++) {inputs[i].parentNode.removeChild(inputs[i]);}} // Create an input element
	input = doc.createElement('input');input.setAttribute('type','hidden');input.setAttribute('name',x); // Does it have a value attribute?
	if(el){input.value = data[x].value;}else if(_this.domInstance(null,data[x])){input.value = data[x].innerHTML || data[x].innerText;}else {input.value = data[x];}form.appendChild(input);} // It is an element, which exists within the form, but the name is wrong
	else if(el && data[x].name !== x){data[x].setAttribute('name',x);data[x].name = x;}} // Disable elements from within the form if they weren't specified
	for(i = 0;i < form.elements.length;i++) {input = form.elements[i]; // Does the same name and value exist in the parent
	if(!(input.name in data) && input.getAttribute('disabled') !== true){ // Disable
	input.setAttribute('disabled',true); // Add re-enable to callback
	reenableAfterSubmit.push(input);}}} // Set the target of the form
	form.setAttribute('method','POST');form.setAttribute('target',callbackID);form.target = callbackID; // Update the form URL
	form.setAttribute('action',url); // Submit the form
	// Some reason this needs to be offset from the current window execution
	setTimeout(function(){form.submit();setTimeout(function(){try{ // Remove the iframe from the page.
	//win.parentNode.removeChild(win);
	// Remove the form
	if(newform){newform.parentNode.removeChild(newform);}}catch(e) {try{console.error('HelloJS: could not remove iframe');}catch(ee) {}} // Reenable the disabled form
	for(var i=0;i < reenableAfterSubmit.length;i++) {if(reenableAfterSubmit[i]){reenableAfterSubmit[i].setAttribute('disabled',false);reenableAfterSubmit[i].disabled = false;}}},0);},100);}, // Some of the providers require that only multipart is used with non-binary forms.
	// This function checks whether the form contains binary data
	hasBinary:function hasBinary(data){for(var x in data) if(data.hasOwnProperty(x)){if(this.isBinary(data[x])){return true;}}return false;}, // Determines if a variable Either Is or like a FormInput has the value of a Blob
	isBinary:function isBinary(data){return data instanceof Object && (this.domInstance('input',data) && data.type === 'file' || 'FileList' in window && data instanceof window.FileList || 'File' in window && data instanceof window.File || 'Blob' in window && data instanceof window.Blob);}, // Convert Data-URI to Blob string
	toBlob:function toBlob(dataURI){var reg=/^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i;var m=dataURI.match(reg);if(!m){return dataURI;}var binary=atob(dataURI.replace(reg,''));var array=[];for(var i=0;i < binary.length;i++) {array.push(binary.charCodeAt(i));}return new Blob([new Uint8Array(array)],{type:m[1]});}}); // EXTRA: Convert FormElement to JSON for POSTing
	// Wrappers to add additional functionality to existing functions
	(function(hello){ // Copy original function
	var api=hello.api;var utils=hello.utils;utils.extend(utils,{ // DataToJSON
	// This takes a FormElement|NodeList|InputElement|MixedObjects and convers the data object to JSON.
	dataToJSON:function dataToJSON(p){var _this=this;var w=window;var data=p.data; // Is data a form object
	if(_this.domInstance('form',data)){data = _this.nodeListToJSON(data.elements);}else if('NodeList' in w && data instanceof NodeList){data = _this.nodeListToJSON(data);}else if(_this.domInstance('input',data)){data = _this.nodeListToJSON([data]);} // Is data a blob, File, FileList?
	if('File' in w && data instanceof w.File || 'Blob' in w && data instanceof w.Blob || 'FileList' in w && data instanceof w.FileList){data = {file:data};} // Loop through data if it's not form data it must now be a JSON object
	if(!('FormData' in w && data instanceof w.FormData)){for(var x in data) if(data.hasOwnProperty(x)){if('FileList' in w && data[x] instanceof w.FileList){if(data[x].length === 1){data[x] = data[x][0];}}else if(_this.domInstance('input',data[x]) && data[x].type === 'file'){continue;}else if(_this.domInstance('input',data[x]) || _this.domInstance('select',data[x]) || _this.domInstance('textArea',data[x])){data[x] = data[x].value;}else if(_this.domInstance(null,data[x])){data[x] = data[x].innerHTML || data[x].innerText;}}}p.data = data;return data;}, // NodeListToJSON
	// Given a list of elements extrapolate their values and return as a json object
	nodeListToJSON:function nodeListToJSON(nodelist){var json={}; // Create a data string
	for(var i=0;i < nodelist.length;i++) {var input=nodelist[i]; // If the name of the input is empty or diabled, dont add it.
	if(input.disabled || !input.name){continue;} // Is this a file, does the browser not support 'files' and 'FormData'?
	if(input.type === 'file'){json[input.name] = input;}else {json[input.name] = input.value || input.innerHTML;}}return json;}}); // Replace it
	hello.api = function(){ // Get arguments
	var p=utils.args({path:'s!',method:'s',data:'o',timeout:'i',callback:'f'},arguments); // Change for into a data object
	if(p.data){utils.dataToJSON(p);}return api.call(this,p);};})(hello); // Script to support ChromeApps
	// This overides the hello.utils.popup method to support chrome.identity.launchWebAuthFlow
	// See https://developer.chrome.com/apps/app_identity#non
	// Is this a chrome app?
	if(typeof chrome === 'object' && typeof chrome.identity === 'object' && chrome.identity.launchWebAuthFlow){(function(){ // Swap the popup method
	hello.utils.popup = function(url){return _open(url,true);}; // Swap the hidden iframe method
	hello.utils.iframe = function(url){_open(url,false);}; // Swap the request_cors method
	hello.utils.request_cors = function(callback){callback(); // Always run as CORS
	return true;}; // Swap the storage method
	var _cache={};chrome.storage.local.get('hello',function(r){ // Update the cache
	_cache = r.hello || {};});hello.utils.store = function(name,value){ // Get all
	if(arguments.length === 0){return _cache;} // Get
	if(arguments.length === 1){return _cache[name] || null;} // Set
	if(value){_cache[name] = value;chrome.storage.local.set({hello:_cache});return value;} // Delete
	if(value === null){delete _cache[name];chrome.storage.local.set({hello:_cache});return null;}}; // Open function
	function _open(url,interactive){ // Launch
	var ref={closed:false}; // Launch the webAuthFlow
	chrome.identity.launchWebAuthFlow({url:url,interactive:interactive},function(responseUrl){ // Did the user cancel this prematurely
	if(responseUrl === undefined){ref.closed = true;return;} // Split appart the URL
	var a=hello.utils.url(responseUrl); // The location can be augmented in to a location object like so...
	// We dont have window operations on the popup so lets create some
	var _popup={location:{ // Change the location of the popup
	assign:function assign(url){ // If there is a secondary reassign
	// In the case of OAuth1
	// Trigger this in non-interactive mode.
	_open(url,false);},search:a.search,hash:a.hash,href:a.href},close:function close(){}}; // Then this URL contains information which HelloJS must process
	// URL string
	// Window - any action such as window relocation goes here
	// Opener - the parent window which opened this, aka this script
	hello.utils.responseHandler(_popup,window);}); // Return the reference
	return ref;}})();}(function(hello){ // OAuth1
	var OAuth1Settings={version:'1.0',auth:'https://www.dropbox.com/1/oauth/authorize',request:'https://api.dropbox.com/1/oauth/request_token',token:'https://api.dropbox.com/1/oauth/access_token'}; // OAuth2 Settings
	var OAuth2Settings={version:2,auth:'https://www.dropbox.com/1/oauth2/authorize',grant:'https://api.dropbox.com/1/oauth2/token'}; // Initiate the Dropbox module
	hello.init({dropbox:{name:'Dropbox',oauth:OAuth2Settings,login:function login(p){ // OAuth2 non-standard adjustments
	p.qs.scope = '';delete p.qs.display; // Should this be run as OAuth1?
	// If the redirect_uri is is HTTP (non-secure) then its required to revert to the OAuth1 endpoints
	var redirect=decodeURIComponent(p.qs.redirect_uri);if(redirect.indexOf('http:') === 0 && redirect.indexOf('http://localhost/') !== 0){ // Override the dropbox OAuth settings.
	hello.services.dropbox.oauth = OAuth1Settings;}else { // Override the dropbox OAuth settings.
	hello.services.dropbox.oauth = OAuth2Settings;} // The dropbox login window is a different size
	p.options.popup.width = 1000;p.options.popup.height = 1000;}, /*
					Dropbox does not allow insecure HTTP URI's in the redirect_uri field
					...otherwise I'd love to use OAuth2
	
					Follow request https://forums.dropbox.com/topic.php?id=106505
	
					p.qs.response_type = 'code';
					oauth: {
						version: 2,
						auth: 'https://www.dropbox.com/1/oauth2/authorize',
						grant: 'https://api.dropbox.com/1/oauth2/token'
					}
				*/ // API Base URL
	base:'https://api.dropbox.com/1/', // Bespoke setting: this is states whether to use the custom environment of Dropbox or to use their own environment
	// Because it's notoriously difficult for Dropbox too provide access from other webservices, this defaults to Sandbox
	root:'sandbox', // Map GET requests
	get:{me:'account/info', // Https://www.dropbox.com/developers/core/docs#metadata
	'me/files':req('metadata/auto/@{parent|}'),'me/folder':req('metadata/auto/@{id}'),'me/folders':req('metadata/auto/'),'default':function _default(p,callback){if(p.path.match('https://api-content.dropbox.com/1/files/')){ // This is a file, return binary data
	p.method = 'blob';}callback(p.path);}},post:{'me/files':function meFiles(p,callback){var path=p.data.parent;var fileName=p.data.name;p.data = {file:p.data.file}; // Does this have a data-uri to upload as a file?
	if(typeof p.data.file === 'string'){p.data.file = hello.utils.toBlob(p.data.file);}callback('https://api-content.dropbox.com/1/files_put/auto/' + path + '/' + fileName);},'me/folders':function meFolders(p,callback){var name=p.data.name;p.data = {};callback('fileops/create_folder?root=@{root|sandbox}&' + hello.utils.param({path:name}));}}, // Map DELETE requests
	del:{'me/files':'fileops/delete?root=@{root|sandbox}&path=@{id}','me/folder':'fileops/delete?root=@{root|sandbox}&path=@{id}'},wrap:{me:function me(o){formatError(o);if(!o.uid){return o;}o.name = o.display_name;var m=o.name.split(' ');o.first_name = m.shift();o.last_name = m.join(' ');o.id = o.uid;delete o.uid;delete o.display_name;return o;},'default':function _default(o,headers,req){formatError(o);if(o.is_dir && o.contents){o.data = o.contents;delete o.contents;o.data.forEach(function(item){item.root = o.root;formatFile(item,headers,req);});}formatFile(o,headers,req);if(o.is_deleted){o.success = true;}return o;}}, // Doesn't return the CORS headers
	xhr:function xhr(p){ // The proxy supports allow-cross-origin-resource
	// Alas that's the only thing we're using.
	if(p.data && p.data.file){var file=p.data.file;if(file){if(file.files){p.data = file.files[0];}else {p.data = file;}}}if(p.method === 'delete'){p.method = 'post';}return true;},form:function form(p,qs){delete qs.state;delete qs.redirect_uri;}}});function formatError(o){if(o && 'error' in o){o.error = {code:'server_error',message:o.error.message || o.error};}}function formatFile(o,headers,req){if(typeof o !== 'object' || typeof Blob !== 'undefined' && o instanceof Blob || typeof ArrayBuffer !== 'undefined' && o instanceof ArrayBuffer){ // This is a file, let it through unformatted
	return;}if('error' in o){return;}var path=(o.root !== 'app_folder'?o.root:'') + o.path.replace(/\&/g,'%26');path = path.replace(/^\//,'');if(o.thumb_exists){o.thumbnail = req.oauth_proxy + '?path=' + encodeURIComponent('https://api-content.dropbox.com/1/thumbnails/auto/' + path + '?format=jpeg&size=m') + '&access_token=' + req.options.access_token;}o.type = o.is_dir?'folder':o.mime_type;o.name = o.path.replace(/.*\//g,'');if(o.is_dir){o.files = path.replace(/^\//,'');}else {o.downloadLink = hello.settings.oauth_proxy + '?path=' + encodeURIComponent('https://api-content.dropbox.com/1/files/auto/' + path) + '&access_token=' + req.options.access_token;o.file = 'https://api-content.dropbox.com/1/files/auto/' + path;}if(!o.id){o.id = o.path.replace(/^\//,'');} // O.media = 'https://api-content.dropbox.com/1/files/' + path;
	}function req(str){return function(p,cb){delete p.query.limit;cb(str);};}})(hello);(function(hello){hello.init({facebook:{name:'Facebook', // SEE https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/v2.1
	oauth:{version:2,auth:'https://www.facebook.com/dialog/oauth/',grant:'https://graph.facebook.com/oauth/access_token'}, // Authorization scopes
	scope:{basic:'public_profile',email:'email',share:'user_posts',birthday:'user_birthday',events:'user_events',photos:'user_photos,user_videos',videos:'user_photos,user_videos',friends:'user_friends',files:'user_photos,user_videos',publish_files:'user_photos,user_videos,publish_actions',publish:'publish_actions', // Deprecated in v2.0
	// Create_event	: 'create_event',
	offline_access:'offline_access'}, // Refresh the access_token
	refresh:true,login:function login(p){ // Reauthenticate
	// https://developers.facebook.com/docs/facebook-login/reauthentication
	if(p.options.force){p.qs.auth_type = 'reauthenticate';} // The facebook login window is a different size.
	p.options.popup.width = 580;p.options.popup.height = 400;},logout:function logout(callback,options){ // Assign callback to a global handler
	var callbackID=hello.utils.globalEvent(callback);var redirect=encodeURIComponent(hello.settings.redirect_uri + '?' + hello.utils.param({callback:callbackID,result:JSON.stringify({force:true}),state:'{}'}));var token=(options.authResponse || {}).access_token;hello.utils.iframe('https://www.facebook.com/logout.php?next=' + redirect + '&access_token=' + token); // Possible responses:
	// String URL	- hello.logout should handle the logout
	// Undefined	- this function will handle the callback
	// True - throw a success, this callback isn't handling the callback
	// False - throw a error
	if(!token){ // If there isn't a token, the above wont return a response, so lets trigger a response
	return false;}}, // API Base URL
	base:'https://graph.facebook.com/v2.4/', // Map GET requests
	get:{me:'me?fields=email,first_name,last_name,name,timezone,verified','me/friends':'me/friends','me/following':'me/friends','me/followers':'me/friends','me/share':'me/feed','me/like':'me/likes','me/files':'me/albums','me/albums':'me/albums?fields=cover_photo,name','me/album':'@{id}/photos?fields=picture','me/photos':'me/photos','me/photo':'@{id}','friend/albums':'@{id}/albums','friend/photos':'@{id}/photos' // Pagination
	// Https://developers.facebook.com/docs/reference/api/pagination/
	}, // Map POST requests
	post:{'me/share':'me/feed','me/photo':'@{id}' // Https://developers.facebook.com/docs/graph-api/reference/v2.2/object/likes/
	},wrap:{me:formatUser,'me/friends':formatFriends,'me/following':formatFriends,'me/followers':formatFriends,'me/albums':format,'me/photos':format,'me/files':format,'default':format}, // Special requirements for handling XHR
	xhr:function xhr(p,qs){if(p.method === 'get' || p.method === 'post'){qs.suppress_response_codes = true;} // Is this a post with a data-uri?
	if(p.method === 'post' && p.data && typeof p.data.file === 'string'){ // Convert the Data-URI to a Blob
	p.data.file = hello.utils.toBlob(p.data.file);}return true;}, // Special requirements for handling JSONP fallback
	jsonp:function jsonp(p,qs){var m=p.method;if(m !== 'get' && !hello.utils.hasBinary(p.data)){p.data.method = m;p.method = 'get';}else if(p.method === 'delete'){qs.method = 'delete';p.method = 'post';}}, // Special requirements for iframe form hack
	form:function form(p){return { // Fire the callback onload
	callbackonload:true};}}});var base='https://graph.facebook.com/';function formatUser(o){if(o.id){o.thumbnail = o.picture = 'https://graph.facebook.com/' + o.id + '/picture';}return o;}function formatFriends(o){if('data' in o){o.data.forEach(formatUser);}return o;}function format(o,headers,req){if(typeof o === 'boolean'){o = {success:o};}if(o && 'data' in o){var token=req.query.access_token;o.data.forEach(function(d){if(d.picture){d.thumbnail = d.picture;}d.pictures = (d.images || []).sort(function(a,b){return a.width - b.width;});if(d.cover_photo && d.cover_photo.id){d.thumbnail = base + d.cover_photo.id + '/picture?access_token=' + token;}if(d.type === 'album'){d.files = d.photos = base + d.id + '/photos';}if(d.can_upload){d.upload_location = base + d.id + '/photos';}});}return o;}})(hello);(function(hello){hello.init({flickr:{name:'Flickr', // Ensure that you define an oauth_proxy
	oauth:{version:'1.0a',auth:'https://www.flickr.com/services/oauth/authorize?perms=read',request:'https://www.flickr.com/services/oauth/request_token',token:'https://www.flickr.com/services/oauth/access_token'}, // API base URL
	base:'https://api.flickr.com/services/rest', // Map GET resquests
	get:{me:sign('flickr.people.getInfo'),'me/friends':sign('flickr.contacts.getList',{per_page:'@{limit|50}'}),'me/following':sign('flickr.contacts.getList',{per_page:'@{limit|50}'}),'me/followers':sign('flickr.contacts.getList',{per_page:'@{limit|50}'}),'me/albums':sign('flickr.photosets.getList',{per_page:'@{limit|50}'}),'me/album':sign('flickr.photosets.getPhotos',{photoset_id:'@{id}'}),'me/photos':sign('flickr.people.getPhotos',{per_page:'@{limit|50}'})},wrap:{me:function me(o){formatError(o);o = checkResponse(o,'person');if(o.id){if(o.realname){o.name = o.realname._content;var m=o.name.split(' ');o.first_name = m.shift();o.last_name = m.join(' ');}o.thumbnail = getBuddyIcon(o,'l');o.picture = getBuddyIcon(o,'l');}return o;},'me/friends':formatFriends,'me/followers':formatFriends,'me/following':formatFriends,'me/albums':function meAlbums(o){formatError(o);o = checkResponse(o,'photosets');paging(o);if(o.photoset){o.data = o.photoset;o.data.forEach(function(item){item.name = item.title._content;item.photos = 'https://api.flickr.com/services/rest' + getApiUrl('flickr.photosets.getPhotos',{photoset_id:item.id},true);});delete o.photoset;}return o;},'me/photos':function mePhotos(o){formatError(o);return formatPhotos(o);},'default':function _default(o){formatError(o);return formatPhotos(o);}},xhr:false,jsonp:function jsonp(p,qs){if(p.method == 'get'){delete qs.callback;qs.jsoncallback = p.callbackID;}}}});function getApiUrl(method,extraParams,skipNetwork){var url=(skipNetwork?'':'flickr:') + '?method=' + method + '&api_key=' + hello.services.flickr.id + '&format=json';for(var param in extraParams) {if(extraParams.hasOwnProperty(param)){url += '&' + param + '=' + extraParams[param];}}return url;} // This is not exactly neat but avoid to call
	// The method 'flickr.test.login' for each api call
	function withUser(cb){var auth=hello.getAuthResponse('flickr');cb(auth && auth.user_nsid?auth.user_nsid:null);}function sign(url,params){if(!params){params = {};}return function(p,callback){withUser(function(userId){params.user_id = userId;callback(getApiUrl(url,params,true));});};}function getBuddyIcon(profile,size){var url='https://www.flickr.com/images/buddyicon.gif';if(profile.nsid && profile.iconserver && profile.iconfarm){url = 'https://farm' + profile.iconfarm + '.staticflickr.com/' + profile.iconserver + '/' + 'buddyicons/' + profile.nsid + (size?'_' + size:'') + '.jpg';}return url;} // See: https://www.flickr.com/services/api/misc.urls.html
	function createPhotoUrl(id,farm,server,secret,size){size = size?'_' + size:'';return 'https://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret + size + '.jpg';}function formatUser(o){}function formatError(o){if(o && o.stat && o.stat.toLowerCase() != 'ok'){o.error = {code:'invalid_request',message:o.message};}}function formatPhotos(o){if(o.photoset || o.photos){var set='photoset' in o?'photoset':'photos';o = checkResponse(o,set);paging(o);o.data = o.photo;delete o.photo;for(var i=0;i < o.data.length;i++) {var photo=o.data[i];photo.name = photo.title;photo.picture = createPhotoUrl(photo.id,photo.farm,photo.server,photo.secret,'');photo.pictures = createPictures(photo.id,photo.farm,photo.server,photo.secret);photo.source = createPhotoUrl(photo.id,photo.farm,photo.server,photo.secret,'b');photo.thumbnail = createPhotoUrl(photo.id,photo.farm,photo.server,photo.secret,'m');}}return o;} // See: https://www.flickr.com/services/api/misc.urls.html
	function createPictures(id,farm,server,secret){var NO_LIMIT=2048;var sizes=[{id:'t',max:100},{id:'m',max:240},{id:'n',max:320},{id:'',max:500},{id:'z',max:640},{id:'c',max:800},{id:'b',max:1024},{id:'h',max:1600},{id:'k',max:2048},{id:'o',max:NO_LIMIT}];return sizes.map(function(size){return {source:createPhotoUrl(id,farm,server,secret,size.id), // Note: this is a guess that's almost certain to be wrong (unless square source)
	width:size.max,height:size.max};});}function checkResponse(o,key){if(key in o){o = o[key];}else if(!('error' in o)){o.error = {code:'invalid_request',message:o.message || 'Failed to get data from Flickr'};}return o;}function formatFriends(o){formatError(o);if(o.contacts){o = checkResponse(o,'contacts');paging(o);o.data = o.contact;delete o.contact;for(var i=0;i < o.data.length;i++) {var item=o.data[i];item.id = item.nsid;item.name = item.realname || item.username;item.thumbnail = getBuddyIcon(item,'m');}}return o;}function paging(res){if(res.page && res.pages && res.page !== res.pages){res.paging = {next:'?page=' + ++res.page};}}})(hello);(function(hello){hello.init({foursquare:{name:'Foursquare',oauth:{ // See: https://developer.foursquare.com/overview/auth
	version:2,auth:'https://foursquare.com/oauth2/authenticate',grant:'https://foursquare.com/oauth2/access_token'}, // Refresh the access_token once expired
	refresh:true,base:'https://api.foursquare.com/v2/',get:{me:'users/self','me/friends':'users/self/friends','me/followers':'users/self/friends','me/following':'users/self/friends'},wrap:{me:function me(o){formatError(o);if(o && o.response){o = o.response.user;formatUser(o);}return o;},'default':function _default(o){formatError(o); // Format friends
	if(o && 'response' in o && 'friends' in o.response && 'items' in o.response.friends){o.data = o.response.friends.items;o.data.forEach(formatUser);delete o.response;}return o;}},xhr:formatRequest,jsonp:formatRequest}});function formatError(o){if(o.meta && (o.meta.code === 400 || o.meta.code === 401)){o.error = {code:'access_denied',message:o.meta.errorDetail};}}function formatUser(o){if(o && o.id){o.thumbnail = o.photo.prefix + '100x100' + o.photo.suffix;o.name = o.firstName + ' ' + o.lastName;o.first_name = o.firstName;o.last_name = o.lastName;if(o.contact){if(o.contact.email){o.email = o.contact.email;}}}}function formatRequest(p,qs){var token=qs.access_token;delete qs.access_token;qs.oauth_token = token;qs.v = 20121125;return true;}})(hello);(function(hello){hello.init({github:{name:'GitHub',oauth:{version:2,auth:'https://github.com/login/oauth/authorize',grant:'https://github.com/login/oauth/access_token',response_type:'code'},scope:{basic:'',email:'user:email'},base:'https://api.github.com/',get:{me:'user','me/friends':'user/following?per_page=@{limit|100}','me/following':'user/following?per_page=@{limit|100}','me/followers':'user/followers?per_page=@{limit|100}','me/like':'user/starred?per_page=@{limit|100}'},wrap:{me:function me(o,headers){formatError(o,headers);formatUser(o);return o;},'default':function _default(o,headers,req){formatError(o,headers);if(Array.isArray(o)){o = {data:o};}if(o.data){paging(o,headers,req);o.data.forEach(formatUser);}return o;}},xhr:function xhr(p){if(p.method !== 'get' && p.data){ // Serialize payload as JSON
	p.headers = p.headers || {};p.headers['Content-Type'] = 'application/json';if(typeof p.data === 'object'){p.data = JSON.stringify(p.data);}}return true;}}});function formatError(o,headers){var code=headers?headers.statusCode:o && 'meta' in o && 'status' in o.meta && o.meta.status;if(code === 401 || code === 403){o.error = {code:'access_denied',message:o.message || (o.data?o.data.message:'Could not get response')};delete o.message;}}function formatUser(o){if(o.id){o.thumbnail = o.picture = o.avatar_url;o.name = o.login;}}function paging(res,headers,req){if(res.data && res.data.length && headers && headers.Link){var next=headers.Link.match(/<(.*?)>;\s*rel=\"next\"/);if(next){res.paging = {next:next[1]};}}}})(hello);(function(hello){var contactsUrl='https://www.google.com/m8/feeds/contacts/default/full?v=3.0&alt=json&max-results=@{limit|1000}&start-index=@{start|1}';hello.init({google:{name:'Google Plus', // See: http://code.google.com/apis/accounts/docs/OAuth2UserAgent.html
	oauth:{version:2,auth:'https://accounts.google.com/o/oauth2/auth',grant:'https://accounts.google.com/o/oauth2/token'}, // Authorization scopes
	scope:{basic:'https://www.googleapis.com/auth/plus.me profile',email:'email',birthday:'',events:'',photos:'https://picasaweb.google.com/data/',videos:'http://gdata.youtube.com',friends:'https://www.google.com/m8/feeds, https://www.googleapis.com/auth/plus.login',files:'https://www.googleapis.com/auth/drive.readonly',publish:'',publish_files:'https://www.googleapis.com/auth/drive',create_event:'',offline_access:''},scope_delim:' ',login:function login(p){if(p.qs.display === 'none'){ // Google doesn't like display=none
	p.qs.display = '';}if(p.qs.response_type === 'code'){ // Let's set this to an offline access to return a refresh_token
	p.qs.access_type = 'offline';} // Reauthenticate
	// https://developers.google.com/identity/protocols/
	if(p.options.force){p.qs.approval_prompt = 'force';}}, // API base URI
	base:'https://www.googleapis.com/', // Map GET requests
	get:{me:'plus/v1/people/me', // Deprecated Sept 1, 2014
	//'me': 'oauth2/v1/userinfo?alt=json',
	// See: https://developers.google.com/+/api/latest/people/list
	'me/friends':'plus/v1/people/me/people/visible?maxResults=@{limit|100}','me/following':contactsUrl,'me/followers':contactsUrl,'me/contacts':contactsUrl,'me/share':'plus/v1/people/me/activities/public?maxResults=@{limit|100}','me/feed':'plus/v1/people/me/activities/public?maxResults=@{limit|100}','me/albums':'https://picasaweb.google.com/data/feed/api/user/default?alt=json&max-results=@{limit|100}&start-index=@{start|1}','me/album':function meAlbum(p,callback){var key=p.query.id;delete p.query.id;callback(key.replace('/entry/','/feed/'));},'me/photos':'https://picasaweb.google.com/data/feed/api/user/default?alt=json&kind=photo&max-results=@{limit|100}&start-index=@{start|1}', // See: https://developers.google.com/drive/v2/reference/files/list
	'me/files':'drive/v2/files?q=%22@{parent|root}%22+in+parents+and+trashed=false&maxResults=@{limit|100}', // See: https://developers.google.com/drive/v2/reference/files/list
	'me/folders':'drive/v2/files?q=%22@{id|root}%22+in+parents+and+mimeType+=+%22application/vnd.google-apps.folder%22+and+trashed=false&maxResults=@{limit|100}', // See: https://developers.google.com/drive/v2/reference/files/list
	'me/folder':'drive/v2/files?q=%22@{id|root}%22+in+parents+and+trashed=false&maxResults=@{limit|100}'}, // Map POST requests
	post:{ // Google Drive
	'me/files':uploadDrive,'me/folders':function meFolders(p,callback){p.data = {title:p.data.name,parents:[{id:p.data.parent || 'root'}],mimeType:'application/vnd.google-apps.folder'};callback('drive/v2/files');}}, // Map PUT requests
	put:{'me/files':uploadDrive}, // Map DELETE requests
	del:{'me/files':'drive/v2/files/@{id}','me/folder':'drive/v2/files/@{id}'},wrap:{me:function me(o){if(o.id){o.last_name = o.family_name || (o.name?o.name.familyName:null);o.first_name = o.given_name || (o.name?o.name.givenName:null);if(o.emails && o.emails.length){o.email = o.emails[0].value;}formatPerson(o);}return o;},'me/friends':function meFriends(o){if(o.items){paging(o);o.data = o.items;o.data.forEach(formatPerson);delete o.items;}return o;},'me/contacts':formatFriends,'me/followers':formatFriends,'me/following':formatFriends,'me/share':formatFeed,'me/feed':formatFeed,'me/albums':gEntry,'me/photos':formatPhotos,'default':gEntry},xhr:function xhr(p){if(p.method === 'post' || p.method === 'put'){toJSON(p);}return true;}, // Don't even try submitting via form.
	// This means no POST operations in <=IE9
	form:false}});function toInt(s){return parseInt(s,10);}function formatFeed(o){paging(o);o.data = o.items;delete o.items;return o;} // Format: ensure each record contains a name, id etc.
	function formatItem(o){if(o.error){return;}if(!o.name){o.name = o.title || o.message;}if(!o.picture){o.picture = o.thumbnailLink;}if(!o.thumbnail){o.thumbnail = o.thumbnailLink;}if(o.mimeType === 'application/vnd.google-apps.folder'){o.type = 'folder';o.files = 'https://www.googleapis.com/drive/v2/files?q=%22' + o.id + '%22+in+parents';}return o;}function formatImage(image){return {source:image.url,width:image.width,height:image.height};}function formatPhotos(o){o.data = o.feed.entry.map(formatEntry);delete o.feed;} // Google has a horrible JSON API
	function gEntry(o){paging(o);if('feed' in o && 'entry' in o.feed){o.data = o.feed.entry.map(formatEntry);delete o.feed;} // Old style: Picasa, etc.
	else if('entry' in o){return formatEntry(o.entry);} // New style: Google Drive & Plus
	else if('items' in o){o.data = o.items.map(formatItem);delete o.items;}else {formatItem(o);}return o;}function formatPerson(o){o.name = o.displayName || o.name;o.picture = o.picture || (o.image?o.image.url:null);o.thumbnail = o.picture;}function formatFriends(o,headers,req){paging(o);var r=[];if('feed' in o && 'entry' in o.feed){var token=req.query.access_token;for(var i=0;i < o.feed.entry.length;i++) {var a=o.feed.entry[i];a.id = a.id.$t;a.name = a.title.$t;delete a.title;if(a.gd$email){a.email = a.gd$email && a.gd$email.length > 0?a.gd$email[0].address:null;a.emails = a.gd$email;delete a.gd$email;}if(a.updated){a.updated = a.updated.$t;}if(a.link){var pic=a.link.length > 0?a.link[0].href:null;if(pic && a.link[0].gd$etag){pic += (pic.indexOf('?') > -1?'&':'?') + 'access_token=' + token;a.picture = pic;a.thumbnail = pic;}delete a.link;}if(a.category){delete a.category;}}o.data = o.feed.entry;delete o.feed;}return o;}function formatEntry(a){var group=a.media$group;var photo=group.media$content.length?group.media$content[0]:{};var mediaContent=group.media$content || [];var mediaThumbnail=group.media$thumbnail || [];var pictures=mediaContent.concat(mediaThumbnail).map(formatImage).sort(function(a,b){return a.width - b.width;});var i=0;var _a;var p={id:a.id.$t,name:a.title.$t,description:a.summary.$t,updated_time:a.updated.$t,created_time:a.published.$t,picture:photo?photo.url:null,pictures:pictures,images:[],thumbnail:photo?photo.url:null,width:photo.width,height:photo.height}; // Get feed/children
	if('link' in a){for(i = 0;i < a.link.length;i++) {var d=a.link[i];if(d.rel.match(/\#feed$/)){p.upload_location = p.files = p.photos = d.href;break;}}} // Get images of different scales
	if('category' in a && a.category.length){_a = a.category;for(i = 0;i < _a.length;i++) {if(_a[i].scheme && _a[i].scheme.match(/\#kind$/)){p.type = _a[i].term.replace(/^.*?\#/,'');}}} // Get images of different scales
	if('media$thumbnail' in group && group.media$thumbnail.length){_a = group.media$thumbnail;p.thumbnail = _a[0].url;p.images = _a.map(formatImage);}_a = group.media$content;if(_a && _a.length){p.images.push(formatImage(_a[0]));}return p;}function paging(res){ // Contacts V2
	if('feed' in res && res.feed.openSearch$itemsPerPage){var limit=toInt(res.feed.openSearch$itemsPerPage.$t);var start=toInt(res.feed.openSearch$startIndex.$t);var total=toInt(res.feed.openSearch$totalResults.$t);if(start + limit < total){res.paging = {next:'?start=' + (start + limit)};}}else if('nextPageToken' in res){res.paging = {next:'?pageToken=' + res.nextPageToken};}} // Construct a multipart message
	function Multipart(){ // Internal body
	var body=[];var boundary=(Math.random() * 1e10).toString(32);var counter=0;var lineBreak='\r\n';var delim=lineBreak + '--' + boundary;var ready=function ready(){};var dataUri=/^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i; // Add file
	function addFile(item){var fr=new FileReader();fr.onload = function(e){addContent(btoa(e.target.result),item.type + lineBreak + 'Content-Transfer-Encoding: base64');};fr.readAsBinaryString(item);} // Add content
	function addContent(content,type){body.push(lineBreak + 'Content-Type: ' + type + lineBreak + lineBreak + content);counter--;ready();} // Add new things to the object
	this.append = function(content,type){ // Does the content have an array
	if(typeof content === 'string' || !('length' in Object(content))){ // Converti to multiples
	content = [content];}for(var i=0;i < content.length;i++) {counter++;var item=content[i]; // Is this a file?
	// Files can be either Blobs or File types
	if(typeof File !== 'undefined' && item instanceof File || typeof Blob !== 'undefined' && item instanceof Blob){ // Read the file in
	addFile(item);} // Data-URI?
	// Data:[<mime type>][;charset=<charset>][;base64],<encoded data>
	// /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i
	else if(typeof item === 'string' && item.match(dataUri)){var m=item.match(dataUri);addContent(item.replace(dataUri,''),m[1] + lineBreak + 'Content-Transfer-Encoding: base64');} // Regular string
	else {addContent(item,type);}}};this.onready = function(fn){ready = function(){if(counter === 0){ // Trigger ready
	body.unshift('');body.push('--');fn(body.join(delim),boundary);body = [];}};ready();};} // Upload to Drive
	// If this is PUT then only augment the file uploaded
	// PUT https://developers.google.com/drive/v2/reference/files/update
	// POST https://developers.google.com/drive/manage-uploads
	function uploadDrive(p,callback){var data={}; // Test for DOM element
	if(p.data && typeof HTMLInputElement !== 'undefined' && p.data instanceof HTMLInputElement){p.data = {file:p.data};}if(!p.data.name && Object(Object(p.data.file).files).length && p.method === 'post'){p.data.name = p.data.file.files[0].name;}if(p.method === 'post'){p.data = {title:p.data.name,parents:[{id:p.data.parent || 'root'}],file:p.data.file};}else { // Make a reference
	data = p.data;p.data = {}; // Add the parts to change as required
	if(data.parent){p.data.parents = [{id:p.data.parent || 'root'}];}if(data.file){p.data.file = data.file;}if(data.name){p.data.title = data.name;}} // Extract the file, if it exists from the data object
	// If the File is an INPUT element lets just concern ourselves with the NodeList
	var file;if('file' in p.data){file = p.data.file;delete p.data.file;if(typeof file === 'object' && 'files' in file){ // Assign the NodeList
	file = file.files;}if(!file || !file.length){callback({error:{code:'request_invalid',message:'There were no files attached with this request to upload'}});return;}} // Set type p.data.mimeType = Object(file[0]).type || 'application/octet-stream';
	// Construct a multipart message
	var parts=new Multipart();parts.append(JSON.stringify(p.data),'application/json'); // Read the file into a  base64 string... yep a hassle, i know
	// FormData doesn't let us assign our own Multipart headers and HTTP Content-Type
	// Alas GoogleApi need these in a particular format
	if(file){parts.append(file);}parts.onready(function(body,boundary){p.headers['content-type'] = 'multipart/related; boundary="' + boundary + '"';p.data = body;callback('upload/drive/v2/files' + (data.id?'/' + data.id:'') + '?uploadType=multipart');});}function toJSON(p){if(typeof p.data === 'object'){ // Convert the POST into a javascript object
	try{p.data = JSON.stringify(p.data);p.headers['content-type'] = 'application/json';}catch(e) {}}}})(hello);(function(hello){hello.init({instagram:{name:'Instagram',oauth:{ // See: http://instagram.com/developer/authentication/
	version:2,auth:'https://instagram.com/oauth/authorize/',grant:'https://api.instagram.com/oauth/access_token'}, // Refresh the access_token once expired
	refresh:true,scope:{basic:'basic',friends:'relationships',publish:'likes comments'},scope_delim:' ',login:function login(p){ // Instagram throws errors like 'JavaScript API is unsupported' if the display is 'popup'.
	// Make the display anything but 'popup'
	p.qs.display = '';},base:'https://api.instagram.com/v1/',get:{me:'users/self','me/feed':'users/self/feed?count=@{limit|100}','me/photos':'users/self/media/recent?min_id=0&count=@{limit|100}','me/friends':'users/self/follows?count=@{limit|100}','me/following':'users/self/follows?count=@{limit|100}','me/followers':'users/self/followed-by?count=@{limit|100}','friend/photos':'users/@{id}/media/recent?min_id=0&count=@{limit|100}'},post:{'me/like':function meLike(p,callback){var id=p.data.id;p.data = {};callback('media/' + id + '/likes');}},del:{'me/like':'media/@{id}/likes'},wrap:{me:function me(o){formatError(o);if('data' in o){o.id = o.data.id;o.thumbnail = o.data.profile_picture;o.name = o.data.full_name || o.data.username;}return o;},'me/friends':formatFriends,'me/following':formatFriends,'me/followers':formatFriends,'me/photos':function mePhotos(o){formatError(o);paging(o);if('data' in o){o.data = o.data.filter(function(d){return d.type === 'image';});o.data.forEach(function(d){d.name = d.caption?d.caption.text:null;d.thumbnail = d.images.thumbnail.url;d.picture = d.images.standard_resolution.url;d.pictures = Object.keys(d.images).map(function(key){var image=d.images[key];return formatImage(image);}).sort(function(a,b){return a.width - b.width;});});}return o;},'default':function _default(o){o = formatError(o);paging(o);return o;}}, // Instagram does not return any CORS Headers
	// So besides JSONP we're stuck with proxy
	xhr:function xhr(p,qs){var method=p.method;var proxy=method !== 'get';if(proxy){if((method === 'post' || method === 'put') && p.query.access_token){p.data.access_token = p.query.access_token;delete p.query.access_token;} // No access control headers
	// Use the proxy instead
	p.proxy = proxy;}return proxy;}, // No form
	form:false}});function formatImage(image){return {source:image.url,width:image.width,height:image.height};}function formatError(o){if(typeof o === 'string'){return {error:{code:'invalid_request',message:o}};}if(o && 'meta' in o && 'error_type' in o.meta){o.error = {code:o.meta.error_type,message:o.meta.error_message};}return o;}function formatFriends(o){paging(o);if(o && 'data' in o){o.data.forEach(formatFriend);}return o;}function formatFriend(o){if(o.id){o.thumbnail = o.profile_picture;o.name = o.full_name || o.username;}} // See: http://instagram.com/developer/endpoints/
	function paging(res){if('pagination' in res){res.paging = {next:res.pagination.next_url};delete res.pagination;}}})(hello);(function(hello){hello.init({joinme:{name:'join.me',oauth:{version:2,auth:'https://secure.join.me/api/public/v1/auth/oauth2',grant:'https://secure.join.me/api/public/v1/auth/oauth2'},refresh:false,scope:{basic:'user_info',user:'user_info',scheduler:'scheduler',start:'start_meeting'},scope_delim:' ',login:function login(p){p.options.popup.width = 400;p.options.popup.height = 700;},base:'https://api.join.me/v1/',get:{me:'user',meetings:'meetings','meetings/info':'meetings/@{id}'},post:{'meetings/start/adhoc':function meetingsStartAdhoc(p,callback){callback('meetings/start');},'meetings/start/scheduled':function meetingsStartScheduled(p,callback){var meetingId=p.data.meetingId;p.data = {};callback('meetings/' + meetingId + '/start');},'meetings/schedule':function meetingsSchedule(p,callback){callback('meetings');}},patch:{'meetings/update':function meetingsUpdate(p,callback){callback('meetings/' + p.data.meetingId);}},del:{'meetings/delete':'meetings/@{id}'},wrap:{me:function me(o,headers){formatError(o,headers);if(!o.email){return o;}o.name = o.fullName;o.first_name = o.name.split(' ')[0];o.last_name = o.name.split(' ')[1];o.id = o.email;return o;},'default':function _default(o,headers){formatError(o,headers);return o;}},xhr:formatRequest}});function formatError(o,headers){var errorCode;var message;var details;if(o && 'Message' in o){message = o.Message;delete o.Message;if('ErrorCode' in o){errorCode = o.ErrorCode;delete o.ErrorCode;}else {errorCode = getErrorCode(headers);}o.error = {code:errorCode,message:message,details:o};}return o;}function formatRequest(p,qs){ // Move the access token from the request body to the request header
	var token=qs.access_token;delete qs.access_token;p.headers.Authorization = 'Bearer ' + token; // Format non-get requests to indicate json body
	if(p.method !== 'get' && p.data){p.headers['Content-Type'] = 'application/json';if(typeof p.data === 'object'){p.data = JSON.stringify(p.data);}}if(p.method === 'put'){p.method = 'patch';}return true;}function getErrorCode(headers){switch(headers.statusCode){case 400:return 'invalid_request';case 403:return 'stale_token';case 401:return 'invalid_token';case 500:return 'server_error';default:return 'server_error';}}})(hello);(function(hello){hello.init({linkedin:{oauth:{version:2,response_type:'code',auth:'https://www.linkedin.com/uas/oauth2/authorization',grant:'https://www.linkedin.com/uas/oauth2/accessToken'}, // Refresh the access_token once expired
	refresh:true,scope:{basic:'r_basicprofile',email:'r_emailaddress',friends:'',publish:'w_share'},scope_delim:' ',base:'https://api.linkedin.com/v1/',get:{me:'people/~:(picture-url,first-name,last-name,id,formatted-name,email-address)','me/friends':'people/~/connections?count=@{limit|500}','me/followers':'people/~/connections?count=@{limit|500}','me/following':'people/~/connections?count=@{limit|500}', // See: http://developer.linkedin.com/documents/get-network-updates-and-statistics-api
	'me/share':'people/~/network/updates?count=@{limit|250}'},post:{ // See: https://developer.linkedin.com/documents/api-requests-json
	'me/share':function meShare(p,callback){var data={visibility:{code:'anyone'}};if(p.data.id){data.attribution = {share:{id:p.data.id}};}else {data.comment = p.data.message;if(p.data.picture && p.data.link){data.content = {'submitted-url':p.data.link,'submitted-image-url':p.data.picture};}}p.data = JSON.stringify(data);callback('people/~/shares?format=json');},'me/like':like},del:{'me/like':like},wrap:{me:function me(o){formatError(o);formatUser(o);return o;},'me/friends':formatFriends,'me/following':formatFriends,'me/followers':formatFriends,'me/share':function meShare(o){formatError(o);paging(o);if(o.values){o.data = o.values.map(formatUser);o.data.forEach(function(item){item.message = item.headline;});delete o.values;}return o;},'default':function _default(o,headers){formatError(o);empty(o,headers);paging(o);}},jsonp:function jsonp(p,qs){formatQuery(qs);if(p.method === 'get'){qs.format = 'jsonp';qs['error-callback'] = p.callbackID;}},xhr:function xhr(p,qs){if(p.method !== 'get'){formatQuery(qs);p.headers['Content-Type'] = 'application/json'; // Note: x-li-format ensures error responses are not returned in XML
	p.headers['x-li-format'] = 'json';p.proxy = true;return true;}return false;}}});function formatError(o){if(o && 'errorCode' in o){o.error = {code:o.status,message:o.message};}}function formatUser(o){if(o.error){return;}o.first_name = o.firstName;o.last_name = o.lastName;o.name = o.formattedName || o.first_name + ' ' + o.last_name;o.thumbnail = o.pictureUrl;o.email = o.emailAddress;return o;}function formatFriends(o){formatError(o);paging(o);if(o.values){o.data = o.values.map(formatUser);delete o.values;}return o;}function paging(res){if('_count' in res && '_start' in res && res._count + res._start < res._total){res.paging = {next:'?start=' + (res._start + res._count) + '&count=' + res._count};}}function empty(o,headers){if(JSON.stringify(o) === '{}' && headers.statusCode === 200){o.success = true;}}function formatQuery(qs){ // LinkedIn signs requests with the parameter 'oauth2_access_token'
	// ... yeah another one who thinks they should be different!
	if(qs.access_token){qs.oauth2_access_token = qs.access_token;delete qs.access_token;}}function like(p,callback){p.headers['x-li-format'] = 'json';var id=p.data.id;p.data = (p.method !== 'delete').toString();p.method = 'put';callback('people/~/network/updates/key=' + id + '/is-liked');}})(hello); // See: https://developers.soundcloud.com/docs/api/reference
	(function(hello){hello.init({soundcloud:{name:'SoundCloud',oauth:{version:2,auth:'https://soundcloud.com/connect',grant:'https://soundcloud.com/oauth2/token'}, // Request path translated
	base:'https://api.soundcloud.com/',get:{me:'me.json', // Http://developers.soundcloud.com/docs/api/reference#me
	'me/friends':'me/followings.json','me/followers':'me/followers.json','me/following':'me/followings.json', // See: http://developers.soundcloud.com/docs/api/reference#activities
	'default':function _default(p,callback){ // Include '.json at the end of each request'
	callback(p.path + '.json');}}, // Response handlers
	wrap:{me:function me(o){formatUser(o);return o;},'default':function _default(o){if(Array.isArray(o)){o = {data:o.map(formatUser)};}paging(o);return o;}},xhr:formatRequest,jsonp:formatRequest}});function formatRequest(p,qs){ // Alter the querystring
	var token=qs.access_token;delete qs.access_token;qs.oauth_token = token;qs['_status_code_map[302]'] = 200;return true;}function formatUser(o){if(o.id){o.picture = o.avatar_url;o.thumbnail = o.avatar_url;o.name = o.username || o.full_name;}return o;} // See: http://developers.soundcloud.com/docs/api/reference#activities
	function paging(res){if('next_href' in res){res.paging = {next:res.next_href};}}})(hello);(function(hello){var base='https://api.twitter.com/';hello.init({twitter:{ // Ensure that you define an oauth_proxy
	oauth:{version:'1.0a',auth:base + 'oauth/authenticate',request:base + 'oauth/request_token',token:base + 'oauth/access_token'},login:function login(p){ // Reauthenticate
	// https://dev.twitter.com/oauth/reference/get/oauth/authenticate
	var prefix='?force_login=true';this.oauth.auth = this.oauth.auth.replace(prefix,'') + (p.options.force?prefix:'');},base:base + '1.1/',get:{me:'account/verify_credentials.json','me/friends':'friends/list.json?count=@{limit|200}','me/following':'friends/list.json?count=@{limit|200}','me/followers':'followers/list.json?count=@{limit|200}', // Https://dev.twitter.com/docs/api/1.1/get/statuses/user_timeline
	'me/share':'statuses/user_timeline.json?count=@{limit|200}', // Https://dev.twitter.com/rest/reference/get/favorites/list
	'me/like':'favorites/list.json?count=@{limit|200}'},post:{'me/share':function meShare(p,callback){var data=p.data;p.data = null;var status=[]; // Change message to status
	if(data.message){status.push(data.message);delete data.message;} // If link is given
	if(data.link){status.push(data.link);delete data.link;}if(data.picture){status.push(data.picture);delete data.picture;} // Compound all the components
	if(status.length){data.status = status.join(' ');} // Tweet media
	if(data.file){data['media[]'] = data.file;delete data.file;p.data = data;callback('statuses/update_with_media.json');} // Retweet?
	else if('id' in data){callback('statuses/retweet/' + data.id + '.json');} // Tweet
	else { // Assign the post body to the query parameters
	hello.utils.extend(p.query,data);callback('statuses/update.json?include_entities=1');}}, // See: https://dev.twitter.com/rest/reference/post/favorites/create
	'me/like':function meLike(p,callback){var id=p.data.id;p.data = null;callback('favorites/create.json?id=' + id);}},del:{ // See: https://dev.twitter.com/rest/reference/post/favorites/destroy
	'me/like':function meLike(){p.method = 'post';var id=p.data.id;p.data = null;callback('favorites/destroy.json?id=' + id);}},wrap:{me:function me(res){formatError(res);formatUser(res);return res;},'me/friends':formatFriends,'me/followers':formatFriends,'me/following':formatFriends,'me/share':function meShare(res){formatError(res);paging(res);if(!res.error && 'length' in res){return {data:res};}return res;},'default':function _default(res){res = arrayToDataResponse(res);paging(res);return res;}},xhr:function xhr(p){ // Rely on the proxy for non-GET requests.
	return p.method !== 'get';}}});function formatUser(o){if(o.id){if(o.name){var m=o.name.split(' ');o.first_name = m.shift();o.last_name = m.join(' ');} // See: https://dev.twitter.com/overview/general/user-profile-images-and-banners
	o.thumbnail = o.profile_image_url_https || o.profile_image_url;}return o;}function formatFriends(o){formatError(o);paging(o);if(o.users){o.data = o.users.map(formatUser);delete o.users;}return o;}function formatError(o){if(o.errors){var e=o.errors[0];o.error = {code:'request_failed',message:e.message};}} // Take a cursor and add it to the path
	function paging(res){ // Does the response include a 'next_cursor_string'
	if('next_cursor_str' in res){ // See: https://dev.twitter.com/docs/misc/cursoring
	res.paging = {next:'?cursor=' + res.next_cursor_str};}}function arrayToDataResponse(res){return Array.isArray(res)?{data:res}:res;} /**
		// The documentation says to define user in the request
		// Although its not actually required.
	
		var user_id;
	
		function withUserId(callback){
			if(user_id){
				callback(user_id);
			}
			else{
				hello.api('twitter:/me', function(o){
					user_id = o.id;
					callback(o.id);
				});
			}
		}
	
		function sign(url){
			return function(p, callback){
				withUserId(function(user_id){
					callback(url+'?user_id='+user_id);
				});
			};
		}
		*/})(hello); // Vkontakte (vk.com)
	(function(hello){hello.init({vk:{name:'Vk', // See https://vk.com/dev/oauth_dialog
	oauth:{version:2,auth:'https://oauth.vk.com/authorize',grant:'https://oauth.vk.com/access_token'}, // Authorization scopes
	scope:{basic:'',email:'email',offline_access:'offline'}, // Refresh the access_token
	refresh:true,login:function login(p){p.qs.display = window.navigator && window.navigator.userAgent && /ipad|phone|phone|android/.test(window.navigator.userAgent.toLowerCase())?'mobile':'popup';}, // API Base URL
	base:'https://api.vk.com/method/', // Map GET requests
	get:{me:function me(p,callback){p.query.fields = 'id,first_name,last_name,photo_max';callback('users.get');}},wrap:{me:function me(res,headers,req){formatError(res);return formatUser(res,req);}}, // No XHR
	xhr:false, // All requests should be JSONP as of missing CORS headers in https://api.vk.com/method/*
	jsonp:true, // No form
	form:false}});function formatUser(o,req){if(o !== null && 'response' in o && o.response !== null && o.response.length){o = o.response[0];o.id = o.uid;o.thumbnail = o.picture = o.photo_max;o.name = o.first_name + ' ' + o.last_name;if(req.authResponse && req.authResponse.email !== null)o.email = req.authResponse.email;}return o;}function formatError(o){if(o.error){var e=o.error;o.error = {code:e.error_code,message:e.error_msg};}}})(hello);(function(hello){hello.init({windows:{name:'Windows live', // REF: http://msdn.microsoft.com/en-us/library/hh243641.aspx
	oauth:{version:2,auth:'https://login.live.com/oauth20_authorize.srf',grant:'https://login.live.com/oauth20_token.srf'}, // Refresh the access_token once expired
	refresh:true,logout:function logout(){return 'http://login.live.com/oauth20_logout.srf?ts=' + new Date().getTime();}, // Authorization scopes
	scope:{basic:'wl.signin,wl.basic',email:'wl.emails',birthday:'wl.birthday',events:'wl.calendars',photos:'wl.photos',videos:'wl.photos',friends:'wl.contacts_emails',files:'wl.skydrive',publish:'wl.share',publish_files:'wl.skydrive_update',create_event:'wl.calendars_update,wl.events_create',offline_access:'wl.offline_access'}, // API base URL
	base:'https://apis.live.net/v5.0/', // Map GET requests
	get:{ // Friends
	me:'me','me/friends':'me/friends','me/following':'me/contacts','me/followers':'me/friends','me/contacts':'me/contacts','me/albums':'me/albums', // Include the data[id] in the path
	'me/album':'@{id}/files','me/photo':'@{id}', // Files
	'me/files':'@{parent|me/skydrive}/files','me/folders':'@{id|me/skydrive}/files','me/folder':'@{id|me/skydrive}/files'}, // Map POST requests
	post:{'me/albums':'me/albums','me/album':'@{id}/files/','me/folders':'@{id|me/skydrive/}','me/files':'@{parent|me/skydrive}/files'}, // Map DELETE requests
	del:{ // Include the data[id] in the path
	'me/album':'@{id}','me/photo':'@{id}','me/folder':'@{id}','me/files':'@{id}'},wrap:{me:formatUser,'me/friends':formatFriends,'me/contacts':formatFriends,'me/followers':formatFriends,'me/following':formatFriends,'me/albums':formatAlbums,'me/photos':formatDefault,'default':formatDefault},xhr:function xhr(p){if(p.method !== 'get' && p.method !== 'delete' && !hello.utils.hasBinary(p.data)){ // Does this have a data-uri to upload as a file?
	if(typeof p.data.file === 'string'){p.data.file = hello.utils.toBlob(p.data.file);}else {p.data = JSON.stringify(p.data);p.headers = {'Content-Type':'application/json'};}}return true;},jsonp:function jsonp(p){if(p.method !== 'get' && !hello.utils.hasBinary(p.data)){p.data.method = p.method;p.method = 'get';}}}});function formatDefault(o){if('data' in o){o.data.forEach(function(d){if(d.picture){d.thumbnail = d.picture;}if(d.images){d.pictures = d.images.map(formatImage).sort(function(a,b){return a.width - b.width;});}});}return o;}function formatImage(image){return {width:image.width,height:image.height,source:image.source};}function formatAlbums(o){if('data' in o){o.data.forEach(function(d){d.photos = d.files = 'https://apis.live.net/v5.0/' + d.id + '/photos';});}return o;}function formatUser(o,headers,req){if(o.id){var token=req.query.access_token;if(o.emails){o.email = o.emails.preferred;} // If this is not an non-network friend
	if(o.is_friend !== false){ // Use the id of the user_id if available
	var id=o.user_id || o.id;o.thumbnail = o.picture = 'https://apis.live.net/v5.0/' + id + '/picture?access_token=' + token;}}return o;}function formatFriends(o,headers,req){if('data' in o){o.data.forEach(function(d){formatUser(d,headers,req);});}return o;}})(hello);(function(hello){hello.init({yahoo:{ // Ensure that you define an oauth_proxy
	oauth:{version:'1.0a',auth:'https://api.login.yahoo.com/oauth/v2/request_auth',request:'https://api.login.yahoo.com/oauth/v2/get_request_token',token:'https://api.login.yahoo.com/oauth/v2/get_token'}, // Login handler
	login:function login(p){ // Change the default popup window to be at least 560
	// Yahoo does dynamically change it on the fly for the signin screen (only, what if your already signed in)
	p.options.popup.width = 560; // Yahoo throws an parameter error if for whatever reason the state.scope contains a comma, so lets remove scope
	try{delete p.qs.state.scope;}catch(e) {}},base:'https://social.yahooapis.com/v1/',get:{me:yql('select * from social.profile(0) where guid=me'),'me/friends':yql('select * from social.contacts(0) where guid=me'),'me/following':yql('select * from social.contacts(0) where guid=me')},wrap:{me:formatUser, // Can't get IDs
	// It might be better to loop through the social.relationship table with has unique IDs of users.
	'me/friends':formatFriends,'me/following':formatFriends,'default':paging}}}); /*
			// Auto-refresh fix: bug in Yahoo can't get this to work with node-oauth-shim
			login : function(o){
				// Is the user already logged in
				var auth = hello('yahoo').getAuthResponse();
	
				// Is this a refresh token?
				if(o.options.display==='none'&&auth&&auth.access_token&&auth.refresh_token){
					// Add the old token and the refresh token, including path to the query
					// See http://developer.yahoo.com/oauth/guide/oauth-refreshaccesstoken.html
					o.qs.access_token = auth.access_token;
					o.qs.refresh_token = auth.refresh_token;
					o.qs.token_url = 'https://api.login.yahoo.com/oauth/v2/get_token';
				}
			},
		*/function formatError(o){if(o && 'meta' in o && 'error_type' in o.meta){o.error = {code:o.meta.error_type,message:o.meta.error_message};}}function formatUser(o){formatError(o);if(o.query && o.query.results && o.query.results.profile){o = o.query.results.profile;o.id = o.guid;o.last_name = o.familyName;o.first_name = o.givenName || o.nickname;var a=[];if(o.first_name){a.push(o.first_name);}if(o.last_name){a.push(o.last_name);}o.name = a.join(' ');o.email = o.emails && o.emails[0]?o.emails[0].handle:null;o.thumbnail = o.image?o.image.imageUrl:null;}return o;}function formatFriends(o,headers,request){formatError(o);paging(o,headers,request);var contact;var field;if(o.query && o.query.results && o.query.results.contact){o.data = o.query.results.contact;delete o.query;if(!Array.isArray(o.data)){o.data = [o.data];}o.data.forEach(formatFriend);}return o;}function formatFriend(contact){contact.id = null;var z=contact.fields;if(!Array.isArray(z)){z = [z];}(z || []).forEach(function(field){if(field.type === 'email'){contact.email = field.value;}if(field.type === 'name'){contact.first_name = field.value.givenName;contact.last_name = field.value.familyName;contact.name = field.value.givenName + ' ' + field.value.familyName;}if(field.type === 'yahooid'){contact.id = field.value;}});}function paging(res,headers,request){ // See: http://developer.yahoo.com/yql/guide/paging.html#local_limits
	if(res.query && res.query.count && request.options){res.paging = {next:'?start=' + (res.query.count + (+request.options.start || 1))};}return res;}function yql(q){return 'https://query.yahooapis.com/v1/yql?q=' + (q + ' limit @{limit|100} offset @{start|0}').replace(/\s/g,'%20') + '&format=json';}})(hello); // Register as anonymous AMD module
	if(true){!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return hello;}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));} // CommonJS module for browserify
	if(typeof module === 'object' && module.exports){module.exports = hello;} /*  [Promises/A+ 2.3.3.3.1]  */ /*  [Promises/A+ 2.3.3.3.2]  */
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(153), __webpack_require__(154).setImmediate))

/***/ },

/***/ 153:
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },

/***/ 154:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(153).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);
	
	  immediateIds[id] = true;
	
	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });
	
	  return id;
	};
	
	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(154).setImmediate, __webpack_require__(154).clearImmediate))

/***/ },

/***/ 155:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	var Urls = __webpack_require__(5);
	__webpack_require__(136);
	var app2 = angular.module('referralBtn', ['ui.bootstrap']);
	
	app2.config(['$httpProvider', function ($httpProvider) {
		$httpProvider.defaults.xsrfCookieName = 'csrftoken';
		$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
	}]).run(function () {
		$('#notify-wrapper').removeClass('hidden');
	});
	var Contacts = new WeakMap();
	var uibModal = new WeakMap();
	var SCOPE = new WeakMap();
	var ROOTSCOPE = new WeakMap();
	var ModalInstance = new WeakMap();
	var HTTP = new WeakMap();
	
	var BaseController = (function () {
		function BaseController($scope, $modal, ContactService) {
			_classCallCheck(this, BaseController);
	
			// this.name = "James"
			uibModal.set(this, $modal);
			SCOPE.set(this, $scope);
			console.log("Bootstrapped");
		}
	
		_createClass(BaseController, [{
			key: 'openModal',
			value: function openModal(size) {
				var _this = this;
	
				var $scope = SCOPE.get(this);
				var modalInstance = uibModal.get(this).open({
					// animation: $scope.animationsEnabled,
					templateUrl: 'myModalContent.html',
					controller: 'ContactsController',
					controllerAs: 'cc',
					size: size,
					resolve: {
						items: function items() {
							return _this.contacts;
						}
					}
				});
				console.log(modalInstance.resolve);
				modalInstance.result.then(function () {}, function () {
					console.log('Modal dismissed at: ' + new Date());
				});
			}
		}, {
			key: 'getYahoo',
			value: function getYahoo(size) {
				var _this2 = this;
	
				var $scope = SCOPE.get(this);
				var modalInstance = uibModal.get(this).open({
					// animation: $scope.animationsEnabled,
					templateUrl: 'myModalContent.html',
					controller: 'ContactsController',
					controllerAs: 'cc',
					size: size,
					resolve: {
						items: function items() {
							return _this2.contacts;
						}
					}
				});
				console.log(modalInstance.resolve);
				modalInstance.result.then(function () {}, function () {
					console.log('Modal dismissed at: ' + new Date());
				});
			}
		}]);
	
		return BaseController;
	})();
	
	var ContactsController = (function () {
		function ContactsController($rootScope, contacts, $modalInstance, $http) {
			_classCallCheck(this, ContactsController);
	
			Contacts.set(this, contacts);
			ModalInstance.set(this, $modalInstance);
			ROOTSCOPE.set(this, $rootScope);
			HTTP.set(this, $http);
			this.contacts = Contacts.get(this).getContacts();
			// this.search_email = '';
			this.all_checked = true;
		}
	
		_createClass(ContactsController, [{
			key: 'toggleAllCheckboxes',
			value: function toggleAllCheckboxes() {
				var _this3 = this;
	
				var new_contacts = this.contacts.filter(function (x) {
					return x.is_user == false;
				});
				angular.forEach(new_contacts, function (x) {
					x.checked = _this3.all_checked;
				});
			}
		}, {
			key: 'onChecked',
			value: function onChecked() {
				var ch = this.contacts.filter(function (x) {
					return x.checked == true;
				});
				if (ch.length > 0) {
					ROOTSCOPE.get(this).$broadcast('NO_CONTACT', { display: false });
				}
			}
		}, {
			key: 'selectedContacts',
			value: function selectedContacts() {
				return this.contacts.filter(function (x) {
					return x.checked === true;
				});
			}
		}, {
			key: 'sendEmails',
			value: function sendEmails() {
				var $rootScope = ROOTSCOPE.get(this);
				var $modalInstance = ModalInstance.get(this);
				var selected = this.selectedContacts();
				console.log(selected);
				if (selected.length === 0) {
					$rootScope.$broadcast('NO_CONTACT', { display: true });
				} else {
					HTTP.get(this).post(Urls['request_meeting_redirect'](), { emails: selected.map(function (x) {
							return x.email;
						}) }).then(function (data) {
						// window.location.reload();
						$rootScope.$broadcast('SUCCESSFUL', { display: true });
						$modalInstance.dismiss('cancel');
					}, function (error) {
						console.log(error);
						$rootScope.$broadcast('SERVER_ERROR', { display: true });
					});
				}
			}
		}, {
			key: 'cancel',
			value: function cancel() {
				var $modalInstance = ModalInstance.get(this);
				$modalInstance.dismiss('cancel');
			}
		}]);
	
		return ContactsController;
	})();
	
	var ErrorController = function ErrorController($rootScope, $timeout) {
		var _this4 = this;
	
		_classCallCheck(this, ErrorController);
	
		this.display_error = false;
		this.danger = true;
		$rootScope.$on('NO_CONTACT', function (e, x) {
			_this4.error_message = "Please choose at least one contact. ";
			_this4.display_error = x.display;
			_this4.danger = true;
		});
		$rootScope.$on('SERVER_ERROR', function (e, x) {
			_this4.error_message = "Sorry there was an error sending mails to your contacts";
			_this4.display_error = x.display;
			_this4.danger = true;
		});
		$rootScope.$on('SUCCESSFUL', function (e, x) {
			_this4.error_message = "Your contacts have sucessfully been invited.";
			_this4.display_error = true;
			_this4.danger = false;
			triggerTimeout();
		});
		var that = this;
		function triggerTimeout() {
			$timeout(function () {
				that.display_error = false;
			}, 3000);
		}
	};
	
	BaseController.$inject = ["$scope", '$modal', "ContactService"];
	ContactsController.$inject = ["$rootScope", "ContactService", "$modalInstance", "$http"];
	ErrorController.$inject = ["$rootScope", '$timeout'];
	
	app2.controller('BaseController', BaseController).controller('ContactsController', ContactsController).controller('ErrorController', ErrorController);
	
	app2.service('ContactService', function () {
		var contacts = [];
		var x = {
			getContacts: function getContacts() {
				return contacts;
			},
			setContacts: function setContacts(contact) {
				contacts = contact;
			}
		};
		return x;
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 156:
/***/ function(module, exports) {

	"use strict";var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}exports.json = {"version":"1.0","encoding":"UTF-8","feed":{"id":{"$t":"gbozee@gmail.com"},"updated":{"$t":"2015-11-18T20:02:29.235Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Biola Oyeniyi's Contacts"},"link":[{"rel":"alternate","type":"text/html","href":"http://www.google.com/"},{"rel":"http://schemas.google.com/g/2005#feed","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full"},{"rel":"http://schemas.google.com/g/2005#post","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full"},{"rel":"http://schemas.google.com/g/2005#batch","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/batch"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full?alt=json&max-results=200"},{"rel":"next","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full?alt=json&start-index=201&max-results=200"}],"author":[{"name":{"$t":"Biola Oyeniyi"},"email":{"$t":"gbozee@gmail.com"}}],"generator":{"version":"1.0","uri":"http://www.google.com/m8/feeds","$t":"Contacts"},"openSearch$totalResults":{"$t":"256"},"openSearch$startIndex":{"$t":"1"},"openSearch$itemsPerPage":{"$t":"200"},"entry":[{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/6c09b5888e3347"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"segun ogundiwin"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/6c09b5888e3347/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/6c09b5888e3347"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/6c09b5888e3347/1426114269244002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"segunogundiwin@gmail.com"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/b612540afe478d"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Uncle Tolu"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/b612540afe478d/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/b612540afe478d"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/b612540afe478d/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-802-330-1922","primary":"true","$t":"08023301922"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1c495000ab0f43f"},"updated":{"$t":"2015-05-13T00:10:29.903Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Biola Oyeniyi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1c495000ab0f43f/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1c495000ab0f43f"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1c495000ab0f43f/1431475829903001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"biola@tuteria.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/20581df082eac59"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Saint Germain"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/20581df082eac59/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/20581df082eac59"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/20581df082eac59/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-818-412-8294","$t":"0818 412 8294"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2a5d0a58a545733"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Uju Iloabachie"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2a5d0a58a545733/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2a5d0a58a545733"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2a5d0a58a545733/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-818-479-4617","primary":"true","$t":"+234 818 479 4617"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-550-2766","$t":"07035502766"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2c9ab128d21fc81"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"teju aiti"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2c9ab128d21fc81/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2c9ab128d21fc81"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2c9ab128d21fc81/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-838-1822","$t":"0803 838 1822"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/36379c9086553c3"},"updated":{"$t":"2015-01-16T23:41:11.951Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Boss Demola"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/36379c9086553c3/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/36379c9086553c3"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/36379c9086553c3/1421451671951601"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-817-205-5869","$t":"0817 205 5869"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/39957da8e58a030"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Toyosi Oyeniyi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/39957da8e58a030/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/39957da8e58a030"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/39957da8e58a030/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-813-606-3728","$t":"08136063728"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3c45fc10b6964d2"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Lanre Majekodunmi"},"content":{"type":"text","$t":"<HTCData><Facebook>id:1436987221/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3c45fc10b6964d2/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3c45fc10b6964d2"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3c45fc10b6964d2/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-708-321-0885","primary":"true","$t":"07083210885"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4a19ff40b8d2f7e"},"updated":{"$t":"2015-02-16T15:24:12.394Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"SendGrid Support"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4a19ff40b8d2f7e/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4a19ff40b8d2f7e"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4a19ff40b8d2f7e/1424100252394001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"support+id405402@sendgrid.zendesk.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/514073a896ac6f9"},"updated":{"$t":"2014-09-10T00:29:31.674Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/514073a896ac6f9/laYKicxXyTizHGmfF5u7TA"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/514073a896ac6f9"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/514073a896ac6f9"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/514073a896ac6f9/1410308971674001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"verify@digitalocean.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/59ae5b40d986727"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Ola Akinkunmi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/59ae5b40d986727/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/59ae5b40d986727"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/59ae5b40d986727/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-123-2210","$t":"+234 703 123 2210"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5aca8968f2cacd7"},"updated":{"$t":"2014-08-11T18:20:09.836Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5aca8968f2cacd7/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5aca8968f2cacd7"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5aca8968f2cacd7/1407781209836002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"keji_lola@yahoo.co.uk","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/672e7fe0bef7d22"},"updated":{"$t":"2013-01-11T19:27:49.112Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/672e7fe0bef7d22/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/672e7fe0bef7d22"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/672e7fe0bef7d22/1357932469112001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"tripple28@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/6dea7308b112855"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Un Gbenga"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/6dea7308b112855/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/6dea7308b112855"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/6dea7308b112855/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-803-513-5334","primary":"true","$t":"08035135334"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/81158fb88d5aa35"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Sope Oduwole"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/81158fb88d5aa35/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/81158fb88d5aa35"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/81158fb88d5aa35/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-705-500-9463","$t":"0705 500 9463"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-808-919-5236","$t":"080-891-95236"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/83170b30d23751a"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Dave"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/83170b30d23751a/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/83170b30d23751a"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/83170b30d23751a/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-703-068-8688","primary":"true","$t":"07030688688"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/89264050f04ec27"},"updated":{"$t":"2015-10-20T22:42:58.659Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Account no"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/89264050f04ec27/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/89264050f04ec27"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/89264050f04ec27/1445380978659000"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","$t":"304-572-9473"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/8fb3e9a09e51703"},"updated":{"$t":"2015-11-16T11:49:44.351Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/8fb3e9a09e51703/QVrqj-vUCp6XRyvj6Z6jOg"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/8fb3e9a09e51703"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/8fb3e9a09e51703"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/8fb3e9a09e51703/1447674584351001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"peacedamo@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/92d9ef10b3a679a"},"updated":{"$t":"2014-09-10T22:58:00.629Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/92d9ef10b3a679a/B7StSEpRyfyaTAaQzquh5g"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/92d9ef10b3a679a"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/92d9ef10b3a679a"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/92d9ef10b3a679a/1410389880629001"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/948aa8c8a90a81b"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Oche Nysc"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/948aa8c8a90a81b/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/948aa8c8a90a81b"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/948aa8c8a90a81b/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-973-0273","$t":"0803 973 0273"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/aab75e8088e4fe8"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Adeleye Addy"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/aab75e8088e4fe8/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/aab75e8088e4fe8"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/aab75e8088e4fe8/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-309-5703","$t":"0802 309 5703"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/ca4eee18b357227"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Oyeniyi Deji"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/ca4eee18b357227/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/ca4eee18b357227"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/ca4eee18b357227/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-802-310-7397","primary":"true","$t":"08023107397"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/ce7d114885ea143"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Mum"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/ce7d114885ea143/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/ce7d114885ea143"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/ce7d114885ea143/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#home","uri":"tel:+234-809-870-6105","$t":"080-987-06105"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-302-9909","$t":"080-330-29909"},{"rel":"http://schemas.google.com/g/2005#work","uri":"tel:+234-817-957-7982","$t":"081-795-77982"},{"rel":"http://schemas.google.com/g/2005#work_fax","uri":"tel:+234-807-157-8328","$t":"080-715-78328"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-812-880-0809","$t":"081-288-00809"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/d2a68178957b8af"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Oyinda"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/d2a68178957b8af/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/d2a68178957b8af"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/d2a68178957b8af/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-807-602-2308","primary":"true","$t":"08076022308"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/d36242f8c6dbe14"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Blessing"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/d36242f8c6dbe14/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/d36242f8c6dbe14"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/d36242f8c6dbe14/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-703-967-1891","primary":"true","$t":"07039671891"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/e37125288842888"},"updated":{"$t":"2014-04-09T11:23:21.059Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/e37125288842888/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/e37125288842888"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/e37125288842888/1397042601059001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"anunley787@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/e5d3a9a89856433"},"updated":{"$t":"2011-01-09T12:26:18.026Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/e5d3a9a89856433/lv-FUFzlK8hMhXhkJKATGg"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/e5d3a9a89856433"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/e5d3a9a89856433"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/e5d3a9a89856433/1294575978026000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"gboze....e@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/ebb20830d7f0328"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Simi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/ebb20830d7f0328/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/ebb20830d7f0328"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/ebb20830d7f0328/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-803-235-8307","primary":"true","$t":"08032358307"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/f557ed28d4c429d"},"updated":{"$t":"2014-09-22T12:58:01.418Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/f557ed28d4c429d/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/f557ed28d4c429d"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/f557ed28d4c429d/1411390681418000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"tuteriacorp@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/f77ce59089ca1e0"},"updated":{"$t":"2013-02-16T02:47:39.057Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"airtel aina"},"content":{"type":"text","$t":"<HTCData><Facebook>id:1312402418/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/f77ce59089ca1e0/Ogr_7mgfI6aiZ_xS9_6seQ"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/f77ce59089ca1e0"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/f77ce59089ca1e0"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/f77ce59089ca1e0/1360982859057000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"ainakenny@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1004dac58e907a9b"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Ibukun Salami"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1004dac58e907a9b/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1004dac58e907a9b"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1004dac58e907a9b/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-813-486-5319","$t":"0813 486 5319"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/10688e150dcf7dd6"},"updated":{"$t":"2015-07-15T22:40:54.868Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Stephen George, Atlassian"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/10688e150dcf7dd6/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/10688e150dcf7dd6"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/10688e150dcf7dd6/1437000054868001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"reply-fe5713777c6005797017-219880_HTML-981019692-132689-1@mailer.atlassian.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/108e1de18ab3b59e"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Aa Account Mb Balance"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/108e1de18ab3b59e/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/108e1de18ab3b59e"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/108e1de18ab3b59e/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","primary":"true","$t":"*141*712*0#"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/11ddf98f0afd3b68"},"updated":{"$t":"2014-08-12T13:00:28.803Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Green Football Admin"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/11ddf98f0afd3b68/_EfJcJ1UpDFgGcfeX-d-sQ"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/11ddf98f0afd3b68"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/11ddf98f0afd3b68"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/11ddf98f0afd3b68/1407848428803001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"greenfootballzone@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/11e9e25a09acf629"},"updated":{"$t":"2015-10-14T23:04:40.639Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Tuteria"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/11e9e25a09acf629/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/11e9e25a09acf629"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/11e9e25a09acf629/1444863880639001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"info@tuteria.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/122e32a50846914c"},"updated":{"$t":"2013-09-09T13:14:55.105Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/122e32a50846914c/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/122e32a50846914c"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/122e32a50846914c/1378732495105000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"Raymo@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/12bdc9858b61b262"},"updated":{"$t":"2014-02-17T03:31:28.062Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Deji Abuja"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/12bdc9858b61b262/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/12bdc9858b61b262"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/12bdc9858b61b262/1392607888062001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"fakunle.olufemi@gmail.com"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1366eb1f0eda23ca"},"updated":{"$t":"2013-01-10T18:57:38.444Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1366eb1f0eda23ca/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1366eb1f0eda23ca"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1366eb1f0eda23ca/1357844258444001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"del5vy@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/137e7c66897bd82d"},"updated":{"$t":"2015-05-13T08:36:51.736Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"abiola"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/137e7c66897bd82d/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/137e7c66897bd82d"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/137e7c66897bd82d/1431506211736001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"abiola@tuteria.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/149ec9670b0b2762"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Ola"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/149ec9670b0b2762/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/149ec9670b0b2762"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/149ec9670b0b2762/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-802-330-3716","primary":"true","$t":"08023303716"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/157e1cd88f8f3bbe"},"updated":{"$t":"2014-03-02T15:57:34.531Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Engr Addy"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/157e1cd88f8f3bbe/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/157e1cd88f8f3bbe"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/157e1cd88f8f3bbe/1393775854531001"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-137-4210","$t":"+234 703 137 4210"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/171de0ab8c2588b2"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Kayode Michael"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/171de0ab8c2588b2/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/171de0ab8c2588b2"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/171de0ab8c2588b2/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-083-2209","primary":"true","$t":"07030832209"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/176f71de0c887c61"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Rtukpe"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/176f71de0c887c61/TQ4xAIU7Nw_mBlcxcekk3Q"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/176f71de0c887c61"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/176f71de0c887c61"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/176f71de0c887c61/1426114269244002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"rtukpe@gmail.com"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1779bf910a70ee06"},"updated":{"$t":"2015-01-16T23:41:11.951Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Babs Systems"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1779bf910a70ee06/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1779bf910a70ee06"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1779bf910a70ee06/1421451671951601"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-292-7647","$t":"0802 292 7647"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/177ae5b30fcc9a86"},"updated":{"$t":"2012-02-20T21:06:53.848Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/177ae5b30fcc9a86/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/177ae5b30fcc9a86"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/177ae5b30fcc9a86/1329772013848001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"ikay22brains@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1818b3128883c37f"},"updated":{"$t":"2014-03-17T08:52:14.735Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Boss Lba"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1818b3128883c37f/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1818b3128883c37f"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1818b3128883c37f/1395046334735001"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-817-205-5869","$t":"+2348172055869"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/18aa5aa48ef0824f"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Pascal"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/18aa5aa48ef0824f/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/18aa5aa48ef0824f"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/18aa5aa48ef0824f/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-806-063-3102","primary":"true","$t":"08060633102"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/18ad59470b7f2058"},"updated":{"$t":"2015-04-13T11:41:58.230Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/18ad59470b7f2058/h3WR4lwXA8IjaOMvUqrErA"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/18ad59470b7f2058"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/18ad59470b7f2058"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/18ad59470b7f2058/1428925318230001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"johnlawal71@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/19616a820d2b3d14"},"updated":{"$t":"2014-09-09T19:52:01.173Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/19616a820d2b3d14/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/19616a820d2b3d14"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/19616a820d2b3d14/1410292321173001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"id@domain-inc.net","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1a7bcfc50fc2074c"},"updated":{"$t":"2015-11-16T11:50:11.454Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Solomon Adenuga"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1a7bcfc50fc2074c/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1a7bcfc50fc2074c"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1a7bcfc50fc2074c/1447674611454001"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-701-656-2047","$t":"0701 656 2047"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-630-9935","primary":"true","$t":"+234 703 630 9935"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1b1448090dd6f1c7"},"updated":{"$t":"2014-09-10T20:46:01.663Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1b1448090dd6f1c7/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1b1448090dd6f1c7"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1b1448090dd6f1c7/1410381961663001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"care@spectranet.com.ng","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1b37571c88a6fb30"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Chukuwra Lag"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1b37571c88a6fb30/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1b37571c88a6fb30"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1b37571c88a6fb30/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-705-379-9435","$t":"0705 379 9435"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1bcc94c18e7c4439"},"updated":{"$t":"2015-01-16T23:41:11.951Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Uncle Odunayo"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1bcc94c18e7c4439/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1bcc94c18e7c4439"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1bcc94c18e7c4439/1421451671951601"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-278-5109","$t":"08022785109"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1c2b077c0eb82c51"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Tunde"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1c2b077c0eb82c51/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1c2b077c0eb82c51"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1c2b077c0eb82c51/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-806-883-7448","$t":"08068837448"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1c6245f70982b4db"},"updated":{"$t":"2015-01-16T23:41:11.951Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Obiora Faan"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1c6245f70982b4db/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1c6245f70982b4db"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1c6245f70982b4db/1421451671951601"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-544-6781","$t":"08035446781"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1d0649c08b54ff43"},"updated":{"$t":"2015-11-16T11:50:12.940Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Tomi Bro"},"content":{"type":"text","$t":"<HTCData><Twitter>id:189673175/friendof:238731041</Twitter><Facebook>id:1158845122/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1d0649c08b54ff43/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1d0649c08b54ff43"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1d0649c08b54ff43/1447674612940001"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-809-850-7431","$t":"08098507431"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-275-1415","primary":"true","$t":"+2347032751415"},{"rel":"http://schemas.google.com/g/2005#home","uri":"tel:+234-812-389-0881","$t":"081-238-90881"},{"label":"Mobile","uri":"tel:+44-7423-240196","$t":"+447423240196"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1dc66abc0d51d29a"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Tope Mech"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1dc66abc0d51d29a/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1dc66abc0d51d29a"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1dc66abc0d51d29a/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-706-636-0428","$t":"0706 636 0428"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1e1eca6e0d17d116"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Akin Nysc"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1e1eca6e0d17d116/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1e1eca6e0d17d116"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1e1eca6e0d17d116/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-818-535-4505","$t":"0818 535 4505"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1e9200f00b15482d"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Seedorf"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1e9200f00b15482d/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1e9200f00b15482d"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1e9200f00b15482d/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-387-3514","$t":"0802 387 3514"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1ef89c470bab24a7"},"updated":{"$t":"2015-11-14T17:28:36.702Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1ef89c470bab24a7/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1ef89c470bab24a7"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1ef89c470bab24a7/1447522116702480"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"topsy29@ymail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/1ef8ca7689791b9d"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Ebube Magnus"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/1ef8ca7689791b9d/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1ef8ca7689791b9d"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/1ef8ca7689791b9d/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-808-595-2960","primary":"true","$t":"+234 808 595 2960"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/201a6360893e7c7d"},"updated":{"$t":"2012-03-20T21:20:10.621Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Omotayo Fakinlede"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/201a6360893e7c7d/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/201a6360893e7c7d"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/201a6360893e7c7d/1332278410621001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"oafak@hotmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/20609b510d7b3004"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Ahmed Lekan"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/20609b510d7b3004/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/20609b510d7b3004"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/20609b510d7b3004/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-325-2645","primary":"true","$t":"08023252645"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/20b30f760ac77414"},"updated":{"$t":"2015-01-16T23:41:11.951Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Tomi Oyeniyi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/20b30f760ac77414/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/20b30f760ac77414"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/20b30f760ac77414/1421451671951601"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-275-1415","$t":"0703 275 1415"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/20d84df38d2ebeee"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Funke"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/20d84df38d2ebeee/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/20d84df38d2ebeee"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/20d84df38d2ebeee/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-808-593-8377","primary":"true","$t":"08085938377"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/213084418d919111"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Donald"},"content":{"type":"text","$t":"<HTCData><Twitter>id:211688602/friendof:238731041</Twitter><Facebook>id:528742446/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/213084418d919111/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/213084418d919111"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/213084418d919111/1426114269244002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"donaldakapo5@yahoo.com"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-809-402-9079","primary":"true","$t":"+234 809 402 9079"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-907-9392","$t":"‪+234 703 907 9392‬"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-907-9392","$t":"‪+234 703 907 9392‬"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/21549d3e893ef9b2"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Adebola"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/21549d3e893ef9b2/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/21549d3e893ef9b2"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/21549d3e893ef9b2/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-805-607-6452","$t":"080-560-76452"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/21d33db20a7da828"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Dr Fashanu"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/21d33db20a7da828/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/21d33db20a7da828"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/21d33db20a7da828/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-326-3627","primary":"true","$t":"+2348023263627"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/22553e848e80ffd4"},"updated":{"$t":"2014-08-12T03:18:37.869Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/22553e848e80ffd4/AGE3q6a18tzqVnah_Bw_cg"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/22553e848e80ffd4"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/22553e848e80ffd4"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/22553e848e80ffd4/1407813517869000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"tukpepresley@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/22769ad2085c9ae0"},"updated":{"$t":"2015-02-16T12:23:23.006Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/22769ad2085c9ae0/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/22769ad2085c9ae0"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/22769ad2085c9ae0/1424089403006001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"help@sendgrid.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2503e8c70b041e59"},"updated":{"$t":"2013-09-25T17:56:46.525Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2503e8c70b041e59/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2503e8c70b041e59"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2503e8c70b041e59/1380131806525001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"finance@itf-nigeria.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/262c0e9f8bb962b0"},"updated":{"$t":"2014-02-13T21:23:50.010Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Recharge"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/262c0e9f8bb962b0/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/262c0e9f8bb962b0"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/262c0e9f8bb962b0/1392326630010001"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","$t":"*141*712*0#"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/26ad4bf10899ff94"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Dad K2"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/26ad4bf10899ff94/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/26ad4bf10899ff94"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/26ad4bf10899ff94/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-803-313-9004","primary":"true","$t":"08033139004"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2700de3708abf177"},"updated":{"$t":"2011-08-08T12:52:08.865Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2700de3708abf177/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2700de3708abf177"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2700de3708abf177/1312807928865001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"bridges@torproject.org","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2708e3280b0ebd80"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Azeez Mrs"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2708e3280b0ebd80/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2708e3280b0ebd80"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2708e3280b0ebd80/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-805-974-3811","primary":"true","$t":"08059743811"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/273b3e1b8926978c"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"bee_sama"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/273b3e1b8926978c/lclebaRkSfS_HZ7uIjYzTA"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/273b3e1b8926978c"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/273b3e1b8926978c"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/273b3e1b8926978c/1426114269244002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"gbozee@gmail.com","primary":"true"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-812-445-0295","$t":"+2348124450295"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-520-9976","$t":"+234703 520 9976"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-815-573-1585","$t":"0815 573 1585"},{"rel":"http://schemas.google.com/g/2005#home","uri":"tel:+234-709-906-7814","$t":"070-990-67814"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-809-096-6427","$t":"0809 096 6427"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-520-9976","primary":"true","$t":"+2347035209976"},{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+1-323-863-2449","$t":"+13238632449"},{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+1-587-326-1899","$t":"+15873261899"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/279f5ce60a8e4f26"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Owodulu"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/279f5ce60a8e4f26/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/279f5ce60a8e4f26"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/279f5ce60a8e4f26/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-381-9377","$t":"0802 381 9377"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/27bbf2dd89cea262"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Clement Abuja"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/27bbf2dd89cea262/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/27bbf2dd89cea262"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/27bbf2dd89cea262/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-759-2089","$t":"0803 759 2089"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/280722f90c55ceda"},"updated":{"$t":"2014-06-10T23:50:38.966Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/280722f90c55ceda/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/280722f90c55ceda"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/280722f90c55ceda/1402444238966001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"gobenson@deloitte.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2854ad9409e50e6b"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Sope Oloniyo"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2854ad9409e50e6b/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2854ad9409e50e6b"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2854ad9409e50e6b/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-705-952-4334","$t":"0705 952 4334"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/293f3a3f8f28bf81"},"updated":{"$t":"2012-11-03T10:53:55.501Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/293f3a3f8f28bf81/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/293f3a3f8f28bf81"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/293f3a3f8f28bf81/1351940035501001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"oafak@me.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/29792cfe8d2084c3"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Dayo Aflame"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/29792cfe8d2084c3/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/29792cfe8d2084c3"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/29792cfe8d2084c3/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-081-4854","$t":"0803 081 4854"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2abfb20a0e87afac"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Ope"},"content":{"type":"text","$t":"<HTCData><Facebook>id:535193842/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2abfb20a0e87afac/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2abfb20a0e87afac"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2abfb20a0e87afac/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-802-811-7534","primary":"true","$t":"+2348028117534"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2b6f55170d1f519b"},"updated":{"$t":"2015-01-16T23:41:11.951Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Dele Sowale"},"content":{"type":"text","$t":"<HTCData><Facebook>id:1097823797/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2b6f55170d1f519b/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2b6f55170d1f519b"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2b6f55170d1f519b/1421451671951601"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-994-2663","primary":"true","$t":"+234 802 994 2663"},{"rel":"http://schemas.google.com/g/2005#work","uri":"tel:+234-802-994-2663","$t":"08029942663"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2b8099b28a96e2e3"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Akinrogunde Babatunde"},"content":{"type":"text","$t":"<HTCData><Facebook>id:100001413154696/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2b8099b28a96e2e3/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2b8099b28a96e2e3"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2b8099b28a96e2e3/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-808-550-3204","primary":"true","$t":"0808 550 3204"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2b830230893e21c9"},"updated":{"$t":"2011-12-21T09:10:13.747Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2b830230893e21c9/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2b830230893e21c9"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2b830230893e21c9/1324458613747001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"Abosipaschal@aol.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2be9a5440b7b1446"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Abdullah Dipo"},"content":{"type":"text","$t":"<HTCData><Facebook>id:647338753/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2be9a5440b7b1446/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2be9a5440b7b1446"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2be9a5440b7b1446/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-806-003-4085","primary":"true","$t":"+234 806 003 4085"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2c89d89c8b349f77"},"updated":{"$t":"2012-09-24T21:49:25.695Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"OLUWASEGUN AWOTUNDE"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2c89d89c8b349f77/zJcmlUYcPpAAGQGtxweScw"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2c89d89c8b349f77"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2c89d89c8b349f77"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2c89d89c8b349f77/1348523365695001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"segun.awotunde@gmail.com","primary":"true"},{"rel":"http://schemas.google.com/g/2005#other","address":"segunawotunde@gmail.com"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2d344fcb08b239e7"},"updated":{"$t":"2012-02-11T19:09:07.528Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2d344fcb08b239e7/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2d344fcb08b239e7"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2d344fcb08b239e7/1328987347528001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"sadiqkola@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2d871e1c8f3e4313"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Gbadebo Akinwole"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2d871e1c8f3e4313/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2d871e1c8f3e4313"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2d871e1c8f3e4313/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-461-6201","$t":"0803 461 6201"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2dca7dfb8988adc0"},"updated":{"$t":"2015-11-16T11:49:40.403Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Bolutife Ogunsola"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2dca7dfb8988adc0/O2nCarT1IyiOFA0zvB1CyA"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2dca7dfb8988adc0"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2dca7dfb8988adc0"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2dca7dfb8988adc0/1447674580403000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"bostikforever@gmail.com","primary":"true"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#home","uri":"tel:+234-808-471-9087","$t":"+2348084719087"},{"label":"Mobile","uri":"tel:+234-703-844-7373","$t":"+2347038447373"},{"label":"Mobile","uri":"tel:+234-809-844-7373","$t":"+2348098447373"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2ecd74b60dae1c7b"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Uzor"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2ecd74b60dae1c7b/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2ecd74b60dae1c7b"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2ecd74b60dae1c7b/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-708-733-5118","$t":"07087335118"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2f8fd4d28f843127"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Ok Z"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2f8fd4d28f843127/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2f8fd4d28f843127"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2f8fd4d28f843127/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-115-5162","$t":"0803 115 5162"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/2ff72ca28b02f064"},"updated":{"$t":"2012-11-22T16:45:32.385Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Bolutife Ogunsola"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/2ff72ca28b02f064/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2ff72ca28b02f064"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/2ff72ca28b02f064/1353602732385001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"no-reply@plus.google.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3066fde10a2524a9"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Lazarus"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3066fde10a2524a9/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3066fde10a2524a9"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3066fde10a2524a9/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-494-0078","$t":"08024940078"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/30ac58590dad4063"},"updated":{"$t":"2013-02-16T02:47:35.485Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Tofunmi Samuel"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/30ac58590dad4063/gPwqTaYkYbEwws80VaXTgw"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/30ac58590dad4063"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/30ac58590dad4063"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/30ac58590dad4063/1360982855485000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"tofunmibabatunde@gmail.com","primary":"true"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-807-635-4484","primary":"true","$t":"+2348076354484"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/30e4a84c8f4b17d1"},"updated":{"$t":"2011-12-21T08:59:14.046Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/30e4a84c8f4b17d1/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/30e4a84c8f4b17d1"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/30e4a84c8f4b17d1/1324457954046001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"ikemiri@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3142aa000ba87157"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Abraham"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3142aa000ba87157/dWGkB8EtKENZKgz4WunQ_g"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3142aa000ba87157"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3142aa000ba87157"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3142aa000ba87157/1426114269244002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"abrahamimohiosen@gmail.com"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3148d01e88a95dc4"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"*232#"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3148d01e88a95dc4/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3148d01e88a95dc4"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3148d01e88a95dc4/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","primary":"true","$t":"*232#"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3186ac8a8c7fc2a7"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Jolaosho Yusuf"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3186ac8a8c7fc2a7/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3186ac8a8c7fc2a7"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3186ac8a8c7fc2a7/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-808-200-0503","primary":"true","$t":"+234 808 200 0503"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/319701a1883723c6"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Tosin Ayeni"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/319701a1883723c6/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/319701a1883723c6"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/319701a1883723c6/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-802-067-3899","primary":"true","$t":"08020673899"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/327fb6500dd8c7fa"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"*556*"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/327fb6500dd8c7fa/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/327fb6500dd8c7fa"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/327fb6500dd8c7fa/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","primary":"true","$t":"*556#"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/355854530e940e2c"},"updated":{"$t":"2015-11-16T11:50:03.336Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Mel Michael"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/355854530e940e2c/aIwFbSQuKEKgcK-8UEVdOQ"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/355854530e940e2c"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/355854530e940e2c"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/355854530e940e2c/1447674603336001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"mel.michael007@gmail.com","primary":"true"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-808-864-6559","$t":"‪+234 808 864 6559‬"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/357fcec98c2634cc"},"updated":{"$t":"2014-02-27T20:01:51.519Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Catrina Adler"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/357fcec98c2634cc/1nwmaixU5tFLeY__wPmLXA"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/357fcec98c2634cc"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/357fcec98c2634cc"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/357fcec98c2634cc/1393531311519001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"CAdler@crimsonmarketing.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/358cef8e0d0a8223"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Kelechi Nwosu"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/358cef8e0d0a8223/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/358cef8e0d0a8223"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/358cef8e0d0a8223/1426114269244002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#work","address":"nwosu.kelechukwu@gmail.com"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-813-663-1297","$t":"081-366-31297"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3647a7c00fc4628a"},"updated":{"$t":"2015-01-16T23:41:11.951Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Sunday Lba"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3647a7c00fc4628a/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3647a7c00fc4628a"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3647a7c00fc4628a/1421451671951601"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-805-738-3317","$t":"0805 738 3317"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/375f13350afc1738"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Abigail Omotayo Benjamin"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/375f13350afc1738/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/375f13350afc1738"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/375f13350afc1738/1426114269244002"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/37bf90740934236c"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Obayagbona Ikponmwosa"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/37bf90740934236c/3-5zfNciSu8daguYGs7mIA"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/37bf90740934236c"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/37bf90740934236c"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/37bf90740934236c/1426114269244002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"iykeoba@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/37edf5318bcf0757"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Uncle"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/37edf5318bcf0757/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/37edf5318bcf0757"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/37edf5318bcf0757/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-802-390-4370","primary":"true","$t":"08023904370"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/380e5afe0cccbcf1"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Ibk"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/380e5afe0cccbcf1/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/380e5afe0cccbcf1"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/380e5afe0cccbcf1/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-808-389-3764","primary":"true","$t":"08083893764"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/38c39bbf889d2d68"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Ifeoma Met And Math"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/38c39bbf889d2d68/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/38c39bbf889d2d68"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/38c39bbf889d2d68/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-977-1638","$t":"0802 977 1638"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3918aebc0d568192"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Tola Sis"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3918aebc0d568192/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3918aebc0d568192"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3918aebc0d568192/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-809-472-6436","primary":"true","$t":"+234 809 472 6436"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3c12f9d48e0beee1"},"updated":{"$t":"2012-03-19T21:27:41.122Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3c12f9d48e0beee1/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3c12f9d48e0beee1"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3c12f9d48e0beee1/1332192461122001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"oafak@unilag.edu.ng","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3c2da5f00ff18a8b"},"updated":{"$t":"2015-10-20T22:42:57.416Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Pastor Winner's"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3c2da5f00ff18a8b/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3c2da5f00ff18a8b"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3c2da5f00ff18a8b/1445380977416001"}],"gd$phoneNumber":[{"label":"Mobile","uri":"tel:+234-803-073-4169","$t":"080-307-34169"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3d595e108a9964f3"},"updated":{"$t":"2015-11-16T11:49:26.657Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"ADEDAMOLA ADELEYE"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3d595e108a9964f3/JONCJBpoVdvF4twUhfCQeA"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3d595e108a9964f3"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3d595e108a9964f3"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3d595e108a9964f3/1447674566657001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"dammie009@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3d686eea8a321e63"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Niyi Lasu Nysc"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3d686eea8a321e63/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3d686eea8a321e63"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3d686eea8a321e63/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-051-4713","$t":"0803 051 4713"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3db2d50a0a0307b3"},"updated":{"$t":"2015-01-16T23:41:11.951Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Rango Ibeneme"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3db2d50a0a0307b3/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3db2d50a0a0307b3"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3db2d50a0a0307b3/1421451671951601"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-812-839-2271","$t":"0812 839 2271"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-807-437-2025","$t":"‪+234 807 437 2025‬"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3e0ee1b38c2edd18"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Taiwo"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3e0ee1b38c2edd18/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3e0ee1b38c2edd18"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3e0ee1b38c2edd18/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-803-609-8722","primary":"true","$t":"08036098722"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3e59db5d8fa1df32"},"updated":{"$t":"2011-01-15T21:17:42.679Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3e59db5d8fa1df32/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3e59db5d8fa1df32"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3e59db5d8fa1df32/1295126262679000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"felixyeminiyi@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3e61c082896c3957"},"updated":{"$t":"2015-06-30T18:46:22.391Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"oluwatoyosi oyeniyi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3e61c082896c3957/wEvDe8j0QuU-mHZvx5Ekzw"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3e61c082896c3957"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3e61c082896c3957"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3e61c082896c3957/1435689982391000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"toyken13@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3ea895958c39a333"},"updated":{"$t":"2013-12-24T23:22:04.927Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Olaoluwa Akinkunmi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3ea895958c39a333/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3ea895958c39a333"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3ea895958c39a333/1387927324927000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"akinkunmiolaoluwa@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3ef6f2e70dac0c74"},"updated":{"$t":"2015-11-17T19:20:55.319Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"jimi shote"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3ef6f2e70dac0c74/JeyRnG_Kgt7hEISHu2pe1A"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3ef6f2e70dac0c74"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3ef6f2e70dac0c74"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3ef6f2e70dac0c74/1447788055319002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"jimishote@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3efc08360ca564bb"},"updated":{"$t":"2014-08-11T18:31:16.096Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3efc08360ca564bb/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3efc08360ca564bb"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3efc08360ca564bb/1407781876096001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"oyeniyiabiola@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3efc8d59081fb0aa"},"updated":{"$t":"2011-11-21T03:44:45.579Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Dipo Orimoloye"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3efc8d59081fb0aa/kIRLXe8ROtySZ8wG0VlVkQ"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3efc8d59081fb0aa"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3efc8d59081fb0aa"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3efc8d59081fb0aa/1321847085579001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"femi.orims@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/3f725997885b65be"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"*556#"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/3f725997885b65be/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3f725997885b65be"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/3f725997885b65be/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","$t":"*556#"},{"rel":"http://schemas.google.com/g/2005#home","uri":"tel:+234-818-845-4721","primary":"true","$t":"08188454721"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/40ae05dd089d0ec0"},"updated":{"$t":"2012-10-23T23:28:22.435Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Omon Adenuga"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/40ae05dd089d0ec0/jl82faMwE67FIw72vjaMTw"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/40ae05dd089d0ec0"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/40ae05dd089d0ec0"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/40ae05dd089d0ec0/1351034902435001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"tumiomon@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/40d6c2198b099cac"},"updated":{"$t":"2013-01-11T19:27:49.112Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/40d6c2198b099cac/vYSV4Tr2VedqGrcg2hXAQQ"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/40d6c2198b099cac"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/40d6c2198b099cac"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/40d6c2198b099cac/1357932469112001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"deffjamz01@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/40dcdb848917c3e9"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Kingsley Cds"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/40dcdb848917c3e9/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/40dcdb848917c3e9"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/40dcdb848917c3e9/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-818-382-2895","$t":"+234 818 382 2895"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/427647460d1fee3a"},"updated":{"$t":"2013-12-27T07:18:49.899Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/427647460d1fee3a/xdcbTWLHEJHhVvjvwoEAxQ"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/427647460d1fee3a"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/427647460d1fee3a"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/427647460d1fee3a/1388128729899002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"ahmed2real@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4488eaea8ccdf7dd"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Michael Ojudoh"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4488eaea8ccdf7dd/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4488eaea8ccdf7dd"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4488eaea8ccdf7dd/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-809-530-6701","$t":"08095306701"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/450cf1c0889f717e"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Lolu"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/450cf1c0889f717e/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/450cf1c0889f717e"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/450cf1c0889f717e/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-808-917-5984","$t":"+2348089175984"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4588e02b8e0894be"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Olamide Oguntoye"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4588e02b8e0894be/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4588e02b8e0894be"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4588e02b8e0894be/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-808-127-4973","$t":"0808 127 4973"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/45aecad6886e22cf"},"updated":{"$t":"2014-03-27T16:00:03.978Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/45aecad6886e22cf/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/45aecad6886e22cf"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/45aecad6886e22cf/1395936003978000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"ijeoma.awoderu@gmail.com"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/46053c9d0a40f918"},"updated":{"$t":"2014-03-15T09:17:21.068Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/46053c9d0a40f918/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/46053c9d0a40f918"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/46053c9d0a40f918/1394875041068000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"christylaraniyi@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/48ec8d8a898d85ca"},"updated":{"$t":"2015-02-18T22:08:27.964Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Mandrill Support"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/48ec8d8a898d85ca/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/48ec8d8a898d85ca"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/48ec8d8a898d85ca/1424297307964001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"help@mandrill.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4a69ec2d0dd02a17"},"updated":{"$t":"2014-02-22T17:19:36.598Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Olámìídé Ògúntóyè"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4a69ec2d0dd02a17/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4a69ec2d0dd02a17"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4a69ec2d0dd02a17/1393089576598001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"first.olamide@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4ad2a47f8e155480"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Raymond Tukpe"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4ad2a47f8e155480/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4ad2a47f8e155480"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4ad2a47f8e155480/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-808-581-3019","$t":"+2348085813019"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4aed3fff895f39df"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Yinka Nysc"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4aed3fff895f39df/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4aed3fff895f39df"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4aed3fff895f39df/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-807-968-8204","$t":"+234 807 968 8204"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4b4df5868b80bc41"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Dad"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4b4df5868b80bc41/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4b4df5868b80bc41"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4b4df5868b80bc41/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-803-300-6087","primary":"true","$t":"08033006087"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-805-523-8197","$t":"080-552-38197"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4b7434848b3c3492"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Un Julius"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4b7434848b3c3492/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4b7434848b3c3492"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4b7434848b3c3492/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-803-736-5473","primary":"true","$t":"08037365473"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4b89aa378bd1c19e"},"updated":{"$t":"2015-01-16T23:41:11.951Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Rent Man Makurdi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4b89aa378bd1c19e/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4b89aa378bd1c19e"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4b89aa378bd1c19e/1421451671951601"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-769-4085","$t":"0703 769 4085"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4c7f35928f259037"},"updated":{"$t":"2011-09-25T20:03:47.703Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4c7f35928f259037/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4c7f35928f259037"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4c7f35928f259037/1316981027703001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"juzheard@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4d35e3420919d6ea"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Femi Ogunbuyie"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4d35e3420919d6ea/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4d35e3420919d6ea"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4d35e3420919d6ea/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-806-953-9642","primary":"true","$t":"08069539642"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4d81a4720c172bb8"},"updated":{"$t":"2015-10-29T03:45:28.318Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Frederick Adegbegi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4d81a4720c172bb8/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4d81a4720c172bb8"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4d81a4720c172bb8/1446090328318000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"fredadegbegi@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4e46471489d429c3"},"updated":{"$t":"2012-08-23T07:14:14.148Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4e46471489d429c3/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4e46471489d429c3"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4e46471489d429c3/1345706054148001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"gabrilwonder@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4ea41fed0c12feee"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Gbenga Nysc"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4ea41fed0c12feee/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4ea41fed0c12feee"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4ea41fed0c12feee/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-807-707-0977","$t":"080-770-70977"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4ea83e090f8b6d6d"},"updated":{"$t":"2011-08-04T18:13:58.649Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4ea83e090f8b6d6d/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4ea83e090f8b6d6d"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4ea83e090f8b6d6d/1312481638649001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"majordomo@listserv.iegroup.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/4ed75e05095b50c7"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Isaac Newton Osahon"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/4ed75e05095b50c7/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4ed75e05095b50c7"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/4ed75e05095b50c7/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-692-2601","$t":"+234 802 692 2601"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/501a66d20f9620ab"},"updated":{"$t":"2015-11-16T11:50:17.668Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Tope Sis"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/501a66d20f9620ab/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/501a66d20f9620ab"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/501a66d20f9620ab/1447674617668001"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#work","uri":"tel:+234-809-113-2109","$t":"08091132109"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-807-329-4901","$t":"+234 807 329 4901"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-458-1616","primary":"true","$t":"08034581616"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-812-878-2393","$t":"0812 878 2393"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5080821a0c8f646a"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Vincent Sam Osho Nysc"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5080821a0c8f646a/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5080821a0c8f646a"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5080821a0c8f646a/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-078-1112","$t":"0803 078 1112"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/50a3c98e884a1a9b"},"updated":{"$t":"2015-04-27T07:29:01.704Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"TAYO Oyeniyi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/50a3c98e884a1a9b/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/50a3c98e884a1a9b"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/50a3c98e884a1a9b/1430119741704001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"tmoscotayo@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/50d868f18b31c692"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Dad Kaduna"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/50d868f18b31c692/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/50d868f18b31c692"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/50d868f18b31c692/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-803-785-0887","primary":"true","$t":"08037850887"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-425-8362","$t":"080-242-58362"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/50e353cb0a42f29b"},"updated":{"$t":"2012-05-10T17:14:06.819Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/50e353cb0a42f29b/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/50e353cb0a42f29b"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/50e353cb0a42f29b/1336670046819000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"salisuolumide@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5190e4d3893e3816"},"updated":{"$t":"2015-01-16T23:41:11.951Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Dipole Orimoloye"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5190e4d3893e3816/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5190e4d3893e3816"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5190e4d3893e3816/1421451671951601"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-594-7833","$t":"0802 594 7833"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/51fba81d0ea9fd9b"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Uncle Ope"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/51fba81d0ea9fd9b/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/51fba81d0ea9fd9b"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/51fba81d0ea9fd9b/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-802-947-9818","primary":"true","$t":"08029479818"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5283ede40fc67ef5"},"updated":{"$t":"2012-10-08T18:00:33.729Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Taiwo Odugbesan"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5283ede40fc67ef5/8UQ3VHQmsd-LpEfrYj-NMw"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5283ede40fc67ef5"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5283ede40fc67ef5"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5283ede40fc67ef5/1349719233729001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"odugbesan.taiwo@gmail.com","primary":"true"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-806-326-4964","primary":"true","$t":"+234 806 326 4964"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/53dc152d8fe986d0"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Kenny Library"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/53dc152d8fe986d0/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/53dc152d8fe986d0"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/53dc152d8fe986d0/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-806-719-1832","primary":"true","$t":"08067191832"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/53f8eb420e3a8a30"},"updated":{"$t":"2014-09-26T19:05:00.378Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Adetola Onayemi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/53f8eb420e3a8a30/m0SfFPXcJgJDLYjvx8Pt7Q"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/53f8eb420e3a8a30"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/53f8eb420e3a8a30"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/53f8eb420e3a8a30/1411758300378001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"Adetolaov@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/543315b70c665f23"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Ukeme"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/543315b70c665f23/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/543315b70c665f23"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/543315b70c665f23/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-812-472-7088","$t":"+234 812 472 7088"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/54d19cd78ea4b860"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Omilana Leke"},"content":{"type":"text","$t":"<HTCData><Facebook>id:1753887050/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/54d19cd78ea4b860/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/54d19cd78ea4b860"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/54d19cd78ea4b860/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-816-954-8730","primary":"true","$t":"0816 954 8730"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/55a888560863fb14"},"updated":{"$t":"2014-01-29T01:27:59.821Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Elizabeth Clark"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/55a888560863fb14/aR2rngKSTH9KkNOslpDi_g"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/55a888560863fb14"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/55a888560863fb14"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/55a888560863fb14/1390958879821001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"cloudchallenge2014@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/560d839d0ea34b9e"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Segun Ogundiwin"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/560d839d0ea34b9e/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/560d839d0ea34b9e"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/560d839d0ea34b9e/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-855-5997","$t":"+2347038555997"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/561c3bc30f37de6d"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Awotunde Segun"},"content":{"type":"text","$t":"<HTCData><Facebook>id:1439390764/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/561c3bc30f37de6d/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/561c3bc30f37de6d"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/561c3bc30f37de6d/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-853-5875","primary":"true","$t":"0803 853 5875"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/56f4ea810a8e78dc"},"updated":{"$t":"2014-08-11T13:09:24.171Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/56f4ea810a8e78dc/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/56f4ea810a8e78dc"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/56f4ea810a8e78dc/1407762564171002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"segslo@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/573c07e50e30bd64"},"updated":{"$t":"2015-11-16T11:49:59.776Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Godwin Benson"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/573c07e50e30bd64/ZqBGiFym75E2evw3m6h7ow"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/573c07e50e30bd64"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/573c07e50e30bd64"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/573c07e50e30bd64/1447674599776000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"bensprodigy@gmail.com","primary":"true"},{"rel":"http://schemas.google.com/g/2005#other","address":"transtudentworld@gmail.com"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/584635b58b716f77"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Mark"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/584635b58b716f77/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/584635b58b716f77"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/584635b58b716f77/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-817-273-6926","primary":"true","$t":"08172736926"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/588c2c240b677edc"},"updated":{"$t":"2014-05-08T14:08:07.759Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Ukemeobong Owoh"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/588c2c240b677edc/epXusrAOz9fxyfHnksbfAQ"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/588c2c240b677edc"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/588c2c240b677edc"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/588c2c240b677edc/1399558087759001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"ukmantle@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/591ab3c68a604fa3"},"updated":{"$t":"2013-08-15T08:19:24.194Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/591ab3c68a604fa3/dWGkB8EtKENZKgz4WunQ_g"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/591ab3c68a604fa3"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/591ab3c68a604fa3"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/591ab3c68a604fa3/1376554764194000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"abrahamimohiosen@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/59b643f08ec873ac"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Ajibola Systems"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/59b643f08ec873ac/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/59b643f08ec873ac"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/59b643f08ec873ac/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-703-377-5751","primary":"true","$t":"+234 703 377 5751"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5aca407d0b8023e7"},"updated":{"$t":"2011-07-19T20:23:56.407Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5aca407d0b8023e7/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5aca407d0b8023e7"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5aca407d0b8023e7/1311107036407000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"bold_silouette@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5aca820a0ce7a537"},"updated":{"$t":"2014-09-06T04:41:17.779Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"OLADIPO Tomi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5aca820a0ce7a537/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5aca820a0ce7a537"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5aca820a0ce7a537/1409978477779001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"tomidipo@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5b1765ba0dab16f1"},"updated":{"$t":"2015-06-24T01:36:32.256Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Lucky Adike"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5b1765ba0dab16f1/qGRVDi3GI1Hrqrk0wlVXzQ"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5b1765ba0dab16f1"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5b1765ba0dab16f1"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5b1765ba0dab16f1/1435109792256001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"luckyadike@gmail.com"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5b62e35b88318b51"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Kunle Akinyemi"},"content":{"type":"text","$t":"<HTCData><Facebook>id:1386560028/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5b62e35b88318b51/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5b62e35b88318b51"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5b62e35b88318b51/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-808-524-1890","primary":"true","$t":"+234 808 524 1890"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5b9b3fb18869aa03"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Goke"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5b9b3fb18869aa03/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5b9b3fb18869aa03"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5b9b3fb18869aa03/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-617-7170","$t":"+234 802 617 7170"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5c52e3808f9e877c"},"updated":{"$t":"2013-02-01T09:33:33.143Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5c52e3808f9e877c/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5c52e3808f9e877c"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5c52e3808f9e877c/1359711213143001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"support@nicciexchange.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5c64d4528bb24626"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Faith"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5c64d4528bb24626/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5c64d4528bb24626"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5c64d4528bb24626/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-806-240-5119","primary":"true","$t":"08062405119"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5c82cf210f35790c"},"updated":{"$t":"2015-01-16T23:41:11.951Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Loco"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5c82cf210f35790c/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5c82cf210f35790c"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5c82cf210f35790c/1421451671951601"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-803-383-3195","primary":"true","$t":"08033833195"},{"rel":"http://schemas.google.com/g/2005#work","uri":"tel:+234-812-238-4637","$t":"08122384637"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5cd5726688bf1077"},"updated":{"$t":"2015-11-16T11:49:52.605Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Esan Temitope"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5cd5726688bf1077/SkX5_qQp8IjlmZyif_ogkA"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5cd5726688bf1077"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5cd5726688bf1077"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5cd5726688bf1077/1447674592605002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"esantj@gmail.com","primary":"true"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-808-200-5687","primary":"true","$t":"08082005687"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-817-223-8772","$t":"081-722-38772"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5d70e1d80c2bab35"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Loco"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5d70e1d80c2bab35/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5d70e1d80c2bab35"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5d70e1d80c2bab35/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-708-138-6781","primary":"true","$t":"+234 708 138 6781"},{"rel":"http://schemas.google.com/g/2005#mobile","$t":"64694483341"},{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-814-564-9270","$t":"+2348145649270"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5dd022920afa1b5d"},"updated":{"$t":"2015-11-16T11:49:31.107Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Aniebiet Willie"},"content":{"type":"text","$t":"<HTCData><Facebook>id:1212416813/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5dd022920afa1b5d/m_vw3Jl7-kOb0LmpPHwr7g"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5dd022920afa1b5d"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5dd022920afa1b5d"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5dd022920afa1b5d/1447674571107000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"willieaniebiet@gmail.com","primary":"true"},{"rel":"http://schemas.google.com/g/2005#other","address":"willieaniebiet@yahoo.com"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/5e2766588fb5f84a"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"S Chris"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/5e2766588fb5f84a/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5e2766588fb5f84a"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/5e2766588fb5f84a/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-434-0163","$t":"0802 434 0163"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/6048f8ec8afb39a5"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Seun"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/6048f8ec8afb39a5/cOmaffLcnr6L4iWrinjlIg"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/6048f8ec8afb39a5"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/6048f8ec8afb39a5"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/6048f8ec8afb39a5/1426114269244002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"seunade4u@gmail.com"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-816-301-4411","$t":"0816 301 4411"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/60f014a18b8691e4"},"updated":{"$t":"2014-09-09T10:38:41.076Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"BENSON, Godwin"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/60f014a18b8691e4/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/60f014a18b8691e4"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/60f014a18b8691e4/1410259121076001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"busybenson@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/6128f9620b61e120"},"updated":{"$t":"2014-03-31T15:11:18.965Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Zee Track"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/6128f9620b61e120/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/6128f9620b61e120"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/6128f9620b61e120/1396278678965001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"zeetrack@jgkltd.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/622bfb7d89fec117"},"updated":{"$t":"2012-06-26T22:11:57.293Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/622bfb7d89fec117/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/622bfb7d89fec117"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/622bfb7d89fec117/1340748717293000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"aiti-nigeria-2012@mit.edu","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/62572fc88e609fa1"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Tope Goke Friend"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/62572fc88e609fa1/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/62572fc88e609fa1"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/62572fc88e609fa1/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-831-2713","$t":"+234 802 831 2713"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/625ef9030faf4590"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Taiwo Oyeniyi"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/625ef9030faf4590/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/625ef9030faf4590"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/625ef9030faf4590/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+1-202-403-9524","primary":"true","$t":"+12024039524"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/62a09c0c0afb7a03"},"updated":{"$t":"2014-05-06T21:31:45.865Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/62a09c0c0afb7a03/SNHQagtYxh-IMGqAanYYxQ"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/62a09c0c0afb7a03"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/62a09c0c0afb7a03"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/62a09c0c0afb7a03/1399411905865000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"bamobravo@gmail.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/62a7482b0cce700b"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Segun"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/62a7482b0cce700b/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/62a7482b0cce700b"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/62a7482b0cce700b/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-808-136-0011","primary":"true","$t":"08081360011"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/63b76d080f8b473b"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Damilare Gabriel"},"content":{"type":"text","$t":"<HTCData><Facebook>id:1411569561/friendof:819965969</Facebook></HTCData>"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/63b76d080f8b473b/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/63b76d080f8b473b"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/63b76d080f8b473b/1426114269244002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#work","address":"gabrilwonder@gmail.com","primary":"true"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-802-843-9469","primary":"true","$t":"0802 843 9469"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/6402f9770f796087"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Taiwo Adewale"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/6402f9770f796087/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/6402f9770f796087"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/6402f9770f796087/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-811-527-3425","$t":"081-152-73425"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/643690268a5f3efb"},"updated":{"$t":"2015-06-12T23:57:48.797Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Matt Adle"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/643690268a5f3efb/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/643690268a5f3efb"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/643690268a5f3efb/1434153468797001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"madle@newrelic.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/645070010a40c9e6"},"updated":{"$t":"2015-10-23T03:15:06.664Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/645070010a40c9e6/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/645070010a40c9e6"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/645070010a40c9e6/1445570106664001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"support-eng@customerservices365.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/64efb4a98e2007b8"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Muyiwa"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/64efb4a98e2007b8/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/64efb4a98e2007b8"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/64efb4a98e2007b8/1426114269244002"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"muyiwa@nubview.com"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/650850bc0cd76fa5"},"updated":{"$t":"2015-11-16T11:49:49.292Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Emmanuel Olowosulu"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/650850bc0cd76fa5/1Gl1M01ehGAB-YfBQ6StQQ"},{"rel":"http://schemas.google.com/contacts/2008/rel#photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/650850bc0cd76fa5"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/650850bc0cd76fa5"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/650850bc0cd76fa5/1447674589292000"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#home","address":"me@seyisulu.co.cc"},{"rel":"http://schemas.google.com/g/2005#work","address":"seyisulu@live.co.uk"},{"label":"Other","address":"seyisulu@yahoo.com"},{"rel":"http://schemas.google.com/g/2005#work","address":"seyisulu@gmail.com"},{"label":"Other","address":"eolowo@sulusoft.com"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#home","uri":"tel:+234-706-667-2011","$t":"070-666-72011"},{"rel":"http://schemas.google.com/g/2005#work","uri":"tel:+234-809-942-8700","$t":"+2348099428700"},{"label":"Mobile","uri":"tel:+234-708-392-4785","$t":"070-839-24785"},{"rel":"http://schemas.google.com/g/2005#home","uri":"tel:+234-808-884-4010","$t":"080-888-44010"},{"label":"Mobile","uri":"tel:+234-805-166-5146","$t":"080-516-65146"},{"label":"Mobile","uri":"tel:+234-809-942-8700","$t":"234-809-9428700"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/654871e08f29c928"},"updated":{"$t":"2014-08-11T18:47:54.247Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/654871e08f29c928/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/654871e08f29c928"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/654871e08f29c928/1407782874247001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"abiolaxpac@yahoo.com","primary":"true"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/666438958c6d7501"},"updated":{"$t":"2015-11-16T11:50:08.213Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"Sadiq Kola"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/666438958c6d7501/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/666438958c6d7501"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/666438958c6d7501/1447674608213001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"kolababa1@gmail.com","primary":"true"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#mobile","uri":"tel:+234-708-162-1581","$t":"0708 162 1581"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/669203290a2a4750"},"updated":{"$t":"2015-03-11T22:51:09.244Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":"B-BEE"},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/669203290a2a4750/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/669203290a2a4750"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/669203290a2a4750/1426114269244002"}],"gd$phoneNumber":[{"rel":"http://schemas.google.com/g/2005#other","uri":"tel:+234-803-410-3545","primary":"true","$t":"08034103545"}]},{"id":{"$t":"http://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/base/671d7ecf0a4f7610"},"updated":{"$t":"2013-09-25T17:56:46.525Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/contact/2008#contact"}],"title":{"type":"text","$t":""},"link":[{"rel":"http://schemas.google.com/contacts/2008/rel#edit-photo","type":"image/*","href":"https://www.google.com/m8/feeds/photos/media/gbozee%40gmail.com/671d7ecf0a4f7610/1B2M2Y8AsgTpgAmY7PhCfg"},{"rel":"self","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/671d7ecf0a4f7610"},{"rel":"edit","type":"application/atom+xml","href":"https://www.google.com/m8/feeds/contacts/gbozee%40gmail.com/full/671d7ecf0a4f7610/1380131806525001"}],"gd$email":[{"rel":"http://schemas.google.com/g/2005#other","address":"feildservices@itf-nigeria.com","primary":"true"}]}]}};exports.json2 = {"paging":{"next":"me/friends?start=10"},"data":[{"created":"2008-11-28T15:12:34Z","updated":"2008-11-28T15:12:34Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/7","isConnection":"false","id":"coolcrips4fun","fields":[{"created":"2008-11-28T15:12:34Z","updated":"2008-11-28T15:12:34Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/7/name/10","id":"10","type":"name","value":{"givenName":"oluwafemi","middleName":null,"familyName":"abel","prefix":null,"suffix":null,"givenNameSound":null,"familyNameSound":null},"editedBy":"OWNER"},{"created":"2008-11-28T15:12:34Z","updated":"2008-11-28T15:12:34Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/7/yahooid/11","id":"11","type":"yahooid","value":"coolcrips4fun","editedBy":"OWNER"}],"error":"0","restoredId":"0","first_name":"oluwafemi","last_name":"abel","name":"oluwafemi abel"},{"created":"2007-03-03T20:54:49Z","updated":"2007-03-03T20:54:49Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/4","isConnection":"false","id":null,"fields":{"created":"2007-03-03T20:54:49Z","updated":"2007-03-03T20:54:49Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/4/email/5","id":"5","type":"email","value":"genocidetilapia@yahoo.com","editedBy":"OWNER"},"error":"0","restoredId":"0","email":"genocidetilapia@yahoo.com"},{"created":"2010-09-02T17:32:35Z","updated":"2010-09-02T17:32:35Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/10","isConnection":"false","id":"busybenson","fields":[{"created":"2010-09-02T17:32:35Z","updated":"2010-09-02T17:32:35Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/10/name/17","id":"17","type":"name","value":{"givenName":"benson","middleName":null,"familyName":"godwin","prefix":null,"suffix":null,"givenNameSound":null,"familyNameSound":null},"editedBy":"OWNER"},{"created":"2010-09-02T17:32:35Z","updated":"2010-09-02T17:32:35Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/10/yahooid/19","id":"19","type":"yahooid","value":"busybenson","editedBy":"OWNER"},{"created":"2010-09-02T17:32:35Z","updated":"2010-09-02T17:32:35Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/10/email/18","id":"18","type":"email","value":"busybenson@yahoo.com","editedBy":"OWNER"}],"error":"0","restoredId":"0","first_name":"benson","last_name":"godwin","name":"benson godwin","email":"busybenson@yahoo.com"},{"created":"2009-10-18T22:01:29Z","updated":"2009-10-18T22:01:29Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/9","isConnection":"false","id":"m.dave_1924","fields":[{"created":"2009-10-18T22:01:29Z","updated":"2009-10-18T22:01:29Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/9/name/14","id":"14","type":"name","value":{"givenName":"mamu","middleName":null,"familyName":null,"prefix":null,"suffix":null,"givenNameSound":null,"familyNameSound":null},"editedBy":"OWNER"},{"created":"2009-10-18T22:01:29Z","updated":"2009-10-18T22:01:29Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/9/yahooid/15","id":"15","type":"yahooid","value":"m.dave_1924","editedBy":"OWNER"},{"created":"2009-10-18T22:01:29Z","updated":"2009-10-18T22:01:29Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/9/guid/16","id":"16","type":"guid","value":"M2PKZI6ITBYG4BLM4R2T3C6MAY","editedBy":"OWNER","flags":"Y360","isConnection":"false"}],"error":"0","restoredId":"0","first_name":"mamu","last_name":null,"name":"mamu null"},{"created":"2008-10-18T10:08:13Z","updated":"2008-10-18T10:08:13Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/6","isConnection":"false","id":"fagbenrosa","fields":[{"created":"2008-10-18T10:08:13Z","updated":"2008-10-18T10:08:13Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/6/name/8","id":"8","type":"name","value":{"givenName":"fagbenro","middleName":null,"familyName":"olayiwola","prefix":null,"suffix":null,"givenNameSound":null,"familyNameSound":null},"editedBy":"OWNER"},{"created":"2008-10-18T10:08:13Z","updated":"2008-10-18T10:08:13Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/6/yahooid/9","id":"9","type":"yahooid","value":"fagbenrosa","editedBy":"OWNER"}],"error":"0","restoredId":"0","first_name":"fagbenro","last_name":"olayiwola","name":"fagbenro olayiwola"},{"created":"2008-10-18T10:08:02Z","updated":"2014-01-04T14:18:33Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/5","isConnection":"false","id":"mailsfort","fields":[{"created":"2014-01-04T14:18:33Z","updated":"2014-01-04T14:18:33Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/5/name/41","id":"41","type":"name","value":{"givenName":"Taiwo","middleName":null,"familyName":"Oyeniyi","prefix":null,"suffix":null,"givenNameSound":null,"familyNameSound":null},"editedBy":"OWNER"},{"created":"2014-01-04T14:18:33Z","updated":"2014-01-04T14:18:33Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/5/yahooid/44","id":"44","type":"yahooid","value":"mailsfort","editedBy":"OWNER"},{"created":"2014-01-04T14:18:33Z","updated":"2014-01-04T14:18:33Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/5/guid/45","id":"45","type":"guid","value":"TGOQC36QQXHMCNHSM7QMLL65GE","editedBy":"OWNER","flags":"Y360","isConnection":"false"}],"error":"0","restoredId":"0","first_name":"Taiwo","last_name":"Oyeniyi","name":"Taiwo Oyeniyi"},{"created":"2011-09-23T21:28:32Z","updated":"2013-10-12T20:25:41Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/67108875","isConnection":"false","id":"abiolaxpac","fields":[{"created":"2013-10-12T20:25:41Z","updated":"2013-10-12T20:25:41Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/67108875/name/31","id":"31","type":"name","value":{"givenName":"abiola","middleName":null,"familyName":"oyeniyi","prefix":null,"suffix":null,"givenNameSound":null,"familyNameSound":null},"editedBy":"OWNER"},{"created":"2013-10-12T20:25:41Z","updated":"2013-10-12T20:25:41Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/67108875/nickname/32","id":"32","type":"nickname","value":"xpac","editedBy":"OWNER"},{"created":"2013-10-12T20:25:41Z","updated":"2013-10-12T20:25:41Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/67108875/phone/35","id":"35","type":"phone","value":"070-352-09976","editedBy":"OWNER","flags":["PERSONAL","YJP"]},{"created":"2013-10-12T20:25:41Z","updated":"2013-10-12T20:25:41Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/67108875/phone/38","id":"38","type":"phone","value":"080-909-66427","editedBy":"OWNER","flags":"MOBILE"},{"created":"2013-10-12T20:25:41Z","updated":"2013-10-12T20:25:41Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/67108875/yahooid/37","id":"37","type":"yahooid","value":"abiolaxpac","editedBy":"OWNER"},{"created":"2013-10-12T20:25:41Z","updated":"2013-10-12T20:25:41Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/67108875/otherid/36","id":"36","type":"otherid","value":"abiolaxpac","editedBy":"OWNER","flags":"MSN"},{"created":"2013-10-12T20:25:41Z","updated":"2013-10-12T20:25:41Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/67108875/email/39","id":"39","type":"email","value":"gbozee@gmail.com","editedBy":"OWNER"},{"created":"2013-10-12T20:25:41Z","updated":"2013-10-12T20:25:41Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/67108875/guid/40","id":"40","type":"guid","value":"3LKHKS3C6ZNKCWGHACQWTCU3HY","editedBy":"OWNER","flags":"Y360","isConnection":"false"}],"error":"0","restoredId":"0","first_name":"abiola","last_name":"oyeniyi","name":"abiola oyeniyi","email":"gbozee@gmail.com"},{"created":"2005-10-14T14:22:57Z","updated":"2010-11-21T12:33:42Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/1","isConnection":"false","id":"simi_suave","fields":[{"created":"2010-11-21T12:33:39Z","updated":"2010-11-21T12:33:42Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/1/nickname/16777236","id":"16777236","type":"nickname","value":"simi_suave","editedBy":"OWNER"},{"created":"2005-10-14T14:22:57Z","updated":"2010-11-21T12:33:42Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/1/yahooid/4","id":"4","type":"yahooid","value":"simi_suave","editedBy":"OWNER"},{"created":"2005-10-14T14:22:57Z","updated":"2005-10-14T14:22:57Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/1/email/3","id":"3","type":"email","value":"simi_suave@yahoo.com","editedBy":"OWNER"},{"created":"2010-11-21T12:33:42Z","updated":"2010-11-21T12:33:42Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/1/guid/16777238","id":"16777238","type":"guid","value":"KG3VHCESWVKBK74QDVOEX7Z7R4","editedBy":"OWNER","flags":"Y360","isConnection":"false"}],"error":"0","restoredId":"0","email":"simi_suave@yahoo.com"},{"created":"2009-10-16T02:25:59Z","updated":"2009-10-16T02:26:32Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/8","isConnection":"false","id":"peacedamo","fields":[{"created":"2009-10-16T02:25:59Z","updated":"2009-10-16T02:26:32Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/8/name/12","id":"12","type":"name","value":{"givenName":"Damilola","middleName":null,"familyName":"Taiwo","prefix":null,"suffix":null,"givenNameSound":null,"familyNameSound":null},"editedBy":"OWNER"},{"created":"2009-10-16T02:25:59Z","updated":"2009-10-16T02:26:32Z","uri":"http://social.yahooapis.com/v1/user/3LKHKS3C6ZNKCWGHACQWTCU3HY/contact/8/yahooid/13","id":"13","type":"yahooid","value":"peacedamo","editedBy":"OWNER"}],"error":"0","restoredId":"0","first_name":"Damilola","last_name":"Taiwo","name":"Damilola Taiwo"}]};exports.ContactModel = (function(){function ContactModel(entry,yahoo){_classCallCheck(this,ContactModel);if(yahoo){if(entry.email){this.email = entry.email;}else {this.email = entry.id + "@yahoo.com";}this.name = entry.name;}else { // this.name = entry.title.$t;
	// var x = entry.gd$email
	// if(x !== undefined){
	// 	this.email = x[0].address	
	// }else{
	// 	this.email = ''
	// }
	if(entry.email){this.email = entry.email;}this.name = entry.name;}this.checked = true;this.is_user = false;}_createClass(ContactModel,[{key:"is_a_user",value:function is_a_user(arr){if(arr.indexOf(this.email) > -1){this.is_user = true;this.checked = false;}}}]);return ContactModel;})();

/***/ }

/******/ });
//# sourceMappingURL=static_pages.bundle.js.map