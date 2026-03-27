from typing import Dict, List, Literal
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[Message] = Field(default_factory=list)
    state: Dict[str, str] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    reply: str
    state_update: Dict[str, str]
    done: bool


app = FastAPI(title="Dummy AI Chat Service")

# Configure CORS with allowed origins from environment
def get_allowed_origins():
    """Parse ALLOWED_ORIGINS env var or use defaults"""
    origins_env = os.getenv("ALLOWED_ORIGINS", "")
    if origins_env:
        return [origin.strip() for origin in origins_env.split(",") if origin.strip()]
    # Default for development
    return ["http://localhost:5173", "http://localhost:3000", "http://localhost:6000"]


allowed_origins = get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEPARTMENT_KEYWORDS = {
    "Water": ["water", "pipeline", "leak", "tap", "drainage"],
    "Electricity": ["electricity", "power", "transformer", "voltage", "outage"],
    "Sanitation": ["garbage", "waste", "sanitation", "cleaning", "sewage"],
    "Roads": ["road", "pothole", "street", "footpath", "traffic signal"],
    "Transport": ["bus", "transport", "metro", "route", "auto stand"],
    "Police": ["police", "theft", "unsafe", "harassment", "crime"],
    "Health": ["hospital", "clinic", "health", "medical", "ambulance"],
    "Education": ["school", "college", "teacher", "classroom", "education"],
}

PRIORITY_KEYWORDS = {
    "Critical": ["urgent", "critical", "emergency", "danger", "immediately"],
    "High": ["serious", "high", "important", "major"],
    "Low": ["minor", "low", "small"],
}


def infer_department(text: str) -> str:
    lowered = text.lower()
    for department, keywords in DEPARTMENT_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            return department
    return "General"


def infer_priority(text: str) -> str:
    lowered = text.lower()
    for priority, keywords in PRIORITY_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            return priority
    return "Medium"


def infer_location(text: str) -> str | None:
    lowered = text.lower()
    markers = [" at ", " near ", " in ", " on ", " from "]
    for marker in markers:
        if marker in lowered:
            start = lowered.find(marker) + len(marker)
            location = text[start:].strip(" .,!?")
            if location:
                return location
    return None


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    user_messages = [
        message.content.strip()
        for message in request.messages
        if message.role == "user" and message.content.strip()
    ]
    latest_message = user_messages[-1] if user_messages else ""
    merged_state = dict(request.state)
    state_update: Dict[str, str] = {}

    if latest_message:
        if len(latest_message) > 15 and "complaint" not in merged_state:
            state_update["complaint"] = latest_message
        if "department" not in merged_state:
            state_update["department"] = infer_department(latest_message)
        if "priority" not in merged_state:
            state_update["priority"] = infer_priority(latest_message)
        if "location" not in merged_state:
            inferred_location = infer_location(latest_message)
            if inferred_location:
                state_update["location"] = inferred_location

    merged_state.update(state_update)

    missing_fields = [
        field
        for field in ["complaint", "department", "location"]
        if not merged_state.get(field)
    ]

    if not user_messages:
        return ChatResponse(
            reply="Please describe your complaint. Mention what happened and where it happened.",
            state_update={},
            done=False,
        )

    if missing_fields:
        prompts = {
            "complaint": "Please describe the issue in one message so I can register the complaint.",
            "department": "Which department should handle this? For example Water, Electricity, Roads, or Sanitation.",
            "location": "Please share the exact location or landmark for this complaint.",
        }
        next_field = missing_fields[0]
        return ChatResponse(
            reply=prompts[next_field],
            state_update=state_update,
            done=False,
        )

    summary = (
        f"I have your complaint for {merged_state['department']} at "
        f"{merged_state['location']} with {merged_state.get('priority', 'Medium')} priority. "
        "I am submitting it now."
    )
    return ChatResponse(reply=summary, state_update=state_update, done=True)


@app.post("/api/complaint", response_model=ChatResponse)
def complaint(request: dict):
    text = request.get("text", "")
    messages = [{"role": "user", "content": text}]
    state = {}
    chat_req = ChatRequest(messages=messages, state=state)
    return chat(chat_req)


@app.post("/api/reply", response_model=ChatResponse)
def reply(request: dict):
    return ChatResponse(
        reply="Message received. Please provide more details or confirm the complaint.",
        state_update={},
        done=False,
    )
