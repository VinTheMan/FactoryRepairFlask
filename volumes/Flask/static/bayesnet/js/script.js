
var _combine_input = function () {
    // �}�Y�]�w
    _reset_result();
    // ------------------------------------------
    // ��ƳB�z�]�w
    //_download_dynamic_classification_file();
    //_download_bayes_net_xml_file();
    var _xml = $("#input_data").val();

    //console.log(_xml);
    //var _csv = $("#input_data").val();
    //_load_csv_to_ct_json(_csv);
    _draw_result_table(_xml);

};
var _combine_input_copy = function () {
    // �}�Y�]�w
    _reset_result();
    // ------------------------------------------
    // ��ƳB�z�]�w
    //_download_dynamic_classification_file();
    //_download_bayes_net_xml_file();
    var _xml =  JSON.parse(sessionStorage.getItem('changed_xml'));
    console.log(123);
    //console.log(_xml);
    //var _csv = $("#input_data").val();
    //_load_csv_to_ct_json(_csv);
    _draw_result_table(_xml);

};		// var _combine_input = function () {

// ---------------------------------------

_data = {};

var _get_fix_precision = function (_number) {
    var _precision = $("#input_precise").val();
    _precision = eval(_precision);
    return precision_string(_number, _precision);
};

// -----------------------------------------------------

if (typeof (tinyMCE) === "object") {
    tinyMCE.init({
        mode: "specific_textareas",
        editor_selector: "mceEditor",
        plugins: [
            'advlist autolink lists link image charmap print preview hr anchor pagebreak',
            'searchreplace wordcount visualblocks visualchars code fullscreen',
            'insertdatetime media nonbreaking save table contextmenu directionality',
            'emoticons template paste textcolor colorpicker textpattern imagetools codesample toc'
        ],
        toolbar1: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image  tableprops',
        toolbar2: 'print preview media | forecolor backcolor emoticons | codesample code ',

        setup: function (ed) {
            ed.on('change', function (e) {
                //console.log('the content ', ed.getContent());
                if(sessionStorage.getItem("change_probability_filename") != null) {
                    _combine_input_copy();
                }
                else
                {
                    _combine_input();
                }

            });
        }
    });
}



var _reset_result = function () {

    var _panel = $(".file-process-framework");
    var _input = _panel.find("#preview");
    _input.val("");

    _panel.find("#preview_html").empty();
};

// --------------------------

var _process_file = function (_input, _callback) {
    _callback(_input);
};

var _output_filename_surffix = "_output";

// -------------------------------------

var _load_file = function (evt) {
    //console.log(1);
    if (!window.FileReader) return; // Browser is not compatible

    var _file_input = this;
    var _selector = $(this).data("file-to-textarea");
    _selector = $(_selector);

    if (_selector.length === 0) {
        return;
    }
    //console.log(_selector);
    //return;

    var reader = new FileReader();
    var _result;

    var _file_name = evt.target.files[0].name;

    reader.onload = function (evt) {
        if (evt.target.readyState !== 2) return;
        if (evt.target.error) {
            alert('Error while reading file');
            return;
        }

        //filecontent = evt.target.result;

        //document.forms['myform'].elements['text'].value = evt.target.result;
        _result = evt.target.result;

        _process_file(_result, function (_result) {
            _selector.val(_result);
            _selector.change();
            $(_file_input).val("");
        });
    };

    //    var _pos = _file_name.lastIndexOf(".");
    //    _file_name = _file_name.substr(0, _pos)
    //        + _output_filename_surffix
    //        + _file_name.substring(_pos, _file_name.length);

    //console.log(_file_name);

    reader.readAsText(evt.target.files[0]);
};

var _load_textarea = function (evt) {
    var _panel = $(".file-process-framework");

    // --------------------------

    var _result = _panel.find(".input-mode.textarea").val();
    if (_result.trim() === "") {
        return;
    }

    // ---------------------------

    _panel.find(".loading").removeClass("hide");

    // ---------------------------
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);

    var local = new Date(utc);
    var _file_name = local.toJSON().slice(0, 19).replace(/:/g, "-");
    _file_name = "output_" + _file_name + ".txt";

    // ---------------------------

    _process_file(_result, function (_result) {
        _panel.find(".preview").val(_result);
        _panel.find(".filename").val(_file_name);

        _panel.find(".loading").addClass("hide");
        _panel.find(".display-result").show();
        _panel.find(".display-result .encoding").hide();

        var _auto_download = (_panel.find('[name="autodownload"]:checked').length === 1);
        if (_auto_download === true) {
            _panel.find(".download-file").click();
        }
    });
};

