var DEBUG = {
    enable_bayes: true
};

var tablename = ""; //click which
var copy_c = ""; //input data

var _draw_result_table = function (_xml_text) {
    var _container = $("#preview_html");


    if ($("#preview_html_wrapper").hasClass("wrapper")) {
        _container.css({
            "width": "auto",
            "height": "auto"
        });
        $("#preview_html_wrapper").removeClass("wrapper");
        setTimeout(function () {
            _draw_result_table(_xml_text);
        }, 0);
        return;
    }



    var _xml = $($.parseXML(_xml_text));
    //console.log(_xml.find('VARIABLE[TYPE="nature"]').length);


    // ----------------------------------------
    var _given = {};
    var _lines_cpt = {};

    var _bayes_nodes = {};
    _parse_xml_definition(_xml, _given, _lines_cpt);


    //console.log(_cpt);

    // ------------------------------------

    var _outcome_click_handler = function () {
        var _d_li = $(this);
        _outcome_set_handler(_d_li, _bayes_nodes);
        _display_bayesnet_prob_dis();
    };

    var _outcome = {};
    var _open_cpt_window = function () {
        var _name = $(this).parents('[node_id]:first').attr("node_id");
        var _c = _lines_cpt[_name];
        var _g = _given[_name];
        var _o = _outcome[_name];
        var _r = _cpt_rows[_name];
        _draw_cpt_window(_name, _c, _g, _o, _r);
    };

    var _variables = [];
    _parse_xml_vairable(_xml, _variables, _outcome);
    _resize_container(_variables.length);

    // -----------------------

    _draw_node_div(_variables
        , _open_cpt_window
        , _given
        , _outcome
        , _outcome_click_handler);
    _draw_node_list(_variables
        , _open_cpt_window
        , _given
        , _outcome
        , _outcome_click_handler);

    // --------------------------
    // 重整cpt表格
    var _object_cpt = {};
    var _cpt_rows = {};
    if (DEBUG.enable_bayes === true) {
        var _reorganize_cpt = function (_config, _pi) {
            //var _parents = _given[_name];
            if (_config.p.length === 0) {
                return _config.c[0];
            }
            else if (_pi === _config.p.length) {
                var _c = _config.c[_config.l];
                _config.l++;
                //console.log(_config.pg);
                //console.log(_c);
                _cpt_rows[_config.n].push({
                    parents_outcome: JSON.parse(JSON.stringify(_config.pg)),
                    prob: _c
                });
                return _c;
            }
            else {
                var _c = [];
                var _parent_name = _config.p[_pi];
                var _parent_outcome = _outcome[_parent_name];
                //console.log(_pi);
                //_config.pi++;
                for (var _p = 0; _p < _parent_outcome.length; _p++) {
                    _config.pg[_parent_name] = _parent_outcome[_p];
                    _c.push(_reorganize_cpt(_config, (_pi + 1)));
                    //var _parent_outcome_list = _outcome[_parent_name];
                }
                while (_c.length === 1) {
                    _c = _c[0];
                }
                return _c;
            }
        };

        for (var _name in _lines_cpt) {
            var _config = {
                n: _name,
                c: _lines_cpt[_name],
                l: 0,
                p: _given[_name],
                pg: {}
            };
            _cpt_rows[_name] = [];
            //console.log(_config);
            _object_cpt[_name] = _reorganize_cpt(_config, 0);
        }
        /*
         var _reorganize_cpt = function (_c, _parents_list, _p_index) {
             var _parent_name = _parents_list[_p_index];
             
         };
        
         for (var _name in _cpt) {
             if (_cpt[_name].length === 1) {
                 _cpt[_name] = _cpt[_name][0];
             }
             else {
                 var _parents_list = _given[_name];
                 //var _new_parents_list = [];
                 _cpt[_name] = _reorganize_cpt(_cpt[_name], _parents_list, 0);
             }
         }
         */
        //console.log(_cpt);
        //console.log(_cpt_rows);
    }

    // -----------------------
    // 設定貝氏網路\
    if (DEBUG.enable_bayes === true) {
        for (var _v = 0; _v < _variables.length; _v++) {
            var _name = _variables[_v];
            var _bn = new Bayes.Node(_name, _outcome[_name]);
            _bn.cpt = _object_cpt[_name];
            _bayes_nodes[_name] = _bn;
            //Bayes.nodes.push(_bn);
        }
    }


    // 設定parent
    if (DEBUG.enable_bayes === true) {
        for (var _name in _given) {
            var _parents = _given[_name];
            for (var _i = 0; _i < _parents.length; _i++) {
                var _parent_name = _parents[_i];
                _bayes_nodes[_name].parents.push(_bayes_nodes[_parent_name]);
            }
        }

        for (var _name in _bayes_nodes) {
            Bayes.nodes.push(_bayes_nodes[_name]);
        }
    }

    var _display_bayesnet_prob_dis = function () {
        if (DEBUG.enable_bayes === true) {
            Bayes.sample(10000);
        }
        for (var _name in _bayes_nodes) {
            var _probs = _display_prob_dis(_bayes_nodes[_name].sampledLw);
            for (var _i = 0; _i < _probs.length; _i++) {
                var _p = _probs[_i];
                _container.find('div[node_id="' + _name + '"] li[value_index="' + _i + '"] .prob').text(_p);
                $('.bayesnet-table tr[node_id="' + _name + '"] li[value_index="' + _i + '"] .prob').text(_p);
            }
        }

        $('#isDone').click();
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
    };

    // ----------------------------------

    div_graph("#preview_html"); // call to div_graph.js
    _display_bayesnet_prob_dis();

    //setTimeout(function () {
    // $('#preview_html').remove(); // test
    // $('#preview_html_wrapper').append('<div id="preview_html" class="ui segment" style="width: 600px; height: 600px; border-width: 0px;"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="600" height="600" class="div_graph-svg"><path fill="none" stroke="#000000" d="M260.5,514.5C365.5,514.5,365.5,536.5,469.5,536.5M464.5,531.5L469.5,536.5L464.5,541.5"></path><path fill="none" stroke="#000000" d="M436.5,243.5C436.5,389.75,453.5,536.5,469.5,536.5M464.5,531.5L469.5,536.5L464.5,541.5"></path><path fill="none" stroke="#000000" d="M527.5,128.5C527.5,312.5,529.5,312.5,529.5,496.5M524.5,491.5L529.5,496.5L534.5,491.5"></path><path fill="none" stroke="#000000" d="M143.5,424.5C306.5,424.5,306.5,536.5,469.5,536.5M464.5,531.5L469.5,536.5L464.5,541.5"></path><path fill="none" stroke="#000000" d="M352.5,321.5C411.5,321.5,411.5,536.5,469.5,536.5M464.5,531.5L469.5,536.5L464.5,541.5"></path><path fill="none" stroke="#000000" d="M184.5,74.5C194.5,74.5,201.5,274.25,201.5,474.5M196.5,469.5L201.5,474.5L206.5,469.5"></path><path fill="none" stroke="#000000" d="M184.5,74.5C281.5,74.5,281.5,204.5,377.5,204.5M372.5,199.5L377.5,204.5L372.5,209.5"></path><path fill="none" stroke="#000000" d="M184.5,74.5C326.5,74.5,326.5,89.5,467.5,89.5M462.5,84.5L467.5,89.5L462.5,94.5"></path><path fill="none" stroke="#000000" d="M125.5,113.5C125.5,249.5,84.5,249.5,84.5,384.5M79.5,379.5L84.5,384.5L89.5,379.5"></path><path fill="none" stroke="#000000" d="M184.5,74.5C209.5,74.5,209.5,321.5,233.5,321.5M228.5,316.5L233.5,321.5L228.5,326.5"></path><desc>Created with Raphaël</desc><defs></defs><rect x="65.5" y="34.5" width="119" height="79" r="0" rx="0" ry="0" fill="#ffffff" stroke="#000" stroke-width="1" fill-opacity="0.6" style="stroke-width: 1; fill-opacity: 0.6; cursor: move;" class="div_graph-rect"></rect><rect x="467.5" y="49.5" width="119" height="79" r="0" rx="0" ry="0" fill="#ffffff" stroke="#000" stroke-width="1" fill-opacity="0.6" style="stroke-width: 1; fill-opacity: 0.6; cursor: move;" class="div_graph-rect"></rect><rect x="469.5" y="496.5" width="119" height="79" r="0" rx="0" ry="0" fill="#ffffff" stroke="#000" stroke-width="1" fill-opacity="0.6" style="stroke-width: 1; fill-opacity: 0.6; cursor: move;" class="div_graph-rect"></rect><rect x="24.5" y="384.5" width="119" height="79" r="0" rx="0" ry="0" fill="#ffffff" stroke="#000" stroke-width="1" fill-opacity="0.6" style="stroke-width: 1; fill-opacity: 0.6; cursor: move;" class="div_graph-rect"></rect><rect x="141.5" y="474.5" width="119" height="79" r="0" rx="0" ry="0" fill="#ffffff" stroke="#000" stroke-width="1" fill-opacity="0.6" style="stroke-width: 1; fill-opacity: 0.6; cursor: move;" class="div_graph-rect"></rect><rect x="233.5" y="281.5" width="119" height="79" r="0" rx="0" ry="0" fill="#ffffff" stroke="#000" stroke-width="1" fill-opacity="0.6" style="stroke-width: 1; fill-opacity: 0.6; cursor: move;" class="div_graph-rect"></rect><rect x="377.5" y="164.5" width="118" height="79" r="0" rx="0" ry="0" fill="#ffffff" stroke="#000" stroke-width="1" fill-opacity="0.6" style="stroke-width: 1; fill-opacity: 0.6; cursor: move;" class="div_graph-rect"></rect></svg><div class="div_graph-node-wrapper appned-to-svg" style="top: 35px; left: 66px;"><div node_id="Factory2" class="div_graph-node"><button type="button" class="ui icon teal mini button" title="點擊檢視條件機率表(CPT)"><i class="table icon"></i></button><span class="attr-name">Factory2</span><span class="setted-evidence"></span><ul><li outcome="No" value_index="0" class=""><label><input type="radio" disabled> No: <span class="prob">49.05</span>%</label></li><li outcome="Yes" value_index="1"><label><input type="radio" disabled> Yes: <span class="prob">50.95</span>%</label></li></ul></div></div><div class="div_graph-node-wrapper appned-to-svg" style="top: 282px; left: 234px;"><div node_id="FixPosition" parent_nodes="[&quot;Factory2&quot;]" class="div_graph-node"><button type="button" class="ui icon teal mini button" title="點擊檢視條件機率表(CPT)"><i class="table icon"></i></button><span class="attr-name">FixPosition</span><span class="setted-evidence"></span><ul><li outcome="No" value_index="0"><label><input type="radio" disabled> No: <span class="prob">68.89</span>%</label></li><li outcome="Yes" value_index="1"><label><input type="radio" disabled> Yes: <span class="prob">31.11</span>%</label></li></ul></div></div><div class="div_graph-node-wrapper appned-to-svg" style="top: 385px; left: 25px;"><div node_id="B0B1" parent_nodes="[&quot;Factory2&quot;]" class="div_graph-node"><button type="button" class="ui icon teal mini button" title="點擊檢視條件機率表(CPT)"><i class="table icon"></i></button><span class="attr-name">B0B1</span><span class="setted-evidence"></span><ul><li outcome="No" value_index="0"><label><input type="radio" disabled> No: <span class="prob">68.61</span>%</label></li><li outcome="Yes" value_index="1"><label><input type="radio" disabled> Yes: <span class="prob">31.39</span>%</label></li></ul></div></div><div class="div_graph-node-wrapper appned-to-svg" style="top: 50px; left: 468px;"><div node_id="Route" parent_nodes="[&quot;Factory2&quot;]" class="div_graph-node"><button type="button" class="ui icon teal mini button" title="點擊檢視條件機率表(CPT)"><i class="table icon"></i></button><span class="attr-name">Route</span><span class="setted-evidence"></span><ul><li outcome="No" value_index="0"><label><input type="radio" disabled> No: <span class="prob">92.91</span>%</label></li><li outcome="Yes" value_index="1"><label><input type="radio" disabled> Yes: <span class="prob">7.09</span>%</label></li></ul></div></div><div class="div_graph-node-wrapper appned-to-svg" style="top: 165px; left: 378px;"><div node_id="M0M1" parent_nodes="[&quot;Factory2&quot;]" class="div_graph-node"><button type="button" class="ui icon teal mini button" title="點擊檢視條件機率表(CPT)"><i class="table icon"></i></button><span class="attr-name">M0M1</span><span class="setted-evidence"></span><ul><li outcome="No" value_index="0"><label><input type="radio" disabled> No: <span class="prob">92.63</span>%</label></li><li outcome="Yes" value_index="1"><label><input type="radio" disabled> Yes: <span class="prob">7.37</span>%</label></li></ul></div></div><div class="div_graph-node-wrapper appned-to-svg" style="top: 475px; left: 142px;"><div node_id="New1" parent_nodes="[&quot;Factory2&quot;]" class="div_graph-node"><button type="button" class="ui icon teal mini button" title="點擊檢視條件機率表(CPT)"><i class="table icon"></i></button><span class="attr-name">New1</span><span class="setted-evidence"></span><ul><li outcome="No" value_index="0"><label><input type="radio" disabled> No: <span class="prob">90.38</span>%</label></li><li outcome="Yes" value_index="1"><label><input type="radio" disabled> Yes: <span class="prob">9.62</span>%</label></li></ul></div></div><div class="div_graph-node-wrapper appned-to-svg" style="top: 497px; left: 470px;"><div node_id="Solved" parent_nodes="[&quot;FixPosition&quot;,&quot;B0B1&quot;,&quot;Route&quot;,&quot;M0M1&quot;,&quot;New1&quot;]" class="div_graph-node"><button type="button" class="ui icon teal mini button" title="點擊檢視條件機率表(CPT)"><i class="table icon"></i></button><span class="attr-name">Solved</span><span class="setted-evidence"></span><ul><li outcome="No" value_index="0"><label><input type="radio" disabled> No: <span class="prob">42.82</span>%</label></li><li outcome="Yes" value_index="1"><label><input type="radio" disabled> Yes: <span class="prob">57.18</span>%</label></li></ul></div></div></div>'); //test
    // console.log('?????'); // test

    $("#preview_html_wrapper").addClass("wrapper");
    //}, 0);
    //$("body").dragScroller();
    //console.log(Bayes);



};

