from typing import Dict, List, Literal

from fastapi import FastAPI
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
