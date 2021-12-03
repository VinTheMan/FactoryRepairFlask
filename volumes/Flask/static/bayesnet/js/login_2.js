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

    (function () {
        sessionStorage.clear();
        localStorage.clear();
        $("#input_username").val("Jonathan");
        $("#input_passwd").val("123");
        $('#input_factory option[value="F1"]').prop('selected', 'selected').change();
    })();

    $("#submitBtn").on("click", function (e) {
        e.preventDefault();
        $("#submitBtnHidden").click();
    });

    $("#loginForm").on("submit", function (e) {
        e.preventDefault();

        if (!$("#input_factory").val() || !$("#input_username").val() || !$("#input_passwd").val() ) {
            // validation failed
        } else {
            console.log($("#input_factory").val()); // test
            sessionStorage.setItem('factoryy', JSON.stringify($("#input_factory").val()));
            var formData = new FormData();
            var $username = $("#input_username").val();
            var $passwd = $("#input_passwd").val();
            var $f = $("#input_factory").val();
            formData.append("username", $username);
            formData.append("passwd", $passwd);
            formData.append("f", $f);

            $.ajax({
                url: "/RepairMember",
                method: 'POST',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                dataType: "json",
                beforeSend: function () {
                    // console.log('sup, loading modal triggered !'); // test
                    $('body').loadingModal({
                        text: 'Loading...',
                        animation: 'circle'
                    });
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
                        message: "Login failed !",
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
                    self.location.href = '/question';
                }
            }); // ajax
        } // if
    });


    $("#scrollToLogin").on("click", function (e) {
        e.preventDefault();
        // console.log("clicked !") ; // test
        $('html, body').animate({ scrollTop: $('#looogin').offset().top - 10 }, 'fast');
    });
}); // on document ready
