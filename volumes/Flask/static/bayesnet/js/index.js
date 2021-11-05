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

function FindNextSol() {
    var indexXL = -1;
    for (let a = 0; a < yesYes.length - 1; a++) {
        if (yesYes[a] !== 100 && yesYes[a] !== 0) {
            if (indexXL === -1) {
                indexXL = a;
            } // if
            else if (yesYes[indexXL] <= yesYes[a]) {
                indexXL = a;
            } // else if
        } // if
    } // for

    if (indexXL === -1) { // if no more solutions are found
        console.log('report new solution or no solution');

        $('tr[node_id="Solved"]').find('li[value_index="0"]').find('input').click();
        sessionStorage.setItem('is_there_solutionn', JSON.stringify('no')); // test
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

        // go to upload page
        // setTimeout(function () { window.location.href = '/Result'; }, 1600);
    } // if
    else {
        pdf = '/getPDF?pdf_name=' + nodeNames[indexXL];
        var bayesnet_solution = $(".bayesnet-solution > table > tbody").empty();
        bayesnet_solution.append('<tr>' +
            '<td class="w-50"><strong class="fs-1">' + nodeNames[indexXL] + '</strong></td>' +
            '<td class="w-50"><strong class="fs-1">' + '<a href="/getPDF?pdf_name=' + nodeNames[indexXL] + '" target="_blank">Open in new window</a>' + '</strong></td>' +
            '</tr>'
        );
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
    var factoryy = JSON.parse(sessionStorage.getItem('factoryy'));

    if (factoryy === "F2") {
        $('#f2').click();
    } // if
    else {
        $('#nonf2').click();
    } // else

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
    _draw_result_table(JSON.parse(sessionStorage.getItem('changed_xml')));
    var factoryy = JSON.parse(sessionStorage.getItem('factoryy'));

    if (factoryy === "F2") {
        $('#f2').click();
    } // if
    else {
        $('#nonf2').click();
    } // else

    if (sessionStorage.getItem("change_probability_filename") != null) {
        $("#changeXMLBtn").text("Use Database");
    } // if
    else {
        $("#changeXMLBtn").text("Use Edited");
    } // else
} // reDrawGraph

var copyfunction = function () {
    
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

function FileExist() 
{
    // $.ajax({
    //     url: get_session_id() + "_copy.xml",
    //     method: 'GET',
    //     dataType: "text",
    //     error: function(err)
    //     {
    //         //file not exists
    //         if(err.status == 404)
    //         {
    //             copyfunction();
    //         }
    //         else
    //         {
    //             console.log(err);
    //         }
    //     },
    //     success: function()
    //     {
    //         //file exists
    //         console.log('file exist');
    //     }
    // });
}


$(document).ready(function () {

    FileExist();
    $('#f2').on('click', function (e) {
        e.preventDefault();
        // CleanUpAllClicked();
        if ($('tr[node_id="Factory2"]').find('li[value_index="1"]').hasClass("set")) { // if the option is already clicked
            // do nothing
        } // if
        else {
            $('tr[node_id="Factory2"]').find('li[value_index="1"]').find('input').click();
            FindNextSol();
        } // else

        $('#allDynamic').show();
    });


    $('#nonf2').on('click', function (e) {
        e.preventDefault();
        // CleanUpAllClicked();
        if ($('tr[node_id="Factory2"]').find('li[value_index="0"]').hasClass("set")) { // if the option is already clicked
            // do nothing
        } // if
        else {
            $('tr[node_id="Factory2"]').find('li[value_index="0"]').find('input').click();
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
        setTimeout(function () { window.location.href = 'http://127.0.0.1:5000/upload_2.html'; }, 1600);
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
            // fileName = get_session_id() + "_copy"; 
            sessionStorage.setItem('change_probability_filename', JSON.stringify(fileName));
            $("#changeXMLBtn").text("Use Database");
            $("#copyfromdatabase").show();
        } // if
        else {
            // fileName = get_session_id();
            sessionStorage.removeItem('change_probability_filename');
            $("#changeXMLBtn").text("Use Edited");
            $("#copyfromdatabase").hide();
        } // else

        CleanUpAllClicked();
        reDrawGraph(fileName);
    });

    $("#copyfromdatabase").on('click', function (e) {
        e.preventDefault();
        var test = $("#original_data").val();
        $.ajax({
            type: "post",
            url: "download.php",
            data: { test: test  , fileName : get_session_id() + "_copy"},
            dataType:'json',
            success: function(data) {
                console.log('ok');
                //console.log(data);
                reDrawGraph(get_session_id() + "_copy");
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.warn(jqXHR.responseText);
                    alert(errorThrown);
                }
            });
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
        $("#mainProblem").text("Main Problem: " + mainQ);
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
});
