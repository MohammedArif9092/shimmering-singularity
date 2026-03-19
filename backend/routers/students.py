from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user, require_role
from config import get_supabase_client
from models.schemas import SubmitAssignmentRequest, ApplyJobRequest

router = APIRouter()


@router.get("/profile")
async def get_student_profile(user=Depends(require_role(["student"]))):
    """Get the current student's full profile."""
    supabase = get_supabase_client()
    student = supabase.table("students").select(
        "*, departments(name, code)"
    ).eq("user_id", user["id"]).single().execute()

    if not student.data:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return {**user, "student": student.data}


@router.get("/timetable")
async def get_timetable(user=Depends(require_role(["student"]))):
    """Get the student's weekly timetable."""
    supabase = get_supabase_client()

    # Get student record
    student = supabase.table("students").select("id, semester, department_id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not student.data:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Get courses for this student's semester/department
    courses = supabase.table("courses").select("id").eq(
        "department_id", student.data["department_id"]
    ).eq("semester", student.data["semester"]).execute()

    course_ids = [c["id"] for c in (courses.data or [])]
    if not course_ids:
        return []

    timetable = supabase.table("timetable").select(
        "*, courses(name, code, faculty(users(name)))"
    ).in_("course_id", course_ids).order("day_of_week").order("start_time").execute()

    return timetable.data or []


@router.get("/attendance")
async def get_attendance(user=Depends(require_role(["student"]))):
    """Get the student's attendance records grouped by course."""
    supabase = get_supabase_client()
    student = supabase.table("students").select("id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not student.data:
        raise HTTPException(status_code=404, detail="Student profile not found")

    records = supabase.table("attendance").select(
        "*, courses(name, code)"
    ).eq("student_id", student.data["id"]).order("date", desc=True).execute()

    return records.data or []


@router.get("/marks")
async def get_marks(user=Depends(require_role(["student"]))):
    """Get the student's marks/results."""
    supabase = get_supabase_client()
    student = supabase.table("students").select("id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not student.data:
        raise HTTPException(status_code=404, detail="Student profile not found")

    marks = supabase.table("marks").select(
        "*, courses(name, code)"
    ).eq("student_id", student.data["id"]).execute()

    return marks.data or []


@router.get("/assignments")
async def get_assignments(user=Depends(require_role(["student"]))):
    """Get assignments for the student's courses."""
    supabase = get_supabase_client()
    student = supabase.table("students").select("id, semester, department_id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not student.data:
        raise HTTPException(status_code=404, detail="Student profile not found")

    courses = supabase.table("courses").select("id").eq(
        "department_id", student.data["department_id"]
    ).eq("semester", student.data["semester"]).execute()

    course_ids = [c["id"] for c in (courses.data or [])]
    if not course_ids:
        return []

    assignments = supabase.table("assignments").select(
        "*, courses(name, code)"
    ).in_("course_id", course_ids).order("due_date", desc=True).execute()

    # Include submission status
    submissions = supabase.table("submissions").select("assignment_id, submitted_at, grade").eq(
        "student_id", student.data["id"]
    ).execute()

    sub_map = {s["assignment_id"]: s for s in (submissions.data or [])}
    result = []
    for a in (assignments.data or []):
        a["submission"] = sub_map.get(a["id"])
        result.append(a)

    return result


@router.post("/submissions")
async def submit_assignment(request: SubmitAssignmentRequest, user=Depends(require_role(["student"]))):
    """Submit an assignment."""
    supabase = get_supabase_client()
    student = supabase.table("students").select("id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not student.data:
        raise HTTPException(status_code=404, detail="Student profile not found")

    result = supabase.table("submissions").upsert({
        "assignment_id": request.assignment_id,
        "student_id": student.data["id"],
        "content": request.content,
        "file_url": request.file_url,
    }).execute()

    return {"message": "Assignment submitted successfully", "data": result.data}


@router.get("/jobs")
async def get_jobs(user=Depends(require_role(["student"]))):
    """Get available job and internship opportunities."""
    supabase = get_supabase_client()
    jobs = supabase.table("jobs").select("*").eq(
        "status", "active"
    ).order("created_at", desc=True).execute()
    return jobs.data or []


@router.post("/applications")
async def apply_for_job(request: ApplyJobRequest, user=Depends(require_role(["student"]))):
    """Apply for a job/internship."""
    supabase = get_supabase_client()
    student = supabase.table("students").select("id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not student.data:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Check if already applied
    existing = supabase.table("applications").select("id").eq(
        "job_id", request.job_id
    ).eq("student_id", student.data["id"]).execute()

    if existing.data:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    result = supabase.table("applications").insert({
        "job_id": request.job_id,
        "student_id": student.data["id"],
        "resume_url": request.resume_url,
        "cover_letter": request.cover_letter,
    }).execute()

    return {"message": "Application submitted successfully", "data": result.data}


@router.get("/applications")
async def get_my_applications(user=Depends(require_role(["student"]))):
    """Get the student's job applications."""
    supabase = get_supabase_client()
    student = supabase.table("students").select("id").eq(
        "user_id", user["id"]
    ).single().execute()

    if not student.data:
        raise HTTPException(status_code=404, detail="Student profile not found")

    applications = supabase.table("applications").select(
        "*, jobs(title, company, type, status)"
    ).eq("student_id", student.data["id"]).order("applied_at", desc=True).execute()

    return applications.data or []


@router.get("/notifications")
async def get_notifications(user=Depends(require_role(["student"]))):
    """Get notifications for the student."""
    supabase = get_supabase_client()
    notifications = supabase.table("notifications").select("*").or_(
        f'target_role.eq.student,target_role.eq.all,target_user_id.eq.{user["id"]}'
    ).order("created_at", desc=True).limit(50).execute()

    return notifications.data or []
