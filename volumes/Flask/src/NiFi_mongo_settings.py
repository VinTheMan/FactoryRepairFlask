#!/usr/bin/env python
import sys,json,logging,csv,datetime,re, configparser, time, os, traceback
from pymongo import MongoClient


def load_Repair_Config():
    # Load Repair_Config.ini
    config = configparser.ConfigParser()
    while(True):
        try:
#            config.read(os.path.dirname(os.path.realpath(__file__))+'/../conf/NiFi_Config.ini')
            config.read(os.path.dirname(os.path.realpath(__file__))+'/conf/Repair_Config.ini')
            break
        except:
            log_error_and_sleep('Load Repair_Config.ini error!')      
    print(os.path.dirname(os.path.realpath(__file__))+'/conf/Repair_Config.ini', flush=True)
    return config    

def log_error_and_sleep(message, sleep_sec = 1):
    now = datetime.datetime.now()
    string_today = now.strftime("%Y-%m-%d")
    logging_filename = os.path.dirname(os.path.realpath(__file__))+'/../log/mongo_connection-{0}.log'.format(string_today)
    logging.basicConfig(level=logging.ERROR, filename=logging_filename)
    string_now = now.strftime("%Y/%m/%d %H:%M:%S")
    error_message = message + " " +string_now + "\n" + traceback.format_exc()
    logging.error(error_message)
    time.sleep(sleep_sec)
    
    

def Repair_Config_setting():
    config = load_Repair_Config()

#    global DB_Name_Web
#    global DB_Name_Storage
    global DB_Name_Repair
#    DB_Name_Web = config.get('Basic_Settings', 'DB_Name_Web')
#    DB_Name_Storage = config.get('Basic_Settings', 'DB_Name_Storage')
    print(config, flush=True)
    DB_Name_Repair = config.get('Basic_Settings', 'DB_Name_Repair')
    Location = config.get('Basic_Settings', 'Location')

    NiFi_Config_Url_1 = config.get('Basic_Settings', 'NiFi_Config_Url_1')
    NiFi_Config_Url_2 = config.get('Basic_Settings', 'NiFi_Config_Url_2')
    try:
        NiFi_DB_Auth_User = config.get('Basic_Settings', 'DB_Auth_User')
        NiFi_DB_Auth_PWD = config.get('Basic_Settings', 'DB_Auth_Password')
    except:
        NiFi_DB_Auth_User = None
        NiFi_DB_Auth_PWD = None
    NiFi_Config_Client = MongoClient([NiFi_Config_Url_1,NiFi_Config_Url_2])
    print(NiFi_config_Client, flush=True)
#    NiFi_Config_DB = NiFi_Config_Client[DB_Name_Web]
    NiFi_Config_DB = NiFi_Config_Client[DB_Name_Repair]
    #if NiFi_DB_Auth_User is not None and NiFi_DB_Auth_PWD is not None:
    #    NiFi_Config_DB.authenticate(NiFi_DB_Auth_User, NiFi_DB_Auth_PWD, source=DB_Name_Web)
    
#    NiFi_Config_Collection = NiFi_Config_DB['NiFi_Config']
    NiFi_Config_Collection = NiFi_Config_DB['Repair_Config']
    
    while(True):
        try:
            NiFi_Config = NiFi_Config_Collection.find_one({"Location" : Location})
            if NiFi_Config != None:
                break
            else:
                log_error_and_sleep('NiFi_Config is None!')
        except:
            log_error_and_sleep('Find NiFi_Config on MongoDB error!')
    
    NiFi_Config_Client.close()
    return NiFi_Config    

def get_mongo_url_from_ini( Config_ini ):
    # return mongo urls as list
    try:
        urls = Config_ini.get( 'Basic_Settings', 'NiFi_Config_Urls' )
        return urls.split(',')
    except:
        NiFi_Config_Url_1 = config.get('Basic_Settings', 'NiFi_Config_Url_1')
        NiFi_Config_Url_2 = config.get('Basic_Settings', 'NiFi_Config_Url_2')
        return [ NiFi_Config_Url_1, NiFi_Config_Url_2 ]


def mongo_repair_setting():
    while(True):
        try:
            NiFi_Config = Repair_Config_setting()
            print(NiFi_Config, flush=True)
            mongo_url_web = NiFi_Config['Mongo_Url_Repair']
            try:
                NiFi_DB_Auth_User = NiFi_Config['DB_Auth_User']
                NiFi_DB_Auth_PWD = NiFi_Config['DB_Auth_Password']
                DB_Auth_Name = NiFi_Config['DB_Auth_Repair']
            except:
                NiFi_DB_Auth_User = None
                NiFi_DB_Auth_PWD = None
            print(mongo_url_web, flush=True)
            mongo_client_web = MongoClient(mongo_url_web)
#            mongo_db_web = mongo_client_web[DB_Name_Web]
            print(DB_Name_Repair, flush=True)
            mongo_db_web = mongo_client_web[DB_Name_Repair]
            print(mongo_db_web, flush=True)
            #if NiFi_DB_Auth_User is not None and NiFi_DB_Auth_PWD is not None:
            #    mongo_db_web.authenticate(NiFi_DB_Auth_User, NiFi_DB_Auth_PWD, source=DB_Auth_Name)
            mongo_web_handshake = mongo_db_web['Handshake']

            #status = mongo_web_handshake.stats
            #print("Status : ", status)
            
            Status_dict = mongo_web_handshake.find_one({"Status" : "OK"})
            if Status_dict['Status'] == 'OK':
                break
            else:
                log_error_and_sleep('Mongo_web handshake error!')
        except:
            log_error_and_sleep('Mongo_web handshake error!')
    
    mongo_client_web.close()
    return mongo_db_web


def mongo_user_setting():
    while(True):
        try:
#            config = load_NiFi_Config()
            config = load_Repair_Config()
            
            DB_Name_user = config.get('Basic_Settings', 'DB_Name_user')
            
            mongo_url = get_mongo_url_from_ini( config )
            try:
                NiFi_DB_Auth_User = config.get('Basic_Settings', 'DB_Auth_User')
                NiFi_DB_Auth_PWD = config.get('Basic_Settings', 'DB_Auth_Password')
            except:
                NiFi_DB_Auth_User = None
                NiFi_DB_Auth_PWD = None
            mongo_client = MongoClient( mongo_url )
            mongo_db = mongo_client[ DB_Name_user ]
            #if NiFi_DB_Auth_User is not None and NiFi_DB_Auth_PWD is not None:
            #    mongo_db.authenticate( NiFi_DB_Auth_User, NiFi_DB_Auth_PWD, source=DB_Name_user )
            break
        except:
#            print traceback.format_exc()
            log_error_and_sleep('Mongo_user error!')
    
    mongo_client.close()
    return mongo_db
