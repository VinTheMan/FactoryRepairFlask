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

    $("#submitBtn").on("click", function (e) {
        e.preventDefault();
        $("#submitBtnHidden").click();
    });

    $("#questionForm").on("submit", function (e) {
        e.preventDefault();

        if (!$("#input_question").val()) {
            // validation failed
        } else {
            console.log($("#input_question").val()); // test
            sessionStorage.setItem('questionn', JSON.stringify($("#input_question").val()));
        } // if

        var $qquestion = $("#input_question").val();

        self.location.href = '/main';
    });


}); // on document ready
