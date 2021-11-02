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

    $("#entryForm").on("submit", function (e) {
        e.preventDefault();

        if (!$("#input_factory").val() || !$("#input_project").val() || !$("#input_isn").val() ) {
            // validation failed
        } else {
            console.log($("#input_factory").val()); // test
            sessionStorage.setItem('factoryy', JSON.stringify($("#input_factory").val()));
            console.log($("#input_project").val()); // test
            sessionStorage.setItem('projectt', JSON.stringify($("#input_project").val()));
            self.location.href = 'http://127.0.0.1:5000/question_2.html';
        } // if
    });


}); // on document ready
