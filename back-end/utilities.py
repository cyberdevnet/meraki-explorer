import logging
import motor.motor_asyncio
import os
from dotenv import load_dotenv
from production_config import settings as prod_settings
from development_config import settings as dev_settings


load_dotenv(verbose=True)


FASTAPI_ENV_DEFAULT = 'production'
try:
    if os.getenv('FASTAPI_ENV',    FASTAPI_ENV_DEFAULT) == 'development':
        # Using a developmet configuration
        mongodb_url = dev_settings.mongodb_url
        mongodb_hostname = dev_settings.mongodb_hostname
        redis_hostname = dev_settings.redis_hostname
    else:
        # Using a production configuration
        mongodb_url = prod_settings.mongodb_url
        mongodb_hostname = prod_settings.mongodb_hostname
        redis_hostname = prod_settings.redis_hostname

except Exception as error:
    print('error: ', error)
    pass



try:
    MONGO_DETAILS = mongodb_url
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
    database = client.merakiExplorerDB
    task_collection = database.get_collection("task_collection")

except Exception as error:
    print('DB error: ', error)
    logging.error(error)
    logging.error("Database connection error!")
    print('mongodb_url: ', mongodb_url)


def get_status(isSuccess, isError):
    if isSuccess == True and isError == False:
        return "success"
    elif isSuccess == True and isError == True:
        return "warning"
    elif isSuccess == False and isError == True:
        return "error"
    elif isSuccess == None and isError == True:
        return "error"
    elif isSuccess == True and isError == None:
        return "success"
    else:
        return "success"
    

def no_rollback_exception_utility(TypeError,KeyError, err,operationId,dt_string,organization,usefulParameter,category,method,isRollbackActive,loop_parameter):
    if TypeError:
        logging.error(err.args)
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": method,
                            "rollback": isRollbackActive,
                            "parameter": loop_parameter,
                            "response": err.args,
                            "error": "error"}
        task = task_collection.insert_one(taskCollection)
        return {"error": err.args}
    elif KeyError:
        logging.error(err)
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": method,
                            "rollback": isRollbackActive,
                            "parameter": loop_parameter,
                            "response": err,
                            "error": "error"}
        task = task_collection.insert_one(taskCollection)
        return {"error": err}
    else:
        logging.error(err.status)
        logging.error(err.reason)
        logging.error(err.message)
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": method,
                            "rollback": isRollbackActive,
                            "parameter": loop_parameter,

                            "response": err.reason,
                            "error": "error"}
        task = task_collection.insert_one(taskCollection)
    return {'status': err.status, "message": err.message, "error": err.reason}



def rollback_exception_utility(TypeError,KeyError, err,rollbackId,dt_string,organization,usefulParameter,category,method,isRollbackActive,RollbackResponse):
    if TypeError:
        logging.error(err.args)
        
        taskCollection = {
            "task_name": rollbackId,
            "start_time": dt_string,
            "organization": organization,
            "usefulParameter": usefulParameter,
            "category": category,
            "method": method,
            "rollback": isRollbackActive,
            "parameter": "",

            "response": err.args,
            "rollback_response": RollbackResponse,
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)
        return {"error": err.args}
    if KeyError:
        logging.error(err)
        
        taskCollection = {
            "task_name": rollbackId,
            "start_time": dt_string,
            "organization": organization,
            "usefulParameter": usefulParameter,
            "category": category,
            "method": method,
            "rollback": isRollbackActive,
            "parameter": "",

            "response": err,
            "rollback_response": RollbackResponse,
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)
        return {"error": err}
    else:
        logging.error(err.status)
        logging.error(err.reason)
        logging.error(err.message)
        
        taskCollection = {
            "task_name": rollbackId,
            "start_time": dt_string,
            "organization": organization,
            "usefulParameter": usefulParameter,
            "category": category,
            "method": method,
            "rollback": isRollbackActive,
            "parameter": "",

            "response": err.reason,
            "rollback_response": RollbackResponse,
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)

    
    return {'status': err.status, "message": err.message, "error": err.reason}


