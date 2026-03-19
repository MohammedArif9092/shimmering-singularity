from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date, time
from enum import Enum


# ── Enums ───────────────────────────────────────────────
class UserRole(str, Enum):
    student = "student"
    faculty = "faculty"
    admin = "admin"
    placement_officer = "placement_officer"


class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"
    late = "late"


class ExamType(str, Enum):
    midterm = "midterm"
    final = "final"
    quiz = "quiz"
    assignment = "assignment"
    practical = "practical"


class JobType(str, Enum):
    job = "job"
    internship = "internship"


class ApplicationStatus(str, Enum):
    pending = "pending"
    shortlisted = "shortlisted"
    accepted = "accepted"
    rejected = "rejected"


# ── Auth ────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str = Field(min_length=6)
    role: UserRole = UserRole.student
    department_id: Optional[str] = None
    year: Optional[int] = None


class AuthResponse(BaseModel):
    access_token: str
    user: dict


# ── Attendance ──────────────────────────────────────────
class AttendanceRecord(BaseModel):
    student_id: str
    status: AttendanceStatus


class MarkAttendanceRequest(BaseModel):
    course_id: str
    date: str
    records: List[AttendanceRecord]


# ── Assignments ─────────────────────────────────────────
class CreateAssignmentRequest(BaseModel):
    course_id: str
    title: str
    description: Optional[str] = None
    due_date: str
    max_marks: int = 100


class SubmitAssignmentRequest(BaseModel):
    assignment_id: str
    content: Optional[str] = None
    file_url: Optional[str] = None


# ── Marks ───────────────────────────────────────────────
class EnterMarksRequest(BaseModel):
    student_id: str
    course_id: str
    exam_type: ExamType
    marks_obtained: float
    max_marks: float = 100


class BulkMarksRequest(BaseModel):
    course_id: str
    exam_type: ExamType
    max_marks: float = 100
    marks: List[dict]  # [{student_id, marks_obtained}]


# ── Jobs ────────────────────────────────────────────────
class CreateJobRequest(BaseModel):
    title: str
    company: str
    description: Optional[str] = None
    type: JobType
    location: Optional[str] = None
    salary: Optional[str] = None
    required_skills: Optional[str] = None
    deadline: Optional[str] = None


class ApplyJobRequest(BaseModel):
    job_id: str
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None


# ── Admin ───────────────────────────────────────────────
class CreateDepartmentRequest(BaseModel):
    name: str
    code: str


class CreateCourseRequest(BaseModel):
    name: str
    code: str
    department_id: Optional[str] = None
    faculty_id: Optional[str] = None
    semester: Optional[int] = None
    year: Optional[int] = None
    credits: int = 3


class SendNotificationRequest(BaseModel):
    title: str
    message: str
    target_role: Optional[str] = "all"
    target_user_id: Optional[str] = None


# ── Announcements ───────────────────────────────────────
class CreateAnnouncementRequest(BaseModel):
    title: str
    content: str
    course_id: Optional[str] = None


# ── Chatbot ─────────────────────────────────────────────
class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    suggestions: Optional[List[str]] = None
