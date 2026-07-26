from pydantic import BaseModel
from typing import Optional, List

class CreateTktSchema(BaseModel):
    name: str
    release_date: str
    notes: str

class UpdateTktSchema(BaseModel):
    name: Optional[str] = None
    release_date: Optional[str] = None
    notes: Optional[str] = None
    task: Optional[List[TaskUpdate]] = None

class TaskUpdate(BaseModel):
    task_id: int
    is_completed: bool
