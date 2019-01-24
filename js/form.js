// DESIGN 
// get all children of the element with the id "color" and assign it to the variable 
var allColors = $("#color").children();
// create two new empty arrays to which later the colors for theme one and theme two will be added
var colorsThemeOne = [];
var colorsThemeTwo = [];

// ACTIVITIES
// create the variable sortedActivities to which the sorted activities will be assigned later on
var sortedActivities;

// PAYMENT
// get all children of the type div og the last fieldset element, these are the three payment options
var paymentOptions = $("fieldset").last().children("div");

// ERRORS
var validationErrorName = '<span id="validation-error-name" class="invalid" style="color:red; float:right; display:none">Please enter your name, it is required.</span>';
var validationErrorMail = '<span id="validation-error-mail" class="invalid" style="color:red; float:right; display:none">Please enter a valid mail address. A mail address contains a @ character and ends on a domain name. E.g.: example@gmail.com</span>';
var validationErrorActivities = '<span id="validation-error-activities" class="invalid" style="color:red; display:none">Please select at least one activity.</span>';
var validationErrorCcNum = '<span id="validation-error-cc-num" class="payment invalid" style="color:red; display:none; width: 100%">Enter a credit number with 13 - 16 digits.</span>';
var validationErrorZip = '<span id="validation-error-zip" class="payment invalid" style="color:red; display:none">Enter a zip code with 5 digits.</span>';
var validationErrorCvv = '<span id="validation-error-cvv" class="payment invalid" style="color:red; display:none">Enter a CVV with 3 digits.</span>';
var validationErrorPayment = '<span id="validation-error-payment" class="invalid" style="color:red; display:none">Please enter valid payment information.</span>';

// append errors to matching elements
$('label[for="name"]').append(validationErrorName);
$('label[for="mail"]').append(validationErrorMail);
$(".activities").prepend(validationErrorActivities);

$('label[for="payment"]').prepend(validationErrorPayment);
$("#cc-num").parent().append(validationErrorCcNum);
$("#zip").parent().append(validationErrorZip);
$("#cvv").parent().append(validationErrorCvv);

/**********************************************************************************************************************/
/**********************************************  Basic Info ***********************************************************/


// event handler for select with the id "title"
$("#title").on("change", function(e) {
    // check if selected option equals "other"
    if (e.target.value === "other") {
        // show the element with the id "other-title"
        $("#other-title").show();
    } else {
        // hide the element with the id "other-title"
        $("#other-title").hide();
    }
});

/**********************************************************************************************************************/
/********************************************** T-Shirt info **********************************************************/

// event handler to show color options when theme is selected
$("#design").on("change", function(e) {
    switch (e.target.value) {
        case "js puns":
            displayTheme(colorsThemeOne);
            break;
        case "heart js":
            displayTheme(colorsThemeTwo);
            break;
        default:
            $("#colors-js-puns").hide();
    };
});

// sort color options by theme
function sortColors(colors){
    // create two new empty arrays
    var one = [];
    var two = []
	// loop through color options in array, push them to the array matching the theme using regex testing
	for (i = 0; i < colors.length; i++){
        // check if the color contains "(JS Puns shirt only)" or "(I ♥ JS shirt only)"
        if (colors[i].textContent.includes("(JS Puns shirt only)")) {
            // remove "(JS Puns shirt only)" from the text
            colors[i].textContent = colors[i].textContent.replace("(JS Puns shirt only)", "");
            // push item to colorsThemeOne array
            one.push(colors[i]);
        } else if (colors[i].textContent.includes((" (I ♥ JS shirt only)"))) {
            // remove "(I ♥ JS shirt only)" from the text
            colors[i].textContent = colors[i].textContent.replace(" (I ♥ JS shirt only)", "");
            // push item to colorsThemeTwo array
            two.push(colors[i]);
        }
    }
    // return the two arrays
    return [one, two];
}

// display color options based on selected theme
function displayTheme(selectedThemeColors){
    // show color dropdown
    $("#colors-js-puns").show();
    // hide all color options
    $("#color option").hide();
    // loop over the elements in the selectedThemeColors array
    for(i = 0; i < selectedThemeColors.length; i++) {
        // show the element
        $(selectedThemeColors[i]).show();
    }
    // set the first value of the selectedThemeColors array as default on select
    selectedThemeColors[0].selected = true;
}

/**********************************************************************************************************************/
/******************************************* Activity registration ****************************************************/

// event handler to add or remove the clicked activity
$(".activities").change(function(e){
    // get the name of the activity from the "name" attribute of the clicked element
    var activity = $(e.target).attr("name");
    var operator;
    // check if the checkbox got checked or unchecked to determine whether to add or remove the activity
    if (e.target.checked) {
        operator = "+";
    } else {
        operator = "-";
    }
    // call calculateTotal function with the selected activity and operator
    calculateTotal(sortedActivities, activity, operator);
})

