from flask import Flask
from flask import request
from flask import redirect
from flask import url_for
from flask import render_template, make_response
from flask import session
from flask import flash
from flask import jsonify
from flask import send_from_directory
import json
import os
import time
import datetime
import traceback
import sys
import logging
import pandas as pd
import xml.etree.ElementTree
import base64
import math

from werkzeug.exceptions import HTTPException
from werkzeug.utils import secure_filename

from pymongo import MongoClient
from pymongo import errors

# to connect DB
from NiFi_mongo_settings import mongo_repair_setting, mongo_user_setting

# update DB
#from FactoryRepair_update_DB import func_load_mongo_settings

# authenate member data
from FactoryRepair_authentication import func_Check_MemberData

# global variables
UPLOAD_FOLDER = os.path.join('static', 'download')
ALLOWED_EXTENSIONS = set(['pdf', 'mp4']) #限制上傳文件格式

mongo_db_repair = None

g_config = None
g_solution_heading_list = []
g_solution_heading_dict = {}

g_mongo_DailyRepairConfig_collection = None
g_mongo_DailyRepairMember_collection = None
g_mongo_Repair_Config_collection = None

g_authentication = None

g_date = None
g_project = None
g_factory = None
g_isn = None
g_solution = None
g_solved = None

logging.basicConfig(level=logging.DEBUG)
def Convert(a):
    it = iter(a)
    res_dct = dict(zip(it, it))
    return res_dct

def func_load_mongo_settings():
    global g_config_collection
    global mongo_db_repair 
    global g_mongo_DailyRepairConfig_collection, g_mongo_Repair_Config_collection, g_mongo_DailyRepairMember_collection
    global g_test

    mongo_db_client = MongoClient(host='mongodb', port=27017, username='root', password='root', authSource='admin')
    mongo_db_repair = mongo_db_client['admin']

    # get 'DailyRepairContent' collection
    g_mongo_DailyRepairConfig_collection = mongo_db_repair['DailyRepairContent']
    
    g_test = mongo_db_repair['Test']
    # get 'Repair_Config' collection
    g_mongo_Repair_Config_collection = mongo_db_repair['Repair_Config']
    g_config_collection = mongo_db_repair['Config']

    # get 'DailyRepairMember' collection
    g_mongo_DailyRepairMember_collection = mongo_db_repair['DailyRepairMember']

    # get the current solution list & dict from DB 
    func_Get_RepairSolution(g_mongo_Repair_Config_collection)

def func_Update_DailyRepair_MongoDocument(mongo_DailyRepairConfig_collection, new_sample, date, factory, project):
    myquery_d = {"Date": date}
    myquery_f = {"Date": date, "Factory": factory}
    myquery_p = {"Date": date, "Factory": factory, "Project": project}

    count_d = mongo_DailyRepairConfig_collection.count_documents(myquery_d)
   
    count_f = mongo_DailyRepairConfig_collection.count_documents(myquery_f)

    count_p = mongo_DailyRepairConfig_collection.count_documents(myquery_p)
    
    #print(new_sample['Data'][0])
    if count_d == 0 or count_f == 0 or count_p == 0:
        mongo_DailyRepairConfig_collection.insert_one(new_sample)
        return

    if count_p > 0:
        mongo_DailyRepairConfig_document = mongo_DailyRepairConfig_collection.find_one(myquery_p)
        #print(mongo_DailyRepairConfig_document['Data'])
        mongo_DailyRepairConfig_document['Data'].append(new_sample['Data'][0])
        #print(mongo_DailyRepairConfig_document['Data'])
        mongo_DailyRepairConfig_collection.replace_one({'_id': mongo_DailyRepairConfig_document['_id']},mongo_DailyRepairConfig_document)
        return


def func_Update_DailyRepair_Solution(new_solution, mongo_DailyRepairConfig_collection, mongo_Repair_Config_collection):
    # 1st step: add solution into Repair_Config collection
    for DocContent in mongo_Repair_Config_collection.find():
        DocContent['Solution'][new_solution]=1
        mongo_Repair_Config_collection.replace_one({'_id': DocContent['_id']},DocContent)

    # 2nd step: add solution into all collections in "DailyRepairContent" 
    for DocContent in mongo_DailyRepairConfig_collection.find(): 
        #print(DocContent)
        len_of_data = len(DocContent['Data'])

        for count in range(len_of_data):
            DocContent['Data'][count]['Solution'][new_solution]=0
            mongo_DailyRepairConfig_collection.replace_one({'_id': DocContent['_id']},DocContent)



