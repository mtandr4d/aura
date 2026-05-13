"""
CuidaMais Backend Test Suite
Tests all endpoints across 3 roles (patient/caregiver/responsible).
"""
import os
import time
import uuid
import pytest
import requests
from pathlib import Path

# Load EXPO_PUBLIC_BACKEND_URL from frontend/.env
FRONTEND_ENV = Path('/app/frontend/.env')
BASE_URL = None
for line in FRONTEND_ENV.read_text().splitlines():
    if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
        BASE_URL = line.split('=', 1)[1].strip().strip('"').rstrip('/')
        break
assert BASE_URL, "EXPO_PUBLIC_BACKEND_URL not found"
API = f"{BASE_URL}/api"

# Unique suffix to avoid collisions
SUFFIX = uuid.uuid4().hex[:8]


def _post(path, json=None, token=None):
    h = {"Content-Type": "application/json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return requests.post(f"{API}{path}", json=json, headers=h, timeout=15)


def _get(path, token=None, params=None):
    h = {}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return requests.get(f"{API}{path}", headers=h, params=params, timeout=15)


def _patch(path, json=None, token=None):
    h = {"Content-Type": "application/json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return requests.patch(f"{API}{path}", json=json, headers=h, timeout=15)


def _delete(path, token=None):
    h = {}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return requests.delete(f"{API}{path}", headers=h, timeout=15)


@pytest.fixture(scope="session")
def users():
    """Register patient + caregiver + responsible and link both."""
    patient_email = f"TEST_pat_{SUFFIX}@cm.com"
    caregiver_email = f"TEST_care_{SUFFIX}@cm.com"
    responsible_email = f"TEST_resp_{SUFFIX}@cm.com"
    other_pat_email = f"TEST_pat2_{SUFFIX}@cm.com"
    other_care_email = f"TEST_care2_{SUFFIX}@cm.com"

    pat = _post("/auth/register", {
        "email": patient_email, "password": "senha123",
        "full_name": "Test Patient", "role": "patient"
    }).json()
    care = _post("/auth/register", {
        "email": caregiver_email, "password": "senha123",
        "full_name": "Test Caregiver", "role": "caregiver"
    }).json()
    resp = _post("/auth/register", {
        "email": responsible_email, "password": "senha123",
        "full_name": "Test Responsible", "role": "responsible"
    }).json()
    other_pat = _post("/auth/register", {
        "email": other_pat_email, "password": "senha123",
        "full_name": "Other Patient", "role": "patient"
    }).json()
    other_care = _post("/auth/register", {
        "email": other_care_email, "password": "senha123",
        "full_name": "Other Caregiver", "role": "caregiver"
    }).json()

    code = pat["user"]["patient_code"]
    # link
    _post("/patients/link", {"patient_code": code}, token=care["access_token"])
    _post("/patients/link", {"patient_code": code}, token=resp["access_token"])

    return {
        "patient": pat, "caregiver": care, "responsible": resp,
        "other_patient": other_pat, "other_caregiver": other_care,
        "patient_code": code,
    }


# ===== Auth =====
class TestAuth:
    def test_register_patient_returns_code(self):
        email = f"TEST_solo_{uuid.uuid4().hex[:6]}@cm.com"
        r = _post("/auth/register", {
            "email": email, "password": "senha123",
            "full_name": "Solo Patient", "role": "patient"
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data
        assert data["user"]["role"] == "patient"
        code = data["user"]["patient_code"]
        assert code and len(code) == 6, f"patient_code must be 6 chars, got {code!r}"
        # No ambiguous chars (no 0,1,I,O)
        for c in code:
            assert c in "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

    def test_register_caregiver_no_code(self):
        email = f"TEST_solo_c_{uuid.uuid4().hex[:6]}@cm.com"
        r = _post("/auth/register", {
            "email": email, "password": "senha123",
            "full_name": "Solo Care", "role": "caregiver"
        })
        assert r.status_code == 200
        assert r.json()["user"].get("patient_code") is None

    def test_register_duplicate_email(self, users):
        r = _post("/auth/register", {
            "email": users["patient"]["user"]["email"],
            "password": "senha123", "full_name": "Dup User", "role": "patient"
        })
        assert r.status_code == 400

    def test_login_success(self, users):
        r = _post("/auth/login", {
            "email": users["patient"]["user"]["email"], "password": "senha123"
        })
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_wrong_password(self, users):
        r = _post("/auth/login", {
            "email": users["patient"]["user"]["email"], "password": "wrong"
        })
        assert r.status_code == 401

    def test_me_returns_current_user(self, users):
        r = _get("/auth/me", token=users["caregiver"]["access_token"])
        assert r.status_code == 200
        assert r.json()["email"] == users["caregiver"]["user"]["email"]

    def test_me_no_token(self):
        r = _get("/auth/me")
        assert r.status_code in (401, 403)


# ===== Patient Linking =====
class TestLinking:
    def test_link_existing(self, users):
        r = _post("/patients/link", {"patient_code": users["patient_code"]},
                  token=users["caregiver"]["access_token"])
        assert r.status_code == 200
        assert "patient" in r.json()

    def test_link_invalid_code(self, users):
        r = _post("/patients/link", {"patient_code": "ZZZZZZ"},
                  token=users["caregiver"]["access_token"])
        assert r.status_code == 404

    def test_patient_cannot_link(self, users):
        r = _post("/patients/link", {"patient_code": users["patient_code"]},
                  token=users["patient"]["access_token"])
        assert r.status_code == 403

    def test_linked_patients_list(self, users):
        r = _get("/patients/linked", token=users["caregiver"]["access_token"])
        assert r.status_code == 200
        ids = [p["id"] for p in r.json()]
        assert users["patient"]["user"]["id"] in ids

    def test_linked_for_patient_returns_self(self, users):
        r = _get("/patients/linked", token=users["patient"]["access_token"])
        assert r.status_code == 200
        assert r.json()[0]["id"] == users["patient"]["user"]["id"]


# ===== Medications =====
class TestMedications:
    def test_create_and_list(self, users):
        pid = users["patient"]["user"]["id"]
        r = _post("/medications", {
            "patient_id": pid, "name": "TEST_Donepezila",
            "dosage": "5mg", "schedule_time": "08:00", "notes": "manhã"
        }, token=users["caregiver"]["access_token"])
        assert r.status_code == 200, r.text
        med = r.json()
        assert "_id" not in med
        assert med["name"] == "TEST_Donepezila"

        lst = _get("/medications", token=users["caregiver"]["access_token"],
                   params={"patient_id": pid})
        assert lst.status_code == 200
        assert any(m["id"] == med["id"] for m in lst.json())

    def test_log_medication(self, users):
        pid = users["patient"]["user"]["id"]
        med = _post("/medications", {
            "patient_id": pid, "name": "TEST_Med2",
            "dosage": "10mg", "schedule_time": "20:00"
        }, token=users["caregiver"]["access_token"]).json()
        r = _post("/medications/log", {
            "medication_id": med["id"], "given": True, "notes": "ok"
        }, token=users["caregiver"]["access_token"])
        assert r.status_code == 200
        log = r.json()
        assert log["given"] is True
        assert "_id" not in log

        logs = _get("/medications/logs", token=users["caregiver"]["access_token"],
                    params={"patient_id": pid})
        assert logs.status_code == 200
        assert any(l["id"] == log["id"] for l in logs.json())

    def test_unauthorized_user_cannot_create_med(self, users):
        pid = users["patient"]["user"]["id"]
        r = _post("/medications", {
            "patient_id": pid, "name": "X", "dosage": "1", "schedule_time": "09:00"
        }, token=users["other_caregiver"]["access_token"])
        assert r.status_code == 403

    def test_patient_cannot_create_med(self, users):
        pid = users["patient"]["user"]["id"]
        r = _post("/medications", {
            "patient_id": pid, "name": "X", "dosage": "1", "schedule_time": "09:00"
        }, token=users["patient"]["access_token"])
        assert r.status_code == 403


# ===== Activities =====
class TestActivities:
    def test_create_and_list(self, users):
        pid = users["patient"]["user"]["id"]
        r = _post("/activities", {
            "patient_id": pid, "type": "note", "description": "TEST_atividade"
        }, token=users["caregiver"]["access_token"])
        assert r.status_code == 200
        a = r.json()
        assert "_id" not in a
        assert a["type"] == "note"

        # responsible can also see
        lst = _get("/activities", token=users["responsible"]["access_token"],
                   params={"patient_id": pid})
        assert lst.status_code == 200
        assert any(x["id"] == a["id"] for x in lst.json())

    def test_unauthorized_403(self, users):
        pid = users["patient"]["user"]["id"]
        r = _get("/activities", token=users["other_caregiver"]["access_token"],
                 params={"patient_id": pid})
        assert r.status_code == 403


# ===== Shopping =====
class TestShopping:
    def test_full_crud(self, users):
        pid = users["patient"]["user"]["id"]
        c = _post("/shopping", {
            "patient_id": pid, "item": "TEST_Pão", "category": "food", "quantity": "2"
        }, token=users["responsible"]["access_token"])
        assert c.status_code == 200
        item = c.json()
        assert item["purchased"] is False
        assert "_id" not in item

        u = _patch(f"/shopping/{item['id']}", {"purchased": True},
                   token=users["responsible"]["access_token"])
        assert u.status_code == 200
        assert u.json()["purchased"] is True

        lst = _get("/shopping", token=users["responsible"]["access_token"],
                   params={"patient_id": pid})
        assert any(i["id"] == item["id"] and i["purchased"] for i in lst.json())

        d = _delete(f"/shopping/{item['id']}", token=users["responsible"]["access_token"])
        assert d.status_code == 200


# ===== Visits =====
class TestVisits:
    def test_only_responsible_creates(self, users):
        pid = users["patient"]["user"]["id"]
        r = _post("/visits", {
            "patient_id": pid,
            "requested_date": "2026-02-01T10:00:00",
            "reason": "TEST_visita"
        }, token=users["caregiver"]["access_token"])
        assert r.status_code == 403

    def test_create_and_status_update(self, users):
        pid = users["patient"]["user"]["id"]
        r = _post("/visits", {
            "patient_id": pid,
            "requested_date": "2026-02-01T10:00:00",
            "reason": "TEST_consulta"
        }, token=users["responsible"]["access_token"])
        assert r.status_code == 200
        v = r.json()
        assert v["status"] == "pending"
        assert "_id" not in v

        u = _patch(f"/visits/{v['id']}", {"status": "accepted"},
                   token=users["caregiver"]["access_token"])
        assert u.status_code == 200
        assert u.json()["status"] == "accepted"


# ===== SOS =====
class TestSOS:
    def test_only_patient_sends(self, users):
        r = _post("/sos", {"latitude": -23.5, "longitude": -46.6, "message": "ajuda"},
                  token=users["caregiver"]["access_token"])
        assert r.status_code == 403

    def test_patient_sends_and_caregiver_lists(self, users):
        r = _post("/sos", {"latitude": -23.5, "longitude": -46.6},
                  token=users["patient"]["access_token"])
        assert r.status_code == 200
        s = r.json()
        assert "_id" not in s
        assert s["resolved"] is False

        pid = users["patient"]["user"]["id"]
        lst = _get("/sos", token=users["caregiver"]["access_token"], params={"patient_id": pid})
        assert lst.status_code == 200
        assert any(x["id"] == s["id"] for x in lst.json())

        res = _patch(f"/sos/{s['id']}/resolve", token=users["responsible"]["access_token"])
        assert res.status_code == 200


# ===== Location =====
class TestLocation:
    def test_patient_updates_and_others_read(self, users):
        r = _post("/location", {"latitude": -23.55, "longitude": -46.63, "accuracy": 10},
                  token=users["patient"]["access_token"])
        assert r.status_code == 200
        assert "_id" not in r.json()

        pid = users["patient"]["user"]["id"]
        g = _get(f"/location/{pid}", token=users["responsible"]["access_token"])
        assert g.status_code == 200
        body = g.json()
        assert body and body["latitude"] == -23.55

    def test_caregiver_cannot_update(self, users):
        r = _post("/location", {"latitude": 1, "longitude": 1},
                  token=users["caregiver"]["access_token"])
        assert r.status_code == 403

    def test_unauthorized_read_403(self, users):
        pid = users["patient"]["user"]["id"]
        r = _get(f"/location/{pid}", token=users["other_caregiver"]["access_token"])
        assert r.status_code == 403


# ===== Chat =====
class TestChat:
    def test_caregiver_to_responsible(self, users):
        pid = users["patient"]["user"]["id"]
        m1 = _post("/chat", {"patient_id": pid, "text": "TEST_oi"},
                   token=users["caregiver"]["access_token"])
        assert m1.status_code == 200
        assert "_id" not in m1.json()

        m2 = _post("/chat", {"patient_id": pid, "text": "TEST_oi de volta"},
                   token=users["responsible"]["access_token"])
        assert m2.status_code == 200

        lst = _get("/chat", token=users["responsible"]["access_token"],
                   params={"patient_id": pid})
        assert lst.status_code == 200
        texts = [m["text"] for m in lst.json()]
        assert "TEST_oi" in texts and "TEST_oi de volta" in texts

    def test_patient_cannot_chat(self, users):
        pid = users["patient"]["user"]["id"]
        r = _post("/chat", {"patient_id": pid, "text": "x"},
                  token=users["patient"]["access_token"])
        assert r.status_code == 403

    def test_unlinked_user_cannot_read(self, users):
        pid = users["patient"]["user"]["id"]
        r = _get("/chat", token=users["other_caregiver"]["access_token"],
                 params={"patient_id": pid})
        assert r.status_code == 403
