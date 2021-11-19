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
        console.log('report new solution or no solution');

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
                console.log(data.message); // test
                if (data.message === "PDF") {
                    $("#show-pdf-button").show();
                    $("#toggleVideo").hide();
                    // ------------  embedded PDF --------
                    pdf = './download/' + Factory + '_' + ErrorName + '_' + nodeNames[indexXL] + '.pdf';
                    var bayesnet_solution = $(".bayesnet-solution > table > tbody").empty();
                    bayesnet_solution.append('<tr>' +
                        '<td class="w-50"><strong class="fs-1">' + nodeNames[indexXL] + '</strong></td>' +
                        '<td class="w-50"><strong class="fs-1">' + '<a href="./download/' +
                        Factory + '_' + ErrorName + '_' + nodeNames[indexXL] + '.pdf" target="_blank">Open PDF in new window</a>' +
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
                        '<td class="w-50"><strong class="fs-1">' + nodeNames[indexXL] + '</strong></td>' +
                        '<td class="w-50"><strong class="fs-1">' + '<a href="./download/' +
                        Factory + '_' + ErrorName + '_' + nodeNames[indexXL] + '.mp4" target="_blank">Open MP4 in new window</a>' +
                        '</strong></td>' +
                        '</tr>'
                    );

                    var video = document.getElementById('solutionVideo');
                    var source = document.createElement('source');

                    source.setAttribute('src', './download/' + Factory + '_' + ErrorName + '_' + nodeNames[indexXL] + '.mp4');
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

                    source.setAttribute('src', './download/' + Factory + '_' + ErrorName + '_' + nodeNames[indexXL] + '.mp4');
                    source.setAttribute('type', 'video/mp4');

                    video.innerHTML = '';
                    video.appendChild(source);
                    video.pause();
                    video.load();
                    //------------------------------------------
                    // ------------  embedded PDF --------
                    pdf = './download/' + Factory + '_' + ErrorName + '_' + nodeNames[indexXL] + '.pdf';
                    var bayesnet_solution = $(".bayesnet-solution > table > tbody").empty();
                    bayesnet_solution.append('<tr>' +
                        '<td class="w-50"><strong class="fs-1">' + nodeNames[indexXL] + '</strong></td>' +
                        '<td class="w-50"><strong class="fs-5">' + '<a href="./download/' +
                        Factory + '_' + ErrorName + '_' + nodeNames[indexXL] + '.pdf" target="_blank">Open PDF in new window</a>' +
                        '<div class="w-100" style="height: 1ch;"></div>' +
                        '<a href="./download/' +
                        Factory + '_' + ErrorName + '_' + nodeNames[indexXL] + '.mp4" target="_blank">Open MP4 in new window</a>' +
                        '</strong></td>' +
                        '</tr>'
                    );
                    //-------------------------------------
                } // else if
                else { // NO FILES FOUND!
                    var bayesnet_solution = $(".bayesnet-solution > table > tbody").empty();
                    bayesnet_solution.append('<tr>' +
                        '<td class="w-50"><strong class="fs-1">' + nodeNames[indexXL] + '</strong></td>' +
                        '<td class="w-50"><strong class="fs-1">' + 'No Solution Files Found!' + '</strong></td>' +
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

function CheckFactory() {
    // sessionStorage.setItem('factoryy', JSON.stringify('F2')); // test
    // var factoryy = JSON.parse(sessionStorage.getItem('factoryy'));
    CleanUpAllClicked();
    $('#f2').click();

    if (sessionStorage.getItem("change_probability_filename") != null) {
        $("#changeXMLBtn").text("Use Database");
    } // if
    else {
        $("#changeXMLBtn").text("Use Edited");
    } // else

    console.log("CheckFactory ran!"); // test
} // CheckFactory

function reDrawGraph(fileName) {
    $("#theGraphs").show(); // show the graph
    // $("#theGraphs").hide(); // hide the graph
    //_draw_result_table(JSON.parse(sessionStorage.getItem('changed_xml')));
    if (fileName == "new") {
        _combine_input();
    }
    else if (fileName == "copy") {
        _combine_input_copy();
    }
    var factoryy = JSON.parse(sessionStorage.getItem('factoryy'));

    CleanUpAllClicked();
    $('#f2').click();

    if (sessionStorage.getItem("change_probability_filename") != null) {
        $("#changeXMLBtn").text("Use Database");
    } // if
    else {
        $("#changeXMLBtn").text("Use Edited");
    } // else
} // reDrawGraph

/*var copyfunction = function () {
    
    var test = $("#original_data").val();
    //send to php 
    $.ajax({
        type: "post",
        url: "download.php",
        data: { test: test},
        dataType:'json',
        success: function(data) {
            console.log('ok');
            //console.log(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.warn(jqXHR.responseText);
                alert(errorThrown);
            }
    });
};
*/
/*function FileExist() 
{
    if (sessionStorage.getItem("changed_xml") === null) 
    {
        var data = $("#input_data").val();

        console.log(data);
        sessionStorage.setItem('changed_xml', JSON.stringify(data));
        console.log('copy success');
    }
    else
    {
        console.log('already exist');
    }

}*/


$(document).ready(function () {

    sessionStorage.removeItem('is_there_solutionn');  // initialize
    sessionStorage.removeItem('changed_xml');

    CleanUpAllClicked();
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
        CleanUpAllClicked();
        if ($("#changeXMLBtn").text() === "Use Edited") {
            fileName = "copy";
            sessionStorage.setItem('change_probability_filename', JSON.stringify(fileName));
            $("#changeXMLBtn").text("Use Database");
            $("#copyfromdatabase").show();
        } // if
        else {
            fileName = "new";
            sessionStorage.removeItem('change_probability_filename');
            $("#changeXMLBtn").text("Use Edited");
            $("#copyfromdatabase").hide();
        } // else

        CleanUpAllClicked();
        reDrawGraph(fileName);
    });

    $("#copyfromdatabase").on('click', function (e) {
        e.preventDefault();
        var test = $("#change_data").val();
        sessionStorage.setItem('changed_xml', JSON.stringify(test));
        reDrawGraph("copy");
        console.log("database to copy");
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
        this.style.display = 'none';
        document.querySelector("#close-pdf-button").style.display = 'block';
        showPDF(pdf);
    });
    document.querySelector("#close-pdf-button").addEventListener('click', function () {
        this.style.display = 'none';
        document.querySelector("#show-pdf-button").style.display = 'block';
        closePDF();
    });
}); // on document ready

$(window).on('load', function () {
    // PAGE IS FULLY LOADED  
    // CheckFactory();
    // $("#toggleGraphs").click();

    // PAGE IS FULLY LOADED
    // FADE OUT YOUR OVERLAYING DIV
    $('body').loadingModal('hide');
    $('body').loadingModal('destroy');
});
