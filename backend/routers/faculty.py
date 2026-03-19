from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user, require_role
from config import get_supabase_client
from models.schemas import MarkAttendanceRequest, CreateAssignmentRequest, BulkMarksRequest, CreateAnnouncementRequest

router = APIRouter()


@router.get("/profile")
async def get_faculty_profile(user=Depends(require_role(["faculty"]))):
    """Get the current faculty's full profile."""
    supabase = get_supabase_client()
    faculty = supabase.table("faculty").select(
        "*, departments(name, code)"
    ).eq("user_id", user["id"]).single().execute()

    if not faculty.data:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    return {**user, "faculty": faculty.data}


@router.get("/courses")
async def get_courses(user=Depends(require_role(["faculty"]))):
    """Get courses taught by this faculty."""
    supabase = get_supabase_client()
    faculty = supabase.table("faculty").select("id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not faculty.data:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    courses = supabase.table("courses").select(
        "*, departments(name, code)"
    ).eq("faculty_id", faculty.data["id"]).execute()

    return courses.data or []


@router.get("/courses/{course_id}/students")
async def get_course_students(course_id: str, user=Depends(require_role(["faculty"]))):
    """Get all students enrolled in a course (by department + semester match)."""
    supabase = get_supabase_client()

    course = supabase.table("courses").select("*").eq("id", course_id).single().execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Course not found")

    students = supabase.table("students").select(
        "*, users(name, email)"
    ).eq("department_id", course.data["department_id"]).eq(
        "semester", course.data["semester"]
    ).execute()

    return students.data or []


@router.post("/attendance")
async def mark_attendance(request: MarkAttendanceRequest, user=Depends(require_role(["faculty"]))):
    """Mark attendance for students in a course."""
    supabase = get_supabase_client()
    faculty = supabase.table("faculty").select("id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not faculty.data:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    records = []
    for record in request.records:
        records.append({
            "student_id": record.student_id,
            "course_id": request.course_id,
            "date": request.date,
            "status": record.status.value,
            "marked_by": faculty.data["id"],
        })

    result = supabase.table("attendance").upsert(records).execute()
    return {"message": f"Attendance marked for {len(records)} students", "data": result.data}


@router.post("/assignments")
async def create_assignment(request: CreateAssignmentRequest, user=Depends(require_role(["faculty"]))):
    """Create a new assignment for a course."""
    supabase = get_supabase_client()
    faculty = supabase.table("faculty").select("id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not faculty.data:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    result = supabase.table("assignments").insert({
        "course_id": request.course_id,
        "title": request.title,
        "description": request.description,
        "due_date": request.due_date,
        "max_marks": request.max_marks,
        "created_by": faculty.data["id"],
    }).execute()

    return {"message": "Assignment created successfully", "data": result.data}


@router.get("/assignments")
async def get_faculty_assignments(user=Depends(require_role(["faculty"]))):
    """Get all assignments created by this faculty."""
    supabase = get_supabase_client()
    faculty = supabase.table("faculty").select("id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not faculty.data:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    assignments = supabase.table("assignments").select(
        "*, courses(name, code)"
    ).eq("created_by", faculty.data["id"]).order("due_date", desc=True).execute()

    return assignments.data or []


@router.get("/assignments/{assignment_id}/submissions")
async def get_submissions(assignment_id: str, user=Depends(require_role(["faculty"]))):
    """Get all submissions for a specific assignment."""
    supabase = get_supabase_client()

    submissions = supabase.table("submissions").select(
        "*, students(roll_number, users(name, email))"
    ).eq("assignment_id", assignment_id).execute()

    return submissions.data or []


@router.post("/marks")
async def enter_marks(request: BulkMarksRequest, user=Depends(require_role(["faculty"]))):
    """Enter marks for multiple students in a course."""
    supabase = get_supabase_client()

    records = []
    for m in request.marks:
        records.append({
            "student_id": m["student_id"],
            "course_id": request.course_id,
            "exam_type": request.exam_type.value,
            "marks_obtained": m["marks_obtained"],
            "max_marks": request.max_marks,
        })

    result = supabase.table("marks").upsert(records).execute()
    return {"message": f"Marks entered for {len(records)} students", "data": result.data}


@router.post("/announcements")
async def create_announcement(request: CreateAnnouncementRequest, user=Depends(require_role(["faculty"]))):
    """Post an announcement for a course."""
    supabase = get_supabase_client()
    faculty = supabase.table("faculty").select("id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not faculty.data:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    result = supabase.table("announcements").insert({
        "title": request.title,
        "content": request.content,
        "course_id": request.course_id,
        "posted_by": faculty.data["id"],
    }).execute()

    return {"message": "Announcement posted successfully", "data": result.data}


@router.get("/announcements")
async def get_announcements(user=Depends(require_role(["faculty"]))):
    """Get announcements posted by this faculty."""
    supabase = get_supabase_client()
    faculty = supabase.table("faculty").select("id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not faculty.data:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    announcements = supabase.table("announcements").select(
        "*, courses(name, code)"
    ).eq("posted_by", faculty.data["id"]).order("created_at", desc=True).execute()

    return announcements.data or []
