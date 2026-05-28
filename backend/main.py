from typing import List, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
from pathlib import Path
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from enum import Enum
from dotenv import load_dotenv
import os
from elasticsearch import Elasticsearch

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SafePath AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://safepath-ndm95jjuv-sadhvikolis-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client()
elastic_client = None

try:
    elastic_endpoint = os.getenv("ELASTIC_ENDPOINT")
    elastic_api_key = os.getenv("ELASTIC_API_KEY")

    if elastic_endpoint and elastic_api_key:
        elastic_client = Elasticsearch(
            hosts=[elastic_endpoint],
            api_key=elastic_api_key,
        )

        logger.info("Elastic client initialized successfully.")
    else:
        logger.warning(
            "Elastic credentials not found. Falling back to local resource search."
        )

except Exception as e:
    logger.error(f"Elastic client initialization failed: {str(e)}")
    elastic_client = None

BASE_DIR = Path(__file__).resolve().parent

CONTACT_FILE = BASE_DIR / "fallback_emergency_contacts.json"
SAFE_RESOURCE_FILE = BASE_DIR / "safe_resources.json"

try:
    with open(CONTACT_FILE, "r") as f:
        emergency_contacts_db = json.load(f)
except FileNotFoundError:
    logger.warning(f"{CONTACT_FILE} not found. Emergency contacts fallback will be empty.")
    emergency_contacts_db = {}

try:
    with open(SAFE_RESOURCE_FILE, "r") as f:
        safe_resources_db = json.load(f)
except FileNotFoundError:
    logger.warning(f"{SAFE_RESOURCE_FILE} not found. Nearby resources will be empty.")
    safe_resources_db = []


class SafeResource(BaseModel):
    name: str
    type: str
    city: str
    state: str
    country: str
    phone: str
    availability: str
    verified: bool


class AssessRequest(BaseModel):
    message: str = Field(..., min_length=3, max_length=1000)
    location: str = Field(default="", max_length=200)


class Importance(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class EmergencyContact(BaseModel):
    title: str
    phone_no: str
    importance: Importance


class SafetyPlan(BaseModel):
    plan: List[str]


class AssessResponse(BaseModel):
    risk_level: str
    confidence: float
    reason: str
    safety_plan: SafetyPlan
    emergency_contacts: List[EmergencyContact]
    nearby_resources: List[SafeResource]
    disclaimer: str


class RiskClassification(BaseModel):
    risk_level: Importance
    confidence: float = Field(..., ge=0, le=1)
    reason: str = Field(..., max_length=300)


def get_default_contacts(database: dict) -> List[EmergencyContact]:
    usa_contacts = database.get("NORTH_AMERICA", {}).get("USA", [])
    return [EmergencyContact(**contact) for contact in usa_contacts]


def get_fallback_contacts(location_string: str, database: dict) -> List[EmergencyContact]:
    if not location_string:
        return get_default_contacts(database)

    parts = location_string.split(",")
    country_target = parts[-1].strip().lower()
    country_target_underscored = country_target.replace(" ", "_")

    for region, countries in database.items():
        if region == "GLOBAL_HOTLINES":
            continue

        for country_key, contact_list in countries.items():
            normalized_key = country_key.lower()

            if country_target == normalized_key or country_target_underscored == normalized_key:
                return [EmergencyContact(**contact) for contact in contact_list]

    return get_default_contacts(database)


def search_nearby_resources(location: str) -> List[SafeResource]:
    if not location:
        return []

    location_lower = location.lower()
    matches = []

    for resource in safe_resources_db:
        city = resource.get("city", "").lower()
        state = resource.get("state", "").lower()
        country = resource.get("country", "").lower()

        if (
            city in location_lower
            or state in location_lower
            or country in location_lower
        ):
            matches.append(SafeResource(**resource))

    return matches[:5]


def classify_risk(msg: str) -> RiskClassification:
    prompt = f"""
You are SafePath AI, a women's safety risk assessment assistant.

Classify the user's situation into exactly one risk level.

Risk level rules:
- CRITICAL = active violence, weapon present, assault, kidnapping risk, trapped, immediate life-threatening danger
- HIGH = stalking, being followed, threats, escalating harassment, unsafe isolated situation
- MEDIUM = concerning or uncomfortable situation without immediate danger
- LOW = general worry, uncertainty, planning ahead, or non-urgent concern

Return only valid JSON matching the schema.

User message:
{msg}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RiskClassification,
            temperature=0.1,
        ),
    )

    return RiskClassification.model_validate_json(response.text)


def generate_safety_plan(
    msg: str,
    classification: RiskClassification,
    location: str,
) -> SafetyPlan:
    prompt = f"""
You are SafePath AI, a women's safety planning assistant.

The user is in:
{location or "an unspecified location"}

Risk level:
{classification.risk_level.value}

Risk reasoning:
{classification.reason}

Situation:
{msg}

Generate exactly 5 short, practical, immediate safety steps.

Rules:
- Do NOT generate phone numbers
- Do NOT invent organizations
- Do NOT claim to contact police, emergency services, or trusted contacts
- Do NOT make legal or medical claims
- Prioritize public spaces, trusted people, emergency escalation, and user consent
- If risk is CRITICAL, first step should advise contacting local emergency services immediately if possible
- Keep advice calm, direct, and actionable

Return valid JSON only.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=SafetyPlan,
            temperature=0.3,
        ),
    )

    return SafetyPlan.model_validate_json(response.text)