var _display_prob_dis = function (_ary) {
    //console.log(_ary);
    var _sum = _ary.reduce(function (a, b) { return a + b; }, 0);
    var _ary2 = [];
    for (var _i = 0; _i < _ary.length; _i++) {
        var _p = _ary[_i] / _sum;
        _p = Math.round(_p * 10000) / 100;
        if (isNaN(_p)) {
            console.log("NaN");
        }
        _ary2.push(_p);
    }
    return _ary2;
};

var _draw_cpt_window = function (_name, _c, _name_given, _name_outcome, _name_cpt_row) {
    tablename = _name;
    copy_c = _c;
    $("#exampleModalLabel").empty();
    $("#modalbody").empty();


    /*myModal.addEventListener('shown.bs.modal', function () {
    myInput.focus()
    })*/
    /*var _win = window.open("", _name + "_cpt"
        , "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes");
    */
    var _title = '「' + _name + '」條件機率表(CPT)';

    /*if ($(_win.document.body).find("div:first").length > 0) {
        return;
    }

    $(_win.document.head).append('<title>' + _title + '</title>');
    $(_win.document.head).append('<link rel="stylesheet" href="style.css" />');
    $(_win.document.head).append('<script></script>');*/
    $('<h3>' + _title + '</h3>').appendTo('#exampleModalLabel');
    //var _container = $('<div class="cpt-container" style="display:inline-block;text-align:center;margin:auto;"></div>').appendTo($(_win.document.body));
    //$('<h1 style="white-space:nowrap;">' + _title + '</h1>').appendTo(_container);
    var _table = $('<table align="center" border="1" cellspacing="0" cellpadding="5">'
        + '<thead><tr class="attr-name"></tr><tr class="domain"></tr></thead>'
        + '<tbody></tbody>'
        + '</table>').appendTo('#modalbody');
    //_win.document.body.innerHTML = "HTML";


    // -------------------------------

    var _thead_attr = _table.find("thead > tr.attr-name");
    if (_name_given.length > 0) {
        for (var _g = 0; _g < _name_given.length; _g++) {
            $('<th align="center" rowspan="2" valign="bottom">' + _name_given[_g] + '</th>').appendTo(_thead_attr);
        }

    }

    // --------------------------------

    $('<th align="center" colspan="' + _name_outcome.length + '">' + _name + '</th>').appendTo(_thead_attr);
    var _thead = _table.find("thead > tr.domain");
    $('<th align="center">' + _name_outcome.join('</th><th align="center">') + '</th>').appendTo(_thead);

    // -------------------------------

    var _tbody = _table.find("tbody");
    if (sessionStorage.getItem("change_probability_filename") === null) {

        document.querySelector("#save-button").style.display = 'none';
        for (var _i = 0; _i < _c.length; _i++) {
            var _tr = $('<tr></tr>').appendTo(_tbody);

            // 在之前要先加入parents_outcome
            for (var _g = 0; _g < _name_given.length; _g++) {
                var _parent_name = _name_given[_g];
                var _parent_outcome = _name_cpt_row[_i]['parents_outcome'][_parent_name];
                $('<th align="left">' + _parent_outcome + '</th>').appendTo(_tr);
            }

            for (var _j = 0; _j < _c[_i].length; _j++) {
                var _p = _c[_i][_j];
                _p = Math.round(_p * 10000) / 10000;
                var pname = _name + _i + _j;
                $('<td align="left">' + '<span>' + _p + '</span>' + '</td>').appendTo(_tr);
                $("#" + _name + _i + _j).change(function () {
                    var $focused = $(':focus').val();
                    var focusid = document.activeElement.id;
                    focusid = focusid.split(_name);
                    focusid = (focusid + '').split('');
                    var a = focusid[1];
                    var b = focusid[2];
                    if (b == 0) b = 1;
                    else if (b == 1) b = 0;
                    $focused = parseFloat($focused).toFixed(4);
                    val = (1 - $focused).toFixed(4);
                    $('#' + _name + a + b).val(val);
                    for (var _i = 0; _i < _c.length; _i++) {
                        for (var _j = 0; _j < _c[_i].length; _j++) {
                            //console.log($("#" + _name + _i + _j ).val());
                        }
                    }

                });

                //var test =  $('#p'+_name+_i+_j).val();
                //$('<td align="left">' + _p + '</td>').appendTo(_tr);

            }

        }

    }
    else {
        document.querySelector("#save-button").style.display = 'block';
        for (var _i = 0; _i < _c.length; _i++) {
            var _tr = $('<tr></tr>').appendTo(_tbody);

            // 在之前要先加入parents_outcome
            for (var _g = 0; _g < _name_given.length; _g++) {
                var _parent_name = _name_given[_g];
                var _parent_outcome = _name_cpt_row[_i]['parents_outcome'][_parent_name];
                $('<th align="left">' + _parent_outcome + '</th>').appendTo(_tr);
            }

            for (var _j = 0; _j < _c[_i].length; _j++) {
                var _p = _c[_i][_j];
                _p = Math.round(_p * 10000) / 10000;
                var pname = _name + _i + _j;
                $('<td align="left">' + '<input class = "testinput" style = "width:70px" type="number" name = "' + pname + '" id = "' + pname + '" step="0.0001" ' +
                    'min="0" max="1"' + 'value=' + _p + '>' + '</td>').appendTo(_tr);
                $("#" + _name + _i + _j).change(function () {
                    var $focused = $(':focus').val();
                    var focusid = document.activeElement.id;
                    focusid = focusid.split(_name);
                    focusid = (focusid + '').split('');
                    var a = focusid[1];
                    var b = focusid[2];
                    if (b == 0) b = 1;
                    else if (b == 1) b = 0;
                    $focused = parseFloat($focused).toFixed(4);
                    val = (1 - $focused).toFixed(4);
                    $('#' + _name + a + b).val(val);
                    for (var _i = 0; _i < _c.length; _i++) {
                        for (var _j = 0; _j < _c[_i].length; _j++) {
                            //console.log($("#" + _name + _i + _j ).val());
                        }
                    }

                });

                //var test =  $('#p'+_name+_i+_j).val();
                //$('<td align="left">' + _p + '</td>').appendTo(_tr);

            }

        }
    }

    //$("#testbody").contents().find("#pB0B100").val();
    //var test =  document.getElementById("divParent").innerHTML = $('#pB0B100').val();
    //var test = $("#testbody").contents().find("#pB0B100").val(); 
    //var test =  $('#p'+_name+_i+_j).val();
    //console.log(test);

    // -------------------------------


    _table.find('th').css('background-color', '#CCC');

    //console.log(test);

    /*setTimeout(function () {
        //console.log(_container.width());
        _win.resizeTo(_container.outerWidth() + 50, _container.outerHeight() + 100);
    }, 0);*/
};



