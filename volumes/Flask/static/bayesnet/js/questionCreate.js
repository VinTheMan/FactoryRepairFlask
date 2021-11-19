var notyf = new Notyf();

function myFunction() {
    // Declare variables
    var input, filter, ul, li, a, i;
    input = document.getElementById("exit_issue_input");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myMenu");
    li = ul.getElementsByTagName("a");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
            li[i].classList.add("closeWord");
        } else {
            li[i].style.display = "none";
            li[i].classList.remove("closeWord");
        } // if else
    }
}

function myFunctionForAction() {
    // Declare variables
    var input, filter, ul, li, a, i;
    input = document.getElementById("add_action");
    filter = input.value.toUpperCase();
    ul = document.getElementById("actionMenu");
    li = ul.getElementsByTagName("a");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        } // if else
    }
}

function appenEvent() {
    $(".listBtn").mouseover(function (e) {
        e.preventDefault();
        var eName = $(this).text();
        // console.log(eName); // test
        $("#exit_issue_input").val(eName);
    });

    $('.listBtn').on('click', function (e) {
        e.preventDefault();
        var eName = $(this).text();
        $("#exit_issue_input").val(eName);
    }); // on list btn click
} // appenEvent

function appenEvent2() {
    $(".listBtn2").mouseover(function (e) {
        e.preventDefault();
        var eName = $(this).text();
        // console.log(eName); // test
        $("#add_action").val(eName);
    });

    $('.listBtn2').on('click', function (e) {
        e.preventDefault();
        var eName = $(this).text();
        $("#add_action").val(eName);
    }); // on list btn click
} // appenEvent

function cleanUp() {
    $("#input_issue").val("");
    $("#input_action").val("");
    $("#uploadfile").val("");
    $('hr').prev().remove();
    $('hr').next().remove();
    $('hr').next().remove();
    $('hr').next().remove();
    $('hr').remove();

    $("#exit_issue_input").val("");
    $("#add_action").val("");
    $("#uploadfile2").val("");
} // cleanUp

