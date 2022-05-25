from datetime import datetime
import json
import requests


test_get_GetOrganizations_data = {
    "apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0"}


def test_get_GetOrganizations():
    baseUrl = "http://localhost:8000"
    path = "/GetOrganizations"

    response = requests.post(
        url=baseUrl+path, json=test_get_GetOrganizations_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200


test_get_GetNetworksAndDevices_data = {
    "apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0",
    "organizationId": "681155"

}


def test_get_GetNetworksAndDevices():
    baseUrl = "http://localhost:8000"
    path = "/GetNetworksAndDevices"

    response = requests.post(
        url=baseUrl+path, json=test_get_GetNetworksAndDevices_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200


################## TEST NETWORK ID ROLLBACK ACTIVE ##########################

# ApiCall test 1:
# if data.useJsonBody == False:
# if data.usefulParameter == "networkId":
# if data.isRollbackActive == True:
# 1 network selected PUT method
# should responseJson["response"][0]["status"] == 403
test_put_ApiCall_network_1_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"networkId": "L_566327653141843049", "timeZone": "America/Los_Angeles"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "networks", "operationId": "updateNetwork", "rollbackId": "getNetwork"},
                                   "responseString": "dashboard.networks.updateNetwork(networkId,name,timeZone)", "organizationIDSelected": [], "networksIDSelected": ["L_566327653141843049"], "devicesIDSelected": [], "usefulParameter": "networkId", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["networkId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_network_1():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_network_1_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["response"][0]["status"] == 403


# ApiCall test 2:
# if data.useJsonBody == False:
# if data.usefulParameter == "networkId":
# if data.isRollbackActive == True:
# 2 network selected PUT method
# should responseJson["response"][0]["status"] == 403 on both responses

test_put_ApiCall_network_2_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"networkId": "L_566327653141843049, L_566327653141846927", "timeZone": "America/Los_Angeles"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "networks", "operationId": "updateNetwork", "rollbackId": "getNetwork"},
                                   "responseString": "dashboard.networks.updateNetwork(networkId,timeZone)", "organizationIDSelected": [], "networksIDSelected": ["L_566327653141843049", "L_566327653141846927"], "devicesIDSelected": [], "usefulParameter": "networkId", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["networkId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_network_2():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_network_2_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["response"][0]["status"] == 403
    assert responseJson["response"][1]["status"] == 403


# ApiCall test 3:
# if data.useJsonBody == False:
# if data.usefulParameter == "networkId":
# if data.isRollbackActive == True:
# 1 network selected manually (no form) - PUT method
# should give errors.status 403
test_put_ApiCall_network_3_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"networkId": "L_566327653141843049", "timeZone": "America/Los_Angeles"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "networks", "operationId": "updateNetwork", "rollbackId": "getNetwork"},
                                   "responseString": "dashboard.networks.updateNetwork(networkId,timeZone)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "networkId", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["networkId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_network_3():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_network_3_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"]["status"] == 403


################## TEST NETWORK ID ROLLBACK DISABLED ##########################


# ApiCall test 4:
# if data.useJsonBody == False:
# if data.usefulParameter == "networkId":
# if data.isRollbackActive == False:
# 1 network selected PUT method
# should responseJson["errors"][0]["status"] == 403

test_put_ApiCall_network_4_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"networkId": "L_566327653141843049", "timeZone": "America/Los_Angeles"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "networks", "operationId": "updateNetwork", "rollbackId": "getNetwork"},
                                   "responseString": "dashboard.networks.updateNetwork(networkId,name,timeZone)", "organizationIDSelected": [], "networksIDSelected": ["L_566327653141843049"], "devicesIDSelected": [], "usefulParameter": "networkId", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["networkId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_network_4():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_network_4_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403


# ApiCall test 5:
# if data.useJsonBody == False:
# if data.usefulParameter == "networkId":
# if data.isRollbackActive == False:
# 2 network selected PUT method
# should responseJson["errors"][0]["status"] == 403 on both responses

test_put_ApiCall_network_5_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"networkId": "L_566327653141843049, L_566327653141846927", "timeZone": "America/Los_Angeles"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "networks", "operationId": "updateNetwork", "rollbackId": "getNetwork"},
                                   "responseString": "dashboard.networks.updateNetwork(networkId,timeZone)", "organizationIDSelected": [], "networksIDSelected": ["L_566327653141843049", "L_566327653141846927"], "devicesIDSelected": [], "usefulParameter": "networkId", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["networkId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_network_5():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_network_5_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403
    assert responseJson["errors"][1]["status"] == 403


# ApiCall test 6:
# if data.useJsonBody == False:
# if data.usefulParameter == "networkId":
# if data.isRollbackActive == False:
# 1 network selected manually (no form) - PUT method
# should give errors.status 403
test_put_ApiCall_network_6_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"networkId": "L_566327653141843049", "timeZone": "America/Los_Angeles"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "networks", "operationId": "updateNetwork", "rollbackId": "getNetwork"},
                                   "responseString": "dashboard.networks.updateNetwork(networkId,timeZone)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "networkId", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["networkId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_network_6():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_network_6_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"]["status"] == 403