def func_Get_RepairSolution(mongo_Repair_Config_collection):
    global g_solution_heading_dict
    global g_solution_heading_list
    
    for g_DocContent in mongo_Repair_Config_collection.find():
    	#print(g_DocContent['Solution'])
    	g_solution_heading_dict = g_DocContent['Solution']
    	g_solution_heading_list = list(g_DocContent['Solution'].keys())

def allowed_file(filename):
    if '.' in filename and filename.rsplit('.', 1)[1].lower() == "pdf":
        return ".pdf"
    if '.' in filename and filename.rsplit('.', 1)[1].lower() == "mp4":
        return ".mp4"

app=Flask(
    __name__,
    static_folder="static",
    static_url_path="/"
)

# for flash & for gunicorn
#app.secret_key = '12345'
app.secret_key = os.urandom(24)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# for flash 
#SECRET_KEY = '12345'

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=1234, debug=False)

@app.route("/GetXML",methods=['POST']) # test get fake data
def func_Get_XML_And_Return_String():
    #return json.dumps({key_field:g_mongo_DailyRepairConfig_collection.distinct(key_field)}),550
    str='<BIF VERSION="0.3">\n<NETWORK>\n<NAME>New Network</NAME>\n<VARIABLE TYPE="nature">\n<NAME>Factory2</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<VARIABLE TYPE="nature">\n<NAME>FixPosition</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<VARIABLE TYPE="nature">\n<NAME>B0B1</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<VARIABLE TYPE="nature">\n<NAME>Route</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<VARIABLE TYPE="nature">\n<NAME>M0M1</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<VARIABLE TYPE="nature">\n<NAME>New1</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<VARIABLE TYPE="nature">\n<NAME>Solved\n</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<DEFINITION>\n<FOR>Factory2</FOR>\n<TABLE>\n0.48717948717949 0.51282051282051\n</TABLE>\n</DEFINITION>\n<DEFINITION>\n<FOR>FixPosition</FOR>\n<GIVEN>Factory2</GIVEN>\n<TABLE>\n0.47368421052632 0.52631578947368\n0.9 0.1\n</TABLE>\n</DEFINITION>\n<DEFINITION>\n<FOR>B0B1</FOR>\n<GIVEN>Factory2</GIVEN>\n<TABLE>\n0.71052631578947 0.28947368421053\n0.675 0.325\n</TABLE>\n</DEFINITION>\n<DEFINITION>\n<FOR>Route</FOR>\n<GIVEN>Factory2</GIVEN>\n<TABLE>\n0.78947368421053 0.21052631578947\n0.76666666666667 0.23333333333333\n</TABLE>\n</DEFINITION>\n<DEFINITION>\n<FOR>M0M1</FOR>\n<GIVEN>Factory2</GIVEN>\n<TABLE>\n0.82894736842105 0.17105263157895\n0.8125 0.1875\n</TABLE>\n</DEFINITION>\n<DEFINITION>\n<FOR>New1</FOR>\n<GIVEN>Factory2</GIVEN>\n<TABLE>\n0.83157894736842 0.16842105263158\n0.85 0.15\n</TABLE>\n</DEFINITION>\n<DEFINITION>\n<FOR>Solved\n</FOR>\n<GIVEN>FixPosition</GIVEN>\n<GIVEN>B0B1</GIVEN>\n<GIVEN>Route</GIVEN>\n<GIVEN>M0M1</GIVEN>\n<GIVEN>New1</GIVEN>\n<TABLE>\n1 0\n0 1\n0 1\n0 0\n0 1\n0 0\n0 0\n0 0\n0 1\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 1\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n</TABLE>\n</DEFINITION>\n</NETWORK>\n</BIF>'
    return jsonify(data=str),200

@app.route("/")
def login():
    func_load_mongo_settings()
    return render_template("login_2.html")

@app.route("/entry")
def entry():
    global g_date
    global g_factory
    global g_project
    global g_isn
    g_date = datetime.datetime.today().strftime("%Y-%m-%d")
    g_factory = request.args.get('f')
    g_project = request.args.get('p')
    g_isn = request.args.get('i')
    print("------ entry -----")
    print(g_date)
    print(g_factory)
    print(g_project)
    print(g_isn)
    print("------ ---- -----")
    # return render_template("question_2.html")
    

    if g_factory != None:
        render_template("login_2.html")
        return redirect(url_for('main'))
        # return redirect(url_for('question'))
    else:
        return render_template("entry_2.html")

