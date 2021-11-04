#-*-  coding: UTF-8 -*-


import xlsxwriter
import xlrd
import argparse
import datetime
import pandas as pd
import sys, os, re, configparser,  copy, pprint,  traceback
import logging
sys.path.append(os.path.dirname(os.path.realpath(__file__)) + '/..')

from NiFi_mongo_settings import mongo_repair_setting, mongo_user_setting
from collections import defaultdict
from dateutil.parser import parse
app = Flask(__name__)

# Global variables
g_config = None
g_solution_heading_list = []
g_solution_heading_dict = {}
#mongo_db_repair = None


'''
def func_load_mongo_settings():
    global mongo_db_repair   
    # connect to Server and open DB
    mongo_db_repair = mongo_repair_setting()

    mongo_db_user = mongo_user_setting()
'''

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

def func_Delete_DailyRepair_Solution(del_solution, mongo_DailyRepairConfig_collection, mongo_Repair_Config_collection): 
    # 1st step: del solution of Repair_Config collection
    for DocContent in mongo_Repair_Config_collection.find():
        if del_solution in DocContent['Solution']:
            del DocContent['Solution'][del_solution]
            mongo_Repair_Config_collection.replace_one({'_id': DocContent['_id']},DocContent)
        
    # 2nd step: del solution into all collections in "DailyRepairContent"        
    for DocContent in mongo_DailyRepairConfig_collection.find(): 
        #print(DocContent)
        len_of_data = len(DocContent['Data'])

        for count in range(len_of_data):
            if del_solution in DocContent['Data'][count]['Solution']:
                del DocContent['Data'][count]['Solution'][del_solution]
                mongo_DailyRepairConfig_collection.replace_one({'_id': DocContent['_id']},DocContent)
           
    return        

def func_Get_RepairSolution(mongo_Repair_Config_collection):
    global g_solution_heading_dict
    global g_solution_heading_list
    
    for g_DocContent in mongo_Repair_Config_collection.find():
    	#print(g_DocContent['Solution'])
    	g_solution_heading_dict = g_DocContent['Solution']
    	g_solution_heading_list = list(g_DocContent['Solution'].keys())


def func_Check_MemberData(mongo_DailyRepairMember_collection, username, passwd):
    Authentication = False
    
    for DocContent in mongo_DailyRepairMember_collection.find():
        #print(DocContent)
        if DocContent['Name'] == username and DocContent['Passwd'] == passwd:
            print("[Authentication] Pass!!")
            Authentication = True
          
    return Authentication
    


# python FactoryRepair_update_DB.py --project SmartDebug --date 2021-08-08 --factory F1 --isn 123 --solution FixPosition --username Jonathan --passwd 123

def func_parse_args():
    parser = argparse.ArgumentParser()
#    group = parser.add_mutually_exclusive_group(required=True)
    parser.add_argument("--project",  help="Select which project of daily report should be generated. Ex: --project \"SmartDebug\"",  type=str, required=True)
    parser.add_argument("--date",  help="Ex: --date \"2021-07-17\"",  type=str, required=True)
    parser.add_argument("--factory",  help="Ex: --factory \"F1\" or \"F2\"",  type=str, required=True)
    parser.add_argument("--isn",  help="Ex: --isn \"123\"",  type=str, required=True)
    parser.add_argument("--solution",  help="Ex: --solution \"B0-B1\" or \"FixPosition\" or \"M0-M1\" or \"Route\" or \"None\" or \"new name\"",  type=str, required=True)
    parser.add_argument("--mail",  help="Define the auto send mail option. 0:No send, 1: morning, 2: afternoon",  type=int)
    parser.add_argument("--username",  help="Ex: --name \"Jonathan\"",  type=str, required=True)
    parser.add_argument("--passwd",  help="Ex: --passwd \"123\"",  type=str, required=True)
   
    return parser.parse_args()


def main():
    global g_config
    global g_project, g_date, g_factory, g_factory, g_solved, g_name, g_passwd
    
    args = func_parse_args()

    if args.project:
        g_project = args.project

    if args.date:
        g_date = args.date

    if args.factory:
        g_factory = args.factory

    if args.isn:
        g_isn = args.isn

    if args.solution:
        g_solution = args.solution

    if g_solution == "None":
        g_solved = 0
    else:
        g_solved = 1

    # check name/passwd 
    if args.username:
        g_username = args.username

    if args.passwd:
        g_passwd = args.passwd
        
    # connect to Server 
    func_load_mongo_settings()

    # get 'DailyRepairContent' collection
    g_mongo_DailyRepairConfig_collection = mongo_db_repair['DailyRepairContent']

    # get 'Repair_Config' collection
    g_mongo_Repair_Config_collection = mongo_db_repair['Repair_Config']

    # get 'DailyRepairMember' collection
    if args.username:
        g_mongo_DailyRepairMember_collection = mongo_db_repair['DailyRepairMember']

    #for DocContent in g_mongo_DailyRepairMember_collection.find():
    #    print(DocContent)

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
    #func_Update_DailyRepair_MongoDocument(g_mongo_DailyRepairConfig_collection, g_new_sample, g_date, g_factory, g_project)   

    # Delete non-necessary field
    # Usage: uncomment the below and change the value of "g_del_solution"
    #g_del_solution = "None"
    #func_Delete_DailyRepair_Solution(g_del_solution, g_mongo_DailyRepairConfig_collection, g_mongo_Repair_Config_collection)

    # check member  name;passwd correct or not
    g_authentication = func_Check_MemberData(g_mongo_DailyRepairMember_collection, g_username, g_passwd)
    #print(g_authentication)

if __name__ == '__main__':
    app.debug = True
    app.run()
   
