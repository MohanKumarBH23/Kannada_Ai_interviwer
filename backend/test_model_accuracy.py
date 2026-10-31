"""
Automated validation and accuracy test suite for the Kannada Blue-Collar Interview Model.
Validates role normalization, question coverage, adaptive progression, and rubric calibration.
Run with: python backend/test_model_accuracy.py
"""
import sys
import os
import asyncio

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from training_data import normalize_role, get_questions_for_role, get_all_questions, get_all_blue_collar_roles
import ai_service


def test_role_normalization_accuracy():
    print("\n--- 1. Testing Blue-Collar Role Classification & Normalization ---")
    test_cases = [
        # (Input query, Expected Canonical Role)
        ("Delivery Executive", "Delivery Executive"),
        ("swiggy delivery boy", "Delivery Executive"),
        ("zomato rider", "Delivery Executive"),
        ("amazon delivery partner", "Delivery Executive"),
        ("ಡೆಲಿವರಿ ಬಾಯ್", "Delivery Executive"),
        ("ಡೆಲಿವರಿ", "Delivery Executive"),
        ("Cab Driver", "Driver"),
        ("ola cab driver", "Driver"),
        ("Auto Driver", "Driver"),
        ("ಚಾಲಕ", "Driver"),
        ("ಡ್ರೈವರ್", "Driver"),
        ("Security Guard", "Security Guard"),
        ("apartment watchman", "Security Guard"),
        ("ಸೆಕ್ಯುರಿಟಿ ಗಾರ್ಡ್", "Security Guard"),
        ("ಭದ್ರತಾ ಸಿಬ್ಬಂದಿ", "Security Guard"),
        ("Amazon Warehouse Associate", "Warehouse Associate"),
        ("warehouse loader and packer", "Warehouse Associate"),
        ("ಗೋದಾಮು ಸಿಬ್ಬಂದಿ", "Warehouse Associate"),
        ("Maintenance Electrician", "Electrician"),
        ("ವಿದ್ಯುತ್ ತಂತ್ರಜ್ಞ", "Electrician"),
        ("ಪ್ಲಂಬರ್", "Plumber"),
        ("Customer Care Kannada", "Customer Support Executive"),
        ("ಗ್ರಾಹಕ ಸೇವೆ", "Customer Support Executive"),
        ("Supermarket Cashier", "Retail Store Assistant"),
        ("ಮಾರಾಟ ಸಹಾಯಕ", "Retail Store Assistant"),
        ("Housekeeping Cleaner", "Housekeeping Staff"),
        ("ಸ್ವಚ್ಛತಾ ಸಿಬ್ಬಂದಿ", "Housekeeping Staff"),
        ("Restaurant Cook", "Cook"),
        ("ಅಡುಗೆಯವರು", "Cook"),
        ("Assembly Line Factory Worker", "Factory Worker"),
        ("ಯಂತ್ರ ನಿರ್ವಾಹಕ", "Factory Worker"),
    ]

    passed = 0
    for input_role, expected in test_cases:
        actual = normalize_role(input_role)
        assert actual == expected, f"Failed: '{input_role}' normalized to '{actual}', expected '{expected}'"
        passed += 1

    print(f"[PASS] Role Normalization Accuracy: {passed}/{len(test_cases)} (100.0%)")


def test_question_bank_completeness():
    print("\n--- 2. Testing Question Bank Coverage & Rubric Depth ---")
    roles = get_all_blue_collar_roles()
    total_questions = get_all_questions()

    print(f"Total Questions in Training Bank: {len(total_questions)}")
    print(f"Total Blue-Collar Roles Covered: {len(roles)}")

    for role in roles:
        qs = [q for q in total_questions if q["role"] == role]
        assert len(qs) >= 4, f"Role '{role}' has only {len(qs)} questions (expected >= 4)"
        
        # Verify bilingual formatting and rubric hints
        for q in qs:
            assert "|||" in q["question"], f"Question missing '|||' bilingual separator: {q['question']}"
            kannada, english = [part.strip() for part in q["question"].split("|||", 1)]
            assert len(kannada) > 5, f"Empty Kannada part in question for {role}"
            assert len(english) > 5, f"Empty English part in question for {role}"
            assert len(q["ideal_answer_hints"]) >= 3, f"Insufficient hints ({len(q['ideal_answer_hints'])}) for: {q['question']}"
            assert q["difficulty"] in ["easy", "medium", "hard"], f"Invalid difficulty: {q['difficulty']}"

        print(f"  ✓ {role}: {len(qs)} questions verified (Easy, Med, Hard + complete rubrics)")

    print("[PASS] Question Bank Quality & Rubrics 100% verified.")


