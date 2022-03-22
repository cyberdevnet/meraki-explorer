from fastapi import Body, FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import Optional
import os
import json
import importlib
from pydantic import BaseModel
from pathlib import Path
import meraki



app = FastAPI()


origins = [
    "http://localhost:3000",
    "localhost:3000",
    "http://127.0.0.1:3000",
    "127.0.0.1:3000"
]

todos = [
    {
        "id": "1",
        "item": "Read a book."
    },
    {
        "id": "2",
        "item": "Cycle around town."
    }
]



app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ========================== BASE MODEL ===================================
# =========================================================================
class GetOrganizationsData(BaseModel):
    apiKey: str
class GetNetworksAndDevicesData(BaseModel):
    apiKey: str
    organizationId: str

class ApiCallData(BaseModel):
    apiKey: str
    responseString: str
    ParameterTemplate: dict
    responsePrefixes: dict
    isLoopModeActive: bool
    networksIDSelected: list
    devicesIDSelected: list
    usefulParameter: str

# =========================================================================
# =========================================================================






@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to your todo list."}


@app.get("/todo", tags=["todos"])
async def get_todos() -> dict:
    return { "data": todos }



@app.get("/getOpenAPIJson", tags=["getOpenAPIJson"])
async def get_todos() -> dict:
    path = Path("spec2.json")
    if path.is_file():
        f = open('spec2.json')
        data = json.load(f)
        return data

    else:
        return {"error" : "File not found!"}




@app.post("/GetOrganizations", tags=["GetOrganizations"])
async def GetOrganizations(data: GetOrganizationsData):
    try:
        dashboard = meraki.DashboardAPI(data.apiKey)
        response = dashboard.organizations.getOrganizations()
        return response
    except meraki.APIError as err:
        print('Error: ', err)
        # error = (err.message['errors'][0])
        error = err.message
        print(error)
        return {'status': err.status, "message": err.message, "error": error["errors"] }

@app.post("/GetNetworksAndDevices", tags=["GetNetworksAndDevices"])
async def GetNetworksAndDevices(data: GetNetworksAndDevicesData):
    dashboard = meraki.DashboardAPI(data.apiKey)
    organizationId = data.organizationId
    networks = dashboard.organizations.getOrganizationNetworks(organizationId,total_pages='all')
    devices = dashboard.organizations.getOrganizationInventoryDevices(organizationId,total_pages='all')
    return {"networks": networks,"devices":devices}



@app.post("/ApiCall", tags=["ApiCall"])
async def ApiCall(data: ApiCallData):

    if data.isLoopModeActive == False:
        try:
            API_KEY = data.apiKey
            dashboard = meraki.DashboardAPI(API_KEY)

            category = data.responsePrefixes["category"]
            operationId = data.responsePrefixes["operationId"]
            parameter = data.ParameterTemplate

            print(data)

            # function_string =  f"dashboard.{category}.{operationId}(parameter)"
            
            result = getattr(getattr(dashboard, category), operationId)(**parameter)
            print(result)
            return result
        except meraki.APIError as err:
            print('Error: ', err)
            # error = (err.message['errors'][0])
            error = err.message
            print(error)
            
            return {'status': err.status, "message": err.message, "error": error }

    elif data.isLoopModeActive == True:
        if data.usefulParameter == "networkId":
            try:
                API_KEY = data.apiKey
                dashboard = meraki.DashboardAPI(API_KEY)

                category = data.responsePrefixes["category"]
                operationId = data.responsePrefixes["operationId"]
                parameter = data.ParameterTemplate

                print(data)

                NetworkList = data.networksIDSelected
                NetworkResults = []
                for networkId in NetworkList:

                    
                    result = getattr(getattr(dashboard, category), operationId)(networkId,**parameter)
                    print(result)
                    NetworkResults.append(result)
                return NetworkResults
            

            except meraki.APIError as err:
                print('Error: ', err)
                # error = (err.message['errors'][0])
                error = err.message
                print(error)
            
                return {'status': err.status, "message": err.message, "error": error }
        elif data.usefulParameter == "serial":
            try:
                API_KEY = data.apiKey
                dashboard = meraki.DashboardAPI(API_KEY)

                category = data.responsePrefixes["category"]
                operationId = data.responsePrefixes["operationId"]
                parameter = data.ParameterTemplate

                print(data)

                DevicesList = data.devicesIDSelected
                DeviceResults = []
                for serial in DevicesList:

                    
                    result = getattr(getattr(dashboard, category), operationId)(serial,**parameter)
                    print(result)
                    DeviceResults.append(result)
                return DeviceResults
            

            except meraki.APIError as err:
                print('Error: ', err)
                # error = (err.message['errors'][0])
                error = err.message
                print(error)
            
                return {'status': err.status, "message": err.message, "error": error }
        