################## TEST NETWORK ID ROLLBACK ACTIVE JSON BODY ##########################

# ApiCall test 7:
# if data.useJsonBody == True:
# if data.usefulParameter == "networkId":
# if data.isRollbackActive == True:
# 1 network selected PUT method
# should responseJson["response"][0]["status"] == 403
test_put_ApiCall_network_7_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"networkId": "L_566327653141843049"}, "useJsonBody": True, "ParameterTemplateJSON": {"timeZone": "America/Los_Angeles"}, "responsePrefixes": {"dashboard": "dashboard", "category": "networks", "operationId": "updateNetwork", "rollbackId": "getNetwork"},
                                   "responseString": "dashboard.networks.updateNetwork(networkId)", "organizationIDSelected": [], "networksIDSelected": ["L_566327653141843049"], "devicesIDSelected": [], "usefulParameter": "networkId", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["networkId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_network_7():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_network_7_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403


# ApiCall test 8:
# if data.useJsonBody == True:
# if data.usefulParameter == "networkId":
# if data.isRollbackActive == True:
# 2 network selected PUT method
# should responseJson["response"][0]["status"] == 403 on both responses

test_put_ApiCall_network_8_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"networkId": "L_566327653141843049, L_566327653141846927"}, "useJsonBody": True, "ParameterTemplateJSON": {"timeZone": "America/Los_Angeles"}, "responsePrefixes": {"dashboard": "dashboard", "category": "networks", "operationId": "updateNetwork", "rollbackId": "getNetwork"},
                                   "responseString": "dashboard.networks.updateNetwork(networkId)", "organizationIDSelected": [], "networksIDSelected": ["L_566327653141843049", "L_566327653141846927"], "devicesIDSelected": [], "usefulParameter": "networkId", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["networkId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_network_8():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_network_8_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403
    assert responseJson["errors"][1]["status"] == 403


# ApiCall test 9:
# if data.useJsonBody == True:
# if data.usefulParameter == "networkId":
# if data.isRollbackActive == True:
# 1 network selected manually (no form) - PUT method
# should give errors.status 403
test_put_ApiCall_network_9_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"networkId": "L_566327653141843049"}, "useJsonBody": True, "ParameterTemplateJSON": {"timeZone": "America/Los_Angeles"}, "responsePrefixes": {"dashboard": "dashboard", "category": "networks", "operationId": "updateNetwork", "rollbackId": "getNetwork"},
                                   "responseString": "dashboard.networks.updateNetwork(networkId)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "networkId", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["networkId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_network_9():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_network_9_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"]["status"] == 403


################## TEST NETWORK ID ROLLBACK DISABLED JSON BODY ##########################


# ApiCall test 10:
# if data.useJsonBody == True:
# if data.usefulParameter == "networkId":
# if data.isRollbackActive == False:
# 1 network selected PUT method
# should responseJson["errors"][0]["status"] == 403

