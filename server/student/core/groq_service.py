from groq import Groq
from config.settings import settings
import re
import logging

logger = logging.getLogger(__name__)

class GroqService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        # Use the model defined in settings (e.g., llama-3.3-70b-versatile)
        self.model = settings.GROQ_MODEL_NAME

    def generate_interview_questions(self, resume_text: str) -> list:
        """Generate interview questions based on resume text."""
        prompt = f"""
You are an AI interviewer conducting an interview for a candidate.

The candidate's details:
- Resume Content: {resume_text}
- Job Role: Software Engineer
- Company: Mock Interview Inc.
- Industry: Technology

Based on this information, generate exactly:
🔹 **3 Technical Questions** specific to the job role and skills.
🔹 **3 HR Questions** to assess cultural fit and behavioral aspects.
🔹 **2 Situational/Scenario-Based Questions** to evaluate problem-solving.
🔹 **1 Surprise Question** (creative or unexpected to test adaptability).

Format each section with the following headings and numbered questions:
- **Technical:**
  1. [Your question here]
  2. [Your question here]
  3. [Your question here]
- **HR:**
  1. [Your question here]
  2. [Your question here]
  3. [Your question here]
- **Situational:**
  1. [Your question here]
  2. [Your question here]
- **Surprise:**
  1. [Your question here]

Ensure each question starts with a number, followed by a period and a space (e.g., "1. "), and do not include any additional text outside of the specified format.
"""
        try:
            completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant that generates interview questions based on resumes."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                max_tokens=1024
            )
            response_text = completion.choices[0].message.content

            # Parse the response to extract questions
            lines = response_text.split("\n")
            questions = []
            current_category = None

            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Check for category headers
                if "**Technical:**" in line:
                    current_category = "technical"
                    continue
                elif "**HR:**" in line:
                    current_category = "hr"
                    continue
                elif "**Situational:**" in line:
                    current_category = "situational"
                    continue
                elif "**Surprise:**" in line:
                    current_category = "surprise"
                    continue
                
                # Parse numbered questions
                # Matches "1. Question..." or "1 Question..."
                if current_category and (re.match(r"^\d+\.", line) or re.match(r"^\d+\s", line)):
                    # Remove the number and leading whitespace
                    cleaned_line = re.sub(r"^\d+\.?\s*", "", line).strip()
                    if cleaned_line:
                        questions.append({"text": cleaned_line, "category": current_category})

            if not questions:
                logger.warning("No questions parsed from AI response. Returning defaults.")
                # Fallback questions if parsing fails completely
                return [
                    {"text": "Tell me about yourself.", "category": "hr"},
                    {"text": "Describe a challenging project you worked on.", "category": "technical"},
                    {"text": "Why do you want to work here?", "category": "hr"}
                ]

            return questions

        except Exception as e:
            logger.error(f"Error generating questions: {str(e)}")
            # Return safe fallback so the app doesn't crash
            return [
                {"text": "Could not generate specific questions. Please tell us about your experience.", "category": "general"}
            ]

    def evaluate_answer(self, question_text: str, answer_text: str) -> dict:
        """Evaluate a candidate's answer using Groq API and return a score and feedback."""
        prompt = f"""
You are an AI interviewer evaluating a candidate's answer for a Software Engineer role.

Question:
{question_text}

Candidate's Answer:
{answer_text}

Evaluate this candidate answer based on communication, clarity, and depth. Provide:
- A score from 1 to 10 (integer).
- Feedback (2-3 sentences explaining the score).

Format your response as:
Score: [number]
Feedback: [your feedback]
"""
        try:
            completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant that evaluates interview answers."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                max_tokens=256
            )
            response_text = completion.choices[0].message.content.strip()

            # Parse the response using regex to be robust against extra text
            score_match = re.search(r"Score:\s*(\d+)", response_text, re.IGNORECASE)
            feedback_match = re.search(r"Feedback:\s*(.+)", response_text, re.IGNORECASE | re.DOTALL)

            if not score_match or not feedback_match:
                # Attempt fallback parsing if strict format fails
                logger.warning(f"Strict parsing failed for response: {response_text[:50]}...")
                return {
                    "score": 5, 
                    "feedback": "Could not parse specific feedback, but answer was recorded."
                }

            score = int(score_match.group(1))
            feedback = feedback_match.group(1).strip()

            # Normalize score
            score = max(1, min(10, score))

            return {"score": score, "feedback": feedback}
            
        except Exception as e:
            logger.error(f"Error evaluating answer: {str(e)}")
            return {
                "score": 0, 
                "feedback": "An error occurred while evaluating the answer."
            }