var myFunction = function () {
    out = "";
    replace = "";
    for (var _i = 0; _i < copy_c.length; _i++) {
        for (var _j = 0; _j < copy_c[_i].length; _j++) {
            //console.log($("#" + tablename + _i + _j).val());
            //forarray[tablename][_i][_j] = ($("#" + tablename + _i + _j ).val());
            //replace string
            if(($("#" + tablename + _i + _j).val() > 1 || ($("#" + tablename + _i + _j).val()) < 0))
            {
                $("#" + tablename + _i + _j).css('border-color', 'red');
                $('#error').css('display','block');
                return false;
            }
            else
            {
                $('#error').css('display','none');
                $("#" + tablename + _i + _j).css('border-color', '');
                replace = replace + ($("#" + tablename + _i + _j).val()) + ' ';
            }
        }
        replace = replace + '\n';
    }

    //get input xml (string type)
    var test = JSON.parse(sessionStorage.getItem("changed_xml"));
    console.log(test) ; // test
    //get which table change
    tablename = '<FOR>' + tablename + '</FOR>';
    str = '<TABLE>';
    str1 = '</TABLE>';
    
    //find index
    index = test.search(tablename);
    indexbegin = test.indexOf(str, index);
    indexend = test.indexOf(str1, index);

    //replaced string
    for (let i = indexbegin + 8; i < indexend - 2; i++) {
        out = out + test[i];
    }

    
    //replace by change input
    test = test.replace(out, replace);
    
    //sessionStorage.setItem('changed_xml', test);
    sessionStorage.setItem('changed_xml', JSON.stringify(test)); // test

    reDrawGraph("copy");
    //send to php 
    /*$.ajax({
        type: "post",
        url: "download.php",
        data: { test: test , filename : get_session_id() + "_copy"},
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
    */
    //close modal 
    $('#exampleModal').modal('hide');

};

