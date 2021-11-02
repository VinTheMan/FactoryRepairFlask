#!/usr/bin/env python

def func_Check_MemberData(mongo_DailyRepairMember_collection, name, passwd):
    Authentication = False
    
    for DocContent in mongo_DailyRepairMember_collection.find():
        #print(DocContent)
        if DocContent['Name'] == name and DocContent['Passwd'] == passwd:
            print("[Authentication] Pass!!")
            Authentication = True
          
    return Authentication


