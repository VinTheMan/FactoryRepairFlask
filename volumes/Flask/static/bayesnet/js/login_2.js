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

    (function () {
        sessionStorage.clear();
        localStorage.clear();
    })();

    $("#submitBtn").on("click", function (e) {
        e.preventDefault();
        $("#submitBtnHidden").click();
    });

    $("#loginForm").on("submit", function (e) {
        e.preventDefault();

        if (!$("#input_factory").val()) {
            // validation failed
        } else {
            console.log($("#input_factory").val()); // test
            sessionStorage.setItem('factoryy', JSON.stringify($("#input_factory").val()));
        } // if

        var $username = $("#input_username").val();
        var $passwd = $("#input_passwd").val();
        var $f = $("#input_factory").val();
        // $.ajax({
        //     url: "/RepairMember",
        //     method: 'POST',
        //     data: { username: $username, passwd: $passwd, f: $f },
        //     dataType: "json",
        //     error: function (request) {
        //         // remember to filter out size 0 array
        //         alert(request.responseJSON.message);
        //     },
        //     success: function () {
        //         self.location.href = '/question';
        //     }
        // });

        // var $key_field = "Hi";
        // $.ajax({                 // for test
        //     url: "/Getkey",
        //     method: 'POST',
        //     data: { key_field: $key_field },
        //     dataType: "json",
        //     error: function (request) {
        //         // remember to filter out size 0 array
        //         alert(request.responseJSON.message);
        //     },
        //     success: function (data) {
        //         alert(data);
        //     }
        // });

        $.ajax({                 // for test
            url: "/GetXML",
            method: 'POST',
            dataType: "json",
            error: function (request) {
                // remember to filter out size 0 array
                console.log(request);
            },
            success: function (data) {
                console.log(data);
            }
        });
    });


}); // on document ready
