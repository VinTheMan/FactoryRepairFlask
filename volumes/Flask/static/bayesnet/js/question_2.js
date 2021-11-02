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

        var $gen_csv = true ;
        $.ajax({
            url: '/gen_csv',
            method: 'POST',
            data: { gen_csv: $gen_csv },
            dataType: "text"
        }).done(function (_data) {
            self.location.href = 'http://127.0.0.1:5000/main_2.html';
        });
    });


}); // on document ready