var _parse_xml_definition = function (_xml, _given, _lines_cpt) {
    _xml.find("DEFINITION").each(function (_i, _ele) {
        _ele = $(_ele);

        var _for = _ele.find("FOR:first").text();
        var _g = [];
        _ele.find("GIVEN").each(function (_j, _ele_given) {
            _g.push($(_ele_given).text());
        });
        _given[_for] = _g;

        var _table = _ele.find("TABLE:first").text();
        var _cpt_table = [];
        var _lines = _table.trim().split("\n");
        for (var _l = 0; _l < _lines.length; _l++) {
            var _field = _lines[_l].trim().split(" ");
            var _cpt_row = [];
            for (var _f = 0; _f < _field.length; _f++) {
                _cpt_row.push(eval(_field[_f]));

            }
            _cpt_table.push(_cpt_row);

        }
        _lines_cpt[_for] = _cpt_table;
    });
};

var _parse_xml_vairable = function (_xml, _variables, _outcome) {

    var _variables_ele = _xml.find('VARIABLE[TYPE="nature"]');

    _variables_ele.each(function (_i, _ele) {
        _ele = $(_ele);
        var _name = _ele.find('NAME:first');
        if (_name.length === 0) {
            _name = _ele.find('name:first');
        }
        _name = _name.text();
        _variables.push(_name);

        // -------------------------
        var _o = [];
        _ele.find("OUTCOME").each(function (_j, _ele_given) {
            var _text = $(_ele_given).text();
            _text = _text.split("'\\'").join('');
            _text = _text.split("\\''").join('');
            _o.push(_text);
        });
        _outcome[_name] = _o;
    });
};