test_put_ApiCall_network_10_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"networkId": "L_566327653141843049"}, "useJsonBody": True, "ParameterTemplateJSON": {"timeZone": "America/Los_Angeles"}, "responsePrefixes": {"dashboard": "dashboard", "category": "networks", "operationId": "updateNetwork", "rollbackId": "getNetwork"},
                                    "responseString": "dashboard.networks.updateNetwork(networkId)", "organizationIDSelected": [], "networksIDSelected": ["L_566327653141843049"], "devicesIDSelected": [], "usefulParameter": "networkId", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["networkId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_network_10():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_network_10_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403


# ApiCall test 11:
# if data.useJsonBody == True:
# if data.usefulParameter == "networkId":
# if data.isRollbackActive == False:
# 2 network selected PUT method
# should responseJson["errors"][0]["status"] == 403 on both responses

test_put_ApiCall_network_11_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"networkId": "L_566327653141843049, L_566327653141846927"}, "useJsonBody": True, "ParameterTemplateJSON": {"timeZone": "America/Los_Angeles"}, "responsePrefixes": {"dashboard": "dashboard", "category": "networks", "operationId": "updateNetwork", "rollbackId": "getNetwork"},
                                    "responseString": "dashboard.networks.updateNetwork(networkId)", "organizationIDSelected": [], "networksIDSelected": ["L_566327653141843049", "L_566327653141846927"], "devicesIDSelected": [], "usefulParameter": "networkId", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["networkId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_network_11():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_network_11_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403
    assert responseJson["errors"][1]["status"] == 403


# ApiCall test 12:
# if data.useJsonBody == True:
# if data.usefulParameter == "networkId":
# if data.isRollbackActive == False:
# 1 network selected manually (no form) - PUT method
# should give errors.status 403
test_put_ApiCall_network_12_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"networkId": "L_566327653141843049"}, "useJsonBody": True, "ParameterTemplateJSON": {"timeZone": "America/Los_Angeles"}, "responsePrefixes": {"dashboard": "dashboard", "category": "networks", "operationId": "updateNetwork", "rollbackId": "getNetwork"},
                                    "responseString": "dashboard.networks.updateNetwork(networkId)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "networkId", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["networkId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_network_12():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_network_12_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"]["status"] == 403


################## TEST SERIAL ROLLBACK ACTIVE ##########################
# ApiCall test serial 1:
# if data.useJsonBody == False:
# data.usefulParameter == "serial":
# data.isRollbackActive == True:
# 1 device selected PUT method
# should responseJson["errors"][0]["status"] == 403
test_put_ApiCall_serial_1_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"serial": "Q2EK-2LYB-PCZP", "address": "1600 Pennsylvania"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "devices", "operationId": "updateDevice", "rollbackId": "getDevice"},
                                  "responseString": "dashboard.devices.updateDevice(serial,address)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": ["Q2EK-2LYB-PCZP"], "usefulParameter": "serial", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["serial"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_serial_1():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_serial_1_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403


# ApiCall test serial 2:
# if data.useJsonBody == False:
# if data.usefulParameter == "serial":
# if data.isRollbackActive == True:
# 2 serial selected PUT method
# should responseJson["errors"][0]["status"] == 403 on both responses
test_put_ApiCall_serial_2_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"serial": "Q2EK-2LYB-PCZP, Q2EK-3UBE-RRUY", "lat": 1, "lng": 1}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "devices", "operationId": "updateDevice", "rollbackId": "getDevice"},
                                  "responseString": "dashboard.devices.updateDevice(serial,lat,lng)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": ["Q2EK-2LYB-PCZP", "Q2EK-3UBE-RRUY"], "usefulParameter": "serial", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["serial"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_serial_2():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_serial_2_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403
    assert responseJson["errors"][1]["status"] == 403


# ApiCall test serial 3:
# if data.useJsonBody == False:
# if data.usefulParameter == "serial":
# if data.isRollbackActive == True:
# 1 serial selected manually (no form) - PUT method
# should give errors.status 403
test_put_ApiCall_serial_3_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"serial": "Q2EK-3UBE-RRUY", "lat": 1, "lng": 2}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "devices", "operationId": "updateDevice", "rollbackId": "getDevice"},
                                  "responseString": "dashboard.devices.updateDevice(serial,lat,lng)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "serial", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["serial"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_serial_3():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_serial_3_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"]["status"] == 403


################## TEST SERIAL ROLLBACK DISABLED ##########################


