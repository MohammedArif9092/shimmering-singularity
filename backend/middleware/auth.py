from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from config import JWT_SECRET, get_supabase_client
from functools import wraps
from typing import List

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user data."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        # Fetch user profile from our users table
        supabase = get_supabase_client()
        result = supabase.table("users").select("*").eq("id", user_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="User profile not found")

        return result.data
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_role(allowed_roles: List[str]):
    """Dependency that checks if the current user has one of the allowed roles."""
    async def role_checker(user=Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
            )
        return user
    return role_checker
