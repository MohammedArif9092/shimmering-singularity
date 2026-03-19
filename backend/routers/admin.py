from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import require_role
from config import get_supabase_client, get_supabase_admin
from models.schemas import CreateDepartmentRequest, CreateCourseRequest, SendNotificationRequest

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_stats(user=Depends(require_role(["admin"]))):
    """Get overall system statistics for admin dashboard."""
    supabase = get_supabase_client()

    students = supabase.table("students").select("id", count="exact").execute()
    faculty = supabase.table("faculty").select("id", count="exact").execute()
    courses = supabase.table("courses").select("id", count="exact").execute()
    departments = supabase.table("departments").select("id", count="exact").execute()
    jobs = supabase.table("jobs").select("id", count="exact").eq("status", "active").execute()

    return {
        "total_students": students.count or 0,
        "total_faculty": faculty.count or 0,
        "total_courses": courses.count or 0,
        "total_departments": departments.count or 0,
        "active_jobs": jobs.count or 0,
    }


# ── User Management ─────────────────────────────────────
@router.get("/users")
async def get_all_users(role: str = None, user=Depends(require_role(["admin"]))):
    """Get all users, optionally filtered by role."""
    supabase = get_supabase_client()
    query = supabase.table("users").select("*")
    if role:
        query = query.eq("role", role)
    result = query.order("created_at", desc=True).execute()
    return result.data or []


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, user=Depends(require_role(["admin"]))):
    """Delete a user and their profile."""
    supabase_admin = get_supabase_admin()
    try:
        supabase_admin.table("users").delete().eq("id", user_id).execute()
        supabase_admin.auth.admin.delete_user(user_id)
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete user: {str(e)}")


@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, user=Depends(require_role(["admin"]))):
    """Update a user's role."""
    valid_roles = ["student", "faculty", "admin", "placement_officer"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")

    supabase = get_supabase_client()
    result = supabase.table("users").update({"role": role}).eq("id", user_id).execute()
    return {"message": "Role updated", "data": result.data}


# ── Department Management ────────────────────────────────
@router.get("/departments")
async def get_departments(user=Depends(require_role(["admin"]))):
    """Get all departments."""
    supabase = get_supabase_client()
    result = supabase.table("departments").select("*").order("name").execute()
    return result.data or []


@router.post("/departments")
async def create_department(request: CreateDepartmentRequest, user=Depends(require_role(["admin"]))):
    """Create a new department."""
    supabase = get_supabase_client()
    result = supabase.table("departments").insert({
        "name": request.name,
        "code": request.code,
    }).execute()
    return {"message": "Department created", "data": result.data}


@router.delete("/departments/{dept_id}")
async def delete_department(dept_id: str, user=Depends(require_role(["admin"]))):
    """Delete a department."""
    supabase = get_supabase_client()
    supabase.table("departments").delete().eq("id", dept_id).execute()
    return {"message": "Department deleted"}


# ── Course Management ────────────────────────────────────
@router.get("/courses")
async def get_courses(user=Depends(require_role(["admin"]))):
    """Get all courses."""
    supabase = get_supabase_client()
    result = supabase.table("courses").select(
        "*, departments(name, code), faculty(users(name))"
    ).order("code").execute()
    return result.data or []


@router.post("/courses")
async def create_course(request: CreateCourseRequest, user=Depends(require_role(["admin"]))):
    """Create a new course."""
    supabase = get_supabase_client()
    result = supabase.table("courses").insert({
        "name": request.name,
        "code": request.code,
        "department_id": request.department_id,
        "faculty_id": request.faculty_id,
        "semester": request.semester,
        "year": request.year,
        "credits": request.credits,
    }).execute()
    return {"message": "Course created", "data": result.data}


@router.delete("/courses/{course_id}")
async def delete_course(course_id: str, user=Depends(require_role(["admin"]))):
    """Delete a course."""
    supabase = get_supabase_client()
    supabase.table("courses").delete().eq("id", course_id).execute()
    return {"message": "Course deleted"}


# ── Reports ──────────────────────────────────────────────
@router.get("/reports/attendance")
async def attendance_report(department_id: str = None, user=Depends(require_role(["admin"]))):
    """Get attendance statistics."""
    supabase = get_supabase_client()
    query = supabase.table("attendance").select("status", count="exact")

    total = supabase.table("attendance").select("id", count="exact").execute()
    present = supabase.table("attendance").select("id", count="exact").eq("status", "present").execute()
    absent = supabase.table("attendance").select("id", count="exact").eq("status", "absent").execute()
    late = supabase.table("attendance").select("id", count="exact").eq("status", "late").execute()

    return {
        "total_records": total.count or 0,
        "present": present.count or 0,
        "absent": absent.count or 0,
        "late": late.count or 0,
        "attendance_rate": round((present.count or 0) / max(total.count or 1, 1) * 100, 1),
    }


@router.get("/reports/performance")
async def performance_report(user=Depends(require_role(["admin"]))):
    """Get overall student performance statistics."""
    supabase = get_supabase_client()
    marks = supabase.table("marks").select("marks_obtained, max_marks, exam_type").execute()

    if not marks.data:
        return {"average_score": 0, "total_exams": 0, "by_type": {}}

    by_type = {}
    total_pct = 0
    for m in marks.data:
        pct = (m["marks_obtained"] / m["max_marks"]) * 100 if m["max_marks"] > 0 else 0
        total_pct += pct
        etype = m["exam_type"]
        if etype not in by_type:
            by_type[etype] = {"count": 0, "total_pct": 0}
        by_type[etype]["count"] += 1
        by_type[etype]["total_pct"] += pct

    for etype in by_type:
        by_type[etype]["average"] = round(by_type[etype]["total_pct"] / by_type[etype]["count"], 1)

    return {
        "average_score": round(total_pct / len(marks.data), 1),
        "total_exams": len(marks.data),
        "by_type": by_type,
    }


# ── Notifications ────────────────────────────────────────
@router.post("/notifications")
async def send_notification(request: SendNotificationRequest, user=Depends(require_role(["admin"]))):
    """Send a notification to users."""
    supabase = get_supabase_client()
    result = supabase.table("notifications").insert({
        "title": request.title,
        "message": request.message,
        "target_role": request.target_role,
        "target_user_id": request.target_user_id,
        "sent_by": user["id"],
    }).execute()
    return {"message": "Notification sent", "data": result.data}


@router.get("/notifications")
async def get_all_notifications(user=Depends(require_role(["admin"]))):
    """Get all notifications sent."""
    supabase = get_supabase_client()
    result = supabase.table("notifications").select("*").order("created_at", desc=True).limit(100).execute()
    return result.data or []
