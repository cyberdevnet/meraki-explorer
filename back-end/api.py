from fastapi import Body, FastAPI, File, UploadFile,WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import Optional
import os
import json
import importlib
from pydantic import BaseModel
from pathlib import Path
import meraki
from  contextlib import redirect_stdout, redirect_stderr
import io
from datetime import datetime
import motor.motor_asyncio
from bson.objectid import ObjectId
from fastapi.encoders import jsonable_encoder





app = FastAPI(debug=True)
now = datetime.now()

origins = [
    "http://localhost:3000",
    "localhost:3000",
    "http://127.0.0.1:3000",
    "127.0.0.1:3000"
]



app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)



# Initializing MONGODB DataBase


MONGO_DETAILS = "mongodb://localhost:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

database = client.merakiExplorerDB

rollback_collection = database.get_collection("rollback_collection")
task_collection = database.get_collection("task_collection")



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
	ParameterTemplateJSON: dict
	responsePrefixes: dict
	isLoopModeActive: bool
	useJsonBody: bool
	networksIDSelected: list
	devicesIDSelected: list
	usefulParameter: str
	isRollbackActive: bool
	method: str

# =========================================================================
# =========================================================================






@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to Meraki Explorer."}




captured_string = "start logging"

@app.post("/GetOrganizations", tags=["GetOrganizations"])
async def GetOrganizations(data: GetOrganizationsData):
	captured_output = io.StringIO()
	global captured_string
	dt_string = now.strftime("%d-%m-%Y %H:%M:%S")
	with redirect_stdout(captured_output), redirect_stderr(captured_output):
		try:
			print(f"{dt_string} NEW API CALL")
			API_KEY = data.apiKey
			dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)
			response = dashboard.organizations.getOrganizations()
			print(response)
			captured_string = captured_output.getvalue()
			return response
		except (meraki.APIError ,TypeError) as err:
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
			return {'status': err.status, "message": err.message,"error" : err.reason}

@app.post("/GetNetworksAndDevices", tags=["GetNetworksAndDevices"])
async def GetNetworksAndDevices(data: GetNetworksAndDevicesData):
	captured_output = io.StringIO()
	global captured_string
	dt_string = now.strftime("%d-%m-%Y %H:%M:%S")
	with redirect_stdout(captured_output), redirect_stderr(captured_output):
		try:
			print(f"{dt_string} NEW API CALL")
			API_KEY = data.apiKey
			dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)
			organizationId = data.organizationId
			networks = dashboard.organizations.getOrganizationNetworks(organizationId,total_pages='all')
			devices = dashboard.organizations.getOrganizationInventoryDevices(organizationId,total_pages='all')
			print(networks)
			print(devices)
			captured_string = captured_output.getvalue()
			return {"networks": networks,"devices":devices}
		except (meraki.APIError ,TypeError) as err:
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
			return {'status': err.status, "message": err.message,"error" : err.reason}