# ApiCall test serial 4:
# if data.useJsonBody == False:
# if data.usefulParameter == "serial":
# if data.isRollbackActive == False:
# 1 network selected PUT method
# should responseJson["errors"][0]["status"] == 403

test_put_ApiCall_serial_4_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"serial": "Q2EK-2LYB-PCZP", "address": "new"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "devices", "operationId": "updateDevice", "rollbackId": "getDevice"},
                                  "responseString": "dashboard.devices.updateDevice(serial,address)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": ["Q2EK-2LYB-PCZP"], "usefulParameter": "serial", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["serial"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_serial_4():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_serial_4_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403


# ApiCall test serial 5:
# if data.useJsonBody == False:
# if data.usefulParameter == "serial":
# if data.isRollbackActive == False:
# 2 serial selected PUT method
# should responseJson["errors"][0]["status"] == 403 on both responses

test_put_ApiCall_serial_5_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"serial": "Q2EK-2LYB-PCZP, Q2EK-3UBE-RRUY", "address": "bre"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "devices", "operationId": "updateDevice", "rollbackId": "getDevice"},
                                  "responseString": "dashboard.devices.updateDevice(serial,address)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": ["Q2EK-2LYB-PCZP", "Q2EK-3UBE-RRUY"], "usefulParameter": "serial", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["serial"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_serial_5():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_serial_5_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403
    assert responseJson["errors"][1]["status"] == 403


# ApiCall test serial 6:
# if data.useJsonBody == False:
# if data.usefulParameter == "serial":
# if data.isRollbackActive == False:
# 1 serial selected manually (no form) - PUT method
# should give errors.status 403
test_put_ApiCall_serial_6_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"serial": "Q2EK-3UBE-RRUY", "address": "ddd"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "devices", "operationId": "updateDevice", "rollbackId": "getDevice"},
                                  "responseString": "dashboard.devices.updateDevice(serial,address)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "serial", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["serial"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_serial_6():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_serial_6_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"]["status"] == 403


################## TEST SERIAL ROLLBACK ACTIVE JSON BODY##########################


# ApiCall test serial 7:
# if data.useJsonBody == True:
# data.usefulParameter == "serial":
# data.isRollbackActive == True:
# 1 device selected PUT method
# should responseJson["errors"][0]["status"] == 403
test_put_ApiCall_serial_7_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"serial": "Q2EK-2LYB-PCZP"}, "useJsonBody": True, "ParameterTemplateJSON": {"address": "1600 Pennsylvania Ave"}, "responsePrefixes": {"dashboard": "dashboard", "category": "devices", "operationId": "updateDevice", "rollbackId": "getDevice"},
                                  "responseString": "dashboard.devices.updateDevice(serial)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": ["Q2EK-2LYB-PCZP"], "usefulParameter": "serial", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["serial"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_serial_7():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_serial_7_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403


# ApiCall test serial 8:
# if data.useJsonBody == True:
# if data.usefulParameter == "serial":
# if data.isRollbackActive == True:
# 2 serial selected PUT method
# should responseJson["errors"][0]["status"] == 403 on both responses
test_put_ApiCall_serial_8_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"serial": "Q2EK-2LYB-PCZP, Q2EK-3UBE-RRUY"}, "useJsonBody": True, "ParameterTemplateJSON": {"address": "1600 Pennsylvania Ave"}, "responsePrefixes": {"dashboard": "dashboard", "category": "devices", "operationId": "updateDevice", "rollbackId": "getDevice"},
                                  "responseString": "dashboard.devices.updateDevice(serial)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": ["Q2EK-2LYB-PCZP", "Q2EK-3UBE-RRUY"], "usefulParameter": "serial", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["serial"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_serial_8():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_serial_8_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403
    assert responseJson["errors"][1]["status"] == 403


# ApiCall test serial 9:
# if data.useJsonBody == True:
# if data.usefulParameter == "serial":
# if data.isRollbackActive == True:
# 1 serial selected manually (no form) - PUT method
# should give errors.status 403
test_put_ApiCall_serial_9_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"serial": "Q2EK-3UBE-RRUY"}, "useJsonBody": True, "ParameterTemplateJSON": {"address": "1600 Pennsylvania Ave"}, "responsePrefixes": {"dashboard": "dashboard", "category": "devices", "operationId": "updateDevice", "rollbackId": "getDevice"},
                                  "responseString": "dashboard.devices.updateDevice(serial)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "serial", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["serial"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_serial_9():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_serial_9_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"]["status"] == 403


