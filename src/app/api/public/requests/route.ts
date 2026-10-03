import { NextRequest, NextResponse } from 'next/server';
import { submitStudentRequest } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Server-side validation (Spec #95)
    const {
      full_name,
      register_number,
      department,
      year,
      section,
      email,
      college_email,
      mobile_number,
      interests,
      experience_level,
      existing_skills,
      motivation,
      custom_field_responses,
    } = body;

    const studentEmail = (email || college_email || '').trim().toLowerCase();

    if (!full_name || !register_number || !department || !year || !studentEmail || !mobile_number) {
      return NextResponse.json(
        { success: false, message: 'Please complete all required student details.' },
        { status: 400 }
      );
    }

    if (!studentEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please select at least one area of interest.' },
        { status: 400 }
      );
    }

    if (!motivation || motivation.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please provide a meaningful explanation of your motivation to join.' },
        { status: 400 }
      );
    }

    const result = submitStudentRequest({
      full_name: full_name.trim(),
      register_number: register_number.trim(),
      department: department.trim(),
      year: year.trim(),
      section: (section || '').trim(),
      email: studentEmail,
      college_email: studentEmail,
      mobile_number: mobile_number.trim(),
      interests,
      experience_level: experience_level || 'New to XR',
      existing_skills: (existing_skills || '').trim(),
      motivation: motivation.trim(),
      custom_field_responses: custom_field_responses || {},
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message, duplicate: result.duplicate },
        { status: result.duplicate ? 409 : 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: result.message },
      { status: 201 }
    );
  } catch (err) {
    console.error('API Error submitting student request:', err);
    return NextResponse.json(
      { success: false, message: 'We could not submit your request. Please verify the information and try again.' },
      { status: 500 }
    );
  }
}
