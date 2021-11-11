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

    $("#issueForm").on("submit", function (e) {
        e.preventDefault();

        if (!$("#input_issue").val() || !$("#input_action").val()) {
            // validation failed
        } else {
            console.log($("#input_issue").val()); // test
            var indexx = -1;
            for (let i = 0; i < $error_names.length; i++) {
                if ($error_names[i] === $("#input_issue").val()) {
                    indexx = i;
                } // if
            } // for

            if (indexx !== -1) {
                alert("Issue already exist !");
            } // if
            else {
                var input_issue = $("#input_issue").val;
                var input_actionObj = $(".input_action");
                var input_action = [];
                for (let a = 0; a < input_actionObj.length; a++) {
                    input_action.push($(input_actionObj[a]).val());
                } // for
                console.log(input_action); // test
                // $.ajax({
                //     url: "/GetErrorName",
                //     method: 'POST',
                //     dataType: "json",
                //     error: function (request) {
                //         // remember to filter out size 0 array
                //         if (request.status == 420) {
                //             alert(request.responseJSON.message);
                //         } // if
                //         else {
                //             console.log(request);
                //         } // else
                //     },
                //     success: function (response) {
                //         $error_names = response.message;
                //         console.log($error_names); // test
                //     }
                // });
            } // else 
        } // if
    });

    $("#moreAction").on('click', function (e) {
        e.preventDefault();
        $("#insertB4").before('<div class="col-5">' +
            '<input class="input_action form-control text-center" type="text" placeholder="Action" autocomplete="off">' +
            '</div>');
        $("#insertB4").before('<div class="w-100" style="height: 2ch;"></div>');
    });

}); // on document ready