################## TEST SERIAL ROLLBACK DISABLED JSON BODY##########################


# ApiCall test serial 10:
# if data.useJsonBody == True:
# if data.usefulParameter == "serial":
# if data.isRollbackActive == False:
# 1 network selected PUT method
# should responseJson["errors"][0]["status"] == 403

test_put_ApiCall_serial_10_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"serial": "Q2EK-2LYB-PCZP"}, "useJsonBody": True, "ParameterTemplateJSON": {"address": "1600 Pennsylvania Ave"}, "responsePrefixes": {"dashboard": "dashboard", "category": "devices", "operationId": "updateDevice", "rollbackId": "getDevice"},
                                   "responseString": "dashboard.devices.updateDevice(serial)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": ["Q2EK-2LYB-PCZP"], "usefulParameter": "serial", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["serial"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_serial_10():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_serial_10_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403


# ApiCall test serial 11:
# if data.useJsonBody == True:
# if data.usefulParameter == "serial":
# if data.isRollbackActive == False:
# 2 serial selected PUT method
# should responseJson["errors"][0]["status"] == 403 on both responses

test_put_ApiCall_serial_11_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"serial": "Q2EK-2LYB-PCZP, Q2EK-3UBE-RRUY"}, "useJsonBody": True, "ParameterTemplateJSON": {"address": "1600 Pennsylvania Ave"}, "responsePrefixes": {"dashboard": "dashboard", "category": "devices", "operationId": "updateDevice", "rollbackId": "getDevice"},
                                   "responseString": "dashboard.devices.updateDevice(serial)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": ["Q2EK-2LYB-PCZP", "Q2EK-3UBE-RRUY"], "usefulParameter": "serial", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["serial"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_serial_11():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_serial_11_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403
    assert responseJson["errors"][1]["status"] == 403


# ApiCall test serial 12:
# if data.useJsonBody == True:
# if data.usefulParameter == "serial":
# if data.isRollbackActive == False:
# 1 serial selected manually (no form) - PUT method
# should give errors.status 403
test_put_ApiCall_serial_12_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"serial": "Q2EK-3UBE-RRUY"}, "useJsonBody": True, "ParameterTemplateJSON": {"address": "1600 Pennsylvania Ave"}, "responsePrefixes": {"dashboard": "dashboard", "category": "devices", "operationId": "updateDevice", "rollbackId": "getDevice"},
                                   "responseString": "dashboard.devices.updateDevice(serial)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "serial", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["serial"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_serial_12():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_serial_12_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"]["status"] == 403


################## TEST ORGANIZATION ROLLBACK ACTIVE ##########################
# ApiCall test organization 1:
# if data.useJsonBody == False:
# data.usefulParameter == "organizationId":
# data.isRollbackActive == True:
# 1 device selected PUT method
# should responseJson["errors"][0]["status"] == 403
test_put_ApiCall_organization_1_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"api": {"enabled": True}, "organizationId": "681155"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "organizations", "operationId": "updateOrganization", "rollbackId": "getOrganization"},
                                        "responseString": "dashboard.organizations.updateOrganization(api,organizationId)", "organizationIDSelected": ["681155"], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "organizationId", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["organizationId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_organization_1():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_organization_1_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403


# ApiCall test organization 2:
# if data.useJsonBody == False:
# if data.usefulParameter == "organizationId":
# if data.isRollbackActive == True:
# 2 organization selected PUT method
# should responseJson["errors"][0]["status"] == 403
test_put_ApiCall_organization_2_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"api": {"enabled": True}, "organizationId": "681155, 549236"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "organizations", "operationId": "updateOrganization", "rollbackId": "getOrganization"},
                                        "responseString": "dashboard.organizations.updateOrganization(api,organizationId)", "organizationIDSelected": ["681155", "549236"], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "organizationId", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["organizationId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_organization_2():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_organization_2_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403
    assert responseJson["errors"][1]["status"] == 403


# ApiCall test organization 3:
# if data.useJsonBody == False:
# if data.usefulParameter == "organizationId":
# if data.isRollbackActive == True:
# 1 organization selected manually (no form) - PUT method
# should give errors.status 403
test_put_ApiCall_organization_3_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"api": {"enabled": True}, "organizationId": "681155"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "organizations", "operationId": "updateOrganization", "rollbackId": "getOrganization"},
                                        "responseString": "dashboard.organizations.updateOrganization(api,organizationId)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "organizationId", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["organizationId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_organization_3():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_organization_3_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"]["status"] == 403