@app.post("/ApiCall", tags=["ApiCall"])
async def ApiCall(data: ApiCallData):
	now = datetime.now()
	captured_output = io.StringIO()
	global captured_string
	dt_string = now.strftime("%d-%m-%Y %H:%M:%S")
	if data.isLoopModeActive == False:
		if data.useJsonBody == False:
			with redirect_stdout(captured_output), redirect_stderr(captured_output):
				if data.isRollbackActive == True:
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)
						category = data.responsePrefixes["category"]
						rollbackId = data.responsePrefixes["rollbackId"]
						RollbackResponse = {}
						if data.usefulParameter == "networkId":
							networkId = data.ParameterTemplate["networkId"]
							RollbackResponse = getattr(getattr(dashboard, category), rollbackId)(networkId)
						elif data.usefulParameter == "serial":
							serial = data.ParameterTemplate["serial"]
							RollbackResponse = getattr(getattr(dashboard, category), rollbackId)(serial)
						else:
							RollbackResponse = getattr(getattr(dashboard, category), rollbackId)(**data.ParameterTemplate)
						captured_string = captured_output.getvalue()
						rollback = await rollback_collection.insert_one(RollbackResponse)
						print(RollbackResponse)
					except (meraki.APIError ,TypeError) as err:
						if TypeError:
							print(f'args = {err.args}')
							captured_string = captured_output.getvalue()
							taskCollection = {
											"task_name": rollbackId, 
											"start_time": now, 
											"method": data.method, 
											"rollback": data.isRollbackActive, 
											"parameter": "", 
											"loop":data.isLoopModeActive, 
											"response" : err.args, 
											"rollback_response" : RollbackResponse,
											"error" :True
												}
							task = await task_collection.insert_one(taskCollection)
							return {"error": err.args}
						else:
							print(f'status code = {err.status}')
							print(f'reason = {err.reason}')
							print(f'error = {err.message}')
							taskCollection = {
											"task_name": rollbackId, 
											"start_time": now, 
											"method": data.method, 
											"rollback": data.isRollbackActive, 
											"parameter": "", 
											"loop":data.isLoopModeActive, 
											"response" : err.reason, 
											"rollback_response" : rollback_response,
											"error" :True
												}
							task = await task_collection.insert_one(taskCollection)
							captured_string = captured_output.getvalue()
						
						captured_string = captured_output.getvalue()
						return {'status': err.status, "message": err.message,"error" : err.reason}
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)
						category = data.responsePrefixes["category"]
						operationId = data.responsePrefixes["operationId"]
						parameter = data.ParameterTemplate
						result = getattr(getattr(dashboard, category), operationId)(**parameter)
						print(result)
						captured_string = captured_output.getvalue()
						taskCollection = {
										"task_name": operationId, 
										"start_time": now, 
										"method": data.method, 
										"rollback": data.isRollbackActive, 
										"parameter": parameter, 
										"loop":data.isLoopModeActive, 
										"response" : result, 
										"rollback_response" : RollbackResponse,
										"error" :False
											}
						task = await task_collection.insert_one(taskCollection)
						return result
					except (meraki.APIError ,TypeError) as err:
						if TypeError:
							print(f'args = {err.args}')
							captured_string = captured_output.getvalue()
							taskCollection = {
											"task_name": operationId, 
											"start_time": now, 
											"method": data.method, 
											"rollback": data.isRollbackActive, 
											"parameter": parameter, 
											"loop":data.isLoopModeActive, 
											"response" : err.args, 
											"rollback_response" : RollbackResponse,
											"error" :True
												}
							task = await task_collection.insert_one(taskCollection)
							return {"error": err.args}
						else:
							print(f'status code = {err.status}')
							print(f'reason = {err.reason}')
							print(f'error = {err.message}')
							taskCollection = {
											"task_name": operationId, 
											"start_time": now, 
											"method": data.method, 
											"rollback": data.isRollbackActive, 
											"parameter": parameter, 
											"loop":data.isLoopModeActive, 
											"response" : err.reason, 
											"rollback_response" : RollbackResponse,
											"error" :True
												}
							task = await task_collection.insert_one(taskCollection)
							captured_string = captured_output.getvalue()
						
						captured_string = captured_output.getvalue()
						return {'status': err.status, "message": err.message,"error" : err.reason}
				elif data.isRollbackActive == False:
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)
						category = data.responsePrefixes["category"]
						operationId = data.responsePrefixes["operationId"]
						parameter = data.ParameterTemplate
						result = getattr(getattr(dashboard, category), operationId)(**parameter)
						print(result)
						captured_string = captured_output.getvalue()
						taskCollection = {"task_name": operationId, "start_time": now, "method": data.method, "rollback": data.isRollbackActive, "parameter":parameter , "loop":data.isLoopModeActive, "response": result, "error":False}
						task = await task_collection.insert_one(taskCollection)
						return result
					except (meraki.APIError ,TypeError) as err:
						if TypeError:
							print(f'args = {err.args}')
							captured_string = captured_output.getvalue()
							taskCollection = {"task_name": operationId, "start_time": now, "method": data.method, "rollback": data.isRollbackActive, "parameter":parameter , "loop":data.isLoopModeActive, "response": err.args, "error": True}
							task = await task_collection.insert_one(taskCollection)
							return {"error": err.args}
						else:
							print(f'status code = {err.status}')
							print(f'reason = {err.reason}')
							print(f'error = {err.message}')
							captured_string = captured_output.getvalue()
							taskCollection = {"task_name": operationId, "start_time": now, "method": data.method, "rollback": data.isRollbackActive, "parameter":parameter , "loop":data.isLoopModeActive, "response": err.reason, "error": True}
							task = await task_collection.insert_one(taskCollection)
						
						captured_string = captured_output.getvalue()
						return {'status': err.status, "message": err.message,"error" : err.reason}

		elif data.useJsonBody == True:
			with redirect_stdout(captured_output), redirect_stderr(captured_output):
				if data.isRollbackActive == True:
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)
						category = data.responsePrefixes["category"]
						rollbackId = data.responsePrefixes["rollbackId"]
						parameter = data.ParameterTemplate
						JsonBodyparameter = data.ParameterTemplateJSON
						RollbackResponse = {}
						if data.usefulParameter == "networkId":
							networkId = data.ParameterTemplate["networkId"]
							RollbackResponse = getattr(getattr(dashboard, category), rollbackId)(networkId)
						elif data.usefulParameter == "serial":
							serial = data.ParameterTemplate["serial"]
							RollbackResponse = getattr(getattr(dashboard, category), rollbackId)(serial)
						else:
							RollbackResponse = getattr(getattr(dashboard, category), rollbackId)(**data.ParameterTemplate)

						rollback = await rollback_collection.insert_one(RollbackResponse)
						captured_string = captured_output.getvalue()
						print(RollbackResponse)
					except (meraki.APIError ,TypeError) as err:
						if TypeError:
							print(f'args = {err.args}')
							captured_string = captured_output.getvalue()
							taskCollection = {
											"task_name": rollbackId, 
											"start_time": now, 
											"method": data.method, 
											"rollback": data.isRollbackActive, 
											"parameter": "", 
											"loop":data.isLoopModeActive, 
											"response" : err.args, 
											"rollback_response" : RollbackResponse,
											"error" :True
												}
							task = await task_collection.insert_one(taskCollection)
							return {"error": err.args}
						else:
							print(f'status code = {err.status}')
							print(f'reason = {err.reason}')
							print(f'error = {err.message}')
							taskCollection = {
											"task_name": rollbackId, 
											"start_time": now, 
											"method": data.method, 
											"rollback": data.isRollbackActive, 
											"parameter": "", 
											"loop":data.isLoopModeActive, 
											"response" : err.reason, 
											"rollback_response" : result,
											"error" :True
												}
							task = await task_collection.insert_one(taskCollection)
							captured_string = captured_output.getvalue()
						
						captured_string = captured_output.getvalue()
						return {'status': err.status, "message": err.message,"error" : err.reason}
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)
						category = data.responsePrefixes["category"]
						operationId = data.responsePrefixes["operationId"]
						parameter = data.ParameterTemplate
						JsonBodyparameter = data.ParameterTemplateJSON
						mixedParameters = {**parameter,**JsonBodyparameter}
						result = getattr(getattr(dashboard, category), operationId)(**mixedParameters)
						print(result)
						captured_string = captured_output.getvalue()
						taskCollection = {
										"task_name": operationId, 
										"start_time": now, 
										"method": data.method, 
										"rollback": data.isRollbackActive, 
										"parameter": parameter, 
										"loop":data.isLoopModeActive, 
										"response" : result, 
										"rollback_response" : RollbackResponse,
										"error" :False
											}
						task = await task_collection.insert_one(taskCollection)
						return result
					except (meraki.APIError ,TypeError) as err:
						if TypeError:
							print(f'args = {err.args}')
							captured_string = captured_output.getvalue()
							taskCollection = {
											"task_name": operationId, 
											"start_time": now, 
											"method": data.method, 
											"rollback": data.isRollbackActive, 
											"parameter": parameter, 
											"loop":data.isLoopModeActive, 
											"response" : err.args, 
											"rollback_response" : RollbackResponse,
											"error" :True
												}
							task = await task_collection.insert_one(taskCollection)
							return {"error": err.args}
						else:
							print(f'status code = {err.status}')
							print(f'reason = {err.reason}')
							print(f'error = {err.message}')
							taskCollection = {
											"task_name": operationId, 
											"start_time": now, 
											"method": data.method, 
											"rollback": data.isRollbackActive, 
											"parameter": parameter, 
											"loop":data.isLoopModeActive, 
											"response" : err.reason, 
											"rollback_response" : RollbackResponse,
											"error" :True
												}
							task = await task_collection.insert_one(taskCollection)
							captured_string = captured_output.getvalue()
						
						captured_string = captured_output.getvalue()
						return {'status': err.status, "message": err.message,"error" : err.reason}
				elif data.isRollbackActive == False:
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)
						category = data.responsePrefixes["category"]
						operationId = data.responsePrefixes["operationId"]
						parameter = data.ParameterTemplate
						JsonBodyparameter = data.ParameterTemplateJSON
						mixedParameters = {**parameter,**JsonBodyparameter}
						result = getattr(getattr(dashboard, category), operationId)(**mixedParameters)
						print(result)
						captured_string = captured_output.getvalue()
						return result
					except (meraki.APIError ,TypeError) as err:
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
						return {'status': err.status, "message": err.message,"error" : err.reason}

	elif data.isLoopModeActive == True:
		if data.useJsonBody == False:
			if data.usefulParameter == "networkId":
				if data.isRollbackActive == True:
					with redirect_stdout(captured_output), redirect_stderr(captured_output):
						try:
							print(f"{dt_string} NEW API CALL")
							API_KEY = data.apiKey
							dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

							category = data.responsePrefixes["category"]
							rollbackId = data.responsePrefixes["rollbackId"]
							NetworkList = data.networksIDSelected
							NetworkResults = []
							RollbackResponse = []
							for networkId in NetworkList:
								result = getattr(getattr(dashboard, category), rollbackId)(networkId)
								rollback = await rollback_collection.insert_one(result)
								RollbackResponse.append(result)
								print(result)
								NetworkResults.append(result)
								captured_string = captured_output.getvalue()

							print(NetworkResults)

						except (meraki.APIError ,TypeError) as err:
							if TypeError:
								print(f'args = {err.args}')
								captured_string = captured_output.getvalue()
								taskCollection = {
												"task_name": rollbackId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": "", 
												"loop":data.isLoopModeActive, 
												"response" : err.args, 
												"rollback_response" : RollbackResponse,
												"error" :True
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
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": "", 
												"loop":data.isLoopModeActive, 
												"response" : err.reason, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
							
							captured_string = captured_output.getvalue()
							return {'status': err.status, "message": err.message,"error" : err.reason}
								
						try:
							print(f"{dt_string} NEW API CALL")
							API_KEY = data.apiKey
							dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

							category = data.responsePrefixes["category"]
							operationId = data.responsePrefixes["operationId"]
							parameter = data.ParameterTemplate

							#remove networkId because already passed in the loop, keep other parameters
							parameter.pop("networkId")
							NetworkList = data.networksIDSelected
							NetworkResults = []
							loop_parameter = []
							for networkId in NetworkList:
								result = getattr(getattr(dashboard, category), operationId)(networkId,**parameter)
								loop_parameter.append(networkId,**parameter)
								print(result)
								NetworkResults.append(result)
								captured_string = captured_output.getvalue()
							taskCollection = {
											"task_name": operationId, 
											"start_time": now, 
											"method": data.method, 
											"rollback": data.isRollbackActive, 
											"parameter": loop_parameter, 
											"loop":data.isLoopModeActive, 
											"response" : NetworkResults, 
											"rollback_response" : RollbackResponse,
											"error" :False
												}
							task = await task_collection.insert_one(taskCollection)

							return NetworkResults

						except (meraki.APIError ,TypeError) as err:
							if TypeError:
								print(f'args = {err.args}')
								captured_string = captured_output.getvalue()
								taskCollection = {
												"task_name": operationId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": loop_parameter, 
												"loop":data.isLoopModeActive, 
												"response" : err.args, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
								return {"error": err.args}
							else:
								print(f'status code = {err.status}')
								print(f'reason = {err.reason}')
								print(f'error = {err.message}')
								taskCollection = {
												"task_name": operationId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": loop_parameter, 
												"loop":data.isLoopModeActive, 
												"response" : err.reason, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
								captured_string = captured_output.getvalue()
							
							captured_string = captured_output.getvalue()
							return {'status': err.status, "message": err.message,"error" : err.reason}
				elif data.isRollbackActive == False:
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

						category = data.responsePrefixes["category"]
						operationId = data.responsePrefixes["operationId"]
						parameter = data.ParameterTemplate

						#remove networkId because already passed in the loop, keep other parameters
						parameter.pop("networkId")
						NetworkList = data.networksIDSelected
						NetworkResults = []
						loop_parameter = []
						for networkId in NetworkList:
							result = getattr(getattr(dashboard, category), operationId)(networkId,**parameter)
							loop_parameter.append(networkId,**parameter)
							print(result)
							NetworkResults.append(result)
							captured_string = captured_output.getvalue()

						taskCollection = {"task_name": operationId, "start_time": now, "method": data.method, "rollback": data.isRollbackActive, "parameter": loop_parameter, "loop":data.isLoopModeActive, "response" : NetworkResults, "error" :False }
						task = await task_collection.insert_one(taskCollection)

						return NetworkResults

					except (meraki.APIError ,TypeError) as err:
						if TypeError:
							print(f'args = {err.args}')
							captured_string = captured_output.getvalue()
							taskCollection = {"task_name": operationId, "start_time": now, "method": data.method, "rollback": data.isRollbackActive, "parameter":loop_parameter , "loop":data.isLoopModeActive, "response" : err.args , "error": True}
							task = await task_collection.insert_one(taskCollection)
							return {"error": err.args}
						else:
							print(f'status code = {err.status}')
							print(f'reason = {err.reason}')
							print(f'error = {err.message}')
							taskCollection = {"task_name": operationId, "start_time": now, "method": data.method, "rollback": data.isRollbackActive, "parameter":loop_parameter , "loop":data.isLoopModeActive, "response" : err.reason , "error": True}
							task = await task_collection.insert_one(taskCollection)
							captured_string = captured_output.getvalue()
						
						captured_string = captured_output.getvalue()
						return {'status': err.status, "message": err.message,"error" : err.reason}

			elif data.usefulParameter == "serial":
				if data.isRollbackActive == True:
					with redirect_stdout(captured_output), redirect_stderr(captured_output):
						try:
							print(f"{dt_string} NEW API CALL")
							API_KEY = data.apiKey
							dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

							category = data.responsePrefixes["category"]
							rollbackId = data.responsePrefixes["rollbackId"]
							DevicesList = data.devicesIDSelected
							DeviceResults = []
							RollbackResponse = []
							for serial in DevicesList:
								result = getattr(getattr(dashboard, category), rollbackId)(serial)
								rollback = await rollback_collection.insert_one(result)
								RollbackResponse.append(result)
								print(result)
								DeviceResults.append(result)
								captured_string = captured_output.getvalue()
							print(DeviceResults)
							

						except (meraki.APIError ,TypeError) as err:
							if TypeError:
								print(f'args = {err.args}')
								captured_string = captured_output.getvalue()
								taskCollection = {
												"task_name": rollbackId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": "", 
												"loop":data.isLoopModeActive, 
												"response" : err.args, 
												"rollback_response" : RollbackResponse,
												"error" :True
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
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": "", 
												"loop":data.isLoopModeActive, 
												"response" : err.reason, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
							
							captured_string = captured_output.getvalue()
							return {'status': err.status, "message": err.message,"error" : err.reason}
						try:
							print(f"{dt_string} NEW API CALL")
							API_KEY = data.apiKey
							dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

							category = data.responsePrefixes["category"]
							operationId = data.responsePrefixes["operationId"]
							parameter = data.ParameterTemplate
							
							#remove serial because already passed in the loop, keep other parameters
							parameter.pop("serial")
							

							DevicesList = data.devicesIDSelected
							DeviceResults = []
							loop_parameter = []
							for serial in DevicesList:
								result = getattr(getattr(dashboard, category), operationId)(serial,**parameter)
								loop_parameter.append(serial,**parameter)
								print(result)
								DeviceResults.append(result)
								captured_string = captured_output.getvalue()
							taskCollection = {
											"task_name": operationId, 
											"start_time": now, 
											"method": data.method, 
											"rollback": data.isRollbackActive, 
											"parameter": loop_parameter, 
											"loop":data.isLoopModeActive, 
											"response" : DeviceResults, 
											"rollback_response" : RollbackResponse,
											"error" :False
												}
							task = await task_collection.insert_one(taskCollection)
							return DeviceResults
							

						except (meraki.APIError ,TypeError) as err:
							if TypeError:
								print(f'args = {err.args}')
								captured_string = captured_output.getvalue()
								taskCollection = {
												"task_name": operationId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": loop_parameter, 
												"loop":data.isLoopModeActive, 
												"response" : err.args, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
								return {"error": err.args}
							else:
								print(f'status code = {err.status}')
								print(f'reason = {err.reason}')
								print(f'error = {err.message}')
								taskCollection = {
												"task_name": operationId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": loop_parameter, 
												"loop":data.isLoopModeActive, 
												"response" : err.reason, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
								captured_string = captured_output.getvalue()
							
							captured_string = captured_output.getvalue()
							return {'status': err.status, "message": err.message,"error" : err.reason}
				elif data.isRollbackActive == False:
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

						category = data.responsePrefixes["category"]
						operationId = data.responsePrefixes["operationId"]
						parameter = data.ParameterTemplate
						
						#remove serial because already passed in the loop, keep other parameters
						parameter.pop("serial")
						

						DevicesList = data.devicesIDSelected
						DeviceResults = []
						loop_parameter = []
						for serial in DevicesList:
							result = getattr(getattr(dashboard, category), operationId)(serial,**parameter)
							loop_parameter.append(serial,**parameter)
							print(result)
							DeviceResults.append(result)
							captured_string = captured_output.getvalue()
						taskCollection = {"task_name": operationId, "start_time": now, "method": data.method, "rollback": data.isRollbackActive, "parameter": loop_parameter, "loop":data.isLoopModeActive, "response" : DeviceResults, "error" :False }
						task = await task_collection.insert_one(taskCollection)
						return DeviceResults
						

					except (meraki.APIError ,TypeError) as err:
						if TypeError:
							print(f'args = {err.args}')
							captured_string = captured_output.getvalue()
							taskCollection = {"task_name": operationId, "start_time": now, "method": data.method, "rollback": data.isRollbackActive, "parameter":loop_parameter , "loop":data.isLoopModeActive, "response" : err.args , "error": True}
							task = await task_collection.insert_one(taskCollection)
							return {"error": err.args}
						else:
							print(f'status code = {err.status}')
							print(f'reason = {err.reason}')
							print(f'error = {err.message}')
							captured_string = captured_output.getvalue()
							taskCollection = {"task_name": operationId, "start_time": now, "method": data.method, "rollback": data.isRollbackActive, "parameter":loop_parameter , "loop":data.isLoopModeActive, "response" : err.reason, "error" :True }
							task = await task_collection.insert_one(taskCollection)
						
						captured_string = captured_output.getvalue()
						return {'status': err.status, "message": err.message,"error" : err.reason}
		elif data.useJsonBody == True:
			if data.usefulParameter == "networkId":
				if data.isRollbackActive == True:
					with redirect_stdout(captured_output), redirect_stderr(captured_output):
						try:
							print(f"{dt_string} NEW API CALL")
							API_KEY = data.apiKey
							dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

							category = data.responsePrefixes["category"]
							operationId = data.responsePrefixes["operationId"]
							rollbackId = data.responsePrefixes["rollbackId"]

							NetworkList = data.networksIDSelected
							NetworkResults = []
							RollbackResponse = []
							for networkId in NetworkList:

					
								result = getattr(getattr(dashboard, category), rollbackId)(networkId)
								rollback = await rollback_collection.insert_one(result)
								RollbackResponse.append(result)
								print(result)
								NetworkResults.append(result)
								captured_string = captured_output.getvalue()
							print (NetworkResults)


						except (meraki.APIError ,TypeError) as err:
							if TypeError:
								print(f'args = {err.args}')
								captured_string = captured_output.getvalue()
								taskCollection = {
												"task_name": rollbackId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": "", 
												"loop":data.isLoopModeActive, 
												"response" : err.args, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
								return {"error": err.args}
							else:
								print(f'status code = {err.status}')
								print(f'reason = {err.reason}')
								print(f'error = {err.message}')
								taskCollection = {
												"task_name": rollbackId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": "", 
												"loop":data.isLoopModeActive, 
												"response" : err.reason, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
								captured_string = captured_output.getvalue()
							
							captured_string = captured_output.getvalue()
							return {'status': err.status, "message": err.message,"error" : err.reason}
						try:
							print(f"{dt_string} NEW API CALL")
							API_KEY = data.apiKey
							dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

							category = data.responsePrefixes["category"]
							operationId = data.responsePrefixes["operationId"]
							parameter = data.ParameterTemplate
							JsonBodyparameter = data.ParameterTemplateJSON
							mixedParameters = {**parameter,**JsonBodyparameter}
							#remove serial because already passed in the loop, keep other parameters
							mixedParameters.pop("networkId")

							NetworkList = data.networksIDSelected
							NetworkResults = []
							loop_parameter = []
							for networkId in NetworkList:

					
								result = getattr(getattr(dashboard, category), operationId)(networkId,**mixedParameters)
								loop_parameter.append(networkId,**mixedParameters)
								print(result)
								NetworkResults.append(result)
								captured_string = captured_output.getvalue()
							taskCollection = {
											"task_name": operationId, 
											"start_time": now, 
											"method": data.method, 
											"rollback": data.isRollbackActive, 
											"parameter": loop_parameter, 
											"loop":data.isLoopModeActive, 
											"response" : NetworkResults, 
											"rollback_response" : RollbackResponse,
											"error" :False
							 					}
							task = await task_collection.insert_one(taskCollection)
							return NetworkResults


						except (meraki.APIError ,TypeError) as err:
							if TypeError:
								print(f'args = {err.args}')
								captured_string = captured_output.getvalue()
								taskCollection = {
												"task_name": operationId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": loop_parameter, 
												"loop":data.isLoopModeActive, 
												"response" : err.args, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
								return {"error": err.args}
							else:
								print(f'status code = {err.status}')
								print(f'reason = {err.reason}')
								print(f'error = {err.message}')
								taskCollection = {
												"task_name": operationId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": loop_parameter, 
												"loop":data.isLoopModeActive, 
												"response" : err.reason, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
								captured_string = captured_output.getvalue()
							
							captured_string = captured_output.getvalue()
							return {'status': err.status, "message": err.message,"error" : err.reason}
				elif data.isRollbackActive == False:
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

						category = data.responsePrefixes["category"]
						operationId = data.responsePrefixes["operationId"]
						parameter = data.ParameterTemplate
						JsonBodyparameter = data.ParameterTemplateJSON
						mixedParameters = {**parameter,**JsonBodyparameter}
						#remove serial because already passed in the loop, keep other parameters
						mixedParameters.pop("networkId")

						NetworkList = data.networksIDSelected
						NetworkResults = []
						for networkId in NetworkList:

				
							result = getattr(getattr(dashboard, category), operationId)(networkId,**mixedParameters)
							print(result)
							NetworkResults.append(result)
							captured_string = captured_output.getvalue()
						return NetworkResults


					except (meraki.APIError ,TypeError) as err:
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
						return {'status': err.status, "message": err.message,"error" : err.reason}

			elif data.usefulParameter == "serial":
				if data.isRollbackActive == True:
					with redirect_stdout(captured_output), redirect_stderr(captured_output):
						try:
							print(f"{dt_string} NEW API CALL")
							API_KEY = data.apiKey
							dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

							category = data.responsePrefixes["category"]
							rollbackId = data.responsePrefixes["rollbackId"]

							DevicesList = data.devicesIDSelected
							RollbackResponse = []
							for serial in DevicesList:
								result = getattr(getattr(dashboard, category), rollbackId)(serial)
								rollback = await rollback_collection.insert_one(result)
								print(result)
								RollbackResponse.append(result)
								captured_string = captured_output.getvalue()
							print(RollbackResponse)

						except (meraki.APIError ,TypeError) as err:
							if TypeError:
								print(f'args = {err.args}')
								captured_string = captured_output.getvalue()
								taskCollection = {
												"task_name": rollbackId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": "", 
												"loop":data.isLoopModeActive, 
												"response" : err.args, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
								return {"error": err.args}
							else:
								print(f'status code = {err.status}')
								print(f'reason = {err.reason}')
								print(f'error = {err.message}')
								taskCollection = {
												"task_name": rollbackId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": "", 
												"loop":data.isLoopModeActive, 
												"response" : err.reason, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
								captured_string = captured_output.getvalue()
							
							captured_string = captured_output.getvalue()
							return {'status': err.status, "message": err.message,"error" : err.reason}
						try:
							print(f"{dt_string} NEW API CALL")
							API_KEY = data.apiKey
							dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

							category = data.responsePrefixes["category"]
							operationId = data.responsePrefixes["operationId"]
							parameter = data.ParameterTemplate
							JsonBodyparameter = data.ParameterTemplateJSON
							mixedParameters = {**parameter,**JsonBodyparameter}
							#remove serial because already passed in the loop, keep other parameters
							mixedParameters.pop("serial")
							print(mixedParameters)

							DevicesList = data.devicesIDSelected
							DeviceResults = []
							loop_parameter = []
							for serial in DevicesList:
								result = getattr(getattr(dashboard, category), operationId)(serial,**mixedParameters)
								loop_parameter.append(serial,**mixedParameters)
								print(result)
								DeviceResults.append(result)
								captured_string = captured_output.getvalue()
							taskCollection = {
											"task_name": operationId, 
											"start_time": now, 
											"method": data.method, 
											"rollback": data.isRollbackActive, 
											"parameter": loop_parameter, 
											"loop":data.isLoopModeActive, 
											"response" : DeviceResults, 
											"rollback_response" : RollbackResponse,
											"error" :False
							 					}
							task = await task_collection.insert_one(taskCollection)
							return DeviceResults
							
						except (meraki.APIError ,TypeError) as err:
							if TypeError:
								print(f'args = {err.args}')
								captured_string = captured_output.getvalue()
								taskCollection = {
												"task_name": operationId, 
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": loop_parameter, 
												"loop":data.isLoopModeActive, 
												"response" : err.args, 
												"rollback_response" : RollbackResponse,
												"error" :True
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
												"start_time": now, 
												"method": data.method, 
												"rollback": data.isRollbackActive, 
												"parameter": loop_parameter, 
												"loop":data.isLoopModeActive, 
												"response" : err.reason, 
												"rollback_response" : RollbackResponse,
												"error" :True
													}
								task = await task_collection.insert_one(taskCollection)
							
							captured_string = captured_output.getvalue()
							return {'status': err.status, "message": err.message,"error" : err.reason}
				elif data.isRollbackActive == False:
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)
						
						category = data.responsePrefixes["category"]
						operationId = data.responsePrefixes["operationId"]
						parameter = data.ParameterTemplate
						JsonBodyparameter = data.ParameterTemplateJSON
						mixedParameters = {**parameter,**JsonBodyparameter}
						#remove serial because already passed in the loop, keep other parameters
						mixedParameters.pop("serial")

						DevicesList = data.devicesIDSelected
						DeviceResults = []
						loop_parameter = []
						for serial in DevicesList:
							result = getattr(getattr(dashboard, category), operationId)(serial,**mixedParameters)
							loop_parameter.append(serial,**mixedParameters)
							print(result)
							DeviceResults.append(result)
							captured_string = captured_output.getvalue()
						taskCollection = {"task_name": operationId, "start_time": now, "method": data.method, "rollback": data.isRollbackActive, "parameter": loop_parameter, "loop":data.isLoopModeActive, "response" : DeviceResults, "error" :False }
						task = await task_collection.insert_one(taskCollection)
						return DeviceResults
						

					except (meraki.APIError ,TypeError) as err:
						if TypeError:
							print(f'args = {err.args}')
							captured_string = captured_output.getvalue()
							taskCollection = {"task_name": operationId, "start_time": now, "method": data.method, "rollback": data.isRollbackActive, "parameter": loop_parameter, "loop":data.isLoopModeActive, "response" : err.args, "error" :True }
							task = await task_collection.insert_one(taskCollection)
							return {"error": err.args}
						else:
							print(f'status code = {err.status}')
							print(f'reason = {err.reason}')
							print(f'error = {err.message}')
							taskCollection = {"task_name": operationId, "start_time": now, "method": data.method, "rollback": data.isRollbackActive, "parameter": loop_parameter, "loop":data.isLoopModeActive, "response" : err.reason, "error" :True }
							task = await task_collection.insert_one(taskCollection)
							captured_string = captured_output.getvalue()
						
						captured_string = captured_output.getvalue()
						return {'status': err.status, "message": err.message,"error" : err.reason}


@app.websocket("/ws_global")
async def websocket_endpoint(websocket: WebSocket):
	
	print('Accepting client connection ws_global...')
	await websocket.accept()
	while True:
		try:
			# Wait for any message from the client
			data=await websocket.receive_text()

			
			with open("log.txt") as fp:
			# # Send message to the client
				print("Sending ws_global updates")
				await websocket.send_text(fp)
		
		except Exception as e:
			print('error:', e)
			break
	print('Bye..')


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
	global captured_string
	print('Accepting client connection...')
	await websocket.accept()
	while True:
		try:
			# Wait for any message from the client
			data=await websocket.receive_text()

			# Send message to the client

			print("Sending websocket to front-end")
			await websocket.send_text(captured_string)
			with open("log.txt", "a") as logFile:
				logFile.write(captured_string)
		
		except Exception as e:
			print('error:', e)
			break
	print('Bye..')