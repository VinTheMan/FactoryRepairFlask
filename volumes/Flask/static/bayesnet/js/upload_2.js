var notyf = new Notyf();

$(document).ready(function () {
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

                    form.classList.add('was-validated')
                }, false)
            })
    })();

    if (sessionStorage.getItem("factoryy") === null) {
        notyf.error({
            message: "Please Log In !",
            duration: 1500,   //miliseconds, use 0 for infinite duration
            ripple: true,
            dismissible: true,
            position: {
                x: "center",
                y: "center"
            }
        });
        window.location.href = '/';
    } // if
    else if (sessionStorage.getItem("questionn") === null || sessionStorage.getItem("actionArray") === null ||
        sessionStorage.getItem("solved") === null) {
            window.location.href = '/main';
    } // else if

    var d = new Date();

    var month = d.getMonth() + 1;
    var day = d.getDate();

    var output = d.getFullYear() + '/' +
        (month < 10 ? '0' : '') + month + '/' +
        (day < 10 ? '0' : '') + day;
    var datee = output;
    var factoryy = JSON.parse(sessionStorage.getItem('factoryy'));
    var questionn = JSON.parse(sessionStorage.getItem('questionn'));
    var actionArray = JSON.parse(sessionStorage.getItem('actionArray'));
    $("#dateHere").val(datee);
    $("#factoryHere").val(factoryy);
    $("#questionHere").val(questionn);
    if (sessionStorage.getItem('solutionn') != null) {
        for (let a = 0; a < actionArray.length - 1; a++) {
            $("#solutionHere").before('<input type="text" class="form-control mt-0" style="color: black;" placeholder="Solution" value="' + actionArray[a] + '"disabled/>');
        } // for

        $("#solutionHere").val(JSON.parse(sessionStorage.getItem('solutionn')));
    } //if
    else {
        $("#solutionHere").val("No Solution!");
        $("#solutionHere").addClass("is-invalid");
        $("#uploadForm").append('<span class="col col-auto" style="color: red;"> Please inform a supervisor to add a solution.</span>');
    } // else 



    $("#submitBtn").on("click", function (e) {
        e.preventDefault();
        $("#submitBtnHidden").click();
    });

    $("#uploadForm").on("submit", function (e) {
        e.preventDefault();
    });

    $("#BacktoQuestionSel").on("click", function (e) {
        e.preventDefault();
        // console.log("clicked !") ; // test
        window.location.href = "/question#IssueDiv";
    });

    $(".scrollToResult").on("click", function (e) {
        e.preventDefault();
        // console.log("clicked !") ; // test
        $('html, body').animate({ scrollTop: $('#ResultDiv').offset().top - 50 }, 'fast');
    });

}); // on document ready

$(window).on('load', function () {
    var d = new Date();

    var month = d.getMonth() + 1;
    var day = d.getDate();

    var output = d.getFullYear() + '/' +
        (month < 10 ? '0' : '') + month + '/' +
        (day < 10 ? '0' : '') + day;
    var datee = output;
    var factoryy = JSON.parse(sessionStorage.getItem('factoryy'));
    var questionn = JSON.parse(sessionStorage.getItem('questionn'));

    var $actionsArray = JSON.parse(sessionStorage.getItem('actionArray'));
    var $isSolved = JSON.parse(sessionStorage.getItem('solved'));
    $.ajax({                 // for test
        url: "/InsertRecord",
        method: 'POST',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ Factory: factoryy, Actions: $actionsArray, ErrorName: questionn, Solved: $isSolved }),
        dataType: "json",
        error: function (request) {
            // remember to filter out size 0 array
            alert(request.responseJSON.message);
        },
        success: function (data) {
            console.log(data.message);
            notyf.success({
                message: "Upload Successful !",
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
});