@app.route("/question",methods=['GET'])
def question_get():
    return render_template("question_2.html")   

@app.route("/main")
def main():
    global g_solution
    global g_solved

    # g_solution = request.args.get("finial_solution","")
    
    # if g_solution != None:
    #     g_solved = 1
    
    # print("finial_solution : ", g_solution)
    return render_template("index.html")  

@app.route("/InsertRecord",methods=['POST'])
def func_Insert_Record_MongoDocument():
    func_load_mongo_settings()
    result = request.get_json()
    Solution = {}
    for Action in result['Actions']:
        Solution[Action] = 1
    Solution['Solved'] = result['Solved']
    doc = {"Date":datetime.datetime.today().strftime("%Y-%m-%d"), "Factory":result['Factory'],"ErrorName":result['ErrorName'],"Solution": Solution}
    g_test.insert(doc)
    return jsonify(message="Insert"),200

@app.route("/RetrunXML", methods=['POST'])
def func_Return_XML_From_MongoDocument():
    func_load_mongo_settings()
    query_condition1 = request.form.get('condition1')
    query_condition2 = request.form.get('condition2')

    if query_condition1 == None or query_condition1 == "":
        query_condition1 = "F1"
    if query_condition2 == None or query_condition2 == "":
        query_condition2 = "AC"    
    try:
        result_config = g_config_collection.find_one({"ErrorName":query_condition2})
    except errors.ConnectionFailure as e:
        return jsonify(message = e),420
    f_Combinations = open('Combinations.txt', 'w')
    if result_config == None :
        f_Combinations.write('ResultOfConfig = None')
        f_Combinations.close()
        return jsonify(message = "ErrorName Not Found") ,420
    result_record = g_test.find({"ErrorName":query_condition2})
    Action_list = []
    tmp_dict = {}
    if result_record.count() == 0 or result_record == None :
        f_Combinations.write('ResultOfRecord = None')
        tmp_dict[query_condition1] = 0
        tmp_dict["Solved"] = 0
        for Action in result_config.get("Actions", []):
            tmp_dict[Action] = 0
        Action_list.append(tmp_dict)
    else:
        for doc in result_record:
            dict = doc["Solution"]
            if doc['Factory'] == query_condition1:
                dict[query_condition1] = 1
            else:
                dict[query_condition1] = 0
            Action_list.append(dict)
    ###
    df = pd.DataFrame(Action_list)
    df = df.fillna(0)
    cols = df.columns.tolist()
    cols.insert(0,cols.pop(cols.index(query_condition1)))
    cols.insert(len(cols)-1,cols.pop(cols.index("Solved")))
    df.to_csv("QueryResult.csv")
    config_list = result_config.get("Actions", [])
    filter_col = set(cols) ^ set(config_list)
    ###
    filter_str = ""
    f_Combinations.write('filter_str = \n')
    for remove_col in filter_col:
        if remove_col != query_condition1 and remove_col != 'Solved':
            filter_str+= "| `" + remove_col + "` > 0"

    filter_str = filter_str.replace("|", "", 1)
    f_Combinations.write(filter_str)
    f_Combinations.write('\n')
    f_Combinations.write('done =============================== \n')
    if filter_str != "":
        if len(df.query(filter_str)) > 0:
            df.drop(df.query(filter_str).index, inplace=True)
    for remove_col in filter_col:
        if remove_col != query_condition1 and remove_col != 'Solved':    
            df = df.drop(remove_col , axis=1)
    cols = df.columns.tolist()
    cols.insert(0,cols.pop(cols.index(query_condition1)))
    cols.insert(len(cols)-1,cols.pop(cols.index("Solved")))
    df.to_csv("FilterQueryResult.csv")
    # build second layer 真值表
    NumberofAction = len(cols)-2
    f_Combinations.write('NumberofAction = ')
    f_Combinations.write(str(NumberofAction))
    f_Combinations.write('\n')
    Combinations = 2**(NumberofAction)
    f_Combinations.write('NumberofCombinations = ')
    f_Combinations.write(str(Combinations))
    f_Combinations.write('\n')
    tmp = []
    length_str = '{:0' + str(NumberofAction) + 'b}'
    f_Combinations.write('Start Combinations\n')
    Combinations_list = []
    Zero_list = []
    for i in range(Combinations):
        b = length_str.format(i)
        f_Combinations.write(str(b))
        f_Combinations.write('\n')
        tmp.append(b)
    for record in tmp:
        find_condition_tmp = ""
        for index, ch in enumerate(record):
            if ch == '0':
                find_condition_tmp+= "& `" + cols[index+1] + "` == 0"
            else:
                find_condition_tmp+= "& `" + cols[index+1] + "` > 0"
        find_condition_tmp = find_condition_tmp.replace("&", "", 1)
        Combinations_list.append(find_condition_tmp)
        f_Combinations.write(find_condition_tmp)
        f_Combinations.write('\n')
    f_Combinations.write('Start finding\n')
    for One_condition in Combinations_list:
        if len(df.query(One_condition)) == 0:
            f_Combinations.write(One_condition)
            f_Combinations.write('\n')
            One_condition = One_condition.replace(" == 0", ",0").replace(" > 0", ",1").replace("`", "").replace("&", ",").replace(" ", "")
            f_Combinations.write(One_condition)
            f_Combinations.write('\n')
            temp_dict = Convert(One_condition.split(','))
            temp_dict['Solved'] = 0
            Zero_list.append(temp_dict)
    df_zero = pd.DataFrame(Zero_list)
    df.to_csv("df.csv")
    df_zero.to_csv("df_zero.csv")
    df_FF = pd.concat([df,df_zero],axis=0)
    df_FF = df_FF.reset_index(drop=True)
    df_FF = df_FF[cols]
    df_FF = df_FF.drop([query_condition1], axis=1)
    df_FF.to_csv("df_FF.csv")
    FF_cols = df_FF.columns.tolist()
    df_FF = df_FF[FF_cols].fillna(0).apply(pd.to_numeric)
    #df_FF = df_FF.to_numeric(downcast='float')
    df_FF.sort_values(by=FF_cols[0:1], inplace=True)
    df_FF.to_csv("df_FF.csv")
    #
    #df_final=df[cols]
    df_final=df_FF[FF_cols]
    df_final= df_final.sort_values(by=FF_cols[1:], ascending=True)
    df_final.to_csv("Result.csv", index=False)
    #
    RowsCount = len(df.index)
    xml_str = ""
    Header = '<BIF VERSION="0.3">\n<NETWORK>\n<NAME>New Network</NAME>\n'
    End = '</NETWORK>\n</BIF>'
    xml_str+=Header
    for field in cols:
        Field_Body ='<VARIABLE TYPE="nature"><NAME>' + field + '</NAME><OUTCOME>No</OUTCOME> <OUTCOME>Yes</OUTCOME></VARIABLE>\n'
        xml_str+=Field_Body
    First_Layer_list =cols[0]
    Second_Layer_list =cols[1:-1]
    Third_Layer_list =cols[-1]
    #First Layer 
    First_Layer_Body = '<DEFINITION><FOR>' + query_condition1 + '</FOR><TABLE>\n'
    mask1 = df[query_condition1] == 0
    mask2 = df[query_condition1] == 1
    First_Layer_P0_Count = len(df[(mask1)])
    First_Layer_P1_Count = RowsCount-First_Layer_P0_Count
    P0 = First_Layer_P0_Count/RowsCount
    P1 = 1-P0
    # test record not exist
    if result_record.count() == 0 or result_record == None:
        P0 = 0
        P1 = 0
    First_Layer_Body += str(P0) + ' ' + str(P1) + '\n'
    First_Layer_Body += '</TABLE></DEFINITION>\n'
    xml_str+=First_Layer_Body
    Second_Layer_Body = ""
    #Second Layer    
    for field2 in Second_Layer_list:
        Second_Layer_Body +='<DEFINITION><FOR>' + field2 + '</FOR>\n'
        Second_Layer_Body +='<GIVEN>' + query_condition1 + '</GIVEN>'
        Second_Layer_Body +='<TABLE>\n'
        mask3 = df[field2] == 0
        if len(df[(mask1 & mask3)]) >0:
            P00= len(df[(mask1 & mask3)])/ len(df[(mask1)])
        else:
            P00 = 0
        if len(df[(mask2 & mask3)]) >0:
            P10= len(df[(mask2 & mask3)])/ len(df[(mask2)])
        else:
            P10 = 0
        Second_Layer_Body +=str(P00) + ' ' +str(1-P00) + '\n'
        Second_Layer_Body+=str(P10) + ' ' +str(1-P10) + '\n'
        Second_Layer_Body +='</TABLE></DEFINITION>'
    xml_str+=Second_Layer_Body
    #Third Layer
    Third_Layer_Body = ""
    Third_Layer_Body +='<DEFINITION><FOR>' + str(cols[-1]) + '</FOR>\n'
    for field2 in Second_Layer_list:
        Third_Layer_Body +='<GIVEN>' + field2 + '</GIVEN>\n'
    Third_Layer_Body +='<TABLE>\n'
    for One_condition in Combinations_list:
        df_Condition = df_final.query(One_condition)
        df_Solved = df_Condition[df_final['Solved'] == 1]
        f_Combinations.write(One_condition)
        f_Combinations.write('\n')
        f_Combinations.write("Len of df_Condition = ")
        f_Combinations.write(str(len(df_Condition)))
        f_Combinations.write('\n')
        f_Combinations.write("Len of df_Solved = ")
        f_Combinations.write(str(len(df_Solved)))
        f_Combinations.write('\n')
        if len(df_Solved) > 0:
            P001 = len(df_Solved) / len(df_Condition)
            Third_Layer_Body +=str(1-P001) + ' ' + str(P001) + '\n'
        else:
            Third_Layer_Body +=str(0) + ' ' + str(0) + '\n'
    Third_Layer_Body +='</TABLE></DEFINITION>'
    #for row in df_final.rows:
    xml_str+=Third_Layer_Body
    #
    xml_str+=End
    f = open('output.xml', 'w')
    f.write(xml_str)
    f.close()
    f_Combinations.close()
    #
    return jsonify(data=xml_str),200