// function to sort the activities
function sortActivities(activities){
    // create a new empty array
    var sorted = [];
    for (i = 0; i < activities.length; i++) {
		// create new json object
		let activity = {};
		// set key value pair for event name in json object
        activity.name = activities[i].name;
        // assign new regex to
        var regex = new RegExp(/\b((Tues|Wednes)(day)?)\b\s\d+((am)|(pm))\-\d+((am)|(pm))/, "g");
		// check if the text of the element's parent matches the regex, if so get the time from it and assign it to the time key on the json object
		if (regex.test($(activities[i]).parent().text())) {
            // set time in json object
		    activity.time = $(activities[i]).parent().text().match(regex).join(" ");   
        }
		//  get the price by using a regex to match a $ followed by digits and remove the $ sign from it, and set it as price on the json object
		activity.price = parseInt($(activities[i]).parent().text().match(/\$\d+/g).join(" ").replace("$", ""));
        // push the json object to the activities array
        sorted.push(activity);
    }
    // return the array with sorted activities
    return sorted;
}

// function to update the total price
function calculateTotal(activities, activity, operator){
    // get activity price
    var additionalPrice = activity.price;
    // loop through all activities to find the activity that matches the activity parameter
    for(i = 0; i < activities.length; i++){
        // check if the element matches the activity parameter
        if (activities[i].name === activity) {
            // assign the price of the match to the variable additionalPrice
            additionalPrice = activities[i].price;
            disableActivity(activities, activity, activities[i].time, operator);
            // break out of the loop as a match is already found
            break;
        }
    }
    // check if an element with the id "total-price" exists
    if ($("#total-price").length === 0) {
        // the element doesn't exist, so the current price is 0
        var previousPrice = 0;
        // calculate the new total using the previous time, mathOperator parameter, and additionalPrice
        var  totalPrice = eval(previousPrice + operator + additionalPrice);
        // append a span tag with the totalPrice to the element with the class "activities"
        $(".activities").append(`<span>Total: $<span id="total-price">${ totalPrice }</span></span>`);
    } else {
        // get the text of the element with the id "total-price" and parse it to an int to use it as the previous price
        var previousPrice = parseInt($("#total-price").text());
        // calculate the new total using the previous time, mathOperator parameter, and additionalPrice
        var totalPrice = eval(previousPrice + operator + additionalPrice);
        // set the text of the element with the id of "total-price" to the totalPrice
        $("#total-price").text(totalPrice);
    }
}

// function to disable an activity
function disableActivity(activities, activity, time, operator){
    // check if the time parameter has a value
    if(time){
        // loop over activities array
        for(i = 0; i < activities.length; i++){
            // check if the element's time matches the time parameter and if it has a name that's different from the activity parameter
            if(activities[i].time == time && activities[i].name !== activity){
                // if the operator is + the activity was added and the current element should be disabled
                // if the operator is - the activity was removed and the current element should be enabled
            	if(operator === "+"){
                    // set the disabled attribute to true
                    $(`input[name="${ activities[i].name }"]`).attr("disabled", true);
                    // indicate visually that the activity is disabled by setting the color to grey
	                $(`input[name="${ activities[i].name }"]`).parent().css("color", "grey");
	            }else if(operator === "-"){
                    // set the disabled attribute to false
                    $(`input[name="${ activities[i].name }"]`).attr("disabled", false);
                    // remove the background color 
	                $(`input[name="${ activities[i].name }"]`).parent().css("color", "");
	            }
            }
        }
    }
}

/**********************************************************************************************************************/
/************************************************* Payment Info *******************************************************/

// event handler for changes to the select with the id "payment"
$("#payment").on("change", function(e) {
    // get the index of the selected option and subtract one as the "Select payment method" option is counted too
    var optionIndex = $("#payment option:selected").index() - 1;
    // hide all paymentOptions
    $(paymentOptions).hide();
    // show the element at the position of optionIndex in the paymentOptions array
    $(paymentOptions[optionIndex]).show();
});

/**********************************************************************************************************************/
/************************************************** Validation ********************************************************/

// event handler for validating name input while user types
$("#name").bind('input keypress change', function() {
    // check if the input field's value is an empty string
	if (!$(this).val()){
        // mark the input field with the id "name" as invalid
        $(this).css("border", "1px solid red");
        // show the error message
        $("#validation-error-name").css("display", "block");
	} else {
        // in case the input was invalid before, remove the mark and message
        $(this).css("border", "");
		$("#validation-error-name").css("display", "none");
	}
});

// event handler for validating mail input while user types
$("#mail").bind('input keypress change', function() {
    // assign the value of the input field to the variable mail
    var mail = $(this).val();
    // check if the input field's value is an empty string
	if (!validateEmail(mail)){
        // mark the input field with the id "name" as invalid
        $(this).css("border", "1px solid red");
        // show the error message
        $("#validation-error-mail").css("display", "block");
        // check if mail is an empty and change the text of the error message depending on it
        if (!mail) {
            $("#validation-error-mail").text("This field is required. Please enter a valid mail address.");
        } else {
            $("#validation-error-mail").text("Please enter a valid mail address. A mail address contains a @ character and ends on a domain name. E.g.: example@gmail.com");
        }
	} else {
        // in case the input was invalid before, remove the mark and message
        $(this).css("border", "");
		$("#validation-error-mail").css("display", "none");
	}
})