$(document).ready(function () {
    sessionStorage.removeItem('questionn');

    var $error_names;
    $.ajax({
        url: "/GetErrorName",
        method: 'POST',
        dataType: "json",
        error: function (request) {
            // remember to filter out size 0 array
            if (request.status == 420) {
                console.log(request.responseJSON.message);
            } // if
            else {
                console.log(request);
            } // else
        },
        success: function (response) {
            $error_names = response.message;
            console.log($error_names); // test
            $("#myMenu").empty();
            for (let a = 0; a < $error_names.length; a++) {
                $("#myMenu").append('<a class="listBtn list-group-item list-group-item-action list-group-item-secondary text-center" href="#">' +
                    $error_names[a] + '</a>');
            } // for

            appenEvent();
        }
    });

    (function () {
        'use strict'

        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.querySelectorAll('.needs-validation')

        // Loop over them and prevent submission
        Array.prototype.slice.call(forms)
            .forEach(function (form) {
                form.addEventListener('submit', function (event) {
                    if (!form.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    }

                    // form.classList.add('was-validated')
                }, false)
            })
    })();

    $("#issueForm").on("submit", function (e) {
        e.preventDefault();
        e.stopPropagation();

        $(".uploadfile").blur();
        $(".input_action").blur();
        $("#input_issue").blur()

        if (!$("#input_issue").val() || !$(".input_action").val() || !$(".uploadfile").val()) {
            // validation failed
        } else {
            // console.log($("#input_issue").val()); // test

            var indexx = -1;
            for (let i = 0; i < $error_names.length; i++) {
                if ($error_names[i] === $("#input_issue").val()) {
                    indexx = i;
                } // if
            } // for

            if (indexx !== -1) {
                alert("Issue already exist ! Please go to 「 Add Solution 」 tab");
            } // if
            else {

                $('body').loadingModal({
                    text: 'Uploading...',
                    animation: 'circle'
                });

                console.log("test loading modal trigger");

                var formData = new FormData();
                $('.uploadfile').each(function (i, obj) {
                    let fileObj = obj.files[0];
                    if (typeof (fileObj) == "undefined" || fileObj.size <= 0) {
                        // do nothing
                    } // if
                    else {
                        formData.append("files[]", fileObj); //加入文件對象
                    } // else
                });

                var input_issue = $("#input_issue").val();
                var input_actionObj = $(".input_action");
                var input_action = [];
                for (let a = 0; a < input_actionObj.length; a++) {
                    input_action.push($(input_actionObj[a]).val());
                } // for
                console.log(input_issue); // test

                var factoryy = JSON.parse(sessionStorage.getItem('factoryy'));
                formData.append("Factory", factoryy);
                formData.append("Actions", input_action);
                formData.append("ErrorName", input_issue);
                $.ajax({
                    url: "/UpdateErrorNameAndActions",
                    method: 'POST',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    dataType: "json",
                    beforeSend: function () {
                        // console.log('sup, loading modal triggered !'); // test
                    },
                    complete: function () {
                        $('body').loadingModal('hide');
                        $('body').loadingModal('destroy');
                        $.ajax({
                            url: "/GetErrorName",
                            method: 'POST',
                            dataType: "json",
                            error: function (request) {
                                // remember to filter out size 0 array
                                if (request.status == 420) {
                                    console.log(request.responseJSON.message);
                                } // if
                                else {
                                    console.log(request);
                                } // else
                            },
                            success: function (response) {
                                $error_names = response.message;
                                console.log($error_names); // test
                                $("#myMenu").empty();
                                for (let a = 0; a < $error_names.length; a++) {
                                    $("#myMenu").append('<a class="listBtn list-group-item list-group-item-action list-group-item-secondary text-center" href="#">' +
                                        $error_names[a] + '</a>');
                                } // for

                                appenEvent();
                            }
                        });
                    },
                    error: function (request) {
                        // remember to filter out size 0 array
                        if (request.status == 420) {
                            console.log(request.responseJSON.message);
                        } // if
                        else {
                            console.log(request);
                        } // else

                        notyf.error({
                            message: "Update failed !",
                            duration: 1500,   //miliseconds, use 0 for infinite duration
                            ripple: true,
                            dismissible: true,
                            position: {
                                x: "right",
                                y: "bottom"
                            }
                        });
                    },
                    success: function (data) {
                        cleanUp();
                        console.log(data.message);
                        notyf.success({
                            message: "Update Successful !",
                            duration: 1500,   //miliseconds, use 0 for infinite duration
                            ripple: true,
                            dismissible: true,
                            position: {
                                x: "right",
                                y: "bottom"
                            }
                        });
                    }
                });
            } // else 
        } // if
    });

    $("#moreAction").on('click', function (e) {
        e.preventDefault();
        $("#insertB4").before('<div class="w-100" style="height: 2ch;"></div>');
        $("#insertB4").before('<hr class="divider">' +
            '<div class="col-5">' +
            '<input class="input_action form-control text-center" type="text" placeholder="Action" autocomplete="off" required>' +
            '<div class="invalid-feedback">' +
            'Please input a action.' +
            '</div>' +
            '</div>' +
            '<div class="w-100" style="height: 2ch;"></div>' +
            '<div class="col-auto">' +
            '<input class="form-control uploadfile" type="file" accept=".mp4,.pdf" name="NewVideoUpload" required>' +
            '<div class="invalid-feedback">' +
            'Please upload a MP4 video or a PDF file.' +
            '</div>' +
            '</div>');

        $(function () { // jQuery ready
            // On blur validation listener for form elements
            $('.needs-validation').find('input,select,textarea').on('blur', function (e) {
                // check element validity and change class
                // console.log($(this).attr('id')) ; // test
                if ($(this).attr('id') === 'input_issue') {
                    var indexx = -1;
                    for (let i = 0; i < $error_names.length; i++) {
                        if ($error_names[i] === $("#input_issue").val()) {
                            indexx = i;
                        } // if
                    } // for

                    if (indexx !== -1) {
                        $("#input_issue").removeClass('is-valid');
                        $("#input_issue").addClass('is-invalid');
                        $("#feedBackforQ").text('Issue already exist!');
                    } // if
                    else if (!$("#input_issue").val()) {
                        $("#input_issue").removeClass('is-valid');
                        $("#input_issue").addClass('is-invalid');
                        $("#feedBackforQ").text('Please input an issue.');
                    } // else if
                    else {
                        $("#input_issue").removeClass('is-invalid');
                        $("#input_issue").addClass('is-valid');
                    } // else
                } // if
                else {
                    $(this).removeClass('is-valid is-invalid')
                        .addClass(this.checkValidity() ? 'is-valid' : 'is-invalid');
                } // else
            });
        });
    });

    $("#lessAction").on('click', function (e) {
        e.preventDefault();
        if ($('.input_action').length <= 1) {
            // dont delete action form no more
        } // if
        else {
            $('#insertB4').prev().remove();
            $('#insertB4').prev().remove();
            $('#insertB4').prev().remove();
            $('#insertB4').prev().remove();
            $('#insertB4').prev().remove();
        } // else 
    });

    // ------------------------------------------------------------

    $("#addActionForm").on("submit", function (e) {
        e.preventDefault();

        $(".uploadfile2").blur();
        $("#add_action").blur();
        $("#exit_issue_input").blur()
        if (!$("#exit_issue_input").val() || !$("#add_action").val() || !$(".uploadfile2").val()) {
            // validation failed
        } else {

            $('body').loadingModal({
                text: 'Uploading...',
                animation: 'circle'
            });
            // console.log($("#input_issue").val()); // test
            var exit_issue_input = $("#exit_issue_input").val();
            var add_action = $("#add_action").val();
            // var add_actionObjs = $(".add_action");
            // var add_action = [];
            // for (let a = 0; a < add_actionObjs.length; {
            //     add_action.push($(add_actionObjs[a]).val());
            // } // for
            var form_data2 = new FormData();
            var ins = document.getElementById('uploadfile2').files.length;
            for (var x = 0; x < ins; x++) {
                form_data2.append("files[]", document.getElementById('uploadfile2').files[x]);
            } // for

            var factoryy = JSON.parse(sessionStorage.getItem('factoryy'));
            form_data2.append("Factory", factoryy);
            form_data2.append('ErrorName', exit_issue_input);
            form_data2.append('Action', add_action);

            console.log(add_action); // test
            $.ajax({
                url: "/AddAction",
                method: 'POST',
                dataType: 'json', // what to expect back from server
                cache: false,
                contentType: false,
                processData: false,
                data: form_data2,
                beforeSend: function () {
                    // console.log('sup, loading modal triggered !'); // test
                },
                complete: function () {
                    $('body').loadingModal('hide');
                    $('body').loadingModal('destroy');
                },
                error: function (request) {
                    // remember to filter out size 0 array
                    if (request.status == 420) {
                        console.log(request.responseJSON.message);
                    } // if
                    else {
                        console.log(request);
                    } // else

                    notyf.error({
                        message: "Update failed !",
                        duration: 1500,   //miliseconds, use 0 for infinite duration
                        ripple: true,
                        dismissible: true,
                        position: {
                            x: "right",
                            y: "bottom"
                        }
                    });
                },
                success: function (data) {
                    cleanUp();
                    console.log(data.message);
                    notyf.success({
                        message: "Update Successful !",
                        duration: 1500,   //miliseconds, use 0 for infinite duration
                        ripple: true,
                        dismissible: true,
                        position: {
                            x: "right",
                            y: "bottom"
                        }
                    });

                    $.ajax({
                        url: "/GetErrorName",
                        method: 'POST',
                        dataType: "json",
                        error: function (request) {
                            // remember to filter out size 0 array
                            if (request.status == 420) {
                                console.log(request.responseJSON.message);
                            } // if
                            else {
                                console.log(request);
                            } // else
                        },
                        success: function (response) {
                            $error_names = response.message;
                            console.log($error_names); // test
                            $("#myMenu").empty();
                            for (let a = 0; a < $error_names.length; a++) {
                                $("#myMenu").append('<a class="listBtn list-group-item list-group-item-action list-group-item-secondary text-center" href="#">' +
                                    $error_names[a] + '</a>');
                            } // for

                            appenEvent();
                        }
                    });
                }
            });
        } // if
    });

    $("#exit_issue_input").on("focus", function () {
        $("#myMenu").show();
        myFunction();
    });

    $("#exit_issue_input").on("input", function () {
        $("#myMenu").show();
        myFunction();
    });

    $("#add_action").on("focus", function () {
        $("#actionMenu").show();
        myFunctionForAction();
    });

    $("#add_action").on("input", function () {
        $("#actionMenu").show();
        myFunctionForAction();
    });

    $("#add_action").on("blur", function () {
        $("#actionMenu").hide();
    });

    $("#exit_issue_input").on("blur", function () {
        $("#myMenu").hide();
        $.ajax({
            url: "/GetErrorNameConfig",
            method: 'POST',
            data: { ErrorName: $("#exit_issue_input").val() },
            dataType: "json",
            error: function (request) {
                // remember to filter out size 0 array
                if (request.status == 420) {
                    console.log(request.responseJSON.message);
                } // if
                else {
                    console.log(request);
                } // else
            },
            success: function (response) {
                var $action_names = response.message;
                console.log($action_names); // test
                $("#actionMenu").empty();
                $("#actionMenu").append('<span>Existing Actions:</span>');
                for (let a = 0; a < $action_names.length; a++) {
                    $("#actionMenu").append('<a class="listBtn2 list-group-item list-group-item-action list-group-item-secondary text-center" href="#">' +
                        $action_names[a] + '</a>');
                } // for

                appenEvent2();
            }
        });
    });

    $(function () { // jQuery ready
        // On blur validation listener for form elements
        $('.needs-validation').find('input,select,textarea').on('blur', function (e) {
            // check element validity and change class
            // console.log($(this).attr('id')) ; // test
            if ($(this).attr('id') === 'input_issue') {
                var indexx = -1;
                for (let i = 0; i < $error_names.length; i++) {
                    if ($error_names[i] === $("#input_issue").val()) {
                        indexx = i;
                    } // if
                } // for

                if (indexx !== -1) {
                    $("#input_issue").removeClass('is-valid');
                    $("#input_issue").addClass('is-invalid');
                    $("#feedBackforQ").text('Issue already exist!');
                } // if
                else if (!$("#input_issue").val()) {
                    $("#input_issue").removeClass('is-valid');
                    $("#input_issue").addClass('is-invalid');
                    $("#feedBackforQ").text('Please input an issue.');
                } // else if
                else {
                    $("#input_issue").removeClass('is-invalid');
                    $("#input_issue").addClass('is-valid');
                } // else
            } // if
            else if ($(this).attr('id') === 'exit_issue_input') {
                var indexx = -1;
                for (let i = 0; i < $error_names.length; i++) {
                    if ($error_names[i] === $("#exit_issue_input").val()) {
                        indexx = i;
                    } // if
                } // for

                if (indexx === -1) {
                    $("#exit_issue_input").removeClass('is-valid');
                    $("#exit_issue_input").addClass('is-invalid');
                    $("#feedBackforexit_issue").text('Issue does not exist!');
                } // if
                else if (!$("#exit_issue_input").val()) {
                    $("#exit_issue_input").removeClass('is-valid');
                    $("#exit_issue_input").addClass('is-invalid');
                    $("#feedBackforexit_issue").text('Please choose an issue.');
                } // else if
                else {
                    $("#exit_issue_input").removeClass('is-invalid');
                    $("#exit_issue_input").addClass('is-valid');
                } // else
            } // else
            else {
                $(this).removeClass('is-valid is-invalid')
                    .addClass(this.checkValidity() ? 'is-valid' : 'is-invalid');
            } // else
        });
    });

}); // on document ready

$(window).on('load', function () {
    // PAGE IS FULLY LOADED
    // FADE OUT YOUR OVERLAYING DIV
    $('body').loadingModal('hide');
    $('body').loadingModal('destroy');
});