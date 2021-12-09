var notyf = new Notyf();

var nodeNames = [];
var yesYes = [];
var noNo = [];
var parentNodes = [];
var Qcount = 1;
var _PDF_DOC,
    _CURRENT_PAGE,
    _TOTAL_PAGES,
    _PAGE_RENDERING_IN_PROGRESS = 0,
    _CANVAS = document.querySelector('#pdf-canvas');
var pdf = "";

var actionArray = [];

function FindNextSol() {
    var indexXL = -1;
    for (let a = 0; a < nodeNames.length - 1; a++) {
        if ($('tr[node_id="' + nodeNames[a] + '"]').find('li[value_index="1"]').hasClass("set") ||
            $('tr[node_id="' + nodeNames[a] + '"]').find('li[value_index="0"]').hasClass("set")) {
            // ignore the already checked
        } // if
        else {
            if (indexXL === -1) {
                indexXL = a;
            } // if
            else if (yesYes[indexXL] <= yesYes[a] || yesYes[indexXL] === "NaN") {
                indexXL = a;
            } // else if
        } // else
    } // for

    if (indexXL === -1) { // if no more solutions are found
        // console.log('report new solution or no solution'); // test
        $('tr[node_id="Solved"]').find('li[value_index="0"]').find('input').click();
        sessionStorage.setItem('is_there_solutionn', JSON.stringify('no'));
        sessionStorage.removeItem('solutionn');
        $("#allDynamic").hide();
        notyf.error({
            message: "No Solution Found !",
            duration: 1500,   //miliseconds, use 0 for infinite duration
            ripple: true,
            dismissible: true,
            position: {
                x: "right",
                y: "bottom"
            }
        });

        var not_solve = 0;
        // go to upload page
        sessionStorage.setItem('actionArray', JSON.stringify(actionArray));
        sessionStorage.setItem('solved', JSON.stringify(not_solve));
        setTimeout(function () { window.location.href = '/Result'; }, 1600);
    } // if
    else {
        $("video").removeAttr('data-src');
        $("video").removeAttr('src');

        var Factory = JSON.parse(sessionStorage.getItem('factoryy'));
        var ErrorName = JSON.parse(sessionStorage.getItem('questionn'));
        $.ajax({
            url: "/Check_mp4_or_pdf",
            method: 'POST',
            dataType: 'json', // what to expect back from server
            data: { Factory: Factory, ActionName: nodeNames[indexXL], ErrorName: ErrorName },
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
            },
            success: function (data) {
                // console.log(data.message); // test
                if (data.message === "PDF") {
                    $("#show-pdf-button").show();
                    $("#toggleVideo").hide();
                    // ------------  embedded PDF --------
                    pdf = './download/' + ErrorName + '_' + nodeNames[indexXL] + '.pdf';
                    var bayesnet_solution = $(".bayesnet-solution > table > tbody").empty();
                    bayesnet_solution.append('<tr>' +
                        '<td class="w-50 align-items-center"><strong class="fs-3 col col-auto">' + nodeNames[indexXL] + '</strong></td>' +
                        '<td class="w-50 align-items-center"><strong class="fs-3 col col-auto">' + '<a href="./download/' +
                        ErrorName + '_' + nodeNames[indexXL] + '.pdf" target="_blank">Open PDF in new window <span class="fas fa-long-arrow-alt-right"></span></a>' +
                        '</strong></td>' +
                        '</tr>'
                    );
                    //-------------------------------------
                } // if
                else if (data.message === "MP4") {
                    $("#show-pdf-button").hide();
                    $("#toggleVideo").show();
                    // ------------  embedded Video --------
                    var bayesnet_solution = $(".bayesnet-solution > table > tbody").empty();
                    bayesnet_solution.append('<tr>' +
                        '<td class="w-50 align-items-center"><strong class="fs-3 col col-auto">' + nodeNames[indexXL] + '</strong></td>' +
                        '<td class="w-50 align-items-center"><strong class="fs-3 col col-auto">' + '<a href="./download/' +
                        ErrorName + '_' + nodeNames[indexXL] + '.mp4" target="_blank">Open MP4 in new window <span class="fas fa-long-arrow-alt-right"></span></a>' +
                        '</strong></td>' +
                        '</tr>'
                    );

                    var video = document.getElementById('solutionVideo');
                    var source = document.createElement('source');

                    source.setAttribute('src', './download/' + ErrorName + '_' + nodeNames[indexXL] + '.mp4');
                    source.setAttribute('type', 'video/mp4');

                    video.innerHTML = '';
                    video.appendChild(source);
                    video.pause();
                    video.load();
                    //------------------------------------------
                } // else if
                else if (data.message === "BOTH") {
                    $("#show-pdf-button").show();
                    $("#toggleVideo").show();
                    // ------------  embedded Video --------
                    var video = document.getElementById('solutionVideo');
                    var source = document.createElement('source');

                    source.setAttribute('src', './download/' + ErrorName + '_' + nodeNames[indexXL] + '.mp4');
                    source.setAttribute('type', 'video/mp4');

                    video.innerHTML = '';
                    video.appendChild(source);
                    video.pause();
                    video.load();
                    //------------------------------------------
                    // ------------  embedded PDF --------
                    pdf = './download/' + ErrorName + '_' + nodeNames[indexXL] + '.pdf';
                    var bayesnet_solution = $(".bayesnet-solution > table > tbody").empty();
                    bayesnet_solution.append('<tr>' +
                        '<td class="w-50 align-middle"><strong class="fs-1 col col-auto">' + nodeNames[indexXL] + '</strong></td>' +
                        '<td class="w-50 align-middle"><strong class="fs-5 col col-auto">' + '<a href="./download/' +
                        ErrorName + '_' + nodeNames[indexXL] + '.pdf" target="_blank">Open PDF in new window <span class="fas fa-long-arrow-alt-right"></span></a>' +
                        '<div class="w-100" style="height: 1ch;"></div>' +
                        '<a href="./download/' +
                        ErrorName + '_' + nodeNames[indexXL] + '.mp4" target="_blank">Open MP4 in new window <span class="fas fa-long-arrow-alt-right"></span></a>' +
                        '</strong></td>' +
                        '</tr>'
                    );
                    //-------------------------------------
                } // else if
                else { // NO FILES FOUND!
                    var bayesnet_solution = $(".bayesnet-solution > table > tbody").empty();
                    bayesnet_solution.append('<tr>' +
                        '<td class="w-50 align-items-center"><strong class="fs-3 col col-auto">' + nodeNames[indexXL] + '</strong></td>' +
                        '<td class="w-50 align-items-center"><strong class="fs-3 col col-auto">' + 'No Solution Files Found!' + '</strong></td>' +
                        '</tr>'
                    );
                } // else
            } // success
        });
    } // else

} // FindNextSol

