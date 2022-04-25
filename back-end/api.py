from fastapi import Body, FastAPI, File, UploadFile, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import os
import json
from pydantic import BaseModel
from pathlib import Path
import meraki
from contextlib import redirect_stdout, redirect_stderr
import io
from datetime import datetime
import motor.motor_asyncio
from fastapi.encoders import jsonable_encoder
from bson import json_util, ObjectId
import time
from dotenv import load_dotenv
from production_config import settings as prod_settings
from development_config import settings as dev_settings

load_dotenv(verbose=True)
app = FastAPI(debug=True)
now = datetime.now()
FASTAPI_ENV_DEFAULT = 'production'

try:
    if os.getenv('FASTAPI_ENV',    FASTAPI_ENV_DEFAULT) == 'development':
        # Using a developmet configuration
        print("Environment is development")
        mongodb_url = dev_settings.mongodb_url
        mongodb_hostname = dev_settings.mongodb_hostname
    else:
        # Using a production configuration
        print("Environment is production")
        mongodb_url = prod_settings.mongodb_url
        mongodb_hostname = prod_settings.mongodb_hostname

except Exception as error:
    print('error: ', error)
    pass

origins = [
    "http://localhost:3000",
    "localhost:3000",
    "http://127.0.0.1:3000",
    "127.0.0.1:3000",
    "http://localhost",
    "http://127.0.0.1"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Initializing MONGODB DataBase
try:
    MONGO_DETAILS = mongodb_url
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
    database = client.merakiExplorerDB
    task_collection = database.get_collection("task_collection")
    openAPIspecFiles = database.get_collection("openAPIspecFiles")

# Insert DefaultopenAPIspecFile infos to mongoDB at start

    try:
        if os.getenv('FASTAPI_ENV',    FASTAPI_ENV_DEFAULT) == 'development':
            with open("DefaultopenAPIspecFile.json") as f:
                data = json.load(f)
                DefaultopenAPIspecFile = {
                    "download_date": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                    "version": "default",
                    "json_file": data,
                    "file": "default"
                }

                mongoInfo = openAPIspecFiles.find_one_and_replace({"version": "default"},
                                                                  DefaultopenAPIspecFile, upsert=True)
                print("DefaultopenAPIspecFile inserted")
        else:
            with open("back-end/DefaultopenAPIspecFile.json") as f:
                data = json.load(f)
                DefaultopenAPIspecFile = {
                    "download_date": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                    "version": "default",
                    "json_file": data,
                    "file": "default"
                }

                mongoInfo = openAPIspecFiles.find_one_and_replace({"version": "default"},
                                                                  DefaultopenAPIspecFile, upsert=True)
                print("DefaultopenAPIspecFile inserted")

    except Exception as err:
        print('err: ', err)
    print("[+] Database connected!", mongodb_url)
except Exception as error:
    print('DB error: ', error)
    print("[+] Database connection error!")
    print('mongodb_url: ', mongodb_url)


# ========================== BASE MODEL ===================================
# =========================================================================
class GetOrganizationsData(BaseModel):
    apiKey: str


class GetNetworksAndDevicesData(BaseModel):
    apiKey: str
    organizationId: str


class GetOpenAPIData(BaseModel):
    version: str


class GetOpenAPIupdateData(BaseModel):
    apiKey: str
    organizationId: str


class ApiCallData(BaseModel):
    apiKey: str
    responseString: str
    ParameterTemplate: dict
    ParameterTemplateJSON: dict
    responsePrefixes: dict
    useJsonBody: bool
    organizationIDSelected: list
    networksIDSelected: list
    devicesIDSelected: list
    usefulParameter: str
    isRollbackActive: bool
    method: str
    organization: str
    requiredParameters: list


class getAllTasksData(BaseModel):
    test: str


class RollbackData(BaseModel):
    RollbackParameterTemplate: dict


# =========================================================================
# =========================================================================


@ app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to Meraki Explorer."}


captured_string = "start logging"


@ app.post("/GetOrganizations", tags=["GetOrganizations"])
async def GetOrganizations(data: GetOrganizationsData):
    captured_output = io.StringIO()
    global captured_string
    dt_string = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    with redirect_stdout(captured_output), redirect_stderr(captured_output):
        try:
            print(f"{dt_string} NEW API CALL")
            API_KEY = data.apiKey
            dashboard = meraki.DashboardAPI(
                API_KEY, output_log=False, print_console=True, suppress_logging=False)
            response = dashboard.organizations.getOrganizations()
            print(response)
            captured_string = captured_output.getvalue()
            return response
        except (meraki.APIError, TypeError) as err:
            if TypeError:
                print(f'args = {err.args}')
                captured_string = captured_output.getvalue()
                return {"error": err.args}
            else:
                print(f'status code = {err.status}')
                print(f'reason = {err.reason}')
                print(f'error = {err.message}')
                captured_string = captured_output.getvalue()

            captured_string = captured_output.getvalue()
            return {'status': err.status, "message": err.message, "error": err.reason}


@ app.post("/GetNetworksAndDevices", tags=["GetNetworksAndDevices"])
async def GetNetworksAndDevices(data: GetNetworksAndDevicesData):
    captured_output = io.StringIO()
    global captured_string
    dt_string = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    with redirect_stdout(captured_output), redirect_stderr(captured_output):
        try:
            print(f"{dt_string} NEW API CALL")
            API_KEY = data.apiKey
            dashboard = meraki.DashboardAPI(
                API_KEY, output_log=False, print_console=True, suppress_logging=False)
            organizationId = data.organizationId
            networks = dashboard.organizations.getOrganizationNetworks(
                organizationId, total_pages='all')
            devices = dashboard.organizations.getOrganizationInventoryDevices(
                organizationId, total_pages='all')
            print(networks)
            print(devices)
            captured_string = captured_output.getvalue()
            return {"networks": networks, "devices": devices}
        except (meraki.APIError, TypeError) as err:
            if TypeError:
                print(f'args = {err.args}')
                captured_string = captured_output.getvalue()
                return {"error": err.args}
            else:
                print(f'status code = {err.status}')
                print(f'reason = {err.reason}')
                print(f'error = {err.message}')
                captured_string = captured_output.getvalue()

            captured_string = captured_output.getvalue()
            return {'status': err.status, "message": err.message, "error": err.reason}


@ app.post("/GetOpenAPI", tags=["GetOpenAPI"])
async def GetOpenAPI(data: GetOpenAPIData):
    captured_output = io.StringIO()
    global captured_string
    dt_string = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    version = data.version
    try:
        new_version = await database.openAPIspecFiles.find_one({"version": version}, {'_id': False})
        return {"new_version": new_version}

    except Exception as err:
        print('err: ', err)
        return {"error": "there was an error uploading the file"}


@ app.get("/GetAllOpenAPI", tags=["GetAllOpenAPI"])
async def GetAllOpenAPI():
    dt_string = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    try:
        # get all file Infos from mongoDB
        cursor = database.openAPIspecFiles.find({}, {'_id': False})
        cursorList = await cursor.to_list(None)
        return {"allOpenAPIinfo": cursorList}

    except Exception as err:
        print('err: ', err)
        return {"error": "there was an error uploading the file"}


@ app.post("/GetOpenAPIupdate", tags=["GetOpenAPIupdate"])
async def GetOpenAPIupdate(data: GetOpenAPIupdateData):
    captured_output = io.StringIO()
    global captured_string
    dt_string = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    date_string = datetime.now().strftime("%d-%m-%Y")
    filename_date = datetime.now().strftime("%Y%m%d%H%M%S")
    with redirect_stdout(captured_output), redirect_stderr(captured_output):
        try:
            print(f"{dt_string} NEW API CALL")
            API_KEY = data.apiKey
            dashboard = meraki.DashboardAPI(
                API_KEY, output_log=False, print_console=True, suppress_logging=False)
            organizationId = data.organizationId

            openAPI = dashboard.organizations.getOrganizationOpenapiSpec(
                organizationId)

            captured_string = captured_output.getvalue()

            # save openAPIspecFile infos to mongoDB
            try:

                openAPIspecFileCollection = {
                    "download_date": dt_string,
                    "version": openAPI["info"]["version"],
                    "json_file": openAPI,
                    "file": openAPI["info"]["version"]
                }

                # update file only if new version is available. else return no_update
                findOne = await openAPIspecFiles.find_one({"version": openAPI["info"]["version"]})
                if findOne is not None:
                    if findOne["version"] == openAPI["info"]["version"]:
                        return {"no_update": "No update available"}

                mongoInfo = await openAPIspecFiles.insert_one(openAPIspecFileCollection)

                # get all file Infos from mongoDB
                cursor = database.openAPIspecFiles.find({}, {'_id': False})

                cursorList = await cursor.to_list(None)
                #####ä###
                # remove oldest file (but not the default), keep only 10 files
                if len(cursorList) > 10:
                    last = database.openAPIspecFiles.find().sort(
                        [('_id', 1)]).limit(2)
                    docs = await last.to_list(None)
                    docDelete = await database.openAPIspecFiles.find_one_and_delete({"_id": docs[1]['_id']})
                    cursorAfterDelete = database.openAPIspecFiles.find(
                        {}, {'_id': False})
                    cursorListAfterDelete = await cursorAfterDelete.to_list(None)
                    allOpenAPIinfoAfterDelete = json.loads(
                        json_util.dumps(cursorListAfterDelete))
                    return {"info": "openAPIspec file uploaded",  "allOpenAPIinfo": allOpenAPIinfoAfterDelete}
                else:
                    allOpenAPIinfo = json.loads(json_util.dumps(cursorList))
                    return {"info": "openAPIspec file uploaded",  "allOpenAPIinfo": allOpenAPIinfo}
            except Exception as err:
                print('err: ', err)
                return {"error": "there was an error uploading the file"}

        except (meraki.APIError, TypeError) as err:
            if TypeError:
                print(f'args = {err.args}')
                captured_string = captured_output.getvalue()
                return {"error": err.args}
            else:
                print(f'status code = {err.status}')
                print(f'reason = {err.reason}')
                print(f'error = {err.message}')
                captured_string = captured_output.getvalue()

            captured_string = captured_output.getvalue()
            return {'status': err.status, "message": err.message, "error": err.reason}


@ app.post("/ApiCall", tags=["ApiCall"])
async def ApiCall(data: ApiCallData):
    now = datetime.now()
    captured_output = io.StringIO()
    global captured_string
    dt_string = now.strftime("%d-%m-%Y %H:%M:%S")
    organization = data.organization
    with redirect_stdout(captured_output), redirect_stderr(captured_output):
        if data.useJsonBody == False:
            if data.usefulParameter == "networkId":
                if data.isRollbackActive == True:
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        rollbackId = data.responsePrefixes["rollbackId"]
                        NetworkList = data.networksIDSelected
                        parameter = data.ParameterTemplate
                        requiredParameters = data.requiredParameters
                        NetworkResults = []
                        RollbackResponse = []

                        # get only required parameter in get-rollbackId
                        rollbackGetparameters = dict()
                        for (key, value) in parameter.items():
                            if key in requiredParameters:
                                rollbackGetparameters[key] = value

                        if len(data.networksIDSelected) == 0:
                            if "," in parameter["networkId"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(
                                    parameter["networkId"].split())
                                # split in array by comma
                                networkIdArray = noSpaces.split(",")
                                for index, networkId in enumerate(networkIdArray):
                                    result = getattr(
                                        getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                    print(result)
                                    RollbackResponse.append(result)
                                    RollbackResponse[index]["networkId"] = networkId
                                    captured_string = captured_output.getvalue()
                                print(RollbackResponse)
                            else:
                                networkId = parameter["networkId"]
                                RollbackResponse = getattr(
                                    getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                RollbackResponse["networkId"] = networkId
                                captured_string = captured_output.getvalue()
                                print(RollbackResponse)

                        else:
                            for index, networkId in enumerate(NetworkList):

                                result = getattr(
                                    getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                RollbackResponse.append(result)
                                RollbackResponse[index]["networkId"] = networkId
                                print(result)
                                NetworkResults.append(result)
                                captured_string = captured_output.getvalue()

                            print(NetworkResults)

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": rollbackId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": "",

                                "response": err.args,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": rollbackId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": "",

                                "response": err.reason,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}

                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        loop_parameter = []

                        if len(data.networksIDSelected) == 0:
                            if "," in parameter["networkId"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(
                                    parameter["networkId"].split())
                                # split in array by comma
                                networkIdArray = noSpaces.split(",")
                                # remove networkId because already passed in the networkIdArray, keep other parameters
                                parameter.pop("networkId")
                                NetworkResults = []
                                for networkId in networkIdArray:
                                    result = getattr(getattr(dashboard, category), operationId)(
                                        networkId, **parameter)
                                    loop_parameter.append(
                                        {"networkId": networkId, **parameter})
                                    print(result)
                                    NetworkResults.append(result)
                                    captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": loop_parameter,
                                                  "response": NetworkResults,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return NetworkResults
                            else:
                                result = getattr(
                                    getattr(dashboard, category), operationId)(**parameter)
                                print(result)
                                captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": parameter,
                                                  "response": result,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return result
                        else:
                            # remove networkId because already passed in the loop, keep other parameters
                            parameter.pop("networkId")
                            NetworkList = data.networksIDSelected
                            NetworkResults = []
                            for networkId in NetworkList:
                                result = getattr(getattr(dashboard, category), operationId)(
                                    networkId, **parameter)
                                loop_parameter.append(
                                    {"networkId": networkId, **parameter})
                                print(result)
                                NetworkResults.append(result)
                                captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": NetworkResults,
                                "rollback_response": RollbackResponse,
                                "error": False
                            }
                            task = await task_collection.insert_one(taskCollection)

                            return NetworkResults

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": err.args,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": err.reason,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
                elif data.isRollbackActive == False:
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        loop_parameter = []

                        if len(data.networksIDSelected) == 0:
                            if "," in parameter["networkId"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(
                                    parameter["networkId"].split())
                                # split in array by comma
                                networkIdArray = noSpaces.split(",")
                                # remove networkId because already passed in the networkIdArray, keep other parameters
                                parameter.pop("networkId")
                                NetworkResults = []
                                for networkId in networkIdArray:
                                    result = getattr(getattr(dashboard, category), operationId)(
                                        networkId, **parameter)
                                    loop_parameter.append(
                                        {"networkId": networkId, **parameter})
                                    print(result)
                                    NetworkResults.append(result)
                                    captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": loop_parameter,
                                                  "response": NetworkResults,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                print(NetworkResults)
                                return NetworkResults
                            else:
                                result = getattr(
                                    getattr(dashboard, category), operationId)(**parameter)
                                print(result)
                                captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": parameter,
                                                  "response": result,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return result

                        else:
                            # remove networkId because already passed in the loop, keep other parameters
                            parameter.pop("networkId")
                            NetworkList = data.networksIDSelected
                            NetworkResults = []

                            for networkId in NetworkList:
                                result = getattr(getattr(dashboard, category), operationId)(
                                    networkId, **parameter)
                                loop_parameter.append(
                                    {"networkId": networkId, **parameter})
                                print(result)
                                NetworkResults.append(result)
                                captured_string = captured_output.getvalue()

                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": NetworkResults,
                                              "error": False}
                            task = await task_collection.insert_one(taskCollection)

                            return NetworkResults

                    except (meraki.APIError, TypeError) as err:
                        print("err: ", err)
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": err.args,
                                              "error": True}
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": err.reason,
                                              "error": True}
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}

            elif data.usefulParameter == "serial":
                if data.isRollbackActive == True:
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        rollbackId = data.responsePrefixes["rollbackId"]
                        DevicesList = data.devicesIDSelected
                        parameter = data.ParameterTemplate
                        requiredParameters = data.requiredParameters
                        DeviceResults = []
                        RollbackResponse = []

                        # get only required parameter in get-rollbackId
                        rollbackGetparameters = dict()
                        for (key, value) in parameter.items():
                            if key in requiredParameters:
                                rollbackGetparameters[key] = value

                        if len(data.devicesIDSelected) == 0:
                            if "," in parameter["serial"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(parameter["serial"].split())
                                # split in array by comma
                                serialArray = noSpaces.split(",")
                                for index, serial in enumerate(serialArray):
                                    result = getattr(
                                        getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                    print(result)
                                    RollbackResponse.append(result)
                                    RollbackResponse[index]["serial"] = serial
                                    captured_string = captured_output.getvalue()
                                print(RollbackResponse)
                            else:
                                serial = parameter["serial"]
                                RollbackResponse = getattr(
                                    getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                RollbackResponse["serial"] = serial
                                captured_string = captured_output.getvalue()
                                print(RollbackResponse)

                        else:
                            for index, serial in enumerate(DevicesList):
                                result = getattr(
                                    getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                RollbackResponse.append(result)
                                RollbackResponse[index]["serial"] = serial
                                print(result)
                                DeviceResults.append(result)
                                captured_string = captured_output.getvalue()
                            print(DeviceResults)

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": rollbackId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": "",

                                "response": err.args,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": rollbackId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": "",

                                "response": err.reason,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        loop_parameter = []

                        if len(data.devicesIDSelected) == 0:
                            if "," in parameter["serial"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(parameter["serial"].split())
                                # split in array by comma
                                serialArray = noSpaces.split(",")
                                # remove serial because already passed in the serialArray, keep other parameters
                                parameter.pop("serial")
                                DeviceResults = []
                                for serial in serialArray:
                                    result = getattr(getattr(dashboard, category), operationId)(
                                        serial, **parameter)
                                    loop_parameter.append(
                                        {"serial": serial, **parameter})
                                    print(result)
                                    DeviceResults.append(result)
                                    captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": loop_parameter,
                                                  "response": DeviceResults,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return DeviceResults

                            else:
                                result = getattr(
                                    getattr(dashboard, category), operationId)(**parameter)
                                print(result)
                                captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": parameter,
                                                  "response": result,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return result
                        else:
                            # remove serial because already passed in the loop, keep other parameters
                            parameter.pop("serial")
                            DevicesList = data.devicesIDSelected
                            DeviceResults = []
                            for serial in DevicesList:
                                result = getattr(getattr(dashboard, category), operationId)(
                                    serial, **parameter)
                                loop_parameter.append(
                                    {"serial": serial, **parameter})
                                DeviceResults.append(result)
                                captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": DeviceResults,
                                "rollback_response": RollbackResponse,
                                "error": False
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return DeviceResults

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": err.args,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": err.reason,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
                elif data.isRollbackActive == False:
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        loop_parameter = []

                        if len(data.devicesIDSelected) == 0:
                            if "," in parameter["serial"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(parameter["serial"].split())
                                # split in array by comma
                                serialArray = noSpaces.split(",")
                                # remove serial because already passed in the SerialArray, keep other parameters
                                parameter.pop("serial")
                                DeviceResults = []
                                for serial in serialArray:
                                    result = getattr(getattr(dashboard, category), operationId)(
                                        serial, **parameter)
                                    loop_parameter.append(
                                        {"serial": serial, **parameter})
                                    print(result)
                                    DeviceResults.append(result)
                                    captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": loop_parameter,
                                                  "response": DeviceResults,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return DeviceResults

                            else:
                                result = getattr(
                                    getattr(dashboard, category), operationId)(**parameter)
                                print(result)
                                captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": parameter,
                                                  "response": result,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return result

                        else:
                            # remove serial because already passed in the loop, keep other parameters
                            parameter.pop("serial")
                            DevicesList = data.devicesIDSelected
                            DeviceResults = []
                            for serial in DevicesList:
                                result = getattr(getattr(dashboard, category), operationId)(
                                    serial, **parameter)
                                loop_parameter.append(
                                    {"serial": serial, **parameter})
                                print(result)
                                DeviceResults.append(result)
                                captured_string = captured_output.getvalue()
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,
                                              "response": DeviceResults,
                                              "error": False}
                            task = await task_collection.insert_one(taskCollection)
                            return DeviceResults

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,
                                              "response": err.args,
                                              "error": True}
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": err.reason,
                                              "error": True}
                            task = await task_collection.insert_one(taskCollection)

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
            if data.usefulParameter == "organizationId":
                if data.isRollbackActive == True:
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        rollbackId = data.responsePrefixes["rollbackId"]
                        OrganizationList = data.organizationIDSelected
                        parameter = data.ParameterTemplate
                        requiredParameters = data.requiredParameters
                        OrganizationResults = []
                        RollbackResponse = []

                        # get only required parameter in get-rollbackId
                        rollbackGetparameters = dict()
                        for (key, value) in parameter.items():
                            if key in requiredParameters:
                                rollbackGetparameters[key] = value

                        if len(data.organizationIDSelected) == 0:
                            if "," in parameter["organizationId"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(
                                    parameter["organizationId"].split())
                                # split in array by comma
                                organizationIdArray = noSpaces.split(",")
                                for index, organizationId in enumerate(organizationIdArray):
                                    result = getattr(
                                        getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                    print(result)
                                    RollbackResponse.append(result)
                                    RollbackResponse[index]["organizationId"] = organizationId
                                    captured_string = captured_output.getvalue()
                                print(RollbackResponse)
                            else:
                                organizationId = parameter["organizationId"]
                                RollbackResponse = getattr(
                                    getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                RollbackResponse["organizationId"] = organizationId
                                captured_string = captured_output.getvalue()
                                print(RollbackResponse)

                        else:
                            for index, organizationId in enumerate(OrganizationList):
                                result = getattr(
                                    getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                RollbackResponse.append(result)
                                RollbackResponse[index]["organizationId"] = organizationId
                                print(result)
                                OrganizationResults.append(result)
                                captured_string = captured_output.getvalue()

                            print(OrganizationResults)

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": rollbackId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": "",

                                "response": err.args,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": rollbackId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": "",

                                "response": err.reason,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}

                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        loop_parameter = []

                        if len(data.organizationIDSelected) == 0:
                            if "," in parameter["organizationId"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(
                                    parameter["organizationId"].split())
                                # split in array by comma
                                organizationIdArray = noSpaces.split(",")
                                # remove organizationId because already passed in the organizationIdArray, keep other parameters
                                parameter.pop("organizationId")
                                OrganizationResults = []
                                for organizationId in organizationIdArray:
                                    result = getattr(getattr(dashboard, category), operationId)(
                                        organizationId, **parameter)
                                    loop_parameter.append(
                                        {"organizationId": organizationId, **parameter})
                                    print(result)
                                    OrganizationResults.append(result)
                                    captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": loop_parameter,
                                                  "response": OrganizationResults,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return OrganizationResults
                            else:
                                result = getattr(
                                    getattr(dashboard, category), operationId)(**parameter)
                                print(result)
                                captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": parameter,
                                                  "response": result,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return result
                        else:
                            # remove organizationId because already passed in the loop, keep other parameters

                            parameter.pop("organizationId")
                            OrganizationList = data.organizationIDSelected
                            OrganizationResults = []
                            for organizationId in OrganizationList:
                                result = getattr(getattr(dashboard, category), operationId)(
                                    organizationId, **parameter)
                                loop_parameter.append(
                                    {"organizationId": organizationId, **parameter})
                                print(result)
                                OrganizationResults.append(result)
                                captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": OrganizationResults,
                                "rollback_response": RollbackResponse,
                                "error": False
                            }
                            task = await task_collection.insert_one(taskCollection)

                            return OrganizationResults

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": err.args,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": err.reason,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
                elif data.isRollbackActive == False:
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        loop_parameter = []

                        # Special Exception for getOrganizations
                        if data.responsePrefixes["operationId"] == "getOrganizations":
                            result = getattr(
                                getattr(dashboard, category), operationId)()
                            print(result)
                            captured_string = captured_output.getvalue()
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": parameter,
                                              "response": result,
                                              "error": False}
                            task = await task_collection.insert_one(taskCollection)
                            return result

                        if len(data.organizationIDSelected) == 0:
                            if "," in parameter["organizationId"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(
                                    parameter["organizationId"].split())
                                print("noSpaces: ", noSpaces)
                                # split in array by comma
                                organizationIdArray = noSpaces.split(",")
                                # remove organizationId because already passed in the organizationIdArray, keep other parameters
                                parameter.pop("organizationId")
                                OrganizationResults = []
                                for organizationId in organizationIdArray:
                                    result = getattr(getattr(dashboard, category), operationId)(
                                        organizationId, **parameter)
                                    loop_parameter.append(
                                        {"organizationId": organizationId, **parameter})
                                    print(result)
                                    OrganizationResults.append(result)
                                    captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": loop_parameter,
                                                  "response": OrganizationResults,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                print(OrganizationResults)
                                return OrganizationResults
                            else:
                                result = getattr(
                                    getattr(dashboard, category), operationId)(**parameter)
                                print(result)
                                captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": parameter,
                                                  "response": result,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return result

                        else:
                            # remove organizationId because already passed in the loop, keep other parameters
                            parameter.pop("organizationId")
                            OrganizationList = data.organizationIDSelected
                            OrganizationResults = []

                            for organizationId in OrganizationList:
                                result = getattr(getattr(dashboard, category), operationId)(
                                    organizationId, **parameter)
                                loop_parameter.append(
                                    {"organizationId": organizationId, **parameter})
                                print(result)
                                OrganizationResults.append(result)
                                captured_string = captured_output.getvalue()

                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": OrganizationResults,
                                              "error": False}
                            task = await task_collection.insert_one(taskCollection)

                            return OrganizationResults

                    except (meraki.APIError, TypeError) as err:
                        print("err: ", err)
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": err.args,
                                              "error": True}
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": err.reason,
                                              "error": True}
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
        elif data.useJsonBody == True:
            if data.usefulParameter == "networkId":
                if data.isRollbackActive == True:
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        requiredParameters = data.requiredParameters
                        rollbackId = data.responsePrefixes["rollbackId"]
                        RollbackResponse = []

                        # get only required parameter in get-rollbackId
                        rollbackGetparameters = dict()
                        for (key, value) in parameter.items():
                            if key in requiredParameters:
                                rollbackGetparameters[key] = value

                        if len(data.networksIDSelected) == 0:
                            if "," in parameter["networkId"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(
                                    parameter["networkId"].split())
                                # split in array by comma
                                networkIdArray = noSpaces.split(",")

                                for index, networkId in enumerate(networkIdArray):
                                    result = getattr(
                                        getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                    print(result)
                                    RollbackResponse.append(result)
                                    RollbackResponse[index]["networkId"] = networkId
                                    captured_string = captured_output.getvalue()
                                print(RollbackResponse)
                            else:
                                networkId = parameter["networkId"]
                                RollbackResponse = getattr(
                                    getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                RollbackResponse["networkId"] = networkId
                                captured_string = captured_output.getvalue()
                                print(RollbackResponse)

                        else:
                            NetworkList = data.networksIDSelected
                            NetworkResults = []

                            for index, networkId in enumerate(NetworkList):
                                result = getattr(
                                    getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                RollbackResponse.append(result)
                                RollbackResponse[index]["networkId"] = networkId
                                print(result)

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": rollbackId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": "",

                                "response": err.args,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {
                                "task_name": rollbackId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": "",

                                "response": err.reason,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        loop_parameter = []

                        if len(data.networksIDSelected) == 0:
                            JsonBodyparameter = data.ParameterTemplateJSON
                            if "," in parameter["networkId"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(
                                    parameter["networkId"].split())
                                # split in array by comma
                                networkIdArray = noSpaces.split(",")
                                # remove networkId because already passed in the networkIdArray, keep other parameters
                                parameter.pop("networkId")
                                NetworkResults = []
                                for networkId in networkIdArray:
                                    result = getattr(getattr(dashboard, category), operationId)(
                                        networkId, **JsonBodyparameter)
                                    loop_parameter.append(
                                        {"networkId": networkId, **parameter})
                                    print(result)
                                    NetworkResults.append(result)
                                    captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": loop_parameter,
                                                  "response": NetworkResults,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return NetworkResults

                            else:
                                JsonBodyparameter = data.ParameterTemplateJSON
                                mixedParameters = {
                                    **parameter, **JsonBodyparameter}
                                result = getattr(
                                    getattr(dashboard, category), operationId)(**mixedParameters)
                                print(result)
                                captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": parameter,
                                                  "response": result,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return result

                        else:
                            JsonBodyparameter = data.ParameterTemplateJSON
                            mixedParameters = {
                                **parameter, **JsonBodyparameter}
                            # remove serial because already passed in the loop, keep other parameters
                            mixedParameters.pop("networkId")

                            NetworkList = data.networksIDSelected
                            NetworkResults = []

                            for networkId in NetworkList:

                                result = getattr(getattr(dashboard, category), operationId)(
                                    networkId, **mixedParameters)
                                loop_parameter.append(
                                    {"networkId": networkId, **mixedParameters})
                                print(result)
                                NetworkResults.append(result)
                                captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": NetworkResults,
                                "rollback_response": RollbackResponse,
                                "error": False
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return NetworkResults

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": err.args,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": err.reason,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
                elif data.isRollbackActive == False:
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        loop_parameter = []

                        if len(data.networksIDSelected) == 0:
                            JsonBodyparameter = data.ParameterTemplateJSON
                            if "," in parameter["networkId"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(
                                    parameter["networkId"].split())
                                # split in array by comma
                                networkIdArray = noSpaces.split(",")
                                # remove networkId because already passed in the networkIdArray, keep other parameters
                                parameter.pop("networkId")
                                DeviceResults = []
                                for networkId in networkIdArray:
                                    result = getattr(getattr(dashboard, category), operationId)(
                                        networkId, **JsonBodyparameter)
                                    loop_parameter.append(
                                        {"networkId": networkId, **parameter})
                                    print(result)
                                    DeviceResults.append(result)
                                    captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": loop_parameter,
                                                  "response": DeviceResults,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return DeviceResults

                            else:
                                JsonBodyparameter = data.ParameterTemplateJSON
                                mixedParameters = {
                                    **parameter, **JsonBodyparameter}
                                result = getattr(
                                    getattr(dashboard, category), operationId)(**mixedParameters)
                                print(result)
                                captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": parameter,
                                                  "response": result,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return result

                        else:
                            JsonBodyparameter = data.ParameterTemplateJSON
                            mixedParameters = {
                                **parameter, **JsonBodyparameter}
                            # remove networkId because already passed in the loop, keep other parameters
                            mixedParameters.pop("networkId")

                            NetworkList = data.networksIDSelected
                            NetworkResults = []

                            for networkId in NetworkList:

                                result = getattr(getattr(dashboard, category), operationId)(
                                    networkId, **mixedParameters)
                                loop_parameter.append(
                                    {"networkId": networkId, **mixedParameters})
                                print(result)

                                NetworkResults.append(result)
                                captured_string = captured_output.getvalue()
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": NetworkResults,
                                              "error": False}
                            task = await task_collection.insert_one(taskCollection)
                            return NetworkResults

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": err.args,
                                              "error": True}
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": err.reason,
                                              "error": True}
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}

            elif data.usefulParameter == "serial":
                if data.isRollbackActive == True:
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        parameter = data.ParameterTemplate
                        rollbackId = data.responsePrefixes["rollbackId"]
                        requiredParameters = data.requiredParameters
                        RollbackResponse = []

                        # get only required parameter in get-rollbackId
                        rollbackGetparameters = dict()
                        for (key, value) in parameter.items():
                            if key in requiredParameters:
                                rollbackGetparameters[key] = value

                        if len(data.devicesIDSelected) == 0:
                            if "," in parameter["serial"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(parameter["serial"].split())
                                # split in array by comma
                                serialArray = noSpaces.split(",")

                                for index, serial in enumerate(serialArray):
                                    result = getattr(
                                        getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                    print(result)
                                    RollbackResponse.append(result)
                                    RollbackResponse[index]["serial"] = serial
                                    captured_string = captured_output.getvalue()
                                print(RollbackResponse)
                            else:
                                serial = parameter["serial"]
                                RollbackResponse = getattr(
                                    getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                RollbackResponse["serial"] = serial
                                captured_string = captured_output.getvalue()
                        else:
                            DevicesList = data.devicesIDSelected

                            for index, serial in enumerate(DevicesList):
                                result = getattr(
                                    getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                print(result)
                                RollbackResponse.append(result)
                                RollbackResponse[index]["serial"] = serial
                                captured_string = captured_output.getvalue()
                            print(RollbackResponse)

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": rollbackId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": "",

                                "response": err.args,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {
                                "task_name": rollbackId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": "",

                                "response": err.reason,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        loop_parameter = []

                        if len(data.devicesIDSelected) == 0:
                            JsonBodyparameter = data.ParameterTemplateJSON
                            if "," in parameter["serial"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(parameter["serial"].split())
                                # split in array by comma
                                serialArray = noSpaces.split(",")
                                # remove serial because already passed in the serialArray, keep other parameters
                                parameter.pop("serial")
                                DeviceResults = []
                                for serial in serialArray:
                                    result = getattr(getattr(dashboard, category), operationId)(
                                        serial, **JsonBodyparameter)
                                    loop_parameter.append(
                                        {"serial": serial, **parameter})
                                    print(result)
                                    DeviceResults.append(result)
                                    captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": loop_parameter,
                                                  "response": DeviceResults,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return DeviceResults
                            else:
                                JsonBodyparameter = data.ParameterTemplateJSON
                                mixedParameters = {
                                    **parameter, **JsonBodyparameter}
                                result = getattr(
                                    getattr(dashboard, category), operationId)(**mixedParameters)
                                print(result)
                                captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": parameter,
                                                  "response": result,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return result

                        else:
                            JsonBodyparameter = data.ParameterTemplateJSON
                            mixedParameters = {
                                **parameter, **JsonBodyparameter}
                            # remove serial because already passed in the loop, keep other parameters
                            if "serial" in mixedParameters:
                                mixedParameters.pop("serial")

                            DevicesList = data.devicesIDSelected
                            DeviceResults = []

                            for serial in DevicesList:
                                result = getattr(getattr(dashboard, category), operationId)(
                                    serial, **mixedParameters)
                                loop_parameter.append(
                                    {"serial": serial, **mixedParameters})
                                print(result)
                                DeviceResults.append(result)
                                captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": DeviceResults,
                                "rollback_response": RollbackResponse,
                                "error": False
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return DeviceResults

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": err.args,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": err.reason,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
                elif data.isRollbackActive == False:
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        loop_parameter = []

                        if len(data.devicesIDSelected) == 0:
                            JsonBodyparameter = data.ParameterTemplateJSON
                            if "," in parameter["serial"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(parameter["serial"].split())
                                # split in array by comma
                                serialArray = noSpaces.split(",")
                                # remove serial because already passed in the serialArray, keep other parameters
                                parameter.pop("serial")
                                DeviceResults = []
                                for serial in serialArray:
                                    result = getattr(getattr(dashboard, category), operationId)(
                                        serial, **JsonBodyparameter)
                                    loop_parameter.append(
                                        {"serial": serial, **parameter})
                                    print(result)
                                    DeviceResults.append(result)
                                    captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": loop_parameter,
                                                  "response": DeviceResults,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return DeviceResults

                            else:
                                JsonBodyparameter = data.ParameterTemplateJSON
                                mixedParameters = {
                                    **parameter, **JsonBodyparameter}
                                result = getattr(
                                    getattr(dashboard, category), operationId)(**mixedParameters)
                                print(result)
                                captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": parameter,
                                                  "response": result,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return result

                        else:
                            JsonBodyparameter = data.ParameterTemplateJSON
                            mixedParameters = {
                                **parameter, **JsonBodyparameter}
                            # remove serial because already passed in the loop, keep other parameters
                            mixedParameters.pop("serial")

                            DevicesList = data.devicesIDSelected
                            DeviceResults = []

                            for serial in DevicesList:
                                result = getattr(getattr(dashboard, category), operationId)(
                                    serial, **mixedParameters)
                                loop_parameter.append(
                                    {"serial": serial, **mixedParameters})
                                print(result)
                                DeviceResults.append(result)
                                captured_string = captured_output.getvalue()
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": DeviceResults,
                                              "error": False}
                            task = await task_collection.insert_one(taskCollection)
                            return DeviceResults

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": err.args,
                                              "error": True}
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": err.reason,
                                              "error": True}
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
            if data.usefulParameter == "organizationId":
                if data.isRollbackActive == True:
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        requiredParameters = data.requiredParameters
                        rollbackId = data.responsePrefixes["rollbackId"]
                        RollbackResponse = []

                        # get only required parameter in get-rollbackId
                        rollbackGetparameters = dict()
                        for (key, value) in parameter.items():
                            if key in requiredParameters:
                                rollbackGetparameters[key] = value

                        if len(data.organizationIDSelected) == 0:
                            if "," in parameter["organizationId"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(
                                    parameter["organizationId"].split())
                                # split in array by comma
                                organizationIdArray = noSpaces.split(",")

                                for index, organizationId in enumerate(organizationIdArray):
                                    result = getattr(
                                        getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                    print(result)
                                    RollbackResponse.append(result)
                                    RollbackResponse[index]["organizationId"] = organizationId
                                    captured_string = captured_output.getvalue()
                                print(RollbackResponse)
                            else:
                                organizationId = parameter["organizationId"]
                                RollbackResponse = getattr(
                                    getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                RollbackResponse["organizationId"] = organizationId
                                captured_string = captured_output.getvalue()
                                print(RollbackResponse)

                        else:
                            OrganizationList = data.organizationIDSelected
                            OrganizationResult = []

                            for index, organizationId in enumerate(OrganizationList):
                                result = getattr(
                                    getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                                RollbackResponse.append(result)
                                RollbackResponse[index]["organizationId"] = organizationId
                                print(result)

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": rollbackId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": "",

                                "response": err.args,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {
                                "task_name": rollbackId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": "",

                                "response": err.reason,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        loop_parameter = []

                        if len(data.organizationIDSelected) == 0:
                            JsonBodyparameter = data.ParameterTemplateJSON
                            if "," in parameter["organizationId"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(
                                    parameter["organizationId"].split())
                                # split in array by comma
                                organizationIdArray = noSpaces.split(",")
                                # remove organizationId because already passed in the organizationIdArray, keep other parameters
                                parameter.pop("organizationId")
                                OrganizationResult = []
                                for organizationId in organizationIdArray:
                                    result = getattr(getattr(dashboard, category), operationId)(
                                        organizationId, **JsonBodyparameter)
                                    loop_parameter.append(
                                        {"organizationId": organizationId, **parameter})
                                    print(result)
                                    OrganizationResult.append(result)
                                    captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": loop_parameter,
                                                  "response": OrganizationResult,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return OrganizationResult

                            else:
                                JsonBodyparameter = data.ParameterTemplateJSON
                                mixedParameters = {
                                    **parameter, **JsonBodyparameter}
                                result = getattr(
                                    getattr(dashboard, category), operationId)(**mixedParameters)
                                print(result)
                                captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": parameter,
                                                  "response": result,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return result

                        else:
                            JsonBodyparameter = data.ParameterTemplateJSON
                            mixedParameters = {
                                **parameter, **JsonBodyparameter}
                            # remove serial because already passed in the loop, keep other parameters
                            mixedParameters.pop("organizationId")

                            OrganizationList = data.organizationIDSelected
                            OrganizationResult = []

                            for organizationId in OrganizationList:

                                result = getattr(getattr(dashboard, category), operationId)(
                                    organizationId, **mixedParameters)
                                loop_parameter.append(
                                    {"organizationId": organizationId, **mixedParameters})
                                print(result)
                                OrganizationResult.append(result)
                                captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": OrganizationResult,
                                "rollback_response": RollbackResponse,
                                "error": False
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return OrganizationResult

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": err.args,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {
                                "task_name": operationId,
                                "start_time": dt_string,
                                "organization": organization,
                                "usefulParameter": data.usefulParameter,
                                "category": category,
                                "method": data.method,
                                "rollback": data.isRollbackActive,
                                "parameter": loop_parameter,

                                "response": err.reason,
                                "rollback_response": RollbackResponse,
                                "error": True
                            }
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}
                elif data.isRollbackActive == False:
                    try:
                        print(f"{dt_string} NEW API CALL")
                        API_KEY = data.apiKey
                        dashboard = meraki.DashboardAPI(
                            API_KEY, output_log=False, print_console=True, suppress_logging=False)

                        category = data.responsePrefixes["category"]
                        operationId = data.responsePrefixes["operationId"]
                        parameter = data.ParameterTemplate
                        loop_parameter = []

                        if len(data.organizationIDSelected) == 0:
                            JsonBodyparameter = data.ParameterTemplateJSON
                            if "," in parameter["organizationId"]:
                                # remove all whitespace characters (space, tab, newline, and so on)
                                noSpaces = ''.join(
                                    parameter["organizationId"].split())
                                # split in array by comma
                                organizationIdArray = noSpaces.split(",")
                                # remove organizationId because already passed in the organizationIdArray, keep other parameters
                                parameter.pop("organizationId")
                                DeviceResults = []
                                for organizationId in organizationIdArray:
                                    result = getattr(getattr(dashboard, category), operationId)(
                                        organizationId, **JsonBodyparameter)
                                    loop_parameter.append(
                                        {"organizationId": organizationId, **parameter})
                                    print(result)
                                    DeviceResults.append(result)
                                    captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": loop_parameter,
                                                  "response": DeviceResults,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return DeviceResults

                            else:
                                JsonBodyparameter = data.ParameterTemplateJSON
                                mixedParameters = {
                                    **parameter, **JsonBodyparameter}
                                result = getattr(
                                    getattr(dashboard, category), operationId)(**mixedParameters)
                                print(result)
                                captured_string = captured_output.getvalue()
                                taskCollection = {"task_name": operationId,
                                                  "start_time": dt_string,
                                                  "organization": organization,
                                                  "usefulParameter": data.usefulParameter,
                                                  "category": category,
                                                  "method": data.method,
                                                  "rollback": data.isRollbackActive,
                                                  "parameter": parameter,
                                                  "response": result,
                                                  "error": False}
                                task = await task_collection.insert_one(taskCollection)
                                return result

                        else:
                            JsonBodyparameter = data.ParameterTemplateJSON
                            mixedParameters = {
                                **parameter, **JsonBodyparameter}
                            # remove organizationId because already passed in the loop, keep other parameters
                            mixedParameters.pop("organizationId")

                            OrganizationList = data.organizationIDSelected
                            OrganizationResult = []

                            for organizationId in OrganizationList:

                                result = getattr(getattr(dashboard, category), operationId)(
                                    organizationId, **mixedParameters)
                                loop_parameter.append(
                                    {"organizationId": organizationId, **mixedParameters})
                                print(result)

                                OrganizationResult.append(result)
                                captured_string = captured_output.getvalue()
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": OrganizationResult,
                                              "error": False}
                            task = await task_collection.insert_one(taskCollection)
                            return OrganizationResult

                    except (meraki.APIError, TypeError) as err:
                        if TypeError:
                            print(f'args = {err.args}')
                            captured_string = captured_output.getvalue()
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": err.args,
                                              "error": True}
                            task = await task_collection.insert_one(taskCollection)
                            return {"error": err.args}
                        else:
                            print(f'status code = {err.status}')
                            print(f'reason = {err.reason}')
                            print(f'error = {err.message}')
                            taskCollection = {"task_name": operationId,
                                              "start_time": dt_string,
                                              "organization": organization,
                                              "usefulParameter": data.usefulParameter,
                                              "category": category,
                                              "method": data.method,
                                              "rollback": data.isRollbackActive,
                                              "parameter": loop_parameter,

                                              "response": err.reason,
                                              "error": True}
                            task = await task_collection.insert_one(taskCollection)
                            captured_string = captured_output.getvalue()

                        captured_string = captured_output.getvalue()
                        return {'status': err.status, "message": err.message, "error": err.reason}


@ app.websocket("/ws_global")
async def websocket_endpoint(websocket: WebSocket):

    print('Accepting client connection ws_global...')
    await websocket.accept()
    while True:
        try:
            # Wait for any message from the client
            data = await websocket.receive_text()

            with open("log.txt") as fp:
                # # Send message to the client
                print("Sending ws_global updates")
                await websocket.send_text(fp)

        except Exception as e:
            print('error:', e)
            break
    print('Bye..')


@ app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global captured_string
    print('Accepting client connection...')
    await websocket.accept()
    while True:
        try:
            # Wait for any message from the client
            data = await websocket.receive_text()

            # Send message to the client

            print("Sending websocket to front-end")
            await websocket.send_text(captured_string)
            with open("log.txt", "a") as logFile:
                logFile.write(captured_string)

        except Exception as e:
            print('error:', e)
            break
    print('Bye..')


@ app.post("/getAllTasks", tags=["getAllTasks"])
async def getAllTasks(data: getAllTasksData):
    try:
        cursor = database.task_collection.find({}, {'_id': False})
        cursorList = await cursor.to_list(None)
        allTasks = json.loads(json_util.dumps(cursorList))
        return allTasks
    except Exception as err:
        print('error: ', err)
        return {'error: ', err}


@ app.post("/Rollback", tags=["Rollback"])
async def Rollback(data: RollbackData):
    now = datetime.now()
    captured_output = io.StringIO()
    global captured_string
    dt_string = now.strftime("%d-%m-%Y %H:%M:%S")
    organization = data.RollbackParameterTemplate["organization"]
    with redirect_stdout(captured_output), redirect_stderr(captured_output):
        parameter = data.RollbackParameterTemplate["parameter"]
        if type(parameter) is list:
            try:
                print(f"{dt_string} NEW API CALL")
                API_KEY = data.RollbackParameterTemplate["apiKey"]
                dashboard = meraki.DashboardAPI(
                    API_KEY, output_log=False, print_console=True, suppress_logging=False)
                category = data.RollbackParameterTemplate["category"]
                operationId = data.RollbackParameterTemplate["operationId"]
                rollbackId = operationId.replace("update", "get")
                usefulParameter = data.RollbackParameterTemplate["usefulParameter"]
                requiredParameters = data.RollbackParameterTemplate["requiredParameters"]
                Rollback_BackResponse = []

                for index, item in enumerate(parameter):
                    # get only required parameter in get-rollbackId
                    rollbackGetparameters = dict()
                    for (key, value) in item.items():
                        if key in requiredParameters:
                            rollbackGetparameters[key] = value

                    if usefulParameter == "networkId":
                        networkId = item["networkId"]
                        RollbackResponse = getattr(
                            getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                        Rollback_BackResponse.append(RollbackResponse)
                        Rollback_BackResponse[index]["networkId"] = networkId
                    elif usefulParameter == "serial":
                        serial = item["serial"]
                        RollbackResponse = getattr(
                            getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                        Rollback_BackResponse.append(RollbackResponse)
                        Rollback_BackResponse[index]["serial"] = serial
                    elif usefulParameter == "organizationId":
                        organizationId = item["organizationId"]
                        RollbackResponse = getattr(
                            getattr(dashboard, category), rollbackId)(**rollbackGetparameters)
                        Rollback_BackResponse.append(RollbackResponse)
                        Rollback_BackResponse[index]["organizationId"] = organizationId
                    else:
                        RollbackResponse = getattr(
                            getattr(dashboard, category), rollbackId)(**rollbackGetparameters)

                    print("Rollback_BackResponse: ", Rollback_BackResponse)
                    captured_string = captured_output.getvalue()

            except (meraki.APIError, TypeError) as err:
                if TypeError:

                    print(f'args = {err.args}')
                    captured_string = captured_output.getvalue()
                    taskCollection = {"task_name": operationId,
                                      "start_time": dt_string,
                                      "organization": organization,
                                      "usefulParameter": usefulParameter,
                                      "category": category,
                                      "method": data.RollbackParameterTemplate["method"],
                                      "rollback": True,
                                      "parameter": parameter,

                                      "response": err.args,
                                      "rollback_response": Rollback_BackResponse,
                                      "error": True
                                      }
                    task = await task_collection.insert_one(taskCollection)
                    return {"error": err.args}
                else:
                    print(f'status code = {err.status}')
                    print(f'reason = {err.reason}')
                    print(f'error = {err.message}')
                    captured_string = captured_output.getvalue()
                    taskCollection = {"task_name": operationId,
                                      "start_time": dt_string,
                                      "organization": organization,
                                      "usefulParameter": usefulParameter,
                                      "category": category,
                                      "method": data.RollbackParameterTemplate["method"],
                                      "rollback": True,
                                      "parameter": parameter,

                                      "response": err.reason,
                                      "rollback_response": Rollback_BackResponse,
                                      "error": True
                                      }
                    task = await task_collection.insert_one(taskCollection)

                captured_string = captured_output.getvalue()
                return {'status': err.status, "message": err.message, "error": err.reason}
            try:
                print(f"{dt_string} NEW API CALL")
                API_KEY = data.RollbackParameterTemplate["apiKey"]
                dashboard = meraki.DashboardAPI(
                    API_KEY, output_log=False, print_console=True, suppress_logging=False)
                category = data.RollbackParameterTemplate["category"]
                operationId = data.RollbackParameterTemplate["operationId"]
                parameter = data.RollbackParameterTemplate["parameter"]
                usefulParameter = data.RollbackParameterTemplate["usefulParameter"]

                loop_parameter = []
                rollBackLoopResponse = []
                for index, item in enumerate(parameter):
                    # remove null/None parameter if any
                    for key, value in item.copy().items():
                        if value == None:
                            item.pop(key)

                    result = getattr(getattr(dashboard, category),
                                     operationId)(**item)
                    rollBackLoopResponse.append(result)
                    if usefulParameter == "networkId":
                        loop_parameter.append({"networkId": networkId, **item})
                    elif usefulParameter == "serial":
                        loop_parameter.append({"serial": serial, **item})
                    elif usefulParameter == "organizationId":
                        loop_parameter.append(
                            {"organizationId": organizationId, **item})
                    print(rollBackLoopResponse)
                    captured_string = captured_output.getvalue()
                taskCollection = {
                    "task_name": operationId,
                    "start_time": dt_string,
                    "organization": organization,
                    "usefulParameter": usefulParameter,
                    "category": category,
                    "method": data.RollbackParameterTemplate["method"],
                    "rollback": True,
                    "parameter": loop_parameter,

                    "response": rollBackLoopResponse,
                    "rollback_response": Rollback_BackResponse,
                    "error": False
                }
                task = await task_collection.insert_one(taskCollection)
                return rollBackLoopResponse
            except (meraki.APIError, TypeError) as err:
                if TypeError:
                    print(f'args = {err.args}')
                    captured_string = captured_output.getvalue()
                    taskCollection = {
                        "task_name": operationId,
                        "start_time": dt_string,
                        "organization": organization,
                        "usefulParameter": usefulParameter,
                        "category": category,
                        "method": data.RollbackParameterTemplate["method"],
                        "rollback": True,
                        "parameter": loop_parameter,

                        "response": err.args,
                        "rollback_response": Rollback_BackResponse,
                        "error": True
                    }
                    task = await task_collection.insert_one(taskCollection)
                    return {"error": err.args}
                else:
                    print(f'status code = {err.status}')
                    print(f'reason = {err.reason}')
                    print(f'error = {err.message}')
                    taskCollection = {
                        "task_name": operationId,
                        "start_time": dt_string,
                        "organization": organization,
                        "usefulParameter": usefulParameter,
                        "category": category,
                        "method": data.RollbackParameterTemplate["method"],
                        "rollback": True,
                        "parameter": loop_parameter,

                        "response": err.reason,
                        "rollback_response": Rollback_BackResponse,
                        "error": True
                    }
                    task = await task_collection.insert_one(taskCollection)
                    captured_string = captured_output.getvalue()

                captured_string = captured_output.getvalue()
                return {'status': err.status, "message": err.message, "error": err.reason}

        else:
            try:
                print(f"{dt_string} NEW API CALL")
                API_KEY = data.RollbackParameterTemplate["apiKey"]
                dashboard = meraki.DashboardAPI(
                    API_KEY, output_log=False, print_console=True, suppress_logging=False)
                category = data.RollbackParameterTemplate["category"]
                operationId = data.RollbackParameterTemplate["operationId"]
                rollbackId = operationId.replace("update", "get")
                parameter = data.RollbackParameterTemplate["parameter"]
                usefulParameter = data.RollbackParameterTemplate["usefulParameter"]
                RollbackResponse = {}

                if usefulParameter == "networkId":
                    networkId = parameter["networkId"]
                    RollbackResponse = getattr(
                        getattr(dashboard, category), rollbackId)(networkId)
                    RollbackResponse["networkId"] = networkId
                elif usefulParameter == "serial":
                    serial = parameter["serial"]
                    RollbackResponse = getattr(
                        getattr(dashboard, category), rollbackId)(serial)
                    RollbackResponse["serial"] = serial
                elif usefulParameter == "organizationId":
                    organizationId = parameter["organizationId"]
                    RollbackResponse = getattr(
                        getattr(dashboard, category), rollbackId)(organizationId)
                    RollbackResponse["organizationId"] = organizationId
                else:
                    RollbackResponse = getattr(
                        getattr(dashboard, category), rollbackId)(**parameter)

                print("RollbackResponse: ", RollbackResponse)
                captured_string = captured_output.getvalue()
            except (meraki.APIError, TypeError) as err:
                if TypeError:

                    print(f'args = {err.args}')
                    captured_string = captured_output.getvalue()
                    taskCollection = {"task_name": operationId,
                                      "start_time": dt_string,
                                      "organization": organization,
                                      "usefulParameter": usefulParameter,
                                      "category": category,
                                      "method": data.RollbackParameterTemplate["method"],
                                      "rollback": True,
                                      "parameter": parameter,

                                      "response": err.args,
                                      "rollback_response": RollbackResponse,
                                      "error": True
                                      }
                    task = await task_collection.insert_one(taskCollection)
                    return {"error": err.args}
                else:
                    print(f'status code = {err.status}')
                    print(f'reason = {err.reason}')
                    print(f'error = {err.message}')
                    captured_string = captured_output.getvalue()
                    taskCollection = {"task_name": operationId,
                                      "start_time": dt_string,
                                      "organization": organization,
                                      "usefulParameter": usefulParameter,
                                      "category": category,
                                      "method": data.RollbackParameterTemplate["method"],
                                      "rollback": True,
                                      "parameter": parameter,

                                      "response": err.reason,
                                      "rollback_response": RollbackResponse,
                                      "error": True
                                      }
                    task = await task_collection.insert_one(taskCollection)

                captured_string = captured_output.getvalue()
                return {'status': err.status, "message": err.message, "error": err.reason}

            try:
                print(f"{dt_string} NEW API CALL")
                API_KEY = data.RollbackParameterTemplate["apiKey"]
                dashboard = meraki.DashboardAPI(
                    API_KEY, output_log=False, print_console=True, suppress_logging=False)
                category = data.RollbackParameterTemplate["category"]
                operationId = data.RollbackParameterTemplate["operationId"]
                parameter = data.RollbackParameterTemplate["parameter"]
                # remove null/None parameter if any
                for key, value in parameter.copy().items():
                    if value == None:
                        parameter.pop(key)

                result = getattr(getattr(dashboard, category),
                                 operationId)(**parameter)
                print(result)
                captured_string = captured_output.getvalue()
                taskCollection = {
                    "task_name": operationId,
                    "start_time": dt_string,
                    "organization": organization,
                    "usefulParameter": usefulParameter,
                    "category": category,
                    "method": data.RollbackParameterTemplate["method"],
                    "rollback": True,
                    "parameter": parameter,

                    "response": result,
                    "rollback_response": RollbackResponse,
                    "error": False
                }
                task = await task_collection.insert_one(taskCollection)
                return result
            except (meraki.APIError, TypeError) as err:
                if TypeError:
                    print(f'args = {err.args}')
                    captured_string = captured_output.getvalue()
                    taskCollection = {
                        "task_name": operationId,
                        "start_time": dt_string,
                        "organization": organization,
                        "usefulParameter": usefulParameter,
                        "category": category,
                        "method": data.RollbackParameterTemplate["method"],
                        "rollback": True,
                        "parameter": parameter,

                        "response": err.args,
                        "rollback_response": RollbackResponse,
                        "error": True
                    }
                    task = await task_collection.insert_one(taskCollection)
                    return {"error": err.args}
                else:
                    print(f'status code = {err.status}')
                    print(f'reason = {err.reason}')
                    print(f'error = {err.message}')
                    taskCollection = {
                        "task_name": operationId,
                        "start_time": dt_string,
                        "organization": organization,
                        "usefulParameter": usefulParameter,
                        "category": category,
                        "method": data.RollbackParameterTemplate["method"],
                        "rollback": True,
                        "parameter": parameter,

                        "response": err.reason,
                        "rollback_response": RollbackResponse,
                        "error": True
                    }
                    task = await task_collection.insert_one(taskCollection)
                    captured_string = captured_output.getvalue()

                captured_string = captured_output.getvalue()
                return {'status': err.status, "message": err.message, "error": err.reason}
