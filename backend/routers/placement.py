from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import require_role
from config import get_supabase_client
from models.schemas import CreateJobRequest

router = APIRouter()


@router.get("/dashboard")
async def get_placement_dashboard(user=Depends(require_role(["placement_officer"]))):
    """Placement dashboard stats."""
    supabase = get_supabase_client()

    active_jobs = supabase.table("jobs").select("id", count="exact").eq("status", "active").execute()
    total_apps = supabase.table("applications").select("id", count="exact").execute()
    pending = supabase.table("applications").select("id", count="exact").eq("status", "pending").execute()
    shortlisted = supabase.table("applications").select("id", count="exact").eq("status", "shortlisted").execute()

    return {
        "active_jobs": active_jobs.count or 0,
        "total_applications": total_apps.count or 0,
        "pending_applications": pending.count or 0,
        "shortlisted": shortlisted.count or 0,
    }


@router.post("/jobs")
async def create_job(request: CreateJobRequest, user=Depends(require_role(["placement_officer"]))):
    """Post a new job/internship opportunity."""
    supabase = get_supabase_client()
    result = supabase.table("jobs").insert({
        "title": request.title,
        "company": request.company,
        "description": request.description,
        "type": request.type.value,
        "location": request.location,
        "salary": request.salary,
        "required_skills": request.required_skills,
        "deadline": request.deadline,
        "posted_by": user["id"],
    }).execute()
    return {"message": "Job posted successfully", "data": result.data}


@router.get("/jobs")
async def get_all_jobs(user=Depends(require_role(["placement_officer"]))):
    """Get all job postings."""
    supabase = get_supabase_client()
    result = supabase.table("jobs").select("*").order("created_at", desc=True).execute()
    return result.data or []


@router.patch("/jobs/{job_id}")
async def update_job_status(job_id: str, status: str, user=Depends(require_role(["placement_officer"]))):
    """Update job posting status (active/closed)."""
    supabase = get_supabase_client()
    result = supabase.table("jobs").update({"status": status}).eq("id", job_id).execute()
    return {"message": "Job status updated", "data": result.data}


@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, user=Depends(require_role(["placement_officer"]))):
    """Delete a job posting."""
    supabase = get_supabase_client()
    supabase.table("jobs").delete().eq("id", job_id).execute()
    return {"message": "Job deleted"}


@router.get("/applications")
async def get_all_applications(job_id: str = None, user=Depends(require_role(["placement_officer"]))):
    """Get all applications, optionally filtered by job."""
    supabase = get_supabase_client()
    query = supabase.table("applications").select(
        "*, jobs(title, company), students(roll_number, skills, cgpa, users(name, email))"
    )
    if job_id:
        query = query.eq("job_id", job_id)
    result = query.order("applied_at", desc=True).execute()
    return result.data or []


@router.patch("/applications/{app_id}")
async def update_application_status(
    app_id: str, status: str, user=Depends(require_role(["placement_officer"]))
):
    """Update application status (shortlisted/accepted/rejected)."""
    valid = ["pending", "shortlisted", "accepted", "rejected"]
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid}")

    supabase = get_supabase_client()
    result = supabase.table("applications").update({"status": status}).eq("id", app_id).execute()
    return {"message": "Application status updated", "data": result.data}


@router.get("/students")
async def get_student_profiles(
    department_id: str = None, skills: str = None,
    user=Depends(require_role(["placement_officer"]))
):
    """View student profiles with optional skill filtering."""
    supabase = get_supabase_client()
    query = supabase.table("students").select(
        "*, users(name, email), departments(name, code)"
    )
    if department_id:
        query = query.eq("department_id", department_id)
    result = query.order("cgpa", desc=True).execute()

    students = result.data or []

    # Basic keyword-based skill matching
    if skills:
        keywords = [s.strip().lower() for s in skills.split(",")]
        filtered = []
        for s in students:
            student_skills = (s.get("skills") or "").lower()
            if any(k in student_skills for k in keywords):
                filtered.append(s)
        return filtered

    return students