@app.get("/")
def read_root():
    return {"status": "SafePath AI running"}

@app.get("/elastic-health")
def elastic_health():
    if elastic_client is None:
        return {
            "connected": False,
            "message": "Elastic client is not configured."
        }

    try:
        info = elastic_client.info()

        return {
            "connected": True,
            "cluster_name": info.get("cluster_name"),
            "version": info.get("version", {}).get("number"),
        }

    except Exception as e:
        return {
            "connected": False,
            "error": str(e),
        }

@app.post("/create-index")
def create_index():
    if elastic_client is None:
        return {
            "success": False,
            "message": "Elastic client not configured."
        }

    index_name = "safe_resources"

    mapping = {
        "mappings": {
            "properties": {
                "name": {"type": "text"},
                "type": {"type": "keyword"},
                "city": {"type": "text"},
                "state": {"type": "text"},
                "country": {"type": "text"},
                "phone": {"type": "text"},
                "availability": {"type": "text"},
                "verified": {"type": "boolean"},
            }
        }
    }

    try:
        exists = elastic_client.indices.exists(index=index_name)

        if exists:
            return {
                "success": True,
                "message": "Index already exists."
            }

        elastic_client.indices.create(
            index=index_name,
            body=mapping
        )

        return {
            "success": True,
            "message": "safe_resources index created."
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }

@app.post("/seed-resources")
def seed_resources():
    if elastic_client is None:
        return {
            "success": False,
            "message": "Elastic client not configured."
        }

    index_name = "safe_resources"

    try:
        count = 0

        for resource in safe_resources_db:
            elastic_client.index(
                index=index_name,
                document=resource
            )
            count += 1

        elastic_client.indices.refresh(index=index_name)

        return {
            "success": True,
            "message": f"Seeded {count} resources into Elastic."
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def search_elastic_resources(location: str) -> List[SafeResource]:
    if elastic_client is None or not location:
        return search_nearby_resources(location)

    try:
        response = elastic_client.search(
            index="safe_resources",
            query={
                "multi_match": {
                    "query": location,
                    "fields": ["city", "state", "country", "name", "type"]
                }
            },
            size=5
        )

        resources = []

        for hit in response["hits"]["hits"]:
            resources.append(SafeResource(**hit["_source"]))

        return resources

    except Exception as e:
        logger.error(f"Elastic resource search failed: {str(e)}")
        return search_nearby_resources(location)
    
@app.post("/assess", response_model=AssessResponse)
def assess(req: AssessRequest):
    classification: Optional[RiskClassification] = None

    try:
        classification = classify_risk(req.message)
        safety_plan = generate_safety_plan(req.message, classification, req.location)
        emergency_contacts = get_fallback_contacts(req.location, emergency_contacts_db)
        nearby_resources = search_elastic_resources(req.location)

        return AssessResponse(
            risk_level=classification.risk_level.value,
            confidence=classification.confidence,
            reason=classification.reason,
            safety_plan=safety_plan,
            emergency_contacts=emergency_contacts,
            nearby_resources=nearby_resources,
            disclaimer=(
                "SafePath AI is not a substitute for emergency services. "
                "If you are in immediate danger, call 911 or your local emergency number."
            ),
        )

    except Exception as e:
        logger.error(f"Gemini API failure detected: {str(e)}")

        fallback_contacts = get_fallback_contacts(req.location, emergency_contacts_db)
        nearby_resources = search_elastic_resources(req.location)

        return AssessResponse(
            risk_level=classification.risk_level.value if classification else "UNKNOWN",
            confidence=classification.confidence if classification else 0.0,
            reason=classification.reason if classification else "Risk classification was unavailable due to a system issue.",
            safety_plan=SafetyPlan(
                plan=[
                    "Move to a safe, public location immediately.",
                    "Call emergency services or a trusted person if you feel in danger.",
                    "Stay on the line with emergency services or a trusted contact.",
                    "Avoid returning to the unsafe location.",
                    "Seek help from a nearby business, security desk, or public place.",
                ]
            ),
            emergency_contacts=fallback_contacts,
            nearby_resources=nearby_resources,
            disclaimer=(
                "We encountered a network issue. "
                "Please use the emergency contacts below immediately if you need help."
            ),
        )