def rollback_two_exception_utility(TypeError,KeyError, err,operationId,dt_string,organization,usefulParameter,category,method,isRollbackActive,loop_parameter,RollbackResponse):
    if TypeError:
        logging.error(err.args)
        
        taskCollection = {
            "task_name": operationId,
            "start_time": dt_string,
            "organization": organization,
            "usefulParameter": usefulParameter,
            "category": category,
            "method": method,
            "rollback": isRollbackActive,
            "parameter": loop_parameter,

            "response": err.args,
            "rollback_response": RollbackResponse,
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)
        return {"error": err.args}
    if KeyError:
        logging.error(err)
        
        taskCollection = {
            "task_name": operationId,
            "start_time": dt_string,
            "organization": organization,
            "usefulParameter": usefulParameter,
            "category": category,
            "method": method,
            "rollback": isRollbackActive,
            "parameter": loop_parameter,

            "response": err,
            "rollback_response": RollbackResponse,
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)
        return {"error": err}
    else:
        logging.error(err.status)
        logging.error(err.reason)
        logging.error(err.message)
        taskCollection = {
            "task_name": operationId,
            "start_time": dt_string,
            "organization": organization,
            "usefulParameter": usefulParameter,
            "category": category,
            "method": method,
            "rollback": isRollbackActive,
            "parameter": loop_parameter,

            "response": err.reason,
            "rollback_response": RollbackResponse,
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)
        

    
    return {'status': err.status, "message": err.message, "error": err.reason}




def rollback_org_exception_utility(TypeError,KeyError,AttributeError, err,rollbackId,dt_string,organization,usefulParameter,category,method,isRollbackActive,RollbackResponse):
    if TypeError:
        logging.error(err.args)
        
        taskCollection = {
            "task_name": rollbackId,
            "start_time": dt_string,
            "organization": organization,
            "usefulParameter": usefulParameter,
            "category": category,
            "method": method,
            "rollback": isRollbackActive,
            "parameter": "",

            "response": err.args,
            "rollback_response": RollbackResponse,
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)
        return {"error": err.args}
    if KeyError:
        logging.error(err)
        
        taskCollection = {
            "task_name": rollbackId,
            "start_time": dt_string,
            "organization": organization,
            "usefulParameter": usefulParameter,
            "category": category,
            "method": method,
            "rollback": isRollbackActive,
            "parameter": "",

            "response": err,
            "rollback_response": RollbackResponse,
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)
        return {"error": err}
    if AttributeError:
        logging.error(err)
        
        taskCollection = {
            "task_name": rollbackId,
            "start_time": dt_string,
            "organization": organization,
            "usefulParameter": usefulParameter,
            "category": category,
            "method": method,
            "rollback": isRollbackActive,
            "parameter": "",

            "response": err,
            "rollback_response": RollbackResponse,
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)
        return {"error": err}
    else:
        logging.error(err.status)
        logging.error(err.reason)
        logging.error(err.message)
        
        taskCollection = {
            "task_name": rollbackId,
            "start_time": dt_string,
            "organization": organization,
            "usefulParameter": usefulParameter,
            "category": category,
            "method": method,
            "rollback": isRollbackActive,
            "parameter": "",

            "response": err.reason,
            "rollback_response": RollbackResponse,
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)

    
    return {'status': err.status, "message": err.message, "error": err.reason}


def rollback_two_org_exception_utility(TypeError,KeyError,AttributeError, err,operationId,dt_string,organization,usefulParameter,category,method,isRollbackActive,loop_parameter,RollbackResponse):
    if TypeError:
        logging.error(err.args)
        
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
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)
        return {"error": err.args}
    if KeyError:
        logging.error(err)
        
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
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)
        return {"error": err}
    if AttributeError:
        logging.error(err)
        
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
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)
        return {"error": err}
    else:
        logging.error(err.status)
        logging.error(err.reason)
        logging.error(err.message)
        
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
            "error": "error"
        }
        task = task_collection.insert_one(taskCollection)

    
    return {'status': err.status, "message": err.message, "error": err.reason}