// event handler for submission of the form
$("form").on("submit", function(e) {
    // prevent the default behaviour - don't submit the form just yet
    e.preventDefault();
    // assign the boolean value true to the variable valid which will change the value if input is not valid
    var valid = true;

    // assign value of input with the id "name" to a variable
    var name = $("#name").val();
    // check if the name input is valid
    if (!name) {
        // change value of the variable valid to false
        valid = false;
        // mark the input field with the id "name" as invalid
        $("#name").css("border", "1px solid red");
        // show the error message
    	$('#validation-error-name').css("display", "block");
    } else {
    	// in case the input was invalid before, remove the mark and message
    	$("#name").css("border", "");
    	$("#validation-error-name").css("display", "none");
    }

    // assign value of input with the id "mail" to a variable
    var mail = $("#mail").val();
    // check if the mail input is valid
    if (!validateEmail(mail)) {
        // change value of the variable valid to false
        valid = false;
        // mark the input field with the id "mail" as invalid
        $("#mail").css("border", "1px solid red");
        // show the error message
        $('#validation-error-mail').css("display", "block");
        // check if mail is an empty and change the text of the error message depending on it
        if (!mail) {
            $("#validation-error-mail").text("This field is required. Please enter a valid mail address.");
        } else {
            $("#validation-error-mail").text("Please enter a valid mail address. A mail address contains a @ character and ends on a domain name. E.g.: example@gmail.com");
        }
    } else {
        // in case the input was invalid before, remove the mark and message
    	$("#mail").css("border", "");
    	$("#validation-error-mail").css("display", "none");
    }
    // get all checked input fields within the element with the class "activities" and assing them to a variable
    var checkedActivities = $(".activities input:checked");
    // check if at least one activity is checked
    if (checkedActivities.length === 0) {
        // change value of the variable valid to false
        valid = false;
        // show error message
        $('#validation-error-activities').css("display", "block");
    } else {
    	// in case the input was invalid before, remove the message
    	$("#validation-error-activities").css("display", "none");
    }

    // assign value of input with the id "payment" to a variable
    var selectedPayment = $("#payment").val();
    // check if the selectedPayment equals "credit card"
    if (selectedPayment === "credit card") {
        // get input from credit card payment related fields
        var cc = $("#cc-num").val();
        var zip = $("#zip").val();
        var cvv = $("#cvv").val();

        if(!validatePaymentInfo(cc, 13, 16)){
            // change value of the variable valid to false
            valid = false;
            // show error message
			$("#validation-error-cc-num").css("display", "block");
		}else{
            // in case the input was invalid before, remove the message
			$("#validation-error-cc-num").css("display", "none");
		}
		if(!validatePaymentInfo(zip, 5, 5)){
            // change value of the variable valid to false
            valid = false;
            // show error message
			$("#validation-error-zip").css("display", "block");
		}else{
            // in case the input was invalid before, remove the message
			$("#validation-error-zip").css("display", "none");
		}
		if(!validatePaymentInfo(cvv, 3, 3)){
            // change value of the variable valid to false
            valid = false;
            // show error message
			$("#validation-error-cvv").css("display", "block");
		}else{
            // in case the input was invalid before, remove the message
			$("#validation-error-cvv").css("display", "none");
		}
    }

    // check if the value of the variable valid is true, if so submit the form else display en error
    if (valid) {
        this.submit();
    } else {
        alert("Please enter valid information for all required fields.");
    }
});

// function that checks if the passed in string is a valid email address and returns a boolean value
function validateEmail(mail) {
    // assign regex pattern to the variable regex
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // test mail against regex pattern and return the result
    return regex.test(mail);
}

// function that checks if the passed in string matches the passed in min and max requirements
function validatePaymentInfo(input, min, max) {
    // assign regex pattern to the variable regex
    var regex;
    // check if min and max are the same, and assign a regex pattern based on the result
    if (min === max) {
        regex = new RegExp(`\\b\\d{${ min }}\\b`, "g");
    } else {
        regex = new RegExp(`\\b\\d{${ min },${ max }}\\b`, "g");
    }
    // test input against regex pattern and return the result
	return regex.test(input);
}


/**********************************************************************************************************************/
/***************************************** Excecute when page loaded **************************************************/

document.addEventListener("DOMContentLoaded", function() {
    // focus name input field
    $("#name").focus();
    // hide the element with the id "other-title"
    $("#other-title").hide();
    // hide color dropdown
    $("#colors-js-puns").hide();
    // sort colors
    [colorsThemeOne, colorsThemeTwo] = sortColors(allColors);
    // sort activities
    sortedActivities = sortActivities($(".activities > label > input"));
    // select credit card payment
    $("#payment").val("credit card");
    // hide elements at position 1 and 2 in the array paymentOptions - these are the elements with info for paypal and bitcoin payment
    $(paymentOptions[1]).hide();
    $(paymentOptions[2]).hide();
    // set attribute "novalidate" to the value "novalidate" on the form to prevent the browser's default validation, the form will be customly validated instead
    $("form").attr("novalidate", "novalidate");
});