from fastapi import APIRouter, Depends, Response, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy import select, func, desc, and_, exists
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import os
import uuid
import shutil
from typing import List, Optional
from datetime import datetime

from app.db import auth, models
from app.db.session import get_db
from app.reqtypes import schemas
from app.core.config import UPLOAD_DIR

router = APIRouter()

_FORUM_DIR = os.path.join(UPLOAD_DIR, "forum")
os.makedirs(_FORUM_DIR, exist_ok=True)

@router.get("/questions", response_model=List[schemas.QuestionOut])
async def get_questions(
    filter_type: str = Query("all", regex="^(all|unanswered|expert)$"),
    sort_by: str = Query("newest", regex="^(newest|upvotes)$"),
    db: AsyncSession = Depends(get_db)
):
    # Base query
    query = select(models.Question).options(
        selectinload(models.Question.user),
        selectinload(models.Question.answers),
        selectinload(models.Question.votes)
    )

    # Filtering logic
    if filter_type == "unanswered":
        # Logic for "unanswered": Return questions with 0 answers.
        query = query.filter(~exists().where(models.Answer.question_id == models.Question.id))
    elif filter_type == "expert":
        # Logic for "expert": Return questions that have at least one answer by an expert.
        expert_answer_exists = exists().where(
            and_(
                models.Answer.question_id == models.Question.id,
                models.Answer.user_id == models.User.id,
                models.User.is_expert == True
            )
        )
        query = query.filter(expert_answer_exists)

    # Execute
    result = await db.execute(query)
    questions = result.unique().scalars().all()

    # Pydantic doesn't handle relationship count/aggregation easily in one go with selectinload
    # So we calculate them for the response
    out = []
    for q in questions:
        q_out = schemas.QuestionOut.model_validate(q)
        q_out.upvotes = len(q.votes)
        q_out.answers_count = len(q.answers)
        out.append(q_out)

    # Sorting
    if sort_by == "upvotes":
        out.sort(key=lambda x: x.upvotes, reverse=True)
    else: # newest
        out.sort(key=lambda x: x.created_at, reverse=True)

    return out

@router.get("/questions/{question_id}", response_model=schemas.QuestionDetailOut)
async def get_question(question_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Question).options(
            selectinload(models.Question.user),
            selectinload(models.Question.votes),
            selectinload(models.Question.answers).selectinload(models.Answer.user),
            selectinload(models.Question.answers).selectinload(models.Answer.votes)
        ).filter(models.Question.id == question_id)
    )
    question = result.scalars().first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    out = schemas.QuestionDetailOut.model_validate(question)
    out.upvotes = len(question.votes)
    out.answers_count = len(question.answers)

    # Enrich answers with vote counts
    for idx, ans in enumerate(question.answers):
        out.answers[idx].upvotes = sum(1 for v in ans.votes if v.vote_type == 1)
        out.answers[idx].downvotes = sum(1 for v in ans.votes if v.vote_type == -1)

    return out

@router.post("/questions", response_model=schemas.QuestionOut)
async def create_question(
    title: str = Form(...),
    content: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(auth.get_user_from_cookie),
    db: AsyncSession = Depends(get_db)
):
    image_path = None
    if image:
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        file_ext = os.path.splitext(image.filename)[1] if image.filename else ".jpg"
        unique_name = f"{uuid.uuid4()}{file_ext}"
        save_path = os.path.join(_FORUM_DIR, unique_name)
        
        contents = await image.read()
        with open(save_path, "wb") as buffer:
            buffer.write(contents)
        
        image_path = f"/static/forum/{unique_name}"

    question = models.Question(
        title=title,
        content=content,
        image_path=image_path,
        user_id=current_user.id
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)

    # Return with user loaded
    result = await db.execute(
        select(models.Question).options(selectinload(models.Question.user)).filter(models.Question.id == question.id)
    )
    return result.scalars().first()

@router.post("/questions/{question_id}/vote")
async def vote_question(
    question_id: int,
    current_user: models.User = Depends(auth.get_user_from_cookie),
    db: AsyncSession = Depends(get_db)
):
    # Check duplicate
    existing = await db.execute(
        select(models.QuestionVote).filter(
            models.QuestionVote.user_id == current_user.id,
            models.QuestionVote.question_id == question_id
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Already upvoted")

    vote = models.QuestionVote(user_id=current_user.id, question_id=question_id)
    db.add(vote)
    await db.commit()
    return {"message": "Upvoted"}

@router.post("/questions/{question_id}/answer", response_model=schemas.AnswerOut)
async def create_answer(
    question_id: int,
    answer_in: schemas.AnswerCreate,
    current_user: models.User = Depends(auth.get_user_from_cookie),
    db: AsyncSession = Depends(get_db)
):
    answer = models.Answer(
        content=answer_in.content,
        question_id=question_id,
        user_id=current_user.id
    )
    db.add(answer)
    await db.commit()
    await db.refresh(answer)

    # Return with user loaded
    result = await db.execute(
        select(models.Answer).options(selectinload(models.Answer.user)).filter(models.Answer.id == answer.id)
    )
    return result.scalars().first()

@router.post("/answers/{answer_id}/vote")
async def vote_answer(
    answer_id: int,
    vote_in: schemas.AnswerVoteIn,
    current_user: models.User = Depends(auth.get_user_from_cookie),
    db: AsyncSession = Depends(get_db)
):
    if vote_in.vote_type not in [1, -1]:
        raise HTTPException(status_code=400, detail="Invalid vote type")

    # Check duplicate/existing
    existing = await db.execute(
        select(models.AnswerVote).filter(
            models.AnswerVote.user_id == current_user.id,
            models.AnswerVote.answer_id == answer_id
        )
    )
    vote = existing.scalars().first()

    if vote:
        if vote.vote_type == vote_in.vote_type:
            raise HTTPException(status_code=400, detail="Already voted this way")
        vote.vote_type = vote_in.vote_type
    else:
        vote = models.AnswerVote(
            user_id=current_user.id,
            answer_id=answer_id,
            vote_type=vote_in.vote_type
        )
        db.add(vote)
    
    await db.commit()
    return {"message": "Vote recorded"}
