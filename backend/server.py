from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
import string
import jwt
import bcrypt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT config
JWT_SECRET = os.environ.get('JWT_SECRET', 'cuidamais-dev-secret-change-me-2026')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRE_DAYS = 30

# Create the main app without a prefix
app = FastAPI(title="CuidaMais API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()


# ===== Helper Functions =====
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def create_token(user_id: str) -> str:
    payload = {
        'sub': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
        'iat': datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def gen_patient_code() -> str:
    """Generate 6-char human-readable patient code (no ambiguous chars)."""
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return ''.join(secrets.choice(alphabet) for _ in range(6))


def serialize(doc: dict) -> dict:
    """Remove _id and convert datetimes to ISO."""
    if doc is None:
        return None
    out = {k: v for k, v in doc.items() if k != '_id'}
    for k, v in out.items():
        if isinstance(v, datetime):
            out[k] = v.isoformat()
    return out


# ===== Models =====
Role = Literal['patient', 'caregiver', 'responsible']


class UserPublic(BaseModel):
    id: str
    email: str
    full_name: str
    role: Role
    patient_code: Optional[str] = None
    created_at: str


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: Role


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class LinkPatientIn(BaseModel):
    patient_code: str


class MedicationIn(BaseModel):
    patient_id: str
    name: str
    dosage: str
    schedule_time: str  # "HH:MM"
    notes: Optional[str] = ""


class MedicationLogIn(BaseModel):
    medication_id: str
    given: bool = True
    notes: Optional[str] = ""


class ActivityIn(BaseModel):
    patient_id: str
    type: Literal['note', 'incident', 'meal', 'mood']
    description: str


class ShoppingIn(BaseModel):
    patient_id: str
    item: str
    category: Literal['medicine', 'food', 'hygiene', 'other'] = 'other'
    quantity: Optional[str] = "1"


class ShoppingUpdateIn(BaseModel):
    purchased: bool


class VisitIn(BaseModel):
    patient_id: str
    requested_date: str  # ISO
    reason: str


class VisitUpdateIn(BaseModel):
    status: Literal['pending', 'accepted', 'declined', 'completed']


class SOSIn(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    message: Optional[str] = "SOS - preciso de ajuda"


class LocationIn(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None


class ChatIn(BaseModel):
    patient_id: str
    text: str


# ===== Auth Dependency =====
async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        if not user_id:
            raise HTTPException(401, "Token inválido")
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token inválido")

    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(401, "Usuário não encontrado")
    return user


def public_user(u: dict) -> UserPublic:
    return UserPublic(
        id=u['id'],
        email=u['email'],
        full_name=u['full_name'],
        role=u['role'],
        patient_code=u.get('patient_code'),
        created_at=u['created_at'].isoformat() if isinstance(u.get('created_at'), datetime) else u.get('created_at', ''),
    )


# ===== Auth Routes =====
@api_router.post("/auth/register", response_model=TokenOut)
async def register(data: RegisterIn):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(400, "Email já cadastrado")

    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": data.email.lower(),
        "full_name": data.full_name,
        "hashed_password": hash_password(data.password),
        "role": data.role,
        "created_at": now_utc(),
    }
    if data.role == 'patient':
        # generate unique patient code
        for _ in range(10):
            code = gen_patient_code()
            if not await db.users.find_one({"patient_code": code}):
                user_doc["patient_code"] = code
                break

    await db.users.insert_one(user_doc)
    token = create_token(user_id)
    return TokenOut(access_token=token, user=public_user(user_doc))


@api_router.post("/auth/login", response_model=TokenOut)
async def login(data: LoginIn):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user['hashed_password']):
        raise HTTPException(401, "Credenciais inválidas")
    token = create_token(user['id'])
    return TokenOut(access_token=token, user=public_user(user))


@api_router.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


# ===== Patient Linking =====
@api_router.post("/patients/link")
async def link_patient(data: LinkPatientIn, user: dict = Depends(get_current_user)):
    if user['role'] not in ('caregiver', 'responsible'):
        raise HTTPException(403, "Apenas cuidadores e responsáveis podem vincular pacientes")

    patient = await db.users.find_one({"patient_code": data.patient_code.upper(), "role": "patient"})
    if not patient:
        raise HTTPException(404, "Código de paciente inválido")

    existing_link = await db.links.find_one({
        "patient_id": patient['id'],
        "linked_user_id": user['id'],
    })
    if existing_link:
        return {"message": "Paciente já vinculado", "patient": public_user(patient).model_dump()}

    await db.links.insert_one({
        "id": str(uuid.uuid4()),
        "patient_id": patient['id'],
        "linked_user_id": user['id'],
        "linked_role": user['role'],
        "created_at": now_utc(),
    })
    return {"message": "Paciente vinculado com sucesso", "patient": public_user(patient).model_dump()}


@api_router.get("/patients/linked")
async def get_linked_patients(user: dict = Depends(get_current_user)):
    """For caregivers/responsibles: list all linked patients."""
    if user['role'] == 'patient':
        return [public_user(user).model_dump()]

    links = await db.links.find({"linked_user_id": user['id']}).to_list(100)
    patient_ids = [l['patient_id'] for l in links]
    patients = await db.users.find({"id": {"$in": patient_ids}}).to_list(100)
    return [public_user(p).model_dump() for p in patients]


async def assert_access_to_patient(user: dict, patient_id: str):
    if user['role'] == 'patient':
        if user['id'] != patient_id:
            raise HTTPException(403, "Sem acesso a este paciente")
        return
    link = await db.links.find_one({"patient_id": patient_id, "linked_user_id": user['id']})
    if not link:
        raise HTTPException(403, "Paciente não vinculado a você")


# ===== Medications =====
@api_router.post("/medications")
async def create_medication(data: MedicationIn, user: dict = Depends(get_current_user)):
    if user['role'] not in ('caregiver', 'responsible'):
        raise HTTPException(403, "Apenas cuidadores/responsáveis podem criar medicamentos")
    await assert_access_to_patient(user, data.patient_id)

    med = {
        "id": str(uuid.uuid4()),
        "patient_id": data.patient_id,
        "name": data.name,
        "dosage": data.dosage,
        "schedule_time": data.schedule_time,
        "notes": data.notes or "",
        "created_by": user['id'],
        "created_at": now_utc(),
    }
    await db.medications.insert_one(med)
    return serialize(med)


@api_router.get("/medications")
async def list_medications(patient_id: str, user: dict = Depends(get_current_user)):
    await assert_access_to_patient(user, patient_id)
    meds = await db.medications.find({"patient_id": patient_id}).sort("schedule_time", 1).to_list(200)
    return [serialize(m) for m in meds]


@api_router.delete("/medications/{med_id}")
async def delete_medication(med_id: str, user: dict = Depends(get_current_user)):
    med = await db.medications.find_one({"id": med_id})
    if not med:
        raise HTTPException(404, "Medicamento não encontrado")
    await assert_access_to_patient(user, med['patient_id'])
    await db.medications.delete_one({"id": med_id})
    return {"message": "Removido"}


@api_router.post("/medications/log")
async def log_medication(data: MedicationLogIn, user: dict = Depends(get_current_user)):
    med = await db.medications.find_one({"id": data.medication_id})
    if not med:
        raise HTTPException(404, "Medicamento não encontrado")
    await assert_access_to_patient(user, med['patient_id'])

    log = {
        "id": str(uuid.uuid4()),
        "medication_id": data.medication_id,
        "patient_id": med['patient_id'],
        "given": data.given,
        "notes": data.notes or "",
        "logged_by": user['id'],
        "logged_by_name": user['full_name'],
        "logged_at": now_utc(),
    }
    await db.medication_logs.insert_one(log)
    return serialize(log)


@api_router.get("/medications/logs")
async def list_medication_logs(patient_id: str, user: dict = Depends(get_current_user)):
    await assert_access_to_patient(user, patient_id)
    logs = await db.medication_logs.find({"patient_id": patient_id}).sort("logged_at", -1).limit(100).to_list(100)
    return [serialize(l) for l in logs]


# ===== Activities (Caregiver Reports) =====
@api_router.post("/activities")
async def create_activity(data: ActivityIn, user: dict = Depends(get_current_user)):
    await assert_access_to_patient(user, data.patient_id)
    act = {
        "id": str(uuid.uuid4()),
        "patient_id": data.patient_id,
        "type": data.type,
        "description": data.description,
        "reported_by": user['id'],
        "reported_by_name": user['full_name'],
        "reported_at": now_utc(),
    }
    await db.activities.insert_one(act)
    return serialize(act)


@api_router.get("/activities")
async def list_activities(patient_id: str, user: dict = Depends(get_current_user)):
    await assert_access_to_patient(user, patient_id)
    acts = await db.activities.find({"patient_id": patient_id}).sort("reported_at", -1).limit(100).to_list(100)
    return [serialize(a) for a in acts]


# ===== Shopping =====
@api_router.post("/shopping")
async def create_shopping(data: ShoppingIn, user: dict = Depends(get_current_user)):
    await assert_access_to_patient(user, data.patient_id)
    item = {
        "id": str(uuid.uuid4()),
        "patient_id": data.patient_id,
        "item": data.item,
        "category": data.category,
        "quantity": data.quantity or "1",
        "purchased": False,
        "created_by": user['id'],
        "created_at": now_utc(),
    }
    await db.shopping.insert_one(item)
    return serialize(item)


@api_router.get("/shopping")
async def list_shopping(patient_id: str, user: dict = Depends(get_current_user)):
    await assert_access_to_patient(user, patient_id)
    items = await db.shopping.find({"patient_id": patient_id}).sort("created_at", -1).to_list(200)
    return [serialize(i) for i in items]


@api_router.patch("/shopping/{item_id}")
async def update_shopping(item_id: str, data: ShoppingUpdateIn, user: dict = Depends(get_current_user)):
    item = await db.shopping.find_one({"id": item_id})
    if not item:
        raise HTTPException(404, "Item não encontrado")
    await assert_access_to_patient(user, item['patient_id'])
    await db.shopping.update_one({"id": item_id}, {"$set": {"purchased": data.purchased}})
    updated = await db.shopping.find_one({"id": item_id})
    return serialize(updated)


@api_router.delete("/shopping/{item_id}")
async def delete_shopping(item_id: str, user: dict = Depends(get_current_user)):
    item = await db.shopping.find_one({"id": item_id})
    if not item:
        raise HTTPException(404, "Item não encontrado")
    await assert_access_to_patient(user, item['patient_id'])
    await db.shopping.delete_one({"id": item_id})
    return {"message": "Removido"}


# ===== Visit Requests =====
@api_router.post("/visits")
async def create_visit(data: VisitIn, user: dict = Depends(get_current_user)):
    if user['role'] != 'responsible':
        raise HTTPException(403, "Apenas responsáveis podem solicitar visitas")
    await assert_access_to_patient(user, data.patient_id)
    visit = {
        "id": str(uuid.uuid4()),
        "patient_id": data.patient_id,
        "requested_by": user['id'],
        "requested_by_name": user['full_name'],
        "requested_date": data.requested_date,
        "reason": data.reason,
        "status": "pending",
        "created_at": now_utc(),
    }
    await db.visits.insert_one(visit)
    return serialize(visit)


@api_router.get("/visits")
async def list_visits(patient_id: str, user: dict = Depends(get_current_user)):
    await assert_access_to_patient(user, patient_id)
    visits = await db.visits.find({"patient_id": patient_id}).sort("created_at", -1).to_list(100)
    return [serialize(v) for v in visits]


@api_router.patch("/visits/{visit_id}")
async def update_visit(visit_id: str, data: VisitUpdateIn, user: dict = Depends(get_current_user)):
    visit = await db.visits.find_one({"id": visit_id})
    if not visit:
        raise HTTPException(404, "Visita não encontrada")
    await assert_access_to_patient(user, visit['patient_id'])
    await db.visits.update_one({"id": visit_id}, {"$set": {"status": data.status}})
    updated = await db.visits.find_one({"id": visit_id})
    return serialize(updated)


# ===== SOS Alerts =====
@api_router.post("/sos")
async def send_sos(data: SOSIn, user: dict = Depends(get_current_user)):
    if user['role'] != 'patient':
        raise HTTPException(403, "Apenas pacientes podem enviar SOS")
    sos = {
        "id": str(uuid.uuid4()),
        "patient_id": user['id'],
        "patient_name": user['full_name'],
        "latitude": data.latitude,
        "longitude": data.longitude,
        "message": data.message or "SOS - preciso de ajuda",
        "resolved": False,
        "created_at": now_utc(),
    }
    await db.sos.insert_one(sos)
    return serialize(sos)


@api_router.get("/sos")
async def list_sos(patient_id: str, user: dict = Depends(get_current_user)):
    await assert_access_to_patient(user, patient_id)
    alerts = await db.sos.find({"patient_id": patient_id}).sort("created_at", -1).limit(50).to_list(50)
    return [serialize(a) for a in alerts]


@api_router.patch("/sos/{sos_id}/resolve")
async def resolve_sos(sos_id: str, user: dict = Depends(get_current_user)):
    s = await db.sos.find_one({"id": sos_id})
    if not s:
        raise HTTPException(404, "SOS não encontrado")
    await assert_access_to_patient(user, s['patient_id'])
    await db.sos.update_one({"id": sos_id}, {"$set": {"resolved": True, "resolved_at": now_utc()}})
    return {"message": "Resolvido"}


# ===== Location =====
@api_router.post("/location")
async def update_location(data: LocationIn, user: dict = Depends(get_current_user)):
    if user['role'] != 'patient':
        raise HTTPException(403, "Apenas pacientes atualizam localização")
    loc = {
        "id": str(uuid.uuid4()),
        "patient_id": user['id'],
        "latitude": data.latitude,
        "longitude": data.longitude,
        "accuracy": data.accuracy,
        "timestamp": now_utc(),
    }
    await db.locations.insert_one(loc)
    # also update latest snapshot
    await db.users.update_one(
        {"id": user['id']},
        {"$set": {"last_location": {
            "latitude": data.latitude,
            "longitude": data.longitude,
            "accuracy": data.accuracy,
            "timestamp": now_utc().isoformat(),
        }}}
    )
    return serialize(loc)


@api_router.get("/location/{patient_id}")
async def get_location(patient_id: str, user: dict = Depends(get_current_user)):
    await assert_access_to_patient(user, patient_id)
    p = await db.users.find_one({"id": patient_id})
    if not p:
        raise HTTPException(404, "Paciente não encontrado")
    return p.get('last_location') or None


# ===== Chat =====
@api_router.post("/chat")
async def send_chat(data: ChatIn, user: dict = Depends(get_current_user)):
    if user['role'] not in ('caregiver', 'responsible'):
        raise HTTPException(403, "Apenas cuidadores/responsáveis usam o chat")
    await assert_access_to_patient(user, data.patient_id)
    msg = {
        "id": str(uuid.uuid4()),
        "patient_id": data.patient_id,
        "sender_id": user['id'],
        "sender_name": user['full_name'],
        "sender_role": user['role'],
        "text": data.text,
        "created_at": now_utc(),
    }
    await db.chat.insert_one(msg)
    return serialize(msg)


@api_router.get("/chat")
async def list_chat(patient_id: str, user: dict = Depends(get_current_user)):
    if user['role'] not in ('caregiver', 'responsible'):
        raise HTTPException(403, "Apenas cuidadores/responsáveis veem o chat")
    await assert_access_to_patient(user, patient_id)
    msgs = await db.chat.find({"patient_id": patient_id}).sort("created_at", 1).limit(500).to_list(500)
    return [serialize(m) for m in msgs]


# ===== Health =====
@api_router.get("/")
async def root():
    return {"message": "CuidaMais API", "status": "ok"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