@app.route("/GetErrorName", methods=['POST'])
def func_Get_Distinct_Of_ErrorName_MongoDocument():
    # Return except e or "ErrorName Not Found" or ErrorName_list
    func_load_mongo_settings()
    ErrorName_list = []
    try:
        # result = g_test.distinct('ErrorName')
        result = g_config_collection.distinct('ErrorName')
    except errors.ConnectionFailure as e:
        return jsonify(message = e),420
    if result == None:
        return jsonify(message = "ErrorName Not Found"),420
    for tmp in result:
        ErrorName_list.append(tmp)

    return jsonify(message = ErrorName_list) ,200

@app.route("/Getkey",methods=['POST'])
def func_Get_Distinct_Of_Key_MongoDocument():
    key_field = request.get_json(force=True)
    # array_obj = json.loads(key_field) # testt
    # return jsonify(message=key_field),420 # test
    # if key_field == None or key_field == "":
    #     key_field = 'Date'
    # result = g_test.distinct(key_field)
    
    # print("--------------//------------ 4 ", file=sys.stderr) # test
    # print(key_field, file=sys.stderr) # test
    return jsonify(message="hi"),200

@app.route("/Result")
def result():
    global g_date
    global g_factory
    global g_project
    global g_isn
    global g_solution
    return render_template("upload_2.html", Date=g_date, Project=g_project, Factory=g_factory, ISN=g_isn, Solution=g_solution)