################## TEST ORGANIZATION ROLLBACK DISABLED ##########################


# ApiCall test organization 4:
# if data.useJsonBody == False:
# if data.usefulParameter == "organization":
# if data.isRollbackActive == False:
# 1 network selected PUT method
# should responseJson["errors"][0]["status"] == 403

test_put_ApiCall_organization_4_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"api": {"enabled": True}, "organizationId": "681155"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "organizations", "operationId": "updateOrganization", "rollbackId": "getOrganization"},
                                        "responseString": "dashboard.organizations.updateOrganization(api,organizationId)", "organizationIDSelected": ["681155"], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "organizationId", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["organizationId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_organization_4():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_organization_4_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403


# ApiCall test organization 5:
# if data.useJsonBody == False:
# if data.usefulParameter == "organization":
# if data.isRollbackActive == False:
# 2 organization selected PUT method
# should responseJson["errors"][0]["status"] == 403 on both responses

test_put_ApiCall_organization_5_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"api": {"enabled": True}, "organizationId": "681155, 549236"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "organizations", "operationId": "updateOrganization", "rollbackId": "getOrganization"},
                                        "responseString": "dashboard.organizations.updateOrganization(api,organizationId)", "organizationIDSelected": ["681155", "549236"], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "organizationId", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["organizationId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_organization_5():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_organization_5_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403
    assert responseJson["errors"][1]["status"] == 403


# ApiCall test organization 6:
# if data.useJsonBody == False:
# if data.usefulParameter == "organization":
# if data.isRollbackActive == False:
# 1 organization selected manually (no form) - PUT method
# should give errors.status 403
test_put_ApiCall_organization_6_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"api": {"enabled": True}, "organizationId": "681155"}, "useJsonBody": False, "ParameterTemplateJSON": {}, "responsePrefixes": {"dashboard": "dashboard", "category": "organizations", "operationId": "updateOrganization", "rollbackId": "getOrganization"},
                                        "responseString": "dashboard.organizations.updateOrganization(api,organizationId)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "organizationId", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["organizationId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_organization_6():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_organization_6_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"]["status"] == 403


################## TEST ORGANIZATION ROLLBACK ACTIVE JSON BODY ##########################
# ApiCall test organization 7:
# if data.useJsonBody == True:
# data.usefulParameter == "organizationId":
# data.isRollbackActive == True:
# 1 device selected PUT method
# should responseJson["errors"][0]["status"] == 403
test_put_ApiCall_organization_7_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"organizationId": "681155"}, "useJsonBody": True, "ParameterTemplateJSON": {"api": {"enabled": True}}, "responsePrefixes": {"dashboard": "dashboard", "category": "organizations", "operationId": "updateOrganization", "rollbackId": "getOrganization"},
                                        "responseString": "dashboard.organizations.updateOrganization(organizationId)", "organizationIDSelected": ["681155"], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "organizationId", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["organizationId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_organization_7():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_organization_7_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403


# ApiCall test organization 8:
# if data.useJsonBody == True:
# if data.usefulParameter == "organizationId":
# if data.isRollbackActive == True:
# 2 organization selected PUT method
# should responseJson["errors"][0]["status"] == 403
test_put_ApiCall_organization_8_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"organizationId": "681155, 549236"}, "useJsonBody": True, "ParameterTemplateJSON": {"api": {"enabled": True}}, "responsePrefixes": {"dashboard": "dashboard", "category": "organizations", "operationId": "updateOrganization", "rollbackId": "getOrganization"},
                                        "responseString": "dashboard.organizations.updateOrganization(organizationId)", "organizationIDSelected": ["681155", "549236"], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "organizationId", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["organizationId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_organization_8():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_organization_8_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403
    assert responseJson["errors"][1]["status"] == 403


# ApiCall test organization 9:
# if data.useJsonBody == True:
# if data.usefulParameter == "organizationId":
# if data.isRollbackActive == True:
# 1 organization selected manually (no form) - PUT method
# should give errors.status 403
test_put_ApiCall_organization_9_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"organizationId": "549236"}, "useJsonBody": True, "ParameterTemplateJSON": {"api": {"enabled": True}}, "responsePrefixes": {"dashboard": "dashboard", "category": "organizations", "operationId": "updateOrganization", "rollbackId": "getOrganization"},
                                        "responseString": "dashboard.organizations.updateOrganization(organizationId)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "organizationId", "isRollbackActive": True, "method": "put", "organization": "DeLab", "requiredParameters": ["organizationId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_organization_9():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_organization_9_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"]["status"] == 403


