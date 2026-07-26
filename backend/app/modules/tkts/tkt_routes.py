from fastapi import APIRouter
from app.modules.tkts.tkt_service import tkts_listing, create_tkt, update_tkt_task, tkt_details, delete_tkt
from app.modules.tkts.tkt_schema import CreateTktSchema, UpdateTktSchema

routes = APIRouter()

@routes.get('/tkt/list')
def list_route():
    response = tkts_listing()
    return response

@routes.post('/tkt/create')
def tkt_create_route(data: CreateTktSchema):
    response = create_tkt(data)

    return response


@routes.get("/tkt/{id}")
def get_tkt(id: int):
    return tkt_details(id)

@routes.patch("/tkt/update/{id}")
def update_release(id: int, data: UpdateTktSchema):
    return update_tkt_task(tkt_id=id, name=data.name, release_date=data.release_date, tasks=data.task, notes=data.notes)

@routes.delete("/tkt/delete/{id}")
def delete_tkt_route(id: int):
    return delete_tkt(id)