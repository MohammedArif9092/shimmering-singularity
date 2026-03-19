import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
JWT_SECRET: str = os.getenv("JWT_SECRET", "")

def get_supabase_client() -> Client:
    """Get a Supabase client using the anon key."""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase_admin() -> Client:
    """Get a Supabase client using the service role key (admin access)."""
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
