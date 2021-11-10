function myFunction() {
    // Declare variables
    var input, filter, ul, li, a, i;
    input = document.getElementById("input_question");
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
        }
    }
}

function appenEvent() {
    $(".listBtn").mouseover(function (e) {
        e.preventDefault();
        var eName = $(this).text();
        // console.log(eName); // test
        $("#input_question").val(eName);
    });

    $('.listBtn').on('click', function (e) {
        e.preventDefault();
        var eName = $(this).text();
        $("#input_question").val(eName);
    }); // on list btn click
} // appenEvent

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
                alert(request.responseJSON.message);
            } // if
            else {
                console.log(request);
            } // else
        },
        success: function (response) {
            $error_names = response.message;
            console.log($error_names); // test
            for (let a = 0; a < $error_names.length; a++) {
                $("#myMenu").append('<a class="listBtn list-group-item list-group-item-action list-group-item-warning" href="#">' +
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

                    form.classList.add('was-validated')
                }, false)
            })
    })();

    $("#submitBtn").on("click", function (e) {
        e.preventDefault();
        $("#submitBtnHidden").click();
    });

    $("#questionForm").on("submit", function (e) {
        e.preventDefault();

        if (!$("#input_question").val()) {
            // validation failed
            $("#feedBackforQ").text("Please input a question.");
        } else {
            console.log($("#input_question").val()); // test
            var indexx = -1;
            for (let i = 0; i < $error_names.length; i++) {
                if ($error_names[i] === $("#input_question").val()) {

                    indexx = i;
                } // if
            } // for

            if (indexx !== -1) {
                sessionStorage.setItem('questionn', JSON.stringify($("#input_question").val()));
                self.location.href = '/main';
            } // if
            else {
                $("#input_question").addClass("is-invalid");
                $("#feedBackforQ").text("No such question!");
            } // else 
        } // if
    });

    $("#input_question").on("focus", function () {
        $("#myMenu").show();
        myFunction();
    });

    $("#input_question").on("input", function () {
        $("#myMenu").show();
        myFunction();
    });

    $("#input_question").on("blur", function () {
        $("#myMenu").hide();
    });


}); // on document ready