################## TEST ORGANIZATION ROLLBACK DISABLED JSON BODY##########################


# ApiCall test organization 10:
# if data.useJsonBody == True:
# if data.usefulParameter == "organization":
# if data.isRollbackActive == False:
# 1 network selected PUT method
# should responseJson["errors"][0]["status"] == 403

test_put_ApiCall_organization_10_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"organizationId": "681155"}, "useJsonBody": True, "ParameterTemplateJSON": {"api": {"enabled": True}}, "responsePrefixes": {"dashboard": "dashboard", "category": "organizations", "operationId": "updateOrganization", "rollbackId": "getOrganization"},
                                         "responseString": "dashboard.organizations.updateOrganization(organizationId)", "organizationIDSelected": ["681155"], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "organizationId", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["organizationId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_organization_10():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_organization_10_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403


# ApiCall test organization 11:
# if data.useJsonBody == True:
# if data.usefulParameter == "organization":
# if data.isRollbackActive == False:
# 2 organization selected PUT method
# should responseJson["errors"][0]["status"] == 403 on both responses

test_put_ApiCall_organization_11_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"organizationId": "681155, 549236"}, "useJsonBody": True, "ParameterTemplateJSON": {"api": {"enabled": True}}, "responsePrefixes": {"dashboard": "dashboard", "category": "organizations", "operationId": "updateOrganization", "rollbackId": "getOrganization"},
                                         "responseString": "dashboard.organizations.updateOrganization(organizationId)", "organizationIDSelected": ["681155", "549236"], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "organizationId", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["organizationId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_organization_11():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_organization_11_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"][0]["status"] == 403
    assert responseJson["errors"][1]["status"] == 403


# ApiCall test organization 12
# if data.useJsonBody == True:
# if data.usefulParameter == "organization":
# if data.isRollbackActive == False:
# 1 organization selected manually (no form) - PUT method
# should give errors.status 403
test_put_ApiCall_organization_12_data = {"apiKey": "6bec40cf957de430a6f1f2baa056b99a4fac9ea0", "ParameterTemplate": {"organizationId": "549236"}, "useJsonBody": True, "ParameterTemplateJSON": {"api": {"enabled": True}}, "responsePrefixes": {"dashboard": "dashboard", "category": "organizations", "operationId": "updateOrganization", "rollbackId": "getOrganization"},
                                         "responseString": "dashboard.organizations.updateOrganization(organizationId)", "organizationIDSelected": [], "networksIDSelected": [], "devicesIDSelected": [], "usefulParameter": "organizationId", "isRollbackActive": False, "method": "put", "organization": "DeLab", "requiredParameters": ["organizationId"], "SettingsTemplate": {"single_request_timeout": 60, "wait_on_rate_limit": True, "retry_4xx_error": False, "retry_4xx_error_wait_time": 5, "maximum_retries": 2}}


def test_put_ApiCall_organization_12():
    baseUrl = "http://localhost:8000"
    path = "/ApiCall"

    response = requests.post(
        url=baseUrl+path, json=test_put_ApiCall_organization_12_data)
    responseJson = json.loads(response.text)
    assert response.status_code == 200
    assert responseJson["errors"]["status"] == 403
