import re
from typing import Tuple, List, Optional
from config import get_supabase_client


class ChatbotEngine:
    """Rule-based chatbot that answers student queries about attendance, deadlines, placements."""

    def __init__(self):
        self.greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]
        self.farewells = ["bye", "goodbye", "see you", "thanks", "thank you"]

    def get_response(self, message: str, user: dict) -> Tuple[str, Optional[List[str]]]:
        """Process a message and return a response with optional suggestions."""
        msg = message.lower().strip()

        # Greetings
        if any(g in msg for g in self.greetings):
            return (
                f"Hello {user.get('name', 'there')}! 👋 I'm your CampusConnect assistant. "
                "I can help you with attendance, assignments, marks, placements, and more. "
                "What would you like to know?",
                ["Show my attendance", "Upcoming deadlines", "Available jobs", "My marks"]
            )

        # Farewells
        if any(f in msg for f in self.farewells):
            return (
                f"Goodbye {user.get('name', '')}! Have a great day! 😊",
                None
            )

        # Attendance queries
        if any(w in msg for w in ["attendance", "present", "absent", "classes attended"]):
            return self._handle_attendance(user)

        # Assignment / deadline queries
        if any(w in msg for w in ["assignment", "deadline", "due date", "homework", "submit"]):
            return self._handle_assignments(user)

        # Marks / results queries
        if any(w in msg for w in ["marks", "result", "grade", "score", "cgpa", "performance"]):
            return self._handle_marks(user)

        # Placement queries
        if any(w in msg for w in ["job", "intern", "placement", "career", "company", "hiring", "opportunity"]):
            return self._handle_placements(user)

        # Timetable queries
        if any(w in msg for w in ["timetable", "schedule", "class time", "lecture"]):
            return self._handle_timetable(user)

        # Help / general
        if any(w in msg for w in ["help", "what can you do", "features", "capabilities"]):
            return (
                "I can help you with:\n"
                "📊 **Attendance** — Check your attendance percentage\n"
                "📝 **Assignments** — View upcoming deadlines\n"
                "📈 **Marks** — Check your exam results\n"
                "💼 **Placements** — Browse job opportunities\n"
                "📅 **Timetable** — View your class schedule\n\n"
                "Just ask me anything about these topics!",
                ["Show my attendance", "Upcoming deadlines", "Available jobs", "My timetable"]
            )

        # Default fallback
        return (
            "I'm not sure I understand that. I can help you with attendance, assignments, "
            "marks, placements, and timetable information. Could you rephrase your question?",
            ["Show my attendance", "Upcoming deadlines", "Available jobs", "Help"]
        )

    def _handle_attendance(self, user: dict) -> Tuple[str, Optional[List[str]]]:
        """Handle attendance-related queries."""
        try:
            supabase = get_supabase_client()
            student = supabase.table("students").select("id").eq(
                "user_id", user["id"]
            ).single().execute()

            if not student.data:
                return ("I couldn't find your student profile. Please contact admin.", None)

            total = supabase.table("attendance").select("id", count="exact").eq(
                "student_id", student.data["id"]
            ).execute()
            present = supabase.table("attendance").select("id", count="exact").eq(
                "student_id", student.data["id"]
            ).eq("status", "present").execute()

            total_count = total.count or 0
            present_count = present.count or 0

            if total_count == 0:
                return ("No attendance records found yet. Your classes may not have started.", None)

            pct = round((present_count / total_count) * 100, 1)
            emoji = "✅" if pct >= 75 else "⚠️"

            return (
                f"{emoji} Your overall attendance: **{pct}%** ({present_count}/{total_count} classes)\n"
                + ("Great job keeping up!" if pct >= 75 else "⚠️ Your attendance is below 75%. Please attend more classes!"),
                ["View detailed attendance", "My marks", "Upcoming deadlines"]
            )
        except Exception:
            return ("I'm having trouble fetching your attendance right now. Please try again later.", None)

    def _handle_assignments(self, user: dict) -> Tuple[str, Optional[List[str]]]:
        """Handle assignment/deadline queries."""
        try:
            supabase = get_supabase_client()
            student = supabase.table("students").select("id, semester, department_id").eq(
                "user_id", user["id"]
            ).single().execute()

            if not student.data:
                return ("I couldn't find your student profile.", None)

            courses = supabase.table("courses").select("id").eq(
                "department_id", student.data["department_id"]
            ).eq("semester", student.data["semester"]).execute()

            course_ids = [c["id"] for c in (courses.data or [])]
            if not course_ids:
                return ("No courses found for your semester.", None)

            assignments = supabase.table("assignments").select(
                "title, due_date, courses(name)"
            ).in_("course_id", course_ids).order("due_date").limit(5).execute()

            if not assignments.data:
                return ("No upcoming assignments found! 🎉", ["My attendance", "Available jobs"])

            lines = ["📝 **Upcoming Assignments:**\n"]
            for a in assignments.data:
                course_name = a.get("courses", {}).get("name", "Unknown")
                lines.append(f"• **{a['title']}** ({course_name}) — Due: {a['due_date'][:10]}")

            return ("\n".join(lines), ["My attendance", "My marks"])
        except Exception:
            return ("I'm having trouble fetching assignments right now. Please try again later.", None)

    def _handle_marks(self, user: dict) -> Tuple[str, Optional[List[str]]]:
        """Handle marks/results queries."""
        try:
            supabase = get_supabase_client()
            student = supabase.table("students").select("id, cgpa").eq(
                "user_id", user["id"]
            ).single().execute()

            if not student.data:
                return ("I couldn't find your student profile.", None)

            marks = supabase.table("marks").select(
                "marks_obtained, max_marks, exam_type, courses(name)"
            ).eq("student_id", student.data["id"]).execute()

            if not marks.data:
                return ("No marks have been entered yet.", ["My attendance", "Upcoming deadlines"])

            lines = ["📈 **Your Results:**\n"]
            for m in marks.data:
                course_name = m.get("courses", {}).get("name", "Unknown")
                pct = round((m["marks_obtained"] / m["max_marks"]) * 100, 1)
                lines.append(
                    f"• **{course_name}** ({m['exam_type']}): {m['marks_obtained']}/{m['max_marks']} ({pct}%)"
                )

            if student.data.get("cgpa"):
                lines.append(f"\n📊 Current CGPA: **{student.data['cgpa']}**")

            return ("\n".join(lines), ["My attendance", "Available jobs"])
        except Exception:
            return ("I'm having trouble fetching your marks right now.", None)

    def _handle_placements(self, user: dict) -> Tuple[str, Optional[List[str]]]:
        """Handle placement/job queries."""
        try:
            supabase = get_supabase_client()
            jobs = supabase.table("jobs").select("title, company, type, deadline, salary").eq(
                "status", "active"
            ).order("created_at", desc=True).limit(5).execute()

            if not jobs.data:
                return ("No active job/internship opportunities at the moment. Check back soon!", None)

            lines = ["💼 **Available Opportunities:**\n"]
            for j in jobs.data:
                jtype = "🏢 Job" if j["type"] == "job" else "📋 Internship"
                deadline = f" — Apply by {j['deadline'][:10]}" if j.get("deadline") else ""
                salary = f" | {j['salary']}" if j.get("salary") else ""
                lines.append(f"• {jtype}: **{j['title']}** at {j['company']}{salary}{deadline}")

            return ("\n".join(lines), ["Apply for a job", "My applications", "My marks"])
        except Exception:
            return ("I'm having trouble fetching job listings right now.", None)

    def _handle_timetable(self, user: dict) -> Tuple[str, Optional[List[str]]]:
        """Handle timetable queries."""
        return (
            "📅 You can view your full timetable on the **Student Dashboard**. "
            "It shows your weekly schedule with all courses, timings, and rooms.",
            ["My attendance", "Upcoming deadlines", "My marks"]
        )
