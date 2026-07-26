from app.modules.tkts.tkt_repository import tkt_create, listing, update_task, get_tkt_by_id, tkt_delete

def create_tkt(data):
    response = {
        "success": True,
        "code": 200,
        "message": "",
        "data": {},
        "error": None
    }

    if not data.name or data.name == "":
        response['success'] = False
        response['code'] = 400
        response['error'] = "name is required and cannot be empty"
        return response
    
    if not data.release_date or data.release_date == "":
        response['success'] = False
        response['code'] = 400
        response['error'] = "release_date is required and cannot be empty"
        return response
    
    res = tkt_create(data.name, data.release_date, data.notes)

    response['message'] = "Ticket created sucessfully"
    response['data'] = {
        "tkt_id":res[0]
    }

    return response


# tkt listing
def tkts_listing():
    response = {
        "success": True,
        "code": 200,
        "message": "",
        "data": [],
        "error": None
    }

    res = listing()

    if res is None:
        response["success"] = False
        response["code"] = 500
        response["error"] = "Database error."
        return response

    if len(res) == 0:
        response["message"] = "No releases found."
        response["data"] = []
        return response

    response["message"] = "Releases fetched successfully."
    response["data"] = res

    return response

def tkt_details(tkt_id):
    response = {
        "success": True,
        "code": 200,
        "message": "Release fetched successfully.",
        "data": {},
        "error": None
    }

    rows = get_tkt_by_id(tkt_id)

    if not rows:
        response["success"] = False
        response["code"] = 404
        response["message"] = ""
        response["error"] = "Release not found."
        return response

    data = {
        "id": rows[0]["tkt_id"],
        "name": rows[0]["tkt_name"],
        "release_date": rows[0]["tkt_release_date"],
        "notes": rows[0]["notes"],
        "tasks": []
    }

    for row in rows:
        data["tasks"].append({
            "id": row["id"],
            "task_name": row["task_name"],
            "is_completed": row["is_completed"]
        })

    response["data"] = data

    return response


def update_tkt_task(tkt_id, name=None, release_date=None, tasks=None, notes=None):
    response = {
        "success": True,
        "code": 200,
        "message": "Release updated successfully.",
        "data": {},
        "error": None
    }

    res = update_task(
        tkt_id=tkt_id,
        name=name,
        release_date=release_date,
        tasks=tasks,
        notes=notes
    )

    if not res:
        response["success"] = False
        response["code"] = 500
        response["message"] = ""
        response["error"] = "Failed to update release."

    return response

def delete_tkt(tkt_id):
    response = {
        "success": True,
        "code": 200,
        "message": "Release deleted successfully.",
        "data": {},
        "error": None
    }

    res = tkt_delete(tkt_id)

    if res is None:
        response["success"] = False
        response["code"] = 404
        response["message"] = ""
        response["error"] = "Release not found."
        return response

    response["data"] = {
        "id": res[0]
    }

    return response