@app.route("/create_question")
def questioncreatpage():
    return render_template("questionCreate.html")


@app.route("/RepairMember", methods=['POST'])
def member():
    g_username = request.form.get("username","")
    g_passwd = request.form.get("passwd","")
    g_factory = request.form.get('f')
    # check member data in DB
    #global mongo_db_repair 
    
    #g_mongo_DailyRepairMember_collection = mongo_db_repair['DailyRepairMember']
    global g_mongo_DailyRepairConfig_collection
    global g_mongo_Repair_Config_collection
    global g_mongo_DailyRepairMember_collection
    global g_authentication

    # connect to Server 
    func_load_mongo_settings()
    
    if g_mongo_DailyRepairMember_collection != None:
        g_authentication = func_Check_MemberData(g_mongo_DailyRepairMember_collection, g_username, g_passwd)

    # if g_authentication == True:
    #     return jsonify(message='Success !'),200
    # else:
    #     # flash('Authenticate Fail!!')
    #     func_Get_Distinct_Of_Key_MongoDocument()
    #     return jsonify(message='login Failed w/ user: Jonathan !'),420

    if (g_username == "Jonathan") and (g_passwd == "123"):
        return jsonify(message='success!'),200

    else:
        return jsonify(message='login Failed w/ user: Jonathan !'),420