var _resize_container = function (_var_length) {
    var _square = Math.ceil(Math.sqrt(_var_length));
    var _container = $("#preview_html");
    var _node_width_unit = 200;
    if (_square > 2) {
        //_node_width_unit = 300;
    } // if
    _container.css({
        //"border": "1px solid red",
        "width": (_node_width_unit * _square) + "px",     // change the grah box here
        "height": (_node_width_unit * _square) + "px",    // change the grah box here
        "border-width": 0
    });

    $("#preview_html_wrapper").css({
        //"border": "1px solid red",
        "width": (_node_width_unit * _square) + "px",     // change the grah box here
        "height": (_node_width_unit * _square) + "px",    // change the grah box here
        "border-width": 0
    });

    if (_container.outerWidth() < (_node_width_unit * _square)) {
        //_container.css("width", (_node_width_unit * _square) + "px");
    }
};

var _draw_node_div = function (_variables, _open_cpt_window, _given, _outcome, _outcome_click_handler) {
    var _container = $("#preview_html");
    for (var _v = 0; _v < _variables.length; _v++) {
        var _name = _variables[_v];

        // --------------------------------------------
        var _div = $('<div node_id="' + _name + '">'
            + '<button type="button" class="ui icon teal mini button" data-bs-toggle="modal" data-bs-target="#exampleModal" title="點擊檢視條件機率表(CPT)"><i class="table icon"></i></button>'
            + '<span class="attr-name">' + _name + '</span><span class="setted-evidence"></span>'
            + '</div>');
        _div.appendTo(_container);

        _div.find("button:first").click(_open_cpt_window);

        if (_given[_name].length > 0) {
            _div.attr("parent_nodes", JSON.stringify(_given[_name]));
        }

        //_div.css("background-color", 'yellow');

        var _domain_ul = $('<ul></ul>').appendTo(_div);
        for (var _o = 0; _o < _outcome[_name].length; _o++) {
            var _d = _outcome[_name][_o];
            var _d_li = $('<li outcome="' + _d + '">'
                + '<label>'
                + '<input type="checkbox" /> ' + _d + ': <span class="prob">100.00</span>%'
                + '</label></li>')
                .appendTo(_domain_ul);
            _d_li.attr("value_index", _o).click(_outcome_click_handler);
            //_d_li
        }
        //_domain_ul.find("li");
    };
};

