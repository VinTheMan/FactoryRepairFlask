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

    # connect to Server and open DB
    #mongo_db_repair = mongo_repair_setting()
    #mongo_db_user = mongo_user_setting()
    mongo_db_client = MongoClient(host='mongodb', port=27017, username='root', password='root', authSource='admin')
    mongo_db_repair = mongo_db_client['CooperExposure']

    # get 'DailyRepairContent' collection
    g_mongo_DailyRepairConfig_collection = mongo_db_repair['DailyRepairContent']

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

@app.route("/GetXML",methods=['POST'])
def func_Get_XML_And_Return_String():
    e = xml.etree.ElementTree.parse("Factory_model_new_solution.xml").getroot()
    #return json.dumps({key_field:g_mongo_DailyRepairConfig_collection.distinct(key_field)}),550
    str='<BIF VERSION="0.3">\n<NETWORK>\n<NAME>New Network</NAME>\n<VARIABLE TYPE="nature">\n<NAME>Factory2</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<VARIABLE TYPE="nature">\n<NAME>FixPosition</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<VARIABLE TYPE="nature">\n<NAME>B0B1</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<VARIABLE TYPE="nature">\n<NAME>Route</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<VARIABLE TYPE="nature">\n<NAME>M0M1</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<VARIABLE TYPE="nature">\n<NAME>New1</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<VARIABLE TYPE="nature">\n<NAME>Solved\n</NAME>\n<OUTCOME>No</OUTCOME>\n<OUTCOME>Yes</OUTCOME>\n</VARIABLE>\n<DEFINITION>\n<FOR>Factory2</FOR>\n<TABLE>\n0.48717948717949 0.51282051282051\n</TABLE>\n</DEFINITION>\n<DEFINITION>\n<FOR>FixPosition</FOR>\n<GIVEN>Factory2</GIVEN>\n<TABLE>\n0.47368421052632 0.52631578947368\n0.9 0.1\n</TABLE>\n</DEFINITION>\n<DEFINITION>\n<FOR>B0B1</FOR>\n<GIVEN>Factory2</GIVEN>\n<TABLE>\n0.71052631578947 0.28947368421053\n0.675 0.325\n</TABLE>\n</DEFINITION>\n<DEFINITION>\n<FOR>Route</FOR>\n<GIVEN>Factory2</GIVEN>\n<TABLE>\n0.78947368421053 0.21052631578947\n0.76666666666667 0.23333333333333\n</TABLE>\n</DEFINITION>\n<DEFINITION>\n<FOR>M0M1</FOR>\n<GIVEN>Factory2</GIVEN>\n<TABLE>\n0.82894736842105 0.17105263157895\n0.8125 0.1875\n</TABLE>\n</DEFINITION>\n<DEFINITION>\n<FOR>New1</FOR>\n<GIVEN>Factory2</GIVEN>\n<TABLE>\n0.83157894736842 0.16842105263158\n0.85 0.15\n</TABLE>\n</DEFINITION>\n<DEFINITION>\n<FOR>Solved\n</FOR>\n<GIVEN>FixPosition</GIVEN>\n<GIVEN>B0B1</GIVEN>\n<GIVEN>Route</GIVEN>\n<GIVEN>M0M1</GIVEN>\n<GIVEN>New1</GIVEN>\n<TABLE>\n1 0\n0 1\n0 1\n0 0\n0 1\n0 0\n0 0\n0 0\n0 1\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 1\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n0 0\n</TABLE>\n</DEFINITION>\n</NETWORK>\n</BIF>'
    return str

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
    
    print("finial_solution : ", g_solution)
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
    

@app.route("/Getkey",methods=['POST'])
def func_Get_Distinct_Of_Key_MongoDocument():
    key_field = request.form.get('key_field')
    
    # return jsonify(message=key_field),420
    if key_field == None or key_field == "":
        key_field = 'Date'
    result = g_mongo_DailyRepairConfig_collection.distinct(key_field)
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
    #func_load_mongo_settings()
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

    if g_authentication == True:
        return jsonify(message='Success !'),200
    else:
        # flash('Authenticate Fail!!')
        func_Get_Distinct_Of_Key_MongoDocument()
        return jsonify(message='login Failed w/ user: Jonathan !'),420

    # if (g_username == "Jonathan") and (g_passwd == "123"):
    #     try:
    #         return jsonify(message='success!'),200
    #     except Exception as e:
    #         abort_msg(e)
    # else:
    #     return jsonify(message='login Failed w/ user: Jonathan !'),420