var _create_current_date_string = function () {
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    var local = new Date(utc);
    var _file_name = local.toJSON().slice(0, 19).replace(/:/g, "-");
    return _file_name;
};

// ----------------------------------

var _download_file_button = function () {
    var _panel = $(".file-process-framework");

    var _file_name = _panel.find(".filename").val();
    var _data = _panel.find(".preview").val();

    _download_file(_data, _file_name, "txt");
};


var _download_file = function (data, filename, type) {
    var a = document.createElement("a"),
        file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }

};

var _load_google_spreadsheet = function () {
    var _url = this.value.trim();

    if (_url.indexOf('https://docs.google.com/spreadsheets/d/') !== 0
        || _url.indexOf('/pubhtml') === -1) {
        return;
    }

    // https://docs.google.com/spreadsheets/d/1KL07qS2txPpnZSvLt0gBWJ2_lGsVTr51s5JkE4bg2tY/pubhtml?gid=539063364&single=true

    // https://docs.google.com/spreadsheets/d/1zwOPqpkcX2YRDEXLQEd2eM8OVz24FEXT5WT5eFP6ZsA/pubhtml
    // https://docs.google.com/spreadsheets/d/1zwOPqpkcX2YRDEXLQEd2eM8OVz24FEXT5WT5eFP6ZsA/pubhtml
    // https://docs.google.com/spreadsheets/d/1zwOPqpkcX2YRDEXLQEd2eM8OVz24FEXT5WT5eFP6ZsA/pubhtml?gid=1213777536&single=true
    // 
    // https://docs.google.com/spreadsheets/d/0AtMEoZDi5-pedElCS1lrVnp0Yk1vbFdPaUlOc3F3a2c/pubhtml
    // 
    // https://spreadsheets.google.com/feeds/list/1zwOPqpkcX2YRDEXLQEd2eM8OVz24FEXT5WT5eFP6ZsA/data/public/values?alt=json-in-script&gid=1213777536&callback=a&

    // https://spreadsheets.google.com/feeds/list/0AtMEoZDi5-pedElCS1lrVnp0Yk1vbFdPaUlOc3F3a2c/od6/public/values?alt=json-in-script&callback=a

    // https://spreadsheets.google.com/feeds/list/1zwOPqpkcX2YRDEXLQEd2eM8OVz24FEXT5WT5eFP6ZsA/od6/public/values?alt=json&gid=1213777536&callback=a


    // https://docs.google.com/spreadsheets/d/1zwOPqpkcX2YRDEXLQEd2eM8OVz24FEXT5WT5eFP6ZsA/pub?gid=1213777536&single=true&output=csv
    // https://spreadsheets.google.com/feeds/list/1zwOPqpkcX2YRDEXLQEd2eM8OVz24FEXT5WT5eFP6ZsA/1/public/values?alt=json&gid=1213777536&callback=a

    // https://docs.google.com/spreadsheets/d/1zwOPqpkcX2YRDEXLQEd2eM8OVz24FEXT5WT5eFP6ZsA/pubhtml

    var _id = _url.substring(('https://docs.google.com/spreadsheets/d/').length, _url.length - ('/pubhtml').length);
    console.log(_id);

    var _input = this;
    var _selector = $(_input).data("file-to-textarea");
    _selector = $(_selector);

    //var _json_url = 'https://spreadsheets.google.com/feeds/list/' + _id + '/od6/public/values?alt=json-in-script&callback=?';
    var _json_url = 'https://spreadsheets.google.com/feeds/list/' + _id + '/1/public/values?alt=json-in-script&gid=1213777536&callback=?';
    //console.log(_json_url);
    $.getJSON(_json_url, function (_data) {
        _data = _data.feed.entry;
        var _text = [];
        var _attr_list = [];

        //console.log(_data);
        for (var _i = 0; _i < _data.length; _i++) {
            var _line = _data[_i].content.$t.split(", ");
            for (var _j = 0; _j < _line.length; _j++) {
                var _t = _line[_j].split(": ");
                var _attr = _t[0];
                var _value = _t[1];

                if (_i === 0) {
                    _attr_list.push(_attr);
                }
                _line[_j] = _value;
            }
            _text.push(_line.join(','));
        }

        _text = _attr_list.join(",") + "\n" + _text.join("\n");
        console.log(_text);

        // ----------------------------

        _selector.val(_text).change();

        //console.log(_data);
    });

    // https://script.google.com/macros/s/AKfycbzGvKKUIaqsMuCj7-A2YRhR-f7GZjl4kSxSN1YyLkS01_CfiyE/exec

    //console.log(_id);
};