var _draw_node_list = function (_variables, _open_cpt_window, _given, _outcome, _outcome_click_handler) {
    var _container = $(".bayesnet-table > table > tbody").empty();
    for (var _v = 0; _v < _variables.length; _v++) {
        var _name = _variables[_v];
        var _tr = $('<tr node_id="' + _name + '"></tr>').appendTo(_container);

        if (_given[_name].length > 0) {
            _tr.attr("parent_nodes", JSON.stringify(_given[_name]));
        }

        // --------------------------------------------
        var _div = $('<td>'

            + '<div class="attr-name">' + _name + '</div><span class="setted-evidence"></span>'
            + '</td>');
        _div.attr('id', 'node_list_' + escape(_name));
        _div.appendTo(_tr);

        // ------------------------------
        var _cpt = $('<td>'
            + '<button type="button" class="ui icon teal mini button" data-bs-toggle="modal" data-bs-target="#exampleModal" title="點擊檢視條件機率表(CPT)"><i class="table icon"></i></button>'
            + '</td>').appendTo(_tr);

        _cpt.find("button:first").click(_open_cpt_window);

        // --------------

        var _domain_td = $('<td><ul></ul></td>').appendTo(_tr);
        var _domain_ul = _domain_td.find("ul");
        for (var _o = 0; _o < _outcome[_name].length; _o++) {
            var _d = _outcome[_name][_o];
            var _d_li = $('<li outcome="' + _d + '">'
                + '<label>'
                + '<input type="checkbox" /> ' + _d + ': <span class="prob">100.00</span>%'
                + '</label></li>')
                .appendTo(_domain_ul);
            _d_li.attr("value_index", _o).click(_outcome_click_handler);
            //_d_li
        }

        // -------------------------

        $('<td><i class="long arrow left icon"></i></td>').appendTo(_tr);

        // -------------------------

        var _parent_td = $('<td class="parent-ndoes"></td>').appendTo(_tr);
        for (var _g = 0; _g < _given[_name].length; _g++) {
            var _parent_name = _given[_name][_g];
            var _button = $('<a href="#node_list_' + escape(_parent_name) + '">'
                + '<button type="button" class="ui button teal tiny">' + _parent_name + '</button>'
                + '</a>')
                .appendTo(_parent_td);
        }
    };
};


