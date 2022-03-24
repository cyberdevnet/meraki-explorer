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



app = FastAPI(debug=True)


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


captured_string = "start logging"

@app.post("/GetOrganizations", tags=["GetOrganizations"])
async def GetOrganizations(data: GetOrganizationsData):
	captured_output = io.StringIO()
	global captured_string
	with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()) as f:
		try:
			API_KEY = data.apiKey
			dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)
			response = dashboard.organizations.getOrganizations()
			captured_string = f.getvalue()
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
	with redirect_stdout(captured_output), redirect_stderr(captured_output):
		try:
			API_KEY = data.apiKey
			dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)
			organizationId = data.organizationId
			networks = dashboard.organizations.getOrganizationNetworks(organizationId,total_pages='all')
			devices = dashboard.organizations.getOrganizationInventoryDevices(organizationId,total_pages='all')
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
	if data.isLoopModeActive == False:
		with redirect_stdout(captured_output), redirect_stderr(captured_output):
			try:
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
				# error = (err.message['errors'][0])
				error = err.message
				print(error)
				captured_string = captured_output.getvalue()
				return {'status': err.status, "message": err.message, "error": error }

	elif data.isLoopModeActive == True:
		if data.usefulParameter == "networkId":
			with redirect_stdout(captured_output), redirect_stderr(captured_output):
				try:
					API_KEY = data.apiKey
					dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

					category = data.responsePrefixes["category"]
					operationId = data.responsePrefixes["operationId"]
					parameter = data.ParameterTemplate



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
					API_KEY = data.apiKey
					dashboard = meraki.DashboardAPI(API_KEY, output_log=False,print_console=True,suppress_logging=False)

					category = data.responsePrefixes["category"]
					operationId = data.responsePrefixes["operationId"]
					parameter = data.ParameterTemplate



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
				# logFile.write(f'\n{captured_string}')
		
		except Exception as e:
			print('error:', e)
			break
	print('Bye..')