def no_rollback_org_exception_utility(TypeError,KeyError,AttributeError, err,operationId,dt_string,organization,usefulParameter,category,method,isRollbackActive,loop_parameter):
    if TypeError:
        logging.error(err.args)
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": method,
                            "rollback": isRollbackActive,
                            "parameter": loop_parameter,

                            "response": err.args,
                            "error": "error"}
        task = task_collection.insert_one(taskCollection)
        return {"error": err.args}
    if KeyError:
        logging.error(err)
        
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": method,
                            "rollback": isRollbackActive,
                            "parameter": loop_parameter,

                            "response": err,
                            "error": "error"}
        task = task_collection.insert_one(taskCollection)
        return {"error": err}
    if AttributeError:
        logging.error(err)
        
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": method,
                            "rollback": isRollbackActive,
                            "parameter": loop_parameter,

                            "response": err,
                            "error": "error"}
        task = task_collection.insert_one(taskCollection)
        return {"error": err}
    else:
        logging.error(err.status)
        logging.error(err.reason)
        logging.error(err.message)
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": method,
                            "rollback": isRollbackActive,
                            "parameter": loop_parameter,

                            "response": err.reason,
                            "error": "error"}
        task = task_collection.insert_one(taskCollection)
        

    
    return {'status': err.status, "message": err.message, "error": err.reason}




def action_rollback_exception_utility(TypeError,KeyError, err,operationId,dt_string,organization,usefulParameter,category,RollbackParameterTemplate,parameter,Rollback_BackResponse):
    if TypeError:

        logging.error(err.args)
        
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": RollbackParameterTemplate["method"],
                            "rollback": True,
                            "parameter": parameter,

                            "response": err.args,
                            "rollback_response": Rollback_BackResponse,
                            "error": "error"
                            }
        task = task_collection.insert_one(taskCollection)
        return {"error": err.args}
    if KeyError:

        logging.error(err)
        
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": RollbackParameterTemplate["method"],
                            "rollback": True,
                            "parameter": parameter,

                            "response": err,
                            "rollback_response": Rollback_BackResponse,
                            "error": "error"
                            }
        task = task_collection.insert_one(taskCollection)
        return {"error": err}
    else:
        logging.error(err.status)
        logging.error(err.reason)
        logging.error(err.message)
        
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": RollbackParameterTemplate["method"],
                            "rollback": True,
                            "parameter": parameter,

                            "response": err.reason,
                            "rollback_response": Rollback_BackResponse,
                            "error": "error"
                            }
        task = task_collection.insert_one(taskCollection)

    
    return {'status': err.status, "message": err.message, "error": err.reason}



def action_rollback_two_exception_utility(TypeError,KeyError, err,operationId,dt_string,organization,usefulParameter,category,RollbackParameterTemplate,loop_parameter,Rollback_BackResponse):
    if TypeError:

        logging.error(err.args)
        
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": RollbackParameterTemplate["method"],
                            "rollback": True,
                            "parameter": loop_parameter,

                            "response": err.args,
                            "rollback_response": Rollback_BackResponse,
                            "error": "error"
                            }
        task = task_collection.insert_one(taskCollection)
        return {"error": err.args}
    if KeyError:

        logging.error(err)
        
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": RollbackParameterTemplate["method"],
                            "rollback": True,
                            "parameter": loop_parameter,

                            "response": err,
                            "rollback_response": Rollback_BackResponse,
                            "error": "error"
                            }
        task = task_collection.insert_one(taskCollection)
        return {"error": err}
    else:
        logging.error(err.status)
        logging.error(err.reason)
        logging.error(err.message)
        
        taskCollection = {"task_name": operationId,
                            "start_time": dt_string,
                            "organization": organization,
                            "usefulParameter": usefulParameter,
                            "category": category,
                            "method": RollbackParameterTemplate["method"],
                            "rollback": True,
                            "parameter": loop_parameter,

                            "response": err.reason,
                            "rollback_response": Rollback_BackResponse,
                            "error": "error"
                            }
        task = task_collection.insert_one(taskCollection)

    
    return {'status': err.status, "message": err.message, "error": err.reason}