// -----------------------

// var _load_data_from_filepath = function (_selector, _file_path, _callback) {
//     console.log(_file_path);
//     $.ajax({
//         url: _file_path,
//         method: 'GET',
//         dataType: "text"
//     }).done(function (_data) {
//         console.log(_selector);
//         $(_selector).val(_data);
//         _callback();
//     });
//     $.ajax({
//         url: get_session_id() + "_copy.xml",
//         method: 'GET',
//         dataType: "text"
//     }).done(function (_data) {
//         $('#change_data').val(_data);
//     });
//     $.ajax({
//         url: get_session_id() + ".xml",
//         method: 'GET',
//         dataType: "text"
//     }).done(function (_data) {
//         $('#original_data').val(_data);
//     });
// };

var _change_tirgger_input = function () {
    var _selector = $(this).data("trigger-selector");
    $(_selector).change();
};

// -----------------------
// function get_session_id () {
//     var $session_id_as_filename = true;
//     $.ajax({
//         type: "post",
//         url: "/get_fileName",
//         data: { session_id_as_filename: $session_id_as_filename },
//         dataType: 'json',              // let's set the expected response format
//         success: function (response) {
//             var myObj = JSON.parse(response); // is this?
//             var myName = response.name; // or this ?
//             sessionStorage.setItem('XMLfileName', JSON.stringify(myName)); // set the file name in user's browsers
//             return myName ;
//         },
//         error: function (jqXHR, textStatus, errorThrown) {
//             console.warn(jqXHR.responseText);
//             alert(errorThrown);
            
//             return false;
//         } // error
//     }); // end of ajax

//     return false;
// };

$(function () {
    $('.menu .item').tab();
    var _panel = $(".file-process-framework");
    //_panel.find(".input-mode.textarea").click(_load_textarea).keyup(_load_textarea);

    _panel.find(".download-file").click(_download_file_button);
    _panel.find(".change-trigger").change(_combine_input);
    _panel.find(".change-trigger-draw").change(_draw_result_table);
    _panel.find(".key-up-trigger").keyup(_combine_input);

    _panel.find(".focus_select").focus(function () {
        $(this).select();
    });

    _panel.find(".file-change-trigger").change(_load_file);
    _panel.find(".google-spreadsheet-trigger")
        .change(_load_google_spreadsheet)
    //.change();
    _panel.find(".change-trigger-input").change(_change_tirgger_input);

    //$('.menu .item').tab();

    // var fileName = "";
    // if (sessionStorage.getItem("change_probability_filename") != null) {
    //     fileName = JSON.parse(sessionStorage.getItem('change_probability_filename'));
    // } // if
    // else {
    //     fileName = get_session_id(); 
    //     // fileName = "Factory_model_new_solution";
    // } // else

    // now we load from text area and not from file path
    // _load_data_from_filepath("#input_data", "./" + fileName + ".xml", _combine_input);

    // _load_data_from_filepath("#input_data", "./data.xml", _combine_input);

    // var $condition1 = JSON.parse(sessionStorage.getItem('factoryy'));
    // var $condition1 = JSON.parse(sessionStorage.getItem('questionn'));
    var $condition1 = "F1"; // test
    var $condition2 = ""; // test
    $.ajax({                 // for test
        url: "/GetCSV",
        method: 'POST',
        data: { condition1: $condition1, condition2: $condition2 },
        dataType: "json",
        error: function (request) {
            // remember to filter out size 0 array
            console.log(request);
        },
        success: function (response) {
            // console.log(response.data); // test
            $("#input_data").val(response.data);
            $("#change_data").val(response.data);
            $("#input_data").trigger("change");
            if (sessionStorage.getItem("changed_xml") == null) 
            {
                var data = $("#input_data").val();
                // console.log(data); // test
                sessionStorage.setItem('changed_xml', JSON.stringify(data));
                console.log('copy success');
            }
            else
            {
                console.log('already exist');
            }
        }
    });
    /*
    $('#copy_source_code').click(function () {
        PULI_UTIL.clipboard.copy($("#preview").val());
    });

    $('#copy_source_code_html').click(function () {
        PULI_UTIL.clipboard.copy($("#preview_html_source").val());
    });
    */
    /*
    $( ".sortable" ).sortable({
        beforeStop: function () {
            _draw_result_table();
        }
    });
    $( ".sortable" ).disableSelection();
    */
});


