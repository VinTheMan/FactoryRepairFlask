from flask import Flask
from flask import request
from flask import redirect
from flask import url_for
from flask import render_template
from flask import session
from flask import flash
from flask import jsonify
import json
import os
import time
import datetime
import traceback
import sys
import logging
import pandas as pd
import xml.etree.ElementTree

from werkzeug.exceptions import HTTPException

from pymongo import MongoClient

# to connect DB
from NiFi_mongo_settings import mongo_repair_setting, mongo_user_setting

# update DB
#from FactoryRepair_update_DB import func_load_mongo_settings

# authenate member data
from FactoryRepair_authentication import func_Check_MemberData

# global variables
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

def func_load_mongo_settings():
    global mongo_db_repair 
    global g_mongo_DailyRepairConfig_collection, g_mongo_Repair_Config_collection, g_mongo_DailyRepairMember_collection
    global g_test
    # connect to Server and open DB
    #mongo_db_repair = mongo_repair_setting()
    #mongo_db_user = mongo_user_setting()
    mongo_db_client = MongoClient(host='mongodb', port=27017, username='root', password='root', authSource='admin')
    mongo_db_repair = mongo_db_client['admin']

    # get 'DailyRepairContent' collection
    g_mongo_DailyRepairConfig_collection = mongo_db_repair['DailyRepairContent']
    g_test = mongo_db_repair['Test']
    # get 'Repair_Config' collection
    g_mongo_Repair_Config_collection = mongo_db_repair['Repair_Config']

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



app=Flask(
    __name__,
    static_folder="static",
    static_url_path="/"
)

# for flash & for gunicorn
#app.secret_key = '12345'
app.secret_key = os.urandom(24)

# for flash 
#SECRET_KEY = '12345'

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=1234, debug=False)

@app.route("/GetXML",methods=['POST']) # get fake data
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

@app.route("/gen_csv_and_xml",methods=['POST'])
def question():
    qquestion = request.form.get('qquestion')
    result = "銅露" # test
    # result = SOME_PYTHON_FUNCTION(qquestion)
    return jsonify(question=result, filename="Factory_model_new_solution" ),200

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

@app.route("/upload")
def upload():
    global g_date
    global g_factory
    global g_project
    global g_isn
    global g_solution

    # g_solution = request.args.get("finial_solution","")
    # if g_solution != "None":
    #     g_solved = 1

    print("------ upload -----")
    print(g_date)
    print(g_factory)
    print(g_project)
    print(g_isn)
    print("finial_solution : ", g_solution)
    print("------ ---- -----")
    # render_template("upload_3.html", Date=g_date, Project=g_project, Factory=g_factory, ISN=g_isn, Solution=g_solution)
    return render_template("upload_3.html", Date=g_date, Project=g_project, Factory=g_factory, ISN=g_isn, Solution=g_solution)
    # return render_template("IT_result.html", Date=g_date, Project=g_project, Factory=g_factory, ISN=g_isn, Solution=g_solution)

@app.route("/test")
def test():
    name = request.args.get('name')
    return 'My name is {}'.format(name)
    
@app.route("/GetCSV",methods=['POST'])
def func_Get_CSV_From_MongoDocument():
    func_load_mongo_settings()
    query_condition1 = request.args.get('condition1')
    query_condition2 = request.args.get('condition2')
    if query_condition1 == None or query_condition1 == "":
        query_condition1 = "F1"
    if query_condition2 == None or query_condition2 == "":
        query_condition2 = "Cisco"
    result = g_test.find({"ErrorName":query_condition2})
    # result = g_test.find()
    Action_list = []
    for doc in result:
        dict = doc["Solution"]
        if doc['Factory'] == query_condition1:
            dict[query_condition1] = 1
        else:
            dict[query_condition1] = 0
        Action_list.append(dict)
    df = pd.DataFrame(Action_list)
    df = df.fillna(0)
    cols = df.columns.tolist()
    cols.insert(0,cols.pop(cols.index(query_condition1)))
    cols.insert(len(cols)-1,cols.pop(cols.index("Solved")))
    df_final=df[cols]
    df_final= df_final.sort_values(by=cols[1:], ascending=True)
    df_final['All'] = df_final['Solved']
    df_final['solution_count'] =  df_final.groupby(cols)["All"].transform('count')
    df_final['All_Count'] =  df_final.groupby(cols[:-2])["All"].transform('count')
    df_final.to_csv("Result.csv", index=False)
    #
    RowsCount = len(df_final.index)
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
    mask1 = df_final[query_condition1] == 0
    mask2 = df_final[query_condition1] == 1
    First_Layer_P0_Count = len(df_final[(mask1)])
    First_Layer_P1_Count = RowsCount-First_Layer_P0_Count
    P0 = First_Layer_P0_Count/RowsCount
    P1 = 1-P0
    First_Layer_Body += str(P0) + ' ' + str(P1) + '\n'
    First_Layer_Body += '</TABLE></DEFINITION>\n'
    xml_str+=First_Layer_Body
    Second_Layer_Body = ""
    #Second Layer
    
    for field2 in Second_Layer_list:
        Second_Layer_Body +='<DEFINITION><FOR>' + field2 + '</FOR>\n'
        Second_Layer_Body +='<GIVEN>' + query_condition1 + '</GIVEN>'
        Second_Layer_Body +='<TABLE>\n'
        mask3 = df_final[field2] == 0
        if len(df_final[(mask1 & mask3)]) >0:
            P00= len(df_final[(mask1 & mask3)])/ len(df_final[(mask1)])
        else:
            P00 = 0
        if len(df_final[(mask2 & mask3)]) >0:
            P10= len(df_final[(mask2 & mask3)])/ len(df_final[(mask2)])
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
    for index, row in df_final.iterrows():
        P000 = row['solution_count'] / row['All_Count']
        Third_Layer_Body +=str(P000) + ' ' + str(1-P000) + '\n'
    Third_Layer_Body +='</TABLE></DEFINITION>'
    #for row in df_final.rows:
    xml_str+=Third_Layer_Body
    #
    xml_str+=End
    f = open('output.xml', 'w')
    f.write(xml_str)
    f.close()
    #
    #return json.dumps({key_field:g_mongo_DailyRepairConfig_collection.distinct(key_field)}),550
    return jsonify(data=xml_str),200

