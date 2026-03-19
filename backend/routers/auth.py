from fastapi import APIRouter, HTTPException
from config import get_supabase_client, get_supabase_admin
from models.schemas import LoginRequest, RegisterRequest

router = APIRouter()


@router.post("/login")
async def login(request: LoginRequest):
    """Authenticate user with email/password via Supabase."""
    try:
        supabase = get_supabase_client()
        result = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })

        # Fetch user profile
        user_profile = supabase.table("users").select("*").eq("id", result.user.id).single().execute()

        return {
            "access_token": result.session.access_token,
            "refresh_token": result.session.refresh_token,
            "user": user_profile.data,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")


@router.post("/register")
async def register(request: RegisterRequest):
    """Register a new user with Supabase Auth and create profile."""
    try:
        supabase_admin = get_supabase_admin()
        supabase = get_supabase_client()

        # Create auth user
        auth_result = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
        })

        user_id = auth_result.user.id

        # Create user profile
        supabase_admin.table("users").insert({
            "id": user_id,
            "name": request.name,
            "email": request.email,
            "role": request.role.value,
        }).execute()

        # Create role-specific profile
        if request.role == "student":
            supabase_admin.table("students").insert({
                "user_id": user_id,
                "department_id": request.department_id,
                "year": request.year or 1,
                "semester": (request.year or 1) * 2 - 1,
                "roll_number": f"STU{user_id[:8].upper()}",
            }).execute()
        elif request.role == "faculty":
            supabase_admin.table("faculty").insert({
                "user_id": user_id,
                "department_id": request.department_id,
            }).execute()

        # Sign in to get tokens
        login_result = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })

        user_profile = supabase_admin.table("users").select("*").eq("id", user_id).single().execute()

        return {
            "access_token": login_result.session.access_token,
            "refresh_token": login_result.session.refresh_token,
            "user": user_profile.data,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")


@router.post("/logout")
async def logout():
    """Logout is handled client-side by clearing the token."""
    return {"message": "Logged out successfully"}
