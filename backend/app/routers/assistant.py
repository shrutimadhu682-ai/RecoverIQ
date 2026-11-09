from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import AIConversation
from app.schemas.schemas import AssistantRequest, AssistantResponse
from app.services.ai_assistant_service import answer_financial_query

router = APIRouter(prefix="/assistant", tags=["AI Financial Assistant"])

@router.post("/chat", response_model=AssistantResponse)
def chat_with_assistant(
    request: AssistantRequest,
    db: Session = Depends(get_db)
):
    answer = answer_financial_query(db, request.message)

    # Persist conversation
    convo = AIConversation(
        query=request.message,
        response_text=answer["reply"],
        structured_data=answer.get("structured_data")
    )
    db.add(convo)
    db.commit()

    return AssistantResponse(
        reply=answer["reply"],
        intent=answer["intent"],
        structured_data=answer.get("structured_data"),
        suggested_actions=answer.get("suggested_actions", [])
    )