@app.route("/Getkey",methods=['POST'])
def func_Get_Distinct_Of_Key_MongoDocument():
    key_field = request.form.get('key_field')
    
    # return jsonify(message=key_field),420
    if key_field == None or key_field == "":
        key_field = 'Date'
    result = g_test.distinct(key_field)
    return jsonify(message=result),200

@app.route("/FactoryRepair")
def show():
    global g_date
    global g_factory
    global g_project
    global g_isn
    global g_solution
    global g_solved
    
    # g_date = request.args.get("d","")
    # g_date = datetime.datetime.today().strftime("%Y-%m-%d")
    # g_project = request.args.get("p","")
    # g_factory = request.args.get("f","")
    # g_isn = request.args.get("i","")
    # g_solution = request.args.get("s","")
    # g_solution = request.args.get("finial_solution","")
    # if g_solution != None:
    #     g_solved = 1

    print("------ FactoryRepair -----")
    print(g_date)
    print(g_factory)
    print(g_project)
    print(g_isn)
    print("finial_solution : ", g_solution)
    print(g_solved)
    print("------ ---- -----")

    #global mongo_db_repair 
    func_load_mongo_settings()
    #g_mongo_DailyRepairConfig_collection = mongo_db_repair['DailyRepairContent']

    global g_mongo_DailyRepairConfig_collection
    global g_mongo_Repair_Config_collection  

    # connect to Server 
    func_load_mongo_settings()

    # get the current solution list & dict from DB 
    func_Get_RepairSolution(g_mongo_Repair_Config_collection)

    # check if the new solution exists in currently DB solution; if the solution is new, update the heading list/dict 
    if g_solution not in g_solution_heading_list:
        if g_solution != "None":
            print("[New Solution]:proceeding new solution...")
            func_Update_DailyRepair_Solution(g_solution, g_mongo_DailyRepairConfig_collection, g_mongo_Repair_Config_collection)
            func_Get_RepairSolution(g_mongo_Repair_Config_collection)
        
    #print(g_solution_heading_dict)
    #print(g_solution_heading_list)

    # initialize the solution dict for new sample 
    length_of_solution = len(g_solution_heading_dict)

    for count in range(length_of_solution):
        key = g_solution_heading_list[count]
        g_solution_heading_dict[key] = 0

    if g_solution != "None":
        g_solution_heading_dict[g_solution] = 1

    g_new_sample = {"Date":g_date, "Project":g_project, "Factory":g_factory, "Data":[{"ISN":g_isn, "Solution":g_solution_heading_dict,"Solved":g_solved}]}
    
    print(g_new_sample)         

    # update new sample into DB           
    func_Update_DailyRepair_MongoDocument(g_mongo_DailyRepairConfig_collection, g_new_sample, g_date, g_factory, g_project)     
    '''

    global g_mongo_DailyRepairConfig_collection
    
    #g_new_sample = {"Date":g_date, "Project":g_project, "Factory":g_factory, "Data":[{"ISN":g_isn, "Solution":g_solution,"Solved":g_solved}]}
    
    if g_mongo_DailyRepairConfig_collection != None:
        func_Update_DailyRepair_MongoDocument(g_mongo_DailyRepairConfig_collection, g_new_sample)
'''
    # return render_template("IT_result.html", Date=g_date, Project=g_project, Factory=g_factory, ISN=g_isn, Solution=g_solution)
    return redirect(url_for('entry'))

@app.route("/Result")
def result():
    global g_date
    global g_factory
    global g_project
    global g_isn
    global g_solution
    return render_template("upload_2.html", Date=g_date, Project=g_project, Factory=g_factory, ISN=g_isn, Solution=g_solution)

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


