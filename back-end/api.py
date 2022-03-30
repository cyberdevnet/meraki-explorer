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
		except meraki.APIError as err:
			print('Error: ', err)
			# error = (err.message['errors'][0])
			error = err.message
			print(error)
			captured_string = captured_output.getvalue()
			return {'status': err.status, "message": err.message, "error": error["errors"] }

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
		except meraki.APIError as err:
			print('Error: ', err)
			# error = (err.message['errors'][0])
			error = err.message
			print(error)
			captured_string = captured_output.getvalue()
			return {'status': err.status, "message": err.message, "error": error["errors"] }


@app.post("/ApiCall", tags=["ApiCall"])
async def ApiCall(data: ApiCallData):
	captured_output = io.StringIO()
	global captured_string
	dt_string = now.strftime("%d-%m-%Y %H:%M:%S")
	if data.isLoopModeActive == False:
		if data.useJsonBody == False:
			with redirect_stdout(captured_output), redirect_stderr(captured_output):
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
					return result
				except meraki.APIError as err:
					print('Error: ', err)
					error = err.message
					print(error)
					captured_string = captured_output.getvalue()
					return {'status': err.status, "message": err.message, "error": error }
		elif data.useJsonBody == True:
			with redirect_stdout(captured_output), redirect_stderr(captured_output):
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
				except meraki.APIError as err:
					print('Error: ', err)
					error = err.message
					print(error)
					captured_string = captured_output.getvalue()
					return {'status': err.status, "message": err.message, "error": error }

	elif data.isLoopModeActive == True:
		if data.useJsonBody == False:
			if data.usefulParameter == "networkId":
				with redirect_stdout(captured_output), redirect_stderr(captured_output):
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

						category = data.responsePrefixes["category"]
						operationId = data.responsePrefixes["operationId"]
						parameter = data.ParameterTemplate

						#remove networkId because already passed in the loop, keep other parameters
						parameter.pop("networkId")
						print("parameter",parameter )



						NetworkList = data.networksIDSelected
						NetworkResults = []
						for networkId in NetworkList:

				
							result = getattr(getattr(dashboard, category), operationId)(networkId,**parameter)
							print(result)
							NetworkResults.append(result)
							captured_string = captured_output.getvalue()
						return NetworkResults


					except meraki.APIError as err:
						print('Error: ', err)
						# error = (err.message['errors'][0])
						error = err.message
						print(error)
						captured_string = captured_output.getvalue()
						return {'status': err.status, "message": err.message, "error": error }

			elif data.usefulParameter == "serial":
				with redirect_stdout(captured_output), redirect_stderr(captured_output):
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

						category = data.responsePrefixes["category"]
						operationId = data.responsePrefixes["operationId"]
						parameter = data.ParameterTemplate
						
						#remove serial because already passed in the loop, keep other parameters
						parameter.pop("serial")
						print("parameter",parameter )

						DevicesList = data.devicesIDSelected
						DeviceResults = []
						for serial in DevicesList:
							result = getattr(getattr(dashboard, category), operationId)(serial,**parameter)
							print(result)
							DeviceResults.append(result)
							captured_string = captured_output.getvalue()
						return DeviceResults
						

					except meraki.APIError as err:
						print('Error: ', err)
						error = err.message
						print(error)
						captured_string = captured_output.getvalue()
						return {'status': err.status, "message": err.message, "error": error }
		elif data.useJsonBody == True:
			if data.usefulParameter == "networkId":
				with redirect_stdout(captured_output), redirect_stderr(captured_output):
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

						category = data.responsePrefixes["category"]
						operationId = data.responsePrefixes["operationId"]
						parameter = data.ParameterTemplate
						JsonBodyparameter = data.ParameterTemplateJSON
						mixedParameters = {**parameter,**JsonBodyparameter}

						NetworkList = data.networksIDSelected
						NetworkResults = []
						for networkId in NetworkList:

				
							result = getattr(getattr(dashboard, category), operationId)(networkId,**mixedParameters)
							print(result)
							NetworkResults.append(result)
							captured_string = captured_output.getvalue()
						return NetworkResults


					except meraki.APIError as err:
						print('Error: ', err)
						# error = (err.message['errors'][0])
						error = err.message
						print(error)
						captured_string = captured_output.getvalue()
						return {'status': err.status, "message": err.message, "error": error }

			elif data.usefulParameter == "serial":
				with redirect_stdout(captured_output), redirect_stderr(captured_output):
					try:
						print(f"{dt_string} NEW API CALL")
						API_KEY = data.apiKey
						dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

						category = data.responsePrefixes["category"]
						operationId = data.responsePrefixes["operationId"]
						parameter = data.ParameterTemplate
						JsonBodyparameter = data.ParameterTemplateJSON
						mixedParameters = {**parameter,**JsonBodyparameter}


						DevicesList = data.devicesIDSelected
						DeviceResults = []
						for serial in DevicesList:
							result = getattr(getattr(dashboard, category), operationId)(serial,**mixedParameters)
							print(result)
							DeviceResults.append(result)
							captured_string = captured_output.getvalue()
						return DeviceResults
						

					except meraki.APIError as err:
						print('Error: ', err)
						error = err.message
						print(error)
						captured_string = captured_output.getvalue()
						return {'status': err.status, "message": err.message, "error": error }

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