var _outcome_set_handler = function (_d_li, _bayes_nodes) {

    // 先確定他的名稱啦
    var _div = _d_li.parents("[node_id]:first");
    var _name = _div.attr("node_id");
    console.log('checkbox triggered'); // test
    var _value_index = parseInt(_d_li.attr("value_index"), 10);
    var _outcome = _d_li.attr("outcome");
    var _checked = _d_li.find("input").prop("checked");

    // -----------------------------
    // 把所有人的click都移除掉
    var _container = $("#preview_html");
    var _table = $(".bayesnet-table > table > tbody");

    _container.find('[node_id="' + _name + '"] ul li input:checked').prop("checked", false);
    _table.find('[node_id="' + _name + '"] ul li input:checked').prop("checked", false);

    _container.find('[node_id="' + _name + '"].set').removeClass("set");
    _table.find('[node_id="' + _name + '"].set').removeClass("set");

    _container.find('[node_id="' + _name + '"] .set').removeClass("set");
    _table.find('[node_id="' + _name + '"] .set').removeClass("set");

    // -----------------------------
    // 根據情況決定要不要勾選

    if (_checked === true) {
        _container.find('[node_id="' + _name + '"] ul li[value_index="' + _value_index + '"] input').prop("checked", true);
        _table.find('[node_id="' + _name + '"] ul li[value_index="' + _value_index + '"] input').prop("checked", true);

        _container.find('[node_id="' + _name + '"] ul li[value_index="' + _value_index + '"]').addClass("set");
        _table.find('[node_id="' + _name + '"] ul li[value_index="' + _value_index + '"]').addClass("set");

        _container.find('[node_id="' + _name + '"] .setted-evidence').text("= " + _outcome);
        _table.find('[node_id="' + _name + '"] .setted-evidence').text("= " + _outcome);

        _container.find('[node_id="' + _name + '"]').addClass("set");
        _table.find('[node_id="' + _name + '"]').addClass("set");

        _bayes_nodes[_name].value = _value_index;
        _bayes_nodes[_name].isObserved = true;
    }
    else {
        _container.find('[node_id="' + _name + '"] .setted-evidence').empty();
        _table.find('[node_id="' + _name + '"] .setted-evidence').empty();

        _bayes_nodes[_name].isObserved = false;
    }

    /*
    _d_li.addClass("current");
    var _ul = _d_li.parent();
    var _setted_evi = _div.find(".setted-evidence");
    
    // 先把其他人的checked都移除掉
    _ul.find('li:not(.current) :checked').prop('checked', false);
    _ul.find(".set").removeClass("set");
    //_d_li.find("input").attr("checked", "checked");
    _d_li.removeClass("current");

    // ------------------------------------------
    //console.trace(_name);
    if (_d_li.find("input").prop("checked") === true) {
        _d_li.addClass("set");
        _bayes_nodes[_name].value = _value_index;
        _bayes_nodes[_name].isObserved = true;
        _setted_evi.text("=" + _d_li.attr("outcome"));
        _div.addClass("set");
    }
    else {
        _bayes_nodes[_name].isObserved = false;
        _setted_evi.empty();
        _div.removeClass("set");
    }
    */
};

// ---------------------------------
$(function () {
    $(".cancel-evidences-button").click(_cancel_evidences);

});

var _cancel_evidences = function () {
    $(".bayesnet-table li label input:checked").click();
};