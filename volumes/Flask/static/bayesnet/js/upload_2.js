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

    var d = new Date();

    var month = d.getMonth() + 1;
    var day = d.getDate();

    var output = d.getFullYear() + '/' +
        (month < 10 ? '0' : '') + month + '/' +
        (day < 10 ? '0' : '') + day;
    var datee = output;
    var projectt = JSON.parse(sessionStorage.getItem('projectt'));
    var factoryy = JSON.parse(sessionStorage.getItem('factoryy'));
    // var isnn = JSON.parse(sessionStorage.getItem('isnn'));
    // var solutionn = JSON.parse(sessionStorage.getItem('solutionn'));

    // c.push(1);
    // sessionStorage.setItem('locSepCount', JSON.stringify(c));

    (function () {
        // sessionStorage.setItem('is_there_solutionn', JSON.stringify("no")); // test
        if( sessionStorage.getItem('is_there_solutionn') === null ) {
            $("#input_solution").hide();
        } // if
        else{
            $("#solutionHere").hide();
        } // else
    })();

    $("#dateHere").val(datee);
    $("#projectHere").text(projectt);
    $("#factoryHere").text(factoryy);
    // $("#isnHere").text(isnn);
    // $("#solutionHere").text(solutionn);

    $("#submitBtn").on("click", function (e) {
        e.preventDefault();
        $("#submitBtnHidden").click();
    });

    $("#uploadForm").on("submit", function (e) {
        e.preventDefault();

        var $testArray = ['FixPosition', 'B0B1', 'M0M1'];
        $.ajax({                 // for test
            url: "/InsertRecord",
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ Factory: "F2", Actions: $testArray, ErrorName: "銅露", Solved: "0" }),
            dataType: "json",
            error: function (request) {
                // remember to filter out size 0 array
                alert(request.responseJSON.message);
            },
            success: function (data) {
                alert(data);
            }
        });

        if (!$("#input_isn").val() || !$("#input_solution").val()) {
            // validation failed
        } else {
            console.log($("#input_isn").val()); // test
            sessionStorage.setItem('isnn', JSON.stringify($("#input_isn").val()));
            console.log($("#input_solution").val()); // test
            sessionStorage.setItem('solutionn', JSON.stringify($("#input_solution").val()));

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
            // setTimeout(function () { window.location.href = '/'; }, 1000);
        } // if
    });

    $("#backBtn").on('click', function(e){
        e.preventDefault();
        window.history.go(-1);
    }) ;


}); // on document ready