function CleanUpAllClicked() {
    $('tr[node_id]').find('li[value_index]').each(function (index) {
        if ($(this).hasClass("set")) {
            $(this).find('input').click();
        } // if
    });
} // CleanUpAllClicked()

function reDrawGraph(fileName) {
    $("#theGraphs").show(); // show the graph
    // $("#theGraphs").hide(); // hide the graph
    if (fileName == "new") {
        _combine_input();
    } // if
    else if (fileName == "copy") {
        _combine_input_copy();
    } // else if

    setTimeout(CleanUpAllClicked(), 0.1 * 1000);
    setTimeout(function () { $('#f2').click() }, 0.3 * 1000);
    // CleanUpAllClicked();
    // $('#f2').click();
} // reDrawGraph

$(document).ready(function () {
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
    else if (sessionStorage.getItem("questionn") === null) {
        notyf.error({
            message: "Please Select An Issue !",
            duration: 1500,   //miliseconds, use 0 for infinite duration
            ripple: true,
            dismissible: true,
            position: {
                x: "center",
                y: "center"
            }
        });
        window.location.href = '/question';
    } // else if

    sessionStorage.removeItem('is_there_solutionn');  // initialize
    sessionStorage.removeItem('changed_xml');
    sessionStorage.removeItem('change_probability_filename');
    $("#changeXMLBtn").text("Use Edited");
    $("#copyfromdatabase").hide();

    $('#f2').click();

    $('#f2').on('click', function (e) {
        e.preventDefault();
        // CleanUpAllClicked();
        if ($('tr[node_id="' + nodeNames[0] + '"]').find('li[value_index="1"]').hasClass("set")) { // if the option is already clicked
            // do nothing
        } // if
        else {
            $('tr[node_id="' + nodeNames[0] + '"]').find('li[value_index="1"]').find('input').click();
            FindNextSol();
        } // else

        $('#allDynamic').show();
    });


    $('#nonf2').on('click', function (e) {
        e.preventDefault();
        // CleanUpAllClicked();
        if ($('tr[node_id="' + nodeNames[0] + '"]').find('li[value_index="0"]').hasClass("set")) { // if the option is already clicked
            // do nothing
        } // if
        else {
            $('tr[node_id="' + nodeNames[0] + '"]').find('li[value_index="0"]').find('input').click();
            FindNextSol();
        } // else

        $('#allDynamic').show();
    });

    $('#yesBtn').on('click', function (e) {
        e.preventDefault();

        var currentSolutionName = $(".bayesnet-solution > table > tbody > tr > td").first().find("strong").text();
        // console.log(currentSolutionName) ; // test
        if ($('tr[node_id="' + currentSolutionName + '"]').find('li[value_index="1"]').hasClass("set")) { // if the option is already clicked
            // do nothing
        } // if
        else {
            $('tr[node_id="' + currentSolutionName + '"]').find('li[value_index="1"]').find('input').click();
            actionArray.push(currentSolutionName);
        } // else

        $("#allDynamic").hide();
        $("#allDynamic1").show();
    });

    $('#yesBtn2').on('click', function (e) {
        e.preventDefault();

        var currentSolutionName = $(".bayesnet-solution > table > tbody > tr > td").first().find("strong").text();
        // console.log(currentSolutionName) ; // test

        $('tr[node_id="Solved"]').find('li[value_index="1"]').find('input').click();

        sessionStorage.setItem('solutionn', JSON.stringify(currentSolutionName)); // pretend this is a post to flask
        notyf.success({
            message: "Solution Found !",
            duration: 1500,   //miliseconds, use 0 for infinite duration
            ripple: true,
            dismissible: true,
            position: {
                x: "right",
                y: "bottom"
            }
        });

        $("#allDynamic").hide();
        // setTimeout(function () { location.reload(); }, 1600);
        // go to upload page
        var solved = 1;
        sessionStorage.setItem('actionArray', JSON.stringify(actionArray));
        sessionStorage.setItem('solved', JSON.stringify(solved));
        setTimeout(function () { window.location.href = '/Result'; }, 1600);
    });

    $('#noBtn').on('click', function (e) {
        e.preventDefault();

        var currentSolutionName = $(".bayesnet-solution > table > tbody > tr > td").first().find("strong").text();
        if ($('tr[node_id="' + currentSolutionName + '"]').find('li[value_index="0"]').hasClass("set")) { // if the option is already clicked
            // do nothing
        } // if
        else {
            $('tr[node_id="' + currentSolutionName + '"]').find('li[value_index="0"]').find('input').click();
        } // else

        FindNextSol();
    });

    $('#noBtn2').on('click', function (e) {
        e.preventDefault();

        $("#allDynamic1").hide();
        $("#allDynamic").show();
        FindNextSol();
    });

    $('#isDone').on('click', function (e) {
        e.preventDefault();
        // $("#allDynamic").empty();

        nodeNames = [];
        yesYes = [];
        noNo = [];
        parentNodes = [];
        $('tr[node_id]').each(function (i, obj) {
            nodeNames.push($(obj).attr('node_id'));
            let x = parseFloat($(obj).find('li[value_index="0"]').find('span').text());
            noNo.push(x);
            let y = parseFloat($(obj).find('li[value_index="1"]').find('span').text());
            yesYes.push(y);
            var attr = $(obj).attr('parent_nodes');
            if (typeof attr !== 'undefined' && attr !== false) {
                parentNodes.push(JSON.parse(attr));
            } // if
            else {
                parentNodes.push([]);
            } // else

        });

        // console.log(nodeNames); // test
        // console.log(noNo); // test
        // console.log(parentNodes); // test
    });

    $("#toggleGraphs").on('click', function (e) {
        e.preventDefault();
        $("#theGraphs").toggle(); // show hide the graph
    });

    $("#changeXMLBtn").on('click', function (e) {
        e.preventDefault();
        var fileName = "";
        if ($("#changeXMLBtn").text() === "Use Edited") {
            fileName = "copy";
            sessionStorage.setItem('change_probability_filename', JSON.stringify(fileName));
            $("#changeXMLBtn").text("Use Database");
            $("#copyfromdatabase").show();
            var faa = JSON.parse(sessionStorage.getItem('factoryy'));
            var errName = JSON.parse(sessionStorage.getItem('questionn'));

            $.ajax({
                url: "/check_edited_txt_exist",
                method: 'POST',
                data: { Factory: faa, ErrorName: errName },
                dataType: "json",
                error: function (request) {
                    if (request.status == 420) {
                        alert(request.responseJSON.message);
                    } // if
                    else {
                        console.log(request);
                    } // else
                },
                success: function (response) {
                    if (response.message === "Existed") {
                        $.ajax({
                            url: "/GetFromEditedProb",
                            method: 'POST',
                            data: { Factory: faa, ErrorName: errName },
                            dataType: "json",
                            error: function (request) {
                                if (request.status == 420) {
                                    alert(request.responseJSON.message);
                                } // if
                                else {
                                    console.log(request);
                                } // else
                            },
                            success: function (response) {
                                var data = response.message;
                                // console.log(data); // test
                                $("#change_data").val(response.message);
                                sessionStorage.setItem('changed_xml', JSON.stringify(data));
                                console.log('get copy success');

                                reDrawGraph(fileName);
                            } // success
                        }); // ajax
                    } // if
                    else { // make a new copy in server
                        var xmlData = $("#input_data").val();
                        $.ajax({
                            url: "/writeToEditedProb",
                            method: 'POST',
                            data: { Factory: faa, ErrorName: errName, XMLDATA: xmlData },
                            dataType: "json",
                            error: function (request) {
                                if (request.status == 420) {
                                    alert(request.responseJSON.message);
                                } // if
                                else {
                                    console.log(request);
                                } // else
                            },
                            success: function (response) {
                                var data = $("#input_data").val();
                                // console.log(data); // test
                                $("#change_data").val(data);
                                sessionStorage.setItem('changed_xml', JSON.stringify(data));
                                console.log('write new copy success');

                                reDrawGraph(fileName);
                            } // success
                        }); // ajax
                    } // else
                } // success
            });
        } // if
        else {
            fileName = "new";
            sessionStorage.removeItem('change_probability_filename');
            $("#changeXMLBtn").text("Use Edited");
            $("#copyfromdatabase").hide();
            reDrawGraph(fileName);
        } // else

        console.log("change xml click"); // test
    });

    $("#copyfromdatabase").on('click', function (e) {
        e.preventDefault();
        var XMLDATA = $("#input_data").val();
        $("#change_data").val(XMLDATA);

        var $condition1 = JSON.parse(sessionStorage.getItem('factoryy'));
        var $condition2 = JSON.parse(sessionStorage.getItem('questionn'));
        $.ajax({
            url: "/writeToEditedProb",
            method: 'POST',
            data: { Factory: $condition1, ErrorName: $condition2, XMLDATA: XMLDATA },
            dataType: "json",
            error: function (request) {
                if (request.status == 420) {
                    alert(request.responseJSON.message);
                } // if
                else {
                    console.log(request);
                } // else
            },
            success: function (response) {
                // console.log(data); // test
                console.log('write database to copy success at copyfromdatabase');
                reDrawGraph("copy");
            } // success
        }); // ajax
    });

    $("#BacktoQuestionSel").on("click", function (e) {
        e.preventDefault();
        // console.log("clicked !") ; // test
        window.location.href = "/question#IssueDiv";
    });

    $(".scrollToGraphDiv").on("click", function (e) {
        e.preventDefault();
        // console.log("clicked !") ; // test
        $('html, body').animate({ scrollTop: $('#GraphDiv').offset().top - 50 }, 'fast');
    });

    $(".scrollToSolutionDiv").on("click", function (e) {
        e.preventDefault();
        // console.log("clicked !") ; // test
        $('html, body').animate({ scrollTop: $('#SolutionDiv').offset().top - 50 }, 'fast');
    });

    var VideoDiv = document.getElementById('VideoDiv')
    VideoDiv.addEventListener('hidden.bs.collapse', function () {
        $("#toggleVideo").text("Show Video");
    });

    VideoDiv.addEventListener('shown.bs.collapse', function () {
        $("#toggleVideo").text("Close Video");
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

    (function () {
        // sessionStorage.setItem('questionn', JSON.stringify('銅露')); // test
        var mainQ = JSON.parse(sessionStorage.getItem('questionn'));
        $("#mainProblem").text("Main Issue: " + mainQ);
        $("#askMainQ").html('排除此現象後，<strong style="color: #db7c07;">' + mainQ + '</strong>是否解決？');
    })();

    async function showPDF(pdf_url) {
        document.querySelector("#pdf-loader").style.display = 'block';

        // get handle of pdf document
        try {
            _PDF_DOC = await pdfjsLib.getDocument({ url: pdf_url });
        }
        catch (error) {
            alert(error.message);
        }

        // total pages in pdf
        _TOTAL_PAGES = _PDF_DOC.numPages;

        // Hide the pdf loader and show pdf container
        document.querySelector("#pdf-loader").style.display = 'none';
        document.querySelector("#pdf-contents").style.display = 'block';
        document.querySelector("#pdf-total-pages").innerHTML = _TOTAL_PAGES;

        // show the first page
        showPage(1);
    }
    async function closePDF() {
        document.querySelector("#pdf-loader").style.display = 'none';
        // Hide the pdf loader and show pdf container
        document.querySelector("#pdf-loader").style.display = 'none';
        document.querySelector("#pdf-contents").style.display = 'none';
    }
    async function showPage(page_no) {
        _PAGE_RENDERING_IN_PROGRESS = 1;
        _CURRENT_PAGE = page_no;

        // disable Previous & Next buttons while page is being loaded
        document.querySelector("#pdf-next").disabled = true;
        document.querySelector("#pdf-prev").disabled = true;

        // while page is being rendered hide the canvas and show a loading message
        document.querySelector("#pdf-canvas").style.display = 'none';
        document.querySelector("#page-loader").style.display = 'block';

        // update current page
        document.querySelector("#pdf-current-page").innerHTML = page_no;

        // get handle of page
        try {
            var page = await _PDF_DOC.getPage(page_no);
        }
        catch (error) {
            alert(error.message);
        }

        // original width of the pdf page at scale 1
        var pdf_original_width = page.getViewport(1).width;

        // as the canvas is of a fixed width we need to adjust the scale of the viewport where page is rendered
        var scale_required = _CANVAS.width / pdf_original_width;

        // get viewport to render the page at required scale
        var viewport = page.getViewport(scale_required);

        // set canvas height same as viewport height
        _CANVAS.height = viewport.height;

        // setting page loader height for smooth experience
        document.querySelector("#page-loader").style.height = _CANVAS.height + 'px';
        document.querySelector("#page-loader").style.lineHeight = _CANVAS.height + 'px';

        // page is rendered on <canvas> element
        var render_context = {
            canvasContext: _CANVAS.getContext('2d'),
            viewport: viewport
        };

        // render the page contents in the canvas
        try {
            await page.render(render_context);
        }
        catch (error) {
            alert(error.message);
        }

        _PAGE_RENDERING_IN_PROGRESS = 0;

        // re-enable Previous & Next buttons
        document.querySelector("#pdf-next").disabled = false;
        document.querySelector("#pdf-prev").disabled = false;

        // show the canvas and hide the page loader
        document.querySelector("#pdf-canvas").style.display = 'block';
        document.querySelector("#page-loader").style.display = 'none';
    }

    // click on the "Previous" page button
    document.querySelector("#pdf-prev").addEventListener('click', function () {
        if (_CURRENT_PAGE != 1)
            showPage(--_CURRENT_PAGE);
    });

    // click on the "Next" page button
    document.querySelector("#pdf-next").addEventListener('click', function () {
        if (_CURRENT_PAGE != _TOTAL_PAGES)
            showPage(++_CURRENT_PAGE);
    });
    document.querySelector("#show-pdf-button").addEventListener('click', function () {
        $(this).hide();
        $("#close-pdf-button").show();
        showPDF(pdf);
    });
    document.querySelector("#close-pdf-button").addEventListener('click', function () {
        $(this).hide();
        $("#show-pdf-button").show();
        closePDF();
    });
}); // on document ready

$(window).on('load', function () {
    // PAGE IS FULLY LOADED
    // FADE OUT YOUR OVERLAYING DIV
    $('body').loadingModal('hide');
    $('body').loadingModal('destroy');
});