@app.route("/UpdateErrorNameAndActions", methods=['POST']) # 新增erro name時
def func_Update_ErrorName_And_Actions():
    # input ErrorName , Actions  <-- list
    # return except: e or "Success"
    func_load_mongo_settings()
    fa = request.form.get('Factory')
    inputt = request.form.get('Actions')
    actions = inputt.split(",")
    errorName = request.form.get('ErrorName')
    uploaded_files = request.files.getlist("files[]")
    i = 0
    # print(actions[i], file=sys.stderr) # test
    for file in uploaded_files:
        file_ext = allowed_file(file.filename)
        file_name = fa + "_" + errorName + "_" + actions[i] + file_ext
        try:
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], file_name))
        except errors.ConnectionFailure as e:
            return jsonify(message = e),420
        i = i + 1

    update_query={"ErrorName": errorName}
    document={"Actions":actions}
    try:
        g_config_collection.find_one_and_update(update_query, {"$set":document},  upsert=True)
    except errors.ConnectionFailure as e:
        return jsonify(message = e),420
    return jsonify(message = "Success"),200

@app.route("/AddAction" , methods=['POST']) #欲新增Action時
def func_Add_Action():
    # input ErrorName , Action
    # return except: e or "ErrorName Not Found" or "Success"
    # Base on ErrorName to Add one Action
    func_load_mongo_settings()
    result = request.get_json()
    update_query={"ErrorName": result['ErrorName']}
    try:
        # ErrorName_doc = g_config_collection.find_one(update_query)
        ErrorName_doc = g_test.find_one(update_query)
    except errors.ConnectionFailure as e:
        return jsonify(message = e) ,420
    if ErrorName_doc == None:
        return jsonify(message = "ErrorName Not Found") ,420
    AddAction = result['Action']
    Action_list = ErrorName_doc.get("Actions", [])
    if AddAction not in Action_list:
        Action_list.append(AddAction)
    document={"Actions":Action_list}
    #g_config_collection.find_one_and_update(update_query, {"$set":document},  upsert=True)
    try:
        result = g_config_collection.find_one_and_update(update_query, {"$set":document},  upsert=True)
    except errors.ConnectionFailure as e:
        return jsonify(message = e),420
    return jsonify(message = "Success"),200

@app.route("/GetErrorNameConfig", methods=['POST'])
def func_Get_ErrorName_Config():
    # input ErrorName
    # return except e or "ErrorName Not Found or doc
    func_load_mongo_settings()
    result = request.form.get('ErrorName')
    update_query={"ErrorName": result}
    try:
        ErrorName_doc = g_config_collection.find_one(update_query)
    except errors.ConnectionFailure as e:
        return jsonify(message = e),420
    if ErrorName_doc == None:
        return jsonify(message = "ErrorName Not Found"),420
    Action_list = ErrorName_doc.get("Actions", [])
    # doc = {"ErrorName": result['ErrorName'],"Actions":Action_list}
    doc = Action_list
    return jsonify(message = doc) ,200

@app.route("/DeleteAction", methods=['POST'])
def func_Delete_Action():
    # input ErrorName , Action
    # return except: e or "ErrorName Not Found" or "Success"
    # Base on ErrorName to delete one Action
    func_load_mongo_settings()
    result = request.get_json()
    update_query={"ErrorName": result['ErrorName']}
    #ErrorName_doc = g_config_collection.find_one(update_query)
    try:
        ErrorName_doc = g_config_collection.find_one(update_query)
        # ErrorName_doc = g_test.find_one(update_query)
    except errors.ConnectionFailure as e:
        return jsonify(message = e) ,420
    if ErrorName_doc == None:
        return jsonify(message = "ErrorName Not Found") ,420
    RemoveAction = result['Action']
    Action_list = ErrorName_doc.get("Actions", [])
    New_Action_list = []
    for Action in Action_list:
        if Action != RemoveAction:
            New_Action_list.append(Action)
    document={"Actions":New_Action_list}
    #g_config_collection.find_one_and_update(update_query, {"$set":document},  upsert=True)
    try:
        result = g_config_collection.find_one_and_update(update_query, {"$set":document},  upsert=True)
    except errors.ConnectionFailure as e:
        return jsonify(message = e) ,420
    return jsonify(message = "Success") ,200