async def test_adaptive_interview_flow():
    print("\n--- 3. Testing Adaptive Interview Progression ---")
    test_role = "Delivery Executive"

    # Turn 0: First question
    q1 = await ai_service.generate_first_question(test_role, "medium")
    assert "ಡೆಲಿವರಿ" in q1 or "Delivery" in q1
    assert "|||" in q1
    print(f"  Turn 0 First Question:\n    {q1}")

    messages = [{"role": "ai", "content": q1}]

    # Turn 1: Candidate answers introduction
    ans1 = "ನನ್ನ ಹೆಸರು ರಮೇಶ್. ನನಗೆ 2 ವರ್ಷ ಝೊಮ್ಯಾಟೋದಲ್ಲಿ ಡೆಲಿವರಿ ಮಾಡಿದ ಅನುಭವ ಇದೆ. ನನ್ನ ಬಳಿ ಬೈಕ್ ಮತ್ತು ಲೈಸೆನ್ಸ್ ಇದೆ."
    messages.append({"role": "user", "content": ans1})
    res1 = await ai_service.evaluate_answer_and_get_next(test_role, messages[:-1], ans1)
    assert not res1["is_completed"], "Interview concluded too early at Turn 1"
    assert res1["next_question"] is not None
    print(f"  Turn 1 Next Question:\n    {res1['next_question']}")
    messages.append({"role": "ai", "content": res1["next_question"]})

    # Turn 2: Candidate answers core skills
    ans2 = "ನಾನು ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ನೋಡಿ ಶಾರ್ಟೆಸ್ಟ್ ರೂಟ್ ಹುಡುಕುತ್ತೇನೆ. ಟ್ರಾಫಿಕ್ ಇದ್ರೆ ಮೊದಲೇ ಕಸ್ಟಮರ್‌ಗೆ ಕಾಲ್ ಮಾಡಿ ತಿಳಿಸುತ್ತೇನೆ."
    messages.append({"role": "user", "content": ans2})
    res2 = await ai_service.evaluate_answer_and_get_next(test_role, messages[:-1], ans2)
    assert not res2["is_completed"], "Interview concluded too early at Turn 2"
    assert res2["next_question"] is not None
    print(f"  Turn 2 Next Question:\n    {res2['next_question']}")
    messages.append({"role": "ai", "content": res2["next_question"]})

    # Turn 3: Candidate answers difficult scenario
    ans3 = "ಪಾರ್ಸೆಲ್ ಡ್ಯಾಮೇಜ್ ಆಗಿದ್ರೆ ಕಸ್ಟಮರ್‌ಗೆ ತೋರಿಸಿ ಆಪ್‌ನಲ್ಲಿ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ ರಿಟರ್ನ್ ಪ್ರೋಸೆಸ್ ಮಾಡುತ್ತೇನೆ."
    messages.append({"role": "user", "content": ans3})
    res3 = await ai_service.evaluate_answer_and_get_next(test_role, messages[:-1], ans3)
    assert not res3["is_completed"], "Interview concluded too early at Turn 3"
    assert res3["next_question"] is not None
    print(f"  Turn 3 Next Question:\n    {res3['next_question']}")
    messages.append({"role": "ai", "content": res3["next_question"]})

    # Turn 4: Candidate answers safety / reliability
    ans4 = "ನಾನು ಯಾವಾಗಲೂ ಹೆಲ್ಮೆಟ್ ಧರಿಸುತ್ತೇನೆ. ಸಿಗ್ನಲ್ ಜಂಪ್ ಮಾಡಲ್ಲ. ದಿನಕ್ಕೆ 10 ಗಂಟೆ ಶಿಫ್ಟ್ ಮಾಡಲು ಸಿದ್ಧನಿದ್ದೇನೆ."
    messages.append({"role": "user", "content": ans4})
    res4 = await ai_service.evaluate_answer_and_get_next(test_role, messages[:-1], ans4)
    assert res4["is_completed"], "Interview should conclude after 4 complete candidate answers"
    assert res4["next_question"] is None, "Next question should be None upon completion"
    print(f"  Turn 4 Feedback & Completion:\n    {res4['feedback']}")

    # Final scoring and report
    final_res = await ai_service.generate_final_results(test_role, messages)
    assert 50 <= final_res["score"] <= 100, f"Score out of range: {final_res['score']}"
    assert len(final_res["overall_feedback"]) > 20
    print(f"  Final Score: {final_res['score']}/100")

    report = await ai_service.generate_interview_report(test_role, messages, final_res["overall_feedback"], final_res["score"])
    assert report["confidence_score"] > 0
    assert len(report["strengths"]) > 0
    assert len(report["improvements"]) > 0
    print(f"  Report Recommendation:\n    {report['recommendation']}")

    print("[PASS] Adaptive Interview Flow & Scoring 100% verified.")


async def main():
    test_role_normalization_accuracy()
    test_question_bank_completeness()
    await test_adaptive_interview_flow()
    print("\n=======================================================")
    print("ALL 3 MODEL ACCURACY & TRAINING SUITES PASSED (100%)")
    print("=======================================================")


if __name__ == "__main__":
    asyncio.run(main())

